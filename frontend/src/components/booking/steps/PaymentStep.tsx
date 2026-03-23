import React from "react";
import { Stethoscope, CheckCircle2 } from "lucide-react";

interface PaymentStepProps {
    selectedDoctor: any;
    selectedPaymentMethod: string;
    setSelectedPaymentMethod: (method: string) => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
    selectedDoctor,
    selectedPaymentMethod,
    setSelectedPaymentMethod
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900">Payment Selection</h2>
                <div className="mt-2 flex items-center justify-center gap-2 text-rose-600 font-bold bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 w-fit mx-auto">
                    <Stethoscope size={16} />
                    <span>Dr. {selectedDoctor?.firstName || selectedDoctor?.user?.firstName} • {selectedDoctor?.speciality}</span>
                </div>
                <p className="text-slate-500 font-medium mt-3">Select your preferred payment method for the appointment</p>
            </div>

            <div className="flex justify-center">
                <div
                    onClick={() => setSelectedPaymentMethod("Khalti")}
                    className={`relative p-8 rounded-3xl border-4 cursor-pointer transition-all duration-300 flex flex-col items-center gap-4 max-w-sm w-full
            ${selectedPaymentMethod === "Khalti" ? "border-purple-500 bg-purple-50/50 shadow-xl shadow-purple-100" : "border-slate-100 hover:border-purple-200 bg-white"}`}
                >
                    <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg border-4 border-white">K</div>
                    <div className="text-center">
                        <h3 className="font-black text-slate-900 text-lg">Khalti</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Secure Payment</p>
                    </div>
                    {selectedPaymentMethod === "Khalti" && (
                        <div className="absolute top-4 right-4 bg-purple-500 text-white rounded-full p-1 border-2 border-white">
                            <CheckCircle2 size={16} />
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 font-bold">Consultation Fee</span>
                    <span className="font-black text-slate-900">Rs. 500</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 font-bold">Service Charge</span>
                    <span className="font-black text-slate-900">Rs. 20</span>
                </div>
                <div className="h-px bg-slate-200 my-4" />
                <div className="flex justify-between items-center uppercase tracking-widest">
                    <span className="text-rose-600 font-black">Total Payable</span>
                    <span className="font-black text-slate-900 text-xl">Rs. 520</span>
                </div>
            </div>
        </div>
    );
};
