import { Clock, Play, CheckCircle2, User, ArrowRight, Stethoscope, Timer, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface PersonnelConsoleProps {
    appointments: any[];
    imminentAppt: any;
    inProgressCount: number;
    sessionTimer: string;
    onStart: (id: number) => void;
    onComplete: (id: number) => void;
}

export const PersonnelConsole = ({ 
    appointments, 
    imminentAppt, 
    inProgressCount, 
    sessionTimer, 
    onStart, 
    onComplete 
}: PersonnelConsoleProps) => {
    // Separate active (IN_PROGRESS) from queued (BOOKED/PENDING/WAITING)
    const activeSession = useMemo(() => 
        appointments.find(a => a.status === "IN_PROGRESS"), [appointments]);
    
    const queuedAppointments = useMemo(() => 
        appointments
            .filter(a => a.status === "BOOKED" || a.status === "PENDING" || a.status === "WAITING")
            .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
        [appointments]
    );

    const completedToday = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return appointments.filter(a => a.status === "COMPLETED" && a.dateTime?.startsWith(todayStr)).length;
    }, [appointments]);

    const totalToday = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return appointments.filter(a => a.dateTime?.startsWith(todayStr) && a.status !== "CANCELLED").length;
    }, [appointments]);

    const nextInQueue = queuedAppointments[0];

    // Time until next appointment
    const getTimeUntil = (dateTime: string) => {
        const diff = new Date(dateTime).getTime() - Date.now();
        if (diff <= 0) return "Now";
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        return `${hrs}h ${mins % 60}m`;
    };

    return (
        <div className="space-y-4">
            {/* Active Session Card */}
            <AnimatePresence mode="wait">
                {activeSession ? (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-xl shadow-slate-200"
                    >
                        {/* Ambient glow */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-violet-600/15 rounded-full -mr-12 -mt-12 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full -ml-12 -mb-12 blur-3xl" />
                        
                        <div className="relative z-10">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400">Session Active</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                                    <Timer size={12} className="text-blue-400" />
                                    <span className="text-lg font-bold font-mono text-blue-300 tracking-wider">{sessionTimer}</span>
                                </div>
                            </div>
                            
                            {/* Patient info + action */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                                        <User size={22} className="text-violet-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight">
                                            {activeSession.patient?.firstName} {activeSession.patient?.lastName}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                {activeSession.appointmentNumber}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-500">•</span>
                                            <span className="text-[9px] font-bold text-rose-400">
                                                {new Date(activeSession.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onComplete(activeSession.id)}
                                    className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-500 transition-all shadow-lg shadow-rose-500/25 active:scale-95 flex items-center gap-2"
                                >
                                    <CheckCircle2 size={14} />
                                    End Session
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : nextInQueue ? (
                    <motion.div
                        key="next"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-xl shadow-slate-200"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-600/10 rounded-full -mr-12 -mt-12 blur-3xl" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Ready to Consult</span>
                                </div>
                                {imminentAppt && (
                                    <motion.span 
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-[8px] font-black uppercase tracking-wider border border-amber-500/20 flex items-center gap-1.5"
                                    >
                                        <Clock size={9} /> Starting Soon
                                    </motion.span>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <User size={22} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight">
                                            {nextInQueue.patient?.firstName} {nextInQueue.patient?.lastName}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                {nextInQueue.appointmentNumber}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-500">•</span>
                                            <span className="text-[9px] font-bold text-rose-400">
                                                {new Date(nextInQueue.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onStart(nextInQueue.id)}
                                    className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-md active:scale-95 flex items-center gap-2"
                                >
                                    <Play size={14} />
                                    Start Session
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-xl shadow-slate-200"
                    >
                        <div className="relative z-10 py-3 text-center">
                            <Stethoscope size={28} className="text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No pending consultations</p>
                            <p className="text-slate-600 text-[9px] mt-1 font-bold">Queue will update automatically as bookings arrive.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Queue Progress Bar */}
            {totalToday > 0 && (
                <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">Today's Progress</span>
                        <span className="text-[10px] font-black text-slate-700">
                            {completedToday}<span className="text-slate-300"> / </span>{totalToday}
                        </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${totalToday > 0 ? (completedToday / totalToday) * 100 : 0}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                </div>
            )}

            {/* Upcoming Queue List */}
            {queuedAppointments.length > (activeSession ? 0 : 1) && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock size={12} className="text-slate-400" />
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
                                Upcoming Queue
                            </span>
                        </div>
                        <span className="text-[9px] font-black text-rose-500">
                            {activeSession ? queuedAppointments.length : queuedAppointments.length - 1} waiting
                        </span>
                    </div>
                    
                    <div className="divide-y divide-slate-50">
                        {(activeSession ? queuedAppointments : queuedAppointments.slice(1)).map((apt, idx) => {
                            const timeUntil = getTimeUntil(apt.dateTime);
                            const isImminent = imminentAppt?.id === apt.id;
                            
                            return (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/80 transition-all group ${isImminent ? 'bg-amber-50/30' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Queue position indicator */}
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black ${
                                            isImminent 
                                                ? 'bg-amber-100 text-amber-600 border border-amber-200' 
                                                : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                        
                                        {/* Patient info */}
                                        <div>
                                            <p className="font-bold text-slate-800 text-[11px] leading-tight">
                                                {apt.patient?.firstName} {apt.patient?.lastName}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {apt.appointmentNumber}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Time badge */}
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-600">
                                                {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className={`text-[7px] font-black uppercase tracking-wider ${
                                                timeUntil === 'Now' ? 'text-emerald-500' : isImminent ? 'text-amber-500' : 'text-slate-400'
                                            }`}>
                                                {timeUntil === 'Now' ? '● Ready' : `in ${timeUntil}`}
                                            </p>
                                        </div>

                                        {/* Start button - only show if no active session */}
                                        {!activeSession && (
                                            <button
                                                onClick={() => onStart(apt.id)}
                                                className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-rose-600 transition-all flex items-center gap-1"
                                            >
                                                <Play size={9} />
                                                Start
                                            </button>
                                        )}
                                        
                                        {activeSession && (
                                            <ChevronRight size={14} className="text-slate-200" />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
