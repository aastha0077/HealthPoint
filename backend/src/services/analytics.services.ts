import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAdminAnalytics = async () => {
    const totalAppointments = await prisma.appointment.count();
    const completedAppointments = await prisma.appointment.count({ where: { status: "COMPLETED" } });
    const cancelledAppointments = await prisma.appointment.count({ where: { status: "CANCELLED" } });

    // Revenue track
    const payments = await (prisma as any).payment.groupBy({
        by: ['status'],
        _count: {
            status: true
        }
    });

    // We can assume each online apt costs some fixed amt e.g. 850
    const completedPaymentsCount = (payments.find((p: any) => p.status === 'COMPLETED') as any)?._count.status || 0;
    const refundedPaymentsCount = (payments.find((p: any) => p.status === 'REFUNDED') as any)?._count.status || 0;
    const rawRevenue = completedPaymentsCount * 850;

    // Doctor appointment counts
    const docs = await prisma.doctor.findMany({
        include: {
            user: { select: { firstName: true, lastName: true } },
            _count: { select: { Appointments: true } }
        }
    });

    const appointmentsPerDoctor = docs.map(d => ({
        doctorName: `Dr. ${d.user.lastName}`,
        count: d._count.Appointments
    }));

    return {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        revenue: {
            completedPaymentsCount,
            refundedPaymentsCount,
            estimatedRevenue: rawRevenue
        },
        appointmentsPerDoctor
    };
};
