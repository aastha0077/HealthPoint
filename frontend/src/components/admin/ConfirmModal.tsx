import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, Info, X, Sparkles, Mail } from "lucide-react";

interface ConfirmModalProps {
    show: boolean;
    title: string;
    message: string;
    type?: 'DANGER' | 'WARNING' | 'INFO' | 'SUCCESS';
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export function ConfirmModal({
    show,
    title,
    message,
    type = 'INFO',
    onConfirm,
    onCancel,
    confirmText = "Execute Command",
    cancelText = "Abort Action"
}: ConfirmModalProps) {
    const getStyles = () => {
        switch (type) {
            case 'DANGER':
                return {
                    bg: 'bg-rose-50/50',
                    iconBg: 'bg-rose-500 shadow-rose-200',
                    confirmBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
                    icon: <Trash2 size={32} />
                };
            case 'WARNING':
                return {
                    bg: 'bg-amber-50/50',
                    iconBg: 'bg-amber-500 shadow-amber-200',
                    confirmBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
                    icon: <AlertTriangle size={32} />
                };
            case 'SUCCESS':
                return {
                    bg: 'bg-emerald-50/50',
                    iconBg: 'bg-emerald-500 shadow-emerald-200',
                    confirmBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
                    icon: <Sparkles size={32} />
                };
            default:
                return {
                    bg: 'bg-blue-50/50',
                    iconBg: 'bg-blue-500 shadow-blue-200',
                    confirmBg: 'bg-slate-900 hover:bg-slate-800 shadow-slate-200',
                    icon: <Info size={32} />
                };
        }
    };

    const styles = getStyles();

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100"
                    >
                        <div className={`p-8 pb-6 flex items-center gap-6 ${styles.bg}`}>
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-sm ${styles.iconBg}`}>
                                {styles.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">System Security Protocol</p>
                            </div>
                            <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <p className="text-slate-500 font-medium leading-relaxed">
                                {message}
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-4 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onCancel();
                                    }}
                                    className={`flex-[2] py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${styles.confirmBg}`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
