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
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-rose-800">Review & Confirm</h2>
            <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl border border-rose-100 p-5 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-rose-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow">
                        {(selectedDoctor?.firstName || selectedDoctor?.user?.firstName || "D").charAt(0)}
                    </div>
                    <div>
                        <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-1">Doctor In-Charge</p>
                        <h3 className="font-black text-slate-900 text-base tracking-tight">
                            Dr. {selectedDoctor?.firstName || selectedDoctor?.user?.firstName} {selectedDoctor?.lastName || selectedDoctor?.user?.lastName}
                        </h3>
                        <p className="text-xs text-rose-600 font-bold">{selectedDoctor?.speciality}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                        <label className="text-[10px] text-rose-400 font-black uppercase tracking-widest block mb-1">Patient</label>
                        <p className="font-bold text-slate-800">{selectedPatient?.firstName} {selectedPatient?.lastName}</p>
                        <p className="text-xs text-slate-400 font-medium">{selectedPatient?.gender} • {selectedPatient?.district}</p>
                    </div>
                    <div>
                        <label className="text-[10px] text-rose-400 font-black uppercase tracking-widest block mb-1">Schedule</label>
                        <p className="font-bold text-slate-800">{selectedTime}</p>
                        <p className="text-xs text-slate-400 font-medium">
                            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })}
                        </p>
                    </div>
                    <div>
                        <label className="text-[10px] text-rose-400 font-black uppercase tracking-widest block mb-1">Payment Method</label>
                        <p className="font-bold text-slate-800">{selectedPaymentMethod}</p>
                        <p className="text-xs text-emerald-600 font-black uppercase tracking-[0.1em]">Ready to Pay</p>
                    </div>
                    <div>
                        <label className="text-[10px] text-rose-400 font-black uppercase tracking-widest block mb-1">Total Amount</label>
                        <p className="font-bold text-slate-800">Rs. 520</p>
                        <p className="text-xs text-slate-400 font-medium whitespace-nowrap">Incl. service charges</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border-2 border-amber-100 rounded-xl p-3.5 flex gap-3">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-500">
                    <AlertCircle size={18} />
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {selectedPaymentMethod === "Khalti"
                        ? "Upon clicking confirm, you will be redirected to Khalti's secure payment page. Once the payment is completed, you'll be brought back here and your booking will be confirmed."
                        : "Upon clicking confirm, your booking will be processed and confirmed immediately in this system."}
                </p>
            </div>

            <button
                onClick={onConfirm}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-xl font-black text-base transition-all disabled:opacity-60 shadow-lg shadow-rose-200 hover:-translate-y-0.5 active:translate-y-0"
            >
                {isLoading ? <RefreshCw className="animate-spin mx-auto" /> : `Pay with ${selectedPaymentMethod} & Confirm`}
            </button>
        </div>
    );
};
