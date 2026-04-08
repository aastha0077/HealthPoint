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
            <div className="flex flex-col md:flex-row gap-4">
                <div className="bg-white p-2 rounded-[1.5rem] shadow-sm border border-slate-200 flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            type="text"
                            placeholder={`Search ${tab.toLowerCase()} by name or email...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-4 focus:ring-rose-500/5 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                        />
                    </div>
                </div>

                {tab === 'USERS' && (
                    <div className="bg-white p-2 rounded-[1.5rem] shadow-sm border border-slate-200 min-w-[200px]">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-black text-slate-700 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-all uppercase tracking-widest"
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
                        className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-200 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center gap-2 group"
                        title="Export to PDF"
                    >
                        <FileDown size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest pr-2 hidden md:inline">Export</span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 h-8">
                                <th className="px-4 py-3 text-xs uppercase font-black tracking-widest text-slate-400">Name</th>
                                <th className="px-4 py-3 text-xs uppercase font-black tracking-widest text-slate-400">{tab === 'USERS' ? 'Email Address' : 'User Owner'}</th>
                                <th className="px-4 py-3 text-xs uppercase font-black tracking-widest text-slate-400">{tab === 'USERS' ? 'Role' : 'Info'}</th>
                                <th className="px-4 py-3 text-xs uppercase font-black tracking-widest text-slate-400">{tab === 'USERS' ? 'Joined' : 'Gender/Age'}</th>
                                <th className="px-4 py-3 text-xs uppercase font-black tracking-widest text-slate-400 text-right">Actions</th>
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
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {u.profilePicture ? (
                                                <img src={u.profilePicture} className="w-8 h-8 rounded-xl object-cover shadow-sm" alt={u.firstName} />
                                            ) : (
                                                <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 font-black text-[10px]">{(u.firstName || 'U')[0]}</div>
                                            )}
                                            <p className="font-bold text-slate-900 text-[13px]">{u.firstName} {u.lastName}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-slate-500 text-[13px]">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-slate-900 text-white shadow-md shadow-slate-200' : u.role === 'DOCTOR' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>{u.role}</span>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-slate-400 text-[11px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        {u.id === auth?.user?.id ? (
                                            <span className="p-1.5 text-emerald-500 font-black text-[9px] uppercase tracking-widest inline-flex items-center justify-end gap-1.5">
                                                <UserCheck size={12} />
                                                Active
                                            </span>
                                        ) : (
                                            <div className="flex justify-end gap-1.5 flex-nowrap">
                                                <button onClick={() => openEdit('users', u)} className="p-1.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all border border-transparent hover:border-slate-200" title="Edit User">
                                                    <Edit3 size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => setConfirmModal({
                                                        show: true,
                                                        title: "Terminate User",
                                                        message: `Are you sure you want to remove ${u.firstName} ${u.lastName}? This will disable their system-wide access.`,
                                                        type: 'DANGER',
                                                        onConfirm: () => onDelete('users', u.id)
                                                    })} 
                                                    className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all border border-transparent hover:border-rose-100" 
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : paginatedItems.map((p: any) => (
                                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-900 text-[13px]">{p.firstName} {p.lastName}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Patient Profile</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-700 text-[13px]">{p.user?.firstName} {p.user?.lastName}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{p.user?.email}</p>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-slate-700 text-[11px]">
                                        {p.district}, {p.municipality}
                                        <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.1em] mt-0.5">Location Registry</p>
                                    </td>
                                    <td className="px-4 py-3 font-black text-rose-500 text-[10px] uppercase tracking-widest">
                                        {p.gender} • {p.age || 'N/A'} YRS
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1.5 flex-nowrap">
                                            <button onClick={() => openEdit('patients', p)} className="p-1.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all border border-transparent hover:border-slate-200" title="Edit Patient">
                                                <Edit3 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => setConfirmModal({
                                                    show: true,
                                                    title: "Remove Patient Registry",
                                                    message: `Are you sure you want to delete the record of ${p.firstName} ${p.lastName}? Important clinical history might be detached.`,
                                                    type: 'DANGER',
                                                    onConfirm: () => onDelete('patients', p.id)
                                                })} 
                                                className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all border border-transparent hover:border-rose-100" 
                                                title="Delete Patient"
                                            >
                                                <Trash2 size={14} />
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
                            className="bg-white rounded-[2rem] shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100"
                        >
                            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm border border-slate-100">
                                        <Edit3 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">Edit {editType === 'users' ? 'User' : 'Patient'}</h3>
                                        <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mt-0.5">Modify Personnel Record</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors bg-white p-2 rounded-xl shadow-sm border border-slate-100 hover:border-rose-100 hover:bg-rose-50">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleEditSubmit} className="p-8 space-y-6 text-sm font-bold bg-white">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">First Name</label>
                                        <input type="text" value={editingItem.firstName || ""} onChange={(e) => setEditingItem({...editingItem, firstName: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-700" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Last Name</label>
                                        <input type="text" value={editingItem.lastName || ""} onChange={(e) => setEditingItem({...editingItem, lastName: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-700" required />
                                    </div>
                                </div>
                                
                                {editType === 'users' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Email Address</label>
                                            <input type="email" value={editingItem.email || ""} onChange={(e) => setEditingItem({...editingItem, email: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-700" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Role Type</label>
                                            <select value={editingItem.role || "USER"} onChange={(e) => setEditingItem({...editingItem, role: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-black text-slate-700 appearance-none cursor-pointer">
                                                <option value="USER">User (Standard)</option>
                                                <option value="DOCTOR">Doctor</option>
                                                <option value="ADMIN">Administrator</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                
                                {editType === 'patients' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Gender</label>
                                                <select value={editingItem.gender || "Male"} onChange={(e) => setEditingItem({...editingItem, gender: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-black text-slate-700 appearance-none cursor-pointer">
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Ward Number</label>
                                                <input type="number" value={editingItem.wardNo || ""} onChange={(e) => setEditingItem({...editingItem, wardNo: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-700" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">District</label>
                                                <input type="text" value={editingItem.district || ""} onChange={(e) => setEditingItem({...editingItem, district: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-700" required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Municipality</label>
                                                <input type="text" value={editingItem.municipality || ""} onChange={(e) => setEditingItem({...editingItem, municipality: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-700" required />
                                            </div>
                                        </div>
                                    </>
                                )}
                                
                                <div className="pt-6 flex items-center gap-4 border-t border-slate-50">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">Cancel</button>
                                    <button type="submit" disabled={isUpdating} className="flex-[2] px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] uppercase tracking-widest font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200 disabled:opacity-50">
                                        {isUpdating ? <Loader2 size={16} className="animate-spin text-slate-300" /> : <Edit3 size={16} className="text-slate-300" />}
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
