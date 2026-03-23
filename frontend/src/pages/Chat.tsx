import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams, Navigate, useNavigate } from "react-router";
import { apiClient } from "@/apis/apis";
import { Send, User as UserIcon, ArrowLeft, Paperclip, Clock, HelpCircle, Activity, Mic, Volume2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/chat/ChatMessage";

export default function Chat() {
    const { appointmentId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const completedAtParam = searchParams.get("completedAt") || "";
    
    const auth = useAuth();
    const user = auth?.user;
    const isDoctor = user?.role === 'DOCTOR';
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [input, setInput] = useState("");
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [chatExpired, setChatExpired] = useState(false);

    // Redirect doctors to professional panel view
    useEffect(() => {
        if (isDoctor && appointmentId) {
            navigate(`/doctor-panel?chat=${appointmentId}`, { replace: true });
        }
    }, [isDoctor, appointmentId, navigate]);

    const {
        messages,
        participants,
        isUploading,
        setIsUploading,
        isLoadingMore,
        messagesContainerRef,
        handleScroll,
        sendMessage,
        completedAt,
        deleteMessage,
        editMessage,
        editingMsg,
        setEditingMsg,
        editInput,
        setEditInput,
        onlineStatuses,
        startedAt,
        status,
        audioRecordingUrl,
        consultationDuration
    } = useChat(appointmentId!, user);

    const [performanceTimer, setPerformanceTimer] = useState("00:00:00");

    useEffect(() => {
        if (status !== "IN_PROGRESS" || !startedAt) return;
        const interval = setInterval(() => {
            const start = new Date(startedAt).getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, now - start);
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            setPerformanceTimer(`${h}:${m}:${s}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [status, startedAt]);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    useEffect(() => {
        const timeSource = completedAt || completedAtParam;
        if (!timeSource) return;
        const updateTimer = () => {
            const completed = new Date(timeSource).getTime();
            const now = new Date().getTime();
            const diffMs = (completed + 24 * 60 * 60 * 1000) - now;
            if (diffMs <= 0) {
                setTimeLeft(isDoctor ? "Consultation Concluded" : "Consultation Period Expired");
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
    }, [completedAtParam, completedAt, isDoctor]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (chatExpired) {
            toast.error("Messaging disabled (24h limit reached)");
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
            toast.success(isDoctor ? "Clinical record shared" : "Medical record shared securey");
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
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

    if (!user) return <Navigate to="/auth" />;

    const doctor = participants?.doctor;
    const patient = participants?.patient;
    
    // Partner is the one the user is talking to
    const partner = isDoctor ? patient : doctor;
    const isPartnerOnline = partner?.userId ? onlineStatuses[partner.userId] : false;

    return (
        <div className="min-h-screen bg-[#f8fafc] flex justify-center py-10 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_20px_70px_-10px_rgba(30,41,59,0.1)] border border-slate-100 overflow-hidden flex flex-col h-[750px] relative ${isDoctor ? 'border-indigo-100' : ''}`}
            >
                {/* Header Section */}
                <div className={`px-8 py-6 border-b flex items-center gap-5 shrink-0 z-20 ${isDoctor ? 'bg-indigo-50/20 border-indigo-50' : 'bg-white border-slate-50'}`}>
                    <button 
                        onClick={() => navigate(-1)} 
                        className={`p-3 rounded-2xl transition-all border border-transparent ${isDoctor ? 'hover:bg-indigo-50 text-indigo-400 hover:text-indigo-900 hover:border-indigo-100' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-900 hover:border-slate-100'}`}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="relative group">
                        <div className={`w-14 h-14 rounded-2xl flex justify-center items-center overflow-hidden border shadow-inner ${isDoctor ? 'bg-white border-indigo-100/50' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-slate-100/50'}`}>
                            {partner?.profilePicture ? (
                                <img src={partner.profilePicture} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Partner" />
                            ) : (
                                <UserIcon size={24} className={isDoctor ? "text-indigo-300" : "text-blue-300"} />
                            )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full shadow-sm transition-colors duration-500 ${isPartnerOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-black text-slate-800 text-lg tracking-tight truncate flex items-center gap-2">
                            {isDoctor ? partner?.firstName ? `${partner.firstName} ${partner.lastName}` : "Patient Case" : doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Medical Consult"}
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {isDoctor ? `Appointment #${appointmentId}` : doctor?.speciality || 'General Medicine'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${isPartnerOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                                <span className={`w-1 h-1 rounded-full ${isPartnerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                {isPartnerOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>
                    <div className={`text-right hidden sm:flex flex-col items-end gap-1 px-4 py-2 rounded-2xl border ${isDoctor ? 'bg-indigo-50/30 border-indigo-100/50' : 'bg-slate-50/50 border-slate-100'}`}>
                        <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] ${isDoctor ? 'text-indigo-400' : 'text-slate-400'}`}>
                            <Clock size={12} className={isDoctor ? "text-indigo-400" : "text-blue-400"} /> {isDoctor ? "Window" : "Valid Until"}
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${chatExpired ? 'text-rose-500' : 'text-slate-700'}`}>
                            {timeLeft || "Active Consultation"}
                        </p>
                    </div>
                </div>
                
                {/* Live Consultation Banner */}
                <AnimatePresence>
                    {status === "IN_PROGRESS" && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-indigo-600 text-white overflow-hidden shadow-lg z-10"
                        >
                            <div className="px-8 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 pr-3 border-r border-white/10">
                                        <Activity size={14} className="text-indigo-300" />
                                        <div className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Consultation</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mic size={14} className="text-rose-300 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Recording Audio</span>
                                    </div>
                                </div>
                                <div className="font-mono text-xl font-black tracking-tighter text-white bg-indigo-700/50 px-4 py-1 rounded-xl border border-indigo-500/30">
                                    {performanceTimer}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Expired Banner */}
                <AnimatePresence>
                    {chatExpired && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-amber-50 border-b border-amber-100/50 overflow-hidden">
                            <div className="px-8 py-2.5 flex items-center gap-3">
                                <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Clock size={12} className="text-amber-600" />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">Digital consultation concluded. This record is now read-only.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Audio Recording Playback Banner */}
                <AnimatePresence>
                    {status === "COMPLETED" && audioRecordingUrl && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }} 
                            className="bg-slate-900 text-white overflow-hidden shadow-xl z-10 border-b border-slate-800"
                        >
                            <div className="px-8 py-4 flex items-center justify-between gap-6">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
                                        <Volume2 size={20} className="text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-white truncate">Consultation Recording</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            Session End • {consultationDuration ? formatDuration(consultationDuration) : "Saved Record"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center gap-4 max-w-sm">
                                    <audio 
                                        src={audioRecordingUrl} 
                                        controls 
                                        className="w-full h-8 custom-audio-player filter invert brightness-200"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Messages Viewport */}
                <div 
                    ref={messagesContainerRef} 
                    onScroll={handleScroll}
                    className={`flex-1 overflow-y-auto px-8 py-6 space-y-6 scroll-smooth scrollbar-hide ${isDoctor ? 'bg-slate-50/50' : 'bg-gradient-to-b from-slate-50/30 to-white'}`}
                >
                    {isLoadingMore && (
                        <div className="flex justify-center p-4">
                            <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin shadow-lg ${isDoctor ? 'border-indigo-500 shadow-indigo-200' : 'border-blue-500 shadow-blue-200'}`}></div>
                        </div>
                    )}
                    <AnimatePresence initial={false}>
                        {messages.length === 0 && !isLoadingMore ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-slate-300 gap-5 max-w-[280px] mx-auto text-center">
                                <div className={`w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center border shadow-inner ${isDoctor ? 'border-indigo-100' : 'border-slate-100'}`}>
                                    <HelpCircle size={32} className={`opacity-20 ${isDoctor ? 'text-indigo-600' : 'text-blue-600'}`} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Consultation Hub</p>
                                    <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                                        {isDoctor ? "Record is active for instructions." : "No messages found. You may start the clinical dialogue by typing below."}
                                    </p>
                                </div>
                            </motion.div>
                        ) : [
                            // System Greeting if newly started
                            messages.length > 0 && (
                                <motion.div key="sys-head" className="flex justify-center py-4">
                                    <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-100 flex items-center gap-2 shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Secure Consultation Session Active</span>
                                    </div>
                                </motion.div>
                            ),
                            ...messages.map((m) => (
                                <ChatMessage 
                                    key={m.id}
                                    m={m}
                                    user={user}
                                    isMe={m.senderId === user.id}
                                    chatExpired={chatExpired}
                                    editingMsg={editingMsg}
                                    setEditingMsg={setEditingMsg}
                                    editInput={editInput}
                                    setEditInput={setEditInput}
                                    onEdit={() => editMessage(m.id, editInput)}
                                    onDelete={deleteMessage}
                                    colorScheme={isDoctor ? "indigo" : "blue"}
                                />
                            ))
                        ]}
                    </AnimatePresence>
                </div>

                {/* Interaction Footer */}
                {!chatExpired ? (
                    <div className="p-8 bg-white border-t border-slate-50 flex gap-4 items-center shrink-0 z-10 relative">
                        <div className="flex-1 relative flex items-center group">
                            <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*,.pdf" />
                            <div className="absolute left-1 flex items-center gap-1">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className={`p-3 bg-white hover:bg-slate-50 rounded-2xl transition-all disabled:opacity-50 border shadow-sm ${isDoctor ? 'text-indigo-400 hover:text-indigo-600 border-indigo-50' : 'text-slate-400 hover:text-blue-600 border-slate-100'}`}
                                    title="Attach File"
                                >
                                    <Paperclip size={18} className={isUploading ? "animate-spin" : ""} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={isDoctor ? "Issue clinical instruction..." : "Consult with your doctor..."}
                                className={`w-full pl-16 pr-5 py-4 bg-slate-50/50 border rounded-[1.5rem] focus:ring-4 outline-none text-[15px] transition-all font-medium text-slate-700 placeholder:text-slate-300 shadow-inner ${isDoctor ? 'ring-indigo-50 border-indigo-100 focus:bg-white focus:border-indigo-200' : 'ring-blue-50 border-slate-100 focus:bg-white focus:border-blue-200'}`}
                            />
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() && !isUploading}
                            className={`w-14 h-14 bg-gradient-to-br text-white rounded-[1.5rem] flex justify-center items-center transition-all shadow-xl group overflow-hidden relative ${isDoctor ? 'from-indigo-600 to-violet-600 shadow-indigo-100' : 'from-blue-600 to-indigo-600 shadow-blue-100'}`}
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Send size={22} className="relative group-active:translate-x-1 group-active:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                ) : (
                    <div className="p-8 bg-slate-50 border-t border-slate-100 text-center shrink-0 select-none">
                         <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white rounded-full border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Messaging disabled - 24 hours elapsed since completion</p>
                         </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
