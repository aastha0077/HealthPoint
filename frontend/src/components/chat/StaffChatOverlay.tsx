import { useState, useRef, useEffect, useCallback } from "react";
import { apiClient } from "@/apis/apis";
import { Send, X, Users, Paperclip, MessageSquare, Loader2, Sparkles, ShieldAlert, Trash2, UserMinus, Settings, Info, UserPlus, Search, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import io from "socket.io-client";
import { ChatMessage } from "./ChatMessage";

const socket = io("http://localhost:8000");

interface StaffChatOverlayProps {
    targetId?: number; // userId for direct chat
    groupId?: number;  // groupId for group chat
    title: string;
    onClose: () => void;
}

export function StaffChatOverlay({ targetId, groupId, title, onClose }: StaffChatOverlayProps) {
    const auth = useAuth();
    const user = auth?.user;
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // Group Management States
    const [showMembers, setShowMembers] = useState(false);
    const [groupDetails, setGroupDetails] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [allStaff, setAllStaff] = useState<any[]>([]);
    const [staffSearchQuery, setStaffSearchQuery] = useState("");

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    const fetchGroupDetails = useCallback(async () => {
        if (!groupId) return;
        try {
            // We use the existing groups endpoint which includes members
            const res = await apiClient.get("/api/chat/groups");
            const currentGroup = res.data.find((g: any) => g.id === groupId);
            if (currentGroup) setGroupDetails(currentGroup);
        } catch (error) {
            console.error("Failed to load group details");
        }
    }, [groupId]);

    const fetchStaff = useCallback(async () => {
        try {
            const res = await apiClient.get("/api/user/staff");
            setAllStaff(res.data.filter((u: any) => u.id !== user?.id));
        } catch (error) {
            console.error("Failed to fetch staff");
        }
    }, [user?.id]);

    const fetchMessages = useCallback(async () => {
        setIsLoading(true);
        try {
            if (groupId) {
                const res = await apiClient.get(`/api/chat/groups/${groupId}/messages`);
                setMessages(res.data);
                fetchGroupDetails();
                fetchStaff();
            } else if (targetId) {
                const res = await apiClient.get(`/api/chat/conversation/${targetId}`);
                setMessages(res.data);
            }
        } catch (error) {
            toast.error("Failed to load messages");
        } finally {
            setIsLoading(false);
            setTimeout(() => scrollToBottom("auto"), 100);
        }
    }, [targetId, groupId, fetchGroupDetails, fetchStaff]);

    useEffect(() => {
        if (!user) return;
        socket.emit("register", user.id);
        fetchMessages();

        const handleNewDirect = (msg: any) => {
            if (targetId && (Number(msg.senderId) === Number(targetId) || (Number(msg.senderId) === Number(user.id) && Number(msg.receiverId) === Number(targetId)))) {
                setMessages(prev => [...prev, msg]);
                setTimeout(() => scrollToBottom(), 100);
            }
        };

        const handleNewGroupMessage = (data: any) => {
            if (groupId && Number(data.groupId) === Number(groupId)) {
                setMessages(prev => [...prev, data.message]);
                setTimeout(() => scrollToBottom(), 100);
            }
        };

        socket.on("newDirectMessage", handleNewDirect);
        socket.on("newGroupMessage", handleNewGroupMessage);

        return () => {
            socket.off("newDirectMessage", handleNewDirect);
            socket.off("newGroupMessage", handleNewGroupMessage);
        };
    }, [user, targetId, groupId, fetchMessages]);

    const handleSend = async () => {
        if (!input.trim() || !user) return;

        try {
            if (groupId) {
                const res = await apiClient.post(`/api/chat/groups/${groupId}/messages`, { content: input });
                setMessages(prev => [...prev, res.data]);
            } else if (targetId) {
                const res = await apiClient.post(`/api/chat/direct/send`, { receiverId: targetId, content: input });
                setMessages(prev => [...prev, res.data]);
            }
            setInput("");
            setTimeout(() => scrollToBottom(), 100);
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    const handleAddMember = async (targetUserId: number) => {
        if (!groupId) return;
        try {
            await apiClient.post(`/api/chat/groups/${groupId}/members`, { userId: targetUserId });
            toast.success("Staff added to circle");
            fetchGroupDetails();
            setIsAddingMember(false);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to add member");
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        if (!groupId) return;
        try {
            await apiClient.delete(`/api/chat/groups/${groupId}/members/${memberId}`);
            toast.success("Member removed from circle");
            fetchGroupDetails();
        } catch (error) {
            toast.error("Failed to remove member");
        }
    };

    const handleDeleteGroup = async () => {
        if (!groupId || !window.confirm("Are you sure you want to delete this group permanently?")) return;
        setIsDeleting(true);
        try {
            await apiClient.delete(`/api/chat/groups/${groupId}`);
            toast.success("Group deleted successfully");
            onClose();
        } catch (error) {
            toast.error("Failed to delete group");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const uploadRes = await apiClient.post("/api/chat/upload", formData);
            if (groupId) {
                const res = await apiClient.post(`/api/chat/groups/${groupId}/messages`, { 
                    content: `Sent a file: ${file.name}`, 
                    fileUrl: uploadRes.data.url, 
                    fileType: file.type 
                });
                setMessages(prev => [...prev, res.data]);
            } else if (targetId) {
                const res = await apiClient.post(`/api/chat/direct/send`, { 
                    receiverId: targetId, 
                    content: `Sent a file: ${file.name}`,
                    fileUrl: uploadRes.data.url, 
                    fileType: file.type 
                });
                setMessages(prev => [...prev, res.data]);
            }
            setTimeout(() => scrollToBottom(), 100);
        } catch (error) {
            toast.error("File upload failed");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const isCreatorOrAdmin = user?.role === 'ADMIN' || groupDetails?.creatorId === user?.id;

    const availableStaff = allStaff.filter(s => 
        !groupDetails?.members.some((m: any) => m.user.id === s.id) &&
        (s.firstName + " " + s.lastName).toLowerCase().includes(staffSearchQuery.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            className="fixed bottom-6 right-6 w-[420px] h-[650px] bg-white rounded-[3rem] shadow-[0_32px_80px_rgba(0,0,0,0.25)] z-[200] flex flex-col overflow-hidden border border-slate-100/50"
        >
            <div className="bg-slate-900 p-7 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-rose-600/30 blur-[60px] -mr-16 -mt-16 rounded-full" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/20 blur-[50px] -ml-8 -mb-8 rounded-full" />
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md shadow-inner">
                        {groupId ? <Users size={22} className="text-rose-400" /> : <MessageSquare size={22} className="text-rose-400" />}
                    </div>
                    <div>
                        <h4 className="font-black text-sm tracking-tight truncate max-w-[170px] uppercase">{title}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                                {groupId ? "Professional Circle" : "Direct Dispatch"}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 relative z-10">
                    {groupId && (
                        <button 
                            onClick={() => {
                                setShowMembers(!showMembers);
                                setIsAddingMember(false);
                            }}
                            className={`p-2.5 rounded-xl transition-all ${showMembers ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}
                        >
                            <Users size={18} />
                        </button>
                    )}
                    <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden flex flex-col bg-[#F8FAFC]">
                <AnimatePresence mode="wait">
                    {showMembers && groupId ? (
                        <motion.div 
                            key="members-view"
                            initial={{ x: 420 }}
                            animate={{ x: 0 }}
                            exit={{ x: 420 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute inset-0 bg-white z-20 flex flex-col"
                        >
                            <div className="p-7 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h5 className="font-black text-[11px] uppercase tracking-widest text-slate-900">Circle Governance</h5>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{groupDetails?.members?.length || 0} Professionals</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isCreatorOrAdmin && (
                                        <button 
                                            onClick={() => setIsAddingMember(!isAddingMember)}
                                            className={`p-2.5 rounded-xl transition-all ${isAddingMember ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50'}`}
                                            title="Add new staff"
                                        >
                                            <UserPlus size={16} />
                                        </button>
                                    )}
                                    <button onClick={() => { setShowMembers(false); setIsAddingMember(false); }} className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {isAddingMember ? (
                                        <motion.div 
                                            key="add-member-pane"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="space-y-3 mb-6"
                                        >
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                <input 
                                                    type="text" 
                                                    placeholder="Search staff to add..."
                                                    value={staffSearchQuery}
                                                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                                                {availableStaff.length === 0 ? (
                                                    <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                        <Search size={20} className="mx-auto mb-2 text-slate-300" />
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8">All eligible staff are already in this circle</p>
                                                    </div>
                                                ) : availableStaff.map(s => (
                                                    <button 
                                                        key={s.id}
                                                        onClick={() => handleAddMember(s.id)}
                                                        className="w-full p-3 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-50 transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center font-bold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all uppercase">
                                                                {s.firstName[0]}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-[11px] font-black text-slate-900 leading-tight">{s.firstName} {s.lastName}</p>
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{s.role}</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                                            <Check size={14} />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="h-px bg-slate-100 my-4" />
                                        </motion.div>
                                    ) : null}

                                    {groupDetails?.members?.map((member: any) => (
                                        <div key={member.user.id} className="flex items-center justify-between p-3.5 bg-white rounded-3xl border border-slate-100 group/member hover:shadow-sm transition-all">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 border border-slate-100 group-hover/member:bg-rose-50 group-hover/member:text-rose-500 transition-all uppercase">
                                                    {member.user.firstName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-900 leading-tight">
                                                        {member.user.role === 'DOCTOR' ? 'Dr.' : ''} {member.user.firstName} {member.user.lastName}
                                                        {member.user.id === groupDetails.creatorId && (
                                                            <span className="ml-2 text-[8px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-black tracking-tighter">CREATOR</span>
                                                        )}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{member.user.role}</p>
                                                </div>
                                            </div>
                                            {isCreatorOrAdmin && member.user.id !== user?.id && member.user.id !== groupDetails.creatorId && (
                                                <button 
                                                    onClick={() => handleRemoveMember(member.user.id)}
                                                    className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                                                    title="Remove from circle"
                                                >
                                                    <UserMinus size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            {isCreatorOrAdmin && (
                                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                                    <button 
                                        onClick={handleDeleteGroup}
                                        disabled={isDeleting}
                                        className="w-full py-4 bg-white border-2 border-rose-100 text-rose-600 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
                                    >
                                        <Trash2 size={16} />
                                        {isDeleting ? "Dissolving..." : "Dissolve Circle"}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 space-y-1 bg-[#F8FAFC] custom-scrollbar">
                            {isLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="relative">
                                        <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
                                        <MessageSquare size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-600" />
                                    </div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-5 text-center px-10">
                                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-slate-200/50 border border-slate-100">
                                        <Sparkles size={32} className="text-rose-500 opacity-20" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-2">Secure Channel Established</p>
                                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed">Initiate a dialogue. Your professional communications are encrypted and private.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((m, idx) => {
                                        const nextMsg = messages[idx + 1];
                                        const prevMsg = messages[idx - 1];
                                        const isSameSenderAsNext = nextMsg && Number(nextMsg.senderId) === Number(m.senderId);
                                        const isSameSenderAsPrev = prevMsg && Number(prevMsg.senderId) === Number(m.senderId);
                                        
                                        return (
                                            <ChatMessage 
                                                key={m.id || idx}
                                                m={m}
                                                user={user}
                                                isMe={Number(m.senderId) === Number(user?.id)}
                                                colorScheme={groupId ? "indigo" : "rose"}
                                                showMetadata={!isSameSenderAsNext}
                                                compactMode={isSameSenderAsPrev}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-7 bg-white border-t border-slate-100 flex gap-3 items-center shrink-0">
                <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-3.5 bg-slate-100 text-slate-500 hover:text-rose-600 rounded-2xl hover:bg-rose-50 transition-all active:scale-90 disabled:opacity-50 group"
                >
                    <Paperclip size={20} className={isUploading ? "animate-spin" : "group-hover:rotate-12 transition-transform"} />
                </button>
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        placeholder="Share your thoughts..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="w-full px-6 py-3.5 bg-slate-100 border border-transparent rounded-[1.5rem] text-[13px] font-semibold focus:ring-4 focus:ring-rose-500/5 focus:bg-white focus:border-rose-200 transition-all outline-none placeholder:text-slate-400"
                    />
                </div>
                <button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-3.5 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-90 disabled:opacity-50 disabled:grayscale"
                >
                    <Send size={20} />
                </button>
            </div>
        </motion.div>
    );
}
