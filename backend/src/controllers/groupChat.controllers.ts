import { Request, Response } from "express";
import * as groupChatService from "../services/groupChat.services";

export async function createGroupController(req: Request, res: Response) {
    try {
        const { name, description, memberIds } = req.body;
        const creatorId = req.user?.id;

        if (!creatorId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        if (!name || !Array.isArray(memberIds)) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        const group = await groupChatService.createChatGroup(name, description, creatorId, memberIds);
        res.status(201).json(group);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getMyGroupsController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const groups = await groupChatService.getMyGroups(userId);
        res.status(200).json(groups);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function sendGroupMessageController(req: Request, res: Response) {
    try {
        const { groupId } = req.params;
        const { content, fileUrl, fileType } = req.body;
        const senderId = req.user?.id;

        if (!senderId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!content) {
            res.status(400).json({ error: "Content is required" });
            return;
        }

        const message = await groupChatService.sendGroupMessage(
            parseInt(groupId),
            senderId,
            content,
            fileUrl,
            fileType
        );
        res.status(201).json(message);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getGroupMessagesController(req: Request, res: Response) {
    try {
        const { groupId } = req.params;
        const messages = await groupChatService.getGroupMessages(parseInt(groupId));
        res.status(200).json(messages);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteGroupController(req: Request, res: Response) {
    try {
        const { groupId } = req.params;
        const adminId = req.user?.id;
        if (!adminId) return res.status(401).json({ error: "Unauthorized" });

        const result = await groupChatService.deleteChatGroup(parseInt(groupId), adminId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function addMemberController(req: Request, res: Response) {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const adminId = req.user?.id;
        if (!adminId) return res.status(401).json({ error: "Unauthorized" });

        const result = await groupChatService.addGroupMember(parseInt(groupId), parseInt(userId), adminId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function removeMemberController(req: Request, res: Response) {
    try {
        const { groupId, userId } = req.params;
        const adminId = req.user?.id;
        if (!adminId) return res.status(401).json({ error: "Unauthorized" });

        const result = await groupChatService.removeGroupMember(parseInt(groupId), parseInt(userId), adminId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
