import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
    Star,
    Clock,
    Calendar,
    ChevronRight,
    MapPin,
    Award,
    ShieldCheck,
    MessageSquare,
    User,
    ArrowLeft,
    Heart,
    GraduationCap,
    Send,
    X,
    Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/apis/apis";
import { useAuth } from "@/contexts/AuthProvider";
import { useFavorites } from "@/contexts/FavoriteContext";
import toast from "react-hot-toast";

export function DoctorDetails() {
    const { id } = useParams();
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewStats, setReviewStats] = useState<any>(null);
    const [favoriteAnimating, setFavoriteAnimating] = useState(false);

    // Review modal state
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const auth = useAuth();
    const navigate = useNavigate();

    const fetchDoctor = async () => {
        try {
            const res = await apiClient.get(`/api/doctors/${id}`);
            setDoctor(res.data);
        } catch {
            toast.error("Failed to load doctor details");
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await apiClient.get(`/api/reviews/doctor/${id}`);
            setReviews(res.data.reviews || []);
            setReviewStats(res.data.stats);
        } catch {
            // fail silently, fall back to doctor.reviews
        }
    };

    const { isFavorite, toggleFavorite: toggleFav } = useFavorites();
    const isFavorited = isFavorite(Number(id));

    useEffect(() => {
        fetchDoctor();
        fetchReviews();
    }, [id]);

    const handleToggleFavorite = async () => {
        if (!auth?.isAuthenticated) {
            navigate("/auth?mode=login");
            return;
        }
        setFavoriteAnimating(true);
        try {
            const nowFavorited = await toggleFav(Number(id));
            toast.success(nowFavorited ? "❤️ Added to favourites!" : "Removed from favourites");
        } catch {
            toast.error("Failed to update favourites");
        } finally {
            setTimeout(() => setFavoriteAnimating(false), 600);
        }
    };

    const handleReviewSubmit = async () => {
        if (!auth?.isAuthenticated) { navigate("/auth?mode=login"); return; }
        if (!comment.trim()) { toast.error("Please write a comment"); return; }
        setSubmittingReview(true);
        try {
            await apiClient.post("/api/reviews", {
                doctorId: Number(id),
                rating,
                comment,
            });
            toast.success("🌟 Review submitted!");
            setReviewModalOpen(false);
            setComment("");
            setRating(5);
            fetchReviews();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rose-50/20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
                    <p className="font-black text-rose-600 uppercase tracking-widest text-xs">Assembling Profile...</p>
                </div>
            </div>
        );
    }

    if (!doctor) return null;

    const doctorImageUrl = doctor.profilePicture || doctor.user?.profilePicture || `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face`;
    const allReviews = reviews.length > 0 ? reviews : (doctor.reviews || []);
    const avgRating = reviewStats?.averageRating ?? (allReviews.length > 0 ? (allReviews.reduce((s: number, r: any) => s + r.rating, 0) / allReviews.length).toFixed(1) : null);

    return (
        <div className="min-h-screen bg-slate-50 pb-16">
            {/* Header / Cover */}
            <div className="bg-white border-b border-slate-100 pt-16 pb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/60 via-white to-white -z-0" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-100/30 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-8 inline-flex items-center gap-2 text-slate-400 hover:text-rose-600 font-bold transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Team
                    </button>

                    <div className="flex flex-col lg:flex-row gap-10 items-start">
                        {/* Profile Image Column */}
                        <div className="relative group flex-shrink-0">
                            <div className="absolute inset-0 bg-rose-200 rounded-[2.5rem] rotate-3 group-hover:rotate-6 transition-transform duration-500 -z-10" />
                            <img
                                src={doctorImageUrl}
                                alt={doctor.firstName}
                                className="w-56 h-56 object-cover rounded-[2.5rem] border-8 border-white shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face`;
                                }}
                            />
                            <div className="absolute -bottom-4 -right-4 bg-emerald-500 text-white p-3 rounded-2xl border-4 border-white shadow-lg">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            {/* Favourite Heart Button */}
                            <motion.button
                                onClick={handleToggleFavorite}
                                whileTap={{ scale: 1.4 }}
                                className="absolute -top-3 -left-3 bg-white shadow-xl border border-slate-100 p-3 rounded-2xl z-10"
                            >
                                <motion.div
                                    animate={favoriteAnimating ? { scale: [1, 1.5, 1] } : {}}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Heart
                                        className={`w-6 h-6 transition-colors ${isFavorited ? "text-rose-600 fill-rose-600" : "text-slate-300"}`}
                                    />
                                </motion.div>
                            </motion.button>
                        </div>

                        {/* Basic Info Column */}
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest border border-rose-200">
                                        Verified Specialist
                                    </span>
                                    {avgRating && (
                                        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                            <span className="text-sm font-black text-amber-700">{avgRating}</span>
                                            <span className="text-xs text-amber-500 font-bold">({allReviews.length} reviews)</span>
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                    Dr. {doctor.firstName} {doctor.lastName}
                                </h1>
                                <p className="text-xl font-bold text-rose-600">{doctor.speciality} • {doctor.department?.name}</p>
                            </div>

                            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl font-medium">
                                {doctor.bio}
                            </p>

                            {/* Qualificationspill display */}
                            {doctor.qualifications && (
                                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <GraduationCap className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Qualifications</p>
                                        <p className="text-sm font-bold text-blue-800">{doctor.qualifications}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-rose-100 shadow-sm">
                                    <Award className="w-5 h-5 text-rose-500" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</p>
                                        <p className="text-sm font-bold text-slate-800">10+ Years</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-rose-100 shadow-sm">
                                    <Clock className="w-5 h-5 text-emerald-500" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultation</p>
                                        <p className="text-sm font-bold text-slate-800">Mon–Fri</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-rose-100 shadow-sm">
                                    <MapPin className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                        <p className="text-sm font-bold text-slate-800">{doctor.address || "Main Branch"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Column */}
                        <div className="w-full lg:w-72">
                            <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl shadow-rose-200">
                                <h4 className="text-base font-black mb-4">Book Appointment</h4>
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 font-bold">Consultation Fee</span>
                                        <span className="font-black text-rose-500">Rs. 850</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 font-bold">Booking Mode</span>
                                        <span className="font-black text-white">Online Portal</span>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div className="flex items-center justify-between text-base">
                                        <span className="text-white font-black">Total</span>
                                        <span className="font-black text-rose-500 text-lg">Rs. 850</span>
                                    </div>
                                </div>
                                <Link
                                    to={auth?.isAuthenticated ? `/book-appointment?doctorId=${doctor.doctorId}` : "/auth?mode=login"}
                                    className="block w-full"
                                >
                                    <button className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-2xl font-black shadow-xl shadow-rose-900/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                                        Instant Booking <ChevronRight className="w-4 h-4" />
                                    </button>
                                </Link>
                                <button
                                    onClick={handleToggleFavorite}
                                    className={`w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all border ${isFavorited ? "bg-rose-600/20 border-rose-600/30 text-rose-400" : "border-white/10 text-slate-400 hover:border-rose-600/30 hover:text-rose-400"}`}
                                >
                                    <Heart className={`w-4 h-4 ${isFavorited ? "fill-rose-500 text-rose-500" : ""}`} />
                                    {isFavorited ? "Saved to Favourites" : "Save to Favourites"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: About & Reviews */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Professional Profile */}
                        <section className="space-y-6">
                            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                                    <User size={20} />
                                </div>
                                Professional Profile
                            </h2>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm leading-relaxed text-slate-600 font-medium">
                                <p className="mb-4">
                                    Dr. {doctor.firstName} is a highly accomplished {doctor.speciality} with a deep passion for patient-centric care.
                                    With extensive experience in the medical field, they have specialized in modern diagnostic techniques.
                                </p>
                                <p>
                                    Currently leading the {doctor.department?.name} at HealthPoint Medical Center, they emphasize
                                    preventative healthcare and evidence-based medicine.
                                </p>
                            </div>
                        </section>

                        {/* Reviews */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                                        <MessageSquare size={20} />
                                    </div>
                                    Patient Reviews
                                    {allReviews.length > 0 && (
                                        <span className="text-base text-slate-400 font-bold">({allReviews.length})</span>
                                    )}
                                </h2>
                                {auth?.isAuthenticated && (
                                    <button
                                        onClick={() => setReviewModalOpen(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-black hover:-translate-y-0.5 transition-all shadow-xl shadow-slate-200"
                                    >
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        Write a Review
                                    </button>
                                )}
                            </div>

                            {/* Rating Overview */}
                            {allReviews.length > 0 && avgRating && (
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-8">
                                    <div className="text-center">
                                        <p className="text-6xl font-black text-slate-900 leading-none">{avgRating}</p>
                                        <div className="flex items-center gap-0.5 justify-center mt-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {[5, 4, 3, 2, 1].map(star => {
                                            const count = allReviews.filter((r: any) => r.rating === star).length;
                                            const pct = (count / allReviews.length) * 100;
                                            return (
                                                <div key={star} className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-slate-500 w-3">{star}</span>
                                                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {allReviews.length > 0 ? allReviews.map((review: any) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex gap-5 hover:border-rose-100 transition-colors"
                                    >
                                        <div className="shrink-0">
                                            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 font-black text-lg border border-rose-100">
                                                {(review.userName || "U")[0]}
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-black text-slate-900">{review.userName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-0.5 shrink-0">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-amber-500 fill-amber-500" : "text-slate-200 fill-slate-200"}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-slate-600 font-medium leading-relaxed">"{review.comment}"</p>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <p className="text-center text-slate-400 py-10 font-bold">No reviews yet.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right: Slots */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                            <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-rose-500" /> Available Slots
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {doctor.timeSlots?.map((slot: string, i: number) => (
                                    <span key={i} className="px-3 py-2 bg-rose-50 text-rose-700 text-xs font-black rounded-xl border border-rose-100">
                                        {slot}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-rose-600 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl shadow-rose-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
                            <h4 className="text-lg font-black relative z-10 flex items-center gap-2">
                                <Calendar className="w-5 h-5" /> Visit Us
                            </h4>
                            <p className="text-rose-100 text-sm font-medium relative z-10">
                                Need to consult today? Check for last-minute openings at our reception.
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Review Modal */}
            <AnimatePresence>
                {reviewModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setReviewModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="px-8 pt-8 pb-6 border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">Write a Review</h3>
                                        <p className="text-xs text-rose-500 font-bold uppercase tracking-widest mt-1">
                                            Dr. {doctor.firstName} {doctor.lastName}
                                        </p>
                                    </div>
                                    <button onClick={() => setReviewModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                                        <X size={20} className="text-slate-400" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                {/* Star Rating */}
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Your Rating</p>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                onClick={() => setRating(star)}
                                                className="transition-transform hover:scale-125"
                                            >
                                                <Star
                                                    className={`w-9 h-9 transition-colors ${star <= (hoveredRating || rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
                                                />
                                            </button>
                                        ))}
                                        <span className="ml-2 text-sm font-black text-slate-500">
                                            {["", "Poor", "Fair", "Good", "Great", "Excellent"][hoveredRating || rating]}
                                        </span>
                                    </div>
                                </div>

                                {/* Comment */}
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Your Comment</p>
                                    <textarea
                                        rows={4}
                                        placeholder="Share your experience with other patients..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 outline-none resize-none transition-all"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setReviewModalOpen(false)}
                                        className="flex-1 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReviewSubmit}
                                        disabled={submittingReview}
                                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-xl shadow-slate-200 disabled:opacity-60 disabled:translate-y-0"
                                    >
                                        {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Submit</>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
