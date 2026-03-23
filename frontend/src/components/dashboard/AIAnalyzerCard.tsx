import { motion } from "framer-motion";
import { Sparkles, Brain } from "lucide-react";
import { useNavigate } from "react-router";

export function AIAnalyzerMiniCard() {
    const navigate = useNavigate();
    
    return (
        <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => navigate("/symptom-checker")}
            className="bg-slate-900/90 backdrop-blur-3xl rounded-[2.5rem] p-6 text-white relative overflow-hidden group cursor-pointer shadow-2xl shadow-indigo-900/40 border border-white/10"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl animate-pulse" />
            
            <div className="relative z-10 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                        <Brain size={20} className="text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Diagnosis Engine</span>
                        </div>
                        <h3 className="text-lg font-black tracking-tighter leading-none">
                            AI Health <span className="text-indigo-400">Analyzer.</span>
                        </h3>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <p className="hidden md:block text-[10px] text-slate-400 font-bold max-w-[180px] leading-tight">
                        Analyze symptoms & find specialists instantly.
                    </p>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
                        <Sparkles size={14} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export function AIAnalyzerCard() {
    const navigate = useNavigate();
    
    return (
        <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => navigate("/symptom-checker")}
            className="bg-slate-900 rounded-[4rem] p-12 text-white relative overflow-hidden group cursor-pointer shadow-3xl shadow-indigo-900/40 border border-white/5"
        >
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-500/10 rounded-full -ml-20 -mb-20 blur-2xl" />
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-5 mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[2rem] flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-12">
                        <Brain size={32} className="text-white" />
                    </div>
                    <div className="px-6 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Diagnosis Engine v4.0</span>
                    </div>
                </div>
                
                <h3 className="text-4xl font-black tracking-tighter leading-none mb-6">
                    AI Health <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">Analyzer.</span>
                </h3>
                
                <p className="text-slate-400 font-bold leading-relaxed mb-12 max-w-sm">
                    Connect with our clinical intelligence to analyze symptoms and find the perfect specialist for you.
                </p>
                
                <div className="mt-auto flex items-center justify-between">
                    <div className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] group-hover:gap-6 transition-all border-b-2 border-indigo-500 pb-2">
                        Initialize Session <Sparkles size={16} className="text-indigo-400" />
                    </div>
                    
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all duration-500">
                        →
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
