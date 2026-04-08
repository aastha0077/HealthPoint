/**
 * Cascade Delete Helpers
 * 
 * Centralized delete logic that properly cleans up all FK constraints
 * before deleting the target record. Every delete function checks for
 * existence first and handles all nested relations.
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ─── Helper: delete all nested appointment relations ───
async function cleanupAppointments(apptIds: number[]) {
    if (apptIds.length === 0) return;
    await prisma.refundRequest.deleteMany({ where: { appointmentId: { in: apptIds } } });
    await prisma.document.deleteMany({ where: { appointmentId: { in: apptIds } } });
    await prisma.chatMessage.deleteMany({ where: { appointmentId: { in: apptIds } } });
    await prisma.review.deleteMany({ where: { appointmentId: { in: apptIds } } });
    await prisma.payment.deleteMany({ where: { appointmentId: { in: apptIds } } });
}

// ─── Delete a single appointment by ID ───
export async function cascadeDeleteAppointment(id: number) {
    const apt = await prisma.appointment.findUnique({ where: { id } });
    if (!apt) throw new Error("Appointment not found");

    await cleanupAppointments([id]);
    await prisma.appointment.delete({ where: { id } });
}

// ─── Delete a doctor by doctor.id (with userId fallback) ───
export async function cascadeDeleteDoctor(id: number) {
    // Try by doctor ID first, then by userId
    let doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
        doctor = await prisma.doctor.findUnique({ where: { userId: id } });
    }
    if (!doctor) throw new Error("Doctor not found");

    const doctorId = doctor.id;

    // Doctor-level relations
    await prisma.timeslots.deleteMany({ where: { doctorId } });
    await prisma.favorite.deleteMany({ where: { doctorId } });
    await prisma.doctorAvailability.deleteMany({ where: { doctorId } });
    await prisma.doctorUnavailableDate.deleteMany({ where: { doctorId } });
    await prisma.review.deleteMany({ where: { doctorId } });

    // Appointment-level cascaded cleanup
    const appts = await prisma.appointment.findMany({ where: { doctorId } });
    const apptIds = appts.map(a => a.id);
    await cleanupAppointments(apptIds);
    await prisma.appointment.deleteMany({ where: { doctorId } });

    await prisma.doctor.delete({ where: { id: doctorId } });
}

// ─── Delete a patient by patient.id ───
export async function cascadeDeletePatient(id: number) {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new Error("Patient not found");

    // Clean up appointment-level relations
    const appts = await prisma.appointment.findMany({ where: { patientId: id } });
    const apptIds = appts.map(a => a.id);
    await cleanupAppointments(apptIds);
    await prisma.appointment.deleteMany({ where: { patientId: id } });
    await prisma.review.deleteMany({ where: { patientId: id } });

    await prisma.patient.delete({ where: { id } });
}

// ─── Delete a user by user.id (cascading doctor + patient cleanup) ───
export async function cascadeDeleteUser(id: number) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");

    // User-level relations
    await prisma.favorite.deleteMany({ where: { userId: id } });
    await prisma.review.deleteMany({ where: { userId: id } });
    await prisma.notification.deleteMany({ where: { userId: id } });
    await prisma.chatMessage.deleteMany({ where: { senderId: id } });
    await prisma.chatMessage.deleteMany({ where: { receiverId: id } });

    // If user is a doctor, cascade-delete doctor profile
    const doctor = await prisma.doctor.findUnique({ where: { userId: id } });
    if (doctor) {
        await cascadeDeleteDoctor(doctor.id);
    }

    // Detach patients owned by this user (don't delete — they may have history)
    await prisma.patient.updateMany({ where: { userId: id }, data: { userId: null } });

    await prisma.user.delete({ where: { id } });
}

// ─── Delete a department by ID (reassign or cascade doctors) ───
export async function cascadeDeleteDepartment(id: number) {
    const dept = await prisma.department.findUnique({
        where: { id },
        include: { doctors: { include: { user: true } } }
    });
    if (!dept) throw new Error("Department not found");

    if (dept.doctors.length > 0) {
        const doctorNames = dept.doctors.map(d => `${d.user.firstName} ${d.user.lastName}`).join(", ");
        throw new Error(
            `Cannot delete department "${dept.name}" — The following doctors are still assigned to it: ${doctorNames}. Please reassign them to another specialty first.`
        );
    }

    // Clean up any appointments referencing this department
    await prisma.appointment.updateMany({
        where: { departmentId: id },
        data: { departmentId: null }
    });

    await prisma.department.delete({ where: { id } });
}
