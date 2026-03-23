import { Request, Response } from 'express';
import { generateAppointmentPDF } from '../services/pdf.services';

export const downloadAppointmentPDF = async (req: Request, res: Response): Promise<void> => {
    try {
        const appointmentId = parseInt(req.params.id);

        // This writes directly to the Express standard response object as a file download.
        await generateAppointmentPDF(appointmentId, res);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
