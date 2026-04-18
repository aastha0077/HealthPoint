import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAdminAnalytics = async (period: 'weekly' | 'monthly' | 'yearly' = 'monthly') => {
    // Determine start date based on period
    const now = new Date();
    let startDate = new Date();
    
    if (period === 'weekly') {
        startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
        startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'yearly') {
        startDate.setFullYear(now.getFullYear() - 1);
    }

    // Global stats (Total/Lifetime for summary cards)
    const [totalAppointments, completedAppointments, cancelledAppointments, totalUsers, totalPatients, pendingRefunds] = await Promise.all([
        prisma.appointment.count({ where: { dateTime: { gte: startDate.toISOString() } } }),
        prisma.appointment.count({ where: { dateTime: { gte: startDate.toISOString() }, status: "COMPLETED" } }),
        prisma.appointment.count({ where: { dateTime: { gte: startDate.toISOString() }, status: "CANCELLED" } }),
        prisma.user.count(),
        prisma.patient.count(),
        (prisma as any).refundRequest.count({ where: { status: "PENDING" } })
    ]);

    // Trend data (grouped by date) - already correct with gte: startDate
    const appointmentsTrend = await prisma.appointment.findMany({
        where: { dateTime: { gte: startDate.toISOString() } },
        select: { dateTime: true, status: true },
        orderBy: { dateTime: 'asc' }
    });

    const paymentsTrend = await prisma.payment.findMany({
        where: { createdAt: { gte: startDate }, status: 'COMPLETED' },
        select: { createdAt: true, amount: true },
        orderBy: { createdAt: 'asc' }
    });

    const userTrend = await prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' }
    });

    // Helper to group by date
    const groupByDate = (data: any[], dateField: string, valueField?: string) => {
        const groups: Record<string, number> = {};
        data.forEach(item => {
            const date = new Date(item[dateField]).toISOString().split('T')[0];
            if (valueField) {
                groups[date] = (groups[date] || 0) + (item[valueField] || 0);
            } else {
                groups[date] = (groups[date] || 0) + 1;
            }
        });
        return Object.entries(groups).map(([date, value]) => ({ date, value }));
    };

    // Department Performance
    const deptPerformance = await prisma.department.findMany({
        include: {
            _count: {
                select: { appointments: { where: { dateTime: { gte: startDate.toISOString() } } } }
            },
            doctors: {
                select: {
                    user: { select: { firstName: true, lastName: true } },
                    Appointments: {
                        where: { status: 'COMPLETED', dateTime: { gte: startDate.toISOString() } },
                        select: { id: true }
                    }
                }
            }
        }
    });

    const departmentStats = deptPerformance.map(d => ({
        name: d.name,
        appointments: d._count.appointments,
        completedScale: d.doctors.reduce((acc, doc) => acc + doc.Appointments.length, 0)
    }));

    // Regional Analytics (All patients)
    const patientDistricts = await prisma.patient.groupBy({
        by: ['district'],
        _count: {
            district: true
        }
    });

    const regionalStats = patientDistricts.map((d: any) => ({
        location: d.district,
        count: d._count?.district || 0
    })).sort((a: any, b: any) => b.count - a.count);

    // Appointment Status Breakdown (Filtered by period)
    const statusCounts = await prisma.appointment.groupBy({
        by: ['status'],
        where: { dateTime: { gte: startDate.toISOString() } },
        _count: {
            status: true
        }
    });

    const summary = {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        totalUsers,
        totalPatients,
        pendingRefunds,
        statusDistribution: statusCounts.map((s: any) => ({
            status: s.status,
            count: s._count?.status || 0
        }))
    };

    return {
        summary,
        trends: {
            appointments: groupByDate(appointmentsTrend, 'dateTime'),
            revenue: groupByDate(paymentsTrend, 'createdAt', 'amount'),
            users: groupByDate(userTrend, 'createdAt')
        },
        departmentStats,
        regionalStats,
        period
    };
};
