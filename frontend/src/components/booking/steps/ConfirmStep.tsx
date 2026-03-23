import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ConfirmStepProps {
    selectedDoctor: any;
    selectedPatient: any;
    selectedDate: string;
    selectedTime: string;
    selectedPaymentMethod: string;
    isLoading: boolean;
    onConfirm: () => void;
}

export const ConfirmStep: React.FC<ConfirmStepProps> = ({
    selectedDoctor,
    selectedPatient,
    selectedDate,
    selectedTime,
    selectedPaymentMethod,
    isLoading,
    onConfirm
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-rose-800">Review & Confirm</h2>
            <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-3xl border border-rose-100 p-8 space-y-6">
                <div className="flex items-center gap-5 pb-6 border-b border-rose-100">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {(selectedDoctor?.firstName || selectedDoctor?.user?.firstName || "D").charAt(0)}
                    </div>
                    <div>
                        <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-1.5">Doctor In-Charge</p>
                        <h3 className="font-black text-slate-900 text-xl tracking-tight">
                            Dr. {selectedDoctor?.firstName || selectedDoctor?.user?.firstName} {selectedDoctor?.lastName || selectedDoctor?.user?.lastName}
                        </h3>
                        <p className="text-sm text-rose-600 font-bold">{selectedDoctor?.speciality}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                    <div>
                        <label className="text-[10px] text-rose-400 font-black uppercase tracking-widest block mb-1.5">Patient</label>
                        <p className="font-bold text-slate-800 text-lg">{selectedPatient?.firstName} {selectedPatient?.lastName}</p>
                        <p className="text-xs text-slate-400 font-medium">{selectedPatient?.gender} • {selectedPatient?.district}</p>
                    </div>
                    <div>
                        <label className="text-[10px] text-rose-400 font-black uppercase tracking-widest block mb-1.5">Schedule</label>
                        <p className="font-bold text-slate-800 text-lg">{selectedTime}</p>
                        <p className="text-xs text-slate-400 font-medium">
                            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })}
                        </p>
                    </div>
                    <div>
                        <label className="text-[10px] text-rose-400 font-black uppercase tracking-widest block mb-1.5">Payment Method</label>
                        <p className="font-bold text-slate-800 text-lg">{selectedPaymentMethod}</p>
                        <p className="text-xs text-emerald-600 font-black uppercase tracking-[0.1em]">Ready to Pay</p>
                    </div>
                    <div>
                        <label className="text-[10px] text-rose-400 font-black uppercase tracking-widest block mb-1.5">Total Amount</label>
                        <p className="font-bold text-slate-800 text-lg">Rs. 520</p>
                        <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Incl. service charges</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border-2 border-amber-100 rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-500">
                    <AlertCircle size={24} />
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {selectedPaymentMethod === "Khalti"
                        ? "Upon clicking confirm, you will be redirected to Khalti's secure payment page. Once the payment is completed, you'll be brought back here and your booking will be confirmed."
                        : "Upon clicking confirm, your booking will be processed and confirmed immediately in this system."}
                </p>
            </div>

            <button
                onClick={onConfirm}
                disabled={isLoading}
                className="w-full py-5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-2xl font-black text-xl transition-all disabled:opacity-60 shadow-xl shadow-rose-200 hover:-translate-y-1 active:translate-y-0"
            >
                {isLoading ? <RefreshCw className="animate-spin mx-auto" /> : `Pay with ${selectedPaymentMethod} & Confirm`}
            </button>
        </div>
    );
};
