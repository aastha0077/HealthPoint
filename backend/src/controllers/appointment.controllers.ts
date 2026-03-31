import { Request, Response, RequestHandler } from "express";
import { createNewAppointment, getAllAppointments, getUserAppointments, cancelAppointment, completeAppointment, getDoctorBookedSlots, rescheduleAppointment, getAppointmentByNumber, addConsultationNotes, getPatientHistory, startAppointment, checkInAppointment, getDoctorTodayAppointments, getDoctorStats } from "../services/appointment.services";
import { generateInvoice } from "../services/invoice.services";

const getAppointmentInvoiceController: RequestHandler = async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.appointmentId);
        if (isNaN(appointmentId)) {
            res.status(400).json({ error: "Invalid appointmentId" });
            return;
        }

        await generateInvoice(appointmentId, res as Response);
    } catch (error: any) {
        console.error(`[InvoiceController] Error:`, error.message);
        res.status(404).json({ error: error.message || "Failed to generate invoice" });
    }
}

const createAppointmentController: RequestHandler = async (req, res) => {
    try {
        const patientId = parseInt(req.params.patientId);
        const doctorId = parseInt(req.params.doctorId);
        const { dateTime, paymentMethod, transactionId } = req.body;

        console.log(`[CreateAppointment] Request for Patient: ${patientId}, Doctor: ${doctorId}`);
        console.log(`[CreateAppointment] Body:`, req.body);

        if (!dateTime) {
            console.error("[CreateAppointment] Missing dateTime");
            res.status(400).json({ error: "Missing dateTime in body" });
            return;
        }
        if (isNaN(patientId) || isNaN(doctorId)) {
            console.error(`[CreateAppointment] Invalid IDs - Patient: ${req.params.patientId}, Doctor: ${req.params.doctorId}`);
            res.status(400).json({ error: "Invalid patientId or doctorId" });
            return;
        }

        const result = await createNewAppointment(patientId, doctorId, dateTime, paymentMethod, transactionId);
        console.log(`[CreateAppointment] Success:`, result.id);
        res.status(201).json(result);
    } catch (error: any) {
        console.error(`[CreateAppointment] Error:`, error.message);
        res.status(400).json({ error: error.message });
    }
}

const getAllAppointmentsController: RequestHandler = async (req, res) => {
    try {
        const user = (req as any).user;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        let appointments;
        let total = 0;

        if (user?.role === 'DOCTOR') {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });

            if (!doctor) {
                res.status(404).json({ error: "Doctor profile not found" });
                return;
            }

            total = await prisma.appointment.count({ where: { doctorId: doctor.id } });
            const results = await prisma.appointment.findMany({
                where: { doctorId: doctor.id },
                include: { doctor: { include: { user: true } }, patient: true, department: true },
                orderBy: { dateTime: 'desc' },
                skip,
                take: limit
            });
            // Doctors should not see recording URL
            appointments = results.map((appt: any) => {
                const { audioRecordingUrl, ...rest } = appt;
                return rest;
            });
        } else if (user?.role === 'ADMIN') {
            const results = await getAllAppointments();
            total = results.length;
            // Admins should not see recording URL
            appointments = results.map((appt: any) => {
                const { audioRecordingUrl, ...rest } = appt;
                return rest;
            });
        } else {
            appointments = await getAllAppointments();
            total = appointments.length;
        }

        res.status(200).json({
            appointments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

const getUserAppointmentsController: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id; // Assumes verifyAccessToken attaches user.id
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const appointments = await getUserAppointments(userId);
        res.status(200).json(appointments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

const cancelAppointmentController: RequestHandler = async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.appointmentId);
        if (isNaN(appointmentId)) {
            res.status(400).json({ error: "Invalid appointment ID" });
            return;
        }
        const result = await cancelAppointment(appointmentId);
        res.status(200).json({ message: "Appointment cancelled successfully", result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

const completeAppointmentController: RequestHandler = async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.appointmentId);
        const { consultationDuration, audioRecordingUrl } = req.body;
        const result = await completeAppointment(appointmentId, consultationDuration, audioRecordingUrl);
        res.status(200).json({ message: "Appointment marked completed", result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}
const getDoctorBookedSlotsController: RequestHandler = async (req, res) => {
    try {
        const doctorId = parseInt(req.params.doctorId);
        const { date } = req.query;

        if (!date || isNaN(doctorId)) {
            res.status(400).json({ error: "Missing date or invalid doctorId" });
            return;
        }

        const bookedSlots = await getDoctorBookedSlots(doctorId, date as string);
        res.status(200).json(bookedSlots);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

const rescheduleAppointmentController: RequestHandler = async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.appointmentId);
        const { newDateTime } = req.body;
        if (!newDateTime || isNaN(appointmentId)) {
            res.status(400).json({ error: "Missing new date/time or invalid appointment ID" });
            return;
        }
        const result = await rescheduleAppointment(appointmentId, newDateTime);
        res.status(200).json({ message: "Appointment rescheduled successfully", result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

const searchAppointmentByNumberController: RequestHandler = async (req, res) => {
    try {
        const { appointmentNumber } = req.params;
        const user = req.user;
        const result = await getAppointmentByNumber(appointmentNumber);
        if (!result) {
            res.status(404).json({ error: "Appointment not found" });
            return;
        }

        // Only the patient who owns the appointment can see recording
        // Check if user is the patient associated with this appointment
        const isPatientOwner = user?.role === 'USER' && result.patient?.userId === user.id;
        
        if (!isPatientOwner) {
            const { audioRecordingUrl, ...rest } = result;
            res.status(200).json(rest);
            return;
        }

        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

const addConsultationNotesController: RequestHandler = async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.appointmentId);
        const { symptoms, diagnosis, treatment, additionalNotes, documents } = req.body;
        if (isNaN(appointmentId)) {
            res.status(400).json({ error: "Invalid appointment ID" });
            return;
        }
        const updated = await addConsultationNotes(appointmentId, { symptoms, diagnosis, treatment, additionalNotes, documents });
        res.status(200).json({ message: "Consultation notes added successfully", updated });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

const getPatientHistoryController: RequestHandler = async (req, res) => {
    try {
        const patientId = parseInt(req.params.patientId);
        if (isNaN(patientId)) {
            res.status(400).json({ error: "Invalid patient ID" });
            return;
        }
        const history = await getPatientHistory(patientId);
        // Doctors/Admins fetching history should not see recordings
        const filteredHistory = history.map((appt: any) => {
            const { audioRecordingUrl, ...rest } = appt;
            return rest;
        });
        res.status(200).json(filteredHistory);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

const startAppointmentController: RequestHandler = async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.appointmentId);
        const result = await startAppointment(appointmentId);
        res.status(200).json({ message: "Appointment started successfully", result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

const checkInAppointmentController: RequestHandler = async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.appointmentId);
        const result = await checkInAppointment(appointmentId);
        res.status(200).json({ message: "Checked in successfully", result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

const getDoctorTodayAppointmentsController: RequestHandler = async (req, res) => {
    try {
        const user = req.user;
        if (user?.role !== 'DOCTOR') {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });

        if (!doctor) {
            res.status(404).json({ error: "Doctor profile not found" });
            return;
        }

        const appointments = await getDoctorTodayAppointments(doctor.id);
        // Doctors should not see recording URL
        const filteredAppointments = appointments.map((appt: any) => {
            const { audioRecordingUrl, ...rest } = appt;
            return rest;
        });
        res.status(200).json(filteredAppointments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

const getDoctorStatsController: RequestHandler = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'DOCTOR') {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });

        if (!doctor) {
            res.status(404).json({ error: "Doctor profile not found" });
            return;
        }

        const stats = await getDoctorStats(doctor.id);
        res.status(200).json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

const requestRefundController: RequestHandler = async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.appointmentId);
        const { reason, bankName, accountNumber, accountHolderName } = req.body;

        if (isNaN(appointmentId)) {
            res.status(400).json({ error: "Invalid appointment ID" });
            return;
        }
        if (!reason) {
            res.status(400).json({ error: "Reason is required" });
            return;
        }

        const { requestRefund } = require("../services/appointment.services");
        const result = await requestRefund(appointmentId, { reason, bankName, accountNumber, accountHolderName });
        res.status(201).json({ message: "Refund request submitted successfully", result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

const getRefundStatusController: RequestHandler = async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.appointmentId);
        if (isNaN(appointmentId)) {
            res.status(400).json({ error: "Invalid appointment ID" });
            return;
        }

        const { getRefundStatus } = require("../services/appointment.services");
        const result = await getRefundStatus(appointmentId);
        if (!result) {
            res.status(200).json(null);
            return;
        }
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export { 
    createAppointmentController, 
    getAllAppointmentsController, 
    getUserAppointmentsController, 
    cancelAppointmentController, 
    completeAppointmentController, 
    getDoctorBookedSlotsController, 
    rescheduleAppointmentController, 
    searchAppointmentByNumberController, 
    addConsultationNotesController, 
    getPatientHistoryController, 
    startAppointmentController, 
    checkInAppointmentController, 
    getDoctorTodayAppointmentsController,
    getAppointmentInvoiceController,
    getDoctorStatsController,
    requestRefundController,
    getRefundStatusController
}