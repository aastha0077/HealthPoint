import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft, Activity, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { useToast } from "@/components/ui/toast-provider";
import { motion, AnimatePresence } from "framer-motion";

export function AuthPage() {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const auth = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (mode === "login") {
                const res = await auth?.handleLogin(formData.email, formData.password);
                if (res?.status === 200) {
                    toast.showToast({ message: "Welcome back!", duration: 3000, variant: "success" });
                    if (res?.user?.role === "ADMIN") navigate("/admin");
                    else if (res?.user?.role === "DOCTOR") navigate("/doctor-panel");
                    else navigate("/dashboard");
                }
            } else {
                const res = await auth?.handleSignup({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                });
                if (res?.status === 200 || res?.status === 201) {
                    toast.showToast({ message: "Registration successful! Please login.", duration: 3000, variant: "success" });
                    setMode("login");
                }
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "An error occurred";
            toast.showToast({ message: msg, duration: 3000, variant: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const formVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
    };

    return (
        <div className="h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 selection:bg-rose-100 selection:text-rose-700 overflow-hidden relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-rose-200/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-sky-200/20 rounded-full blur-[120px]" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-5xl grid lg:grid-cols-12 bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-white/50 backdrop-blur-3xl relative z-10 h-full max-h-[650px]"
            >
                {/* Visual Side (5 cols) */}
                <div className="hidden lg:flex lg:col-span-5 relative bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />


                    <div className="relative z-10 p-8 flex flex-col justify-between h-full">
                        <Link to="/" className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-all group self-start">
                            <ChevronLeft className="w-4 h-4 text-white group-hover:-translate-x-1 transition-transform" />
                            <span className="text-white text-xs font-black uppercase tracking-widest">Back to Home</span>
                        </Link>

                        <div className="space-y-6">
                            <div className="flex gap-2">
                                {[1, 2, 3].map(i => <div key={i} className="h-1 w-6 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-rose-500 w-1/3 animate-shimmer" /></div>)}
                            </div>
                            <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
                                Your Trusted <br /> <span className="text-rose-500">Health Partner.</span>
                            </h2>
                            <p className="text-slate-400 text-sm font-bold leading-relaxed max-w-xs">
                                Access world-class medical care with our advanced digital hospital platform.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Side (7 cols) */}
                <div className="lg:col-span-7 flex flex-col justify-center p-6 md:p-12 relative bg-white h-full overflow-y-auto custom-scrollbar">
                    <div className="max-w-sm mx-auto w-full">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-1 h-6 bg-rose-600 rounded-full" />
                                <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">Welcome</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                                {mode === "login" ? "Sign In" : "Create Account"}
                            </h1>
                            <p className="text-slate-400 font-bold text-xs">
                                {mode === "login" ? "Welcome back! Please enter your details." : "Join us today and take control of your health."}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.form
                                key={mode}
                                variants={formVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                {mode === "signup" && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-rose-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    required
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    placeholder="First Name"
                                                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:shadow-[0_0_20px_rgba(225,29,72,0.05)] focus:border-rose-500/30 outline-none transition-all font-bold text-slate-700 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 pt-5 mt-auto">
                                            <input
                                                type="text"
                                                name="lastName"
                                                required
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                placeholder="Last Name"
                                                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:shadow-[0_0_20px_rgba(225,29,72,0.05)] focus:border-rose-500/30 outline-none transition-all font-bold text-slate-700 text-sm"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-rose-500 transition-colors" />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="name@email.com"
                                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:shadow-[0_0_20px_rgba(225,29,72,0.05)] focus:border-rose-500/30 outline-none transition-all font-bold text-slate-700 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center pr-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Password</label>
                                        {mode === "login" && (
                                            <button type="button" className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors">Forgot Password?</button>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-rose-500 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-12 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:shadow-[0_0_20px_rgba(225,29,72,0.05)] focus:border-rose-500/30 outline-none transition-all font-bold text-slate-700 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-slate-900 hover:bg-rose-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:translate-y-0 flex items-center justify-center gap-3 relative overflow-hidden group mt-6"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {mode === "login" ? "Login" : "Sign Up"}
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>

                                <div className="pt-6 text-center">
                                    <p className="text-slate-400 font-bold text-xs">
                                        {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                                        <button
                                            type="button"
                                            onClick={() => setMode(mode === "login" ? "signup" : "login")}
                                            className="text-rose-600 hover:text-rose-700 font-black uppercase tracking-widest ml-2 border-b-2 border-rose-500/20 hover:border-rose-500 transition-all pb-0.5"
                                        >
                                            {mode === "login" ? "Sign Up" : "Sign In"}
                                        </button>
                                    </p>
                                </div>
                            </motion.form>
                        </AnimatePresence>

                        <div className="my-8 flex items-center gap-4">
                            <div className="h-px bg-slate-100 flex-1" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-200">Quick Access</span>
                            <div className="h-px bg-slate-100 flex-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 py-3 rounded-2xl border border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all group">
                                <Activity className="w-4 h-4 text-emerald-500" />
                                Patient Login
                            </button>
                            <button className="flex items-center justify-center gap-3 py-3 rounded-2xl border border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all group">
                                <ShieldCheck className="w-4 h-4 text-rose-500" />
                                Provider Login
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
