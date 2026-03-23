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
        <div className="space-y-10 pb-20 max-w-[1600px] mx-auto relative">
            {/* View Mode Switcher */}
            <div className="flex justify-end">
                <div className="bg-slate-100 p-1.5 rounded-[1.25rem] flex items-center gap-1">
                    <button onClick={() => setViewMode('OVERVIEW')} className={`p-2.5 px-4 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewMode === 'OVERVIEW' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                        <LayoutGrid size={14} /> Overview
                    </button>
                    <button onClick={() => setViewMode('STATISTICAL')} className={`p-2.5 px-4 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewMode === 'STATISTICAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                        <BarChartIcon size={14} /> Statistical
                    </button>
                </div>
            </div>

            {viewMode === 'STATISTICAL' ? (
                <div className="space-y-10">
                    {/* Stats Row still visible */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((s, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={s.label}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
                            >
                                <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center text-white`}>
                                    <s.icon size={22} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">{s.value}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{s.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                        <Stethoscope size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Personnel Density</h3>
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 tracking-wide">Top 8 departments by allocated medical staff.</p>
                            </div>
                            <div className="h-[360px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={deptData.sort((a,b)=>b.value-a.value).slice(0, 8)} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" height={60} />
                                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                                        <Bar dataKey="value" name="Doctors" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={36} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                                        <UserCheck size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Patient Distribution</h3>
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 tracking-wide">Top 8 departments by unique patient records.</p>
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
            <div className="space-y-10">
            {/* 1. Universal Stats Row: Executive Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((s, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={s.label}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 cursor-default"
                    >
                        <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 ${s.color} rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-${s.color.split('-')[1]}-200 group-hover:scale-110 transition-transform duration-500`}>
                                <s.icon size={32} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{s.label}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* 2. Operations Control: Simple Calendar Launcher */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden group border border-slate-800"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all duration-700" />
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8 h-full">
                    <div className="space-y-4 text-center sm:text-left flex-1">
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <Calendar className="text-indigo-400" size={20} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Registry Control</span>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Clinical Operation Matrix</h2>
                        <p className="text-slate-500 text-xs font-bold max-w-lg">Manage global schedules and audit patient timelines through the unified hospital registry.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        <div className="flex flex-col items-center gap-1 justify-center py-2 px-6 bg-white/5 border border-white/5 rounded-2xl">
                            <span className="text-3xl font-black text-white">{totalAppointmentsToday}</span>
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Active Today</span>
                        </div>
                        <button 
                            onClick={() => setShowCalendar(true)}
                            className="group/btn relative px-10 py-5 bg-indigo-600 hover:bg-white text-white hover:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-900/20 active:scale-95 whitespace-nowrap"
                        >
                            Launch Registry Hub
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* 3. Analytics Matrix: Performance & Distribution */}
            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-12 lg:col-span-7">
                    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden h-full">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                        <Award size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personnel Performance Hall</h3>
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 tracking-wide">Dynamic staff ranking based on verified medical outcomes and patient satisfaction.</p>
                            </div>
                            <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
                                {['COMPLETED', 'RATING_HIGH', 'CANCELLED'].map((m) => (
                                    <button 
                                        key={m}
                                        onClick={() => setSortMetric(m as any)}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sortMetric === m ? 'bg-white text-indigo-600 shadow-sm pt' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {m.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {topDoctors.map((doc, i) => (
                                <div key={doc.id} className="flex items-center gap-5 p-4 bg-slate-50/50 rounded-[2.5rem] border border-slate-50 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 group/card">
                                    <div className="relative shrink-0">
                                        <div className="w-16 h-16 rounded-[1.75rem] overflow-hidden border-2 border-white shadow-lg">
                                            {doc.pic ? <img src={doc.pic} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-400"><Stethoscope size={32} /></div>}
                                        </div>
                                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black shadow-xl">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-slate-900 text-sm truncate">{doc.name}</h4>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{doc.dept}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 font-black text-xs text-indigo-600">
                                                <Activity size={14} />
                                                {sortMetric === 'COMPLETED' ? doc.completed : sortMetric === 'CANCELLED' ? doc.cancelled : doc.avgRating}
                                            </div>
                                            <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[8px] font-black uppercase">Active</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-5 space-y-10">
                    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Staffing Pulse</h3>
                                <p className="text-[11px] font-bold text-slate-400 tracking-wide">Distribution across medical departments.</p>
                            </div>
                        </div>
                        <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                            {deptData.sort((a,b)=>b.value-a.value).map((d, i) => {
                                const maxVal = Math.max(...deptData.map(id => id.value)) || 1;
                                const percent = (d.value / maxVal) * 100;
                                return (
                                    <div key={d.name} className="group/dept">
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <span className="text-[12px] font-black text-slate-800 uppercase tracking-widest">{d.name}</span>
                                            <span className="text-[12px] font-black text-slate-400">{d.value} <span className="text-[9px]">DOCS</span></span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden shadow-inner">
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
                        <div className="max-w-7xl mx-auto space-y-12 pb-20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-4xl font-black text-white tracking-tight">Operation Matrix</h2>
                                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Active Scheduling Logic</p>
                                </div>
                                <button 
                                    onClick={() => setShowCalendar(false)}
                                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-[2rem] border border-white/10 font-black text-xs uppercase tracking-widest transition-all"
                                >
                                    Exit Matrix
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                <div className="lg:col-span-8 bg-white/5 rounded-[4rem] p-12 border border-white/10 shadow-3xl">
                                    <div className="flex items-center justify-between mb-16">
                                        <h3 className="text-2xl font-black text-white">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl">
                                            <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-white/10 rounded-xl text-white"><ChevronLeft size={20}/></button>
                                            <button onClick={() => changeMonth(1)} className="p-3 hover:bg-white/10 rounded-xl text-white"><ChevronRight size={20}/></button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-7 gap-4">
                                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                                            <div key={d} className="text-center text-[10px] font-black text-slate-500 tracking-widest pb-6">{d}</div>
                                        ))}
                                        {calendarDays.map((day, i) => (
                                            <div key={i} className="aspect-square relative">
                                                {day && (
                                                    <button
                                                        onClick={() => setSelectedDate(day.dateStr)}
                                                        className={`w-full h-full rounded-[2rem] flex flex-col items-center justify-center transition-all border ${
                                                            selectedDate === day.dateStr 
                                                            ? 'bg-indigo-600 border-indigo-400 shadow-2xl scale-110' 
                                                            : day.count > 0 ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-transparent border-white/5'
                                                        }`}
                                                    >
                                                        <span className={`text-lg font-black ${selectedDate === day.dateStr ? 'text-white' : day.count > 0 ? 'text-slate-200' : 'text-slate-600'}`}>{day.day}</span>
                                                        {day.count > 0 && <span className={`text-[10px] font-black mt-1 ${selectedDate === day.dateStr ? 'text-indigo-200' : 'text-rose-500'}`}>{day.count}</span>}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="lg:col-span-4 space-y-12">
                                    <AnimatePresence mode="wait">
                                        {selectedDate ? (
                                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-[3.5rem] p-10 shadow-2xl overflow-hidden min-h-[500px]">
                                                <div className="mb-10">
                                                    <h4 className="text-2xl font-black text-slate-900">{new Date(selectedDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</h4>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Daily Stream Output</p>
                                                </div>
                                                <div className="space-y-4">
                                                    {appointmentsOnSelectedDate.length === 0 ? <p className="text-slate-300 font-black italic text-sm py-12 text-center">No Data Pulled</p> : appointmentsOnSelectedDate.map(apt => (
                                                        <div key={apt.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="text-[10px] font-black px-2 py-1 bg-white rounded-lg border border-slate-200">{new Date(apt.dateTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                                <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest">{apt.status}</span>
                                                            </div>
                                                            <p className="font-black text-slate-900 text-sm">{apt.patient?.firstName} {apt.patient?.lastName}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 mt-1">Dr. {apt.doctor?.user?.firstName || apt.doctor?.firstName}</p>
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
