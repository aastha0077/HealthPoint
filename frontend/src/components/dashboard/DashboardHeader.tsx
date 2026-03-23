import { Plus, Edit3 } from "lucide-react";

interface DashboardHeaderProps {
    user: any;
    onProfileClick: () => void;
    onBookClick: () => void;
}

export function DashboardHeader({ user, onProfileClick, onBookClick }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className="relative group" onClick={onProfileClick}>
                    {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md cursor-pointer" />
                    ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md cursor-pointer">
                            {(user?.firstName || "U")[0]}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer pointer-events-none">
                        <Edit3 className="text-white w-5 h-5" />
                    </div>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-rose-900 leading-tight">
                        Hello, {user?.firstName} 👋
                    </h1>
                    <p className="text-rose-400 mt-1">Manage your appointments at Public Lumbini United Hospital</p>
                </div>
            </div>
            <button
                onClick={onBookClick}
                className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-rose-200 transition-all flex-shrink-0"
            >
                <Plus size={18} /> Book Appointment
            </button>
        </div>
    );
}
