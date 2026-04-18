import { Search, Stethoscope, Plus, Camera, Image as ImageIcon, Loader2, Edit3, X, Clock, ChevronDown, Trash2, LayoutGrid, List, Mail, Send, Sparkles, AlignLeft, FileText, FileDown, MessageSquare, Users, User } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/apis/apis";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "./Pagination";
import { ConfirmModal } from "./ConfirmModal";
import { TableStatsRow, type StatItem } from "./TableStatsRow";
import { ExportDropdown } from "@/components/common/ExportDropdown";
import { StaffChatOverlay } from "../chat/StaffChatOverlay";

const ALL_TIME_SLOTS = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00"
];

const EMAIL_TEMPLATES = [
    {
        label: "Performance Recognition",
        subject: "Excellence in Clinical Performance",
        message: "We have reviewed your recent consultation metrics and patient feedback. Your dedication to clinical excellence is highly valued. Keep up the exceptional work!"
    },
    {
        label: "Emergency Protocol Update",
        subject: "REVISED: Hospital Emergency Protocols",
        message: "Please be advised that the hospital's emergency response and patient triage protocols have been updated. Ensure you review the new documentation at the earliest convenience."
    },
    {
        label: "Administrative Briefing",
        subject: "Upcoming General Hospital Staff Meeting",
        message: "A mandatory general staff meeting is scheduled for next week. Important hospital-wide policy updates and structural adjustments will be discussed."
    },
    {
        label: "Holiday Operating Schedule",
        subject: "Holiday Period: Staffing Update",
        message: "The hospital will transition to a condensed operating schedule for the festive season. Please ensure all critical cases are handed over to the duty personnel as per the registry."
    }
];

interface DoctorManagementProps {
    allDoctors: any[];
    search: string;
    setSearch: (s: string) => void;
    doctorForm: any;
    setDoctorForm: (f: any) => void;
    departments: any[];
    handleDoctorSubmit: (e: React.FormEvent) => void;
    onDelete: (id: number) => void;
    onExport?: (title: string, columns: string[], data: any[]) => void;
}

export function DoctorManagement({
    allDoctors, search, setSearch, doctorForm, setDoctorForm, departments, handleDoctorSubmit, onDelete, onExport
}: DoctorManagementProps) {
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showMassEmailModal, setShowMassEmailModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'DANGER' | 'WARNING' | 'INFO';
    }>({
        show: false,
        title: "",
        message: "",
        onConfirm: () => { },
        type: 'INFO'
    });
    const [viewMode, setViewMode] = useState<'GRID' | 'TABLE' | 'MESSENGER'>('MESSENGER');
    const [activeMsgDoc, setActiveMsgDoc] = useState<any>(null);
    const [chatOverlayTarget, setChatOverlayTarget] = useState<{ id: number; title: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedSlots, setSelectedSlots] = useState<string[]>(
        doctorForm.timeSlots
            ? doctorForm.timeSlots.split(",").map((t: string) => t.trim()).filter(Boolean)
            : ["09:00", "10:00", "11:00"]
    );

    const syncSlots = (slots: string[]) => {
        setSelectedSlots(slots);
        setDoctorForm({ ...doctorForm, timeSlots: slots.join(",") });
    };

    const addSlot = (slot: string) => {
        if (!slot || selectedSlots.includes(slot)) return;
        syncSlots([...selectedSlots, slot].sort());
    };

    const removeSlot = (slot: string) => {
        syncSlots(selectedSlots.filter(s => s !== slot));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadProgress(0);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await apiClient.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setUploadProgress(progress);
                }
            });
            setDoctorForm({ ...doctorForm, profilePicture: res.data.fileUrl });
            toast.success("Image uploaded successfully!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const startEdit = (doc: any) => {
        const slots = doc.timeSlots || [];
        setIsEditing(true);
        setEditingId(doc.doctorId);
        setSelectedSlots(slots);
        setDoctorForm({
            firstName: doc.user?.firstName || doc.firstName,
            lastName: doc.user?.lastName || doc.lastName,
            email: doc.user?.email || doc.email,
            password: "",
            speciality: doc.speciality,
            departmentId: doc.departmentId,
            bio: doc.bio,
            timeSlots: slots.join(","),
            profilePicture: doc.user?.profilePicture || doc.profilePicture
        });
        setShowModal(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditingId(null);
        setShowModal(false);
        const defaultSlots = ["09:00", "10:00", "11:00"];
        setSelectedSlots(defaultSlots);
        setDoctorForm({
            firstName: "", lastName: "", email: "", password: "", speciality: "", bio: "",
            profilePicture: "", departmentId: departments[0]?.id || 1, timeSlots: defaultSlots.join(",")
        });
    };

    const handleMassEmailSend = async () => {
        if (!emailSubject || !emailMessage) {
            toast.error("Subject and Message required");
            return;
        }
        setIsSending(true);
        try {
            await apiClient.post("/api/admin/mass-email", {
                subject: emailSubject,
                message: emailMessage
            });
            toast.success("Mass dispatch successful");
            setShowMassEmailModal(false);
            setEmailSubject("");
            setEmailMessage("");
        } catch {
            toast.error("Mass dispatch failure");
        } finally {
            setIsSending(false);
        }
    };

    const onFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formWithSlots = { ...doctorForm, timeSlots: selectedSlots.join(",") };
        if (isEditing && editingId) {
            try {
                await apiClient.put(`/api/doctors/${editingId}`, {
                    ...formWithSlots,
                    departmentId: Number(formWithSlots.departmentId),
                    timeSlots: selectedSlots
                });
                toast.success("Doctor details updated!");
                cancelEdit();
                window.location.reload();
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Update failed");
            }
        } else {
            setDoctorForm(formWithSlots);
            handleDoctorSubmit(e);
            setShowModal(false);
        }
    };

    const handleSendEmail = async () => {
        if (!selectedDoctor || !emailSubject || !emailMessage) {
            toast.error("Complete the required fields");
            return;
        }
        setIsSending(true);
        try {
            await apiClient.post("/api/admin/send-email", {
                to: selectedDoctor.user?.email || selectedDoctor.email,
                subject: emailSubject,
                message: emailMessage
            });
            toast.success("Dispatch successful!");
            setShowEmailModal(false);
            setEmailSubject("");
            setEmailMessage("");
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Dispatch failed");
        } finally {
            setIsSending(false);
        }
    };

    const applyTemplate = (tpl: any) => {
        setEmailSubject(tpl.subject);
        setEmailMessage(tpl.message);
    };

    const doctorsList = allDoctors.filter(d => {
        const first = d?.user?.firstName || d?.firstName || "";
        const last = d?.user?.lastName || d?.lastName || "";
        const email = d?.user?.email || d?.email || "";
        const speciality = d?.speciality || "";
        return (first + " " + last).toLowerCase().includes(search.toLowerCase()) ||
            email.toLowerCase().includes(search.toLowerCase()) ||
            speciality.toLowerCase().includes(search.toLowerCase());
    });

    const totalPages = Math.ceil(doctorsList.length / itemsPerPage);
    const paginatedDoctors = doctorsList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        if (viewMode === 'MESSENGER' && paginatedDoctors.length > 0 && !activeMsgDoc) {
            setActiveMsgDoc(paginatedDoctors[0]);
        }
    }, [viewMode, paginatedDoctors, activeMsgDoc]);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const availableToAdd = ALL_TIME_SLOTS.filter(t => !selectedSlots.includes(t));

    const stats: StatItem[] = [
        { label: "Active Doctors", value: allDoctors.length, color: "slate" },
        { label: "Empty Bios", value: allDoctors.filter(d => !d.bio || d.bio.length < 10).length, color: "rose" },
        { label: "Avg Profile Complete", value: `${Math.round((allDoctors.filter(d => d.profilePicture).length / (allDoctors.length || 1)) * 100)}%`, color: "emerald" },
        { label: "Total Departments", value: departments.length, color: "blue" }
    ];

    return (
        <div className="space-y-6">
            <TableStatsRow stats={stats} />

            {/* Top Stats / Actions */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex-1 w-full max-w-lg">
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                            type="text" placeholder="Search by name, email or speciality..."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs focus:ring-4 focus:ring-rose-500/5 focus:bg-white transition-all font-bold text-slate-700 outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full xl:w-auto">
                    {/* View Switcher */}
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                        <button
                            onClick={() => setViewMode('MESSENGER')}
                            className={`p-2 rounded-lg transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${viewMode === 'MESSENGER' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <MessageSquare size={14} />
                            <span className="hidden sm:inline">Messenger</span>
                        </button>
                        <button
                            onClick={() => setViewMode('GRID')}
                            className={`p-2 rounded-lg transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${viewMode === 'GRID' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={14} />
                            <span className="hidden sm:inline">Cards</span>
                        </button>
                        <button
                            onClick={() => setViewMode('TABLE')}
                            className={`p-2 rounded-lg transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${viewMode === 'TABLE' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={14} />
                            <span className="hidden sm:inline">Table</span>
                        </button>
                    </div>

                    {onExport && (
                        <div className="flex-none">
                            <ExportDropdown 
                                className=""
                                onExportAll={() => onExport("Complete Doctor Registry", ["ID", "Name", "Speciality", "Email", "Degree"], doctorsList.map(d => ({
                                    id: d.doctorId || d.id,
                                    name: `Dr. ${d.firstName} ${d.lastName}`,
                                    speciality: d.speciality || 'N/A',
                                    email: d.email || 'N/A',
                                    degree: d.degree || 'N/A'
                                })))}
                                onExportPage={() => onExport("Doctor Registry (Current Page)", ["ID", "Name", "Speciality", "Email", "Degree"], paginatedDoctors.map(d => ({
                                    id: d.doctorId || d.id,
                                    name: `Dr. ${d.firstName} ${d.lastName}`,
                                    speciality: d.speciality || 'N/A',
                                    email: d.email || 'N/A',
                                    degree: d.degree || 'N/A'
                                })))}
                            />
                        </div>
                    )}

                    <button
                        onClick={() => setShowMassEmailModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 whitespace-nowrap"
                    >
                        <Mail size={14} />
                        Broadcast
                    </button>
                    <button
                        onClick={() => { cancelEdit(); setShowModal(true); }}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-slate-200 active:scale-95 whitespace-nowrap flex-1 xl:flex-none"
                    >
                        <Plus size={16} />
                        Hire
                    </button>
                </div>
            </div>

            {/* Content View */}
            <AnimatePresence mode="wait">
                {viewMode === 'MESSENGER' ? (
                    <motion.div
                        key="messenger"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row h-[700px]"
                    >
                        {/* Contacts Sidebar */}
                        <div className="w-full md:w-80 border-r border-slate-50 flex flex-col shrink-0 bg-slate-50/30">
                            <div className="p-6 border-b border-slate-50 space-y-4">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={16} className="text-rose-500" /> Personnel Contacts
                                </h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                                    <input 
                                        type="text" 
                                        placeholder="Quick filter..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-bold outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                                {doctorsList.map(doc => {
                                    const fn = doc.user?.firstName || doc.firstName;
                                    const ln = doc.user?.lastName || doc.lastName;
                                    const active = activeMsgDoc?.doctorId === doc.doctorId;
                                    return (
                                        <button 
                                            key={doc.doctorId}
                                            onClick={() => setActiveMsgDoc(doc)}
                                            className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${active ? 'bg-white shadow-md border border-slate-100' : 'hover:bg-white/60'}`}
                                        >
                                            <div className="relative">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs ring-2 ring-white">
                                                    {(doc.user?.profilePicture || doc.profilePicture) ? (
                                                        <img src={doc.user?.profilePicture || doc.profilePicture} className="w-full h-full object-cover rounded-xl" />
                                                    ) : fn[0]}
                                                </div>
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${doc.available !== false ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                            </div>
                                            <div className="text-left min-w-0">
                                                <p className={`text-[11px] font-black truncate ${active ? 'text-rose-600' : 'text-slate-700'}`}>Dr. {fn} {ln}</p>
                                                <p className="text-[9px] font-bold text-slate-400 truncate uppercase tracking-widest">{doc.speciality}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Profile/Chat Area */}
                        <div className="flex-1 flex flex-col bg-white overflow-hidden">
                            <AnimatePresence mode="wait">
                                {activeMsgDoc ? (
                                    <motion.div 
                                        key={activeMsgDoc.doctorId}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                                            <div className="flex gap-6 items-start">
                                                <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 shadow-inner border border-slate-100">
                                                    {(activeMsgDoc.user?.profilePicture || activeMsgDoc.profilePicture) ? (
                                                        <img src={activeMsgDoc.user?.profilePicture || activeMsgDoc.profilePicture} className="w-full h-full object-cover rounded-3xl" />
                                                    ) : <Stethoscope size={48} />}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <h2 className="text-2xl font-black text-slate-900 leading-none">Dr. {activeMsgDoc.user?.firstName || activeMsgDoc.firstName} {activeMsgDoc.user?.lastName || activeMsgDoc.lastName}</h2>
                                                        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-lg">{activeMsgDoc.speciality}</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                                        <Mail size={14} /> {activeMsgDoc.user?.email || activeMsgDoc.email}
                                                    </p>
                                                    <div className="flex gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pt-2">
                                                        <span className={activeMsgDoc.available !== false ? 'text-emerald-500' : ''}>● {activeMsgDoc.available !== false ? 'Connected' : 'Disconnected'}</span>
                                                        <span>/</span>
                                                        <span>Medical Professional</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => startEdit(activeMsgDoc)}
                                                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-500 transition-all border border-slate-100"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => setConfirmModal({
                                                        show: true,
                                                        title: "Personnel Removal",
                                                        message: "Are you sure? This will revoke all clinical access.",
                                                        type: 'DANGER',
                                                        onConfirm: () => onDelete(activeMsgDoc.doctorId)
                                                    })}
                                                    className="p-3 bg-rose-50 hover:bg-rose-100 rounded-2xl text-rose-500 transition-all border border-rose-100"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                                        <AlignLeft size={14} /> Narrative Bio
                                                    </h5>
                                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                                        {activeMsgDoc.bio || "No professional narrative provided for this clinician."}
                                                    </p>
                                                </div>
                                                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                                        <Clock size={14} /> Duty Registry
                                                    </h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {activeMsgDoc.timeSlots?.map((s: string) => (
                                                            <span key={s} className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-[10px] font-black text-slate-600 shadow-sm">{s}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-rose-500/20 transition-all duration-1000" />
                                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                                        <div className="space-y-2">
                                                            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                                                                <MessageSquare size={24} className="text-rose-400" />
                                                            </div>
                                                            <h3 className="text-xl font-black">Direct Staff Messaging</h3>
                                                            <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-[200px]">
                                                                Initiate real-time professional consultation with this clinician.
                                                            </p>
                                                        </div>
                                                        <button 
                                                            onClick={() => setChatOverlayTarget({ id: activeMsgDoc.doctorId, title: `Dr. ${activeMsgDoc.user?.firstName || activeMsgDoc.firstName} ${activeMsgDoc.user?.lastName || activeMsgDoc.lastName}` })}
                                                            className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-rose-900/20 active:scale-95"
                                                        >
                                                            Open Messaging Hub
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="h-24 bg-rose-50/50 rounded-3xl border border-rose-100 p-6 flex items-center justify-between group cursor-pointer hover:bg-rose-50 transition-all"  onClick={() => { setSelectedDoctor(activeMsgDoc); setShowEmailModal(true); }}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
                                                            <Mail size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-900">Push Formal Email</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Legacy Dispatch Mode</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full border border-rose-200 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 transition-all">
                                                        →
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 gap-4 opacity-30">
                                        <Users size={64} className="text-slate-200" />
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Select a Personnel</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">To view full clinical profile and messaging</p>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ) : viewMode === 'GRID' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {paginatedDoctors.length === 0 && (
                            <div className="col-span-full py-24 text-center text-slate-400 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-sm">
                                <Stethoscope className="mx-auto mb-6 opacity-10" size={64} />
                                <p className="font-black uppercase tracking-[0.2em] text-xs">No personnel discovered</p>
                            </div>
                        )}
                        {paginatedDoctors.map(doc => {
                            const firstName = doc.user?.firstName || doc.firstName;
                            const lastName = doc.user?.lastName || doc.lastName;
                            const profPic = doc.user?.profilePicture || doc.profilePicture;
                            return (
                                <div key={doc.doctorId} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:border-rose-200 hover:shadow-2xl hover:shadow-rose-500/10 transition-all group flex flex-col relative overflow-hidden">
                                    <div className="flex items-start justify-between mb-6 relative z-10">
                                        <div className="relative">
                                            {profPic ? (
                                                <img src={profPic} className="w-14 h-14 rounded-xl object-cover ring-4 ring-white shadow-xl" alt={firstName} />
                                            ) : (
                                                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 ring-4 ring-white shadow-lg">
                                                    <Stethoscope size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <button onClick={() => { setSelectedDoctor(doc); setShowEmailModal(true); }} className="p-2 rounded-lg bg-white text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100" title="Email Personnel"><Mail size={12} /></button>
                                            <button onClick={() => startEdit(doc)} className="p-2 rounded-lg bg-white text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100"><Edit3 size={12} /></button>
                                            <button
                                                onClick={() => setConfirmModal({
                                                    show: true,
                                                    title: "Terminate Personnel",
                                                    message: `Are you sure you want to remove Dr. ${firstName} ${lastName} from the registry? This action is irreversible.`,
                                                    type: 'DANGER',
                                                    onConfirm: () => onDelete(doc.doctorId)
                                                })}
                                                className="p-2 rounded-lg bg-white text-slate-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-slate-100"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 mb-6">
                                        <h4 className="text-lg font-black text-slate-900">Dr. {firstName} {lastName}</h4>
                                        <p className="text-[9px] font-black uppercase text-rose-500 tracking-widest mt-0.5">{doc.speciality}</p>
                                        <p className="text-xs text-slate-400 font-medium mt-3 line-clamp-2 leading-relaxed">{doc.bio}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex -space-x-1.5">
                                            {doc.timeSlots?.slice(0, 3).map((slot: string, i: number) => (
                                                <div key={slot} className={`w-7 h-7 rounded-lg border-2 border-white flex items-center justify-center text-[7px] font-black text-white shadow-sm ${['bg-rose-500', 'bg-slate-900', 'bg-indigo-500'][i % 3]}`}>
                                                    {slot.split(':')[0]}
                                                </div>
                                            ))}
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${doc.available !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {doc.available !== false ? 'Active' : 'Offline'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-3 py-2 text-[8px] uppercase font-black tracking-widest text-slate-400">Personnel</th>
                                        <th className="px-3 py-2 text-[8px] uppercase font-black tracking-widest text-slate-400">Specialty</th>
                                        <th className="px-3 py-2 text-[8px] uppercase font-black tracking-widest text-slate-400">Slots</th>
                                        <th className="px-3 py-2 text-[8px] uppercase font-black tracking-widest text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 transition-all">
                                    {paginatedDoctors.length === 0 && (
                                        <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">Registry empty</td></tr>
                                    )}
                                    {paginatedDoctors.map(doc => {
                                        const fn = doc.user?.firstName || doc.firstName;
                                        const ln = doc.user?.lastName || doc.lastName;
                                        return (
                                            <tr key={doc.doctorId} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-3 py-1.5 flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
                                                        <Stethoscope size={12} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[11px] text-slate-900">Dr. {fn} {ln}</p>
                                                        <p className="text-[7px] text-slate-400 font-bold">{doc.user?.email || doc.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-1.5">
                                                    <span className="px-1.5 py-0.5 bg-rose-50 text-rose-500 text-[8px] font-black uppercase tracking-widest rounded">
                                                        {doc.speciality}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-1.5">
                                                    <div className="flex gap-1">
                                                        {doc.timeSlots?.slice(0, 3).map((s: string) => (
                                                            <span key={s} className="px-1 py-0.5 bg-slate-100 text-slate-600 rounded-sm font-black text-[7px]">{s}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-1.5 text-right">
                                                    <div className="flex items-center justify-end gap-1 flex-nowrap">
                                                        <button onClick={() => { setSelectedDoctor(doc); setShowEmailModal(true); }} className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white transition-all" title="Dispatch Email"><Mail size={11} /></button>
                                                        <button onClick={() => startEdit(doc)} className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><Edit3 size={11} /></button>
                                                        <button
                                                            onClick={() => setConfirmModal({
                                                                show: true,
                                                                title: "Terminate Personnel",
                                                                message: `Are you sure you want to remove Dr. ${fn} ${ln} from the registry?`,
                                                                type: 'DANGER',
                                                                onConfirm: () => onDelete(doc.doctorId)
                                                            })}
                                                            className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:bg-rose-600 hover:text-white transition-all"
                                                        >
                                                            <Trash2 size={11} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pagination Component */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={doctorsList.length}
                itemsPerPage={itemsPerPage}
            />

            {/* Form Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-20 bg-slate-900/60 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/40">
                                        {isEditing ? <Edit3 size={24} /> : <Plus size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                            {isEditing ? "Personnel Update" : "Clinical Registration"}
                                        </h3>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Hospital Staff Integrity Module</p>
                                    </div>
                                </div>
                                <button
                                    onClick={cancelEdit}
                                    className="w-10 h-10 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all shadow-md border border-slate-100 flex items-center justify-center group relative z-10"
                                >
                                    <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
                                <form id="doctor-form" onSubmit={onFormSubmit} className="space-y-8">
                                    {/* Personal Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Personal Identity</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input type="text" placeholder="First Name" value={doctorForm.firstName}
                                                    onChange={(e) => setDoctorForm({ ...doctorForm, firstName: e.target.value })}
                                                    required className="bg-slate-50 border-2 border-transparent rounded-xl p-3.5 text-xs font-bold focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 focus:bg-white outline-none w-full transition-all text-slate-700" />
                                                <input type="text" placeholder="Last Name" value={doctorForm.lastName}
                                                    onChange={(e) => setDoctorForm({ ...doctorForm, lastName: e.target.value })}
                                                    required className="bg-slate-50 border-2 border-transparent rounded-xl p-3.5 text-xs font-bold focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 focus:bg-white outline-none w-full transition-all text-slate-700" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Secure Credential</label>
                                            <input type="password"
                                                placeholder={isEditing ? "Modify Password" : "Assign Password"}
                                                value={doctorForm.password}
                                                onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                                                required={!isEditing}
                                                className="w-full bg-slate-50 border-2 border-transparent rounded-xl p-3.5 text-xs font-bold focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 focus:bg-white outline-none transition-all text-slate-700" />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">System Communication Path</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                                                <input type="email" placeholder="official.access@healthpoint.com" value={doctorForm.email}
                                                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                                                    required className="w-full pl-12 pr-4 bg-slate-50 border-2 border-transparent rounded-xl p-3.5 text-xs font-bold focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 focus:bg-white outline-none transition-all text-slate-700" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Field of Expertise</label>
                                            <input type="text" placeholder="Speciality" value={doctorForm.speciality}
                                                onChange={(e) => setDoctorForm({ ...doctorForm, speciality: e.target.value })}
                                                required className="w-full bg-slate-50 border-2 border-transparent rounded-xl p-3.5 text-xs font-bold focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 focus:bg-white outline-none transition-all text-slate-700" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Allocated Department</label>
                                            <div className="relative">
                                                <select value={doctorForm.departmentId}
                                                    onChange={(e) => setDoctorForm({ ...doctorForm, departmentId: parseInt(e.target.value) })}
                                                    className="w-full bg-slate-50 border-2 border-transparent rounded-xl p-3.5 pr-12 text-xs font-black focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 focus:bg-white outline-none appearance-none cursor-pointer transition-all text-slate-700">
                                                    {departments.map((dep) => (
                                                        <option key={dep.id} value={dep.id}>{dep.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                            </div>
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Medical Profile Narrative</label>
                                            <textarea placeholder="Outline professional background..." value={doctorForm.bio}
                                                onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                                                required className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 text-xs font-bold focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 focus:bg-white outline-none min-h-[120px] transition-all text-slate-700 leading-relaxed" />
                                        </div>
                                    </div>

                                    {/* Availability Configuration */}
                                    <div className="p-6 bg-slate-50 rounded-3xl space-y-6 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Consultation Chronology</label>
                                                    <p className="text-xs font-black text-slate-900">Define Daily Duty Window</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[8px] font-black text-white uppercase tracking-widest">{selectedSlots.length} ACTIVE</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                            <div className="space-y-3">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Clinical Registry</p>
                                                <div className="relative">
                                                    <select
                                                        onChange={(e) => { addSlot(e.target.value); e.target.value = ""; }}
                                                        defaultValue=""
                                                        className="w-full bg-white border-2 border-transparent rounded-xl p-3.5 pr-12 text-xs font-black focus:border-rose-500 outline-none appearance-none cursor-pointer text-slate-400 shadow-sm transition-all"
                                                    >
                                                        <option value="" disabled>Select time...</option>
                                                        {availableToAdd.map(t => (
                                                            <option key={t} value={t} className="font-black py-2">{t}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-rose-500 pointer-events-none">
                                                        <Plus size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Assigned Slots</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedSlots.length > 0 ? selectedSlots.map(slot => (
                                                        <motion.span
                                                            layout
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            key={slot}
                                                            className="flex items-center gap-2 bg-white border border-slate-100 shadow-sm text-slate-900 text-[10px] font-black px-3 py-2 rounded-xl group hover:border-rose-100 transition-all"
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                            {slot}
                                                            <button type="button" onClick={() => removeSlot(slot)}
                                                                className="ml-1 text-slate-200 hover:text-rose-500 transition-colors">
                                                                <X size={12} />
                                                            </button>
                                                        </motion.span>
                                                    )) : (
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 p-2">No slots assigned</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Portrait Upload */}
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Clinical Staff Portrait</label>
                                        <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl cursor-pointer transition-all overflow-hidden relative group
                                            ${doctorForm.profilePicture ? "border-rose-100 bg-rose-50/20" : "border-slate-100 bg-slate-50 hover:border-rose-200 hover:bg-rose-50/30"}`}>
                                            {uploading ? (
                                                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                                            ) : doctorForm.profilePicture ? (
                                                <img src={doctorForm.profilePicture} className="w-full h-full object-cover" alt="Profile" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <ImageIcon size={32} className="text-slate-200" />
                                                    <p className="text-[10px] text-slate-400 font-black uppercase">Upload Image</p>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                </form>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="flex-1 py-3.5 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="doctor-form"
                                    disabled={uploading}
                                    className="flex-[2] py-3.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {uploading ? "Uploading..." : isEditing ? "Save Changes" : "Register Personnel"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* [MODAL] Strategic Email Dispatcher */}
            <AnimatePresence>
                {showEmailModal && selectedDoctor && (
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
                                        <h3 className="text-3xl font-black tracking-tight">Personnel Dispatch</h3>
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
                                            {selectedDoctor.user?.profilePicture ? <img src={selectedDoctor.user?.profilePicture} className="w-full h-full object-cover rounded-2xl" /> : <Stethoscope size={24} />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient Identity</p>
                                            <p className="text-sm font-black text-slate-900">Dr. {selectedDoctor.user?.firstName} {selectedDoctor.user?.lastName}</p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 bg-white rounded-xl border border-slate-200">
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{selectedDoctor.user?.email}</p>
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
                                    {isSending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Encrypting & Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} className="text-indigo-400" />
                                            <span>Execute Dispatch</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Mass Email Modal */}
            <AnimatePresence>
                {showMassEmailModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100"
                        >
                            <div className="p-8 pb-0 border-b border-slate-50 relative">
                                <div className="absolute top-0 right-8 w-24 h-24 bg-rose-50 rounded-b-[3rem] -z-10" />
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">Mass Broadcast</h3>
                                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] mt-1">Global Communication Protocol</p>
                                    </div>
                                    <button
                                        onClick={() => setShowMassEmailModal(false)}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                    >
                                        <X size={20} className="stroke-[3]" />
                                    </button>
                                </div>

                                <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-500 font-black text-xs shadow-sm shadow-slate-200/50">ALL</div>
                                    <div>
                                        <p className="font-black text-slate-900">All Registered Personnel</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Global Dispatch</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 pt-6 space-y-6">
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rapid Response Templates</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {EMAIL_TEMPLATES.map((tpl: any, i: number) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    setEmailSubject(tpl.subject);
                                                    setEmailMessage(tpl.message);
                                                }}
                                                className="p-3 text-left bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 rounded-xl transition-all group"
                                            >
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1 group-hover:text-indigo-600 transition-colors">{tpl.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:ring-4 ring-rose-500/10 focus-within:bg-white transition-all">
                                    <div className="px-4 py-2 opacity-50 flex items-center gap-3 border-b border-slate-100 mb-2">
                                        <AlignLeft size={14} className="text-slate-500" />
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Communication Subject</label>
                                    </div>
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Subject line..."
                                        className="w-full bg-transparent px-4 py-3 text-slate-900 font-bold outline-none placeholder:text-slate-300"
                                    />
                                </div>
                                <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:ring-4 ring-rose-500/10 focus-within:bg-white transition-all">
                                    <div className="px-4 py-2 opacity-50 flex items-center gap-3 border-b border-slate-100 mb-2">
                                        <FileText size={14} className="text-slate-500" />
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Dispatch Narrative Content</label>
                                    </div>
                                    <textarea
                                        value={emailMessage}
                                        onChange={(e) => setEmailMessage(e.target.value)}
                                        rows={4}
                                        placeholder="Write your official communication..."
                                        className="w-full bg-transparent px-4 py-3 text-slate-600 font-medium outline-none placeholder:text-slate-300 resize-none leading-relaxed"
                                    />
                                </div>
                            </div>
                            <div className="p-8 pt-0 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowMassEmailModal(false)}
                                    className="flex-[1] py-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-colors"
                                >
                                    Abort
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfirmModal({
                                            show: true,
                                            title: "Mass Communication",
                                            message: `You are about to send this message to all registered personnel. This action will trigger a global broadcast. Continue?`,
                                            type: 'WARNING',
                                            onConfirm: handleMassEmailSend
                                        });
                                    }}
                                    disabled={isSending || !emailSubject || !emailMessage}
                                    className="flex-[2] py-4 bg-slate-900 hover:bg-rose-600 disabled:opacity-50 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200"
                                >
                                    {isSending ? 'Transmitting...' : 'Dispatch Globally'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Overlay */}
            <AnimatePresence>
                {chatOverlayTarget && (
                    <StaffChatOverlay
                        targetId={chatOverlayTarget.id}
                        title={chatOverlayTarget.title}
                        onClose={() => setChatOverlayTarget(null)}
                    />
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
