import { useState, useRef, useEffect, useCallback } from "react";
import { apiClient } from "@/apis/apis";
import { Send, X, Users, Paperclip, MessageSquare, Loader2, Sparkles } from "lucide-react";
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = useCallback(async () => {
        setIsLoading(true);
        try {
            if (groupId) {
                const res = await apiClient.get(`/api/chat/groups/${groupId}/messages`);
                setMessages(res.data);
            } else if (targetId) {
                const res = await apiClient.get(`/api/chat/conversation/${targetId}`);
                setMessages(res.data);
            }
        } catch (error) {
            toast.error("Failed to load messages");
        } finally {
            setIsLoading(false);
            setTimeout(scrollToBottom, 100);
        }
    }, [targetId, groupId]);

    useEffect(() => {
        if (!user) return;
        socket.emit("register", user.id);
        fetchMessages();

        const handleNewDirect = (msg: any) => {
            if (targetId && (msg.senderId === targetId || (msg.senderId === user.id && msg.receiverId === targetId))) {
                setMessages(prev => [...prev, msg]);
                setTimeout(scrollToBottom, 100);
            }
        };

        const handleNewGroupMessage = (data: any) => {
            if (groupId && data.groupId === groupId) {
                setMessages(prev => [...prev, data.message]);
                setTimeout(scrollToBottom, 100);
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
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            toast.error("Failed to send message");
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
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            toast.error("File upload failed");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[200] flex flex-col overflow-hidden border border-slate-100/50"
        >
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/20 blur-3xl -mr-16 -mt-16 rounded-full" />
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                        {groupId ? <Users size={20} className="text-rose-400" /> : <MessageSquare size={20} className="text-rose-400" />}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm tracking-tight truncate max-w-[200px]">{title}</h4>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {groupId ? "Professional Circle" : "Direct Dispatch"}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white relative z-10">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-rose-500 opacity-20" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 text-center px-10">
                        <Sparkles size={32} className="opacity-10 text-rose-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest leading-loose">Initiate professional dialogue. Your communications are secure.</p>
                    </div>
                ) : (
                    messages.map((m, idx) => (
                        <ChatMessage 
                            key={m.id || idx}
                            m={m}
                            user={user}
                            isMe={m.senderId === user?.id}
                            colorScheme={groupId ? "indigo" : "rose"}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex gap-3 items-center shrink-0">
                <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-100 transition-all active:scale-95 disabled:opacity-50"
                >
                    <Paperclip size={18} className={isUploading ? "animate-spin" : ""} />
                </button>
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold focus:ring-4 focus:ring-rose-500/5 focus:bg-white transition-all outline-none"
                    />
                </div>
                <button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-3 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                >
                    <Send size={18} />
                </button>
            </div>
        </motion.div>
    );
}
