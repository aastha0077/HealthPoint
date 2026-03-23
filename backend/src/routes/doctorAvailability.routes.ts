import { Router } from 'express';
import { setDoctorAvailabilityController, getDoctorAvailabilityController } from '../controllers/doctorAvailability.controllers';
import { verifyAccessToken, authorizeRoles } from '../middlewares/auth.middleware';

export const doctorAvailabilityRoutes = Router();

doctorAvailabilityRoutes.post('/', verifyAccessToken, authorizeRoles('DOCTOR'), setDoctorAvailabilityController);
doctorAvailabilityRoutes.get('/:doctorId', getDoctorAvailabilityController);
