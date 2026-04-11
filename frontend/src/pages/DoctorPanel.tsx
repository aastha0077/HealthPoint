import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, Routes, Route } from "react-router";
import { Activity, X, FileDown } from "lucide-react";
import toast from "react-hot-toast";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/contexts/AuthProvider";
import { apiClient } from "@/apis/apis";
import { DoctorSidebar } from "@/components/doctor/DoctorSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { ConsultationModal } from "@/components/doctor/ConsultationModal";
import { DoctorChat } from "@/components/doctor/DoctorChat";

// Extracted Components
import { DoctorDashboardTab } from "@/components/doctor/dashboard/DoctorDashboardTab";
import { SchedulingHub } from "@/components/doctor/dashboard/SchedulingHub";
import { RescheduleReportModal } from "@/components/doctor/dashboard/RescheduleReportModal";
import { MessageSection } from "@/components/doctor/dashboard/MessageSection";
import { AppointmentSection } from "@/components/doctor/dashboard/AppointmentSection";

export function DoctorPanel() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [appointments, setAppointments] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [isLoadingConvs, setIsLoadingConvs] = useState(false);
    const [search, setSearch] = useState("");
    const [activeConsultation, setActiveConsultation] = useState<any>(null);
    const [activeChatAppointment, setActiveChatAppointment] = useState<any>(null);
    const [activeRecordingApt, setActiveRecordingApt] = useState<any>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const auth = useAuth() as any; 
    const limit = 50; 
    const [sessionTimer, setSessionTimer] = useState("00:00:00");
    const [imminentAppt, setImminentAppt] = useState<any>(null);
    const [doctorStats, setDoctorStats] = useState({ totalCompleted: 0, totalPatients: 0 });
    const [fullProfile, setFullProfile] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [unavailableDate, setUnavailableDate] = useState('');
    const [isMarkingUnavailable, setIsMarkingUnavailable] = useState(false);
    const [unavailableResult, setUnavailableResult] = useState<any>(null);
    const [showUnavailableResult, setShowUnavailableResult] = useState(false);

    const fetchAppointments = useCallback(async (reset = false) => {
        const targetPage = reset ? 1 : page;
        if (reset) { setPage(1); }
        try {
            const res = await apiClient.get(`/api/appointments?page=${targetPage}&limit=${limit}`);
            const newAppointments = res.data.appointments || [];
            setAppointments(prev => reset ? newAppointments : [...prev, ...newAppointments]);
            if (!reset) setPage(prev => prev + 1);
        } catch { toast.error("Failed to load clinical data"); }
    }, [page, limit]);

    const fetchDoctorStats = useCallback(async () => {
        try {
            const res = await apiClient.get("/api/appointments/doctor/stats");
            setDoctorStats(res.data);
        } catch { console.error("Failed to fetch doctor stats"); }
    }, []);

    const fetchConversations = useCallback(async () => {
        setIsLoadingConvs(true);
        try {
            const res = await apiClient.get("/api/chat/conversations");
            setConversations(res.data);
        } catch { toast.error("Failed to load messages"); } finally { setIsLoadingConvs(false); }
    }, []);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await apiClient.get("/api/doctors/profile/me");
            setFullProfile(res.data);
        } catch { console.error("Failed to fetch profile"); }
    }, []);

    const fetchReviews = useCallback(async (docId: number) => {
        try {
            const res = await apiClient.get(`/api/reviews/doctor/${docId}`);
            setReviews(res.data.reviews || []);
        } catch { console.error("Failed to fetch reviews"); }
    }, []);

    useEffect(() => { 
        fetchAppointments(true); 
        fetchDoctorStats();
        fetchProfile();
        fetchConversations();
    }, [fetchAppointments, fetchDoctorStats, fetchProfile, fetchConversations]);

    useEffect(() => {
        if (fullProfile?.doctorId) fetchReviews(fullProfile.doctorId);
    }, [fullProfile, fetchReviews]);

    useEffect(() => {
        const interval = setInterval(() => {
            const active = appointments.find(a => a.status === "IN_PROGRESS");
            if (active && active.startedAt) {
                const start = new Date(active.startedAt).getTime();
                const now = new Date().getTime();
                const diff = Math.max(0, now - start);
                const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
                const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
                const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
                setSessionTimer(`${h}:${m}:${s}`);
            } else { setSessionTimer("00:00:00"); }
        }, 1000);
        return () => clearInterval(interval);
    }, [appointments]);

    useEffect(() => {
        const check = () => {
            const now = new Date().getTime();
            const next = appointments.find(a => {
                if (a.status !== "BOOKED") return false;
                const time = new Date(a.dateTime).getTime();
                const diff = time - now;
                return diff > 0 && diff <= 15 * 60 * 1000;
            });
            if (next && next.id !== imminentAppt?.id) {
                setImminentAppt(next);
                toast(`Upcoming Appointment: ${next.patient?.firstName} starts soon!`, { icon: '⏰', duration: 5000 });
            } else if (!next) { setImminentAppt(null); }
        };
        check();
        const interval = setInterval(check, 30000);
        return () => clearInterval(interval);
    }, [appointments, imminentAppt]);

    useEffect(() => {
        const chatId = searchParams.get('chat');
        if (chatId && appointments.length > 0) {
            const apt = appointments.find(a => a.id === parseInt(chatId));
            if (apt) {
                setActiveChatAppointment(apt);
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('chat');
                setSearchParams(newParams);
            }
        }
    }, [searchParams, appointments, setSearchParams]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Keep active consultation in sync with list data (to get startedAt/status updates)
    useEffect(() => {
        if (activeConsultation) {
            const updated = appointments.find(a => a.id === (activeConsultation as any).id);
            if (updated && (updated.startedAt !== (activeConsultation as any).startedAt || updated.status !== (activeConsultation as any).status)) {
                setActiveConsultation(updated);
            }
        }
    }, [appointments, activeConsultation]);



    const handleStart = async (id: number) => {
        try {
            // Request microphone access for recording
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (err) {
                toast.error("Microphone access is required for consultation recording");
                return;
            }

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.start(1000); // 1s timeslice for robustness
            toast.success("Recording started", { icon: "🎙️" });

            await apiClient.post(`/api/appointments/${id}/start`);
            toast.success("Consultation started");
            
            // Set as active consultation so modal opens
            const startedApt = appointments.find(a => a.id === id);
            if (startedApt) {
                setActiveConsultation({ ...startedApt, status: "IN_PROGRESS", startedAt: new Date().toISOString() });
            }
            
            fetchAppointments(true);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to start session");
        }
    };

    const handleExportPDF = async (title: string, columns: string[], data: any[]) => {
        try {
            const res = await apiClient.post("/api/pdf/table-export", 
                { title, columns, data }, 
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, "_")}_export.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(`${title} exported successfully`);
        } catch {
            toast.error("Failed to export PDF");
        }
    };

    const downloadInvoice = async (id: number) => {
        try {
            const res = await apiClient.get(`/api/pdf/invoice/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_hp_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            toast.error("Failed to download invoice");
        }
    };

    const handleComplete = async (id: number, extraData?: { consultationDuration?: number, audioRecordingUrl?: string }) => {
        let finalData = extraData || {};
        
        try {
            // Stop recording if active
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                const stopPromise = new Promise<string | null>((resolve) => {
                    if (!mediaRecorderRef.current) return resolve(null);
                    
                    mediaRecorderRef.current.onstop = async () => {
                        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
                        
                        // Release microphone immediately after stop
                        if (mediaRecorderRef.current?.stream) {
                            mediaRecorderRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
                        }

                        if (audioBlob.size === 0) return resolve(null);

                        const formData = new FormData();
                        formData.append("file", audioBlob, `consultation-${id}.webm`);
                        
                        try {
                            const uploadRes = await apiClient.post("/api/upload", formData);
                            // Verify field name from backend (controllers/upload.controllers.ts)
                            const url = uploadRes.data.fileUrl || uploadRes.data.url;
                            resolve(url || null);
                        } catch (err) {
                            console.error("Audio recording upload failed", err);
                            resolve(null);
                        }
                    };
                    mediaRecorderRef.current.stop();
                });

                toast.promise(stopPromise, {
                    loading: 'Finalizing recording...',
                    success: 'Audio saved!',
                    error: 'Recording upload failed'
                });

                const audioUrl = await stopPromise;
                console.log(`[Frontend:handleComplete] Audio URL from promise:`, audioUrl);
                if (audioUrl) finalData.audioRecordingUrl = audioUrl;
            }

            // Calculate duration if not provided
            if (!finalData.consultationDuration) {
                const apt = appointments.find(a => a.id === id);
                if (apt?.startedAt) {
                    const durationSeconds = Math.floor((Date.now() - new Date(apt.startedAt).getTime()) / 1000);
                    finalData.consultationDuration = durationSeconds;
                }
            }

            await apiClient.post(`/api/appointments/${id}/complete`, finalData);
            toast.success("Session completed");
            fetchAppointments(true);
            fetchDoctorStats();
            setActiveConsultation(null);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to mark complete");
        }
    };

    const handleMarkUnavailable = async () => {
        setIsMarkingUnavailable(true);
        try {
            const res = await apiClient.post('/api/doctors/mark-unavailable', { date: unavailableDate });
            setUnavailableResult(res.data);
            setShowUnavailableResult(true);
            toast.success('Schedule Rescheduled');
            setUnavailableDate('');
            fetchAppointments(true);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to update schedule');
        } finally { setIsMarkingUnavailable(false); }
    };

    const changeMonth = (offset: number) => {
        const next = new Date(currentMonth);
        next.setMonth(next.getMonth() + offset);
        setCurrentMonth(next);
    };

    const calendarDays = useMemo(() => {
        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const days = [];
        for (let i = 0; i < start.getDay(); i++) days.push(null);
        for (let d = 1; d <= end.getDate(); d++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
            const dateStr = date.toISOString().split('T')[0];
            const count = appointments.filter(a => a.dateTime.startsWith(dateStr)).length;
            days.push({ day: d, dateStr, count });
        }
        return days;
    }, [currentMonth, appointments]);

    const getFilteredAppointments = (type: 'QUEUE' | 'HISTORY') => {
        return appointments.filter(a => {
            const patientName = `${a.patient?.firstName || ""} ${a.patient?.lastName || ""}`.toLowerCase();
            const apptNum = (a.appointmentNumber || "").toLowerCase();
            const matchesSearch = patientName.includes(search.toLowerCase()) || apptNum.includes(search.toLowerCase());
            
            if (search.trim() !== "" && !matchesSearch) return false;
            
            if (type === 'QUEUE') return (a.status === "BOOKED" || a.status === "PENDING" || a.status === "IN_PROGRESS");
            if (type === 'HISTORY') {
                if (statusFilter === "ALL") return true;
                if (statusFilter === "UPCOMING") return (a.status === "BOOKED" || a.status === "PENDING" || a.status === "IN_PROGRESS");
                if (statusFilter === "CANCELLED") return a.status === "CANCELLED";
                return a.status === statusFilter;
            }
            return true;
        });
    };

    const stats = {
        total: appointments.length,
        upcoming: appointments.filter(a => a.status === "BOOKED" || a.status === "PENDING").length,
        inProgress: appointments.filter(a => a.status === "IN_PROGRESS").length,
        completed: appointments.filter(a => a.status === "COMPLETED").length,
    };

    const totalAppointmentsToday = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return appointments.filter(a => a.dateTime.startsWith(todayStr)).length;
    }, [appointments]);

    const appointmentsOnSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return appointments.filter(a => a.dateTime.startsWith(selectedDate));
    }, [selectedDate, appointments]);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <DoctorSidebar />
            
            {/* Profile Edit Modal */}
            <AnimatePresence>
                {showProfileEdit && fullProfile && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-3xl w-full max-w-xl shadow-xl overflow-hidden">
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setIsUpdatingProfile(true);
                                const formData = new FormData(e.currentTarget);
                                const updateData = Object.fromEntries(formData.entries());
                                try {
                                    await apiClient.put(`/api/doctors/${fullProfile.doctorId}`, updateData);
                                    toast.success("Profile Updated");
                                    fetchProfile();
                                    setShowProfileEdit(false);
                                } catch { toast.error("Update failed"); } finally { setIsUpdatingProfile(false); }
                            }} className="p-6 space-y-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-bold text-slate-900">Edit Practice Profile</h3>
                                    <button type="button" onClick={() => setShowProfileEdit(false)} className="text-slate-400 hover:text-slate-900"><X size={20}/></button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Department</label>
                                        <input name="department" defaultValue={typeof fullProfile.department === 'object' ? fullProfile.department?.name : fullProfile.department} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500/20 font-semibold" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Speciality</label>
                                        <input name="expertise" defaultValue={fullProfile.expertise} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500/20 font-semibold" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Bio & Experience</label>
                                    <textarea name="bio" defaultValue={fullProfile.bio} rows={3} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500/20 font-semibold resize-none" />
                                </div>
                                <button type="submit" disabled={isUpdatingProfile} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-md">
                                    {isUpdatingProfile ? "Syncing..." : "Save Changes"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen custom-scrollbar">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Healthcare <span className="text-rose-600">Portal</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{auth.user?.firstName}'s Dashboard</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm cursor-pointer hover:scale-105 transition-transform">
                            {auth.user?.firstName?.[0]}
                        </div>
                    </div>
                </header>

                <Routes>
                    <Route path="/" element={
                        <DoctorDashboardTab 
                            doctorStats={doctorStats}
                            stats={stats}
                            totalAppointmentsToday={totalAppointmentsToday}
                            appointments={appointments}
                            imminentAppt={imminentAppt}
                            sessionTimer={sessionTimer}
                            onStart={handleStart}
                            onComplete={handleComplete}
                            conversations={conversations}
                            onOpenCalendar={() => setShowCalendar(true)}
                            unavailableDate={unavailableDate}
                            setUnavailableDate={setUnavailableDate}
                            isMarkingUnavailable={isMarkingUnavailable}
                            onMarkUnavailable={handleMarkUnavailable}
                        />
                    } />
                    <Route path="/messages" element={
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <MessageSection 
                                conversations={conversations} 
                                isLoading={isLoadingConvs} 
                                onRefresh={fetchConversations} 
                                onOpenChat={setActiveChatAppointment}
                            />
                        </motion.div>
                    } />
                    <Route path="/queue" element={
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <AppointmentSection 
                                appointments={getFilteredAppointments('QUEUE')}
                                search={search}
                                onSearchChange={setSearch}
                                statusFilter={statusFilter}
                                onFilterChange={setStatusFilter}
                                showFilter={false}
                                onStart={handleStart}
                                onComplete={handleComplete}
                                onOpenChat={setActiveChatAppointment}
                                onOpenRecording={setActiveRecordingApt}
                                onExport={() => handleExportPDF("My Active Queue", ["ID", "Patient", "Date", "Status"], getFilteredAppointments('QUEUE').map(a => ({
                                    id: a.appointmentNumber,
                                    patient: `${a.patient.firstName} ${a.patient.lastName}`,
                                    date: new Date(a.dateTime).toLocaleDateString(),
                                    status: a.status
                                })))}
                                onDownloadInvoice={downloadInvoice}
                            />
                        </motion.div>
                    } />
                    <Route path="/appointments" element={
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <AppointmentSection 
                                appointments={getFilteredAppointments('HISTORY')}
                                search={search}
                                onSearchChange={setSearch}
                                statusFilter={statusFilter}
                                onFilterChange={setStatusFilter}
                                showFilter={true}
                                onStart={handleStart}
                                onComplete={handleComplete}
                                onOpenChat={setActiveChatAppointment}
                                onOpenRecording={setActiveRecordingApt}
                                onExport={() => handleExportPDF("Clinical History", ["ID", "Patient", "Date", "Status"], getFilteredAppointments('HISTORY').map(a => ({
                                    id: a.appointmentNumber,
                                    patient: `${a.patient.firstName} ${a.patient.lastName}`,
                                    date: new Date(a.dateTime).toLocaleDateString(),
                                    status: a.status
                                })))}
                                onDownloadInvoice={downloadInvoice}
                            />
                        </motion.div>
                    } />
                    <Route path="/profile" element={
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto">
                            {fullProfile && (
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                     <div className="h-32 bg-slate-900 relative">
                                        <div className="absolute -bottom-10 left-8 w-24 h-24 bg-white rounded-2xl p-0.5 shadow-lg">
                                            <div className="w-full h-full bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 font-bold text-3xl">
                                                {auth.user?.firstName?.[0]}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-14 p-8">
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dr. {auth.user?.firstName} {auth.user?.lastName}</h2>
                                                <p className="text-rose-600 font-bold uppercase tracking-wider text-[10px] mt-1">{typeof fullProfile.department === 'object' ? fullProfile.department?.name : fullProfile.department} Specialist</p>
                                            </div>
                                            <button onClick={() => setShowProfileEdit(true)} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl border border-slate-200 font-bold text-[10px] uppercase tracking-wider transition-all">
                                                Edit Profile
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Experience</p>
                                                <p className="text-lg font-bold text-slate-900">{fullProfile.experienceYears || '10+'} Years</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fee</p>
                                                <p className="text-lg font-bold text-slate-900">Rs. {fullProfile.consultationFee || '1000'}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    <p className="text-lg font-bold text-slate-900">Online</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="prose prose-slate">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Biography</h4>
                                            <p className="text-slate-600 font-bold leading-relaxed">{fullProfile.bio || 'Professional medical profile summary.'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    } />
                    <Route path="/reviews" element={
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Patient Feedback</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-6">Last 50 practice ratings</p>
                                {reviews.length === 0 ? (
                                    <div className="py-12 text-center opacity-20"><Activity size={32} className="mx-auto" /></div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {reviews.map((r) => (
                                            <div key={r.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="flex gap-1 mb-1.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i} className={`w-2 h-2 rounded-full ${i < r.rating ? 'bg-amber-400' : 'bg-slate-200'}`} />
                                                            ))}
                                                        </div>
                                                        <p className="font-bold text-sm text-slate-900">{r.patient?.firstName}</p>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-slate-600 font-semibold leading-relaxed italic">"{r.comment}"</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    } />
                </Routes>

                <footer className="mt-20 pt-10 border-t border-slate-100 flex flex-wrap justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">HealthPoint &copy; 2026</p>
                    <div className="flex gap-8">
                        <button className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors">Support</button>
                        <button className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors">Privacy</button>
                    </div>
                </footer>
            </main>

            <RescheduleReportModal 
                show={showUnavailableResult} 
                result={unavailableResult} 
                onClose={() => setShowUnavailableResult(false)} 
            />

            <SchedulingHub 
                show={showCalendar}
                onClose={() => setShowCalendar(false)}
                currentMonth={currentMonth}
                changeMonth={changeMonth}
                calendarDays={calendarDays}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                appointmentsOnSelectedDate={appointmentsOnSelectedDate}
            />

            <AnimatePresence>
                {activeChatAppointment && (
                    <DoctorChat 
                        appointmentId={activeChatAppointment.id}
                        patientName={`${activeChatAppointment.patient?.firstName} ${activeChatAppointment.patient?.lastName}`}
                        completedAt={activeChatAppointment.completedAt}
                        onClose={() => setActiveChatAppointment(null)}
                    />
                )}
            </AnimatePresence>

            {activeConsultation && (
                <ConsultationModal 
                    appointmentId={activeConsultation.id}
                    patientId={activeConsultation.patientId}
                    patientName={`${activeConsultation.patient?.firstName} ${activeConsultation.patient?.lastName}`}
                    startedAt={activeConsultation.startedAt}
                    onClose={() => setActiveConsultation(null)}
                    onComplete={handleComplete}
                    onSaveSuccess={() => { fetchAppointments(true); fetchDoctorStats(); }}
                />
            )}

            <AnimatePresence>
                {activeRecordingApt && (
                    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative"
                        >
                            <div className="p-6 text-center space-y-6">
                                <button 
                                    onClick={() => setActiveRecordingApt(null)}
                                    className="absolute top-4 right-4 p-1.5 bg-slate-50 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                    <X size={18} />
                                </button>

                                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto shadow-inner">
                                    <Activity size={28} className="animate-pulse" />
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                                        Session Recording
                                    </h3>
                                    <p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest mt-1">
                                        Consultation: {activeRecordingApt.patient?.firstName}
                                    </p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-slate-500 text-xs font-semibold">
                                    "This audio is part of the secure clinical audit trail."
                                </div>

                                <audio 
                                    src={activeRecordingApt.audioRecordingUrl} 
                                    controls 
                                    autoPlay
                                    className="w-full h-10 custom-audio-player"
                                />

                                <div className="pt-2 flex justify-center">
                                    <button 
                                        onClick={() => setActiveRecordingApt(null)}
                                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
                                    >
                                        Dismiss Player
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
