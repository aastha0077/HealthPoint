import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText, ImageIcon } from "lucide-react";

interface AssetPreviewModalProps {
    url: string | null;
    title: string;
    type?: 'image' | 'pdf';
    onClose: () => void;
}

export function AssetPreviewModal({ url, title, type, onClose }: AssetPreviewModalProps) {
    if (!url) return null;

    const isImage = type === 'image' || url.startsWith('data:image') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || url.includes('image/');
    const isPdf = type === 'pdf' || url.startsWith('blob:') || url.match(/\.pdf$/i) || url.includes('pdf');

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'healthpoint-record');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8 cursor-pointer"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[90vh] flex flex-col shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20 cursor-default"
                >
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPdf ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                {isPdf ? <FileText size={24} /> : <ImageIcon size={24} />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Secure Document Preview</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95"
                            >
                                <Download size={16} /> Save Document
                            </button>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 w-full bg-slate-50/50 p-4 lg:p-8 overflow-hidden relative">
                        {isImage ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <img 
                                    src={url} 
                                    alt="Preview" 
                                    className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white object-contain"
                                />
                            </div>
                        ) : isPdf ? (
                            <iframe
                                src={`${url}#view=FitH`}
                                className="w-full h-full rounded-2xl border border-slate-200 shadow-2xl bg-white"
                                title="PDF Preview"
                            />
                        ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400">
                                    <FileText size={40} />
                                </div>
                                <p className="text-slate-500 font-bold">This file type cannot be previewed directly.</p>
                                <button onClick={handleDownload} className="text-blue-600 font-black uppercase tracking-widest text-[10px] hover:underline">Download instead</button>
                             </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
