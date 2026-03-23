import { Request, Response } from 'express';
import { getAdminAnalytics } from '../services/analytics.services';

export const getAnalyticsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await getAdminAnalytics();
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
