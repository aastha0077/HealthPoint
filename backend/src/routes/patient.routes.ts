import { Router, Request, Response, NextFunction } from "express";
import { createPatientController, getMyPatientsController, getAllPatientsController } from "../controllers/patient.controller";
import { verifyAccessToken, authorizeRoles } from "../middlewares/auth.middleware";
import jwt from "jsonwebtoken";

const patientRouter = Router();

// Optional auth: tries to verify token, but falls back to guest if none/invalid
function optionalAuth(req: Request, res: Response, next: NextFunction): void {
    if (!req.headers.authorization) {
        return next();
    }
    // Mock the response object to intercept the 401 from verifyAccessToken if token is bad
    const mockRes = {
        status: () => ({ json: () => next() })
    } as unknown as Response;
    
    // Will call next() on success, or mockRes.status().json() (which calls next()) on failure
    verifyAccessToken(req, mockRes, next);
}

// Create patient - works for both authenticated users and guests
patientRouter.post('/', optionalAuth, createPatientController);

// Authenticated patient routes
patientRouter.get('/my-patients', verifyAccessToken, getMyPatientsController);
patientRouter.get('/all', verifyAccessToken, authorizeRoles("ADMIN"), getAllPatientsController);

export { patientRouter };