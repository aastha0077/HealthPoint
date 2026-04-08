import React, { useState } from "react";
import { Search, AlertCircle, RefreshCw, Star } from "lucide-react";
import { DoctorCard } from "../DoctorCard";
import { motion, AnimatePresence } from "framer-motion";

interface DoctorStepProps {
    doctors: any[];
    loadingDoctors: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedDoctor: any;
    onSelectDoctor: (doctor: any) => void;
    isFavorite: (id: number) => boolean;
    toggleFavorite: (id: number) => void;
    lastDoctorRef: (node: HTMLDivElement | null) => void;
    isFetchingMore: boolean;
}

export const DoctorStep: React.FC<DoctorStepProps> = ({
    doctors,
    loadingDoctors,
    searchQuery,
    setSearchQuery,
    selectedDoctor,
    onSelectDoctor,
    isFavorite,
    toggleFavorite,
    lastDoctorRef,
    isFetchingMore
}) => {
    const [showFavsOnly, setShowFavsOnly] = useState(false);

    const filteredDoctors = showFavsOnly 
        ? doctors.filter(doc => isFavorite(doc.id))
        : [...doctors].sort((a, b) => (isFavorite(b.id) ? 1 : 0) - (isFavorite(a.id) ? 1 : 0));

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Available Specialists</h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">Select the best doctor for your needs</p>
                </div>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    <button
                        onClick={() => setShowFavsOnly(!showFavsOnly)}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            showFavsOnly 
                            ? 'bg-rose-500 text-white shadow-xl shadow-rose-200' 
                            : 'bg-white text-slate-400 border-2 border-slate-100 hover:border-rose-200 hover:text-rose-500'
                        }`}
                    >
                        <Star size={16} className={showFavsOnly ? 'fill-white' : ''} />
                        {showFavsOnly ? "All Specialists" : "My Favourites"}
                    </button>
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-rose-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Find by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 placeholder-slate-300 focus:outline-none focus:bg-white focus:border-rose-100 transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {loadingDoctors && doctors.length === 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 rounded-3xl bg-slate-50 animate-pulse border-2 border-slate-100" />
                    ))}
                </div>
            ) : filteredDoctors.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100"
                >
                    <AlertCircle className="mx-auto mb-4 text-slate-300" size={48} />
                    <p className="text-lg font-black text-slate-400">
                        {showFavsOnly 
                            ? "You haven't favorited any specialists yet." 
                            : "No specialists found matching your search."}
                    </p>
                    {showFavsOnly && (
                        <button 
                            onClick={() => setShowFavsOnly(false)}
                            className="mt-4 text-rose-500 font-black uppercase tracking-widest text-[10px] hover:underline"
                        >
                            View All Specialists
                        </button>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4 custom-scrollbar pr-1 max-h-[52vh] overflow-y-auto"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredDoctors.map((doc, index) => (
                            <motion.div
                                key={`${doc.id}-${index}`}
                                variants={item}
                                ref={!showFavsOnly && index === filteredDoctors.length - 1 ? lastDoctorRef : undefined}
                                layout
                            >
                                <DoctorCard
                                    doctor={doc}
                                    isSelected={selectedDoctor?.id === doc.id}
                                    isFavorite={isFavorite(doc.id)}
                                    onSelect={onSelectDoctor}
                                    onToggleFavorite={toggleFavorite}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isFetchingMore && !showFavsOnly && (
                        <div className="col-span-full py-6 flex justify-center">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow border border-slate-100 animate-bounce">
                                <RefreshCw size={16} className="animate-spin text-rose-500" />
                                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Loading more specialists</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};
