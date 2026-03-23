import { Calendar, ChevronRight } from "lucide-react";

interface ScheduleOverviewCardProps {
    totalAppointmentsToday: number;
    onOpenCalendar: () => void;
}

export const TimelineMatrixCard = ({ totalAppointmentsToday, onOpenCalendar }: ScheduleOverviewCardProps) => {
    return (
        <div 
            className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer border border-slate-800" 
            onClick={onOpenCalendar}
        >
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-125 transition-transform duration-1000" />
            <div className="relative z-10 flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={14} className="text-rose-500 shadow-lg shadow-rose-900/50" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Schedule Audit</span>
                    </div>
                    <h3 className="text-xl font-black tracking-tight leading-tight uppercase">Clinical<br />Timeline</h3>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5 backdrop-blur-md shadow-inner">
                    <span className="text-xl font-black">{totalAppointmentsToday}</span>
                </div>
            </div>
            <div className="pt-5 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-rose-400 transition-colors">
                Open Daily Schedule
                <ChevronRight size={16} />
            </div>
        </div>
    );
};
