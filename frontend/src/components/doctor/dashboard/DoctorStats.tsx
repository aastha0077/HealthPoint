import { Users, Award, Activity, Clock, Heart, Star, Zap } from "lucide-react";

interface DoctorStatsProps {
    doctorStats: { totalCompleted: number; totalPatients: number };
    upcomingCount: number;
    todayCount: number;
}

export const DoctorStats = ({ doctorStats, upcomingCount, todayCount }: DoctorStatsProps) => {
    const stats = [
        { 
            label: "Total Patients", 
            value: doctorStats.totalPatients, 
            suffix: "Lifetime", 
            icon: Users, 
            bg: "bg-rose-50", 
            text: "text-rose-600", 
            hover: "hover:border-rose-100" 
        },
        { 
            label: "Completed", 
            value: doctorStats.totalCompleted, 
            suffix: "Sessions", 
            icon: Award, 
            bg: "bg-emerald-50", 
            text: "text-emerald-600", 
            hover: "hover:border-emerald-100" 
        },
        { 
            label: "Upcoming", 
            value: upcomingCount, 
            suffix: "Appointments", 
            icon: Activity, 
            bg: "bg-indigo-50", 
            text: "text-indigo-600", 
            hover: "hover:border-indigo-100" 
        },
        { 
            label: "Today", 
            value: todayCount, 
            suffix: "Patients", 
            icon: Clock, 
            bg: "bg-amber-50", 
            text: "text-amber-600", 
            hover: "hover:border-amber-100" 
        },
        { 
            label: "Retention", 
            value: "88%", 
            suffix: "Rate", 
            icon: Heart, 
            bg: "bg-rose-50", 
            text: "text-rose-500", 
            hover: "hover:border-rose-200" 
        },
        { 
            label: "Rating", 
            value: "4.8/5", 
            suffix: "Feedback", 
            icon: Star, 
            bg: "bg-amber-50", 
            text: "text-amber-500", 
            hover: "hover:border-amber-200" 
        },
        { 
            label: "Efficiency", 
            value: "High", 
            suffix: "Speed", 
            icon: Zap, 
            bg: "bg-indigo-50", 
            text: "text-indigo-500", 
            hover: "hover:border-indigo-200" 
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {stats.map((s, idx) => (
                <div key={idx} className={`bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm group ${s.hover} transition-all`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center ${s.text}`}>
                            <s.icon size={16} />
                        </div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <p className="text-xl font-black text-slate-900">{s.value}</p>
                        <span className="text-[8px] font-black text-slate-300 uppercase">{s.suffix}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
