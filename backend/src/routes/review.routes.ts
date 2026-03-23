import { Router } from 'express';
import { submitReviewController, getDoctorReviewsController } from '../controllers/review.controllers';
import { verifyAccessToken } from '../middlewares/auth.middleware';

export const reviewRoutes = Router();

reviewRoutes.post('/', verifyAccessToken, submitReviewController);
reviewRoutes.get('/doctor/:doctorId', getDoctorReviewsController);
