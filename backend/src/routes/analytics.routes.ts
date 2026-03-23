import { Router } from 'express';
import { getAnalyticsController } from '../controllers/analytics.controllers';
import { verifyAccessToken, authorizeRoles } from '../middlewares/auth.middleware';

export const analyticsRoutes = Router();

analyticsRoutes.get('/', verifyAccessToken, authorizeRoles('ADMIN'), getAnalyticsController);
