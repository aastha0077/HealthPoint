import { Calendar, Clock, RefreshCw, XCircle, Download, Star } from "lucide-react";

interface AppointmentListProps {
    tab: string;
    setTab: (t: string) => void;
    appointments: any[];
    isLoading: boolean;
    onRefresh: () => void;
    onCancel: (id: number) => void;
    onDownload: (id: number) => void;
    onReview: (apt: any) => void;
    onViewDetails?: (apt: any) => void;
    stats: { upcoming: number };
}

const TABS = [
    { key: "UPCOMING", label: "Upcoming", icon: Clock },
    { key: "COMPLETED", label: "Completed", icon: Star }, // Icon for completed
    { key: "CANCELLED", label: "Cancelled", icon: XCircle }, // Icon for cancelled
];

export function AppointmentList({
    tab,
    setTab,
    appointments,
    isLoading,
    onRefresh,
    onCancel,
    onDownload,
    onReview,
    stats,
    onViewDetails
}: AppointmentListProps) {
    const [liveTimer, setLiveTimer] = (require('react').useState)("00:00:00");

    require('react').useEffect(() => {
        const interval = setInterval(() => {
            const active = appointments.find(a => a.status === "IN_PROGRESS");
            if (active && active.startedAt) {
                const start = new Date(active.startedAt).getTime();
                const now = new Date().getTime();
                const diff = Math.max(0, now - start);
                const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
                const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
                const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
                setLiveTimer(`${h}:${m}:${s}`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [appointments]);

    const filtered = appointments.filter(a => {
        if (tab === "UPCOMING") return a.status === "BOOKED" || a.status === "PENDING" || a.status === "IN_PROGRESS";
        if (tab === "COMPLETED") return a.status === "COMPLETED";
        return a.status === "CANCELLED";
    });

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            BOOKED: "bg-rose-100 text-rose-700", PENDING: "bg-amber-100 text-amber-700",
            IN_PROGRESS: "bg-indigo-100 text-indigo-700",
            COMPLETED: "bg-emerald-100 text-emerald-700", CANCELLED: "bg-slate-100 text-slate-500"
        };
        return map[status] || "bg-slate-100 text-slate-600";
    };

    return (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-rose-900/5 overflow-hidden">
            <div className="flex bg-slate-50/50 p-3 gap-2 border-b border-slate-50">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2.5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${tab === key
                            ? "bg-white text-slate-900 shadow-xl shadow-slate-200 border border-slate-100 scale-[1.02]"
                            : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            }`}
                    >
                        <Icon size={14} className={tab === key ? "text-rose-500" : "text-slate-300"} /> 
                        {label}
                        {key === "UPCOMING" && stats.upcoming > 0 && (
                            <span className={`w-5 h-5 flex items-center justify-center rounded-lg font-black text-[9px] ${tab === key ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                                {stats.upcoming}
                            </span>
                        )}
                    </button>
                ))}
                <div className="w-[1px] bg-slate-200 mx-1 self-stretch my-2" />
                <button
                    onClick={onRefresh}
                    className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-rose-500 hover:shadow-lg transition-all active:scale-90"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="p-6 space-y-4 min-h-[300px]">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-28 rounded-2xl bg-rose-50/50 animate-pulse border border-rose-100/50" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 border border-rose-100">
                            <Calendar className="text-rose-300" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">No {tab.toLowerCase()} appointments</h3>
                        <p className="text-sm text-slate-400 mt-1">
                            {tab === "UPCOMING" ? "Book an appointment to get started!" : "No records found in this category."}
                        </p>
                    </div>
                ) : (
                    filtered.map(apt => {
                        const doctorName = `${apt.doctor?.user?.firstName || apt.doctor?.firstName || ""} ${apt.doctor?.user?.lastName || apt.doctor?.lastName || ""}`.trim();
                        const specialty = apt.doctor?.speciality || apt.doctor?.user?.speciality || "";
                        const canCancel = (new Date(apt.dateTime).getTime() - new Date().getTime()) / (1000 * 60 * 60) >= 12;

                        return (
                            <div
                                key={apt.id}
                                className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-[2.5rem] border border-slate-50 hover:border-rose-100 transition-all hover:shadow-2xl hover:shadow-rose-500/5 bg-slate-50/30 group relative overflow-hidden active:scale-[0.995]"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-16 h-16 bg-white rounded-[1.5rem] border-2 border-slate-50 shadow-sm flex items-center justify-center text-rose-500 font-black text-2xl group-hover:bg-rose-500 group-hover:text-white transition-all transform group-hover:rotate-3">
                                        {(apt.doctor?.user?.firstName || apt.doctor?.firstName || "D")[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <h4 className="font-black text-slate-900 text-lg tracking-tight truncate">Dr. {doctorName || "Staff"}</h4>
                                            <span className={`text-[8px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest ${statusBadge(apt.status)} border border-current opacity-70`}>
                                                {apt.status === "BOOKED" ? "CONFIRMED" : apt.status}
                                            </span>
                                            {(() => {
                                                const diff = new Date(apt.dateTime).getTime() - new Date().getTime();
                                                if (apt.status === "BOOKED" && diff > 0 && diff <= 15 * 60 * 1000) {
                                                    return (
                                                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-amber-500/20 animate-pulse">
                                                            Starts Soon
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/80 mb-3">{specialty}</p>
                                        <div className="flex items-center gap-5 text-[11px] text-slate-400 font-bold">
                                            <span className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-300" />
                                                {new Date(apt.dateTime).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Clock size={14} className="text-slate-300" />
                                                {new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                            {apt.status === "IN_PROGRESS" && (
                                                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                                    <span className="font-mono font-black">{liveTimer}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 relative z-10 self-end lg:self-center">
                                    {tab === "UPCOMING" && (
                                        <button
                                            onClick={() => canCancel && onCancel(apt.id)}
                                            disabled={!canCancel}
                                            className={`flex items-center justify-center gap-2 h-12 px-6 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${canCancel
                                                    ? "bg-slate-900 text-white hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-200"
                                                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                                }`}
                                        >
                                            {canCancel ? "Cancel Session" : "Cancellation Locked"}
                                        </button>
                                    )}
                                    {tab === "COMPLETED" && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onViewDetails && onViewDetails(apt)}
                                                className="h-11 px-5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-600 bg-white border border-slate-100 hover:border-blue-200 hover:text-blue-600 hover:shadow-lg transition-all"
                                            >
                                                Details
                                            </button>

                                            <button
                                                onClick={() => onDownload(apt.id)}
                                                className="w-11 h-11 flex items-center justify-center rounded-2xl text-slate-400 bg-white border border-slate-100 hover:text-slate-900 hover:border-slate-300 hover:shadow-lg transition-all"
                                                title="Download Report"
                                            >
                                                <Download size={16} />
                                            </button>
                                            <button
                                                onClick={() => onReview(apt)}
                                                className="h-11 px-5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white bg-rose-500 shadow-lg shadow-rose-200 hover:bg-rose-600 hover:shadow-xl transition-all flex items-center gap-2"
                                            >
                                                <Star size={14} /> Review
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
