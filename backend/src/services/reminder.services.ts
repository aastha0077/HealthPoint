import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { createNotification } from "./notification.services";
import { sendNotificationEmail } from "./email.services";

const prisma = new PrismaClient();

// This runs every hour to check for upcoming appointments
export const initReminders = () => {
    cron.schedule("0 * * * *", async () => {
        try {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Fetch appointments that are BOOKED, within the next 24 hours, and hasn't been reminded
            const appointments = await prisma.appointment.findMany({
                where: {
                    status: "BOOKED",
                    reminderSent: false,
                    dateTime: {
                        lte: tomorrow,
                        gt: now
                    }
                },
                include: {
                    patient: { include: { user: true } },
                    doctor: { include: { user: true } }
                }
            });

            for (const appt of appointments) {
                console.log(`[REMINDER] Sending Reminder to ${appt.patient.user?.email || appt.patient.firstName}: You have an appointment with Dr. ${appt.doctor.user.lastName} at ${appt.dateTime.toLocaleString()}`);

                if (appt.patient.userId) {
                    await prisma.notification.create({
                        data: {
                            userId: appt.patient.userId!,
                            message: `Reminder: You have an appointment with Dr. ${appt.doctor.user.lastName} at ${appt.dateTime.toLocaleTimeString()}`,
                            type: "REMINDER"
                        }
                    });
                }

                await prisma.appointment.update({
                    where: { id: appt.id },
                    data: { reminderSent: true }
                });
            }
        } catch (error) {
            console.error("Error running reminder cron job:", error);
        }
    });
    console.log("Reminders cron initialized.");

    // ──────────────────────────────────────────────
    // MISSED APPOINTMENT DETECTOR — runs every 10 minutes
    // ──────────────────────────────────────────────
    cron.schedule("*/10 * * * *", async () => {
        try {
            const now = new Date();
            const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);

            // Find BOOKED or WAITING appointments whose scheduled time is 30+ minutes in the past
            const overdueAppointments = await prisma.appointment.findMany({
                where: {
                    status: { in: ["BOOKED", "WAITING"] },
                    dateTime: {
                        lt: thirtyMinAgo
                    }
                },
                include: {
                    patient: { include: { user: true } },
                    doctor: { include: { user: true } }
                }
            });

            for (const appt of overdueAppointments) {
                const isNoShow = !appt.arrivedAt;
                const newStatus = isNoShow ? "NO_SHOW" : "MISSED";

                console.log(`[OVERDUE] Marking appointment #${appt.appointmentNumber} as ${newStatus}`);

                await prisma.appointment.update({
                    where: { id: appt.id },
                    data: {
                        status: newStatus,
                        missedAt: now
                    }
                });

                if (isNoShow) {
                    // Case: User missed the appointment
                    if (appt.patient.userId) {
                        const message = `Your appointment #${appt.appointmentNumber} with Dr. ${appt.doctor.user.lastName} was marked as NO-SHOW because you did not join the session. This appointment is non-refundable and cannot be rescheduled.`;
                        await createNotification(appt.patient.userId, message, "NO_SHOW");

                        if (appt.patient.user?.email) {
                            await sendNotificationEmail(
                                appt.patient.user.email,
                                `Appointment No-Show — ${appt.appointmentNumber}`,
                                `Dear ${appt.patient.firstName},\n\nYour appointment (${appt.appointmentNumber}) with Dr. ${appt.doctor.user.lastName} scheduled for ${appt.dateTime.toLocaleString()} was marked as a No-Show because you did not check in for the session.\n\nPer our policy, no-show appointments are non-refundable and cannot be rescheduled.\n\nThank you for your understanding.`
                            );
                        }
                    }
                } else {
                    // Case: Doctor missed the appointment
                    if (appt.patient.userId) {
                        const message = `Your appointment #${appt.appointmentNumber} with Dr. ${appt.doctor.user.lastName} was missed — the doctor did not join the session. You can reschedule or request a refund from your dashboard.`;
                        await createNotification(appt.patient.userId, message, "MISSED");

                        if (appt.patient.user?.email) {
                            await sendNotificationEmail(
                                appt.patient.user.email,
                                `Missed Appointment — ${appt.appointmentNumber}`,
                                `Dear ${appt.patient.firstName},\n\nUnfortunately, your appointment (${appt.appointmentNumber}) with Dr. ${appt.doctor.user.lastName} scheduled for ${appt.dateTime.toLocaleString()} was missed — the doctor did not start the session.\n\nYou have two options:\n• Reschedule to a new time slot\n• Request a full refund\n\nPlease visit your dashboard to proceed.\n\nWe sincerely apologize for the inconvenience.`
                            );
                        }
                    }
                }

                // Notify doctor
                if (appt.doctor.userId) {
                    const docMessage = isNoShow 
                        ? `Appointment #${appt.appointmentNumber} with ${appt.patient.firstName} was marked as NO-SHOW as the patient did not arrive.`
                        : `Appointment #${appt.appointmentNumber} with ${appt.patient.firstName} was missed because you did not start the session.`;
                    
                    await createNotification(appt.doctor.userId, docMessage, newStatus);
                }

                // Notify admins
                const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
                for (const admin of admins) {
                    await createNotification(
                        admin.id,
                        `Appointment #${appt.appointmentNumber} (Dr. ${appt.doctor.user.lastName} with ${appt.patient.firstName}) was marked as ${newStatus}.`,
                        "ADMIN_ALERT"
                    );
                }
            }

            if (overdueAppointments.length > 0) {
                console.log(`[OVERDUE] Marked ${overdueAppointments.length} appointments as MISSED/NO_SHOW`);
            }
        } catch (error) {
            console.error("Error running missed appointment detector:", error);
        }
    });
    console.log("Missed appointment detector cron initialized.");
};
