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
            className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:border-rose-100 transition-all cursor-pointer" 
            onClick={() => navigate('/doctor-panel/messages')}
        >
            <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform relative border border-rose-100 shadow-sm">
                <MessageSquare size={32} />
                {unreadTotal > 0 && (
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-black border-4 border-white shadow-lg">
                        {unreadTotal}
                    </span>
                )}
            </div>
            <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Patient Messages</h4>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">Live Inbox</span>
                </div>
                <p className="text-slate-400 text-sm font-bold leading-relaxed mb-4">
                    {unreadTotal > 0 
                        ? `You have ${unreadTotal} unread messages waiting for your clinical review.` 
                        : "No unread messages. All patient follow-ups are up to date."}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <button className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                        View All Conversations
                    </button>
                    <div className="flex -space-x-2">
                        {conversations.slice(0, 5).map((c, i) => (
                            <div key={i} className="w-9 h-9 rounded-xl border-2 border-white bg-slate-100 overflow-hidden ring-1 ring-slate-100 transition-transform hover:scale-110 hover:z-10 shadow-sm">
                                <img src={`https://ui-avatars.com/api/?name=${c.patientName}&background=f1f5f9&color=f43f5e&bold=true`} alt={c.patientName} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <ChevronRight className="text-slate-200 group-hover:text-rose-500 group-hover:translate-x-1 transition-all hidden lg:block" size={24} />
        </div>
    );
};
