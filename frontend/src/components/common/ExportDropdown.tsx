import { useState, useRef, useEffect } from "react";
import { FileDown, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExportDropdownProps {
    onExportAll: () => void;
    onExportPage: () => void;
    className?: string;
}

export function ExportDropdown({ onExportAll, onExportPage, className = "" }: ExportDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md flex items-center gap-2 group w-full justify-center md:w-auto"
            >
                <FileDown size={14} className="text-rose-400 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline">Export</span>
                <span className="inline md:hidden">Export Data</span>
                <ChevronDown size={14} className={`transition-transform text-slate-400 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-20 origin-top-right"
                    >
                        <button 
                            onClick={() => { onExportPage(); setIsOpen(false); }}
                            className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-50 hover:text-indigo-600"
                        >
                            Export This Page
                        </button>
                        <button 
                            onClick={() => { onExportAll(); setIsOpen(false); }}
                            className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-colors hover:text-indigo-600"
                        >
                            Export All Data
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
