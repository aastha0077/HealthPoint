import { Router } from 'express';
import { downloadAppointmentPDF } from '../controllers/pdf.controllers';

export const pdfRoutes = Router();

// Endpoint returning PDF file, likely secured by access token
pdfRoutes.get('/appointment/:id', downloadAppointmentPDF);
