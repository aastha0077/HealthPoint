import { Request, Response } from 'express';
import { getDoctorAvailability, setDoctorAvailability } from '../services/doctorAvailability.services';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const setDoctorAvailabilityController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const availabilities = req.body.availabilities;
        if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

        const doctor = await prisma.doctor.findUnique({ where: { userId } });
        if (!doctor) { res.status(404).json({ error: "Doctor profile not found" }); return; }

        await setDoctorAvailability(doctor.id, availabilities);
        res.json({ success: true, message: "Availability updated" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getDoctorAvailabilityController = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctorId = parseInt(req.params.doctorId);
        const list = await getDoctorAvailability(doctorId);
        res.json(list);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
