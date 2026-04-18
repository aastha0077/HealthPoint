import { Users, Stethoscope, Award, ChevronLeft, ChevronRight, Activity, UserCheck, Calendar, LayoutGrid, BarChart as BarChartIcon, TrendingUp, DollarSign, Wallet2, Users2, Clock, MapPin, PieChart as PieChartIcon, Globe, Target, Eye, FileDown } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { apiClient } from "@/apis/apis";
import toast from "react-hot-toast";
import { AssetPreviewModal } from "../common/AssetPreviewModal";

interface DashboardProps {
    users: any[];
    patients: any[];
    doctors: any[];
    appointments: any[];
    departments: any[];
}

const COLORS = ['#4f46e5', '#10b981', '#fb7185', '#f59e0b', '#64748b', '#8b5cf6'];

export function Dashboard({ doctors, appointments: initialAppointments }: DashboardProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'OVERVIEW' | 'ANALYTICS'>('ANALYTICS');
    const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get(`/api/analytics?period=${period}`);
            setAnalytics(res.data);
        } catch {
            toast.error("Failed to load complex analytics");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    // Derived stats from analytics
    const summary = analytics?.summary || {
        totalAppointments: initialAppointments.length,
        completedAppointments: 0,
        cancelledAppointments: 0,
        totalUsers: 0,
        totalPatients: 0,
        pendingRefunds: 0,
        statusDistribution: []
    };

    const stats = [
        { label: "Active Users", value: summary.totalUsers, icon: Users, color: "bg-blue-600", trend: "+12%", bg: "bg-blue-50/50" },
        { label: "Total Patients", value: summary.totalPatients, icon: UserCheck, color: "bg-indigo-600", trend: "+5%", bg: "bg-indigo-50/50" },
        { label: "Medical Staff", value: doctors.length, icon: Stethoscope, color: "bg-rose-600", trend: "0%", bg: "bg-rose-50/50" },
        { label: "Consultations", value: summary.totalAppointments, icon: Activity, color: "bg-emerald-600", trend: "+8%", bg: "bg-emerald-50/50" },
        { label: "Pending Refunds", value: summary.pendingRefunds, icon: Wallet2, color: "bg-amber-500", trend: "Action", bg: "bg-amber-50/50", urgent: summary.pendingRefunds > 0 },
    ];

    const revenueData = analytics?.trends?.revenue || [];
    const userTrendData = analytics?.trends?.users || [];
    const regionalStats = analytics?.regionalStats || [];
    const statusPieData = summary.statusDistribution || [];

    const [sortMetric, setSortMetric] = useState<'COMPLETED' | 'CANCELLED' | 'RATING_HIGH' | 'RATING_LOW'>('COMPLETED');

    const topDoctors = useMemo(() => {
        const statsMap: any = {};
        initialAppointments.forEach(app => {
            if (!app.doctorId) return;
            if (!statsMap[app.doctorId]) {
                statsMap[app.doctorId] = { completed: 0, cancelled: 0, totalRating: 0, reviewCount: 0 };
            }
            if (app.status === 'COMPLETED') statsMap[app.doctorId].completed++;
            if (app.status === 'CANCELLED') statsMap[app.doctorId].cancelled++;
            if (app.review?.rating) {
                statsMap[app.doctorId].totalRating += app.review.rating;
                statsMap[app.doctorId].reviewCount++;
            }
        });

        return doctors
            .map(doc => {
                const s = statsMap[doc.id] || { completed: 0, cancelled: 0, totalRating: 0, reviewCount: 0 };
                return {
                    id: doc.id,
                    name: `Dr. ${doc.user?.firstName || doc.firstName} ${doc.user?.lastName || doc.lastName}`,
                    completed: s.completed,
                    cancelled: s.cancelled,
                    avgRating: s.reviewCount > 0 ? (s.totalRating / s.reviewCount).toFixed(1) : "0.0",
                    reviewCount: s.reviewCount,
                    dept: doc.department?.name || "Medical Generalist",
                    pic: doc.user?.profilePicture || doc.profilePicture
                };
            })
            .sort((a, b) => {
                if (sortMetric === 'COMPLETED') return b.completed - a.completed;
                if (sortMetric === 'CANCELLED') return b.cancelled - a.cancelled;
                if (sortMetric === 'RATING_HIGH') return Number(b.avgRating) - Number(a.avgRating);
                if (sortMetric === 'RATING_LOW') return Number(a.avgRating) - Number(b.avgRating);
                return 0;
            })
            .slice(0, 5);
    }, [initialAppointments, doctors, sortMetric]);

    // Calendar Calculations
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const count = initialAppointments.filter(a => a.dateTime.startsWith(dateStr)).length;
            days.push({ day: d, dateStr, count });
        }
        return days;
    }, [currentMonth, initialAppointments]);

    const changeMonth = (offset: number) => {
        const next = new Date(currentMonth);
        next.setMonth(next.getMonth() + offset);
        setCurrentMonth(next);
    };

    const appointmentsOnSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return initialAppointments.filter(a => a.dateTime.startsWith(selectedDate));
    }, [selectedDate, initialAppointments]);

    const [showCalendar, setShowCalendar] = useState(false);
    const totalAppointmentsToday = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return initialAppointments.filter(a => a.dateTime.startsWith(todayStr)).length;
    }, [initialAppointments]);

    return (
        <div className="space-y-5 pb-10 max-w-[1600px] mx-auto relative px-2">
            {/* Executive Navbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-900 w-12 h-12 rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center relative overflow-hidden group">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-50" />
                        <TrendingUp size={24} className="text-white relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Admin Dashboard</h1>
                        <div className="flex items-center gap-2 mt-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            System Status
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-1">
                        <button onClick={() => setViewMode('OVERVIEW')} className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${viewMode === 'OVERVIEW' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                            <LayoutGrid size={14} /> Overview
                        </button>
                        <button onClick={() => setViewMode('ANALYTICS')} className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${viewMode === 'ANALYTICS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                            <BarChartIcon size={14} /> Analytics
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'ANALYTICS' ? (
                <div className="space-y-5">
                    {/* Period Switcher - Statistics Only */}
                    <div className="flex justify-end">
                        <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-sm flex items-center gap-1">
                            {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                        period === p ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Visual Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {stats.map((s, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={s.label}
                                className={`p-5 rounded-3xl border border-white shadow-lg shadow-slate-200/40 flex flex-col justify-between h-36 relative overflow-hidden group hover:scale-[1.01] transition-transform ${s.bg} ${s.urgent ? 'ring-2 ring-amber-500/20' : ''}`}
                            >
                                {s.urgent && <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none" />}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 blur-3xl -mr-12 -mt-12 group-hover:bg-white/60 transition-all" />
                                <div className="flex justify-between items-start relative z-10">
                                    <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
                                        <s.icon size={18} />
                                    </div>
                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                        {s.trend}
                                    </span>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{isLoading ? '—' : s.value.toLocaleString()}</h3>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Complex Data Matrix */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                            <div className="flex items-start justify-between mb-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Analysis</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Earnings for {period} cycle</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">Rs. {revenueData.reduce((acc: any, curr: any) => acc + curr.value, 0).toLocaleString()}</p>
                                    <div className="flex items-center justify-end gap-1.5 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Growth</p>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[320px] w-full">
                                {isLoading ? (
                                    <div className="h-full w-full bg-slate-50 rounded-3xl animate-pulse flex flex-col items-center justify-center gap-3">
                                        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Compiling Ledger...</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueData}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} axisLine={false} tickLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontSize: '11px', fontWeight: '900', padding: '15px' }}
                                                itemStyle={{ color: '#10b981' }}
                                            />
                                            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                                {!isLoading && revenueData.length === 0 && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/5 backdrop-blur-[2px]">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 flex flex-col items-center gap-2 shadow-sm">
                                             <TrendingUp size={24} className="text-slate-200" />
                                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Revenue Data Available</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <div className="lg:col-span-4 space-y-6 flex flex-col">
                            {/* Insight synthesis panel */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex-1 group">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/30 transition-all" />
                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                                        <Target size={20} />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight">Executive Insights</h3>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                        <p className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Performance</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-black">94.2%</span>
                                            <span className="text-[10px] font-bold text-emerald-400 mb-2">+2.4% vs last period</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                                        "Patient flow is steady. Consider booking more appointments this {period} in Dermatology due to high demand."
                                    </p>
                                    <div className="pt-2">
                                        <button className="w-full py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all">Download Report</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Regional Analytics */}
                        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
                             <div className="flex items-center gap-2.5 mb-6">
                                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-indigo-400">
                                    <Globe size={18} />
                                </div>
                                <h3 className="text-base font-black tracking-tight">Patient Demographics</h3>
                            </div>
                            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                {regionalStats.map((reg: any, i: number) => (
                                    <div key={reg.location} className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            <span>{reg.location}</span>
                                            <span>{reg.count} Users</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(reg.count / summary.totalPatients) * 100}%` }} className="h-full bg-indigo-500" />
                                        </div>
                                    </div>
                                ))}
                                {regionalStats.length === 0 && (
                                    <div className="py-10 text-center opacity-20">
                                        <MapPin size={32} className="mx-auto text-slate-400" />
                                        <p className="text-[10px] font-black uppercase mt-2 tracking-widest">No demographic data</p>
                                    </div>
                                )}
                            </div>
                        </div>

                         {/* Personnel Performance */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                           <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                                        <Target size={18} />
                                    </div>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight">Performance Ranking</h3>
                                </div>
                                <select value={sortMetric} onChange={(e) => setSortMetric(e.target.value as any)} className="bg-slate-50 border-none text-[8px] font-black uppercase rounded-lg px-3 py-1.5 focus:ring-0">
                                    <option value="COMPLETED">Success Rank</option>
                                    <option value="RATING_HIGH">Patient Sentiment</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {topDoctors.map((doc, idx) => (
                                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group/staff hover:bg-white transition-all">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm relative">
                                            {doc.pic ? <img src={doc.pic} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-black text-[9px]">{doc.name[4]}</div>}
                                            <div className="absolute top-0 left-0 bg-slate-900 text-white text-[7px] font-black px-1 rounded-br-md">{idx + 1}</div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-slate-900 text-xs truncate">{doc.name}</h4>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5 truncate">{doc.dept}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-slate-900">{sortMetric === 'RATING_HIGH' ? doc.avgRating : (sortMetric === 'COMPLETED' ? doc.completed : doc.cancelled)}</p>
                                            <p className="text-[7px] font-black uppercase text-slate-400">{sortMetric.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                ))}
                                {topDoctors.length === 0 && (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                        <Award size={32} className="text-slate-200 mb-2" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Rankings Available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-5">
                    {/* Command Center View (Simple) */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] -mr-24 -mt-24" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-3 flex-1 text-center md:text-left">
                                <div className="flex items-center gap-2 justify-center md:justify-start">
                                    <Calendar className="text-indigo-400" size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300">Operations</span>
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tighter leading-none">Operations Dashboard</h2>
                                <p className="text-slate-400 text-[10px] font-medium max-w-lg leading-relaxed">Centralized control for monitoring clinical workflows and appointments.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center py-3 px-6 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-xl">
                                    <span className="text-3xl font-black text-white">{totalAppointmentsToday}</span>
                                    <span className="text-[7px] font-black text-indigo-400 uppercase">Active Today</span>
                                </div>
                                <button onClick={() => setShowCalendar(true)} className="px-6 py-3.5 bg-indigo-600 hover:bg-white text-white hover:text-slate-900 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all shadow-lg">Open Calendar</button>
                            </div>
                        </div>
                    </motion.div>

                    {summary.pendingRefunds > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20, scale: 0.98 }} 
                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                            className="p-1 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(244,63,94,0.3)] mb-4"
                        >
                            <div className="bg-white/95 backdrop-blur-md rounded-[1.9rem] p-4 px-6 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-200 animate-pulse">
                                        <Wallet2 size={24} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                            <p className="text-[10px] font-black uppercase text-rose-600 tracking-[0.3em]">Refund Alerts</p>
                                        </div>
                                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                                            Review Refunds: <span className="text-rose-600">{summary.pendingRefunds} Refund Requests</span> pending processing.
                                        </h4>
                                    </div>
                                </div>
                                <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl active:scale-95 flex items-center gap-2">
                                    Process Refunds
                                    <ChevronRight size={14} className="mt-0.5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {stats.map((s, i) => (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={s.label} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
                                <div className={`w-11 h-11 ${s.color} rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200`}><s.icon size={20} /></div>
                                <div><h3 className="text-xl font-black text-slate-900 tracking-tighter">{isLoading ? '—' : s.value.toLocaleString()}</h3><p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</p></div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2.5 mb-6"><div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Clock size={18} /></div><h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Appointments</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {initialAppointments
                                .map(apt => ({ ...apt, virtualStatus: apt.refundRequest?.status === 'COMPLETED' ? 'REFUNDED' : (apt.refundRequest ? 'REF_REQ' : apt.status) }))
                                .sort((a, b) => {
                                    const priority: Record<string, number> = { REF_REQ: 0, REFUNDED: 1, BOOKED: 2, COMPLETED: 3, CANCELLED: 4 };
                                    const pA = priority[a.virtualStatus] ?? 5;
                                    const pB = priority[b.virtualStatus] ?? 5;
                                    if (pA !== pB) return pA - pB;
                                    return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
                                })
                                .slice(0, 6)
                                .map(apt => (
                                <div key={apt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="px-2.5 py-0.5 bg-white rounded-lg text-[8px] font-black text-slate-900 shadow-sm">{new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md border ${(apt.refundRequest?.status === 'COMPLETED') ? 'text-violet-600 border-violet-100 bg-violet-50' : (apt.status === 'COMPLETED' ? 'text-emerald-600 border-emerald-100' : 'text-blue-600 border-blue-100')}`}>
                                                {apt.refundRequest?.status === 'COMPLETED' ? 'REFUNDED' : apt.status}
                                            </span>
                                            {apt.refundRequest?.proofUrl && (
                                                <button 
                                                    onClick={() => setPreviewUrl(apt.refundRequest.proofUrl)}
                                                    className="text-violet-400 hover:text-violet-600 transition-colors p-1"
                                                >
                                                    <Eye size={10} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="font-black text-slate-900 text-xs tracking-tight">{apt.patient?.firstName} {apt.patient?.lastName}</p>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Dr. {apt.doctor?.user?.firstName || apt.doctor?.firstName}</p>
                                        {apt.refundRequest?.adminNotes && (
                                            <span className="text-[7px] font-bold text-emerald-500 truncate max-w-[80px]" title={apt.refundRequest.adminNotes}>
                                                • {apt.refundRequest.adminNotes}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showCalendar && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-3xl p-5 md:p-10 overflow-y-auto custom-scrollbar">
                        <div className="max-w-5xl mx-auto space-y-8 pb-10">
                            <div className="flex items-center justify-between">
                                <div><h2 className="text-3xl font-black text-white tracking-tighter">Appointment Calendar</h2><p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.5em] mt-2">Registry Audit</p></div>
                                <button onClick={() => setShowCalendar(false)} className="px-8 py-4 bg-white/5 hover:bg-rose-500 text-white rounded-2xl border border-white/10 font-black text-[9px] uppercase transition-all shadow-xl">Close Calendar</button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-8 bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4"><h3 className="text-2xl font-black text-white tracking-tighter capitalize">{currentMonth.toLocaleString('default', { month: 'long' })}</h3><span className="text-2xl font-light text-slate-500">{currentMonth.getFullYear()}</span></div>
                                        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl">
                                            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg text-white transition-all"><ChevronLeft size={20} /></button>
                                            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-lg text-white transition-all"><ChevronRight size={20} /></button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-7 gap-3">
                                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (<div key={d} className="text-center text-[8px] font-black text-slate-600 tracking-[0.2em] pb-6">{d}</div>))}
                                        {calendarDays.map((day, i) => (
                                            <div key={i} className="aspect-square relative">
                                                {day && (
                                                    <button onClick={() => setSelectedDate(day.dateStr)} className={`w-full h-full rounded-2xl flex flex-col items-center justify-center transition-all border ${selectedDate === day.dateStr ? 'bg-indigo-600 border-indigo-400 shadow-xl scale-105' : day.count > 0 ? 'bg-white/10 border-white/5 hover:bg-white/20' : 'bg-transparent border-white/5'}`}>
                                                        <span className={`text-base font-black ${selectedDate === day.dateStr ? 'text-white' : day.count > 0 ? 'text-slate-100' : 'text-slate-700'}`}>{day.day}</span>
                                                        {day.count > 0 && <div className={`mt-1 px-1.5 py-0.5 rounded-full text-[7px] font-black ${selectedDate === day.dateStr ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-400'}`}>{day.count}</div>}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="lg:col-span-4 h-full">
                                    <AnimatePresence mode="wait">
                                        {selectedDate ? (
                                            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="bg-white rounded-3xl p-8 shadow-xl overflow-hidden h-full min-h-[500px] flex flex-col">
                                                <div className="mb-8"><p className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1.5">Schedule</p><h4 className="text-2xl font-black text-slate-900 tracking-tighter">{new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</h4></div>
                                                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                                                    {appointmentsOnSelectedDate.length === 0 ? (<div className="h-full flex flex-col items-center justify-center opacity-25 py-10"><Activity size={60} className="mb-4" /><p className="text-[9px] font-black uppercase">No Data Found</p></div>) : appointmentsOnSelectedDate.map(apt => (
                                                        <div key={apt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                            <div className="flex justify-between items-center mb-3"><span className="text-[9px] font-black px-2 py-0.5 bg-white rounded-lg border shadow-sm">{new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><span className={`text-[8px] font-black uppercase ${apt.status === 'COMPLETED' ? 'text-emerald-500' : 'text-indigo-500'}`}>{apt.status}</span></div>
                                                            <p className="font-black text-slate-900 text-sm leading-tight">{apt.patient?.firstName} {apt.patient?.lastName}</p>
                                                            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between"><p className="text-[8px] font-black text-slate-400">DEPT: <span className="text-slate-600 truncate max-w-[80px]">{apt.department?.name || 'N/A'}</span></p><p className="text-[8px] font-black text-slate-900 uppercase">Dr. {apt.doctor?.user?.firstName || apt.doctor?.firstName}</p></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ) : (<div className="bg-white/5 rounded-3xl p-10 border border-white/5 flex flex-col items-center justify-center text-center h-full min-h-[500px] backdrop-blur-3xl"><Activity size={80} className="text-white/5 mb-8 animate-pulse" /><p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Select a Day<br/>To view scheduled patients</p></div>)}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AssetPreviewModal 
                url={previewUrl} 
                title="Refund Proof" 
                onClose={() => setPreviewUrl(null)} 
            />
        </div>
    );
}
