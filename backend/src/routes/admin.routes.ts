import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyAccessToken, authorizeRoles } from "../middlewares/auth.middleware";
import { sendNotificationEmail } from "../services/email.services";
import { cascadeDeleteUser, cascadeDeletePatient, cascadeDeleteDoctor, cascadeDeleteAppointment } from "../services/cascadeDelete.services";

const adminRouter = Router();
const prisma = new PrismaClient();

adminRouter.use(verifyAccessToken, authorizeRoles("ADMIN"));

adminRouter.post('/send-email', async (req: Request, res: Response): Promise<void> => {
    try {
        const { to, subject, message } = req.body;
        if (!to || !subject || !message) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        await sendNotificationEmail(to, subject, message);
        res.status(200).json({ message: "Email sent successfully" });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: "Failed to send email" });
    }
});

adminRouter.post('/mass-email', async (req: Request, res: Response): Promise<void> => {
    try {
        const { subject, message, doctorIds } = req.body;
        if (!subject || !message) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const query: any = { role: "DOCTOR" };
        if (doctorIds && Array.isArray(doctorIds) && doctorIds.length > 0) {
            query.id = { in: doctorIds };
        }

        const doctors = await prisma.user.findMany({ where: query, select: { email: true } });
        if (!doctors.length) {
            res.status(404).json({ error: "No doctors found to email" });
            return;
        }

        const emails = doctors.map((d: any) => d.email).filter(Boolean);
        const toStr = emails.join(',');
        await sendNotificationEmail(toStr, subject, message);

        res.status(200).json({ message: `Mass email deployed to ${emails.length} doctors` });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: "Failed to send mass email" });
    }
});

adminRouter.put('/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const { firstName, lastName, email, role } = req.body;
        await prisma.user.update({
            where: { id },
            data: { firstName, lastName, email, role }
        });
        res.status(200).json({ message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

adminRouter.put('/patients/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const { firstName, lastName, gender, district, municipality, wardNo } = req.body;
        await prisma.patient.update({
            where: { id },
            data: {
                firstName,
                lastName,
                gender,
                district,
                municipality,
                wardNo: wardNo ? Number(wardNo) : undefined
            }
        });
        res.status(200).json({ message: "Patient updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update patient" });
    }
});


adminRouter.delete('/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const currentAdminId = (req as any).user?.id;

        if (id === currentAdminId) {
            res.status(400).json({ error: "You cannot delete your own account" });
            return;
        }

        await cascadeDeleteUser(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err: any) {
        console.error("[Admin] User delete error:", err?.message);
        res.status(err.message === "User not found" ? 404 : 500).json({ error: err?.message || "Failed to delete user" });
    }
});

adminRouter.delete('/patients/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        await cascadeDeletePatient(id);
        res.status(200).json({ message: "Patient deleted successfully" });
    } catch (err: any) {
        console.error("[Admin] Patient delete error:", err?.message);
        res.status(err.message === "Patient not found" ? 404 : 500).json({ error: err?.message || "Failed to delete patient" });
    }
});

adminRouter.delete('/doctors/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        await cascadeDeleteDoctor(id);
        res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (err: any) {
        console.error("[Admin] Doctor delete error:", err?.message);
        res.status(err.message === "Doctor not found" ? 404 : 500).json({ error: err?.message || "Failed to delete doctor" });
    }
});

adminRouter.delete('/appointments/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        await cascadeDeleteAppointment(id);
        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (err: any) {
        console.error("[Admin] Appointment delete error:", err?.message);
        res.status(err.message === "Appointment not found" ? 404 : 500).json({ error: err?.message || "Failed to delete appointment" });
    }
});

// ──────────────────────────────────────────────
// REFUND MANAGEMENT (ADMIN)
// ──────────────────────────────────────────────

// Get all refund requests
adminRouter.get('/refund-requests', async (req: Request, res: Response): Promise<void> => {
    try {
        const { getAllRefundRequests } = require("../services/appointment.services");
        const requests = await getAllRefundRequests();
        res.status(200).json(requests);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Reassign all doctors from one department to another
adminRouter.post('/departments/:id/reassign-doctors', async (req: Request, res: Response): Promise<void> => {
    try {
        const sourceId = Number(req.params.id);
        const { targetId } = req.body;

        if (!targetId) {
            res.status(400).json({ error: "Target department ID is required" });
            return;
        }

        const targetDept = await prisma.department.findUnique({ where: { id: Number(targetId) } });
        if (!targetDept) {
            res.status(404).json({ error: "Target department not found" });
            return;
        }

        const result = await prisma.doctor.updateMany({
            where: { departmentId: sourceId },
            data: { departmentId: Number(targetId) }
        });

        res.status(200).json({ 
            message: `Successfully reassigned ${result.count} doctor(s) to ${targetDept.name}`,
            count: result.count 
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

adminRouter.put('/refund-requests/:id/process', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const { status, proofUrl, adminNotes } = req.body;

        if (!status) {
            res.status(400).json({ error: "Status is required" });
            return;
        }

        if (!["PROCESSING", "COMPLETED", "REJECTED"].includes(status)) {
            res.status(400).json({ error: "Invalid status. Must be PROCESSING, COMPLETED, or REJECTED" });
            return;
        }

        const { processRefund } = require("../services/appointment.services");
        const result = await processRefund(id, { status, proofUrl, adminNotes });
        res.status(200).json({ message: `Refund request updated to ${status}`, result });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export { adminRouter };
