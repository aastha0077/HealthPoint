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
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 border border-amber-100">
                    <AlertTriangle size={16} />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-900 tracking-tight">Time-Off</h4>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">Status Control</p>
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold mb-4 leading-relaxed">
                Patients are notified and rescheduled if you mark a day off.
            </p>
            <div className="flex gap-2">
                <input
                    type="date"
                    value={unavailableDate}
                    onChange={(e) => setUnavailableDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                    onClick={onMarkUnavailable}
                    disabled={isMarkingUnavailable || !unavailableDate}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all shadow-sm"
                >
                    {isMarkingUnavailable ? '...' : 'Mark'}
                </button>
            </div>
        </div>
    );
};
