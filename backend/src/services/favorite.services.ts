import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const toggleFavorite = async (userId: number, doctorId: number) => {
    // Check if it already exists
    const existing = await prisma.favorite.findUnique({
        where: {
            userId_doctorId: {
                userId,
                doctorId
            }
        }
    });

    if (existing) {
        // Remove favorite
        await prisma.favorite.delete({
            where: { id: existing.id }
        });
        return { isFavorite: false, message: "Removed from favorites" };
    } else {
        // Add favorite
        await prisma.favorite.create({
            data: { userId, doctorId }
        });
        return { isFavorite: true, message: "Added to favorites" };
    }
};

export const getFavorites = async (userId: number) => {
    return prisma.favorite.findMany({
        where: { userId },
        include: {
            doctor: {
                include: {
                    user: true,
                    department: true
                }
            }
        }
    });
};
