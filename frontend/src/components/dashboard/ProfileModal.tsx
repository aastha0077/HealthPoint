import { useState, useRef } from "react";
import { XCircle, Camera } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileModalProps {
    initialFirstName: string;
    initialLastName: string;
    initialProfilePicture: string;
    onClose: () => void;
    onSave: (data: { firstName: string; lastName: string; file: File | null }) => Promise<void>;
}

export function ProfileModal({ initialFirstName, initialLastName, initialProfilePicture, onClose, onSave }: ProfileModalProps) {
    const [firstName, setFirstName] = useState(initialFirstName);
    const [lastName, setLastName] = useState(initialLastName);
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        setIsUpdating(true);
        try {
            await onSave({ firstName, lastName, file: profileFile });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden">
                <div className="p-10">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-black text-slate-900">Update Profile</h3>
                        <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-colors"><XCircle size={32} /></button>
                    </div>
                    <div className="space-y-6">
                        <div className="flex flex-col items-center gap-4 mb-6">
                            <div className="relative w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner group">
                                {(initialProfilePicture || profileFile) ? (
                                    <img src={profileFile ? URL.createObjectURL(profileFile) : initialProfilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera size={24} className="text-slate-300" />
                                )}
                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setProfileFile(e.target.files[0]);
                                        }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Photo</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">First Name</label>
                                <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none" value={firstName} onChange={e => setFirstName(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Name</label>
                                <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none" value={lastName} onChange={e => setLastName(e.target.value)} />
                            </div>
                        </div>
                        <button onClick={handleSave} disabled={isUpdating} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 transition-all shadow-xl shadow-slate-200 mt-4 disabled:opacity-70">
                            {isUpdating ? "Updating..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
