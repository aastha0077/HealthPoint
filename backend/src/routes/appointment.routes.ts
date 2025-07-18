import { Router } from "express";
import { createAppointmentController } from "../controllers/appointment.controllers";
const appointmentRoutes = Router();

appointmentRoutes.post('/:patientId', createAppointmentController)

export { appointmentRoutes }
