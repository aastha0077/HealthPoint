import { Router } from "express";
import { 
    getConversationController, 
    askGeminiController, 
    getAppointmentChatController, 
    getDoctorConversationsController, 
    clearChatHistoryController 
} from "../controllers/chat.controllers";
import { 
    createGroupController, 
    getMyGroupsController, 
    sendGroupMessageController, 
    getGroupMessagesController,
    deleteGroupController,
    removeMemberController,
    addMemberController 
} from "../controllers/groupChat.controllers";
import { 
    sendDirectMessageController, 
    getDirectConversationsController,
    getDirectMessagesController
} from "../controllers/directMessage.controllers";
import { verifyAccessToken } from "../middlewares/auth.middleware";

const chatRoutes = Router();

// Chat between doctor and patient (appointment based)
chatRoutes.get('/appointment/:appointmentId', verifyAccessToken, getAppointmentChatController as any);
chatRoutes.delete('/appointment/:appointmentId', verifyAccessToken, clearChatHistoryController as any);

// Direct Personal Messages (Chat between Doctor/Doctor or Admin/Doctor)
chatRoutes.get('/conversation/:targetId', verifyAccessToken, getDirectMessagesController);
chatRoutes.post('/direct/send', verifyAccessToken, sendDirectMessageController);
chatRoutes.get('/direct/conversations', verifyAccessToken, getDirectConversationsController);

// Group Chat Routes
chatRoutes.post('/groups', verifyAccessToken, createGroupController);
chatRoutes.get('/groups', verifyAccessToken, getMyGroupsController);
chatRoutes.get('/groups/:groupId/messages', verifyAccessToken, getGroupMessagesController);
chatRoutes.post('/groups/:groupId/messages', verifyAccessToken, sendGroupMessageController);
chatRoutes.delete('/groups/:groupId', verifyAccessToken, deleteGroupController as any);
chatRoutes.post('/groups/:groupId/members', verifyAccessToken, addMemberController as any);
chatRoutes.delete('/groups/:groupId/members/:userId', verifyAccessToken, removeMemberController as any);


// Get list of conversations for a doctor
chatRoutes.get('/conversations', verifyAccessToken, getDoctorConversationsController);

// Chat with Gemini bot
chatRoutes.post('/gemini', askGeminiController); // No auth required, maybe open to guests

export { chatRoutes };
