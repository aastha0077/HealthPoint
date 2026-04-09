import { PrismaClient } from "@prisma/client";
import { createNotification } from "./notification.services";
const prisma = new PrismaClient();

export async function saveMessage(senderId: number, receiverId: number, content: string, appointmentId: number, fileUrl?: string, fileType?: string) {
    if (!appointmentId) throw new Error("appointmentId is required for chat");

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) throw new Error("Appointment not found");

    const allowedStatuses = ["BOOKED", "IN_PROGRESS", "WAITING", "NO_SHOW"];
    if (appointment.status === "CANCELLED") {
        throw new Error("Chat is not available for cancelled appointments");
    }

    if (appointment.status === "COMPLETED") {
        if (!appointment.completedAt) {
            throw new Error("completedAt timestamp is missing for this appointment");
        }
        const now = new Date();
        const diffHours = (now.getTime() - appointment.completedAt.getTime()) / (1000 * 60 * 60);
        if (diffHours > 24) {
            throw new Error("Chat window has closed (24h limit reached)");
        }
    } else if (!allowedStatuses.includes(appointment.status)) {
        throw new Error(`Chat is not available for appointments with status: ${appointment.status}`);
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: appointment.doctorId }});
    const patient = await prisma.patient.findUnique({ where: { id: appointment.patientId }});

    if (!doctor || !patient) throw new Error("Doctor or Patient profile not found");

    const validIds = [doctor.userId, patient.userId];

    // Auto-resolve receiverId if not provided or is 0
    if (!receiverId || receiverId === 0) {
        const resolved = senderId === doctor.userId ? patient.userId : doctor.userId;
        if (!resolved) throw new Error("Could not resolve receiver for this appointment");
        receiverId = resolved;
    }

    if (!validIds.includes(senderId) || !validIds.includes(receiverId)) {
        throw new Error("Sender or receiver does not belong to this appointment");
    }

    const chatMessage = await (prisma as any).chatMessage.create({
        data: {
            senderId,
            receiverId,
            content,
            appointmentId,
            fileUrl,
            fileType,
            isRead: false
        },
        include: { sender: true }
    });

    // Also persist a notification for the receiver
    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    const senderName = sender ? `${sender.firstName} ${sender.lastName}` : "Someone";
    const snippet = content.length > 30 ? content.substring(0, 30) + "..." : content;
    
    await createNotification(receiverId, `${senderName}: ${snippet}`, "MESSAGE", appointmentId);

    return chatMessage;
}

export async function getConversation(user1Id: number, user2Id: number, appointmentId?: number) {
    const whereClause: any = {
        OR: [
            { senderId: user1Id, receiverId: user2Id },
            { senderId: user2Id, receiverId: user1Id }
        ]
    };
    if (appointmentId) {
        whereClause.appointmentId = appointmentId;
    }

    return await prisma.chatMessage.findMany({
        where: whereClause,
        orderBy: {
            createdAt: 'asc'
        }
    });
}

export async function getAppointmentChat(appointmentId: number, skip = 0, take = 30) {
    const messages = await prisma.chatMessage.findMany({
        where: { appointmentId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { sender: true, receiver: true }
    });
    // Return them in asc order for frontend convenience or let frontend handle it
    return messages.reverse();
}

export async function markAsSeen(messageId: number) {
    return await (prisma as any).chatMessage.update({
        where: { id: messageId },
        data: { isRead: true }
    });
}

export async function markAllAsSeen(appointmentId: number, receiverId: number) {
    return await (prisma as any).chatMessage.updateMany({
        where: { appointmentId, receiverId, isRead: false },
        data: { isRead: true }
    });
}

export async function getDoctorConversations(doctorId: number) {
    // 1. Get the doctor's userId
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { userId: true }
    });
    if (!doctor) throw new Error("Doctor not found");

    // 2. Find all unique appointmentIds where this doctor (userId) is the sender or receiver
    const messages = await (prisma as any).chatMessage.findMany({
        where: {
            OR: [
                { senderId: doctor.userId },
                { receiverId: doctor.userId }
            ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
            appointment: {
                include: {
                    patient: true
                }
            },
            sender: true,
            receiver: true
        }
    });

    // 3. Group by appointmentId to get the latest message for each conversation
    const conversationsMap = new Map();

    messages.forEach((msg: any) => {
        if (!conversationsMap.has(msg.appointmentId)) {
            const otherUser = msg.senderId === doctor.userId ? msg.receiver : msg.sender;
            conversationsMap.set(msg.appointmentId, {
                appointmentId: msg.appointmentId,
                patientName: `${msg.appointment?.patient?.firstName} ${msg.appointment?.patient?.lastName}`,
                patientId: msg.appointment?.patientId,
                lastMessage: msg.content || (msg.fileUrl ? "[Attachment]" : ""),
                lastMessageTime: msg.createdAt,
                completedAt: msg.appointment?.completedAt,
                unreadCount: 0 // We'll count this next
            });
        }
    });

    // 4. Calculate unread counts
    const results = Array.from(conversationsMap.values());
    for (const conv of results) {
        conv.unreadCount = await (prisma as any).chatMessage.count({
            where: {
                appointmentId: conv.appointmentId,
                receiverId: doctor.userId,
                isRead: false
            }
        });
    }

    return results;
}

export async function getMessageById(id: number) {
    return await (prisma as any).chatMessage.findUnique({ where: { id } });
}

export async function deleteMessage(messageId: number, userId: number) {
    const message = await (prisma as any).chatMessage.findUnique({
        where: { id: messageId }
    });

    if (!message) throw new Error("Message not found");
    if (message.senderId !== userId) throw new Error("Unauthorized to delete this message");

    return await (prisma as any).chatMessage.delete({
        where: { id: messageId }
    });
}

export async function editMessage(messageId: number, userId: number, newContent: string) {
    const message = await (prisma as any).chatMessage.findUnique({
        where: { id: messageId }
    });

    if (!message) throw new Error("Message not found");
    if (message.senderId !== userId) throw new Error("Unauthorized to edit this message");

    return await (prisma as any).chatMessage.update({
        where: { id: messageId },
        data: { 
            content: newContent,
            isEdited: true // I'll need to add this field to prisma or just skip it if not in schema yet
        }
    });
}

export async function clearChatHistory(appointmentId: number, userId: number) {
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { doctor: true, patient: true }
    });

    if (!appointment) throw new Error("Appointment not found");

    const isPatient = appointment.patient?.userId === userId;
    const isDoctor = appointment.doctor?.userId === userId;

    if (!isPatient && !isDoctor) {
        throw new Error("Unauthorized to delete this chat history");
    }

    return await (prisma as any).chatMessage.deleteMany({
        where: { appointmentId }
    });
}
