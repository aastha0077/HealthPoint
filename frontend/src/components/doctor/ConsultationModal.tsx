import { useState, useEffect } from "react";
import { X, Save, History, FileText, Calendar, User, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/apis/apis";
import { motion } from "framer-motion";

interface ConsultationModalProps {
    appointmentId: number;
    patientId: number;
    patientName: string;
    existingNotes?: {
        symptoms?: string;
        diagnosis?: string;
        treatment?: string;
        additionalNotes?: string;
    };
    startedAt?: string;
    onClose: () => void;
    onSaveSuccess: () => void;
    onComplete: (id: number, data?: { consultationDuration?: number, audioRecordingUrl?: string }) => Promise<void>;
}

export function ConsultationModal({ appointmentId, patientId, patientName, existingNotes, startedAt, onClose, onSaveSuccess, onComplete }: ConsultationModalProps) {
    const [tab, setTab] = useState<"NOTES" | "HISTORY">("NOTES");
    const [isSaving, setIsSaving] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [sessionTime, setSessionTime] = useState("00:00:00");

    useEffect(() => {
        if (!startedAt) return;
        const interval = setInterval(() => {
            const start = new Date(startedAt).getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, now - start);
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            setSessionTime(`${h}:${m}:${s}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [startedAt]);
    
    // Form fields
    const [symptoms, setSymptoms] = useState(existingNotes?.symptoms || "");
    const [diagnosis, setDiagnosis] = useState(existingNotes?.diagnosis || "");
    const [treatment, setTreatment] = useState(existingNotes?.treatment || "");
    const [additionalNotes, setAdditionalNotes] = useState(existingNotes?.additionalNotes || "");

    // History
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        if (tab === "HISTORY" && history.length === 0) {
            fetchHistory();
        }
    }, [tab]);

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const res = await apiClient.get(`/api/appointments/patient/${patientId}/history`);
            setHistory(res.data);
        } catch (error) {
            toast.error("Failed to load patient history");
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await apiClient.put(`/api/appointments/${appointmentId}/notes`, {
                symptoms,
                diagnosis,
                treatment,
                additionalNotes
            });
            toast.success("Consultation notes saved!");
            onSaveSuccess();
        } catch (error) {
            toast.error("Failed to save notes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCompleteConsultation = async () => {
        setIsCompleting(true);
        try {
            // Save notes first if changed
            await apiClient.put(`/api/appointments/${appointmentId}/notes`, {
                symptoms,
                diagnosis,
                treatment,
                additionalNotes
            });
            
            // Calculate final duration for local reference
            const durationInSeconds = startedAt 
                ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000) 
                : 0;

            await onComplete(appointmentId, { consultationDuration: durationInSeconds });
            onSaveSuccess();
            onClose();
        } catch (error) {
            toast.error("Failed to complete consultation");
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <User className="text-rose-500" /> Consult: {patientName}
                            {startedAt && (
                                <div className="ml-4 flex items-center gap-3 px-5 py-2 bg-slate-900 shadow-xl shadow-slate-200 rounded-2xl text-white border border-slate-800">
                                    <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
                                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">REC</span>
                                    </div>
                                    <span className="font-mono text-lg font-black tracking-tighter text-rose-500">{sessionTime}</span>
                                </div>
                            )}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Medical Record Management • Persistent Session Audit</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-8 bg-white">
                    <button 
                        onClick={() => setTab("NOTES")}
                        className={`flex items-center gap-2 py-4 px-6 font-black text-xs uppercase tracking-widest transition-colors border-b-2 ${tab === "NOTES" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                    >
                        <FileText size={16} /> Current Consultation
                    </button>
                    <button 
                        onClick={() => setTab("HISTORY")}
                        className={`flex items-center gap-2 py-4 px-6 font-black text-xs uppercase tracking-widest transition-colors border-b-2 ${tab === "HISTORY" ? "border-rose-500 text-rose-500" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                    >
                        <History size={16} /> Patient History
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    {tab === "NOTES" ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Symptoms / Complaints</label>
                                    <textarea 
                                        value={symptoms} 
                                        onChange={(e) => setSymptoms(e.target.value)}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl resize-none h-32 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-300 outline-none text-sm font-medium text-slate-700 transition-all placeholder:text-slate-300"
                                        placeholder="E.g., fever, headache for 3 days..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Diagnosis / Findings</label>
                                    <textarea 
                                        value={diagnosis} 
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl resize-none h-32 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-300 outline-none text-sm font-medium text-slate-700 transition-all placeholder:text-slate-300"
                                        placeholder="Record clinical diagnosis..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Treatment Plan / Prescription</label>
                                <textarea 
                                    value={treatment} 
                                    onChange={(e) => setTreatment(e.target.value)}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl resize-none h-32 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 outline-none text-sm font-medium text-slate-700 transition-all placeholder:text-slate-300"
                                    placeholder="Medications, dosage, advice..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Additional Remarks</label>
                                <textarea 
                                    value={additionalNotes} 
                                    onChange={(e) => setAdditionalNotes(e.target.value)}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl resize-none h-24 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-300 outline-none text-sm font-medium text-slate-700 transition-all placeholder:text-slate-300"
                                    placeholder="Any other notes for future visits..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {isLoadingHistory ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-20 text-slate-400">
                                    <History size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="font-bold">No previous visits found for this patient.</p>
                                </div>
                            ) : (
                                history.map((visit, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-4">
                                        <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-50">
                                            <div>
                                                <h3 className="font-black text-slate-800 flex items-center gap-2">
                                                    <Calendar size={16} className="text-rose-500" />
                                                    {new Date(visit.dateTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </h3>
                                                <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-1">
                                                    <Clock size={12} /> {new Date(visit.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    <span className="mx-2">•</span>
                                                    Dr. {visit.doctor?.user?.lastName} ({visit.department?.name})
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${visit.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {visit.status}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                            {visit.symptoms && (
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">Symptoms</p>
                                                    <p className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-xl">{visit.symptoms}</p>
                                                </div>
                                            )}
                                            {visit.diagnosis && (
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Diagnosis</p>
                                                    <p className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-xl">{visit.diagnosis}</p>
                                                </div>
                                            )}
                                            {visit.treatment && (
                                                <div className="md:col-span-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Treatment</p>
                                                    <p className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-xl">{visit.treatment}</p>
                                                </div>
                                            )}
                                            {visit.additionalNotes && (
                                                <div className="md:col-span-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Remarks</p>
                                                    <p className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-xl">{visit.additionalNotes}</p>
                                                </div>
                                            )}
                                            {!visit.symptoms && !visit.diagnosis && !visit.treatment && !visit.additionalNotes && (
                                                <p className="text-sm font-medium text-slate-400 italic md:col-span-2 text-center py-4">No notes recorded for this visit.</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {tab === "NOTES" && (
                    <div className="p-6 bg-white border-t border-slate-100 flex justify-end items-center gap-6">
                         <div className="flex-1 flex items-center gap-2 text-emerald-600">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Patient Audio Recording Online</span>
                         </div>

                        <button 
                            onClick={onClose}
                            className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            Close
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving || isCompleting}
                            className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                            ) : (
                                <Save size={16} />
                            )}
                            Save Draft
                        </button>
                        <button 
                            onClick={handleCompleteConsultation}
                            disabled={isSaving || isCompleting}
                            className="flex items-center gap-2 px-10 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 border-b-4 border-rose-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 active:translate-y-0"
                        >
                            {isCompleting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <Clock size={16} />
                            )}
                            Finish & Complete
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
