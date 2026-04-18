import { useState, useEffect } from "react";
import { apiClient } from "@/apis/apis";
import { useAuth } from "@/contexts/AuthProvider";
import { Users, UserPlus, Search, MessageSquare, Plus, Check, Loader2, Video, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { StaffChatOverlay } from "../chat/StaffChatOverlay";

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profilePicture?: string;
}

interface Group {
    id: number;
    name: string;
    description: string;
    members: { user: User }[];
    lastMessage?: string;
}

export function StaffChatHub() {
    const auth = useAuth();
    const currentUser = auth?.user;
    const [doctors, setDoctors] = useState<User[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [activeTab, setActiveTab] = useState<'CHAT' | 'GROUPS'>('CHAT');
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupDesc, setNewGroupDesc] = useState("");
    const [selectedDoctorIds, setSelectedDoctorIds] = useState<number[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [memberSearchQuery, setMemberSearchQuery] = useState("");
    const [activeChat, setActiveChat] = useState<{ targetId?: number; groupId?: number; title: string } | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, groupsRes] = await Promise.all([
                apiClient.get("/api/user/staff"),
                apiClient.get("/api/chat/groups")
            ]);
            // Only show Doctors and Admins for staff chat
            const staff = usersRes.data.filter((u: User) => u.role === 'DOCTOR' || u.role === 'ADMIN');
            setDoctors(staff.filter((u: User) => u.id !== currentUser?.id));
            setGroups(groupsRes.data);
        } catch (error) {
            toast.error("Failed to load staff data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredDoctors = doctors.filter(d => 
        (d.firstName + " " + d.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredGroups = groups.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredModalDoctors = doctors.filter(doc => 
        (doc.firstName + " " + doc.lastName).toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        doc.role.toLowerCase().includes(memberSearchQuery.toLowerCase())
    );

    const handleCreateGroup = async () => {
        if (!newGroupName || selectedDoctorIds.length === 0) {
            toast.error("Group name and at least one member required");
            return;
        }

        setIsCreating(true);
        try {
            await apiClient.post("/api/chat/groups", {
                name: newGroupName,
                description: newGroupDesc,
                memberIds: selectedDoctorIds
            });
            toast.success("Staff group created successfully");
            setNewGroupName("");
            setNewGroupDesc("");
            setMemberSearchQuery("");
            setSelectedDoctorIds([]);
            setShowCreateGroup(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to create group");
        } finally {
            setIsCreating(false);
        }
    };

    const toggleDoctorSelection = (id: number) => {
        setSelectedDoctorIds(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600 opacity-10 blur-3xl rounded-full -mr-32 -mt-32" />
                <div className="relative z-10">
                    <h2 className="text-xl font-black tracking-tight">Internal Staff Hub</h2>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mt-1">Exclusive Network for Doctors & Administrators Only</p>
                </div>

            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                    <button 
                        onClick={() => setActiveTab('CHAT')}
                        className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'CHAT' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Conversations
                    </button>
                    <button 
                        onClick={() => setActiveTab('GROUPS')}
                        className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'GROUPS' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Staff Groups
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder={`Search ${activeTab === 'CHAT' ? 'staff...' : 'groups...'}`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-200 transition-all"
                        />
                    </div>
                    {activeTab === 'GROUPS' && (
                        <button 
                            onClick={() => setShowCreateGroup(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 shrink-0"
                        >
                            <Plus size={14} />
                            New Group
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 size={32} className="animate-spin text-rose-500 opacity-20" />
                </div>
            ) : activeTab === 'CHAT' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDoctors.length === 0 ? (
                         <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 p-8">
                             <Search size={32} className="mx-auto mb-4 text-slate-200" />
                             <p className="text-sm font-bold text-slate-900 tracking-tight">No staff found matching "{searchQuery}"</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Refine your search parameters</p>
                         </div>
                    ) : filteredDoctors.map(doctor => (
                        <motion.div 
                            key={doctor.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-rose-100 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-rose-50 blur-2xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-rose-500 font-bold text-lg border border-slate-100 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                                    {doctor.profilePicture ? (
                                        <img src={doctor.profilePicture} alt="" className="w-full h-full object-cover rounded-2xl" />
                                    ) : doctor.firstName[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate text-sm">
                                        {doctor.firstName} {doctor.lastName}
                                    </h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${doctor.role === 'ADMIN' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{doctor.role}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex gap-2 relative z-10">
                                <button 
                                    className="flex-1 py-1.5 bg-slate-50 group-hover:bg-rose-600 group-hover:text-white rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all text-slate-500 flex items-center justify-center gap-2"
                                    onClick={() => setActiveChat({ targetId: doctor.id, title: `${doctor.role === 'DOCTOR' ? 'Dr.' : 'Admin'} ${doctor.firstName} ${doctor.lastName}` })}
                                >
                                    <MessageSquare size={12} />
                                    Dispatch Message
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredGroups.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 p-8">
                             <Users size={32} className="mx-auto mb-4 text-slate-200" />
                             <p className="text-sm font-bold text-slate-900 tracking-tight">No groups found matching "{searchQuery}"</p>
                        </div>
                    ) : filteredGroups.map(group => (
                        <motion.div 
                            key={group.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-100/50">
                                    <Users size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 truncate">{group.name}</h4>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Users size={10} className="text-slate-400" />
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{group.members.length} Members</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed h-8 mb-4">
                                {group.description || "No description provided for this professional circle."}
                            </p>
                            <button 
                                onClick={() => setActiveChat({ groupId: group.id, title: group.name })}
                                className="w-full py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                            >
                                Open Group Hub
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {activeChat && (
                    <StaffChatOverlay 
                        targetId={activeChat.targetId}
                        groupId={activeChat.groupId}
                        title={activeChat.title}
                        onClose={() => setActiveChat(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCreateGroup && (
                    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
                        >
                            <div className="bg-slate-900 p-8 text-white relative h-32 flex items-center shrink-0">
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black tracking-tight">Create Staff Circle</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mt-1">Cross-Collaboration Hub</p>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/20 blur-3xl -mr-16 -mt-16 rounded-full" />
                            </div>

                            <div className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[500px]">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Circle Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g., Surgery Coordination Team"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:bg-white transition-all text-sm font-semibold outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Purpose / Description</label>
                                    <textarea 
                                        placeholder="Describe the objective of this group..."
                                        rows={3}
                                        value={newGroupDesc}
                                        onChange={(e) => setNewGroupDesc(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:bg-white transition-all text-sm font-semibold outline-none resize-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            Select Members
                                        </label>
                                        <span className="text-[10px] font-black text-rose-500">{selectedDoctorIds.length} added</span>
                                    </div>
                                    
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input 
                                            type="text" 
                                            placeholder="Search staff to add..."
                                            value={memberSearchQuery}
                                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold outline-none focus:ring-4 focus:ring-rose-500/5 focus:bg-white transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredModalDoctors.length === 0 ? (
                                            <div className="py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                <Search size={20} className="mx-auto mb-2 text-slate-300" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No matching staff</p>
                                            </div>
                                        ) : (
                                            filteredModalDoctors.map(doc => (
                                                <div 
                                                    key={doc.id}
                                                    onClick={() => toggleDoctorSelection(doc.id)}
                                                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                                                        selectedDoctorIds.includes(doc.id) 
                                                            ? 'bg-rose-50 border-rose-200' 
                                                            : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                                                            selectedDoctorIds.includes(doc.id) ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white border border-slate-100 text-slate-400'
                                                        }`}>
                                                            {doc.firstName[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-bold text-slate-900">Dr. {doc.firstName} {doc.lastName}</p>
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{doc.role}</p>
                                                        </div>
                                                    </div>
                                                    {selectedDoctorIds.includes(doc.id) && (
                                                        <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-200">
                                                            <Check size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50 flex gap-3 border-t border-slate-100 shrink-0">
                                <button 
                                    onClick={() => { setShowCreateGroup(false); setMemberSearchQuery(""); }}
                                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleCreateGroup}
                                    disabled={isCreating}
                                    className="flex-[2] py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Establishing...
                                        </>
                                    ) : 'Initiate Circle'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
