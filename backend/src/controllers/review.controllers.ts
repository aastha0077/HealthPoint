import { Request, Response } from 'express';
import { createReview, getDoctorReviews, getDoctorAverageRating } from '../services/review.services';

export const submitReviewController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { doctorId, rating, comment, appointmentId } = req.body;

        if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
        if (!doctorId) { res.status(400).json({ error: "doctorId is required" }); return; }
        if (!rating || rating < 1 || rating > 5) { res.status(400).json({ error: "Rating must be between 1 and 5" }); return; }

        const review = await createReview(userId, Number(doctorId), rating, comment, appointmentId ? Number(appointmentId) : undefined);
        res.status(201).json(review);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getDoctorReviewsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctorId = parseInt(req.params.doctorId);
        const reviews = await getDoctorReviews(doctorId);
        const stats = await getDoctorAverageRating(doctorId);
        res.json({ reviews, stats });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
