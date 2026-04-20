import { useAuth } from "@/contexts/AuthProvider";
import { LogOut, User, ChevronDown, LayoutDashboard, Calendar, MessageSquare, Bell } from "lucide-react";
import { Link, useNavigate, Outlet, useLocation } from "react-router";
import { useState } from "react";
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorLayout() {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleLogout = () => {
        auth?.logout();
        navigate("/auth");
    };

    const navItems = [
        { href: "/doctor-panel", label: "Dashboard", icon: LayoutDashboard },
        { href: "/doctor-panel/appointments", label: "Appointments", icon: Calendar },
        { href: "/doctor-panel/chat", label: "Messages", icon: MessageSquare },
    ];

    const isActive = (href: string) => location.pathname === href;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <nav className="bg-white border-b border-slate-200 px-8 py-3 flex justify-between items-center sticky top-0 z-[60]">
                <div className="flex items-center gap-8">
                    <Link to="/doctor-panel" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200 transition-transform group-hover:scale-105">
                            <span className="text-white font-black text-lg tracking-tighter">Health Point</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-black text-slate-900 leading-none group-hover:text-rose-600 transition-colors">Doctor Panel</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Medical Staff</span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                        {navItems.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                to={href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${isActive(href)
                                        ? "bg-white text-rose-600 shadow-sm border border-slate-100"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                                    }`}
                            >
                                <Icon size={14} />
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/" className="hidden sm:block text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Public Site</Link>

                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-all border border-slate-200 group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-black text-xs text-white overflow-hidden shadow-md shadow-rose-100">
                                {auth?.user?.profilePicture ? (
                                    <img src={auth.user.profilePicture} className="w-full h-full object-cover" />
                                ) : (
                                    auth?.user?.firstName?.[0] || 'D'
                                )}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-xs font-black text-slate-900 leading-none">Dr. {auth?.user?.lastName}</p>
                                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter mt-1">Specialist</p>
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isMenuOpen && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsMenuOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 overflow-hidden"
                                    >
                                        <div className="px-4 py-3 bg-slate-50 rounded-xl mx-2 mb-2">
                                            <p className="text-xs font-black text-slate-900">{auth?.user?.firstName} {auth?.user?.lastName}</p>
                                            <p className="text-[10px] text-slate-400 font-bold truncate">{auth?.user?.email}</p>
                                        </div>

                                        <button
                                            onClick={() => { setIsProfileModalOpen(true); setIsMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 font-bold transition-colors"
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
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </nav>

            {/* Sidebar & Content area */}
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>

            <ProfileEditModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
        </div>
    );
}
