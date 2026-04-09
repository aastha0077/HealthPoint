import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/apis/apis";
import { Send, X, Clock, User as UserIcon, Paperclip, HelpCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

interface DoctorChatProps {
    appointmentId: number;
    patientName: string;
    completedAt?: string;
    onClose: () => void;
}

export function DoctorChat({ appointmentId, patientName, completedAt, onClose }: DoctorChatProps) {
    const auth = useAuth();
    const user = auth?.user;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [input, setInput] = useState("");
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [chatExpired, setChatExpired] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ show: boolean; title: string; message: string; action: () => void }>({
        show: false, title: "", message: "", action: () => {}
    });

    const {
        messages,
        isUploading,
        setIsUploading,
        isLoadingMore,
        messagesContainerRef,
        handleScroll,
        sendMessage,
        deleteMessage,
        editMessage,
        clearHistory,
        editingMsg,
        setEditingMsg,
        editInput,
        setEditInput,
        onlineStatuses,
        participants
    } = useChat(appointmentId, user);

    useEffect(() => {
        if (!completedAt) return;
        const updateTimer = () => {
            const completed = new Date(completedAt).getTime();
            const now = new Date().getTime();
            const diffMs = (completed + 24 * 60 * 60 * 1000) - now;
            if (diffMs <= 0) {
                setTimeLeft("Chat Expired");
                setChatExpired(true);
            } else {
                const h = Math.floor(diffMs / (1000 * 60 * 60));
                const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${h}h ${m}m remaining`);
            }
        };
        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [completedAt]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (chatExpired) {
            toast.error("Messaging period expired");
            return;
        }
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await apiClient.post("/api/chat/upload", formData);
            sendMessage("", { url: res.data.url, type: file.type });
            toast.success("Clinical record appended");
        } catch (error) {
            console.error(error);
            toast.error("File upload failed");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSend = () => {
        if (!input.trim() || chatExpired) return;
        sendMessage(input);
        setInput("");
    };

    const isPatientOnline = participants?.patient?.userId ? onlineStatuses[participants.patient.userId] : false;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 30, opacity: 0 }}
                className="bg-white rounded-[2.5rem] shadow-[0_30px_90px_-20px_rgba(15,23,42,0.5)] w-full max-w-2xl overflow-hidden flex flex-col pointer-events-auto relative border border-white/20"
                style={{ height: "min(800px, 90vh)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Master Header */}
                <div className="px-8 py-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white flex items-center gap-5 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
                    <div className="z-10 relative">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-[1.25rem] flex justify-center items-center border border-white/20 shadow-xl overflow-hidden group">
                           <UserIcon size={24} className="group-hover:scale-110 transition-transform" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-indigo-700 rounded-full shadow-lg shadow-emerald-900/20 transition-colors duration-500 ${isPatientOnline ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0 z-10">
                        <div className="flex items-center gap-2">
                             <h2 className="font-black text-lg tracking-tight truncate">{patientName}</h2>
                             <div className={`px-1.5 py-0.5 rounded-md border text-[6px] font-black uppercase tracking-widest transition-all ${isPatientOnline ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300' : 'bg-slate-500/20 border-slate-400/30 text-slate-300'}`}>
                                {isPatientOnline ? 'Patient Online' : 'Patient Offline'}
                             </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-indigo-100/80">
                            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Clock size={12} className="text-indigo-300" />
                                {timeLeft || "Active Conversation"}
                            </span>
                        </div>
                    </div>
                    {(!chatExpired && messages.length > 0) && (
                        <button 
                            onClick={() => setConfirmModal({
                                show: true,
                                title: "Clear Clinical Record",
                                message: "Are you sure you want to permanently delete all messages and media in this consultation?",
                                action: async () => {
                                    await clearHistory();
                                    setConfirmModal(prev => ({ ...prev, show: false }));
                                }
                            })}
                            className="p-3 bg-white/10 hover:bg-rose-500/20 rounded-2xl transition-all text-white border border-white/10 shadow-lg group z-10"
                            title="Clear Chat History"
                        >
                            <Trash2 size={20} className="group-hover:text-rose-200 transition-colors" />
                        </button>
                    )}
                    <button 
                        onClick={onClose} 
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white border border-white/10 shadow-lg group z-10"
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* Patient Case Summary (Static Mini) */}
                <div className="px-8 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
                     <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Appointment ID: {appointmentId}</span>
                </div>

                {/* Clinical History Viewport */}
                <div 
                    ref={messagesContainerRef} 
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-slate-50/30 scroll-smooth scrollbar-hide"
                >
                    {isLoadingMore && (
                        <div className="flex justify-center p-4">
                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-indigo-100"></div>
                        </div>
                    )}
                    <AnimatePresence initial={false}>
                        {messages.length === 0 && !isLoadingMore ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-slate-300 gap-5 max-w-[280px] mx-auto text-center">
                                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center border border-slate-100 shadow-inner">
                                    <HelpCircle size={32} className="text-indigo-200" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Chat History</p>
                                    <p className="text-xs font-semibold text-slate-400 leading-relaxed italic">
                                        {chatExpired 
                                            ? "No messages were exchanged during the 24-hour consultation window." 
                                            : "No messages yet. You can start the conversation now."
                                        }
                                    </p>
                                </div>
                            </motion.div>
                        ) : messages.map((m) => (
                            <ChatMessage 
                                key={m.id}
                                m={m}
                                user={user}
                                isMe={m.senderId === user?.id}
                                chatExpired={chatExpired}
                                editingMsg={editingMsg}
                                setEditingMsg={setEditingMsg}
                                editInput={editInput}
                                setEditInput={setEditInput}
                                onEdit={() => editMessage(m.id, editInput)}
                                onDelete={deleteMessage}
                                colorScheme="indigo"
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Direct Instruction Interaction Footer */}
                {!chatExpired ? (
                    <div className="p-8 bg-white border-t border-slate-50 flex gap-4 items-center shrink-0 relative z-10">
                        <div className="flex-1 relative flex items-center group">
                            <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*,.pdf" />
                            <div className="absolute left-1 flex items-center">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-2xl transition-all border border-slate-100 shadow-sm hover:shadow-md disabled:bg-slate-50 active:scale-95"
                                    disabled={isUploading}
                                    title="Add Clinical Result"
                                >
                                    <Paperclip size={18} className={isUploading ? "animate-spin" : "rotate-12"} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type your message..."
                                className="w-full pl-16 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] focus:outline-none focus:ring-[6px] ring-indigo-50 focus:bg-white text-[15px] transition-all font-medium text-slate-700 placeholder:text-slate-300 placeholder:italic shadow-inner"
                            />
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() && !isUploading}
                            className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-800 hover:shadow-[0_15px_40px_-10px_rgba(79,70,229,0.5)] disabled:from-slate-200 disabled:to-slate-300 disabled:shadow-none text-white rounded-[1.5rem] flex justify-center items-center transition-all group relative overflow-hidden active:scale-95 shadow-xl shadow-indigo-100"
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Send size={22} className="relative group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                ) : (
                    <div className="p-8 bg-slate-50 border-t border-slate-100 text-center shrink-0 select-none">
                         <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white rounded-full border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Messaging disabled - 24 hours elapsed since completion</p>
                         </div>
                    </div>
                )}
                
                <ConfirmModal
                    show={confirmModal.show}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    onConfirm={confirmModal.action}
                    onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                />
            </motion.div>
        </motion.div>
    );
}
