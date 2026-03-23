import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createReview = async (
    userId: number,
    doctorId: number,
    rating: number,
    comment: string,
    appointmentId?: number
) => {
    // If appointmentId provided, validate it belongs to this user
    if (appointmentId) {
        const appt = await prisma.appointment.findFirst({
            where: { id: appointmentId, patient: { userId } }
        });
        if (!appt) throw new Error("Appointment not found or does not belong to you");

        // Prevent duplicate review per appointment
        const existing = await prisma.review.findUnique({ where: { appointmentId } });
        if (existing) throw new Error("You have already reviewed this appointment");
    } else {
        // Without appointment — allow one direct review per user per doctor
        const existing = await prisma.review.findFirst({
            where: { userId, doctorId, appointmentId: { equals: null } } as any
        });
        if (existing) throw new Error("You have already reviewed this doctor");
    }

    return prisma.review.create({
        data: {
            userId,
            doctorId,
            rating,
            comment,
            ...(appointmentId ? { appointmentId } : {}),
        } as any,
        include: {
            user: { select: { firstName: true, lastName: true, profilePicture: true } }
        }
    });
};

export const getDoctorReviews = async (doctorId: number) => {
    const reviews = await prisma.review.findMany({
        where: { doctorId },
        include: {
            user: { select: { firstName: true, lastName: true, profilePicture: true } }
        },
        orderBy: { createdAt: "desc" }
    });

    return reviews.map(r => ({
        ...r,
        userName: `${r.user.firstName} ${r.user.lastName}`,
        userProfilePicture: r.user.profilePicture
    }));
};

export const getDoctorAverageRating = async (doctorId: number) => {
    const aggregate = await prisma.review.aggregate({
        where: { doctorId },
        _avg: { rating: true },
        _count: { rating: true }
    });

    return {
        averageRating: aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(1)) : null,
        totalReviews: aggregate._count.rating
    };
};
