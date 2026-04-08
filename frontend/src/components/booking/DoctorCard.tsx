import React from "react";
import { Star, BadgeCheck } from "lucide-react";

const FALLBACK = `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face`;

interface DoctorCardProps {
    doctor: any;
    isSelected: boolean;
    isFavorite: boolean;
    onSelect: (doctor: any) => void;
    onToggleFavorite: (id: number) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, isSelected, isFavorite, onSelect, onToggleFavorite }) => {
    const img = doctor.user?.profilePicture || doctor.profilePicture || FALLBACK;
    const name = `Dr. ${doctor.firstName || doctor.user?.firstName || ""} ${doctor.lastName || doctor.user?.lastName || ""}`;

    return (
        <div
            onClick={() => onSelect(doctor)}
            className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 group overflow-hidden
                ${isSelected
                    ? "border-rose-600 bg-white shadow-lg shadow-rose-900/10 ring-2 ring-rose-50/50"
                    : "border-slate-50 bg-slate-50/30 hover:bg-white hover:border-slate-100 hover:shadow-md hover:shadow-slate-200/50"}`}
        >
            {/* Favourite button */}
            <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(doctor.id); }}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:bg-rose-50 transition-all"
            >
                <Star className={`w-4 h-4 transition-all ${isFavorite ? "fill-rose-500 stroke-rose-500 scale-110" : "fill-none stroke-slate-300 group-hover:stroke-rose-300"}`} />
            </button>

            <div className="flex gap-4 items-center">
                <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                    <div className="w-14 h-14 rounded-xl bg-white p-0.5 shadow border border-slate-50 overflow-hidden">
                         <img
                            src={img}
                            className="w-full h-full rounded-lg object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
                            alt={name}
                        />
                    </div>
                    {isSelected && (
                        <div className="absolute -bottom-1.5 -right-1.5 bg-rose-600 rounded-full border-2 border-white p-0.5 text-white shadow">
                            <BadgeCheck size={12} />
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{doctor.speciality}</p>
                    </div>
                    <h3 className="font-black text-slate-900 text-base leading-[1.1] tracking-tight">{name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-black text-slate-300 uppercase bg-white border border-slate-100 px-3 py-1 rounded-full group-hover:bg-slate-50 transition-colors">
                            {doctor.department?.name || doctor.department || "Specialist"}
                        </span>
                        <div className="flex items-center gap-1">
                            <Star size={10} className="fill-emerald-500 stroke-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase">Top Specialist</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {isSelected && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 -mr-12 -mt-12 rounded-full blur-2xl" />
            )}
        </div>
    );
};
