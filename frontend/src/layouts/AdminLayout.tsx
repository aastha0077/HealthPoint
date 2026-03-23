import { useAuth } from "@/contexts/AuthProvider";
import { LogOut, User, ChevronDown } from "lucide-react";
import { Link, useNavigate, Outlet } from "react-router";
import { useState } from "react";
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";

export default function AdminLayout() {
    const auth = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleLogout = () => {
        auth?.logout();
        navigate("/auth");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <nav className="bg-slate-900 text-white px-8 py-4 shadow-lg flex justify-between items-center sticky top-0 z-[60]">
                <div className="flex items-center gap-6">
                    <Link to="/admin" className="text-xl font-black tracking-tight">
                        PLU <span className="text-rose-500">Admin</span>
                    </Link>
                    <div className="hidden md:flex h-4 w-px bg-slate-800" />
                    <span className="hidden md:inline text-slate-400 uppercase tracking-widest text-[10px] font-black">Control Center</span>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Public Site</Link>

                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-3 bg-slate-800 hover:bg-slate-750 px-4 py-2 rounded-xl transition-all border border-slate-700"
                        >
                            <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center font-black text-xs">
                                {auth?.user?.firstName?.[0] || 'A'}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-xs font-black leading-none">{auth?.user?.firstName}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Super Admin</p>
                            </div>
                            <ChevronDown size={14} className={`text-slate-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 overflow-hidden">
                                    <button
                                        onClick={() => { setIsProfileModalOpen(true); setIsMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 font-bold transition-colors"
                                    >
                                        <User size={16} className="text-slate-400" /> My Profile
                                    </button>
                                    <div className="h-px bg-slate-100 my-1 mx-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors"
                                    >
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="flex-1">
                <Outlet />
            </main>

            <ProfileEditModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
        </div>
    );
}
