import { XCircle, Star, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

interface DetailsModalProps {
    appointment: any;
    onClose: () => void;
}

export function DetailsModal({ appointment, onClose }: DetailsModalProps) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900">Session Findings</h3>
                        <p className="text-slate-400 font-bold text-sm mt-1">Reference: {appointment.appointmentNumber}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-300 hover:text-blue-500 transition-colors"><XCircle size={32} /></button>
                </div>
                <div className="p-10 overflow-y-auto space-y-8 flex-1">
                    {appointment.audioRecordingUrl && (
                        <div className="p-8 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-125 transition-transform duration-1000" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full -ml-16 -mb-16 blur-2xl" />
                            
                            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center text-white shadow-inner border border-white/10">
                                        <Volume2 size={28} className="animate-pulse text-indigo-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none">Consultation Replay</h4>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-2">
                                            {appointment.consultationDuration ? `${Math.floor(appointment.consultationDuration/60)}m ${appointment.consultationDuration%60}s` : "Recorded Session"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-1 max-w-sm">
                                    <audio 
                                        src={appointment.audioRecordingUrl} 
                                        controls 
                                        className="w-full h-10 custom-audio-player filter invert brightness-200 contrast-125 opacity-90 hover:opacity-100 transition-all"
                                    />
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-3 text-center md:text-left ml-2">
                                        Secure Clinical Audio Stream
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
                            <div key={label} className={`p-6 rounded-[2rem] border ${bg}`}>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-3">{label}</p>
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
