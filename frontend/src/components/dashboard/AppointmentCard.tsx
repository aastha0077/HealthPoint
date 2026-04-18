import { Calendar, Clock, Download, RefreshCw, Banknote, CheckCircle2, Loader2, Volume2, XCircle } from "lucide-react";

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
    onPreviewProof: (url: string) => void;
}

export function AppointmentCard({
    apt, filter, refundStatus, statusBadge,
    onReschedule, onCancel, onDetails, onDownloadInvoice, onReview, onRefundRequest, onPreviewProof
}: AppointmentCardProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-100 hover:border-indigo-100 transition-all group shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-lg group-hover:bg-indigo-500 transition-colors">
                    {(apt.doctor?.user?.firstName || apt.doctor?.firstName || "D")[0]}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-base font-bold text-slate-900 tracking-tight">Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}</h4>
                        <span className={`text-[8px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-current opacity-80 ${statusBadge(apt.status)}`}>
                            {apt.status}
                        </span>
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">{apt.doctor?.speciality}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(apt.dateTime).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {filter === "UPCOMING" && (
                    <>
                        <button onClick={() => onReschedule(apt)} className="h-9 px-4 rounded-xl text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 hover:border-slate-300">Reschedule</button>
                        <button onClick={() => onCancel(apt.id)} className="h-9 px-4 rounded-xl text-[9px] font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-rose-500">Cancel</button>
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
                                className="h-9 px-4 rounded-xl text-[9px] font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm"
                            >
                                <Volume2 size={14} className="animate-pulse" /> Listen
                            </button>
                        )}
                        <button onClick={() => onDetails(apt)} className="h-9 px-4 rounded-xl text-[9px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200 hover:bg-slate-50">Details</button>
                        <button onClick={() => onDownloadInvoice(apt.id)} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all"><Download size={14} /></button>
                        <button onClick={() => onReview(apt)} className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-rose-600 transition-all shadow-lg shadow-slate-200 active:scale-95">
                            {apt.review ? "Edit Review" : "Review"}
                        </button>
                    </>
                )}
                {filter === "MISSED" && (
                    <>
                        {apt.status === "NO_SHOW" ? (
                            <div className="h-9 px-4 rounded-xl text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 flex items-center gap-2">
                                <XCircle size={14} /> Non-refundable
                            </div>
                        ) : refundStatus ? (
                            <div className="flex items-center gap-2">
                                <div className={`h-9 px-4 rounded-xl text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                                    refundStatus.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    refundStatus.status === "PROCESSING" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    refundStatus.status === "REJECTED" ? "bg-red-50 text-red-600 border-red-100" :
                                    "bg-blue-50 text-blue-600 border-blue-100"
                                }`}>
                                    {refundStatus.status === "COMPLETED" && <CheckCircle2 size={12} />}
                                    {refundStatus.status === "PROCESSING" && <Loader2 size={12} className="animate-spin" />}
                                    {refundStatus.status === "PENDING" && <Clock size={12} />}
                                    Refund: {refundStatus.status}
                                </div>
                                {refundStatus.proofUrl && (
                                    <button 
                                        onClick={() => onPreviewProof(refundStatus.proofUrl)}
                                        className="h-9 px-4 rounded-xl text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 flex items-center gap-1.5 hover:bg-emerald-100 transition-all shadow-sm"
                                    >
                                        <CheckCircle2 size={12} /> View Proof
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <button onClick={() => onReschedule(apt)} className="h-9 px-4 rounded-xl text-[9px] font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm flex items-center gap-1.5">
                                    <RefreshCw size={12} /> Reschedule
                                </button>
                                <button onClick={() => onRefundRequest(apt)} className="h-9 px-4 rounded-xl text-[9px] font-bold uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 transition-all shadow-sm flex items-center gap-1.5">
                                    <Banknote size={12} /> Request Refund
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
