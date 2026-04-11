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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Request Refund</h3>
                            <p className="text-slate-500 text-xs font-semibold mt-0.5">Appointment #{appointment.appointmentNumber}</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors"><XCircle size={24} /></button>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-amber-800 mb-1">Session Missed by Doctor</p>
                            <p className="text-[10px] text-amber-700 leading-relaxed">
                                Dr. {appointment.doctor?.user?.firstName} {appointment.doctor?.user?.lastName} did not join your scheduled session on {new Date(appointment.dateTime).toLocaleString()}. You are entitled to a full refund.
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Reason for refund *</label>
                            <textarea
                                rows={2}
                                placeholder="e.g. The doctor didn't join and I waited the entire time..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                value={form.reason}
                                onChange={e => setForm({ ...form, reason: e.target.value })}
                            />
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                                <Banknote size={12} /> Bank Details (Optional)
                            </p>
                            <div className="space-y-3">
                                <input
                                    type="text" placeholder="Bank Name"
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-[11px] font-semibold focus:ring-2 focus:ring-red-500 outline-none"
                                    value={form.bankName}
                                    onChange={e => setForm({ ...form, bankName: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text" placeholder="Account Number"
                                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-[11px] font-semibold focus:ring-2 focus:ring-red-500 outline-none"
                                        value={form.accountNumber}
                                        onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                                    />
                                    <input
                                        type="text" placeholder="Account Holder Name"
                                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-[11px] font-semibold focus:ring-2 focus:ring-red-500 outline-none"
                                        value={form.accountHolderName}
                                        onChange={e => setForm({ ...form, accountHolderName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* QR Code Upload */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                                <Upload size={12} /> Bank QR Code (Optional)
                            </p>
                            <label className="flex flex-col items-center justify-center py-4 bg-white border border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition-all">
                                <input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
                                {isUploading ? (
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                        <Loader2 size={14} className="animate-spin" /> Uploading...
                                    </div>
                                ) : qrFile ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <img src={URL.createObjectURL(qrFile)} alt="QR Preview" className="w-20 h-20 object-contain rounded-lg border border-slate-100" />
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                            <CheckCircle2 size={14} /> QR Uploaded
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                                        <Upload size={18} className="text-slate-300" />
                                        <span>Upload your bank QR code</span>
                                        <span className="text-[9px] text-slate-400">Admin uses this for processing</span>
                                    </div>
                                )}
                            </label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={onClose} className="flex-1 py-3 font-bold uppercase tracking-wider text-[10px] text-slate-500 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all">Cancel</button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !form.reason.trim()}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-sm hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                                {isSubmitting ? (
                                    <><Loader2 size={14} className="animate-spin" /> Processing...</>
                                ) : (
                                    <><Banknote size={14} /> Submit Request</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
