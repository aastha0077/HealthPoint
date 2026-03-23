import { useState } from "react";
import { XCircle, Camera, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthProvider";
import { apiClient } from "@/apis/apis";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
    const auth = useAuth();
    const [profileForm, setProfileForm] = useState({
        firstName: auth?.user?.firstName || "",
        lastName: auth?.user?.lastName || "",
        profilePicture: auth?.user?.profilePicture || "",
    });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await apiClient.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setProfileForm({ ...profileForm, profilePicture: res.data.fileUrl });
            toast.success("Image uploaded!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleProfileUpdate = async () => {
        setIsUpdatingProfile(true);
        try {
            const res = await apiClient.put("/api/user/profile", profileForm);

            if (auth && auth.setAuthData && auth.token && auth.refreshToken) {
                auth.setAuthData(auth.token, auth.refreshToken, res.data);
            }
            toast.success("Profile updated successfully!");
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to update profile");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative"
                    >
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-rose-50/30">
                            <div>
                                <h3 className="font-bold text-xl text-slate-900 tracking-tight">Edit Profile</h3>
                                <p className="text-xs text-rose-500 font-bold uppercase tracking-widest mt-1">Personal Info</p>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-rose-600 p-2 rounded-xl transition-all">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">First Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.firstName}
                                            onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 outline-none transition-all font-bold text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.lastName}
                                            onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 outline-none transition-all font-bold text-slate-700"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">Profile Photo</label>
                                    <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="relative group shrink-0">
                                            {profileForm.profilePicture ? (
                                                <img src={profileForm.profilePicture} alt="Current" className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-sm" />
                                            ) : (
                                                <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 font-bold text-xl">
                                                    {profileForm.firstName?.[0] || "U"}
                                                </div>
                                            )}
                                            {isUploadingImage && (
                                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                                                    <RefreshCw className="w-6 h-6 text-rose-500 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${isUploadingImage ? 'bg-slate-200 text-slate-400' : 'bg-white text-rose-600 border border-rose-100 hover:bg-rose-50 hover:border-rose-200 shadow-sm shadow-rose-100'}`}>
                                                <Camera size={14} />
                                                {isUploadingImage ? 'Uploading...' : 'Choose File'}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageUpload} disabled={isUploadingImage} />
                                            </label>
                                            <p className="text-[10px] text-slate-400 font-medium mt-2">JPG, PNG or WEBP. Max 2MB.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleProfileUpdate}
                                    disabled={isUpdatingProfile}
                                    className="flex-1 py-4 bg-slate-900 border-b-4 border-slate-950 text-white rounded-2xl font-black tracking-wide shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    {isUpdatingProfile ? <RefreshCw className="animate-spin" size={20} /> : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
