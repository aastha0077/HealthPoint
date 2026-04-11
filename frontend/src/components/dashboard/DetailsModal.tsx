import { XCircle, Star, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

interface DetailsModalProps {
    appointment: any;
    onClose: () => void;
}

export function DetailsModal({ appointment, onClose }: DetailsModalProps) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Session Findings</h3>
                        <p className="text-slate-500 font-semibold text-xs mt-0.5">Reference: {appointment.appointmentNumber}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><XCircle size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-5 flex-1">
                    {appointment.audioRecordingUrl && (
                        <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl border border-slate-800 shadow-md overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-125 transition-transform duration-1000" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/5 rounded-full -ml-12 -mb-12 blur-2xl" />
                            
                            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white shadow-inner border border-white/10">
                                        <Volume2 size={20} className="animate-pulse text-indigo-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider leading-none">Consultation Replay</h4>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
                                            {appointment.consultationDuration ? `${Math.floor(appointment.consultationDuration/60)}m ${appointment.consultationDuration%60}s` : "Recorded Session"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-1 max-w-sm">
                                    <audio 
                                        src={appointment.audioRecordingUrl} 
                                        controls 
                                        className="w-full h-8 custom-audio-player filter invert brightness-200 contrast-125 opacity-90 hover:opacity-100 transition-all text-sm"
                                    />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-2 text-center md:text-left ml-1">
                                        Secure Audio Stream
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {[
                        { label: "Patient Symptoms", content: appointment.symptoms, bg: "bg-slate-50 border-slate-100 text-slate-700" },
                        { label: "Doctor Diagnosis", content: appointment.diagnosis, bg: "bg-blue-50 border-blue-100 text-blue-900 font-bold" },
                        { label: "Treatment / Prescription", content: appointment.treatment, bg: "bg-emerald-50 border-emerald-100 text-emerald-900 font-semibold" },
                        { label: "Special Notes", content: appointment.additionalNotes, bg: "bg-slate-50 border-slate-100 text-slate-600" },
                    ].map(({ label, content, bg }) => {
                        if (!content) return null;
                        return (
                            <div key={label} className={`p-4 rounded-xl border ${bg}`}>
                                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-2">{label}</p>
                                <p className="text-sm leading-relaxed whitespace-pre-line">{content}</p>
                            </div>
                        );
                    })}
                    {(!appointment.diagnosis && !appointment.treatment) && (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200"><Star size={40} /></div>
                            <p className="text-slate-400 font-bold">The doctor hasn't submitted findings for this session yet.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
