import { useState, useEffect, useRef, useCallback } from "react";

// Converts "10:00 AM" / "2:30 PM" → "10:00" / "14:30". Passes HH:MM unchanged.
function to24Hour(time: string): string {
  const t = (time || "").trim();
  const match = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return t; // already 24-hour or empty
  let hour = parseInt(match[1], 10);
  const min = match[2];
  const period = match[3].toUpperCase();
  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, "0")}:${min}`;
}
import { ChevronRight, ChevronLeft, RefreshCw } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router";
import { apiClient } from "@/apis/apis";
import toast from "react-hot-toast";
import { useFavorites } from "@/contexts/FavoriteContext";
import { useAuth } from "@/contexts/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

// Extracted Components
import { DoctorStep } from "@/components/booking/steps/DoctorStep";
import { PatientStep } from "@/components/booking/steps/PatientStep";
import { ScheduleStep } from "@/components/booking/steps/ScheduleStep";
import { PaymentStep } from "@/components/booking/steps/PaymentStep";
import { ConfirmStep } from "@/components/booking/steps/ConfirmStep";
import { BookingStepper } from "@/components/booking/BookingStepper";

export function BookAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();

  // Core State
  const [step, setStep] = useState(1);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("Khalti");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);

  const { toggleFavorite, isFavorite } = useFavorites();
  const PAGE_SIZE = 6;

  // New Patient Form State
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    district: "",
    municipality: "",
    wardNo: "",
    gender: "Male"
  });

  const preselectedDoctorId = searchParams.get("doctorId");
  const today = new Date().toISOString().split("T")[0];

  // --- Core Logic ---

  useEffect(() => {
    if (auth?.isAuthenticated) {
      fetchPatients();
    } else {
      setLoadingPatients(false);
    }
  }, [auth?.isAuthenticated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors(1, true);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (preselectedDoctorId) {
      if (doctors.length > 0) {
        const found = doctors.find((d: any) => String(d.doctorId || d.id) === preselectedDoctorId);
        if (found) {
          setSelectedDoctor(found);
          setStep(2);
          return;
        }
      }

      const fetchSpecificDoctor = async () => {
        try {
          const res = await apiClient.get(`/api/doctors/${preselectedDoctorId}`);
          if (res.data && !selectedDoctor) {
            setSelectedDoctor(res.data);
            setStep(2);
          }
        } catch (err) {
          console.error("Failed to fetch preselected doctor:", err);
        }
      };

      if (!selectedDoctor) {
        fetchSpecificDoctor();
      }
    }
  }, [preselectedDoctorId, doctors, selectedDoctor]);

  useEffect(() => {
    if (selectedDoctor) {
      const doctorId = selectedDoctor.id || selectedDoctor.doctorId;
      apiClient.get(`/api/doctors/unavailable-dates/${doctorId}`)
        .then(res => setUnavailableDates((res.data || []).map((d: any) => d.date)))
        .catch(err => console.error("Failed to fetch unavailable dates:", err));
    }
  }, [selectedDoctor]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchBookedSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchBookedSlots = async () => {
    const doctorId = selectedDoctor?.doctorId || selectedDoctor?.id;
    if (!doctorId || !selectedDate) return;

    try {
      const res = await apiClient.get(`/api/appointments/booked-slots/${doctorId}?date=${selectedDate}`);
      setBookedSlots(res.data || []);

      // Check if previously selected time is now booked
      const isStillAvailable = !(res.data || []).some((bookedIso: string) => {
        const d = new Date(bookedIso);
        const hr = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${hr}:${min}` === selectedTime;
      });
      if (!isStillAvailable) {
        setSelectedTime("");
      }
    } catch (err) {
      console.error("Failed to fetch booked slots:", err);
    }
  };

  const fetchDoctors = async (pageToFetch: number, isNewSearch = false) => {
    if (pageToFetch > 1) setIsFetchingMore(true);
    else setLoadingDoctors(true);

    try {
      if (pageToFetch > 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      const res = await apiClient.get(`/api/doctors/${pageToFetch}/${PAGE_SIZE}`, {
        params: { search: searchQuery }
      });

      const newDoctors = res.data.doctors || [];
      const total = res.data.totalDoctors || 0;

      if (isNewSearch) {
        setDoctors(newDoctors);
      } else {
        setDoctors(prev => {
          const existingIds = new Set(prev.map(d => d.id || d.doctorId));
          const uniqueNew = newDoctors.filter((d: any) => !existingIds.has(d.id || d.doctorId));
          return [...prev, ...uniqueNew];
        });
      }

      setHasMore((isNewSearch ? 0 : doctors.length) + newDoctors.length < total);
      setPage(pageToFetch);
    } catch {
      toast.error("Failed to load doctors");
    } finally {
      setLoadingDoctors(false);
      setIsFetchingMore(false);
    }
  };

  const observer = useRef<IntersectionObserver | null>(null);
  const lastDoctorRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingDoctors || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchDoctors(page + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loadingDoctors, isFetchingMore, hasMore, page]);

  const fetchPatients = async () => {
    if (!auth?.isAuthenticated) {
      setLoadingPatients(false);
      return;
    }
    setLoadingPatients(true);
    try {
      const res = await apiClient.get("/api/patients/my-patients");
      setPatients(res.data || []);
    } catch (err: any) {
      console.error("[BookAppointment] Failed to fetch patients:", err.response?.data || err.message);
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleNext = async () => {
    if (step === 1 && !selectedDoctor) return void toast.error("Please select a doctor");

    if (step === 2) {
      if (isAddingPatient) {
        if (!newPatient.firstName || !newPatient.lastName || !newPatient.district || !newPatient.municipality || !newPatient.wardNo) {
          return void toast.error("Please fill all patient details");
        }

        const ward = parseInt(newPatient.wardNo);
        if (isNaN(ward)) {
          return void toast.error("Please enter a valid Ward Number");
        }

        setIsLoading(true);
        try {
          const res = await apiClient.post("/api/patients", {
            firstName: newPatient.firstName,
            lastName: newPatient.lastName,
            district: newPatient.district,
            municipality: newPatient.municipality,
            wardNo: ward,
            gender: newPatient.gender
          });

          toast.success("New patient added!");
          const createdPatient = res.data;

          if (!createdPatient || !createdPatient.id) {
            throw new Error("Invalid response from server - patient ID missing");
          }

          setPatients(prev => [...prev, createdPatient]);
          setSelectedPatient(createdPatient);
          setIsAddingPatient(false);
          setStep(3);
          return;
        } catch (err: any) {
          console.error("[BookAppointment] Add patient error:", err.response?.data || err.message);
          toast.error(err.response?.data?.message || err.message || "Failed to add patient");
          return;
        } finally {
          setIsLoading(false);
        }
      } else {
        if (!selectedPatient) return void toast.error("Please select a patient");
      }
    }

    if (step === 3 && !selectedDate) return void toast.error("Please select a date");
    if (step === 3 && !selectedTime) return void toast.error("Please select a time slot");

    setStep(s => s + 1);
  };

  const handleBack = () => {
    if (isAddingPatient) {
      setIsAddingPatient(false);
    } else {
      setStep(s => s - 1);
    }
  };

  const confirmBooking = async () => {
    setIsLoading(true);
    const targetDoctorId = selectedDoctor?.doctorId || selectedDoctor?.id;
    const targetPatientId = selectedPatient?.id;

    // Sanitize inputs — trim whitespace + normalize AM/PM → 24-hour format
    const cleanDate = (selectedDate || "").trim();
    const cleanTime = to24Hour(selectedTime); // e.g. "10:00 AM" → "10:00"

    if (!targetDoctorId || !targetPatientId || !cleanDate || !cleanTime) {
      toast.error("Missing selection data. Please restart booking.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("[ConfirmBooking] Normalized values:", { cleanDate, cleanTime });

      // Use explicit numeric construction (local time) to avoid cross-browser ISO parsing issues.
      const dateParts = cleanDate.split("-").map(Number);
      const timeParts = cleanTime.split(":").map(Number);

      if (dateParts.length < 3 || timeParts.length < 2 || dateParts.some(isNaN) || timeParts.some(isNaN)) {
        throw new Error(`Invalid date/time format — date: "${cleanDate}", time: "${cleanTime}" (original: "${selectedTime}")`);
      }

      const [year, month, day] = dateParts;
      const [hour, minute] = timeParts;
      const dateObj = new Date(year, month - 1, day, hour, minute, 0, 0);

      if (isNaN(dateObj.getTime())) {
        throw new Error(`Could not construct a valid date from date: "${cleanDate}", time: "${cleanTime}"`);
      }

      console.log("[ConfirmBooking] Constructed date:", dateObj.toISOString());

      const response = await apiClient.post(
        `/api/appointments/${targetPatientId}/${targetDoctorId}`,
        {
          dateTime: dateObj.toISOString(),
          paymentMethod: selectedPaymentMethod,
          transactionId: `${selectedPaymentMethod.toLowerCase()}_${Date.now()}`
        }
      );

      if (response.data?.payment_url) {
        window.location.href = response.data.payment_url;
        return;
      }

      toast.success(
        <div>
          <p className="font-black text-rose-600">Appointment Confirmed!</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Your session with <span className="text-slate-900 font-bold">Dr. {selectedDoctor?.firstName || selectedDoctor?.user?.firstName}</span> is set for <span className="text-slate-900 font-bold">{cleanTime}</span> on <span className="text-slate-900 font-bold">{dateObj.toLocaleDateString()}</span>.
          </p>
        </div>,
        { duration: 6000 }
      );

      setTimeout(() => navigate(auth?.isAuthenticated ? "/dashboard" : "/"), 2000);
    } catch (err: any) {
      console.error("[ConfirmBooking] Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || err.response?.data?.message || err.message || "Error booking appointment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-rose-800">Book an Appointment</h1>
          <p className="text-rose-400 mt-1">HealthPoint Medical Center</p>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-rose-100">
          <BookingStepper currentStep={step} />
        </div>

        {/* Main Step Container */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-rose-200/50 border border-white overflow-hidden">
          <div className="p-8 md:p-12 min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="flex-1"
              >
                {step === 1 && (
                  <DoctorStep
                    doctors={doctors}
                    loadingDoctors={loadingDoctors}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedDoctor={selectedDoctor}
                    onSelectDoctor={setSelectedDoctor}
                    isFavorite={isFavorite}
                    toggleFavorite={toggleFavorite}
                    lastDoctorRef={lastDoctorRef}
                    isFetchingMore={isFetchingMore}
                  />
                )}

                {step === 2 && (
                  <PatientStep
                    loadingPatients={loadingPatients}
                    isAddingPatient={isAddingPatient}
                    setIsAddingPatient={setIsAddingPatient}
                    patients={patients}
                    selectedPatient={selectedPatient}
                    onSelectPatient={setSelectedPatient}
                    fetchPatients={fetchPatients}
                    newPatient={newPatient}
                    onNewPatientChange={setNewPatient}
                  />
                )}

                {step === 3 && (
                  <ScheduleStep
                    selectedDoctor={selectedDoctor}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                    bookedSlots={bookedSlots}
                    unavailableDates={unavailableDates}
                    today={today}
                  />
                )}

                {step === 4 && (
                  <PaymentStep
                    selectedDoctor={selectedDoctor}
                    selectedPaymentMethod={selectedPaymentMethod}
                    setSelectedPaymentMethod={setSelectedPaymentMethod}
                  />
                )}

                {step === 5 && (
                  <ConfirmStep
                    selectedDoctor={selectedDoctor}
                    selectedPatient={selectedPatient}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    selectedPaymentMethod={selectedPaymentMethod}
                    isLoading={isLoading}
                    onConfirm={confirmBooking}
                  />
                )}
              </motion.div>
            </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-8 border-t border-rose-50/50">
            <button
              onClick={handleBack}
              className={`flex items-center gap-2 px-8 py-4 rounded-[1.5rem] border-2 border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-black transition-all ${step === 1 && !isAddingPatient ? "invisible" : ""}`}
            >
              <ChevronLeft size={20} /> Back
            </button>
            {step < 5 && (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center gap-3 px-12 py-4 bg-rose-600 text-white rounded-[1.5rem] font-black transition-all shadow-xl shadow-rose-200 hover:bg-rose-700 hover:-translate-y-1 active:scale-95"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={20} /> : step === 2 && isAddingPatient ? "Securely Save & Continue" : step === 4 ? "Proceed to Checkout" : "Continue"}
                <ChevronRight size={20} />
              </button>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
