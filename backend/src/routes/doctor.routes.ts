import { Router, Request, Response } from "express";
import { createDoctorController, getDoctorsController, getDoctorByIdController, updateDoctorController, getDoctorByUserIdController } from "../controllers/doctor.controllers";
import { verifyAccessToken, authorizeRoles } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createDoctorSchema, updateDoctorSchema } from "../validators/doctor.validator";
import { markDoctorUnavailableForDate, getDoctorUnavailableDates } from "../services/doctorUnavailability.services";
import { PrismaClient } from "@prisma/client";

const doctorRoutes = Router();
const prisma = new PrismaClient();

doctorRoutes.post('/', validate(createDoctorSchema), createDoctorController);

doctorRoutes.get('/profile/me', verifyAccessToken, getDoctorByUserIdController as any);

// Get unavailable dates for a doctor (public - for booking UI)
doctorRoutes.get('/unavailable-dates/:doctorId', async (req: Request, res: Response): Promise<void> => {
    try {
        const doctorId = parseInt(req.params.doctorId);
        if (isNaN(doctorId)) { res.status(400).json({ error: "Invalid doctorId" }); return; }
        const dates = await getDoctorUnavailableDates(doctorId);
        res.json(dates);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

doctorRoutes.get('/:pageNumber/:pageSize', getDoctorsController);
doctorRoutes.get('/:id', getDoctorByIdController);

doctorRoutes.put('/:id', verifyAccessToken, validate(updateDoctorSchema), updateDoctorController as any);

// Mark doctor unavailable for specific date + auto-reschedule
doctorRoutes.post('/mark-unavailable', verifyAccessToken, authorizeRoles("DOCTOR"), async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { date } = req.body;

        if (!date) {
            res.status(400).json({ error: "Date is required" });
            return;
        }

        const doctor = await prisma.doctor.findUnique({ where: { userId } });
        if (!doctor) {
            res.status(404).json({ error: "Doctor profile not found" });
            return;
        }

        const result = await markDoctorUnavailableForDate(doctor.id, date);
        res.status(200).json(result);
    } catch (err: any) {
        console.error("[MarkUnavailable] Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to mark unavailable" });
    }
});

export { doctorRoutes }