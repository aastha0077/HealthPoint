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
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {stats.map((s, idx) => (
                <div key={idx} className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group ${s.hover} transition-all`}>
                    <div className="flex items-center gap-2 mb-2.5">
                        <div className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center ${s.text}`}>
                            <s.icon size={14} />
                        </div>
                        <p className="text-[9px] font-bold uppercase text-slate-500 tracking-wider font-montserrat">{s.label}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <p className="text-lg font-bold text-slate-900">{s.value}</p>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">{s.suffix}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
