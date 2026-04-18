import { Calendar, Clock, Search, Filter, Volume2, FileDown, AlignLeft, ChevronLeft, ChevronRight, Play, CheckCircle2, User, MessageSquare, Timer } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExportDropdown } from "@/components/common/ExportDropdown";

interface AppointmentSectionProps {
    appointments: any[];
    search: string;
    onSearchChange: (val: string) => void;
    statusFilter: string;
    onFilterChange: (val: string) => void;
    showFilter: boolean;
    onStart: (id: number) => void;
    onComplete: (id: number) => void;
    onOpenChat: (apt: any) => void;
    onOpenRecording?: (apt: any) => void;
    onExport?: (title: string, columns: string[], data: any[]) => void;
    onDownloadInvoice?: (id: number) => void;
}

export const AppointmentSection = ({
    appointments,
    search,
    onSearchChange,
    statusFilter,
    onFilterChange,
    showFilter,
    onStart,
    onComplete,
    onOpenChat,
    onOpenRecording,
    onExport,
    onDownloadInvoice
}: AppointmentSectionProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

    // Split active vs queued
    const activeSession = useMemo(() => appointments.find(a => a.status === "IN_PROGRESS"), [appointments]);
    const sortedAppointments = useMemo(() => 
        [...appointments].sort((a, b) => {
            // IN_PROGRESS first, then WAITING, then BOOKED by time
            const order: Record<string, number> = { IN_PROGRESS: 0, WAITING: 1, BOOKED: 2, PENDING: 3 };
            const aOrder = order[a.status] ?? 4;
            const bOrder = order[b.status] ?? 4;
            if (aOrder !== bOrder) return aOrder - bOrder;
            return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
        }),
        [appointments]
    );

    const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
    const paginatedAppointments = sortedAppointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, sortedAppointments.length);

    const statusConfig: Record<string, { bg: string; dot: string; label: string }> = {
        BOOKED: { bg: "bg-blue-50 text-blue-600 border-blue-100", dot: "bg-blue-500", label: "Booked" },
        PENDING: { bg: "bg-amber-50 text-amber-600 border-amber-100", dot: "bg-amber-500 animate-pulse", label: "Pending" },
        IN_PROGRESS: { bg: "bg-violet-50 text-violet-600 border-violet-100", dot: "bg-violet-500 animate-pulse", label: "In Progress" },
        WAITING: { bg: "bg-cyan-50 text-cyan-600 border-cyan-100", dot: "bg-cyan-500", label: "Waiting" },
        COMPLETED: { bg: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-500", label: "Completed" },
        CANCELLED: { bg: "bg-slate-50 text-slate-400 border-slate-100", dot: "bg-slate-400", label: "Cancelled" },
        MISSED: { bg: "bg-red-50 text-red-600 border-red-100", dot: "bg-red-500", label: "Missed" },
    };

    const getTimeUntil = (dateTime: string) => {
        const diff = new Date(dateTime).getTime() - Date.now();
        if (diff <= 0) return null;
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        return `${hrs}h ${mins % 60}m`;
    };

    return (
        <div className="space-y-4">
            {/* Active Session Banner */}
            <AnimatePresence>
                {activeSession && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl p-4 text-white shadow-lg shadow-violet-200 overflow-hidden"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center">
                                    <User size={18} className="text-white/80" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-violet-200">Active Consultation</p>
                                    <p className="font-bold text-base tracking-tight">
                                        {activeSession.patient?.firstName} {activeSession.patient?.lastName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/15 rounded-lg">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                    <Timer size={12} className="text-white/70" />
                                </div>
                                <button 
                                    onClick={() => onComplete(activeSession.id)}
                                    className="px-4 py-2 bg-white text-violet-700 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
                                >
                                    End Session
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search & Filters Bar */}
            <div className="bg-white/80 backdrop-blur-xl p-2.5 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-2.5 items-center">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input
                        type="text"
                        placeholder="Search patient or appointment..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50/80 border border-slate-100 rounded-lg text-xs focus:ring-2 focus:ring-rose-500/10 focus:bg-white focus:border-rose-200 transition-all font-semibold text-slate-700 outline-none"
                    />
                </div>
                {showFilter && (
                    <div className="relative group">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={12} />
                        <select
                            value={statusFilter}
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="pl-8 pr-7 py-2 bg-slate-50/80 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-700 focus:ring-2 focus:ring-rose-500/10 focus:border-rose-200 outline-none cursor-pointer appearance-none transition-all uppercase tracking-wider"
                        >
                            <option value="ALL">All Status</option>
                            <option value="UPCOMING">Upcoming</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                )}
                {onExport && (
                    <ExportDropdown
                        onExportAll={() => onExport(
                            "Appointments Data", 
                            ["ID", "Patient", "Date", "Status"], 
                            appointments.map(a => ({
                                id: a.appointmentNumber,
                                patient: `${a.patient?.firstName} ${a.patient?.lastName}`,
                                date: new Date(a.dateTime).toLocaleDateString(),
                                status: a.status
                            }))
                        )}
                        onExportPage={() => onExport(
                            "Appointments (Page)", 
                            ["ID", "Patient", "Date", "Status"], 
                            paginatedAppointments.map(a => ({
                                id: a.appointmentNumber,
                                patient: `${a.patient?.firstName} ${a.patient?.lastName}`,
                                date: new Date(a.dateTime).toLocaleDateString(),
                                status: a.status
                            }))
                        )}
                    />
                )}
            </div>

            {/* Appointment Cards / Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="divide-y divide-slate-50">
                    {paginatedAppointments.length === 0 ? (
                        <div className="py-16 text-center">
                            <Calendar size={32} className="text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No appointments found</p>
                        </div>
                    ) : paginatedAppointments.map((apt, idx) => {
                        const sc = statusConfig[apt.status] || statusConfig.BOOKED;
                        const isActive = apt.status === "IN_PROGRESS";
                        const isActionable = apt.status === "BOOKED" || apt.status === "PENDING" || apt.status === "WAITING";
                        const timeUntil = getTimeUntil(apt.dateTime);

                        return (
                            <motion.div
                                key={apt.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                className={`flex items-center gap-4 px-4 py-3 hover:bg-slate-50/60 transition-all group ${
                                    isActive ? 'bg-violet-50/30 border-l-2 border-l-violet-500' : ''
                                }`}
                            >
                                {/* Queue Number */}
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[9px] shrink-0 ${
                                    isActive ? 'bg-violet-100 text-violet-600 border border-violet-200' :
                                    apt.status === "WAITING" ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' :
                                    'bg-rose-50 text-rose-500 border border-rose-100/50'
                                }`}>
                                    {(currentPage - 1) * itemsPerPage + idx + 1}
                                </div>

                                {/* Patient Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-900 text-[11px] truncate">
                                            {apt.patient?.firstName} {apt.patient?.lastName}
                                        </p>
                                        {isActive && (
                                            <span className="px-1.5 py-0.5 bg-violet-100 text-violet-600 text-[6px] font-black uppercase tracking-widest rounded">Live</span>
                                        )}
                                        {apt.status === "WAITING" && (
                                            <span className="px-1.5 py-0.5 bg-cyan-100 text-cyan-600 text-[6px] font-black uppercase tracking-widest rounded">Arrived</span>
                                        )}
                                    </div>
                                    <p className="text-[7px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{apt.appointmentNumber}</p>
                                </div>

                                {/* Schedule */}
                                <div className="text-right shrink-0 w-20">
                                    <div className="flex items-center justify-end gap-1 text-slate-700 font-bold text-[10px]">
                                        <Clock size={9} className="text-rose-400" />
                                        {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <p className="text-[7px] font-bold text-slate-400 mt-0.5">
                                        {new Date(apt.dateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                    {timeUntil && isActionable && (
                                        <p className="text-[6px] font-black text-amber-500 uppercase tracking-wider">in {timeUntil}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="shrink-0">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-wider border ${sc.bg}`}>
                                        <span className={`w-1 h-1 rounded-full ${sc.dot}`} />
                                        {sc.label}
                                    </span>
                                </div>

                                {/* Actions — always visible for actionable items */}
                                <div className={`flex items-center gap-1 shrink-0 ${
                                    isActive || isActionable ? '' : 'opacity-0 group-hover:opacity-100'
                                } transition-all`}>
                                    {apt.status === "COMPLETED" && (
                                        <>
                                            {apt.audioRecordingUrl && onOpenRecording && (
                                                <button
                                                    onClick={() => onOpenRecording(apt)}
                                                    className="p-1.5 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-all border border-violet-100"
                                                    title="Listen to Recording"
                                                >
                                                    <Volume2 size={11} />
                                                </button>
                                            )}
                                            {onDownloadInvoice && (
                                                <button
                                                    onClick={() => onDownloadInvoice(apt.id)}
                                                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all border border-blue-100"
                                                    title="Download Invoice"
                                                >
                                                    <AlignLeft size={11} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onOpenChat(apt)}
                                                className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all border border-indigo-100"
                                                title="Open Chat"
                                            >
                                                <MessageSquare size={11} />
                                            </button>
                                        </>
                                    )}
                                    {isActive && (
                                        <button 
                                            onClick={() => onComplete(apt.id)} 
                                            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-rose-500 transition-all shadow-sm active:scale-95 flex items-center gap-1"
                                        >
                                            <CheckCircle2 size={10} />
                                            End
                                        </button>
                                    )}
                                    {isActionable && (
                                        <button 
                                            onClick={() => onStart(apt.id)} 
                                            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-rose-600 transition-all shadow-sm active:scale-95 flex items-center gap-1"
                                        >
                                            <Play size={10} />
                                            Start
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50/80 border-t border-slate-100">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <span className="text-slate-600">{startItem}–{endItem}</span>
                            <span>of</span>
                            <span className="text-slate-600">{sortedAppointments.length}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-25 transition-all"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                if (totalPages > 7 && page > 1 && page < totalPages && Math.abs(page - currentPage) > 2) {
                                    if (page === 2 || page === totalPages - 1) {
                                        return <span key={page} className="w-7 h-7 flex items-center justify-center text-slate-300 text-[10px]">···</span>;
                                    }
                                    return null;
                                }
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${
                                            currentPage === page
                                                ? "bg-slate-900 text-white shadow-sm"
                                                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-25 transition-all"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {totalPages <= 1 && sortedAppointments.length > 0 && (
                    <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <div>{sortedAppointments.length} entries</div>
                        <div className="text-slate-300 tracking-[0.2em]">HealthPoint</div>
                    </div>
                )}
            </div>
        </div>
    );
};
