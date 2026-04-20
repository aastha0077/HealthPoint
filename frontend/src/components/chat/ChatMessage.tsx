import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCheck, FileText, Image as ImageIcon, Pencil, Trash2, ArrowLeft, X, ShieldCheck } from "lucide-react";
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
    showMetadata?: boolean;
    compactMode?: boolean;
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
    colorScheme,
    showMetadata = true,
    compactMode = false
}: ChatMessageProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const isImage = m.fileType?.startsWith('image/') || m.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isPdf = m.fileType?.includes('pdf') || m.fileUrl?.endsWith('.pdf');

    const theme = {
        blue: {
            bg: 'bg-blue-600',
            bgSoft: 'bg-blue-50',
            text: 'text-blue-600',
            glow: 'shadow-blue-100'
        },
        indigo: {
            bg: 'bg-indigo-600',
            bgSoft: 'bg-indigo-50',
            text: 'text-indigo-600',
            glow: 'shadow-indigo-100'
        },
        rose: {
            bg: 'bg-rose-600',
            bgSoft: 'bg-rose-50',
            text: 'text-rose-600',
            glow: 'shadow-rose-100'
        },
        emerald: {
            bg: 'bg-emerald-600',
            bgSoft: 'bg-emerald-50',
            text: 'text-emerald-600',
            glow: 'shadow-emerald-100'
        }
    }[colorScheme];

    const isEditing = editingMsg?.id === m.id;

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex group/msg ${isMe ? 'justify-end' : 'justify-start'} ${compactMode ? 'mb-0.5' : 'mb-3'}`}
        >
            <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showMetadata && !isMe && m.sender && !compactMode && (
                    <span className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ml-2 ${m.sender.role === 'ADMIN' ? 'text-rose-600 flex items-center gap-1.5' : 'text-slate-400'}`}>
                        {m.sender.role === 'ADMIN' && <ShieldCheck size={11} className="fill-rose-50" />}
                        {m.sender.role === 'ADMIN' ? 'Admin Authority ' : ''}{m.sender.firstName} {m.sender.lastName}
                    </span>
                )}
                
                <div className="flex items-center gap-2 group">
                    {isMe && !chatExpired && !isEditing && !showDeleteConfirm && (
                        <div className="flex flex-col gap-1 opacity-0 group-hover/msg:opacity-100 transition-all duration-300 -translate-x-2 group-hover/msg:translate-x-0">
                            <button 
                                onClick={() => { setEditingMsg?.(m); setEditInput?.(m.content); }}
                                className="p-1 hover:bg-slate-100 rounded-md text-slate-300 hover:text-slate-600 transition-all"
                            >
                                <Pencil size={11} />
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-1 hover:bg-red-50 rounded-md text-slate-300 hover:text-red-500 transition-all"
                            >
                                <Trash2 size={11} />
                            </button>
                        </div>
                    )}

                    <div className={`relative px-4 py-3 shadow-sm transition-all duration-300 ${
                        isMe 
                          ? `${theme.bg} text-white ${compactMode ? 'rounded-2xl rounded-tr-md rounded-br-md mr-1' : 'rounded-[1.5rem] rounded-br-[0.3rem] shadow-xl shadow-rose-200/20'}` 
                          : `bg-white border border-slate-100/50 text-slate-800 ${compactMode ? 'rounded-2xl rounded-tl-md rounded-bl-md ml-1' : 'rounded-[1.5rem] rounded-bl-[0.3rem] shadow-sm'}`
                    } ${isEditing ? 'ring-4 ring-indigo-500/10' : ''}`}>
                        
                        <AnimatePresence mode="wait">
                            {showDeleteConfirm ? (
                                <motion.div key="del" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 py-1">
                                    <p className="text-[10px] font-black uppercase tracking-tighter">Discard?</p>
                                    <button onClick={() => setShowDeleteConfirm(false)} className="text-[9px] font-bold underline">No</button>
                                    <button onClick={() => { onDelete?.(m.id); setShowDeleteConfirm(false); }} className="text-[9px] font-black text-rose-300 hover:text-white uppercase transition-colors">Yes, Discard</button>
                                </motion.div>
                            ) : isEditing ? (
                                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-[200px] flex flex-col gap-3">
                                    <textarea 
                                        autoFocus
                                        className="w-full bg-black/10 border border-white/20 rounded-xl p-3 text-xs text-white placeholder:text-white/40 focus:outline-none"
                                        rows={3}
                                        value={editInput}
                                        onChange={(e) => setEditInput?.(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onEdit?.())}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setEditingMsg?.(null)} className="text-[9px] font-bold">Cancel</button>
                                        <button onClick={onEdit} className="px-3 py-1 bg-white text-rose-600 rounded-lg text-[9px] font-black uppercase">Save</button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="space-y-2">
                                    {m.fileUrl && (
                                        <div className="group/attach relative rounded-xl overflow-hidden mb-2">
                                            {isImage ? (
                                                <div className="relative">
                                                    <img src={m.fileUrl} alt="clinical" className="max-w-full h-auto max-h-60 object-cover rounded-lg" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/attach:opacity-100 transition-all flex items-center justify-center gap-4">
                                                        <button onClick={() => onPreviewFile?.(m.fileUrl!, "Attachment", 'image')} className="p-2 bg-white/20 rounded-full text-white backdrop-blur-md">
                                                            <ImageIcon size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={`p-4 rounded-xl flex items-center gap-4 ${isMe ? 'bg-white/10' : 'bg-slate-50'}`}>
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMe ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                                                        <FileText size={20} className={theme.text} />
                                                    </div>
                                                    <div className="min-w-[120px]">
                                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{isPdf ? 'Medical PDF' : 'Lab Result'}</p>
                                                        <button onClick={() => onPreviewFile?.(m.fileUrl!, "Document", isPdf ? 'pdf' : undefined)} className="text-[10px] font-black uppercase decoration-rose-400 hover:underline">View File</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {m.content && <p className="text-sm leading-tight font-semibold tracking-tight">{m.content}</p>}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {!isMe && !compactMode && (
                        <div className="flex flex-col gap-1 opacity-0 group-hover/msg:opacity-100 transition-all duration-300 translate-x-2 group-hover/msg:translate-x-0">
                             <span className="text-[8px] font-black text-slate-300 uppercase italic">Dispatch</span>
                        </div>
                    )}
                </div>

                {showMetadata && (
                    <div className={`flex items-center gap-2 mt-1.5 opacity-60 ${isMe ? 'flex-row-reverse mr-2' : 'ml-2'}`}>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {m.isEdited && <span className="ml-1 italic">(edited)</span>}
                        </span>
                        {isMe && (
                             <span className={m.isRead ? "text-emerald-500" : "text-slate-300"}>
                                 {m.isRead ? <CheckCheck size={10} /> : <Check size={10} />}
                             </span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
