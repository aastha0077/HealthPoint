import { useState, useRef, useEffect } from "react";
import { Bell, MessageSquare, Trash2, MailOpen, Calendar, XCircle, Clock, CheckCircle2, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, type DBNotification } from "./NotificationProvider";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthProvider";

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
    const bellRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const auth = useAuth();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = (n: DBNotification) => {
        markAsRead(n.id);
        setIsOpen(false);
        if (n.appointmentId) {
            if (auth?.user?.role === 'DOCTOR') {
                navigate(`/doctor-panel?chat=${n.appointmentId}`);
            } else {
                navigate(`/chat/appointment/${n.appointmentId}`);
            }
        }
    };

    return (
        <div className="relative" ref={bellRef}>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all"
            >
                <Bell size={20} className={unreadCount > 0 ? "animate-pulse text-rose-500" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg shadow-rose-500/20">
                        {unreadCount}
                    </span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-[380px] bg-white rounded-[2rem] shadow-2xl border border-slate-50 z-[200] overflow-hidden"
                    >
                        <div className="p-6 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h4 className="text-lg font-black text-slate-900 tracking-tight">Activity Center</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{unreadCount} UNREAD UPDATES</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={markAllAsRead}
                                    className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-emerald-500 transition-colors"
                                    title="Mark all as read"
                                >
                                    <MailOpen size={16} />
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                                    title="Clear all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                        <Bell size={32} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400">No recent notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {notifications.map((n) => {
                                        const typeStyles: Record<string, any> = {
                                            MESSAGE: { bg: "bg-blue-50 text-blue-500", icon: MessageSquare },
                                            BOOKED: { bg: "bg-blue-600 text-white shadow-lg shadow-blue-200", icon: Calendar },
                                            CANCELLED: { bg: "bg-rose-500 text-white shadow-lg shadow-rose-200", icon: XCircle },
                                            RESCHEDULE: { bg: "bg-amber-100 text-amber-600", icon: Clock },
                                            COMPLETED: { bg: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
                                            ADMIN_ALERT: { bg: "bg-rose-50 text-rose-600 border border-rose-100", icon: Bell },
                                            REFUND: { bg: "bg-amber-600 text-white shadow-lg shadow-amber-200", icon: CreditCard },
                                            DEFAULT: { bg: "bg-slate-50 text-slate-500", icon: Bell }
                                        };
                                        const style = typeStyles[n.type] || typeStyles.DEFAULT;
                                        const Icon = style.icon;

                                        return (
                                            <div
                                                key={n.id}
                                                onClick={() => handleNotificationClick(n)}
                                                className={`group p-4 flex gap-4 cursor-pointer transition-all duration-300 ${!n.read ? "bg-rose-50/20 border-l-[3px] border-l-rose-500" : "hover:bg-slate-50 border-l-[3px] border-l-transparent"}`}
                                            >
                                                <div className="shrink-0 pt-0.5">
                                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${style.bg}`}>
                                                        <Icon size={18} />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start gap-3 mb-1">
                                                        <h5 className={`text-[13px] tracking-tight leading-snug break-words ${!n.read ? "font-black text-slate-900" : "font-bold text-slate-600"}`}>
                                                            {n.title}
                                                        </h5>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase whitespace-nowrap pt-1">
                                                            {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed line-clamp-2 pr-2">{n.content}</p>
                                                    {/* Status indicator removed per user request */}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                                <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest leading-none pt-1">Persistent History enabled</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
