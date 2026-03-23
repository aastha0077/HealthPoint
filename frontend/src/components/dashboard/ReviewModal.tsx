import { useState } from "react";
import { XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ReviewModalProps {
    appointment: any;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
}

export function ReviewModal({ onClose, onSubmit }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-10">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black text-slate-900">Rate Consultation</h3>
                        <button onClick={onClose} className="text-slate-300 hover:text-rose-500"><XCircle size={28} /></button>
                    </div>
                    <div className="space-y-8">
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map(s => (
                                <button key={s} onClick={() => setRating(s)} className={`text-4xl transition-all hover:scale-125 ${s <= rating ? "text-amber-400 animate-pulse" : "text-slate-100"}`}>★</button>
                            ))}
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Share your experience</label>
                            <textarea className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none resize-none" rows={4} placeholder="How was your session?" value={comment} onChange={e => setComment(e.target.value)} />
                        </div>
                        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all disabled:opacity-60">
                            {isSubmitting ? "Submitting..." : "Submit Feedback"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
