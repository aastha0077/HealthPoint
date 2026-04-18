import { PrismaClient, AppointmentStatus, PaymentStatus } from "@prisma/client";
import { checkIsAvailable } from "./doctorAvailability.services";
import { createNotification } from "./notification.services";
import { getAppointmentPDFBuffer } from "./pdf.services";
import { sendAppointmentEmail, sendNotificationEmail } from "./email.services";
import { initiateKhaltiPayment } from "./khalti.services";
import { emitToUser } from "../sockets/socket.manager";

const prisma = new PrismaClient();

export async function createNewAppointment(patientId: number, doctorId: number, appointmentDateTime: string, paymentMethod: string = 'ONLINE', transactionId?: string) {
    const doctor = await prisma.doctor.findFirst({
        where: { id: doctorId },
        include: { department: true, user: true }
    });

    if (!doctor) {
        throw new Error("Doctor not found");
    }

    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: { user: true }
    });

    if (!patient) {
        throw new Error("Patient not found");
    }

    const parsedDate = new Date(appointmentDateTime);
    if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date and time format");
    }

    console.log(`[createNewAppointment] Checking availability for Dr. ${doctorId} at ${parsedDate.toISOString()}`);

    // 1) Check doctor availability
    const isAvail = await checkIsAvailable(doctorId, parsedDate);
    if (!isAvail) {
        throw new Error("Doctor is not available at this time");
    }

    // 1.5) Check if doctor is unavailable on this date
    const dateOnly = new Date(parsedDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
    const unavailableDate = await prisma.doctorUnavailableDate.findUnique({
        where: { doctorId_date: { doctorId, date: dateOnly } }
    });
    if (unavailableDate) {
        throw new Error("Doctor is unavailable on this date. Please select a different date.");
    }

    // 2) Check double booking for the doctor
    const existingDoctorAppt = await prisma.appointment.findFirst({
        where: {
            doctorId,
            dateTime: parsedDate,
            status: { not: 'CANCELLED' }
        }
    });

    if (existingDoctorAppt) {
        throw new Error("Doctor is already booked for this time slot");
    }

    // 3) Check double booking for the patient
    const existingPatientAppt = await prisma.appointment.findFirst({
        where: {
            patientId,
            dateTime: parsedDate,
            status: { not: 'CANCELLED' }
        }
    });

    if (existingPatientAppt) {
        throw new Error("Patient already has an appointment at this time");
    }

    // Generate unique appointment number
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const appointmentNumber = `PLU-${dateStr}-${randomStr}`;

    const paymentStatusToUse = paymentMethod === 'Khalti' ? PaymentStatus.PENDING : PaymentStatus.COMPLETED;
    const amountToCharge = 500; // E.g., Rs 500
    let khaltiInitiateResponse = null;

    if (paymentMethod === "Khalti") {
        try {
            const customerName = `${patient.firstName} ${patient.lastName}`;
            const customerEmail = patient.user?.email || "guest@example.com";
            // Amount in Paisa (Rs 500 = 50000 paisa)
            const amountInPaisa = amountToCharge * 100;

            console.log(`[createNewAppointment] Initiating Khalti payment for ${customerName}`);
            
            khaltiInitiateResponse = await initiateKhaltiPayment({
                return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/khalti/callback`,
                amount: amountInPaisa,
                purchase_order_id: appointmentNumber,
                purchase_order_name: `Appointment with Dr. ${doctor.user.lastName}`,
                customer_info: {
                    name: customerName,
                    email: customerEmail,
                    phone: "9800000000"
                }
            });
            console.log(`[createNewAppointment] Khalti PIDX: ${khaltiInitiateResponse.pidx}`);
        } catch (error: any) {
            console.error("Failed to initiate Khalti payment:", error.message);
            // Re-throw so we don't proceed with creating the appointment
            throw new Error(`Payment initiation failed: ${error.message}`);
        }
    }

    // Set transactionId: either the passed one, or Khalti's pidx, or a generated one
    const transactionIdToUse = (paymentMethod === "Khalti") 
        ? khaltiInitiateResponse.pidx 
        : (transactionId || `txn_${Date.now()}`);

    // Creating the appointment
    const createdAppointment: any = await prisma.appointment.create({
        data: {
            appointmentNumber,
            patientId,
            doctorId,
            departmentId: doctor.departmentId,
            dateTime: parsedDate,
            status: AppointmentStatus.BOOKED,
            payment: {
                create: {
                    method: paymentMethod,
                    status: paymentStatusToUse,
                    transactionId: transactionIdToUse,
                    amount: amountToCharge
                }
            }
        } as any,
        include: {
            patient: { include: { user: true } },
            payment: true,
            doctor: { include: { user: true, department: true } }
        } as any
    });

    // Send Confirmation Email
    const patientEmail = createdAppointment.patient.user?.email;
    if (patientEmail) {
        try {
            const pdfBuffer = await getAppointmentPDFBuffer(createdAppointment.id);
            await sendAppointmentEmail(patientEmail, {
                appointmentNumber: createdAppointment.appointmentNumber,
                patientName: `${createdAppointment.patient.firstName} ${createdAppointment.patient.lastName}`,
                doctorName: `${createdAppointment.doctor.user.firstName} ${createdAppointment.doctor.user.lastName}`,
                dateTime: createdAppointment.dateTime,
                department: createdAppointment.doctor.department.name
            }, pdfBuffer);
        } catch (err) {
            console.error("Failed to send confirmation email:", err);
        }
    }

    // Notify patient
    if (createdAppointment.patient.userId) {
        await createNotification(
            createdAppointment.patient.userId,
            `Appointment booked successfully with Dr. ${doctor.user?.lastName} for ${parsedDate.toLocaleString()}`,
            "BOOKED"
        );
    }

    // Notify doctor
    if (doctor.userId) {
        const msg = `New appointment booked by ${createdAppointment.patient.firstName} ${createdAppointment.patient.lastName} for ${parsedDate.toLocaleString()}`;
        await createNotification(doctor.userId, msg, "BOOKED");
        emitToUser(doctor.userId, "newAppointment", { message: msg, appointment: createdAppointment });
    }

    // Notify admins
    const admins = await prisma.user.findMany({
        where: { role: "ADMIN" }
    });

    for (const admin of admins) {
        await createNotification(
            admin.id,
            `New appointment #${createdAppointment.appointmentNumber} booked by ${createdAppointment.patient.firstName} for Dr. ${doctor.user?.lastName}`,
            "ADMIN_ALERT"
        );
    }

    return {
        ...createdAppointment,
        payment_url: khaltiInitiateResponse?.payment_url || null,
        pidx: khaltiInitiateResponse?.pidx || null
    };
}

export async function getAppointmentByNumber(appointmentNumber: string) {
    return await (prisma.appointment as any).findUnique({
        where: { appointmentNumber },
        include: {
            doctor: { include: { user: true, department: true } },
            patient: true,
            department: true,
            payment: true,
            documents: true
        } as any
    });
}

export async function getAllAppointments() {
    return await prisma.appointment.findMany({
        include: { 
            doctor: { include: { user: true } }, 
            patient: true, 
            department: true, 
            payment: true, 
            documents: true,
            review: true,
            refundRequest: true
        } as any,
        orderBy: { dateTime: 'desc' }
    });
}

export async function getAppointmentById(id: number) {
    return await prisma.appointment.findUnique({
        where: { id },
        include: { doctor: { include: { user: true } }, patient: true, department: true, payment: true, documents: true } as any
    });
}

export async function getUserAppointments(userId: number) {
    const patients = await prisma.patient.findMany({
        where: { userId }
    });

    const patientIds = patients.map(p => p.id);

    return await prisma.appointment.findMany({
        where: { patientId: { in: patientIds } },
        include: { 
            doctor: { include: { user: true } }, 
            patient: true, 
            department: true, 
            payment: true, 
            documents: true,
            review: true,
            refundRequest: true
        } as any,
        orderBy: { dateTime: 'desc' }
    });
}

// Transaction logic for cancellation
export async function cancelAppointment(appointmentId: number) {
    return await prisma.$transaction(async (tx) => {
        const appointment: any = await tx.appointment.findUnique({
            where: { id: appointmentId },
            include: { patient: true, doctor: { include: { user: true } } }
        });

        if (!appointment) {
            throw new Error("Appointment not found");
        }

        if (appointment.status === 'CANCELLED') {
            throw new Error("Appointment is already cancelled");
        }

        const now = new Date();
        const diffMs = appointment.dateTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 12) {
            throw new Error("Cannot cancel/reschedule an appointment within 12 hours of the scheduled time");
        }

        if (appointment.status === 'COMPLETED') {
            throw new Error("Cannot cancel a completed appointment");
        }

        const payment: any = await (tx as any).payment.findUnique({
            where: { appointmentId }
        });

        let paymentStatus = payment?.status;
        let refundId = payment?.refundId;

        // processing refund if necessary
        if (payment?.method === 'ONLINE' && payment?.status === PaymentStatus.COMPLETED) {
            paymentStatus = PaymentStatus.REFUNDED;
            refundId = `ref_${Date.now()}`;
        }

        const updated = await tx.appointment.update({
            where: { id: appointmentId },
            data: {
                status: AppointmentStatus.CANCELLED,
                cancelledAt: new Date(), // atomic record
                payment: {
                    update: {
                        status: paymentStatus,
                        refundId
                    }
                }
            } as any,
            include: { payment: true } as any
        });

        // Notify patient
        if (appointment.patient.userId) {
            await createNotification(
                appointment.patient.userId,
                `Appointment #${appointment.appointmentNumber} with Dr. ${appointment.doctor.user?.lastName} was cancelled. ${refundId ? 'Refund processed.' : ''}`,
                "CANCELLED"
            );
        }

        // Notify doctor
        if (appointment.doctor.userId) {
            await createNotification(
                appointment.doctor.userId,
                `Appointment #${appointment.appointmentNumber} with ${appointment.patient.firstName} ${appointment.patient.lastName} has been cancelled.`,
                "CANCELLED"
            );
        }

        // Notify admins
        const admins = await (tx as any).user.findMany({
            where: { role: "ADMIN" }
        });

        for (const admin of admins) {
            await createNotification(
                admin.id,
                `Appointment #${appointment.appointmentNumber} (Dr. ${appointment.doctor.user?.lastName} with ${appointment.patient.firstName}) was cancelled.`,
                "ADMIN_ALERT"
            );
        }

        // Send Cancellation Email to Patient
        if (appointment.patient.user?.email) {
            await sendNotificationEmail(
                appointment.patient.user.email,
                `Appointment Cancelled - ${appointment.appointmentNumber}`,
                `Dear ${appointment.patient.firstName}, your appointment (${appointment.appointmentNumber}) with Dr. ${appointment.doctor.user?.lastName} has been cancelled. ${refundId ? 'A refund has been initiated.' : ''}`
            );
        }

        return updated;
    });
}

export async function startAppointment(appointmentId: number) {
    // Fetch the appointment first to validate its current status
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
    });

    if (!appointment) {
        throw new Error("Appointment not found");
    }

    if (appointment.status === 'COMPLETED') {
        throw new Error("Cannot start a consultation for a completed appointment");
    }

    if (appointment.status === 'CANCELLED') {
        throw new Error("Cannot start a consultation for a cancelled appointment");
    }

    if (appointment.status === 'IN_PROGRESS') {
        throw new Error("Consultation is already in progress");
    }

    const updatedAppointment: any = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { 
            status: AppointmentStatus.IN_PROGRESS,
            startedAt: new Date()
        },
        include: {
            patient: true,
            doctor: { include: { user: true } }
        }
    });

    // Notify patient
    if (updatedAppointment.patient.userId) {
        await createNotification(
            updatedAppointment.patient.userId,
            `Your consultation with Dr. ${updatedAppointment.doctor.user?.lastName} is now in progress.`,
            "IN_PROGRESS"
        );
    }

    return updatedAppointment;
}

export async function completeAppointment(appointmentId: number, consultationDuration?: number, audioRecordingUrl?: string) {
    const updatedAppointment: any = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { 
            status: AppointmentStatus.COMPLETED,
            completedAt: new Date(),
            consultationDuration: consultationDuration || null,
            audioRecordingUrl: audioRecordingUrl || null
        },
        include: {
            patient: true,
            doctor: { include: { user: true } }
        }
    });

    // Notify patient
    if (updatedAppointment.patient.userId) {
        await createNotification(
            updatedAppointment.patient.userId,
            `Your appointment with Dr. ${updatedAppointment.doctor.user?.lastName} has been completed. Feedback is welcome!`,
            "COMPLETED"
        );
    }

    // Notify doctor
    if (updatedAppointment.doctor.userId) {
        await createNotification(
            updatedAppointment.doctor.userId,
            `Session #${updatedAppointment.appointmentNumber} with ${updatedAppointment.patient.firstName} has been marked as completed.`,
            "COMPLETED"
        );
    }

    // Notify admins
    const admins = await prisma.user.findMany({
        where: { role: "ADMIN" }
    });

    for (const admin of admins) {
        await createNotification(
            admin.id,
            `Appointment #${updatedAppointment.appointmentNumber} (Dr. ${updatedAppointment.doctor.user?.lastName} with ${updatedAppointment.patient.firstName}) has been completed.`,
            "ADMIN_ALERT"
        );
    }

    return updatedAppointment;
}

export async function rescheduleAppointment(appointmentId: number, newDateTime: string) {
    const parsedDate = new Date(newDateTime);
    if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date for rescheduling");
    }

    const appt: any = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { doctor: { include: { user: true } }, patient: true }
    });

    if (!appt) throw new Error("Appointment not found");

    if (appt.status === 'NO_SHOW') {
        throw new Error("No-show appointments are non-refundable and cannot be rescheduled");
    }

    // Allow reschedule for MISSED appointments without the 12h restriction
    if (appt.status !== 'MISSED') {
        const now = new Date();
        if (appt.dateTime.getTime() - now.getTime() < 12 * 60 * 60 * 1000) {
            throw new Error("Cannot reschedule within 12 hours of the scheduled time");
        }
    }

    // Check doctor availability for the NEW time
    const isAvail = await checkIsAvailable(appt.doctorId, parsedDate);
    if (!isAvail) throw new Error("Doctor is not available at the new time");

    // Check double booking
    const exists = await prisma.appointment.findFirst({
        where: {
            doctorId: appt.doctorId,
            dateTime: parsedDate,
            status: { not: 'CANCELLED' }
        }
    });

    if (exists && (exists as any).id !== appointmentId) {
        throw new Error("Doctor already has an appointment at this new time slot");
    }

    const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
            dateTime: parsedDate,
            status: AppointmentStatus.BOOKED,
            missedAt: null,
            reminderSent: false
        }
    });

    // Notify patient
    if (appt.patient.userId) {
        await createNotification(
            appt.patient.userId,
            `Appointment #${appt.appointmentNumber} rescheduled to ${parsedDate.toLocaleString()}`,
            "RESCHEDULE"
        );
    }
    // Notify doctor
    if (appt.doctor.userId) {
        const drMessage = appt.status === 'MISSED' 
            ? `Corrective Action: Appointment #${appt.appointmentNumber} with ${appt.patient.firstName} (missed by you) has been rescheduled to ${parsedDate.toLocaleString()}.`
            : `Appointment #${appt.appointmentNumber} with ${appt.patient.firstName} rescheduled to ${parsedDate.toLocaleString()}`;

        await createNotification(
            appt.doctor.userId,
            drMessage,
            "RESCHEDULE"
        );
    }

    // Notify admins
    const admins = await prisma.user.findMany({
        where: { role: "ADMIN" }
    });

    for (const admin of admins) {
        await createNotification(
            admin.id,
            `Appointment #${appointmentId} (Dr. ${appt.doctor.user?.lastName} with ${appt.patient.firstName}) has been rescheduled to ${parsedDate.toLocaleString()}`,
            "ADMIN_ALERT"
        );
    }

    return updated;
}

export async function getDoctorBookedSlots(doctorId: number, date: string) {
    // Parse as local time (appending T00:00:00 without Z avoids UTC interpretation)
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59.999`);

    const appointments = await prisma.appointment.findMany({
        where: {
            doctorId,
            dateTime: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: { notIn: ['CANCELLED', 'COMPLETED'] }
        },
        select: {
            dateTime: true
        }
    });

    return appointments.map(appt => appt.dateTime);
}

export async function addConsultationNotes(appointmentId: number, notesData: { symptoms?: string, diagnosis?: string, treatment?: string, additionalNotes?: string, documents?: { fileUrl: string, fileName: string, fileType: string }[] }) {
    if (notesData.documents) {
        await prisma.$transaction(async (tx) => {
            await tx.document.deleteMany({ where: { appointmentId } });
            
            await tx.appointment.update({
                where: { id: appointmentId },
                data: {
                    symptoms: notesData.symptoms,
                    diagnosis: notesData.diagnosis,
                    treatment: notesData.treatment,
                    additionalNotes: notesData.additionalNotes,
                    documents: {
                        create: notesData.documents?.map(doc => ({
                            fileUrl: doc.fileUrl,
                            fileName: doc.fileName,
                            fileType: doc.fileType
                        })) || []
                    }
                }
            });
        });
        return await prisma.appointment.findUnique({ where: { id: appointmentId }, include: { documents: true }});
    } else {
        const updated = await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                symptoms: notesData.symptoms,
                diagnosis: notesData.diagnosis,
                treatment: notesData.treatment,
                additionalNotes: notesData.additionalNotes
            }
        });
        return updated;
    }
}

export async function getPatientHistory(patientId: number) {
    return await prisma.appointment.findMany({
        where: {
            patientId: patientId,
            status: { in: ['COMPLETED', 'BOOKED'] }
        },
        include: {
            doctor: { include: { user: true, department: true } },
            department: true
        },
        orderBy: { dateTime: 'desc' }
    });
}

export async function checkInAppointment(appointmentId: number) {
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { doctor: { include: { user: true } }, patient: true }
    });

    if (!appointment) throw new Error("Appointment not found");

    if (appointment.status !== 'BOOKED') {
        throw new Error("Cannot check-in. Appointment is not in BOOKED status.");
    }

    const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
            status: AppointmentStatus.WAITING,
            arrivedAt: new Date()
        }
    });

    // Notify doctor of check-in
    if (appointment.doctor.userId) {
        const msg = `${appointment.patient.firstName} has arrived and is waiting.`;
        await createNotification(appointment.doctor.userId, msg, "CHECK_IN");
        emitToUser(appointment.doctor.userId, "patientArrived", { message: msg, appointment: updated });
    }

    return updated;
}

export async function getDoctorTodayAppointments(doctorId: number) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
        where: {
            doctorId,
            dateTime: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        include: { patient: true, doctor: { include: { user: true } }, department: true },
        orderBy: { dateTime: 'asc' }
    });
    
    return appointments;
}

export async function getDoctorStats(doctorId: number) {
    const completedCount = await prisma.appointment.count({
        where: {
            doctorId,
            status: AppointmentStatus.COMPLETED
        }
    });

    const uniquePatients = await prisma.appointment.groupBy({
        by: ['patientId'],
        where: { doctorId }
    });

    return {
        totalCompleted: completedCount,
        totalPatients: uniquePatients.length
    };
}

// ──────────────────────────────────────────────
// REFUND REQUEST SERVICES
// ──────────────────────────────────────────────

export async function requestRefund(
    appointmentId: number,
    data: { reason: string; bankName?: string; accountNumber?: string; accountHolderName?: string; qrCodeUrl?: string }
) {
    const appt: any = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: { include: { user: true } }, doctor: { include: { user: true } }, payment: true, refundRequest: true }
    });

    if (!appt) throw new Error("Appointment not found");
    if (appt.status === 'NO_SHOW') {
        throw new Error("No-show appointments are non-refundable");
    }

    if (appt.status !== 'MISSED' && appt.status !== 'CANCELLED') {
        throw new Error("Refund can only be requested for missed or cancelled appointments");
    }
    if (appt.refundRequest) {
        throw new Error("A refund request already exists for this appointment");
    }

    const refundReq = await (prisma as any).refundRequest.create({
        data: {
            appointmentId,
            reason: data.reason,
            bankName: data.bankName || null,
            accountNumber: data.accountNumber || null,
            accountHolderName: data.accountHolderName || null,
            qrCodeUrl: data.qrCodeUrl || null,
            status: "PENDING"
        }
    });

    // Update payment status
    if (appt.payment) {
        await prisma.payment.update({
            where: { id: appt.payment.id },
            data: { status: "REFUND_REQUESTED" as any }
        });
    }

    // Notify patient
    if (appt.patient.userId) {
        await createNotification(
            appt.patient.userId,
            `Your refund request for appointment #${appt.appointmentNumber} has been submitted. Our team will review it shortly.`,
            "REFUND"
        );
    }

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    for (const admin of admins) {
        await createNotification(
            admin.id,
            `New refund request for appointment #${appt.appointmentNumber} (Dr. ${appt.doctor.user?.lastName} with ${appt.patient.firstName}). Reason: ${data.reason.substring(0, 100)}`,
            "ADMIN_ALERT"
        );
    }

    // Notify doctor if refund is due to missed appointment
    if (appt.doctor.userId && appt.status === 'MISSED') {
        await createNotification(
            appt.doctor.userId,
            `Alert: A refund has been requested for Appointment #${appt.appointmentNumber} with ${appt.patient.firstName} because the session was marked as missed by doctor.`,
            "REFUND_ALERT"
        );
    }

    return refundReq;
}

export async function getRefundStatus(appointmentId: number) {
    const refundReq = await (prisma as any).refundRequest.findUnique({
        where: { appointmentId },
        include: {
            appointment: {
                include: {
                    doctor: { include: { user: true } },
                    patient: true,
                    payment: true
                }
            }
        }
    });
    return refundReq;
}

export async function getAllRefundRequests() {
    return await (prisma as any).refundRequest.findMany({
        include: {
            appointment: {
                include: {
                    doctor: { include: { user: true } },
                    patient: { include: { user: true } },
                    payment: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function processRefund(
    refundRequestId: number,
    data: { status: string; proofUrl?: string; adminNotes?: string }
) {
    const refundReq = await (prisma as any).refundRequest.findUnique({
        where: { id: refundRequestId },
        include: {
            appointment: {
                include: {
                    patient: { include: { user: true } },
                    doctor: { include: { user: true } },
                    payment: true
                }
            }
        }
    });

    if (!refundReq) throw new Error("Refund request not found");

    const updated = await (prisma as any).refundRequest.update({
        where: { id: refundRequestId },
        data: {
            status: data.status,
            proofUrl: data.proofUrl || refundReq.proofUrl,
            adminNotes: data.adminNotes || refundReq.adminNotes
        }
    });

    // Update payment status if refund is completed
    if (data.status === "COMPLETED" && refundReq.appointment.payment) {
        await prisma.payment.update({
            where: { id: refundReq.appointment.payment.id },
            data: { status: "REFUNDED" as any, refundId: `ref_${Date.now()}` }
        });
    }

    // Notify patient
    const patientUserId = refundReq.appointment.patient.userId;
    if (patientUserId) {
        const statusMessages: Record<string, string> = {
            PROCESSING: `Your refund for appointment #${refundReq.appointment.appointmentNumber} is being processed.`,
            COMPLETED: `Great news! Your refund for appointment #${refundReq.appointment.appointmentNumber} has been completed. You can view the proof in your dashboard.`,
            REJECTED: `Your refund request for appointment #${refundReq.appointment.appointmentNumber} was reviewed. ${data.adminNotes ? `Admin note: ${data.adminNotes}` : ''}`
        };

        await createNotification(
            patientUserId,
            statusMessages[data.status] || `Refund status updated to ${data.status}`,
            "REFUND"
        );

        // Send email for completed refund
        if (data.status === "COMPLETED" && refundReq.appointment.patient.user?.email) {
            const { sendNotificationEmail } = require("./email.services");
            await sendNotificationEmail(
                refundReq.appointment.patient.user.email,
                `Refund Completed — ${refundReq.appointment.appointmentNumber}`,
                `Dear ${refundReq.appointment.patient.firstName},\n\nYour refund for appointment #${refundReq.appointment.appointmentNumber} has been successfully processed.\n\n${data.adminNotes ? `Note: ${data.adminNotes}` : ''}\n\nYou can view the refund proof in your dashboard. Thank you for your patience.`
            );
        }
    }

    return updated;
}
