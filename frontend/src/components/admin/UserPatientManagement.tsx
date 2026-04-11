import { Search, Trash2, Filter, UserCheck, Edit3, X, Loader2, FileDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Pagination } from "./Pagination";
import { useAuth } from "@/contexts/AuthProvider";
import { apiClient } from "@/apis/apis";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmModal } from "./ConfirmModal";

interface UserPatientManagementProps {
    tab: string;
    search: string;
    setSearch: (s: string) => void;
    users: any[];
    patients: any[];
    onDelete: (type: string, id: number) => void;
    onExport?: () => void;
}

export function UserPatientManagement({
    tab,
    search,
    setSearch,
    users,
    patients,
    onDelete,
    onExport
}: UserPatientManagementProps) {
    const auth = useAuth();
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const [showEditModal, setShowEditModal] = useState(false);
    const [editType, setEditType] = useState<'users' | 'patients' | null>(null);
    const [editingItem, setEditingItem] = useState<any>({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean; title: string; message: string; onConfirm: () => void; type: 'DANGER' | 'WARNING' | 'INFO';
    }>({ show: false, title: "", message: "", onConfirm: () => { }, type: 'INFO' });

    const openEdit = (type: 'users' | 'patients', item: any) => {
        setEditType(type);
        setEditingItem({ ...item });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await apiClient.put(`/api/admin/${editType}/${editingItem.id}`, editingItem);
            toast.success("Successfully updated!");
            setShowEditModal(false);
            window.location.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Update failed");
        } finally {
            setIsUpdating(false);
        }
    };

    // Reset pagination on search or filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, roleFilter]);

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.firstName + " " + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const filteredPatients = patients.filter(p =>
        (p.firstName + " " + p.lastName).toLowerCase().includes(search.toLowerCase()) ||
        p.user?.email?.toLowerCase().includes(search.toLowerCase())
    );

    const items = tab === 'USERS' ? filteredUsers : filteredPatients;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const paginatedItems = items.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3">
                <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input
                            type="text"
                            placeholder={`Search ${tab.toLowerCase()} by name or email...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border-none rounded-lg text-xs focus:ring-4 focus:ring-rose-500/5 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                        />
                    </div>
                </div>

                {tab === 'USERS' && (
                    <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 min-w-[180px]">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border-none rounded-lg text-[10px] font-black text-slate-700 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-all uppercase tracking-widest"
                            >
                                <option value="ALL">All Roles</option>
                                <option value="ADMIN">Admin</option>
                                <option value="DOCTOR">Doctor</option>
                                <option value="USER">User</option>
                            </select>
                        </div>
                    </div>
                )}
                {onExport && (
                    <button 
                        onClick={onExport}
                        className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center gap-2 group"
                        title="Export to PDF"
                    >
                        <FileDown size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest pr-2 hidden md:inline">Export</span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-3 py-2 text-[9px] uppercase font-black tracking-widest text-slate-400">Name</th>
                                <th className="px-3 py-2 text-[9px] uppercase font-black tracking-widest text-slate-400">{tab === 'USERS' ? 'Email Address' : 'User Owner'}</th>
                                <th className="px-3 py-2 text-[9px] uppercase font-black tracking-widest text-slate-400">{tab === 'USERS' ? 'Role' : 'Info'}</th>
                                <th className="px-3 py-2 text-[9px] uppercase font-black tracking-widest text-slate-400">{tab === 'USERS' ? 'Joined' : 'Gender/Age'}</th>
                                <th className="px-3 py-2 text-[9px] uppercase font-black tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedItems.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">
                                        No entries found
                                    </td>
                                </tr>
                            )}
                            {tab === 'USERS' ? paginatedItems.map((u: any) => (
                                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            {u.profilePicture ? (
                                                <img src={u.profilePicture} className="w-7 h-7 rounded-lg object-cover shadow-sm" alt={u.firstName} />
                                            ) : (
                                                <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 font-black text-[9px]">{(u.firstName || 'U')[0]}</div>
                                            )}
                                            <p className="font-bold text-slate-900 text-xs">{u.firstName} {u.lastName}</p>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 font-bold text-slate-500 text-xs">{u.email}</td>
                                    <td className="px-3 py-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-slate-900 text-white shadow-md shadow-slate-200' : u.role === 'DOCTOR' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>{u.role}</span>
                                    </td>
                                    <td className="px-3 py-2 font-bold text-slate-400 text-[10px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="px-3 py-2 text-right">
                                        {u.id === auth?.user?.id ? (
                                            <span className="p-1 text-emerald-500 font-black text-[8px] uppercase tracking-widest inline-flex items-center justify-end gap-1">
                                                <UserCheck size={10} />
                                                Active
                                            </span>
                                        ) : (
                                            <div className="flex justify-end gap-1 flex-nowrap">
                                                <button onClick={() => openEdit('users', u)} className="p-1 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all border border-transparent hover:border-slate-200" title="Edit User">
                                                    <Edit3 size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => setConfirmModal({
                                                        show: true,
                                                        title: "Terminate User",
                                                        message: `Are you sure you want to remove ${u.firstName} ${u.lastName}? This will disable their system-wide access.`,
                                                        type: 'DANGER',
                                                        onConfirm: () => onDelete('users', u.id)
                                                    })} 
                                                    className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all border border-transparent hover:border-rose-100" 
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : paginatedItems.map((p: any) => (
                                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-3 py-2">
                                        <p className="font-bold text-slate-900 text-xs">{p.firstName} {p.lastName}</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Patient Profile</p>
                                    </td>
                                    <td className="px-3 py-2">
                                        <p className="font-bold text-slate-700 text-xs">{p.user?.firstName} {p.user?.lastName}</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{p.user?.email}</p>
                                    </td>
                                    <td className="px-3 py-2 font-bold text-slate-700 text-[10px]">
                                        {p.district}, {p.municipality}
                                        <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.1em] mt-0.5">Location Registry</p>
                                    </td>
                                    <td className="px-3 py-2 font-black text-rose-500 text-[9px] uppercase tracking-widest">
                                        {p.gender} • {p.age || 'N/A'} YRS
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <div className="flex justify-end gap-1 flex-nowrap">
                                            <button onClick={() => openEdit('patients', p)} className="p-1 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all border border-transparent hover:border-slate-200" title="Edit Patient">
                                                <Edit3 size={12} />
                                            </button>
                                            <button 
                                                onClick={() => setConfirmModal({
                                                    show: true,
                                                    title: "Remove Patient Registry",
                                                    message: `Are you sure you want to delete the record of ${p.firstName} ${p.lastName}? Important clinical history might be detached.`,
                                                    type: 'DANGER',
                                                    onConfirm: () => onDelete('patients', p.id)
                                                })} 
                                                className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all border border-transparent hover:border-rose-100" 
                                                title="Delete Patient"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={items.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
            
            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100"
                        >
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-900 shadow-sm border border-slate-100">
                                        <Edit3 size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900">Edit {editType === 'users' ? 'User' : 'Patient'}</h3>
                                        <p className="text-[8px] uppercase font-black tracking-widest text-slate-400 mt-0.5">Modify Personnel Record</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors bg-white p-1.5 rounded-lg shadow-sm border border-slate-100 hover:border-rose-100 hover:bg-rose-50">
                                    <X size={16} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleEditSubmit} className="p-6 space-y-5 text-xs font-bold bg-white">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] uppercase font-black tracking-widest text-slate-400 ml-1">First Name</label>
                                        <input type="text" value={editingItem.firstName || ""} onChange={(e) => setEditingItem({...editingItem, firstName: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-700" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] uppercase font-black tracking-widest text-slate-400 ml-1">Last Name</label>
                                        <input type="text" value={editingItem.lastName || ""} onChange={(e) => setEditingItem({...editingItem, lastName: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-700" required />
                                    </div>
                                </div>
                                
                                {editType === 'users' && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[8px] uppercase font-black tracking-widest text-slate-400 ml-1">Email Address</label>
                                            <input type="email" value={editingItem.email || ""} onChange={(e) => setEditingItem({...editingItem, email: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-700" required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[8px] uppercase font-black tracking-widest text-slate-400 ml-1">Role Type</label>
                                            <select value={editingItem.role || "USER"} onChange={(e) => setEditingItem({...editingItem, role: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-black text-slate-700 appearance-none cursor-pointer">
                                                <option value="USER">User (Standard)</option>
                                                <option value="DOCTOR">Doctor</option>
                                                <option value="ADMIN">Administrator</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                
                                {editType === 'patients' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] uppercase font-black tracking-widest text-slate-400 ml-1">Gender</label>
                                                <select value={editingItem.gender || "Male"} onChange={(e) => setEditingItem({...editingItem, gender: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-black text-slate-700 appearance-none cursor-pointer">
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] uppercase font-black tracking-widest text-slate-400 ml-1">Ward Number</label>
                                                <input type="number" value={editingItem.wardNo || ""} onChange={(e) => setEditingItem({...editingItem, wardNo: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-700" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] uppercase font-black tracking-widest text-slate-400 ml-1">District</label>
                                                <input type="text" value={editingItem.district || ""} onChange={(e) => setEditingItem({...editingItem, district: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-700" required />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] uppercase font-black tracking-widest text-slate-400 ml-1">Municipality</label>
                                                <input type="text" value={editingItem.municipality || ""} onChange={(e) => setEditingItem({...editingItem, municipality: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-700" required />
                                            </div>
                                        </div>
                                    </>
                                )}
                                
                                <div className="pt-4 flex items-center gap-3 border-t border-slate-50">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">Cancel</button>
                                    <button type="submit" disabled={isUpdating} className="flex-[2] px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] uppercase tracking-widest font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200 disabled:opacity-50">
                                        {isUpdating ? <Loader2 size={12} className="animate-spin text-slate-300" /> : <Edit3 size={12} className="text-slate-300" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <ConfirmModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}
