import React from "react";
import { CheckCircle2 } from "lucide-react";

// Converts "10:00 AM" / "2:30 PM" → "10:00" / "14:30". Passes HH:MM unchanged.
function to24Hour(time: string): string {
  const t = (time || "").trim();
  const match = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return t;
  let hour = parseInt(match[1], 10);
  const min = match[2];
  const period = match[3].toUpperCase();
  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, "0")}:${min}`;
}

interface ScheduleStepProps {
    selectedDoctor: any;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    selectedTime: string;
    setSelectedTime: (time: string) => void;
    bookedSlots: string[];
    unavailableDates: string[]; // New prop
    today: string;
}

export const ScheduleStep: React.FC<ScheduleStepProps> = ({
    selectedDoctor,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    bookedSlots,
    unavailableDates, // Use new prop
    today
}) => {
    const isDateUnavailable = selectedDate && unavailableDates.some(ud => ud.split('T')[0] === selectedDate);
    // Use fallbacks if doctor has no timeSlots defined, but prioritize doctor's slots
    const defaultTimeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
    ];

    const rawSlots: string[] = selectedDoctor?.timeSlots?.length > 0
        ? selectedDoctor.timeSlots
        : defaultTimeSlots;

    // Normalize all slots to 24-hour format (handles both "10:00 AM" and "10:00")
    const timeSlots = [...new Set(rawSlots.map(to24Hour))].sort();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <h2 className="text-2xl font-black text-slate-900">Choose Date & Time</h2>
                <p className="text-slate-400 font-medium mt-1">Select your preferred appointment slot</p>
            </div>

            {selectedDoctor && (
                <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <img
                        src={selectedDoctor.user?.profilePicture || selectedDoctor.profilePicture || `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face`}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face`; }}
                        alt="Doctor"
                    />
                    <div>
                        <p className="font-black text-slate-900 text-sm">
                            Dr. {selectedDoctor.firstName || selectedDoctor.user?.firstName} {selectedDoctor.lastName || selectedDoctor.user?.lastName}
                        </p>
                        <p className="text-xs text-rose-500 font-bold">{selectedDoctor.speciality}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                        Appointment Date
                    </label>
                    <input
                        type="date"
                        min={today}
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedTime("");
                        }}
                        className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-400 transition-all text-base font-bold bg-white shadow-sm"
                    />
                    {selectedDate && (
                        <p className="text-xs text-slate-400 font-bold pl-1">
                            📅 {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                        </p>
                    )}
                </div>

                {selectedDate && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                                Available Slots
                            </label>
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider">
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Selected</span>
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" /> Booked/Past</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                            {isDateUnavailable ? (
                                <div className="col-span-3 py-10 text-center">
                                    <p className="text-rose-500 font-black uppercase tracking-widest text-xs">Doctor Unavailable</p>
                                    <p className="text-slate-400 text-[10px] mt-1 font-bold">Please select another date</p>
                                </div>
                            ) : (
                                (() => {
                                    const isToday = selectedDate === today;
                                    const now = new Date();
                                    const nowMinutes = isToday ? (now.getHours() * 60 + now.getMinutes()) : -1;

                                    return timeSlots.map((slot: string) => {
                                        const [h, m] = slot.split(":").map(Number);
                                        const slotMinutes = h * 60 + m;
                                        const isPast = isToday && slotMinutes <= nowMinutes;
                                        const isBooked = !isPast && bookedSlots.some(bookedIso => {
                                            const d = new Date(bookedIso);
                                            const hr = String(d.getHours()).padStart(2, "0");
                                            const min = String(d.getMinutes()).padStart(2, "0");
                                            return `${hr}:${min}` === slot;
                                        });
                                        const isDisabled = isPast || isBooked;
                                        return (
                                            <button
                                                key={slot}
                                                disabled={isDisabled}
                                                onClick={() => setSelectedTime(slot)}
                                                className={`py-3 px-2 rounded-xl border-2 font-black text-sm transition-all duration-200
                            ${selectedTime === slot
                                                        ? "border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-200 scale-105"
                                                        : isBooked
                                                            ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                                                            : isPast
                                                                ? "bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed line-through"
                                                                : "border-slate-100 text-slate-600 hover:border-rose-300 hover:bg-rose-50 bg-white shadow-sm"
                                                    }`}
                                            >
                                                {slot}
                                                {isBooked && <div className="text-[9px] font-bold mt-0.5 text-slate-300">Booked</div>}
                                                {isPast && <div className="text-[9px] font-bold mt-0.5 text-slate-200">Past</div>}
                                            </button>
                                        );
                                    });
                                })()
                            )}
                        </div>
                    </div>
                )}
            </div>

            {selectedDate && selectedTime && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-sm font-black text-emerald-700">
                        Session locked for <span className="text-emerald-900">{selectedTime}</span> on {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                </div>
            )}
        </div>
    );
};
