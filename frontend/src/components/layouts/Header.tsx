import { useAuth } from "@/contexts/AuthProvider";
import { Menu, X, Calendar, User, Home, Stethoscope, Package, Phone, LayoutDashboard, LogOut, ChevronDown, Search, MessageSquare } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";
import { motion, AnimatePresence } from "framer-motion";

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const authInfo = useAuth();
  const isAuthenticated = authInfo?.isAuthenticated;
  const user = authInfo?.user;
  const role = authInfo?.role;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/services", label: "Services", icon: Stethoscope },
    { href: "/symptom-checker", label: "AI Doctor Finder", icon: Search },
    { href: "/health-package", label: "Plans", icon: Package },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  const isActive = (href: string) => location.pathname === href;
  const dashboardPath = role === "ADMIN" ? "/admin" : role === "DOCTOR" ? "/doctor-panel" : "/dashboard";

  const handleLogout = () => {
    authInfo?.logout();
    setIsUserMenuOpen(false);
    navigate("/auth?mode=login");
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-[100] transition-all duration-300 bg-white border-b ${scrolled ? "py-2 shadow-md border-rose-100" : "py-4 border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200 transition-transform group-hover:scale-105">
              <span className="text-white font-black text-lg tracking-tighter">HP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black text-slate-900 leading-none">HealthPoint</span>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1">Medical Center</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${isActive(href)
                  ? "text-rose-600 bg-rose-50"
                  : "text-slate-500 hover:text-rose-600 hover:bg-slate-50"
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/auth?mode=signup"
                  className="bg-slate-900 text-white text-xs font-black px-5 py-3 rounded-xl transition-all hover:bg-slate-800 active:scale-95"
                >
                  Join
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <NotificationBell />

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 pr-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group border border-slate-100"
                  >
                    <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center text-white text-xs font-black overflow-hidden">
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} className="w-full h-full object-cover" />
                      ) : (
                        user?.firstName?.charAt(0)
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{user?.firstName}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-[110]"
                      >
                        <div className="px-4 py-3 bg-slate-50 rounded-xl mb-1">
                          <p className="text-xs font-black text-slate-900">{user?.firstName} {user?.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-bold truncate">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => { navigate(dashboardPath); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </button>
                        <button
                          onClick={() => { navigate("/my-chats"); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <MessageSquare size={16} /> My Chats
                        </button>
                        <button
                          onClick={() => { setIsProfileModalOpen(true); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <User size={16} /> My Profile
                        </button>
                        <div className="h-px bg-slate-50 my-1 mx-2" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            <Link
              to="/appointment"
              className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-rose-200"
            >
              <Calendar size={16} />
              Book Appointment
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-50 bg-white overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${isActive(href) ? "bg-rose-50 text-rose-600" : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Icon size={18} /> {label}
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-50 mt-4 space-y-3">
                {!isAuthenticated ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/auth?mode=login" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-center text-sm font-bold text-slate-600 bg-slate-50 rounded-xl">Login</Link>
                    <Link to="/auth?mode=signup" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-center text-sm font-bold text-white bg-slate-900 rounded-xl">Join</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { navigate(dashboardPath); setIsMobileMenuOpen(false); }} className="py-3 text-center text-xs font-bold text-rose-600 bg-rose-50 rounded-xl">Dashboard</button>
                    <button onClick={handleLogout} className="py-3 text-center text-xs font-bold text-red-600 bg-red-50 rounded-xl">Logout</button>
                  </div>
                )}
                <Link
                  to="/appointment"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center items-center gap-2 w-full bg-rose-600 text-white py-4 rounded-xl font-bold"
                >
                  <Calendar size={18} /> Book Appointment
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileEditModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </header>
  );
}

export { Header };
