import { useState, useEffect } from "react";
import { XCircle, Calendar, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/apis/apis";

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

interface RescheduleModalProps {
    appointment: any;
    onClose: () => void;
    onSubmit: (appointmentId: number, newDateTime: string) => Promise<void>;
}

export function RescheduleModal({ appointment, onClose, onSubmit }: RescheduleModalProps) {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const doctorId = appointment?.doctor?.id || appointment?.doctorId;
    const doctorTimeSlots: string[] = appointment?.doctor?.timeSlots || [];
    const today = new Date().toISOString().split("T")[0];

    // Fetch unavailable dates
    useEffect(() => {
        if (!doctorId) return;
        apiClient.get(`/api/doctors/unavailable-dates/${doctorId}`)
            .then(res => setUnavailableDates((res.data || []).map((d: any) => d.date)))
            .catch(() => {});
    }, [doctorId]);

    // Fetch booked slots when date changes
    useEffect(() => {
        if (!doctorId || !selectedDate) return;
        setIsLoadingSlots(true);
        apiClient.get(`/api/appointments/booked-slots/${doctorId}?date=${selectedDate}`)
            .then(res => {
                setBookedSlots(res.data || []);
                setSelectedTime(""); // reset time on date change
            })
            .catch(() => {})
            .finally(() => setIsLoadingSlots(false));
    }, [doctorId, selectedDate]);

    const isSlotBookedOrPast = (slot: string): boolean => {
        const slotNorm = to24Hour(slot);
        
        // Check if slot is in the past for today
        if (selectedDate === today) {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMin = now.getMinutes();
            const [slotHour, slotMin] = slotNorm.split(":").map(Number);
            
            // Allow 1 hour buffer so they can't book exactly as the hour changes or slightly after
            if (slotHour < currentHour || (slotHour === currentHour && slotMin <= currentMin)) {
                return true;
            }
        }

        // Check against strictly booked slots returned from API
        return bookedSlots.some(bookedIso => {
            const d = new Date(bookedIso);
            const hr = String(d.getHours()).padStart(2, "0");
            const min = String(d.getMinutes()).padStart(2, "0");
            return `${hr}:${min}` === slotNorm;
        });
    };

    const isDateUnavailable = (date: string): boolean => {
        return unavailableDates.includes(date);
    };

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime) return;
        setIsSubmitting(true);
        try {
            const cleanTime = to24Hour(selectedTime);
            const dateParts = selectedDate.split("-").map(Number);
            const timeParts = cleanTime.split(":").map(Number);
            const [year, month, day] = dateParts;
            const [hour, minute] = timeParts;
            const dateObj = new Date(year, month - 1, day, hour, minute, 0, 0);
            await onSubmit(appointment.id, dateObj.toISOString());
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-10">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reschedule</h3>
                        <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-colors"><XCircle size={28} /></button>
                    </div>
                    <p className="text-slate-400 font-bold text-sm mb-8">
                        Pick a new time with Dr. {appointment?.doctor?.user?.firstName || appointment?.doctor?.firstName} {appointment?.doctor?.user?.lastName || ""}
                    </p>

                    <div className="space-y-6">
                        {/* Date Picker */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Calendar size={14} /> Select Date
                            </label>
                            <input
                                type="date"
                                min={today}
                                value={selectedDate}
                                onChange={e => {
                                    if (isDateUnavailable(e.target.value)) return;
                                    setSelectedDate(e.target.value);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-slate-700 outline-none focus:ring-2 focus:ring-rose-500"
                            />
                            {selectedDate && isDateUnavailable(selectedDate) && (
                                <p className="text-red-500 text-xs font-bold mt-2">This date is unavailable for the doctor.</p>
                            )}
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Clock size={14} /> Available Slots
                                </label>
                                {isLoadingSlots ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 size={24} className="animate-spin text-slate-300" />
                                    </div>
                                ) : doctorTimeSlots.length === 0 ? (
                                    <p className="text-slate-400 font-bold text-sm text-center py-6">No time slots configured for this doctor.</p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3">
                                        {doctorTimeSlots.map((slot: string) => {
                                            const booked = isSlotBookedOrPast(slot);
                                            const isSelected = selectedTime === slot;
                                            return (
                                                <button
                                                    key={slot}
                                                    disabled={booked}
                                                    onClick={() => setSelectedTime(slot)}
                                                    className={`py-3 px-2 rounded-xl text-sm font-black transition-all border ${
                                                        booked
                                                            ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through"
                                                            : isSelected
                                                            ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200 scale-105"
                                                            : "bg-white text-slate-700 border-slate-100 hover:border-rose-200 hover:bg-rose-50"
                                                    }`}
                                                >
                                                    {slot}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button onClick={onClose} className="flex-1 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">Cancel</button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !selectedDate || !selectedTime}
                                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Rescheduling..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
