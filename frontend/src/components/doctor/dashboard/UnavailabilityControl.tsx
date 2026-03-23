import { AlertTriangle } from "lucide-react";

interface UnavailabilityControlProps {
    unavailableDate: string;
    setUnavailableDate: (date: string) => void;
    isMarkingUnavailable: boolean;
    onMarkUnavailable: () => void;
}

export const UnavailabilityControl = ({ 
    unavailableDate, 
    setUnavailableDate, 
    isMarkingUnavailable, 
    onMarkUnavailable 
}: UnavailabilityControlProps) => {
    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-900 tracking-tight">Time-Off Control</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mark Unavailable</p>
                </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mb-5 leading-relaxed">
                Limit: 4 days/month. Once marked, patients are automatically notified and rescheduled.
            </p>
            <div className="flex gap-2">
                <input
                    type="date"
                    value={unavailableDate}
                    onChange={(e) => setUnavailableDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                    onClick={onMarkUnavailable}
                    disabled={isMarkingUnavailable || !unavailableDate}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg"
                >
                    {isMarkingUnavailable ? '...' : 'Mark'}
                </button>
            </div>
        </div>
    );
};
