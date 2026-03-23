import { Request, Response } from 'express';
import { createNotification, getNotificationsForUser, markAsRead, markAllAsRead } from '../services/notification.services';

export const getUserNotificationsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
        const notifications = await getNotificationsForUser(userId);
        res.json(notifications);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const markReadController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const notification = await markAsRead(id);
        res.json(notification);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const markAllReadController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
        await markAllAsRead(userId);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
