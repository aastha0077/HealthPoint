import { useState } from "react";
import { XCircle, AlertTriangle, Banknote, Loader2, Upload, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/apis/apis";
import toast from "react-hot-toast";

interface RefundRequestModalProps {
    appointment: any;
    onClose: () => void;
    onSuccess: () => void;
}

export function RefundRequestModal({ appointment, onClose, onSuccess }: RefundRequestModalProps) {
    const [form, setForm] = useState({ reason: "", bankName: "", accountNumber: "", accountHolderName: "" });
    const [qrFile, setQrFile] = useState<File | null>(null);
    const [qrUrl, setQrUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setQrFile(file);
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await apiClient.post("/api/upload", formData);
            setQrUrl(res.data.fileUrl);
            toast.success("QR uploaded successfully");
        } catch {
            toast.error("Failed to upload QR image");
            setQrFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.reason.trim()) {
            toast.error("Please provide a reason for the refund");
            return;
        }
        setIsSubmitting(true);
        try {
            await apiClient.post(`/api/appointments/${appointment.id}/refund-request`, {
                ...form,
                qrCodeUrl: qrUrl || undefined,
            });
            toast.success("Refund request submitted! Our team will review it.");
            onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to submit refund");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-10">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Request Refund</h3>
                            <p className="text-slate-400 text-sm font-bold mt-1">Appointment #{appointment.appointmentNumber}</p>
                        </div>
                        <button onClick={onClose} className="text-slate-300 hover:text-red-500 transition-colors"><XCircle size={28} /></button>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8 flex items-start gap-4">
                        <AlertTriangle size={20} className="text-amber-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-amber-800 mb-1">Session Missed by Doctor</p>
                            <p className="text-xs text-amber-600 leading-relaxed">
                                Dr. {appointment.doctor?.user?.firstName} {appointment.doctor?.user?.lastName} did not join your scheduled session on {new Date(appointment.dateTime).toLocaleString()}. You are entitled to a full refund.
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason for refund *</label>
                            <textarea
                                rows={3}
                                placeholder="e.g. The doctor didn't join and I waited the entire time..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                value={form.reason}
                                onChange={e => setForm({ ...form, reason: e.target.value })}
                            />
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Banknote size={14} /> Bank Details (Optional — for faster processing)
                            </p>
                            <div className="space-y-4">
                                <input
                                    type="text" placeholder="Bank Name"
                                    className="w-full bg-white border border-slate-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                                    value={form.bankName}
                                    onChange={e => setForm({ ...form, bankName: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text" placeholder="Account Number"
                                        className="w-full bg-white border border-slate-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                                        value={form.accountNumber}
                                        onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                                    />
                                    <input
                                        type="text" placeholder="Account Holder Name"
                                        className="w-full bg-white border border-slate-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                                        value={form.accountHolderName}
                                        onChange={e => setForm({ ...form, accountHolderName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* QR Code Upload */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Upload size={14} /> Bank QR Code (Optional)
                            </p>
                            <label className="flex flex-col items-center justify-center py-6 bg-white border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition-all">
                                <input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
                                {isUploading ? (
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                        <Loader2 size={18} className="animate-spin" /> Uploading...
                                    </div>
                                ) : qrFile ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <img src={URL.createObjectURL(qrFile)} alt="QR Preview" className="w-32 h-32 object-contain rounded-xl border border-slate-100" />
                                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                                            <CheckCircle2 size={16} /> QR Uploaded
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-sm font-bold text-slate-400">
                                        <Upload size={24} className="text-slate-300" />
                                        <span>Upload your bank QR code</span>
                                        <span className="text-[10px] text-slate-300">Admin will use this to process your refund</span>
                                    </div>
                                )}
                            </label>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button onClick={onClose} className="flex-1 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">Cancel</button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !form.reason.trim()}
                                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-200 hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <><Loader2 size={16} className="animate-spin" /> Processing...</>
                                ) : (
                                    <><Banknote size={16} /> Submit Request</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
