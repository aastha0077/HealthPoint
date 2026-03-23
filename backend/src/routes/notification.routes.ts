import { Router } from 'express';
import { getUserNotificationsController, markReadController, markAllReadController } from '../controllers/notification.controllers';
import { verifyAccessToken } from '../middlewares/auth.middleware';

export const notificationRoutes = Router();

// all endpoints require user login
notificationRoutes.use(verifyAccessToken);

notificationRoutes.get('/', getUserNotificationsController);
notificationRoutes.put('/:id/read', markReadController);
notificationRoutes.put('/read-all', markAllReadController);
