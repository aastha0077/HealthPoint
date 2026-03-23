import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiClient } from "@/apis/apis";
import { useAuth } from "./AuthProvider";

interface Notification {
    id: number;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    fetchNotifications: () => void;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const auth = useAuth();

    const fetchNotifications = async () => {
        if (!auth?.isAuthenticated) return;
        try {
            const res = await apiClient.get('/api/notifications');
            setNotifications(res.data);
        } catch (e) {
            console.error("Failed to fetch notifications");
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await apiClient.put(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (e) {
            console.error(e);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiClient.put(`/api/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // In a real app we might connect to socket.io to get live notifications
        // const interval = setInterval(fetchNotifications, 60000); // 1 min poll
        // return () => clearInterval(interval);
    }, [auth?.isAuthenticated]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within NotificationProvider");
    return context;
};
