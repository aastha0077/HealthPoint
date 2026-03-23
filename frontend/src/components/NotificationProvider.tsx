import { useEffect, useRef, useState, createContext, useContext, type ReactNode } from "react";
import { useNavigate } from "react-router";
import io, { Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthProvider";
import { apiClient } from "@/apis/apis";
import toast from "react-hot-toast";

const SOCKET_URL = "http://localhost:8000";

export interface DBNotification {
    id: string;
    type: "MESSAGE" | "BOOKED" | "CANCELLED" | "RESCHEDULE" | "COMPLETED" | "SYSTEM";
    title: string;
    content: string;
    timestamp: number;
    read: boolean;
    appointmentId?: number;
}

interface NotificationContextType {
    notifications: DBNotification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const auth = useAuth();
    const navigate = useNavigate();
    const socketRef = useRef<Socket | null>(null);
    const [notifications, setNotifications] = useState<DBNotification[]>([]);
    const user = auth?.user;

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await apiClient.get("/api/notifications");
            const mapped = res.data.map((n: any) => {
                let title = "Notification";
                if (n.type === "BOOKED") title = "New Appointment";
                else if (n.type === "CANCELLED") title = "Appointment Cancelled";
                else if (n.type === "RESCHEDULE") title = "Time Rescheduled";
                else if (n.type === "COMPLETED") title = "Session Completed";
                else if (n.type === "MESSAGE") title = auth.role === "USER" ? "Doctor Message" : "Patient Message";

                return {
                    ...n,
                    id: n.id.toString(),
                    title: title,
                    content: n.message,
                    read: n.isRead,
                    timestamp: new Date(n.createdAt || n.timestamp).getTime()
                };
            });
            setNotifications(mapped);
        } catch (err) {
            console.error("Failed to fetch notification history", err);
        }
    };

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }
        fetchNotifications();
    }, [user?.id, auth?.role]);

    useEffect(() => {
        if (!user) return;

        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL);
        }

        const socket = socketRef.current;
        socket.emit("register", user.id);

        const handleNewMessage = (msg: any) => {
            if (msg.senderId === user.id) return;

            const senderName = msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : "Someone";
            const snippet = msg.content.length > 50 ? msg.content.substring(0, 50) + "..." : msg.content;
            const notificationTitle = auth.role === "USER" ? "Doctor Message" : "Patient Message";
            const notificationId = Date.now().toString();

            const newNotif: DBNotification = {
                id: notificationId,
                type: "MESSAGE",
                title: notificationTitle,
                content: `${senderName}: ${snippet}`,
                timestamp: Date.now(),
                read: false,
                appointmentId: msg.appointmentId
            };

            setNotifications(prev => [newNotif, ...prev].slice(0, 50));

            // Don't show toast if we are already in the chat room for this appointment
            const currentPath = window.location.pathname;
            const dest = msg.appointmentId ? `/chat/appointment/${msg.appointmentId}` : `/chat/${msg.senderId}`;
            if (currentPath === dest) return;

            toast(
                (t) => (
                    <div className="flex flex-col gap-3 min-w-[300px]">
                        <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => {
                                markAsRead(notificationId);
                                toast.dismiss(t.id);
                                const dest = msg.appointmentId ? `/chat/appointment/${msg.appointmentId}` : `/chat/${msg.senderId}`;
                                navigate(dest);
                            }}
                        >
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-blue-600 text-lg">💬</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-800">{notificationTitle}</p>
                                <p className="text-xs text-slate-500 line-clamp-2">{senderName}: {msg.content}</p>
                            </div>
                        </div>
                        <div className="flex border-t border-slate-100 pt-2 gap-2">
                            <button
                                onClick={() => { markAsRead(notificationId); toast.dismiss(t.id); }}
                                className="flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Mark Read
                            </button>
                            <button
                                onClick={() => {
                                    markAsRead(notificationId);
                                    toast.dismiss(t.id);
                                    const dest = msg.appointmentId ? `/chat/appointment/${msg.appointmentId}` : `/chat/${msg.senderId}`;
                                    navigate(dest);
                                }}
                                className="flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                View Chat
                            </button>
                        </div>
                    </div>
                ),
                { duration: 6000 }
            );
        };

        socket.on("newMessage", handleNewMessage);
        return () => { socket.off("newMessage", handleNewMessage); };
    }, [user, navigate, auth?.role]);

    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            if (id.length < 12) {
                await apiClient.put(`/api/notifications/${id}/read`);
            }
        } catch (err) {
            console.warn("Failed to mark read on backend", err);
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        try {
            await apiClient.put("/api/notifications/read-all");
        } catch (err) {
            console.warn("Failed to mark all read", err);
        }
    };

    const clearAll = () => setNotifications([]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
    return context;
}
