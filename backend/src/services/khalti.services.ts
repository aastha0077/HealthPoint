import { PrismaClient, PaymentStatus } from "@prisma/client";
import { createNotification } from "./notification.services";

const prisma = new PrismaClient();
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL || "https://a.khalti.com/api/v2";

export async function initiateKhaltiPayment(options: { return_url: string; amount: number; purchase_order_id: string; purchase_order_name: string; customer_info: { name: string; email: string; phone: string } }) {
    const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
    if (!KHALTI_SECRET_KEY) throw new Error("Khalti secret key not configured");
    
    // Khalti expects amount in paisa
    const response = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
        method: "POST",
        headers: {
            "Authorization": `Key ${KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            return_url: options.return_url,
            website_url: process.env.FRONTEND_URL || "http://localhost:5173",
            amount: options.amount,
            purchase_order_id: options.purchase_order_id,
            purchase_order_name: options.purchase_order_name,
            customer_info: options.customer_info
        })
    });
    
    let data: any;
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        const text = await response.text();
        console.error("Khalti unexpected response:", text.substring(0, 100));
        throw new Error("Khalti API did not return JSON. It might be down or returning an error page.");
    }

    if (!response.ok) {
        console.error("Khalti Init Error:", data);
        throw new Error(data.detail || "Error initiating Khalti payment");
    }
    return data; // { pidx, payment_url, expires_at, expires_in }
}

export async function verifyKhaltiPayment(pidx: string) {
    const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
    if (!KHALTI_SECRET_KEY) throw new Error("Khalti secret key not configured");
    
    // Look up payment status in Khalti
    const response = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
        method: "POST",
        headers: {
            "Authorization": `Key ${KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ pidx })
    });
    
    const data = await response.json();
    if (!response.ok) {
        console.error("Khalti Verify Error:", data);
        throw new Error(data.detail || "Error looking up Khalti payment");
    }

    // In Khalti, "Completed" is the success state.
    if (data.status === "Completed") {
        // Find appointment with this transactionId
        const payment = await prisma.payment.findUnique({
            where: { transactionId: pidx },
            include: { appointment: { include: { patient: true } } }
        });

        if (payment && payment.status !== PaymentStatus.COMPLETED) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: PaymentStatus.COMPLETED
                }
            });

            // Notify user
            if (payment.appointment.patient.userId) {
                 await createNotification(
                     payment.appointment.patient.userId,
                     `Payment for appointment ${payment.appointment.appointmentNumber} was successful.`,
                     "PAYMENT"
                 );
            }
        }
    } else if (data.status === "Expired" || data.status === "Failed" || data.status === "Canceled") {
         const payment = await prisma.payment.findUnique({
             where: { transactionId: pidx },
         });
         
         if (payment && payment.status === PaymentStatus.PENDING) {
             await prisma.payment.update({
                 where: { id: payment.id },
                 data: {
                     status: PaymentStatus.FAILED
                 }
             });
         }
    }

    return data;
}
