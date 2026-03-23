import { Request, Response } from "express";
import { getConversation } from "../services/chat.services";
import { getGeminiResponse } from "../services/gemini.services";

export async function getConversationController(req: Request, res: Response) {
    try {
        const { otherUserId } = req.params;
        const myUserId = req.user?.id;

        if (!myUserId || !otherUserId) {
            res.status(400).json({ error: "Missing user IDs" });
            return;
        }

        const messages = await getConversation(myUserId, parseInt(otherUserId));
        res.status(200).json(messages);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function askGeminiController(req: Request, res: Response) {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            res.status(400).json({ error: "Missing prompt" });
            return;
        }

        const responseText = await getGeminiResponse(prompt);
        res.status(200).json({ reply: responseText });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getAppointmentChatController(req: Request, res: Response) {
    try {
        const appointmentId = parseInt(req.params.appointmentId);
        if (isNaN(appointmentId)) {
            res.status(400).json({ error: "Invalid appointment ID" });
            return;
        }
        const skip = parseInt(req.query.skip as string) || 0;
        const take = parseInt(req.query.take as string) || 30;
        
        const { getAppointmentChat } = require("../services/chat.services");
        const { getAppointmentById } = require("../services/appointment.services");
        
        const [messages, appointment] = await Promise.all([
            getAppointmentChat(appointmentId, skip, take),
            getAppointmentById(appointmentId)
        ]);

        res.status(200).json({
            messages,
            completedAt: appointment?.completedAt,
            startedAt: appointment?.startedAt,
            status: appointment?.status,
            audioRecordingUrl: appointment?.audioRecordingUrl,
            consultationDuration: appointment?.consultationDuration,
            participants: {
                doctor: appointment?.doctor?.user ? {
                    userId: appointment.doctor.user.id,
                    firstName: appointment.doctor.user.firstName,
                    lastName: appointment.doctor.user.lastName,
                    profilePicture: appointment.doctor.user.profilePicture,
                    speciality: appointment.doctor.speciality
                } : null,
                patient: appointment?.patient ? {
                    userId: appointment.patient.userId,
                    firstName: appointment.patient.firstName,
                    lastName: appointment.patient.lastName
                } : null
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getDoctorConversationsController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { prisma } = require("../index"); // Or wherever prisma is exported, actually it's in the service
        const { getDoctorConversations } = require("../services/chat.services");
        const { PrismaClient } = require("@prisma/client");
        const pc = new PrismaClient();
        
        const doctor = await pc.doctor.findUnique({ where: { userId } });
        if (!doctor) {
            res.status(404).json({ error: "Doctor profile not found" });
            return;
        }

        const convs = await getDoctorConversations(doctor.id);
        res.status(200).json(convs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
