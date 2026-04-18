import { PrismaClient } from "@prisma/client";
import { emitToUser } from "../sockets/socket.manager";

const prisma = new PrismaClient();

export async function createChatGroup(name: string, description: string | null, creatorId: number, memberIds: number[]) {
    return await prisma.$transaction(async (tx) => {
        const group = await tx.chatGroup.create({
            data: {
                name,
                description,
                creatorId,
            }
        });

        const allMemberIds = Array.from(new Set([...memberIds, creatorId]));

        await tx.chatGroupMember.createMany({
            data: allMemberIds.map(userId => ({
                groupId: group.id,
                userId,
            }))
        });

        // Notify all members via socket if possible
        const groupWithMembers = await tx.chatGroup.findUnique({
            where: { id: group.id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                role: true
                            }
                        }
                    }
                }
            }
        });

        allMemberIds.forEach(mId => {
            emitToUser(mId, "newGroupCreated", groupWithMembers);
        });

        return groupWithMembers;
    });
}

export async function getMyGroups(userId: number) {
    return await prisma.chatGroup.findMany({
        where: {
            members: {
                some: {
                    userId
                }
            }
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                            profilePicture: true
                        }
                    }
                }
            },
            messages: {
                take: 1,
                orderBy: {
                    createdAt: 'desc'
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function sendGroupMessage(groupId: number, senderId: number, content: string, fileUrl?: string, fileType?: string) {
    const message = await prisma.groupMessage.create({
        data: {
            groupId,
            senderId,
            content,
            fileUrl,
            fileType
        },
        include: {
            sender: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true
                }
            }
        }
    });

    const members = await prisma.chatGroupMember.findMany({
        where: { groupId },
        select: { userId: true }
    });

    members.forEach(member => {
        if (member.userId !== senderId) {
            emitToUser(member.userId, "newGroupMessage", { groupId, message });
        }
    });

    return message;
}

export async function getGroupMessages(groupId: number) {
    return await prisma.groupMessage.findMany({
        where: { groupId },
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
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
}
