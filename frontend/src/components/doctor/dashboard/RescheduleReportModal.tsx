import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface RescheduleReportModalProps {
    show: boolean;
    result: any;
    onClose: () => void;
}

export const RescheduleReportModal = ({ show, result, onClose }: RescheduleReportModalProps) => {
    return (
        <AnimatePresence>
            {show && result && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[150] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Reschedule Report</h3>
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mt-1">{result.message}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 max-h-[400px] overflow-y-auto space-y-4">
                            {result.rescheduled?.length > 0 ? (
                                result.rescheduled.map((r: any) => (
                                    <div key={r.appointmentId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-black text-sm text-slate-900">{r.appointmentNumber}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${r.status === 'RESCHEDULED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{r.status}</span>
                                        </div>
                                        {r.patientName && <p className="text-xs font-bold text-slate-500 mb-2">{r.patientName}</p>}
                                        {r.oldDateTime && (
                                            <div className="flex items-center gap-2 text-[10px] font-bold">
                                                <span className="text-slate-400 line-through">{new Date(r.oldDateTime).toLocaleString()}</span>
                                                <span className="text-slate-300">→</span>
                                                <span className="text-emerald-600">{new Date(r.newDateTime).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {r.reason && <p className="text-[10px] text-red-400 font-bold mt-1">{r.reason}</p>}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-400 font-bold text-sm py-8">No appointments were affected.</p>
                            )}
                        </div>
                        <div className="p-8 pt-0">
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
                            >
                                Dismiss
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
