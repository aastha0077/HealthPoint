import { Clock } from "lucide-react";
import { motion } from "framer-motion";

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
    const next = appointments.find(a => a.status === "BOOKED" || a.status === "PENDING" || a.status === "IN_PROGRESS");

    return (
        <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-slate-200 group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-rose-600/20 transition-all duration-700" />
            
            <div className="relative z-10 w-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-rose-600/20 text-rose-400 rounded-full text-[9px] font-bold uppercase tracking-wider border border-rose-500/20">
                            Personnel Console
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">
                                Live: {inProgressCount > 0 ? 'Consulting' : 'Ready'}
                            </span>
                        </div>
                    </div>
                    {imminentAppt && (
                        <motion.span 
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[9px] font-bold uppercase tracking-wider border border-amber-500/20 flex items-center gap-1.5"
                        >
                            <Clock size={10} />
                            Imminent
                        </motion.span>
                    )}
                </div>

                {next ? (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex flex-col gap-3">
                            <h3 className="text-2xl font-bold tracking-tight">
                                {next.patient?.firstName} {next.patient?.lastName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-xs">
                                    <Clock size={14} className="text-rose-500" />
                                    {new Date(next.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {next.status === "IN_PROGRESS" && (
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                                        <span className="text-xl font-bold font-mono text-blue-400">{sessionTimer}</span>
                                    </div>
                                )}
                                <p className="uppercase tracking-wider text-[9px] font-bold text-rose-500">ID: {next.appointmentNumber}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => next.status === "IN_PROGRESS" ? onComplete(next.id) : onStart(next.id)}
                            className="px-8 py-3.5 bg-white text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-md active:scale-95"
                        >
                            {next.status === "IN_PROGRESS" ? "End Session" : "Start Session"}
                        </button>
                    </div>
                ) : (
                    <div className="py-2 text-center md:text-left">
                        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No imminent consultations</p>
                        <p className="text-slate-600 text-[10px] mt-1 font-bold">The personnel console will update automatically as bookings arrive.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
