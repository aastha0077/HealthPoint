import { Clock, CheckCircle2, Ban } from "lucide-react";

interface StatsGridProps {
    stats: {
        upcoming: number;
        completed: number;
        cancelled: number;
    };
}

export function StatsGrid({ stats }: StatsGridProps) {
    const items = [
        { label: "Upcoming", count: stats.upcoming, color: "text-rose-600", bg: "bg-rose-100", icon: Clock },
        { label: "Completed", count: stats.completed, color: "text-emerald-600", bg: "bg-emerald-100", icon: CheckCircle2 },
        { label: "Cancelled", count: stats.cancelled, color: "text-slate-500", bg: "bg-slate-100", icon: Ban },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {items.map(({ label, count, color, bg, icon: Icon }) => (
                <div key={label} className="bg-white rounded-2xl border border-rose-100 shadow-sm p-5 flex items-center gap-4">
                    <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`${color} w-5 h-5`} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{count}</p>
                        <p className="text-sm text-slate-500">{label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
