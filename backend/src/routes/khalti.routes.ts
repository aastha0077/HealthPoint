import { Router } from "express";
import { verifyKhaltiPaymentController } from "../controllers/khalti.controllers";
import { verifyAccessToken } from "../middlewares/auth.middleware";

const khaltiRoutes = Router();

// /api/khalti/verify
khaltiRoutes.post('/verify', verifyKhaltiPaymentController as any);

export { khaltiRoutes };
