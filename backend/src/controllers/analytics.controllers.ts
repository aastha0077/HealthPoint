import { Request, Response } from 'express';
import { getAdminAnalytics } from '../services/analytics.services';

export const getAnalyticsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const period = (req.query.period as 'weekly' | 'monthly' | 'yearly') || 'monthly';
        const data = await getAdminAnalytics(period);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
