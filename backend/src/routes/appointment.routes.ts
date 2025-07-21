import { Router } from "express";
import { createAppointmentController, getAllAppointmentsController } from "../controllers/appointment.controllers";
const appointmentRoutes = Router();

appointmentRoutes.post('/:patientId/:doctorId', createAppointmentController)

appointmentRoutes.get('/', getAllAppointmentsController)

export { appointmentRoutes }
