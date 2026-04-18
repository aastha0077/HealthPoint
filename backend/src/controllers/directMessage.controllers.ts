import { Request, Response } from "express";
import * as directMessageService from "../services/directMessage.services";

export async function sendDirectMessageController(req: Request, res: Response) {
    try {
        const { receiverId, content, fileUrl, fileType } = req.body;
        const senderId = req.user?.id;

        if (!senderId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!receiverId || !content) {
            res.status(400).json({ error: "Missing receiverId or content" });
            return;
        }

        const message = await directMessageService.saveDirectMessage(
            senderId,
            parseInt(receiverId),
            content,
            fileUrl,
            fileType
        );
        res.status(201).json(message);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getDirectConversationsController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const conversations = await directMessageService.getDirectConversations(userId);
        res.status(200).json(conversations);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
export async function getDirectMessagesController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const targetId = parseInt(req.params.targetId);

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const messages = await directMessageService.getDirectMessages(userId, targetId);
        res.status(200).json(messages);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
