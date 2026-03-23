import { Calendar, Clock, MessageSquare, LogOut, UserCircle, LayoutDashboard, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate, NavLink } from "react-router";

export function DoctorSidebar() {
    const auth = useAuth();
    const navigate = useNavigate();

    const tabs = [
        { path: "/doctor-panel", label: "Dashboard", icon: LayoutDashboard, end: true },
        { path: "/doctor-panel/queue", label: "Patient Queue", icon: Clock },
        { path: "/doctor-panel/appointments", label: "General History", icon: Calendar },
        { path: "/doctor-panel/messages", label: "Messages", icon: MessageSquare },
        { path: "/doctor-panel/profile", label: "My Profile", icon: UserCircle },
        { path: "/doctor-panel/reviews", label: "Practice Ratings", icon: Award },
    ];

    const handleLogout = () => {
        auth?.logout();
        navigate("/auth?mode=login");
    };

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col shrink-0 h-screen sticky top-0 overflow-hidden">
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex justify-center items-center text-white font-bold text-xl shadow-lg shadow-rose-900/40">D</div>
                    <div>
                        <h2 className="text-sm font-black text-white tracking-widest uppercase">Portal</h2>
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">Medical Staff</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                {tabs.map(({ path, label, icon: Icon, end }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={end}
                        className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 ${isActive
                            ? 'bg-rose-600 text-white shadow-xl shadow-rose-900/20 translate-x-1'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Icon size={18} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto space-y-4">
                <div className="h-px bg-slate-800 mx-2" />
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-2xl text-slate-400 hover:text-white hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20 duration-300"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>

                <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/30">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">System Live</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
