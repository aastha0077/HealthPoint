import { Request, Response } from "express";
import { appointmentService } from "../services/appointment.services";

async function createAppointmentController(req: Request, res: Response) {
    const patientId = parseInt(req.params.patientId);
    const doctorId = parseInt(req.params.doctorId);
    const result = await appointmentService.createAppointment(patientId, doctorId, '2082')
    res.send(result);
}


export { createAppointmentController }