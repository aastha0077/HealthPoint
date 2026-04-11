import { useState, useEffect } from "react";
import { AlignLeft, Plus, Trash2, Edit2, XCircle, FileDown, Activity, Building2, Stethoscope, ChevronDown } from "lucide-react";
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
    const [selectedDept, setSelectedDept] = useState<any>(null);
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
            if (res.data?.length > 0 && !selectedDept) setSelectedDept(res.data[0]);
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
            await apiClient.post(`/api/admin/departments/${mergeModal.sourceId}/reassign-doctors`, { 
                targetId: parseInt(targetDeptId) 
            });
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
    };

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setDescription("");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* List Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Practice Units</h3>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-0.5">Management Registry</p>
                        </div>
                    </div>
                    {onExport && (
                        <button onClick={onExport} className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-400 hover:text-rose-500 transition-all">
                            <FileDown size={18} />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {loading ? (
                        <div className="p-12 text-center text-slate-300 font-bold">Compiling Units...</div>
                    ) : departments.map((dept) => (
                        <motion.div
                            layout
                            key={dept.id}
                            className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
                                selectedDept?.id === dept.id 
                                ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-200' 
                                : 'bg-white border-slate-100 hover:border-rose-100'
                            }`}
                            onClick={() => setSelectedDept(dept)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                        selectedDept?.id === dept.id ? 'bg-white/10 text-white' : 'bg-rose-50 text-rose-500'
                                    }`}>
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-black transition-colors ${
                                            selectedDept?.id === dept.id ? 'text-white' : 'text-slate-900'
                                        }`}>{dept.name}</h4>
                                        <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${
                                            selectedDept?.id === dept.id ? 'text-slate-400' : 'text-slate-400'
                                        }`}>
                                            {dept.doctors?.length || 0} Specialised Personnel
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); startEdit(dept); }}
                                        className={`p-2 rounded-lg transition-all ${
                                            selectedDept?.id === dept.id ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white'
                                        }`}
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setConfirmModal({
                                            show: true,
                                            title: "Disband Department",
                                            message: `Are you sure you want to remove the ${dept.name} department? This will affect personnel access.`,
                                            type: 'DANGER',
                                            onConfirm: () => handleDelete(dept.id)
                                        }); }}
                                        className={`p-2 rounded-lg transition-all ${
                                            selectedDept?.id === dept.id ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' : 'bg-slate-50 text-slate-400 hover:bg-rose-600 hover:text-white'
                                        }`}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Form & Personnel Section */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/5">
                            <Plus size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">{editingId ? 'Configure Unit' : 'Establish Unit'}</h3>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Registry Module</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Nomenclature</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Cardiological Institute"
                                className="w-full bg-slate-50 border-2 border-transparent rounded-xl p-3 text-xs font-bold focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 focus:bg-white outline-none transition-all text-slate-700" 
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Directive / Bio</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe clinical scope..."
                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-xs font-bold focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 focus:bg-white outline-none min-h-[100px] transition-all text-slate-700 leading-relaxed resize-none"
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            {editingId && (
                                <button type="button" onClick={resetForm} className="flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100 shadow-sm">Reset</button>
                            )}
                            <button type="submit" disabled={loading} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 ${editingId ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-200 flex-1' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 w-full'}`}>
                                {loading ? 'Processing...' : editingId ? 'Synchronize Unit' : 'Affirm Department'}
                            </button>
                        </div>
                    </form>
                </div>

                {selectedDept && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mb-24 -mr-24 blur-2xl" />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Stethoscope size={20} className="text-rose-400" />
                                </div>
                                <h4 className="text-lg font-black">{selectedDept.name} Personnel</h4>
                            </div>
                            <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5">
                                {selectedDept.doctors?.length || 0} Staff
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            {selectedDept.doctors?.length > 0 ? selectedDept.doctors.map((doc: any) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl transition-all hover:bg-white/10">
                                    <div className="flex items-center gap-3">
                                        {doc.user?.profilePicture ? (
                                            <img src={doc.user.profilePicture} className="w-8 h-8 rounded-lg object-cover ring-2 ring-white/10" alt={doc.user.firstName} />
                                        ) : (
                                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/30"><Stethoscope size={16} /></div>
                                        )}
                                        <div>
                                            <p className="font-bold text-xs">Dr. {doc.user?.firstName} {doc.user?.lastName}</p>
                                            <p className="text-[9px] text-slate-400 font-medium">{doc.speciality}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 flex flex-col items-center justify-center gap-3 text-white/20 border-2 border-dashed border-white/10 rounded-2xl">
                                    <Activity size={24} />
                                    <p className="text-[9px] uppercase font-black">No personnel assigned</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
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
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isMerging && setMergeModal({ show: false, sourceId: 0, sourceName: "" })} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 max-w-sm w-full relative z-10 text-center">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-rose-100"><Trash2 size={24} /></div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Active Unit Context</h3>
                            <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed">Select a destination for personnel assigned to <span className="font-black text-rose-500">"{mergeModal.sourceName}"</span> before removal:</p>
                            <div className="relative mb-6">
                                <select value={targetDeptId} onChange={(e) => setTargetDeptId(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-black focus:ring-4 focus:ring-rose-500/10 outline-none transition-all appearance-none cursor-pointer">
                                    <option value="">Select Target...</option>
                                    {departments.filter(d => d.id !== mergeModal.sourceId).map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={handleMergeAndDelete} disabled={!targetDeptId || isMerging} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50"> Affirm Reassignment </button>
                                <button onClick={() => setMergeModal({ show: false, sourceId: 0, sourceName: "" })} className="w-full py-3 text-slate-400 font-black uppercase text-[10px] tracking-widest"> Abort </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
