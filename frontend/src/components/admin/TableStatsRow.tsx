import { motion } from "framer-motion";

export interface StatItem {
    label: string;
    value: React.ReactNode;
    color?: "emerald" | "blue" | "rose" | "violet" | "amber" | "slate";
}

export function TableStatsRow({ stats }: { stats: StatItem[] }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {stats.map((s, i) => {
                const color = s.color || "slate";
                const bgColors: Record<string, string> = {
                    emerald: "bg-emerald-50 border-emerald-100",
                    blue: "bg-blue-50 border-blue-100",
                    rose: "bg-rose-50 border-rose-100",
                    violet: "bg-violet-50 border-violet-100",
                    amber: "bg-amber-50 border-amber-100",
                    slate: "bg-white border-slate-100"
                };
                const textColors: Record<string, string> = {
                    emerald: "text-emerald-600",
                    blue: "text-blue-600",
                    rose: "text-rose-600",
                    violet: "text-violet-600",
                    amber: "text-amber-600",
                    slate: "text-slate-900"
                };
                
                return (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className={`px-3 py-2 rounded-lg border shadow-sm flex items-center justify-between ${bgColors[color]}`}
                    >
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                        <p className={`text-lg font-black tracking-tight ${textColors[color]}`}>{s.value}</p>
                    </motion.div>
                );
            })}
        </div>
    );
}
