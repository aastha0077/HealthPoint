import { Calendar, ChevronRight } from "lucide-react";

interface ScheduleOverviewCardProps {
    totalAppointmentsToday: number;
    onOpenCalendar: () => void;
}

export const TimelineMatrixCard = ({ totalAppointmentsToday, onOpenCalendar }: ScheduleOverviewCardProps) => {
    return (
        <div 
            className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg group cursor-pointer border border-slate-800" 
            onClick={onOpenCalendar}
        >
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:scale-125 transition-transform duration-1000" />
            <div className="relative z-10 flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Calendar size={12} className="text-rose-500" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Schedule</span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight leading-tight uppercase">Clinical<br />Timeline</h3>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/5 backdrop-blur-md">
                    <span className="text-lg font-bold">{totalAppointmentsToday}</span>
                </div>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-rose-400 transition-colors">
                View Schedule
                <ChevronRight size={14} />
            </div>
        </div>
    );
};
