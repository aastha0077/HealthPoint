import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAdminAnalytics = async (period: 'weekly' | 'monthly' | 'yearly' = 'monthly') => {
    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (period === 'weekly') {
        startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
        startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'yearly') {
        startDate.setFullYear(now.getFullYear() - 1);
    }

    // Global stats
    const [totalAppointments, completedAppointments, cancelledAppointments, totalUsers, totalPatients, pendingRefunds] = await Promise.all([
        prisma.appointment.count({ where: { dateTime: { gte: startDate } } }),
        prisma.appointment.count({ where: { dateTime: { gte: startDate }, status: "COMPLETED" } }),
        prisma.appointment.count({ where: { dateTime: { gte: startDate }, status: "CANCELLED" } }),
        prisma.user.count({ where: { createdAt: { gte: startDate } } }),
        prisma.patient.count({ where: { user: { createdAt: { gte: startDate } } } }),
        (prisma as any).refundRequest.count({ where: { status: "PENDING" } })
    ]);

    // Trend data
    const appointmentsTrend = await prisma.appointment.findMany({
        where: { dateTime: { gte: startDate } },
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

    // Enhanced grouping helper
    const groupByPeriod = (data: any[], dateField: string, valueField?: string) => {
        const groups: Record<string, number> = {};
        data.forEach(item => {
            const d = new Date(item[dateField]);
            let key: string;

            if (period === 'yearly') {
                // Group by Month: "2024-01"
                key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            } else {
                // Group by Day: "2024-04-20"
                key = d.toISOString().split('T')[0];
            }

            if (valueField) {
                groups[key] = (groups[key] || 0) + (item[valueField] || 0);
            } else {
                groups[key] = (groups[key] || 0) + 1;
            }
        });

        return Object.entries(groups).map(([date, value]) => {
            if (period === 'yearly') {
                const [year, month] = date.split('-');
                const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });
                return { date: `${monthName} ${year}`, value };
            }
            return { date, value };
        });
    };

    // Department Performance
    const deptPerformance = await prisma.department.findMany({
        include: {
            _count: {
                select: { appointments: { where: { dateTime: { gte: startDate } } } }
            },
            doctors: {
                select: {
                    user: { select: { firstName: true, lastName: true } },
                    Appointments: {
                        where: { status: 'COMPLETED', dateTime: { gte: startDate } },
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

    // Regional Analytics (Filter by patient creation if possible, or keep lifetime for demographic overview)
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

    // Appointment Status Breakdown
    const statusCounts = await prisma.appointment.groupBy({
        by: ['status'],
        where: { dateTime: { gte: startDate } },
        _count: {
            status: true
        }
    });

    // Personnel Performance (Top Doctors by completion)
    const topDoctors = await prisma.doctor.findMany({
        include: {
            user: { select: { firstName: true, lastName: true, profilePicture: true } },
            department: { select: { name: true } },
            _count: {
                select: {
                    Appointments: {
                        where: { status: 'COMPLETED', dateTime: { gte: startDate } }
                    }
                }
            }
        },
        orderBy: {
            Appointments: {
                _count: 'desc'
            }
        },
        take: 5
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
        })),
        topDoctors: topDoctors.map(d => ({
            id: d.id,
            name: `Dr. ${d.user.firstName} ${d.user.lastName}`,
            completed: d._count.Appointments,
            dept: d.department.name,
            pic: d.user.profilePicture
        }))
    };

    return {
        summary,
        trends: {
            appointments: groupByPeriod(appointmentsTrend, 'dateTime'),
            revenue: groupByPeriod(paymentsTrend, 'createdAt', 'amount'),
            users: groupByPeriod(userTrend, 'createdAt')
        },
        departmentStats,
        regionalStats,
        period
    };
};
