import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';
import { Response } from 'express';

const prisma = new PrismaClient();

export const generateInvoice = async (appointmentId: number, res: Response) => {
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            patient: true,
            doctor: {
                include: {
                    user: true,
                    department: true
                }
            },
            payment: true
        }
    });

    if (!appointment) {
        throw new Error('Appointment not found');
    }

    const doc = new PDFDocument({ margin: 50 });

    // Stream the PDF to the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${appointment.appointmentNumber}.pdf`);
    doc.pipe(res);

    // Header
    doc.fillColor('#444444')
        .fontSize(25)
        .text('HealthPoint Medical Center', 50, 50)
        .fontSize(10)
        .text('123 Health Ave, Kathmandu, Nepal', 50, 80)
        .text('Phone: +977-1-4444444', 50, 95)
        .moveDown();

    // Line
    doc.moveTo(50, 115).lineTo(550, 115).stroke('#EEEEEE');

    // Invoice Meta
    doc.fontSize(20).text('INVOICE', 50, 140);
    doc.fontSize(10)
        .text(`Invoice Number: INV-${appointment.appointmentNumber}`, 50, 170)
        .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 185)
        .text(`Appointment Date: ${new Date(appointment.dateTime).toLocaleDateString()}`, 50, 200)
        .moveDown();

    // Bill To
    doc.fontSize(12).text('BILL TO:', 50, 230);
    doc.fontSize(10)
        .text(`${appointment.patient.firstName} ${appointment.patient.lastName}`, 50, 245)
        .text(`${appointment.patient.district}, ${appointment.patient.municipality}`, 50, 260)
        .text(`Ward No: ${appointment.patient.wardNo}`, 50, 275)
        .moveDown();

    // Doctor Info (Right Side)
    doc.fontSize(12).text('ATTENDING DOCTOR:', 350, 230);
    doc.fontSize(10)
        .text(`Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`, 350, 245)
        .text(`${appointment.doctor.speciality}`, 350, 260)
        .text(`${appointment.doctor.department.name}`, 350, 275)
        .moveDown();

    // Table Header
    const tableTop = 320;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Description', 50, tableTop);
    doc.text('Department', 250, tableTop);
    doc.text('Amount (NPR)', 450, tableTop, { align: 'right' });
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#EEEEEE');

    // Table Content
    const rowTop = tableTop + 30;
    doc.font('Helvetica');
    doc.text(`Clinical Consultation - #${appointment.appointmentNumber}`, 50, rowTop);
    doc.text(`${appointment.doctor.department.name}`, 250, rowTop);
    doc.text(`${appointment.payment?.amount?.toFixed(2) || '0.00'}`, 450, rowTop, { align: 'right' });

    // Footer
    const footerTop = 400;
    doc.moveTo(50, footerTop).lineTo(550, footerTop).stroke('#EEEEEE');
    
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Total Amount:', 350, footerTop + 20);
    doc.text(`NPR ${appointment.payment?.amount?.toFixed(2) || '0.00'}`, 450, footerTop + 20, { align: 'right' });

    doc.fontSize(10).font('Helvetica');
    doc.text('Payment Method:', 50, footerTop + 20);
    doc.text(`${appointment.payment?.method || 'Consultation Credit'}`, 150, footerTop + 20);
    doc.text('Payment Status:', 50, footerTop + 35);
    doc.text(`${appointment.payment?.status || 'PAID'}`, 150, footerTop + 35);

    doc.fontSize(10)
        .fillColor('#AAAAAA')
        .text('Thank you for choosing HealthPoint. Wishing you a speedy recovery.', 50, 700, { align: 'center', width: 500 });

    doc.end();
};
