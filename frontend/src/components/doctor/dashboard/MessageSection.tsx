import { RefreshCw, MessageSquare, Clock } from "lucide-react";

interface MessageSectionProps {
    conversations: any[];
    isLoading: boolean;
    onRefresh: () => void;
    onOpenChat: (conv: any) => void;
}

export const MessageSection = ({ conversations, isLoading, onRefresh, onOpenChat }: MessageSectionProps) => {
    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">Patient Conversations</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active Follow-up Messages</p>
                </div>
                <button onClick={onRefresh} className="p-2 bg-white hover:bg-slate-50 rounded-xl transition-all shadow-sm border border-slate-100">
                    <RefreshCw size={18} className={isLoading ? "animate-spin text-rose-500" : "text-slate-400"} />
                </button>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center p-12">
                    <div className="w-10 h-10 border-4 border-rose-500/10 border-t-rose-500 rounded-full animate-spin" />
                </div>
            ) : conversations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                        <MessageSquare size={24} className="opacity-20" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900">No active conversations</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Managed or archived</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-slate-50">
                    {conversations.map((conv) => {
                        const completedAt = conv.completedAt ? new Date(conv.completedAt).getTime() : 0;
                        const now = new Date().getTime();
                        const diffMs = (completedAt + 24 * 60 * 60 * 1000) - now;
                        const expired = diffMs <= 0;
                        const timeText = expired ? "Chat History" : `${Math.floor(diffMs / (1000 * 60 * 60))}h left`;

                        return (
                            <div 
                                key={conv.appointmentId}
                                onClick={() => onOpenChat({
                                    id: conv.appointmentId,
                                    patient: { firstName: conv.patientName.split(' ')[0], lastName: conv.patientName.split(' ').slice(1).join(' ') },
                                    completedAt: conv.completedAt
                                })}
                                className="px-6 py-5 hover:bg-slate-50/50 transition-all cursor-pointer group flex items-start gap-5 border-l-4 border-transparent hover:border-rose-500"
                            >
                                <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-rose-500 font-black text-lg shadow-sm group-hover:scale-110 transition-transform">
                                    {conv.patientName[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-base font-black text-slate-900 truncate tracking-tight">{conv.patientName}</h4>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium truncate mb-2 max-w-[500px]">
                                        {conv.lastMessage}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${expired ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                            <Clock size={10} className="inline mr-1" />
                                            {timeText}
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-rose-200 animate-pulse">
                                                {conv.unreadCount} New
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                <div>{conversations.length} Active Conversations</div>
                <div className="text-slate-300 tracking-[0.2em]">HealthPoint Systems</div>
            </div>
        </div>
    );
};
