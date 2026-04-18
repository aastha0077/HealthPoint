import { useState } from "react";
import { XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ReviewModalProps {
    appointment: any;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    initialData?: { rating: number, comment: string } | null;
}

export function ReviewModal({ onClose, onSubmit, initialData }: ReviewModalProps) {
    const [rating, setRating] = useState(initialData?.rating || 5);
    const [comment, setComment] = useState(initialData?.comment || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit(rating, comment);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">{initialData ? "Revise Rating" : "Rate Consultation"}</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors"><XCircle size={24} /></button>
                    </div>
                    <div className="space-y-6">
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(s => (
                                <button key={s} onClick={() => setRating(s)} className={`text-4xl transition-all hover:scale-125 focus:outline-none ${s <= rating ? "text-amber-400 drop-shadow-md" : "text-slate-200"}`}>★</button>
                            ))}
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Refinement & Experience</label>
                            <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-bold focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 focus:bg-white outline-none transition-all resize-none leading-relaxed" rows={3} placeholder="How was your medical session?" value={comment} onChange={e => setComment(e.target.value)} />
                        </div>
                        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50">
                            {isSubmitting ? "Established..." : initialData ? "Update Insight" : "Submit Feedback"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
