import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createNotification = async (userId: number, message: string, type: string = "INFO", appointmentId?: number) => {
    return prisma.notification.create({
        data: {
            userId,
            message,
            type,
            isRead: false,
            appointmentId
        }
    });
};

export const getNotificationsForUser = async (userId: number) => {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });
};

export const markAsRead = async (notificationId: number) => {
    return prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    });
};

export const markAllAsRead = async (userId: number) => {
    return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    });
};
