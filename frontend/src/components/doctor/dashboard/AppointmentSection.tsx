import { Calendar, Clock, Search, Filter, Volume2, FileDown, AlignLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

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
    onExport?: () => void;
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

    // Reset page on search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const totalPages = Math.ceil(appointments.length / itemsPerPage);
    const paginatedAppointments = appointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, appointments.length);

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            BOOKED: "bg-blue-50 text-blue-600 border-blue-100",
            PENDING: "bg-amber-50 text-amber-600 border-amber-100",
            IN_PROGRESS: "bg-violet-50 text-violet-600 border-violet-100",
            COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
            CANCELLED: "bg-slate-50 text-slate-400 border-slate-100",
            MISSED: "bg-red-50 text-red-600 border-red-100",
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${map[status] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'BOOKED' ? 'bg-blue-500' :
                        status === 'IN_PROGRESS' ? 'bg-violet-500 animate-pulse' :
                            status === 'COMPLETED' ? 'bg-emerald-500' :
                                status === 'CANCELLED' ? 'bg-slate-400' :
                                    status === 'MISSED' ? 'bg-red-500' :
                                        'bg-amber-500'
                    }`} />
                {status.replace('_', ' ')}
            </span>
        );
    };

    const paymentBadge = (apt: any) => {
        const status = apt.payment?.status || 'N/A';
        const method = apt.payment?.method || 'CASH';
        const colors: Record<string, string> = {
            COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
            PENDING: "bg-amber-50 text-amber-600 border-amber-100",
            FAILED: "bg-red-50 text-red-500 border-red-100",
            REFUNDED: "bg-violet-50 text-violet-600 border-violet-100",
            REFUND_REQUESTED: "bg-orange-50 text-orange-500 border-orange-100",
        };
        return (
            <div className="flex flex-col gap-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${colors[status] || "bg-slate-50 text-slate-500 border-slate-100"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'COMPLETED' ? 'bg-emerald-500' :
                            status === 'PENDING' ? 'bg-amber-500 animate-pulse' :
                                status === 'REFUNDED' ? 'bg-violet-500' :
                                    'bg-slate-400'
                        }`} />
                    {status === 'REFUND_REQUESTED' ? 'REFUND REQ' : status}
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider pl-1">{method}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Search & Filters Bar */}
            <div className="bg-white/80 backdrop-blur-xl p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or number..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/10 focus:bg-white focus:border-rose-200 transition-all font-bold text-slate-700 outline-none"
                    />
                </div>
                {showFilter && (
                    <div className="relative group">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={14} />
                        <select
                            value={statusFilter}
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="pl-9 pr-8 py-3 bg-slate-50/80 border border-slate-100 rounded-xl text-xs font-black text-slate-700 focus:ring-2 focus:ring-rose-500/10 focus:border-rose-200 outline-none cursor-pointer appearance-none transition-all uppercase tracking-widest"
                        >
                            <option value="ALL">All Status</option>
                            <option value="UPCOMING">Upcoming</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                )}
                {onExport && (
                    <button
                        onClick={onExport}
                        className="px-5 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200/50 flex items-center gap-2"
                    >
                        <FileDown size={14} className="text-rose-400" />
                        Export
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 to-slate-50/50 border-b border-slate-100">
                                <th className="px-5 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">#</th>
                                <th className="px-5 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Patient</th>
                                <th className="px-5 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Schedule</th>
                                <th className="px-5 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Status</th>
                                <th className="px-5 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Payment</th>
                                <th className="px-5 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Calendar size={40} className="text-slate-200" />
                                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedAppointments.map((apt, idx) => (
                                <tr key={apt.id} className="hover:bg-slate-50/70 transition-all group">
                                    <td className="px-5 py-4">
                                        <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center font-black text-rose-500 text-[10px] border border-rose-100/50">
                                            {(currentPage - 1) * itemsPerPage + idx + 1}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-slate-500 font-black text-xs border border-slate-100">
                                                {(apt.patient?.firstName || "P")[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm leading-tight">{apt.patient?.firstName} {apt.patient?.lastName}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{apt.appointmentNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                                            <Calendar size={11} className="text-rose-400" />
                                            {new Date(apt.dateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] mt-1">
                                            <Clock size={10} className="text-slate-300" />
                                            {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">{statusBadge(apt.status)}</td>
                                    <td className="px-5 py-4">{paymentBadge(apt)}</td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                            {apt.status === "COMPLETED" && (
                                                <>
                                                    {apt.audioRecordingUrl && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onOpenRecording?.(apt);
                                                            }}
                                                            className="px-3 py-2 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-sm flex items-center gap-1.5"
                                                        >
                                                            <Volume2 size={12} className="animate-pulse" /> Listen
                                                        </button>
                                                    )}
                                                    {onDownloadInvoice && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDownloadInvoice(apt.id);
                                                            }}
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all border border-blue-100"
                                                            title="Download Invoice"
                                                        >
                                                            <AlignLeft size={13} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onOpenChat(apt);
                                                        }}
                                                        className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                                                    >
                                                        Chat
                                                    </button>
                                                </>
                                            )}
                                            {apt.status === "IN_PROGRESS" ? (
                                                <button onClick={() => onComplete(apt.id)} className="px-3 py-2 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-sm">
                                                    End
                                                </button>
                                            ) : (apt.status === "BOOKED" || apt.status === "PENDING") && (
                                                <button onClick={() => onStart(apt.id)} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm">
                                                    Start
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Showing <span className="text-slate-900">{startItem}</span> to <span className="text-slate-900">{endItem}</span> of <span className="text-slate-900">{appointments.length}</span> entries
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                const isDots = totalPages > 7 && (
                                    (page > 1 && page < currentPage - 2) ||
                                    (page < totalPages && page > currentPage + 2)
                                );

                                if (isDots && (page === 2 || page === totalPages - 1)) {
                                    return <span key={page} className="px-1.5 text-slate-300 text-xs">...</span>;
                                }
                                if (isDots) return null;

                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`min-w-[36px] h-9 rounded-lg text-xs font-black transition-all ${currentPage === page
                                                ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {totalPages <= 1 && appointments.length > 0 && (
                    <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <div>Showing {appointments.length} entries</div>
                        <div className="text-slate-300 tracking-[0.2em]">HealthPoint Portal</div>
                    </div>
                )}
            </div>
        </div>
    );
};
