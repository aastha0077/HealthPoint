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
                    profilePicture: true,
                    role: true
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

export async function addGroupMember(groupId: number, userId: number, adminId: number) {
    const group = await prisma.chatGroup.findUnique({
        where: { id: groupId },
        select: { creatorId: true }
    });

    const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { role: true }
    });

    if (group?.creatorId !== adminId && admin?.role !== 'ADMIN') {
        throw new Error("Unauthorized to add members");
    }

    // Check if already a member
    const existing = await prisma.chatGroupMember.findUnique({
        where: {
            groupId_userId: {
                groupId,
                userId
            }
        }
    });

    if (existing) {
        throw new Error("User is already a member of this circle");
    }

    const member = await prisma.chatGroupMember.create({
        data: {
            groupId,
            userId
        },
        include: {
            user: {
                select: { id: true, firstName: true, lastName: true, role: true, profilePicture: true }
            }
        }
    });

    // Notify the user via socket
    emitToUser(userId, "addedToGroup", { groupId, member });

    return member;
}

export async function removeGroupMember(groupId: number, userId: number, adminId: number) {
    const group = await prisma.chatGroup.findUnique({
        where: { id: groupId },
        select: { creatorId: true }
    });

    const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { role: true }
    });

    if (group?.creatorId !== adminId && admin?.role !== 'ADMIN') {
        throw new Error("Unauthorized to remove members");
    }

    await prisma.chatGroupMember.delete({
        where: {
            groupId_userId: {
                groupId,
                userId
            }
        }
    });

    return { success: true };
}

export async function deleteChatGroup(groupId: number, adminId: number) {
    const group = await prisma.chatGroup.findUnique({
        where: { id: groupId },
        select: { creatorId: true }
    });

    const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { role: true }
    });

    if (group?.creatorId !== adminId && admin?.role !== 'ADMIN') {
        throw new Error("Unauthorized to delete group");
    }

    await prisma.chatGroup.delete({
        where: { id: groupId }
    });

    return { success: true };
}
