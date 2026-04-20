import { useState, useEffect } from "react";
import { apiClient } from "@/apis/apis";
import toast from "react-hot-toast";
import { Clock, CheckCircle2, XCircle, Loader2, Upload, Eye, AlertTriangle, Banknote, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "./Pagination";
import { TableStatsRow, type StatItem } from "./TableStatsRow";
import { AssetPreviewModal } from "../common/AssetPreviewModal";


interface RefundManagementProps {
    search: string;
    setSearch: (s: string) => void;
}

export function RefundManagement({ search, setSearch }: RefundManagementProps) {
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [processModalOpen, setProcessModalOpen] = useState(false);
    const [processForm, setProcessForm] = useState({ status: "PROCESSING", proofUrl: "", adminNotes: "" });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const itemsPerPage = 10;

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get("/api/admin/refund-requests");
            setRequests(res.data);
        } catch {
            toast.error("Failed to load refund requests");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleProcess = async () => {
        if (!selectedRequest) return;
        setIsProcessing(true);
        try {
            await apiClient.put(`/api/admin/refund-requests/${selectedRequest.id}/process`, processForm);
            toast.success(`Refund ${processForm.status === "COMPLETED" ? "completed" : processForm.status === "REJECTED" ? "rejected" : "updated"}!`);
            setProcessModalOpen(false);
            fetchRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await apiClient.post("/api/upload", formData);
            setProcessForm(prev => ({ ...prev, proofUrl: res.data.fileUrl }));
            toast.success("Proof uploaded");
        } catch {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
        const matchesSearch = !search ||
            r.appointment?.appointmentNumber?.toLowerCase().includes(search.toLowerCase()) ||
            r.appointment?.patient?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            r.appointment?.patient?.lastName?.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    }).sort((a, b) => {
        const order: Record<string, number> = { PENDING: 0, PROCESSING: 1, COMPLETED: 2, REJECTED: 3 };
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
    });

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page on filter/search change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const statusColors: Record<string, { bg: string; text: string; border: string; icon: any }> = {
        PENDING: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", icon: Clock },
        PROCESSING: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", icon: Loader2 },
        COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", icon: CheckCircle2 },
        REJECTED: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100", icon: XCircle },
    };

    const stats: StatItem[] = [
        { label: "Pending", value: requests.filter(r => r.status === "PENDING").length, color: "amber" },
        { label: "Processing", value: requests.filter(r => r.status === "PROCESSING").length, color: "blue" },
        { label: "Completed", value: requests.filter(r => r.status === "COMPLETED").length, color: "emerald" },
        { label: "Total Requests", value: requests.length, color: "slate" }
    ];

    return (
        <div className="space-y-8">
            <TableStatsRow stats={stats} />

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search appointment # or patient..."
                        className="w-full pl-11 pr-4 py-2 bg-white border border-slate-100 rounded-lg text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100">
                    {["ALL", "PENDING", "PROCESSING", "COMPLETED", "REJECTED"].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 size={32} className="animate-spin text-slate-200" />
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="py-20 text-center space-y-3">
                            <Banknote size={48} className="mx-auto text-slate-100" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No refund requests found</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                                <tr>
                                    <th className="text-left px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Appointment</th>
                                    <th className="text-left px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Patient</th>
                                    <th className="text-left px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Doctor</th>
                                    <th className="text-left px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Reason</th>
                                    <th className="text-left px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Bank</th>
                                    <th className="text-left px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Admin Msg</th>
                                    <th className="text-left px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="text-left px-3 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedRequests.map(r => {
                                    const sc = statusColors[r.status] || statusColors.PENDING;
                                    const StatusIcon = sc.icon;
                                    return (
                                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-3 py-1.5">
                                                <p className="font-black text-slate-900 text-[11px]">#{r.appointment?.appointmentNumber}</p>
                                                <p className="text-[7px] text-slate-400 font-bold">
                                                    {r.appointment?.dateTime ? new Date(r.appointment.dateTime).toLocaleDateString() : "—"}
                                                </p>
                                            </td>
                                            <td className="px-3 py-1.5">
                                                <p className="font-bold text-slate-700 text-[11px]">
                                                    {r.appointment?.patient?.firstName} {r.appointment?.patient?.lastName}
                                                </p>
                                            </td>
                                            <td className="px-3 py-1.5">
                                                <p className="font-bold text-slate-700 text-[11px]">
                                                    Dr. {r.appointment?.doctor?.user?.firstName || r.appointment?.doctor?.firstName} {r.appointment?.doctor?.user?.lastName || r.appointment?.doctor?.lastName}
                                                </p>
                                            </td>
                                            <td className="px-3 py-1.5 max-w-[120px]">
                                                <p className="text-[10px] text-slate-500 truncate" title={r.reason}>{r.reason}</p>
                                            </td>
                                            <td className="px-3 py-1.5">
                                                {r.bankName ? (
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-700">{r.bankName}</p>
                                                        <p className="text-[7px] text-slate-400">{r.accountNumber}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-[8px] text-slate-300 font-bold uppercase">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-1.5 max-w-[150px]">
                                                {r.adminNotes ? (
                                                    <p className="text-[10px] text-emerald-600 font-bold truncate" title={r.adminNotes}>
                                                        {r.adminNotes}
                                                    </p>
                                                ) : (
                                                    <p className="text-[10px] text-slate-300 italic">No notes</p>
                                                )}
                                            </td>
                                            <td className="px-3 py-1.5">
                                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${sc.bg} ${sc.text} ${sc.border} border text-[7px] font-black uppercase tracking-widest`}>
                                                    <StatusIcon size={9} className={r.status === "PROCESSING" ? "animate-spin" : ""} />
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-1.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {r.proofUrl && (
                                                        <button
                                                            onClick={() => setPreviewUrl(r.proofUrl)}
                                                            className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-all border border-emerald-100/50"
                                                            title="Preview Proof"
                                                        >
                                                            <Eye size={11} />
                                                        </button>
                                                    )}
                                                    {r.status !== "COMPLETED" && r.status !== "REJECTED" && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(r);
                                                                setProcessForm({ status: "PROCESSING", proofUrl: r.proofUrl || "", adminNotes: r.adminNotes || "" });
                                                                setProcessModalOpen(true);
                                                            }}
                                                            className="px-2 py-1 bg-slate-900 text-white text-[7px] font-black uppercase tracking-widest rounded transition-all hover:bg-rose-500"
                                                        >
                                                            Process
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {filteredRequests.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredRequests.length}
                        itemsPerPage={itemsPerPage}
                    />
                )}
            </div>

            {/* Process Refund Modal */}
            <AnimatePresence>
                {processModalOpen && selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">Process Refund</h3>
                                        <p className="text-slate-400 text-xs font-bold mt-0.5 line-clamp-1">
                                            #{selectedRequest.appointment?.appointmentNumber} — {selectedRequest.appointment?.patient?.firstName} {selectedRequest.appointment?.patient?.lastName}
                                        </p>
                                    </div>
                                    <button onClick={() => setProcessModalOpen(false)} className="text-slate-300 hover:text-rose-500"><XCircle size={24} /></button>
                                </div>

                                {/* Patient's reason */}
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-amber-400 mb-1.5 flex items-center gap-1.5"><AlertTriangle size={10} /> Patient's Reason</p>
                                    <p className="text-xs text-amber-800 font-bold leading-relaxed">{selectedRequest.reason}</p>
                                    {selectedRequest.bankName && (
                                        <div className="mt-2.5 pt-2.5 border-t border-amber-200/50">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-amber-400 mb-0.5">Bank Details</p>
                                            <p className="text-xs text-amber-800 font-bold">{selectedRequest.bankName} • {selectedRequest.accountNumber} • {selectedRequest.accountHolderName}</p>
                                        </div>
                                    )}
                                    {selectedRequest.qrCodeUrl && (
                                        <div className="mt-3 pt-3 border-t border-amber-200/50">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-2">QR Code</p>
                                            <img src={selectedRequest.qrCodeUrl} alt="Bank QR" className="w-32 h-32 object-contain rounded-xl border border-amber-200/50 bg-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-5">
                                    {/* Status select */}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Update Status</label>
                                        <select
                                            value={processForm.status}
                                            onChange={e => setProcessForm({ ...processForm, status: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500"
                                        >
                                            <option value="PROCESSING">Processing</option>
                                            <option value="COMPLETED">Completed (Refund Done)</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                    </div>

                                    {/* Proof upload */}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Refund Proof (Screenshot / Receipt)</label>
                                        <div className="flex items-center gap-4">
                                            <label className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition-all text-sm font-bold text-slate-400">
                                                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleProofUpload} />
                                                {isUploading ? (
                                                    <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                                                ) : processForm.proofUrl ? (
                                                    <><CheckCircle2 size={18} className="text-emerald-500" /> Proof Uploaded</>
                                                ) : (
                                                    <><Upload size={18} /> Upload Proof</>
                                                )}
                                            </label>
                                            {processForm.proofUrl && (
                                                <button
                                                    onClick={() => setPreviewUrl(processForm.proofUrl)}
                                                    className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-200/50"
                                                    title="Preview uploaded proof"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Admin notes */}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Admin Notes (visible to patient)</label>
                                        <textarea
                                            rows={3}
                                            placeholder="e.g. Refunded via bank transfer on Mar 21..."
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                                            value={processForm.adminNotes}
                                            onChange={e => setProcessForm({ ...processForm, adminNotes: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-2">
                                        <button onClick={() => setProcessModalOpen(false)} className="flex-1 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400 bg-slate-50 rounded-2xl">Cancel</button>
                                        <button
                                            onClick={handleProcess}
                                            disabled={isProcessing}
                                            className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${processForm.status === "COMPLETED" ? "bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600" :
                                                processForm.status === "REJECTED" ? "bg-red-500 text-white shadow-red-200 hover:bg-red-600" :
                                                    "bg-blue-500 text-white shadow-blue-200 hover:bg-blue-600"
                                                }`}
                                        >
                                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                            {processForm.status === "COMPLETED" ? "Confirm Refund" : processForm.status === "REJECTED" ? "Reject Request" : "Save Progress"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AssetPreviewModal
                url={previewUrl}
                title="Refund Proof"
                type="image"
                onClose={() => setPreviewUrl(null)}
            />
        </div>
    );
}
