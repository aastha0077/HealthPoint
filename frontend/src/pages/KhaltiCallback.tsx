import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { apiClient } from "@/apis/apis";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export function KhaltiCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const pidx = searchParams.get("pidx");
    const paymentStatus = searchParams.get("status"); // Khalti sends status in query params
    const transactionId = searchParams.get("transaction_id");
    const purchaseOrderId = searchParams.get("purchase_order_id");

    if (!pidx) {
      setStatus("failed");
      setMessage("Missing payment identifier (pidx). Payment could not be verified.");
      return;
    }

    // If Khalti returned with a status that indicates user cancelled or it failed
    if (paymentStatus === "User canceled" || paymentStatus === "Canceled") {
      setStatus("failed");
      setMessage("Payment was cancelled. Your appointment has been created but the payment is pending.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await apiClient.post("/api/khalti/verify", { pidx });
        
        if (res.data?.status === "Completed") {
          setStatus("success");
          setMessage(
            `Payment verified successfully! Transaction ID: ${transactionId || res.data.transaction_id || pidx}. Appointment: ${purchaseOrderId || "Confirmed"}`
          );
        } else if (res.data?.status === "Pending") {
          setStatus("verifying");
          setMessage("Payment is still being processed. Please wait...");
          // Retry after 3 seconds
          setTimeout(() => verifyPayment(), 3000);
        } else {
          setStatus("failed");
          setMessage(`Payment status: ${res.data?.status || "Unknown"}. Please contact support if you were charged.`);
        }
      } catch (err: any) {
        console.error("Khalti verification error:", err);
        setStatus("failed");
        setMessage(err.response?.data?.error || "Failed to verify payment. Please contact support.");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-rose-100 p-10 max-w-lg w-full text-center">
        {status === "verifying" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-3">Verifying Payment</h1>
            <p className="text-slate-500 font-medium">
              Please wait while we confirm your Khalti payment...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-emerald-700 mb-3">Payment Successful!</h1>
            <p className="text-slate-500 font-medium mb-2">{message}</p>
            <p className="text-sm text-slate-400 mb-8">
              Your appointment has been confirmed. A confirmation email will be sent shortly.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-8 py-3 border-2 border-rose-100 text-rose-600 rounded-2xl font-black hover:bg-rose-50 transition-all"
              >
                Back to Home
              </button>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-red-600 mb-3">Payment Failed</h1>
            <p className="text-slate-500 font-medium mb-8">{message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/book-appointment")}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-8 py-3 border-2 border-rose-100 text-rose-600 rounded-2xl font-black hover:bg-rose-50 transition-all"
              >
                Back to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
