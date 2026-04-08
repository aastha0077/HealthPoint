import { useState, useEffect } from "react";
import { AlignLeft, Plus, Trash2, Edit2, XCircle, FileDown } from "lucide-react";
import { apiClient } from "@/apis/apis";
import toast from "react-hot-toast";
import { ConfirmModal } from "./ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";

interface DepartmentViewProps {
    onExport?: () => void;
}

export function DepartmentView({ onExport }: DepartmentViewProps) {
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean; title: string; message: string; onConfirm: () => void; type: 'DANGER' | 'WARNING' | 'INFO';
    }>({ show: false, title: "", message: "", onConfirm: () => { }, type: 'INFO' });
    const [mergeModal, setMergeModal] = useState({ show: false, sourceId: 0, sourceName: "" });
    const [targetDeptId, setTargetDeptId] = useState<string>("");
    const [isMerging, setIsMerging] = useState(false);

    const fetchDepartments = async () => {
        try {
            const res = await apiClient.get("/api/departments");
            setDepartments(res.data || []);
        } catch {
            toast.error("Failed to load departments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await apiClient.put(`/api/departments/${editingId}`, { name, description });
                toast.success("Speciality updated!");
            } else {
                await apiClient.post("/api/departments", { name, description });
                toast.success("Department created!");
            }
            resetForm();
            fetchDepartments();
        } catch {
            toast.error(editingId ? "Failed to update" : "Failed to create");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await apiClient.delete(`/api/departments/${id}`);
            toast.success("Department removed");
            fetchDepartments();
            if (editingId === id) resetForm();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || "Failed to remove department";
            if (errorMsg.includes("assigned")) {
                const dept = departments.find(d => d.id === id);
                setMergeModal({ show: true, sourceId: id, sourceName: dept?.name || "this unit" });
            } else {
                toast.error(errorMsg);
            }
        }
    };

    const handleMergeAndDelete = async () => {
        if (!targetDeptId) return toast.error("Please select a target specialty");
        setIsMerging(true);
        try {
            // 1. Reassign doctors
            await apiClient.post(`/api/admin/departments/${mergeModal.sourceId}/reassign-doctors`, { 
                targetId: parseInt(targetDeptId) 
            });
            // 2. Delete department
            await apiClient.delete(`/api/departments/${mergeModal.sourceId}`);
            toast.success("Specialties merged and unit removed");
            setMergeModal({ show: false, sourceId: 0, sourceName: "" });
            setTargetDeptId("");
            fetchDepartments();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Merge operation failed");
        } finally {
            setIsMerging(false);
        }
    };

    const startEdit = (dept: any) => {
        setEditingId(dept.id);
        setName(dept.name);
        setDescription(dept.description);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setDescription("");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Practice Specialities</h3>
                            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-[0.3em] mt-1">Medical Departments</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {onExport && (
                                <button 
                                    onClick={onExport}
                                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm hover:text-rose-500 transition-colors"
                                    title="Export Specials Registry"
                                >
                                    <FileDown size={20} />
                                </button>
                            )}
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                                <AlignLeft size={20} />
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[650px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-20 text-center">
                                <div className="w-10 h-10 border-4 border-rose-500/10 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling Units...</p>
                            </div>
                        ) : departments.map((dept, idx) => (
                            <div key={dept.id} className="px-8 py-5 flex items-center justify-between group hover:bg-slate-50/50 transition-all border-l-4 border-transparent hover:border-rose-500">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 font-black text-lg group-hover:scale-110 transition-transform shadow-sm border border-rose-100">
                                        {dept.name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-base font-black text-slate-900 truncate tracking-tight">{dept.name}</h4>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase tracking-widest">#{idx + 1}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed truncate max-w-md italic">"{dept.description}"</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{dept.doctorCount || 0} Professional{dept.doctorCount !== 1 ? 's' : ''}</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{dept.appointmentCount || 0} Procedure{dept.appointmentCount !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button 
                                        onClick={() => startEdit(dept)}
                                        className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                        title="Configure Unit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => setConfirmModal({
                                            show: true,
                                            title: "Dismantle Specialty Unit",
                                            message: `Confirm removal of the ${dept.name} unit. This action will detach all associated personnel and patient record links.`,
                                            type: 'DANGER',
                                            onConfirm: () => handleDelete(dept.id)
                                        })} 
                                        className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
                                        title="Dismantle Unit"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!loading && departments.length === 0 && (
                            <div className="p-20 text-center opacity-30">
                                <AlignLeft size={48} className="mx-auto mb-4" />
                                <p className="text-xs font-black uppercase tracking-[0.3em]">No Units Established</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className={`${editingId ? 'bg-indigo-900 ring-4 ring-indigo-500/20' : 'bg-slate-900'} rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <div className={`${editingId ? 'bg-indigo-500' : 'bg-rose-600'} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20`}>
                                    {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
                                </div>
                                {editingId ? "Update Unit" : "New Speciality"}
                            </h3>
                            {editingId && (
                                <button onClick={resetForm} className="text-indigo-300 hover:text-white transition-colors">
                                    <XCircle size={24} />
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Speciality Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Neurosurgery"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`${editingId ? 'bg-indigo-800/50' : 'bg-slate-800/50'} w-full border border-white/5 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-rose-500/20 outline-none transition-all placeholder:text-slate-500`}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Practice Description</label>
                                <textarea
                                    placeholder="Brief overview of clinical focus..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`${editingId ? 'bg-indigo-800/50' : 'bg-slate-800/50'} w-full border border-white/5 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-rose-500/20 outline-none min-h-[150px] transition-all resize-none placeholder:text-slate-500`}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                className={`w-full py-4 ${editingId ? 'bg-white text-indigo-900' : 'bg-rose-600 text-white'} rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/20 mt-4`}
                            >
                                {editingId ? "Commit Changes" : "Establish Department"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Unit Protocol</h4>
                    <ul className="space-y-4">
                        {[
                            "All titles must be professional",
                            "Description informs patient triage",
                            "Deleting removes only the entity",
                            "Linked records remain archived"
                        ].map((t, i) => (
                            <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                {t}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <ConfirmModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
            />

            {/* Merge & Delete Modal */}
            <AnimatePresence>
                {mergeModal.show && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                            onClick={() => !isMerging && setMergeModal({ show: false, sourceId: 0, sourceName: "" })}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 max-w-md w-full relative z-10"
                        >
                            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6 border border-rose-100 mx-auto">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 text-center mb-3 tracking-tight">Active Unit Detected</h3>
                            <p className="text-slate-500 text-center text-sm font-medium mb-8 leading-relaxed px-4">
                                You cannot delete <span className="font-black text-slate-900">"{mergeModal.sourceName}"</span> while personnel are assigned to it. Select a new specialty for these professionals to continue:
                            </p>

                            <div className="space-y-6 mb-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Specialty</label>
                                    <select 
                                        value={targetDeptId}
                                        onChange={(e) => setTargetDeptId(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-rose-500/10 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Choose Replacement Specialty...</option>
                                        {departments.filter(d => d.id !== mergeModal.sourceId).map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handleMergeAndDelete}
                                    disabled={!targetDeptId || isMerging}
                                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-rose-700 transition-all shadow-xl shadow-rose-900/20 disabled:opacity-50 disabled:grayscale"
                                >
                                    {isMerging ? "Reassigning & Removing..." : "Reassign & Delete Unit"}
                                </button>
                                <button 
                                    onClick={() => setMergeModal({ show: false, sourceId: 0, sourceName: "" })}
                                    className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100"
                                >
                                    Abort Operation
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
