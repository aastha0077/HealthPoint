import { Router } from "express";
import { getConversationController, askGeminiController, getAppointmentChatController, getDoctorConversationsController, clearChatHistoryController } from "../controllers/chat.controllers";
import { verifyAccessToken } from "../middlewares/auth.middleware";

const chatRoutes = Router();

// Chat between doctor and patient (general)
chatRoutes.get('/conversation/:otherUserId', verifyAccessToken, getConversationController);

// Chat for a specific appointment
chatRoutes.get('/appointment/:appointmentId', verifyAccessToken, getAppointmentChatController as any);
chatRoutes.delete('/appointment/:appointmentId', verifyAccessToken, clearChatHistoryController as any);

// Get list of conversations for a doctor
chatRoutes.get('/conversations', verifyAccessToken, getDoctorConversationsController);

// Chat with Gemini bot
chatRoutes.post('/gemini', askGeminiController); // No auth required, maybe open to guests

export { chatRoutes };
