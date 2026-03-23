import { CheckCircle2, Stethoscope, User, Calendar as CalendarIcon, CreditCard, ClipboardCheck } from "lucide-react";

interface Step { num: number; title: string; }

const STEPS: Step[] = [
    { num: 1, title: "Doctor" },
    { num: 2, title: "Patient" },
    { num: 3, title: "Schedule" },
    { num: 4, title: "Payment" },
    { num: 5, title: "Confirm" },
];

const ICONS = [Stethoscope, User, CalendarIcon, CreditCard, ClipboardCheck];

interface BookingStepperProps { currentStep: number; }

export function BookingStepper({ currentStep }: BookingStepperProps) {
    return (
        <div className="relative flex items-center justify-between">
            {/* Progress line */}
            <div className="absolute left-0 top-5 w-full h-0.5 bg-slate-100" />
            <div
                className="absolute left-0 top-5 h-0.5 bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-700 ease-in-out"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />

            {STEPS.map(({ num, title }) => {
                const Icon = ICONS[num - 1];
                const isDone = currentStep > num;
                const isActive = currentStep === num;
                return (
                    <div key={num} className="flex flex-col items-center gap-2 z-10">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm
                                ${isDone ? "bg-rose-500 border-rose-500 text-white shadow-rose-200"
                                    : isActive ? "bg-white border-rose-500 text-rose-600 shadow-rose-100 scale-110"
                                        : "bg-white border-slate-200 text-slate-300"}`}
                        >
                            {isDone ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors
                            ${isDone || isActive ? "text-rose-600" : "text-slate-300"}`}>
                            {title}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
