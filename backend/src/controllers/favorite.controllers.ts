import { Request, Response } from 'express';
import { toggleFavorite, getFavorites } from '../services/favorite.services';

export const toggleFavoriteController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const doctorId = parseInt(req.params.doctorId);
        if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

        const result = await toggleFavorite(userId, doctorId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getFavoritesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

        const list = await getFavorites(userId);
        res.json(list);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
