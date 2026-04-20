import { PrismaClient } from "@prisma/client";
import { createNotification } from "./notification.services";
import { emitToUser } from "../sockets/socket.manager";

const prisma = new PrismaClient();

export async function saveDirectMessage(senderId: number, receiverId: number, content: string, fileUrl?: string, fileType?: string) {
    const chatMessage = await prisma.chatMessage.create({
        data: {
            senderId,
            receiverId,
            content,
            fileUrl,
            fileType,
            isRead: false
        },
        include: {
            sender: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true,
                    role: true
                }
            }
        }
    });

    // Notify receiver
    const senderName = `${chatMessage.sender.firstName} ${chatMessage.sender.lastName}`;
    const snippet = content.length > 30 ? content.substring(0, 30) + "..." : content;
    
    await createNotification(receiverId, `New message from ${senderName}: ${snippet}`, "MESSAGE");
    
    // Emit via socket
    emitToUser(receiverId, "newDirectMessage", chatMessage);

    return chatMessage;
}

export async function getDirectConversations(userId: number) {
    // This fetches a list of people the user has chatted with
    const messages = await prisma.chatMessage.findMany({
        where: {
            OR: [
                { senderId: userId },
                { receiverId: userId }
            ],
            appointmentId: null // Direct messages only
        },
        include: {
            sender: {
                select: { id: true, firstName: true, lastName: true, profilePicture: true, role: true }
            },
            receiver: {
                select: { id: true, firstName: true, lastName: true, profilePicture: true, role: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const conversationsMap = new Map();
    messages.forEach(msg => {
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
        if (!conversationsMap.has(otherUser.id)) {
            conversationsMap.set(otherUser.id, {
                otherUser,
                lastMessage: msg.content,
                lastMessageTime: msg.createdAt,
                unreadCount: 0
            });
        }
    });

    const results = Array.from(conversationsMap.values());
    for (const conv of results) {
        conv.unreadCount = await prisma.chatMessage.count({
            where: {
                senderId: conv.otherUser.id,
                receiverId: userId,
                isRead: false,
                appointmentId: null
            }
        });
    }

    return results;
}
export async function getDirectMessages(userA: number, userB: number) {
    return await prisma.chatMessage.findMany({
        where: {
            OR: [
                { senderId: userA, receiverId: userB },
                { senderId: userB, receiverId: userA }
            ],
            appointmentId: null
        },
        include: {
            sender: {
                select: { id: true, firstName: true, lastName: true, profilePicture: true, role: true }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
}
