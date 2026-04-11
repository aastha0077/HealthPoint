import { Calendar, Stethoscope, AlignLeft, Users, UserRound, CreditCard, LogOut, LayoutDashboard, Banknote } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate, NavLink } from "react-router";

interface AdminSidebarProps {
    setSearch: (search: string) => void;
}

export function AdminSidebar({ setSearch }: AdminSidebarProps) {
    const auth = useAuth();
    const navigate = useNavigate();
    const tabs = [
        { id: "DASHBOARD", label: "Dashboard", icon: LayoutDashboard },
        { id: "APPOINTMENTS", label: "Appointments", icon: Calendar },
        { id: "DOCTORS", label: "Doctors", icon: Stethoscope },
        { id: "DEPARTMENTS", label: "Departments", icon: AlignLeft },
        { id: "USERS", label: "Users", icon: Users },
        { id: "PATIENTS", label: "Patients", icon: UserRound },
        { id: "PAYMENTS", label: "Financials", icon: CreditCard },
        { id: "REFUNDS", label: "Refunds", icon: Banknote },
    ];

    const handleLogout = () => {
        auth?.logout();
        navigate("/auth?mode=login");
    };

    return (
        <aside className="w-60 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col shrink-0 h-screen sticky top-0 overflow-hidden">
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                    <div className="w-8 h-8 bg-rose-600 rounded-lg flex justify-center items-center text-white font-bold text-lg shadow-lg">A</div>
                    <div>
                        <h2 className="text-[11px] font-bold text-white tracking-widest uppercase">Admin</h2>
                        <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter">Directorate</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <NavLink
                        key={id}
                        to={`/admin/${id.toLowerCase()}`}
                        onClick={() => setSearch("")}
                        className={({ isActive }) => `w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 ${isActive
                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Icon size={16} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto space-y-4">
                <div className="h-px bg-slate-800 mx-2" />
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
                >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>

                <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">System Live</span>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    </div>
                </div>
            </div>
        </aside>
    );
}
