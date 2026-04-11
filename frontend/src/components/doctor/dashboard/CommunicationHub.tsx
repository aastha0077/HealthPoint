import { MessageSquare, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

interface CommunicationHubProps {
    conversations: any[];
}

export const CommunicationHub = ({ conversations }: CommunicationHubProps) => {
    const navigate = useNavigate();
    const unreadTotal = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

    return (
        <div 
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:border-rose-100 transition-all cursor-pointer" 
            onClick={() => navigate('/doctor-panel/messages')}
        >
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform relative border border-rose-100 shadow-sm">
                <MessageSquare size={24} />
                {unreadTotal > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white shadow-md">
                        {unreadTotal}
                    </span>
                )}
            </div>
            <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                    <h4 className="text-lg font-bold text-slate-900 tracking-tight">Patient Messages</h4>
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-bold uppercase tracking-wider border border-emerald-100">Live</span>
                </div>
                <p className="text-slate-500 text-[11px] font-semibold leading-relaxed mb-4">
                    {unreadTotal > 0 
                        ? `You have ${unreadTotal} unread messages.` 
                        : "No unread messages. All up to date."}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm">
                        View All
                    </button>
                    <div className="flex -space-x-1.5">
                        {conversations.slice(0, 5).map((c, i) => (
                            <div key={i} className="w-7 h-7 rounded-lg border-2 border-white bg-slate-100 overflow-hidden ring-1 ring-slate-100 transition-transform hover:scale-110 hover:z-10 shadow-sm">
                                <img src={`https://ui-avatars.com/api/?name=${c.patientName}&background=f1f5f9&color=f43f5e&bold=true`} alt={c.patientName} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all hidden lg:block" size={20} />
        </div>
    );
};
