import { Calendar, Clock, MoreVertical, Search, Filter, Volume2, FileDown, AlignLeft } from "lucide-react";

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
    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            BOOKED: "bg-rose-100 text-rose-700",
            PENDING: "bg-amber-100 text-amber-700",
            IN_PROGRESS: "bg-indigo-100 text-indigo-700",
            COMPLETED: "bg-emerald-100 text-emerald-700",
            CANCELLED: "bg-slate-100 text-slate-500",
        };
        return (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${map[status] || "bg-slate-100 text-slate-600"}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or number..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-rose-500/5 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                    />
                </div>
                {showFilter && (
                    <div className="relative group">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            value={statusFilter}
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="pl-9 pr-8 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-rose-500/5 outline-none cursor-pointer appearance-none transition-all"
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
                        className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
                    >
                        <FileDown size={16} className="text-rose-500" />
                        Export Data
                    </button>
                )}
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 h-12">
                                <th className="px-6 py-3 text-[10px] uppercase font-black tracking-widest text-slate-400">Patient</th>
                                <th className="px-6 py-3 text-[10px] uppercase font-black tracking-widest text-slate-400">Schedule</th>
                                <th className="px-6 py-3 text-[10px] uppercase font-black tracking-widest text-slate-400">Status</th>
                                <th className="px-6 py-3 text-[10px] uppercase font-black tracking-widest text-slate-400">Payment</th>
                                <th className="px-6 py-3 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No records found</td>
                                </tr>
                            ) : appointments.map((apt, idx) => (
                                <tr key={apt.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center font-black text-rose-500 text-xs border border-rose-100 shadow-sm">
                                                #{idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm leading-tight">{apt.patient?.firstName} {apt.patient?.lastName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {apt.appointmentNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                                            <Calendar size={12} className="text-rose-500" />
                                            {new Date(apt.dateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] mt-1">
                                            <Clock size={10} />
                                            {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{statusBadge(apt.status)}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{apt.paymentStatus || 'UNPAID'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            {apt.status === "COMPLETED" && (
                                                <>
                                                    {apt.audioRecordingUrl && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onOpenRecording?.(apt);
                                                            }} 
                                                            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center gap-2"
                                                        >
                                                            <Volume2 size={14} className="animate-pulse" /> Listen
                                                        </button>
                                                    )}
                                                    {onDownloadInvoice && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDownloadInvoice(apt.id);
                                                            }} 
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-100"
                                                            title="Download Invoice"
                                                        >
                                                            <AlignLeft size={14} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onOpenChat(apt);
                                                        }} 
                                                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                                                    >
                                                        Chat
                                                    </button>
                                                </>
                                            )}
                                            {apt.status === "IN_PROGRESS" ? (
                                                <button onClick={() => onComplete(apt.id)} className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100">
                                                    End
                                                </button>
                                            ) : (apt.status === "BOOKED" || apt.status === "PENDING") && (
                                                <button onClick={() => onStart(apt.id)} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                                                    Start
                                                </button>
                                            )}
                                            <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-300 transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div>Showing {appointments.length} entries</div>
                    <div className="text-slate-300 tracking-[0.2em]">HealthPoint Portal</div>
                </div>
            </div>
        </div>
    );
};
