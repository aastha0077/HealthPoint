import { Router } from 'express';
import { downloadAppointmentPDF, exportTableData, downloadInvoice } from '../controllers/pdf.controllers';
import { verifyAccessToken } from '../middlewares/auth.middleware';

export const pdfRoutes = Router();

// Appointment Summary
pdfRoutes.get('/appointment/:id', verifyAccessToken, downloadAppointmentPDF);

// Formal Invoice
pdfRoutes.get('/invoice/:id', verifyAccessToken, downloadInvoice);

// Generic Table Export (Admin/Doctor)
pdfRoutes.post('/table-export', verifyAccessToken, exportTableData);
