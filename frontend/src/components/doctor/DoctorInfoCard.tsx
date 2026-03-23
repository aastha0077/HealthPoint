import { Link, useNavigate } from "react-router";
import {
  Star,
  MapPin,
  ShieldCheck,
  User,
  Clock,
  Award,
  Calendar,
} from "lucide-react";

// Define the Doctor interface
export interface Doctor {
  id: number;
  doctorId?: number;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  createdAt?: string;
  speciality?: string;
  bio?: string;
  address?: string;
  available?: boolean;
  profilePicture?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  department?: {
    id: number;
    name: string;
    description: string;
  };
  timeSlots?: any[];
}

interface DoctorInfoCardProps {
  doctor: Doctor;
  view?: "grid" | "list";
}

function DoctorInfoCard({ doctor, view = "grid" }: DoctorInfoCardProps) {
  const fallbackImage = `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face`;
  const doctorImageUrl = doctor.user?.profilePicture || doctor.profilePicture || fallbackImage;
  const navigate = useNavigate();
  const docId = doctor.doctorId || doctor.id;

  if (view === "list") {
    return (
      <div className="group bg-white rounded-[2rem] border border-rose-100 shadow-sm hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 overflow-hidden flex flex-col md:flex-row items-center gap-6 p-4">
        {/* Left: Image */}
        <div onClick={() => navigate(`/doctor/${docId}`)} className="cursor-pointer relative flex-shrink-0">
          <div className="absolute inset-0 bg-rose-200 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500 -z-10" />
          <img
            className="w-24 h-24 object-cover rounded-2xl border-4 border-white shadow-lg group-hover:scale-105 transition-all duration-500"
            src={doctor.user?.profilePicture || doctor.profilePicture || doctorImageUrl}
            alt={`Dr. ${doctor.user?.firstName || doctor.firstName} ${doctor.user?.lastName || doctor.lastName}`}
          />
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg border-2 border-white shadow-sm">
            <ShieldCheck className="w-3 h-3" />
          </div>
        </div>

        {/* Middle: Core Info */}
        <div onClick={() => navigate(`/doctor/${docId}`)} className="cursor-pointer flex-1 space-y-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center bg-rose-50 px-1.5 py-0.5 rounded-lg">
                <Star className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                <span className="text-[9px] font-black text-rose-600 ml-1">4.9</span>
              </div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1.5 py-0.5 border border-slate-100 rounded-lg">Verified</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              Dr. {doctor.user?.firstName || doctor.firstName} {doctor.user?.lastName || doctor.lastName}
            </h3>
            <p className="text-xs font-bold text-rose-600">{doctor.speciality || doctor.department?.name}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
              <Award className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500">8+ Yrs Exp</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
              <MapPin className="w-3 h-3 text-rose-400" />
              <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">{doctor.address || "Main Branch"}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="w-full md:w-auto flex flex-col gap-2 min-w-[150px]">
          <Link to={`/book-appointment?doctorId=${docId}`} className="w-full">
            <button className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-[11px] font-black shadow-lg shadow-rose-100 transition-all hover:-translate-y-0.5">
              <Calendar className="w-3 h-3" /> Book Appt.
            </button>
          </Link>
          <Link to={`/doctor/${docId}`} className="w-full">
            <button className="w-full flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-100 hover:bg-slate-50 py-2 rounded-xl text-[10px] font-black transition-all">
              Profile
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-[2rem] border border-rose-100 shadow-sm hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 overflow-hidden flex flex-col h-full">
      {/* Clickable Profile Area */}
      <div
        onClick={() => navigate(`/doctor/${docId}`)}
        className="cursor-pointer flex flex-col flex-1"
      >
        {/* Upper Card: Visuals */}
        <div className="relative p-5 pb-0 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-rose-200 rounded-[1.5rem] rotate-6 group-hover:rotate-12 transition-transform duration-500 -z-10" />
            <img
              className="w-20 h-20 object-cover rounded-[1.5rem] border-4 border-white shadow-lg group-hover:scale-105 transition-all duration-500"
              src={doctor.user?.profilePicture || doctor.profilePicture || doctorImageUrl}
              alt={`Dr. ${doctor.user?.firstName || doctor.firstName} ${doctor.user?.lastName || doctor.lastName}`}
              loading="lazy"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg border-2 border-white shadow-sm">
              <ShieldCheck className="w-3 h-3" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center bg-rose-50 px-1.5 py-0.5 rounded-lg">
                <Star className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                <span className="text-[9px] font-black text-rose-600 ml-1">4.9</span>
              </div>
            </div>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              Dr. {doctor.user?.firstName || doctor.firstName} {doctor.user?.lastName || doctor.lastName}
            </h3>
            <p className="text-[11px] font-bold text-rose-600">{doctor.speciality || doctor.department?.name}</p>
          </div>
        </div>

        {/* Middle: Info */}
        <div className="p-5 pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-lg border border-slate-100">
              <Award className="w-3 h-3 text-slate-400" />
              <span className="text-[9px] font-bold text-slate-500">8+ Yrs Exp</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-lg border border-slate-100">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-[9px] font-bold text-slate-500">Mon-Fri</span>
            </div>
          </div>

          <p className="text-slate-500 text-[11px] leading-relaxed font-medium line-clamp-2">
            {doctor.bio || "Dedicated medical professional committed to providing the best healthcare services."}
          </p>
        </div>
      </div>

      {/* Footer: Actions */}
      <div className="p-5 pt-0 mt-auto">
        <div className="flex gap-2">
          <Link
            to={`/book-appointment?doctorId=${docId}`}
            className="flex-[3]"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-[11px] font-black shadow-lg shadow-rose-100 transition-all hover:-translate-y-0.5">
              <Calendar className="w-3.5 h-3.5" /> Book Appt.
            </button>
          </Link>
          <Link
            to={`/doctor/${docId}`}
            className="flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="w-full h-full flex items-center justify-center bg-white text-rose-600 border border-rose-100 hover:bg-rose-50 rounded-xl transition-all shadow-sm">
              <User className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export { DoctorInfoCard };
