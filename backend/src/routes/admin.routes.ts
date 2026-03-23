import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyAccessToken, authorizeRoles } from "../middlewares/auth.middleware";
import { sendNotificationEmail } from "../services/email.services";

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
    } catch(err) {
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
    } catch(err) {
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
        
        // Find user
        const user = await prisma.user.findUnique({ where: { id }});
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        // Delete relations manually to avoid constraint errors
        await prisma.favorite.deleteMany({ where: { userId: id }});
        await prisma.review.deleteMany({ where: { userId: id }});
        await prisma.notification.deleteMany({ where: { userId: id }});
        await prisma.chatMessage.deleteMany({ where: { senderId: id }});
        await prisma.chatMessage.deleteMany({ where: { receiverId: id }});
        
        // Also delete doctor profile if exists
        const doctor = await prisma.doctor.findUnique({ where: { userId: id }});
        if (doctor) {
            await prisma.timeslots.deleteMany({ where: { doctorId: doctor.id }});
            await prisma.doctorAvailability.deleteMany({ where: { doctorId: doctor.id }});
            const appts = await prisma.appointment.findMany({ where: { doctorId: doctor.id }});
            const apptIds = appts.map(a => a.id);
            await prisma.payment.deleteMany({ where: { appointmentId: { in: apptIds } }});
            await prisma.appointment.deleteMany({ where: { doctorId: doctor.id }});
            await prisma.doctor.delete({ where: { id: doctor.id }});
        }

        // Also anonymize patients or delete? Just set userId to null
        await prisma.patient.updateMany({ where: { userId: id }, data: { userId: null }});

        await prisma.user.delete({ where: { id }});
        res.status(200).json({ message: "User deleted" });
    } catch(err: any) { 
        console.error(err);
        res.status(500).json({ error: "Failed to delete user" }); 
    }
});

adminRouter.delete('/patients/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const appts = await prisma.appointment.findMany({ where: { patientId: id }});
        const apptIds = appts.map(a => a.id);

        await prisma.payment.deleteMany({ where: { appointmentId: { in: apptIds } }});
        await prisma.review.deleteMany({ where: { appointmentId: { in: apptIds } }});
        await prisma.appointment.deleteMany({ where: { patientId: id }});
        await prisma.review.deleteMany({ where: { patientId: id }});
        
        await prisma.patient.delete({ where: { id }});
        res.status(200).json({ message: "Patient deleted" });
    } catch(err) { 
        res.status(500).json({ error: "Failed to delete patient" }); 
    }
});

adminRouter.delete('/doctors/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        await prisma.timeslots.deleteMany({ where: { doctorId: id }});
        await prisma.favorite.deleteMany({ where: { doctorId: id }});
        await prisma.doctorAvailability.deleteMany({ where: { doctorId: id }});
        await prisma.review.deleteMany({ where: { doctorId: id }});
        
        const appts = await prisma.appointment.findMany({ where: { doctorId: id }});
        const apptIds = appts.map(a => a.id);
        await prisma.payment.deleteMany({ where: { appointmentId: { in: apptIds } }});
        await prisma.appointment.deleteMany({ where: { doctorId: id }});
        
        await prisma.doctor.delete({ where: { id }});
        res.status(200).json({ message: "Doctor deleted" });
    } catch(err) { 
        res.status(500).json({ error: "Failed to delete doctor" }); 
    }
});

adminRouter.delete('/appointments/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        await prisma.payment.deleteMany({ where: { appointmentId: id }});
        await prisma.review.deleteMany({ where: { appointmentId: id }});
        await prisma.appointment.delete({ where: { id }});
        res.status(200).json({ message: "Appointment deleted" });
    } catch(err: any) { 
        res.status(500).json({ error: err.message || "Failed to delete appointment" }); 
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

// Process a refund request (update status, upload proof, add notes)
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
