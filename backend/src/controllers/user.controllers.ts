import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUserProfile(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true, role: true }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateUserProfile(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { firstName, lastName, profilePicture } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { firstName, lastName, profilePicture },
            select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true, role: true }
        });

        res.json(updatedUser);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getAllUsersController(req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true, role: true, createdAt: true }
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getStaffUsersController(req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: { in: ["ADMIN", "DOCTOR"] }
            },
            select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true, role: true }
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
