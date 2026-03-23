import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MessageSquare, Clock, User as UserIcon, ArrowRight, Home, Calendar, Archive, Search } from "lucide-react";
import { apiClient } from "@/apis/apis";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

type FilterType = "ACTIVE" | "ARCHIVED";

export function MyChats() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>("ACTIVE");

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get("/api/appointments/user");
            // We want both BOOKED (upcoming) and COMPLETED (history)
            const chatEligible = res.data.filter((a: any) => 
                a.status === "BOOKED" || a.status === "COMPLETED"
            );
            setAppointments(chatEligible);
        } catch {
            toast.error("Failed to fetch clinical conversations");
        } finally {
            setIsLoading(false);
        }
    };

    const isChatActive = (apt: any) => {
        if (apt.status === "BOOKED") return true;
        if (apt.status === "COMPLETED" && apt.completedAt) {
            const completed = new Date(apt.completedAt).getTime();
            const now = new Date().getTime();
            return (now - completed) < 24 * 60 * 60 * 1000;
        }
        return false;
    };

    const filteredChats = appointments.filter(apt => {
        const active = isChatActive(apt);
        return filter === "ACTIVE" ? active : !active;
    });

    const getTimeStatus = (apt: any) => {
        if (apt.status === "BOOKED") return { label: "Session Pending", color: "text-amber-600 bg-amber-50 border-amber-100" };
        
        const completed = new Date(apt.completedAt).getTime();
        const now = new Date().getTime();
        const diffMs = (completed + 24 * 60 * 60 * 1000) - now;
        
        if (diffMs <= 0) return { label: "Archived History", color: "text-slate-400 bg-slate-50 border-slate-100" };
        
        const h = Math.floor(diffMs / (1000 * 60 * 60));
        const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return { label: `${h}h ${m}m active`, color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    };

    return (
        <div className="min-h-screen bg-slate-50/50 py-10 px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate("/dashboard")}
                                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:shadow-lg transition-all border border-slate-100"
                            >
                                <Home size={18} />
                            </button>
                            <div className="h-4 w-px bg-slate-200 mx-1" />
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                                <MessageSquare size={12} className="text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Secure Consultation Hub</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Conversations</h1>
                            <p className="text-slate-400 text-sm font-bold mt-2 max-w-md">Access your post-session follow-ups and upcoming consultation chat windows.</p>
                        </div>
                    </div>

                    <div className="flex p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        {(["ACTIVE", "ARCHIVED"] as FilterType[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filter === f 
                                        ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sub-header Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Active Channels", val: appointments.filter(isChatActive).length, icon: MessageSquare, color: "text-emerald-500" },
                        { label: "Archived Logs", val: appointments.filter(a => !isChatActive(a)).length, icon: Archive, color: "text-slate-400" },
                        { label: "Upcoming Chats", val: appointments.filter(a => a.status === "BOOKED").length, icon: Calendar, color: "text-amber-500" },
                        { label: "Total History", val: appointments.length, icon: Search, color: "text-blue-500" },
                    ].map(s => (
                        <div key={s.label} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center ${s.color}`}>
                                <s.icon size={18} />
                            </div>
                            <div>
                                <p className="text-lg font-black text-slate-900 leading-none">{s.val}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="space-y-4 min-h-[400px]">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 rounded-[2.5rem] bg-white animate-pulse border border-slate-100" />
                            ))}
                        </div>
                    ) : filteredChats.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[3rem] border border-slate-100 p-20 text-center shadow-2xl shadow-slate-200/50"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MessageSquare size={40} className="text-slate-200" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">No {filter.toLowerCase()} conversations</h3>
                            <p className="text-sm text-slate-400 mt-2 font-bold max-w-xs mx-auto leading-relaxed">
                                {filter === "ACTIVE" 
                                    ? "Channels open after booking or within 24 hours of session completion."
                                    : "Older conversations are archived here for your medical record reference."}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            <AnimatePresence mode="popLayout">
                                {filteredChats.map((apt, idx) => {
                                    const doctor = apt.doctor?.user || apt.doctor;
                                    const status = getTimeStatus(apt);
                                    
                                    return (
                                        <motion.div
                                            key={apt.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => navigate(`/chat/appointment/${apt.id}`)}
                                            className="group bg-white rounded-[2.5rem] border border-slate-100 p-6 flex flex-col md:flex-row md:items-center gap-6 transition-all hover:shadow-2xl hover:shadow-slate-200 hover:border-blue-100 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-6 flex-1">
                                                <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white font-black text-2xl overflow-hidden shadow-lg group-hover:bg-blue-600 transition-colors shrink-0">
                                                    {doctor?.profilePicture ? (
                                                        <img src={doctor.profilePicture} className="w-full h-full object-cover" />
                                                    ) : (
                                                        (doctor?.firstName || "D")[0]
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="font-black text-slate-900 text-lg tracking-tight truncate">Dr. {doctor?.firstName} {doctor?.lastName}</h3>
                                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-current opacity-70 ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-2">{apt.doctor?.speciality}</p>
                                                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-bold">
                                                        <span className="flex items-center gap-2"><Calendar size={13} /> {new Date(apt.dateTime).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-2"># {apt.appointmentNumber}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0">
                                                <div className="md:text-right hidden sm:block">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Last Session</p>
                                                    <p className="text-xs font-bold text-slate-600 mt-1">{new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                                    <ArrowRight size={20} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Footer Tip */}
                <div className="mt-12 p-6 bg-slate-900 rounded-[2.5rem] flex items-center gap-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white/40 shrink-0">
                        <Clock size={20} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-white text-xs font-bold tracking-tight">Active communication window.</p>
                        <p className="text-slate-400 text-[10px] font-medium leading-relaxed">Direct messaging is enabled for 24 hours after your session completions for follow-up questions.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
