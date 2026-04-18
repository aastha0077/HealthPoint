import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";

interface PdfPreviewModalProps {
    url: string | null;
    title: string;
    onClose: () => void;
    onDownload: () => void;
}

export function PdfPreviewModal({ url, title, onClose, onDownload }: PdfPreviewModalProps) {
    if (!url) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-8"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 10 }}
                    className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                >
                    <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onDownload}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                            >
                                <Download size={16} /> Generate & Save
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 w-full bg-slate-100 p-2 lg:p-4">
                        <iframe
                            src={`${url}#toolbar=0`}
                            className="w-full h-full rounded-2xl border border-slate-200 shadow-inner bg-white"
                            title="PDF Preview"
                        />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
