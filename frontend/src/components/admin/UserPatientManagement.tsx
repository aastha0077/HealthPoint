import { Search, Trash2, Filter, UserCheck, Edit3, X, Loader2, FileDown, Mail, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Pagination } from "./Pagination";
import { useAuth } from "@/contexts/AuthProvider";
import { apiClient } from "@/apis/apis";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmModal } from "./ConfirmModal";
import { TableStatsRow, type StatItem } from "./TableStatsRow";
import { ExportDropdown } from "@/components/common/ExportDropdown";


interface UserPatientManagementProps {
    tab: string;
    search: string;
    setSearch: (s: string) => void;
    users: any[];
    patients: any[];
    onDelete: (type: string, id: number) => void;
    onExport?: (title: string, columns: string[], data: any[]) => void;
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

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const EMAIL_TEMPLATES = [
        { label: "System Maintenance", subject: "HealthPoint: System Maintenance Notification", message: "Dear User,\n\nPlease be advised that HealthPoint will be undergoing scheduled maintenance. Some services might be temporarily unavailable. We apologize for any inconvenience.\n\nRegards,\nHealthPoint Administration" },
        { label: "Account Update", subject: "HealthPoint: Account Security Update", message: "Dear User,\n\nWe require you to review your account settings as part of our routine security audit. Please log in to your profile to ensure your information is up to date.\n\nRegards,\nHealthPoint Administration" }
    ];

    const applyTemplate = (tpl: any) => {
        setEmailSubject(tpl.subject);
        setEmailMessage(tpl.message);
    };

    const getRecipientEmail = () => {
        if (!selectedUser) return "";
        return tab === 'USERS' ? selectedUser.email : selectedUser.user?.email;
    };

    const getRecipientName = () => {
        if (!selectedUser) return "";
        return tab === 'USERS' ? `${selectedUser.firstName} ${selectedUser.lastName}` : `${selectedUser.user?.firstName || selectedUser.firstName} ${selectedUser.user?.lastName || selectedUser.lastName}`;
    };

    const handleSendEmail = async () => {
        if (!emailSubject || !emailMessage || !selectedUser) return;
        setIsSending(true);
        try {
            const toEmail = getRecipientEmail();
            if (!toEmail) {
                toast.error("No valid email address found for this user");
                setIsSending(false);
                return;
            }
            await apiClient.post("/api/admin/send-email", {
                to: toEmail,
                subject: emailSubject,
                message: emailMessage
            });
            toast.success("Dispatch Sent Effectively");
            setShowEmailModal(false);
            setEmailSubject("");
            setEmailMessage("");
        } catch {
            toast.error("Dispatch Failed");
        } finally {
            setIsSending(false);
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

    const stats: StatItem[] = tab === 'USERS' ? [
        { label: "Total Staff", value: users.length, color: "slate" },
        { label: "Administrators", value: users.filter(u => u.role === 'ADMIN').length, color: "blue" },
        { label: "Clinical Doctors", value: users.filter(u => u.role === 'DOCTOR').length, color: "emerald" },
        { label: "General Staff", value: users.filter(u => u.role === 'USER').length, color: "amber" }
    ] : [
        { label: "Total Registry", value: patients.length, color: "slate" },
        { label: "Male Patients", value: patients.filter(p => p.gender === 'Male').length, color: "blue" },
        { label: "Female Patients", value: patients.filter(p => p.gender === 'Female').length, color: "rose" },
        { label: "Other", value: patients.filter(p => p.gender === 'Other').length, color: "violet" }
    ];

    return (
        <div className="space-y-6">
            <TableStatsRow stats={stats} />
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
                    <ExportDropdown 
                        onExportAll={() => onExport(
                            tab === 'USERS' ? "Complete User Directory" : "Complete Patient Records",
                            tab === 'USERS' ? ["ID", "Name", "Email", "Role"] : ["ID", "Name", "Gender", "Location"],
                            tab === 'USERS' 
                                ? filteredUsers.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email, role: u.role }))
                                : filteredPatients.map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}`, gender: p.gender, location: `${p.municipality}, ${p.district}` }))
                        )}
                        onExportPage={() => onExport(
                            tab === 'USERS' ? "User Directory (Page)" : "Patient Records (Page)",
                            tab === 'USERS' ? ["ID", "Name", "Email", "Role"] : ["ID", "Name", "Gender", "Location"],
                            paginatedItems.map((item: any) => tab === 'USERS' 
                                ? { id: item.id, name: `${item.firstName} ${item.lastName}`, email: item.email, role: item.role }
                                : { id: item.id, name: `${item.firstName} ${item.lastName}`, gender: item.gender, location: `${item.municipality}, ${item.district}` }
                            )
                        )}
                    />
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-3 py-1.5 text-[8px] uppercase font-black tracking-widest text-slate-400">Name</th>
                                <th className="px-3 py-1.5 text-[8px] uppercase font-black tracking-widest text-slate-400">{tab === 'USERS' ? 'Email' : 'User Owner'}</th>
                                <th className="px-3 py-1.5 text-[8px] uppercase font-black tracking-widest text-slate-400">{tab === 'USERS' ? 'Role' : 'Info'}</th>
                                <th className="px-3 py-1.5 text-[8px] uppercase font-black tracking-widest text-slate-400">{tab === 'USERS' ? 'Joined' : 'Gender/Age'}</th>
                                <th className="px-3 py-1.5 text-[8px] uppercase font-black tracking-widest text-slate-400 text-right">Actions</th>
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
                                    <td className="px-3 py-1.5">
                                        <div className="flex items-center gap-2">
                                            {u.profilePicture ? (
                                                <img src={u.profilePicture} className="w-6 h-6 rounded-md object-cover" alt={u.firstName} />
                                            ) : (
                                                <div className="w-6 h-6 bg-rose-50 rounded-md flex items-center justify-center text-rose-500 font-black text-[8px]">{(u.firstName || 'U')[0]}</div>
                                            )}
                                            <p className="font-bold text-slate-900 text-[11px]">{u.firstName} {u.lastName}</p>
                                        </div>
                                    </td>
                                    <td className="px-3 py-1.5 font-bold text-slate-500 text-[11px]">{u.email}</td>
                                    <td className="px-3 py-1.5">
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-slate-900 text-white shadow-md shadow-slate-200' : u.role === 'DOCTOR' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>{u.role}</span>
                                    </td>
                                    <td className="px-3 py-1.5 font-bold text-slate-400 text-[10px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="px-3 py-1.5 text-right">
                                        {u.id === auth?.user?.id ? (
                                            <span className="p-1 text-emerald-500 font-black text-[8px] uppercase tracking-widest inline-flex items-center justify-end gap-1">
                                                <UserCheck size={10} />
                                                Active
                                            </span>
                                        ) : (
                                            <div className="flex justify-end gap-1 flex-nowrap">
                                                <button onClick={() => { setSelectedUser(u); setShowEmailModal(true); }} className="p-1 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all border border-transparent hover:border-indigo-100" title="Send Email">
                                                    <Mail size={12} />
                                                </button>
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
                                    <td className="px-3 py-1.5">
                                        <p className="font-bold text-slate-900 text-[11px]">{p.firstName} {p.lastName}</p>
                                        <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">Patient</p>
                                    </td>
                                    <td className="px-3 py-1.5">
                                        <p className="font-bold text-slate-700 text-[11px]">{p.user?.firstName} {p.user?.lastName}</p>
                                        <p className="text-[7px] text-slate-400 font-bold uppercase">{p.user?.email}</p>
                                    </td>
                                    <td className="px-3 py-1.5 font-bold text-slate-700 text-[10px]">
                                        {p.district}, {p.municipality}
                                    </td>
                                    <td className="px-3 py-1.5 font-black text-rose-500 text-[8px] uppercase tracking-widest">
                                        {p.gender} • {p.age || 'N/A'}
                                    </td>
                                    <td className="px-3 py-1.5 text-right">
                                        <div className="flex justify-end gap-1 flex-nowrap">
                                            <button onClick={() => { setSelectedUser(p); setShowEmailModal(true); }} className="p-1 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all border border-transparent hover:border-indigo-100" title="Send Email">
                                                <Mail size={12} />
                                            </button>
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

            {/* Email Dispatch Modal */}
            <AnimatePresence>
                {showEmailModal && selectedUser && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-20 bg-slate-900/40 backdrop-blur-2xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="bg-white rounded-[4rem] shadow-3xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-12 py-10 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white/10 rounded-[1.75rem] flex items-center justify-center border border-white/10 backdrop-blur-md">
                                        <Mail size={32} className="text-rose-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tight">{tab === 'USERS' ? 'User Dispatch' : 'Patient Dispatch'}</h3>
                                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] mt-1">Official Communication Protocol</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowEmailModal(false)}
                                    className="w-14 h-14 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-3xl transition-all border border-white/10 flex items-center justify-center group relative z-10 shadow-sm"
                                >
                                    <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-12 py-10 space-y-10 custom-scrollbar">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient Identity</p>
                                            <p className="text-sm font-black text-slate-900">{getRecipientName()}</p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 bg-white rounded-xl border border-slate-200">
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{getRecipientEmail()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles size={16} className="text-amber-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rapid Response Templates</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {EMAIL_TEMPLATES.map((tpl, i) => (
                                            <button
                                                key={i}
                                                onClick={() => applyTemplate(tpl)}
                                                className="px-5 py-4 bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 rounded-2xl text-left transition-all group"
                                            >
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1 group-hover:text-indigo-600 transition-colors">{tpl.label}</p>
                                                <p className="text-[8px] font-bold text-slate-400 line-clamp-1">{tpl.subject}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-8 pt-4">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Communication Subject</label>
                                        <input
                                            type="text"
                                            value={emailSubject}
                                            onChange={(e) => setEmailSubject(e.target.value)}
                                            placeholder="Enter high-priority subject line..."
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[1.5rem] p-5 text-sm font-black text-slate-900 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Dispatch Narrative Content</label>
                                        <textarea
                                            value={emailMessage}
                                            onChange={(e) => setEmailMessage(e.target.value)}
                                            placeholder="Formulate official message context here..."
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[2.5rem] p-8 text-sm font-bold text-slate-700 outline-none min-h-[200px] transition-all leading-relaxed placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="px-12 py-10 bg-slate-50/50 border-t border-slate-100 flex items-center gap-6">
                                <button
                                    onClick={() => setShowEmailModal(false)}
                                    className="flex-1 py-5 rounded-[2rem] text-slate-400 font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-slate-900 transition-all border-2 border-transparent hover:border-slate-200"
                                >
                                    Abort Dispatch
                                </button>
                                <button
                                    onClick={handleSendEmail}
                                    disabled={isSending}
                                    className="flex-[2] py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isSending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                                    Execute Dispatch
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
