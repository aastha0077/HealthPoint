import { PrismaClient } from "@prisma/client";
import { createNotification } from "./notification.services";
import { sendNotificationEmail } from "./email.services";
import { emitToUser } from "../sockets/socket.manager";

const prisma = new PrismaClient();

/**
 * Mark a doctor as unavailable for a specific date.
 * All BOOKED/PENDING appointments on that date are auto-rescheduled
 * to the next available time slot that doesn't clash.
 */
export async function markDoctorUnavailableForDate(doctorId: number, unavailableDate: string) {
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        include: { user: true, timeSlots: { include: { Time: true } } }
    });

    if (!doctor) throw new Error("Doctor not found");

    const dateObj = new Date(`${unavailableDate}T00:00:00.000Z`);
    
    // Check monthly limit (max 4 days per month)
    const monthStart = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
    const monthEnd = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0, 23, 59, 59);
    
    const existingUnavailableDaysCount = await prisma.doctorUnavailableDate.count({
        where: {
            doctorId,
            date: { gte: monthStart, lte: monthEnd }
        }
    });

    const isAlreadyMarked = await prisma.doctorUnavailableDate.findUnique({
        where: { doctorId_date: { doctorId, date: dateObj } }
    });

    if (!isAlreadyMarked && existingUnavailableDaysCount >= 4) {
        throw new Error("Monthly leave limit reached (Max 4 days per month).");
    }

    // Persist the unavailable date
    await prisma.doctorUnavailableDate.upsert({
        where: { doctorId_date: { doctorId, date: dateObj } },
        update: {},
        create: { doctorId, date: dateObj }
    });

    // Get all doctor time slot values (e.g., ["09:00", "10:00", ...])
    const doctorTimeSlots = doctor.timeSlots.map(ts => ts.Time.time).sort();
    if (doctorTimeSlots.length === 0) {
        return { message: "Day marked unavailable. No time slots configured to reschedule.", rescheduled: [] };
    }

    // Find all active appointments on the unavailable date
    const startOfDay = new Date(`${unavailableDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${unavailableDate}T23:59:59.999Z`);

    const affectedAppointments = await prisma.appointment.findMany({
        where: {
            doctorId,
            dateTime: { gte: startOfDay, lte: endOfDay },
            status: { in: ["BOOKED", "PENDING"] }
        },
        include: {
            patient: { include: { user: true } },
            department: true
        },
        orderBy: { dateTime: "asc" }
    });

    if (affectedAppointments.length === 0) {
        return { message: "Day marked unavailable. No pending appointments to reschedule.", rescheduled: [] };
    }

    // Find admins for notification
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true, email: true } });

    const rescheduledResults: any[] = [];
    const claimedInThisRun: string[] = [];

    for (const appt of affectedAppointments) {
        // Find the next available slot
        const newDateTime = await findNextAvailableSlot(doctorId, unavailableDate, doctorTimeSlots, claimedInThisRun);

        if (!newDateTime) {
            // Could not find a slot within 30 days — skip
            rescheduledResults.push({
                appointmentId: appt.id,
                appointmentNumber: appt.appointmentNumber,
                status: "FAILED",
                reason: "No available slot found within the next 30 days"
            });
            continue;
        }

        // Add to claimed list for this run
        claimedInThisRun.push(newDateTime.toISOString());

        // Update the appointment
        await prisma.appointment.update({
            where: { id: appt.id },
            data: { dateTime: newDateTime }
        });

        const oldDateStr = appt.dateTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        const oldTimeStr = appt.dateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        const newDateStr = newDateTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        const newTimeStr = newDateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

        const patientMsg = `Your appointment (${appt.appointmentNumber}) with Dr. ${doctor.user.firstName} ${doctor.user.lastName} has been rescheduled from ${oldDateStr} ${oldTimeStr} to ${newDateStr} ${newTimeStr} due to doctor unavailability.`;
        const adminMsg = `Appointment ${appt.appointmentNumber} rescheduled: Dr. ${doctor.user.firstName} ${doctor.user.lastName} marked ${unavailableDate} as unavailable. Moved from ${oldDateStr} ${oldTimeStr} to ${newDateStr} ${newTimeStr}.`;

        // Notify the patient (if user linked)
        if (appt.patient?.userId) {
            await createNotification(appt.patient.userId, patientMsg, "RESCHEDULE", appt.id);
            emitToUser(appt.patient.userId, "notification", { message: patientMsg });

            if (appt.patient.user?.email) {
                await sendNotificationEmail(
                    appt.patient.user.email,
                    `Appointment Rescheduled - ${appt.appointmentNumber}`,
                    patientMsg
                );
            }
        }

        // Notify all admins
        for (const admin of admins) {
            await createNotification(admin.id, adminMsg, "RESCHEDULE", appt.id);
            emitToUser(admin.id, "notification", { message: adminMsg });
        }

        rescheduledResults.push({
            appointmentId: appt.id,
            appointmentNumber: appt.appointmentNumber,
            patientName: `${appt.patient?.firstName} ${appt.patient?.lastName}`,
            oldDateTime: appt.dateTime.toISOString(),
            newDateTime: newDateTime.toISOString(),
            status: "RESCHEDULED"
        });
    }

    return {
        message: `${rescheduledResults.filter(r => r.status === "RESCHEDULED").length} appointment(s) rescheduled successfully.`,
        rescheduled: rescheduledResults
    };
}

/**
 * Find the next available slot for a doctor starting from the day after unavailableDate.
 * Searches up to 30 days ahead. Returns a Date object or null.
 */
/**
 * Find the next available slot for a doctor starting from the day after unavailableDate.
 * Searches up to 30 days ahead. Returns a Date object or null.
 */
async function findNextAvailableSlot(doctorId: number, unavailableDate: string, timeSlots: string[], claimedInThisRun: string[] = []): Promise<Date | null> {
    const startDate = new Date(unavailableDate);

    // Get all future unavailable dates for this doctor
    const unavailableDates = await prisma.doctorUnavailableDate.findMany({
        where: { doctorId },
        select: { date: true }
    });
    const unavailableDateSet = new Set(unavailableDates.map(d => d.date.toISOString().split('T')[0]));

    for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
        const candidateDate = new Date(startDate);
        candidateDate.setDate(candidateDate.getDate() + dayOffset);
        const candidateDateStr = candidateDate.toISOString().split("T")[0];

        // Skip if this date is also marked as unavailable
        if (unavailableDateSet.has(candidateDateStr)) continue;

        for (const slot of timeSlots) {
            const [hours, minutes] = slot.split(":").map(Number);
            const candidateDateTime = new Date(`${candidateDateStr}T${slot}:00.000Z`);
            candidateDateTime.setUTCHours(hours, minutes, 0, 0);

            const isoStr = candidateDateTime.toISOString();

            // Check if this slot was already picked for another patient in this same rescheduling run
            if (claimedInThisRun.includes(isoStr)) continue;

            // Check if this slot is already booked in the database (by other patients we aren't moving)
            const existingAppt = await prisma.appointment.findFirst({
                where: {
                    doctorId,
                    dateTime: candidateDateTime,
                    status: { not: "CANCELLED" }
                }
            });

            if (!existingAppt) {
                return candidateDateTime;
            }
        }
    }

    return null;
}

/**
 * Get all unavailable dates for a doctor (for use in booking UI)
 */
export async function getDoctorUnavailableDates(doctorId: number) {
    const dates = await prisma.doctorUnavailableDate.findMany({
        where: {
            doctorId,
            date: { gte: new Date() } // Only future dates
        },
        select: { date: true, reason: true },
        orderBy: { date: 'asc' }
    });
    return dates.map(d => ({
        date: d.date.toISOString().split('T')[0],
        reason: d.reason
    }));
}
