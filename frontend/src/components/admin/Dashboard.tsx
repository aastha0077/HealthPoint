import { Users, Stethoscope, Award, ChevronLeft, ChevronRight, Activity, UserCheck, Calendar, LayoutGrid, BarChart as BarChartIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardProps {
    users: any[];
    patients: any[];
    doctors: any[];
    appointments: any[];
    departments: any[];
}

export function Dashboard({ users, patients, doctors, appointments }: DashboardProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'OVERVIEW' | 'STATISTICAL'>('OVERVIEW');

    // Stats
    const stats = [
        { label: "Active Users", value: users.length, icon: Users, color: "bg-blue-600", trend: "+12%" },
        { label: "Total Patients", value: patients.length, icon: UserCheck, color: "bg-indigo-600", trend: "+5%" },
        { label: "Medical Staff", value: doctors.length, icon: Stethoscope, color: "bg-rose-600", trend: "0%" },
        { label: "Consultations", value: appointments.length, icon: Activity, color: "bg-emerald-600", trend: "+8%" },
    ];

    // Specialty Chart Data
    const deptData = useMemo(() => {
        const counts: Record<string, number> = {};
        doctors.forEach(doc => {
            const deptName = doc.department?.name || "Unassigned";
            counts[deptName] = (counts[deptName] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [doctors]);

    const [sortMetric, setSortMetric] = useState<'COMPLETED' | 'CANCELLED' | 'RATING_HIGH' | 'RATING_LOW'>('COMPLETED');

    // Top 5 Doctors by Dynamic Metric
    const topDoctors = useMemo(() => {
        const statsMap: any = {};

        appointments.forEach(app => {
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
    }, [appointments, doctors, sortMetric]);

    // Calendar Calculations
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Pad start
        for (let i = 0; i < firstDay; i++) days.push(null);
        // Fill days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const count = appointments.filter(a => a.dateTime.startsWith(dateStr)).length;
            days.push({ day: d, dateStr, count });
        }
        return days;
    }, [currentMonth, appointments]);

    const changeMonth = (offset: number) => {
        const next = new Date(currentMonth);
        next.setMonth(next.getMonth() + offset);
        setCurrentMonth(next);
    };

    const appointmentsOnSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return appointments.filter(a => a.dateTime.startsWith(selectedDate));
    }, [selectedDate, appointments]);

    const [showCalendar, setShowCalendar] = useState(false);

    const totalAppointmentsToday = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return appointments.filter(a => a.dateTime.startsWith(todayStr)).length;
    }, [appointments]);

    const patientsPerDeptData = useMemo(() => {
        const deptPatients: Record<string, Set<number>> = {};
        appointments.forEach(app => {
            const deptName = app.department?.name || "Unassigned";
            if (!deptPatients[deptName]) deptPatients[deptName] = new Set();
            if (app.patientId) deptPatients[deptName].add(app.patientId);
        });

        return Object.entries(deptPatients)
            .map(([name, set]) => ({ name, patients: set.size }))
            .sort((a, b) => b.patients - a.patients)
            .slice(0, 8);
    }, [appointments]);

    return (
        <div className="space-y-6 pb-20 max-w-[1600px] mx-auto relative">
            {/* View Mode Switcher */}
            <div className="flex justify-end">
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                    <button onClick={() => setViewMode('OVERVIEW')} className={`p-2 px-3 rounded-lg transition-all flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${viewMode === 'OVERVIEW' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                        <LayoutGrid size={12} /> Overview
                    </button>
                    <button onClick={() => setViewMode('STATISTICAL')} className={`p-2 px-3 rounded-lg transition-all flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${viewMode === 'STATISTICAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                        <BarChartIcon size={12} /> Statistical
                    </button>
                </div>
            </div>

            {viewMode === 'STATISTICAL' ? (
                <div className="space-y-6">
                    {/* Stats Row still visible */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {stats.map((s, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={s.label}
                                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3"
                            >
                                <div className={`w-9 h-9 ${s.color} rounded-lg flex items-center justify-center text-white`}>
                                    <s.icon size={16} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">{s.value}</h3>
                                    <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="mb-6">
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                        <Stethoscope size={16} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Personnel Density</h3>
                                </div>
                                <p className="text-[10px] font-semibold text-slate-400 tracking-tight">Departments by allocated medical staff.</p>
                            </div>
                            <div className="h-[360px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={deptData.sort((a, b) => b.value - a.value).slice(0, 8)} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" height={60} />
                                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                                        <Bar dataKey="value" name="Doctors" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={36} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="mb-6">
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center">
                                        <UserCheck size={16} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Patient Distribution</h3>
                                </div>
                                <p className="text-[10px] font-semibold text-slate-400 tracking-tight">Departments by unique patient records.</p>
                            </div>
                            <div className="h-[360px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={patientsPerDeptData} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" height={60} />
                                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                                        <Bar dataKey="patients" name="Patients" fill="#fb7185" radius={[6, 6, 0, 0]} barSize={36} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* 1. Universal Stats Row: Executive Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((s, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={s.label}
                                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-lg transition-all"
                            >
                                <div className={`w-11 h-11 ${s.color} rounded-xl flex items-center justify-center text-white shadow-xl shadow-${s.color.split('-')[1]}-100 transition-transform group-hover:scale-105`}>
                                    <s.icon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{s.value}</h3>
                                    <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{s.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* 2. Operations Control: Simple Calendar Launcher */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 rounded-2xl p-6 shadow-lg relative overflow-hidden group border border-slate-800"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all duration-700" />
                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 h-full">
                            <div className="space-y-2 text-center sm:text-left flex-1">
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                    <Calendar className="text-indigo-400" size={14} />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-300">Registry Control</span>
                                </div>
                                <h2 className="text-lg font-bold text-white tracking-tight leading-tight">Clinical Operation Matrix</h2>
                                <p className="text-slate-500 text-[10px] font-semibold max-w-sm">Manage global schedules and audit patient timelines via unified registry.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="flex flex-col items-center gap-0.5 justify-center py-1.5 px-3 bg-white/5 border border-white/5 rounded-lg">
                                    <span className="text-xl font-black text-white">{totalAppointmentsToday}</span>
                                    <span className="text-[6px] font-bold text-indigo-400 uppercase tracking-widest">Active Today</span>
                                </div>
                                <button
                                    onClick={() => setShowCalendar(true)}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-white text-white hover:text-slate-900 rounded-xl font-bold text-[9px] uppercase tracking-wider transition-all shadow-lg active:scale-95 whitespace-nowrap"
                                >
                                    Launch Registry
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3. Analytics Matrix: Performance & Distribution */}
                    <div className="grid grid-cols-12 gap-10">
                        <div className="col-span-12 lg:col-span-7">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                                <Award size={20} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Personnel Ranking</h3>
                                        </div>
                                        <p className="text-[10px] font-semibold text-slate-400 tracking-tight">Staff ranking based on outcomes and satisfaction.</p>
                                    </div>
                                    <div className="flex gap-1 p-1 bg-slate-50 rounded-xl">
                                        {['COMPLETED', 'RATING_HIGH', 'CANCELLED'].map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setSortMetric(m as any)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${sortMetric === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {m.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {topDoctors.map((doc, i) => (
                                        <div key={doc.id} className="flex items-center gap-3 p-2.5 bg-slate-50/50 rounded-xl border border-slate-50 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all group/card">
                                            <div className="relative shrink-0">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-white shadow-sm">
                                                    {doc.pic ? <img src={doc.pic} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-400"><Stethoscope size={18} /></div>}
                                                </div>
                                                <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[8px] font-black shadow-md">
                                                    {i + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 text-[11px] truncate">{doc.name}</h4>
                                                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{doc.dept}</p>
                                                <div className="mt-1.5 flex items-center justify-between">
                                                    <div className="flex items-center gap-1 font-bold text-[9px] text-indigo-600">
                                                        <Activity size={10} />
                                                        {sortMetric === 'COMPLETED' ? doc.completed : sortMetric === 'CANCELLED' ? doc.cancelled : doc.avgRating}
                                                    </div>
                                                    <div className="px-1 py-0.5 bg-emerald-50 text-emerald-600 rounded-[4px] text-[7px] font-bold uppercase">Active</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-5 space-y-8">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Staffing Pulse</h3>
                                        <p className="text-[10px] font-semibold text-slate-400 tracking-tight">Distribution across departments.</p>
                                    </div>
                                </div>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {deptData.sort((a, b) => b.value - a.value).map((d, i) => {
                                        const maxVal = Math.max(...deptData.map(id => id.value)) || 1;
                                        const percent = (d.value / maxVal) * 100;
                                        return (
                                            <div key={d.name} className="group/dept">
                                                <div className="flex items-center justify-between mb-2 px-1">
                                                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">{d.name}</span>
                                                    <span className="text-[11px] font-bold text-slate-400">{d.value} <span className="text-[8px]">DOCS</span></span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className={`h-full rounded-full ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-rose-400'}`} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* [MODAL] Strategic Scheduling Hub Overlay */}
                    <AnimatePresence>
                        {showCalendar && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-2xl p-6 md:p-12 overflow-y-auto custom-scrollbar"
                            >
                                <div className="max-w-6xl mx-auto space-y-8 pb-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-black text-white tracking-tight">Operation Matrix</h2>
                                            <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-[0.3em] mt-1.5">Active Scheduling Logic</p>
                                        </div>
                                        <button
                                            onClick={() => setShowCalendar(false)}
                                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 font-bold text-[10px] uppercase tracking-wider transition-all"
                                        >
                                            Exit Matrix
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        <div className="lg:col-span-8 bg-white/5 rounded-[2.5rem] p-8 border border-white/10">
                                            <div className="flex items-center justify-between mb-10">
                                                <h3 className="text-xl font-bold text-white">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                                <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl">
                                                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg text-white"><ChevronLeft size={16} /></button>
                                                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-lg text-white"><ChevronRight size={16} /></button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-7 gap-2.5">
                                                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                                                    <div key={d} className="text-center text-[9px] font-bold text-slate-500 tracking-widest pb-4">{d}</div>
                                                ))}
                                                {calendarDays.map((day, i) => (
                                                    <div key={i} className="aspect-square relative">
                                                        {day && (
                                                            <button
                                                                onClick={() => setSelectedDate(day.dateStr)}
                                                                className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition-all border ${selectedDate === day.dateStr
                                                                        ? 'bg-indigo-600 border-indigo-400 shadow-lg scale-105'
                                                                        : day.count > 0 ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-transparent border-white/5'
                                                                    }`}
                                                            >
                                                                <span className={`text-base font-bold ${selectedDate === day.dateStr ? 'text-white' : day.count > 0 ? 'text-slate-200' : 'text-slate-600'}`}>{day.day}</span>
                                                                {day.count > 0 && <span className={`text-[9px] font-bold mt-0.5 ${selectedDate === day.dateStr ? 'text-indigo-200' : 'text-rose-500'}`}>{day.count}</span>}
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="lg:col-span-4 space-y-8">
                                            <AnimatePresence mode="wait">
                                                {selectedDate ? (
                                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-[2.5rem] p-8 shadow-xl overflow-hidden min-h-[400px]">
                                                        <div className="mb-8">
                                                            <h4 className="text-xl font-bold text-slate-900">{new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</h4>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Daily Stream Output</p>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {appointmentsOnSelectedDate.length === 0 ? <p className="text-slate-300 font-bold italic text-sm py-10 text-center">No Data Pulled</p> : appointmentsOnSelectedDate.map(apt => (
                                                                <div key={apt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white rounded-md border border-slate-200">{new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                        <span className="text-[8px] font-bold uppercase text-indigo-600 tracking-widest">{apt.status}</span>
                                                                    </div>
                                                                    <p className="font-bold text-slate-900 text-xs">{apt.patient?.firstName} {apt.patient?.lastName}</p>
                                                                    <p className="text-[8px] font-semibold text-slate-400 mt-0.5">Dr. {apt.doctor?.user?.firstName || apt.doctor?.firstName}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <div className="bg-white/5 rounded-[3.5rem] p-12 border border-white/5 flex flex-col items-center justify-center text-center">
                                                        <Activity size={64} className="text-white/10 mb-6" />
                                                        <p className="text-white/30 text-xs font-black uppercase tracking-widest">Select a day to audit details</p>
                                                    </div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
