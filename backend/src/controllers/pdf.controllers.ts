import { Request, Response } from 'express';
import { generateAppointmentPDF, generateTablePDF, generateInvoicePDF } from '../services/pdf.services';

export const downloadAppointmentPDF = async (req: Request, res: Response): Promise<void> => {
    try {
        const appointmentId = parseInt(req.params.id);
        await generateAppointmentPDF(appointmentId, res);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const downloadInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
        const appointmentId = parseInt(req.params.id);
        await generateInvoicePDF(appointmentId, res);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const exportTableData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, columns, data } = req.body;
        if (!title || !columns || !data) {
            res.status(400).json({ error: "Missing title, columns or data" });
            return;
        }
        await generateTablePDF(title, columns, data, res);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
