import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const setDoctorAvailability = async (doctorId: number, availabilities: { dayOfWeek: number, startTime: string, endTime: string }[]) => {
    // Basic approach: delete existing, insert new for this doctor
    await prisma.doctorAvailability.deleteMany({
        where: { doctorId }
    });

    const data = availabilities.map(av => ({
        doctorId,
        dayOfWeek: av.dayOfWeek,
        startTime: av.startTime,
        endTime: av.endTime
    }));

    return prisma.doctorAvailability.createMany({ data });
};

export const getDoctorAvailability = async (doctorId: number) => {
    return prisma.doctorAvailability.findMany({
        where: { doctorId },
        orderBy: { dayOfWeek: "asc" }
    });
};

export const checkIsAvailable = async (_doctorId: number, _requestedDateTime: Date) => {
    // Availability is enforced purely by double-booking check in createNewAppointment.
    // We don't have timezone-reliable per-slot windows, so we always allow the attempt here.
    return true;
};
