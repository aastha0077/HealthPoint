import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCheck, FileText, Image as ImageIcon, Pencil, Trash2, ArrowLeft, X } from "lucide-react";
import { handleDownload } from "@/utils/file";
import { useState } from "react";

interface ChatMessageProps {
    m: any;
    user?: any;
    isMe: boolean;
    chatExpired?: boolean;
    editingMsg?: any;
    setEditingMsg?: (m: any) => void;
    editInput?: string;
    setEditInput?: (s: string) => void;
    onEdit?: () => void;
    onDelete?: (id: number) => void;
    onPreviewFile?: (url: string, title: string, type?: 'image' | 'pdf') => void;
    colorScheme: 'blue' | 'indigo' | 'rose' | 'emerald';
}

export function ChatMessage({ 
    m, 
    user: _user, 
    isMe, 
    chatExpired = false, 
    editingMsg, 
    setEditingMsg, 
    editInput, 
    setEditInput, 
    onEdit, 
    onDelete,
    onPreviewFile,
    colorScheme
}: ChatMessageProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const isImage = m.fileType?.startsWith('image/') || m.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isPdf = m.fileType?.includes('pdf') || m.fileUrl?.endsWith('.pdf');

    const theme = {
        blue: {
            bg: 'bg-blue-600',
            bgSoft: 'bg-blue-500/10',
            bgGlass: 'bg-blue-600/90 backdrop-blur-md',
            text: 'text-blue-600',
            icon: 'text-blue-500',
            border: 'border-blue-100',
            glow: 'shadow-blue-200'
        },
        indigo: {
            bg: 'bg-indigo-600',
            bgSoft: 'bg-indigo-500/10',
            bgGlass: 'bg-indigo-600/90 backdrop-blur-md',
            text: 'text-indigo-600',
            icon: 'text-indigo-500',
            border: 'border-indigo-100',
            glow: 'shadow-indigo-200'
        },
        rose: {
            bg: 'bg-rose-600',
            bgSoft: 'bg-rose-500/10',
            bgGlass: 'bg-rose-600/90 backdrop-blur-md',
            text: 'text-rose-600',
            icon: 'text-rose-500',
            border: 'border-rose-100',
            glow: 'shadow-rose-200'
        },
        emerald: {
            bg: 'bg-emerald-600',
            bgSoft: 'bg-emerald-500/10',
            bgGlass: 'bg-emerald-600/90 backdrop-blur-md',
            text: 'text-emerald-600',
            icon: 'text-emerald-500',
            border: 'border-emerald-100',
            glow: 'shadow-emerald-200'
        }
    }[colorScheme];

    const isEditing = editingMsg?.id === m.id;

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className={`flex group/msg ${isMe ? 'justify-end' : 'justify-start'} mb-1`}
        >
            <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && m.sender && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">
                        {m.sender.firstName} {m.sender.lastName}
                    </span>
                )}
                {/* Actions Toolbar (Desktop) */}
                {isMe && !chatExpired && !isEditing && !showDeleteConfirm && (
                    <div className="flex items-center gap-1 mb-1 opacity-0 group-hover/msg:opacity-100 transition-all duration-300 translate-y-1 group-hover/msg:translate-y-0">
                        <button 
                            onClick={() => {
                                setEditingMsg(m);
                                setEditInput(m.content);
                            }}
                            className={`p-1.5 hover:bg-white rounded-lg text-slate-400 hover:${theme.text} transition-all shadow-sm border border-slate-100 bg-slate-50/50`}
                            title="Edit"
                        >
                            <Pencil size={11} />
                        </button>
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-all shadow-sm border border-slate-100 bg-slate-50/50"
                            title="Delete"
                        >
                            <Trash2 size={11} />
                        </button>
                    </div>
                )}

                <div className="relative">
                    <div className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 ${
                        isMe 
                          ? `${theme.bg} text-white rounded-br-none ${theme.glow}` 
                          : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-indigo-100/10 hover:shadow-md'
                    } ${isEditing ? 'ring-2 ring-offset-2 ring-blue-400/50' : ''}`}>
                        
                        <AnimatePresence mode="wait">
                            {showDeleteConfirm ? (
                                <motion.div 
                                    key="delete-confirm"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex flex-col items-center gap-3 py-1 min-w-[160px]"
                                >
                                    <p className="text-[10px] uppercase font-black tracking-widest opacity-90">Delete permanently?</p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                        >
                                            No
                                        </button>
                                        <button 
                                            onClick={() => {
                                                onDelete(m.id);
                                                setShowDeleteConfirm(false);
                                            }}
                                            className="px-3 py-1 bg-rose-500 hover:bg-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-900/20"
                                        >
                                            Yes, Delete
                                        </button>
                                    </div>
                                </motion.div>
                            ) : isEditing ? (
                                <motion.div 
                                    key="edit-form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col gap-3 min-w-[240px]"
                                >
                                    <div className="flex items-center justify-between opacity-80 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Pencil size={10} /> Editing Message
                                        </span>
                                        <button onClick={() => setEditingMsg(null)} className="hover:rotate-90 transition-transform">
                                            <X size={12} />
                                        </button>
                                    </div>
                                    <textarea 
                                        autoFocus
                                        className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 ring-white/30 transition-all font-medium"
                                        rows={3}
                                        value={editInput}
                                        onChange={(e) => setEditInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                onEdit();
                                            }
                                        }}
                                        placeholder="Type corrections..."
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => setEditingMsg(null)}
                                            className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={onEdit}
                                            className="px-4 py-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg"
                                        >
                                            Update Message
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {m.fileUrl && (
                                        <div className="mb-3 group/attach relative rounded-xl overflow-hidden">
                                            {isImage ? (
                                                <div className="relative">
                                                    <img src={m.fileUrl} alt="attachment" className="rounded-xl max-w-full h-auto max-h-64 object-cover border border-white/10" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/attach:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                                        <button 
                                                            onClick={() => onPreviewFile?.(m.fileUrl!, "Clinical Image", 'image')}
                                                            className="p-2.5 bg-white/20 backdrop-blur-xl rounded-2xl text-white hover:bg-white/40 transition-all border border-white/20"
                                                        >
                                                            <ImageIcon size={20} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDownload(m.fileUrl!, `clinical-img-${m.id || Date.now()}.jpg`)}
                                                            className="p-2.5 bg-white/20 backdrop-blur-xl rounded-2xl text-white hover:bg-white/40 transition-all border border-white/20"
                                                        >
                                                            <ArrowLeft size={20} className="rotate-[270deg]" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-2 min-w-[200px]">
                                                    <div className={`p-4 rounded-xl ${isMe ? 'bg-white/10' : 'bg-slate-50'} border border-white/10 flex items-center gap-4 transition-all hover:bg-opacity-20`}>
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isMe ? 'bg-white/20' : 'bg-white shadow-sm'} ${theme.text}`}>
                                                            <FileText size={24} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">{isPdf ? 'Medical PDF' : 'Laboratory Report'}</p>
                                                            <div className="flex gap-3">
                                                                <button 
                                                                    onClick={() => onPreviewFile?.(m.fileUrl!, isPdf ? "Medical Document" : "Laboratory Result", isPdf ? 'pdf' : undefined)}
                                                                    className="text-[9px] font-bold uppercase tracking-widest hover:underline hover:opacity-100 opacity-80 transition-all text-left"
                                                                >
                                                                    Preview Record
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDownload(m.fileUrl!, `medical-record-${m.id || Date.now()}.${isPdf ? 'pdf' : 'docx'}`)}
                                                                    className="text-[9px] font-bold uppercase tracking-widest hover:underline hover:opacity-100 opacity-80 transition-all"
                                                                >
                                                                    Save Record
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {m.content && (
                                        <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{m.content}</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Status & Time */}
                    <div className={`flex items-center gap-2 mt-1.5 px-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {m.isEdited && <span className="ml-1 text-slate-300 italic">(edited)</span>}
                        </span>
                        {isMe && (
                            <div className="flex items-center gap-1 opacity-80">
                                <span className={m.isRead ? "text-emerald-500" : "text-slate-300"}>
                                    {m.isRead ? <CheckCheck size={10} /> : <Check size={10} />}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
