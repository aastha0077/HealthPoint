import { useState, useEffect } from "react";
import { Calendar, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthProvider";
import { apiClient } from "@/apis/apis";
import { motion, AnimatePresence } from "framer-motion";

// Extracted Modals and Components
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";
import { ProfileModal } from "@/components/dashboard/ProfileModal";
import { DetailsModal } from "@/components/dashboard/DetailsModal";
import { ReviewModal } from "@/components/dashboard/ReviewModal";
import { RescheduleModal } from "@/components/dashboard/RescheduleModal";
import { RefundRequestModal } from "@/components/dashboard/RefundRequestModal";

export default function Dashboard() {
    const auth = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // States for Modals
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [refundModalOpen, setRefundModalOpen] = useState(false);

    const [selectedApt, setSelectedApt] = useState<any>(null);
    const [apptSubFilter, setApptSubFilter] = useState<"UPCOMING" | "HISTORY" | "CANCELLED" | "MISSED">("UPCOMING");
    const [refundStatuses, setRefundStatuses] = useState<Record<number, any>>({});

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get("/api/appointments/user");
            setAppointments(res.data);
            fetchRefundStatuses(res.data);
        } catch {
            toast.error("Failed to load appointments");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRefundStatuses = async (appts: any[]) => {
        const missed = appts.filter(a => a.status === "MISSED");
        const statuses: Record<number, any> = {};
        for (const apt of missed) {
            try {
                const res = await apiClient.get(`/api/appointments/${apt.id}/refund-status`);
                statuses[apt.id] = res.data;
            } catch {
                // Ignore missing refunds
            }
        }
        setRefundStatuses(statuses);
    };

    const handleCancel = async (id: number) => {
        if (!window.confirm("Are you sure you want to cancel?")) return;
        try {
            await apiClient.post(`/api/appointments/${id}/cancel`);
            toast.success("Appointment cancelled");
            fetchAppointments();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Cleanup failed");
        }
    };

    const handleDownloadInvoice = async (id: number) => {
        try {
            const res = await apiClient.get(`/api/appointments/${id}/invoice`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            toast.error("Failed to download invoice");
        }
    };

    const handleProfileSave = async (data: { firstName: string; lastName: string; file: File | null }) => {
        try {
            let updatedProfilePicture = auth?.user?.profilePicture || "";
            if (data.file) {
                const formData = new FormData();
                formData.append("file", data.file);
                const uploadRes = await apiClient.post("/api/upload", formData);
                updatedProfilePicture = uploadRes.data.url;
            }
            const res = await apiClient.put("/api/user/profile", {
                firstName: data.firstName,
                lastName: data.lastName,
                profilePicture: updatedProfilePicture
            });
            if (auth?.setAuthData && auth.token && auth.refreshToken) {
                auth.setAuthData(auth.token, auth.refreshToken, res.data);
            }
            toast.success("Profile updated!");
            setProfileModalOpen(false);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed");
            throw err;
        }
    };

    const handleReviewSubmit = async (rating: number, comment: string) => {
        if (!selectedApt) return;
        try {
            await apiClient.post(`/api/doctors/${selectedApt.doctorId}/reviews`, {
                rating, comment, appointmentId: selectedApt.id
            });
            toast.success("Review submitted!");
            setReviewModalOpen(false);
            fetchAppointments();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to submit review");
            throw err;
        }
    };

    const handleRescheduleSubmit = async (appointmentId: number, newDateTime: string) => {
        try {
            await apiClient.post(`/api/appointments/${appointmentId}/reschedule`, { newDateTime });
            toast.success("Rescheduled!");
            setRescheduleModalOpen(false);
            fetchAppointments();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed");
            throw err;
        }
    };

    const handleRefundSuccess = () => {
        setRefundModalOpen(false);
        fetchAppointments();
    };

    const filteredAppointments = appointments.filter(a => {
        if (apptSubFilter === "UPCOMING") return a.status === "BOOKED" || a.status === "PENDING";
        if (apptSubFilter === "HISTORY") return a.status === "COMPLETED";
        if (apptSubFilter === "MISSED") return a.status === "MISSED";
        return a.status === "CANCELLED";
    }).sort((a, b) => {
        if (apptSubFilter === "MISSED") {
            const refundA = refundStatuses[a.id];
            const refundB = refundStatuses[b.id];
            
            const isCompletedA = refundA?.status === "COMPLETED";
            const isCompletedB = refundB?.status === "COMPLETED";
            
            if (isCompletedA && !isCompletedB) return 1;
            if (!isCompletedA && isCompletedB) return -1;
        }
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    });

    const stats = {
        upcoming: appointments.filter(a => a.status === "BOOKED" || a.status === "PENDING").length,
        completed: appointments.filter(a => a.status === "COMPLETED").length,
        activeChats: appointments.filter(a => {
            if (a.status !== "COMPLETED" || !a.completedAt) return false;
            return (new Date().getTime() - new Date(a.completedAt).getTime()) < 24 * 60 * 60 * 1000;
        }).length,
    };

    const statusBadge = (s: string) => {
        const colors: Record<string, string> = {
            BOOKED: "bg-blue-50 text-blue-600 border-blue-100",
            PENDING: "bg-amber-50 text-amber-600 border-amber-100",
            COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
            CANCELLED: "bg-slate-50 text-slate-400 border-slate-100",
            MISSED: "bg-red-50 text-red-600 border-red-100",
        };
        return colors[s] || "bg-slate-50 text-slate-600";
    };

    const missedCount = appointments.filter(a => a.status === "MISSED").length;

    return (
        <div className="min-h-screen bg-[#FDFDFF] lg:pl-32 lg:pr-12 py-12 relative">
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] -z-10" />
            
            <div className="max-w-7xl mx-auto pb-32">
                <div className="sticky top-0 z-[40] mb-12">
                    <div className="bg-white/80 backdrop-blur-3xl border border-slate-200/60 rounded-[3rem] p-5 shadow-2xl shadow-indigo-500/5 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <motion.div 
                                onClick={() => setProfileModalOpen(true)}
                                whileHover={{ scale: 1.05 }}
                                className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white font-black text-xl shadow-xl cursor-pointer overflow-hidden border-2 border-white ring-4 ring-slate-50"
                            >
                                {auth?.user?.profilePicture ? <img src={auth.user.profilePicture} className="w-full h-full object-cover" /> : (auth?.user?.firstName || "U")[0]}
                            </motion.div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
                                    Greetings, {auth?.user?.firstName}.
                                </h1>
                                <p className="text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.4em] leading-none mt-2">Health Management Console</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-3 px-8 py-3 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <div className="flex flex-col items-center px-4 border-r border-slate-200">
                                    <span className="text-sm font-black text-slate-900 leading-none">{stats.upcoming}</span>
                                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Active</span>
                                </div>
                                <div className="flex flex-col items-center px-4">
                                    <span className="text-sm font-black text-indigo-600 leading-none">{stats.completed}</span>
                                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">History</span>
                                </div>
                            </div>
                            
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate("/my-chats")}
                                className="px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-4"
                            >
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Conversations
                            </motion.button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-12 space-y-16">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 rotate-6">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Your Clinical Registry</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{filteredAppointments.length} sessions documented in this segment</p>
                                </div>
                            </div>

                            <div className="inline-flex p-2 bg-white rounded-[2rem] border border-slate-200/60 shadow-lg">
                                {[
                                    { key: "UPCOMING", label: "Appointments" },
                                    { key: "HISTORY", label: "Past Visits" },
                                    { key: "MISSED", label: "Missed" },
                                    { key: "CANCELLED", label: "Cancelled" }
                                ].map(f => (
                                    <button
                                        key={f.key}
                                        onClick={() => setApptSubFilter(f.key as any)}
                                        className={`px-8 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                                            apptSubFilter === f.key 
                                                ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20" 
                                                : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                        }`}
                                    >
                                        {f.label}
                                        {f.key === "MISSED" && missedCount > 0 && (
                                            <span className="ml-2 bg-rose-500 text-white text-[8px] px-1.5 py-0.5 rounded-full inline-block animate-bounce">{missedCount}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            {isLoading ? (
                                <div className="grid grid-cols-1 gap-8">
                                    {[1, 2, 3].map(i => <div key={i} className="h-44 bg-white rounded-[3rem] border border-slate-100 shadow-sm animate-pulse" />)}
                                </div>
                            ) : filteredAppointments.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[4rem] border border-slate-100/60 border-dashed"
                                >
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-8 font-black">
                                        Empty
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">Vacuum State</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">No clinical records match this filter</p>
                                    <button 
                                        onClick={() => navigate("/appointment")}
                                        className="mt-10 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                                    >
                                        Schedule New Consultation
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 gap-8">
                                    {filteredAppointments.map(apt => (
                                        <AppointmentCard
                                            key={apt.id}
                                            apt={apt}
                                            filter={apptSubFilter}
                                            refundStatus={refundStatuses[apt.id]}
                                            statusBadge={statusBadge}
                                            onReschedule={a => { setSelectedApt(a); setRescheduleModalOpen(true); }}
                                            onCancel={handleCancel}
                                            onDetails={a => { setSelectedApt(a); setDetailsModalOpen(true); }}
                                            onDownloadInvoice={handleDownloadInvoice}
                                            onReview={a => { setSelectedApt(a); setReviewModalOpen(true); }}
                                            onRefundRequest={a => { setSelectedApt(a); setRefundModalOpen(true); }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sub CTA Section */}
                <div className="mt-32">
                    <div className="flex items-center gap-12 text-slate-300 mb-12">
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Resource Expansion</span>
                        <div className="h-px flex-1 bg-slate-100" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* New Subtle Search Card */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            onClick={() => navigate("/appointment")}
                            className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-indigo-100/20 group cursor-pointer flex items-center justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                    <Search size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Browse Clinicians</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manual specialist lookup</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                →
                            </div>
                        </motion.div>

                        {/* Subtle Link to Services */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            onClick={() => navigate("/our-services")}
                            className="bg-indigo-600 rounded-[3rem] p-10 shadow-xl shadow-indigo-200/40 group cursor-pointer flex items-center justify-between text-white"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">Explore Wellness</h3>
                                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">View our clinical offerings</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-indigo-600 transition-all">
                                →
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {profileModalOpen && (
                    <ProfileModal
                        initialFirstName={auth?.user?.firstName || ""}
                        initialLastName={auth?.user?.lastName || ""}
                        initialProfilePicture={auth?.user?.profilePicture || ""}
                        onClose={() => setProfileModalOpen(false)}
                        onSave={handleProfileSave}
                    />
                )}
                {detailsModalOpen && selectedApt && (
                    <DetailsModal appointment={selectedApt} onClose={() => setDetailsModalOpen(false)} />
                )}
                {reviewModalOpen && selectedApt && (
                    <ReviewModal appointment={selectedApt} onClose={() => setReviewModalOpen(false)} onSubmit={handleReviewSubmit} />
                )}
                {rescheduleModalOpen && selectedApt && (
                    <RescheduleModal appointment={selectedApt} onClose={() => setRescheduleModalOpen(false)} onSubmit={handleRescheduleSubmit} />
                )}
                {refundModalOpen && selectedApt && (
                    <RefundRequestModal appointment={selectedApt} onClose={() => setRefundModalOpen(false)} onSuccess={handleRefundSuccess} />
                )}
            </AnimatePresence>
        </div>
    );
}
