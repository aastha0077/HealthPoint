import { Router } from "express";
import { createAppointmentController, getAllAppointmentsController, getUserAppointmentsController, cancelAppointmentController, completeAppointmentController, getDoctorBookedSlotsController, rescheduleAppointmentController, searchAppointmentByNumberController, addConsultationNotesController, getPatientHistoryController, startAppointmentController, checkInAppointmentController, getDoctorTodayAppointmentsController, getAppointmentInvoiceController, getDoctorStatsController, requestRefundController, getRefundStatusController } from "../controllers/appointment.controllers";
import { verifyAccessToken, authorizeRoles } from "../middlewares/auth.middleware";

const appointmentRoutes = Router();

// Get all appointments (Admin only ideally, or Admin/Doctor)

// Get all appointments (Admin only ideally, or Admin/Doctor)
appointmentRoutes.get('/', verifyAccessToken, authorizeRoles("ADMIN", "DOCTOR"), getAllAppointmentsController as any);

// Get user appointments
appointmentRoutes.get('/user', verifyAccessToken, getUserAppointmentsController as any);

// Get booked slots for a doctor on a specific date - PUBLIC
appointmentRoutes.get('/booked-slots/:doctorId', getDoctorBookedSlotsController as any);

// Doctor today's dashboard appointments
appointmentRoutes.get('/doctor/today', verifyAccessToken, authorizeRoles("DOCTOR"), getDoctorTodayAppointmentsController as any);

// Doctor stats
appointmentRoutes.get('/doctor/stats', verifyAccessToken, authorizeRoles("DOCTOR"), getDoctorStatsController as any);

// Cancel/Reschedule
appointmentRoutes.post('/:appointmentId/cancel', verifyAccessToken, cancelAppointmentController as any);
appointmentRoutes.post('/:appointmentId/reschedule', verifyAccessToken, rescheduleAppointmentController as any);

// Search appointment by number
appointmentRoutes.get('/search/:appointmentNumber', verifyAccessToken, authorizeRoles("ADMIN", "DOCTOR"), searchAppointmentByNumberController as any);

// Start appointment
appointmentRoutes.post('/:appointmentId/start', verifyAccessToken, authorizeRoles("ADMIN", "DOCTOR"), startAppointmentController as any);

// Patient check-in (Mark as arrived)
appointmentRoutes.post('/:appointmentId/check-in', verifyAccessToken, checkInAppointmentController as any);

// Complete appointment
appointmentRoutes.post('/:appointmentId/complete', verifyAccessToken, authorizeRoles("ADMIN", "DOCTOR"), completeAppointmentController as any);

// Consultation notes
appointmentRoutes.put('/:appointmentId/notes', verifyAccessToken, authorizeRoles("DOCTOR", "ADMIN"), addConsultationNotesController as any);

// Patient history
appointmentRoutes.get('/patient/:patientId/history', verifyAccessToken, authorizeRoles("DOCTOR", "ADMIN"), getPatientHistoryController as any);


// Invoice generation
appointmentRoutes.get('/:appointmentId/invoice', verifyAccessToken, getAppointmentInvoiceController as any);

// Refund request (user submits)
appointmentRoutes.post('/:appointmentId/refund-request', verifyAccessToken, requestRefundController as any);

// Refund status (user checks)
appointmentRoutes.get('/:appointmentId/refund-status', verifyAccessToken, getRefundStatusController as any);

// Create appointment - PUBLIC (for guest booking)
appointmentRoutes.post('/:patientId/:doctorId', createAppointmentController as any);

export { appointmentRoutes };
