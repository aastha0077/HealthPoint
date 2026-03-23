import { Calendar, Clock, Download, RefreshCw, Banknote, CheckCircle2, Loader2, Volume2 } from "lucide-react";

interface AppointmentCardProps {
    apt: any;
    filter: string;
    refundStatus?: any;
    statusBadge: (s: string) => string;
    onReschedule: (apt: any) => void;
    onCancel: (id: number) => void;
    onDetails: (apt: any) => void;
    onDownloadInvoice: (id: number) => void;
    onReview: (apt: any) => void;
    onRefundRequest: (apt: any) => void;
}

export function AppointmentCard({
    apt, filter, refundStatus, statusBadge,
    onReschedule, onCancel, onDetails, onDownloadInvoice, onReview, onRefundRequest
}: AppointmentCardProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[2.5rem] bg-white border border-slate-50 hover:border-rose-100 transition-all group">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white font-black text-2xl group-hover:bg-rose-500 transition-colors">
                    {(apt.doctor?.user?.firstName || apt.doctor?.firstName || "D")[0]}
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}</h4>
                        <span className={`text-[8px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border border-current opacity-70 ${statusBadge(apt.status)}`}>
                            {apt.status}
                        </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500/80 mb-3">{apt.doctor?.speciality}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-bold">
                        <span className="flex items-center gap-2"><Calendar size={13} /> {new Date(apt.dateTime).toLocaleDateString()}</span>
                        <span className="flex items-center gap-2"><Clock size={13} /> {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {filter === "UPCOMING" && (
                    <>
                        <button onClick={() => onReschedule(apt)} className="h-11 px-5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-600 bg-white border border-slate-100 hover:border-slate-300">Reschedule</button>
                        <button onClick={() => onCancel(apt.id)} className="h-11 px-5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-rose-500">Cancel</button>
                    </>
                )}
                {filter === "HISTORY" && (
                    <>
                        {apt.audioRecordingUrl && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDetails(apt);
                                }}
                                className="h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-100 ring-2 ring-indigo-500/20"
                            >
                                <Volume2 size={16} className="animate-pulse" /> Listen Recording
                            </button>
                        )}
                        <button onClick={() => onDetails(apt)} className="h-11 px-5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-600 border border-slate-100 hover:bg-slate-50">Details</button>
                        <button onClick={() => onDownloadInvoice(apt.id)} className="w-11 h-11 flex items-center justify-center rounded-2xl text-slate-400 bg-white border border-slate-100"><Download size={14} /></button>
                        <button onClick={() => onReview(apt)} className="h-11 px-5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white bg-rose-500">Review</button>
                    </>
                )}
                {filter === "MISSED" && (
                    <>
                        {refundStatus ? (
                            <div className="flex items-center gap-2">
                                <div className={`h-11 px-5 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border ${
                                    refundStatus.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    refundStatus.status === "PROCESSING" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    refundStatus.status === "REJECTED" ? "bg-red-50 text-red-600 border-red-100" :
                                    "bg-blue-50 text-blue-600 border-blue-100"
                                }`}>
                                    {refundStatus.status === "COMPLETED" && <CheckCircle2 size={14} />}
                                    {refundStatus.status === "PROCESSING" && <Loader2 size={14} className="animate-spin" />}
                                    {refundStatus.status === "PENDING" && <Clock size={14} />}
                                    Refund: {refundStatus.status}
                                </div>
                                {refundStatus.proofUrl && (
                                    <a href={refundStatus.proofUrl} target="_blank" rel="noreferrer" className="h-11 px-5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 flex items-center gap-2 hover:bg-emerald-100 transition-all">
                                        <CheckCircle2 size={14} /> View Proof
                                    </a>
                                )}
                            </div>
                        ) : (
                            <>
                                <button onClick={() => onReschedule(apt)} className="h-11 px-5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                                    <RefreshCw size={14} /> Reschedule
                                </button>
                                <button onClick={() => onRefundRequest(apt)} className="h-11 px-5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-200 flex items-center gap-2">
                                    <Banknote size={14} /> Request Refund
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
