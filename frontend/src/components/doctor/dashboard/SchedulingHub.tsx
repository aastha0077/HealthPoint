import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Activity, X, Calendar } from "lucide-react";

interface SchedulingHubProps {
    show: boolean;
    onClose: () => void;
    currentMonth: Date;
    changeMonth: (offset: number) => void;
    calendarDays: any[];
    selectedDate: string | null;
    setSelectedDate: (date: string | null) => void;
    appointmentsOnSelectedDate: any[];
}

export const SchedulingHub = ({ 
    show, 
    onClose, 
    currentMonth, 
    changeMonth, 
    calendarDays, 
    selectedDate, 
    setSelectedDate, 
    appointmentsOnSelectedDate 
}: SchedulingHubProps) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[85vh]"
                    >
                        <div className="bg-slate-900 px-8 py-6 flex items-center justify-between text-white shrink-0">
                            <div>
                                <h2 className="text-xl font-black tracking-tight">Practice Calendar</h2>
                                <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest mt-1">Schedule Audit</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                            {/* Calendar Grid */}
                            <div className="lg:col-span-12 xl:col-span-8 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-slate-900">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-all shadow-sm"><ChevronLeft size={18}/></button>
                                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-all shadow-sm"><ChevronRight size={18}/></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                                        <div key={d} className="text-center text-[9px] font-black text-slate-400 tracking-widest pb-4">{d}</div>
                                    ))}
                                    {calendarDays.map((day, i) => (
                                        <div key={i} className="aspect-square relative">
                                            {day && (
                                                <button
                                                    onClick={() => setSelectedDate(day.dateStr)}
                                                    className={`w-full h-full rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                                                        selectedDate === day.dateStr 
                                                        ? 'bg-rose-600 border-rose-600 text-white shadow-lg' 
                                                        : (day.count || 0) > 0 ? 'bg-rose-50 border-rose-100 text-rose-600 hover:border-rose-300' : 'bg-transparent border-slate-50 text-slate-400 hover:border-slate-200'
                                                    }`}
                                                >
                                                    <span className={`text-base font-black`}>{day.day}</span>
                                                    {(day.count || 0) > 0 && <span className={`text-[9px] font-black mt-1 ${selectedDate === day.dateStr ? 'text-rose-200 opacity-80' : 'text-rose-500'}`}>{day.count} Patient{day.count > 1 ? 's' : ''}</span>}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Daily Details */}
                            <div className="hidden xl:block lg:col-span-4 bg-slate-50 border-l border-slate-100 p-8 overflow-y-auto custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    {selectedDate ? (
                                        <motion.div key={selectedDate} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                            <div className="mb-8">
                                                <h4 className="text-xl font-black text-slate-900">{new Date(selectedDate).toLocaleDateString(undefined, {month:'long', day:'numeric'})}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{appointmentsOnSelectedDate.length} Patients Configured</p>
                                            </div>
                                            <div className="space-y-3">
                                                {appointmentsOnSelectedDate.length === 0 ? (
                                                    <div className="py-12 text-center">
                                                        <Activity size={32} className="mx-auto text-slate-200 mb-2" />
                                                        <p className="text-slate-300 font-bold italic text-xs">No entries found</p>
                                                    </div>
                                                ) : appointmentsOnSelectedDate.map(apt => (
                                                    <div key={apt.id} className="p-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-500">
                                                                <Clock size={12} />
                                                                <span>{new Date(apt.dateTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                            </div>
                                                            <span className={`text-[8px] font-black uppercase tracking-widest ${apt.status === 'COMPLETED' ? 'text-emerald-500' : 'text-indigo-600'}`}>{apt.status}</span>
                                                        </div>
                                                        <p className="font-black text-slate-800 text-sm tracking-tight truncate">{apt.patient?.firstName} {apt.patient?.lastName}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="EMPTY" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center text-slate-300 py-20 translate-y-[-20%]">
                                            <Calendar size={48} className="opacity-20 mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] max-w-[150px]">Choose a date to audit details</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
