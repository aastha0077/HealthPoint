import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function createDepartmentController(req: Request, res: Response) {
    try {
        const departmentData = req.body;
        const department = await prisma.department.create({
            data: departmentData
        });
        res.status(201).json(department);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

async function getAllDepartmentController(req: Request, res: Response) {
    try {
        const departments = await prisma.department.findMany({
            include: {
                _count: { select: { doctors: true, appointments: true } }
            },
            orderBy: { name: "asc" }
        });

        const result = departments.map(dept => ({
            ...dept,
            doctorCount: (dept as any)._count?.doctors ?? 0,
            appointmentCount: (dept as any)._count?.appointments ?? 0,
        }));

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

async function updateDepartmentController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const data = req.body;
        const department = await prisma.department.update({
            where: { id: parseInt(id) },
            data
        });
        res.json(department);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

import { cascadeDeleteDepartment } from "../services/cascadeDelete.services";

async function deleteDepartmentController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await cascadeDeleteDepartment(parseInt(id));
        res.status(200).json({ message: "Department deleted successfully" });
    } catch (error: any) {
        res.status(error.message.includes("assigned") ? 400 : (error.message === "Department not found" ? 404 : 500)).json({ error: error.message });
    }
}

export { createDepartmentController, getAllDepartmentController, updateDepartmentController, deleteDepartmentController };