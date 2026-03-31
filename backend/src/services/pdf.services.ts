import PDFDocument from "pdfkit";
import { PrismaClient } from "@prisma/client";
import { Writable } from "stream";

const prisma = new PrismaClient();

export const generateAppointmentPDF = async (appointmentId: number, res: any) => {
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            doctor: { include: { user: true, department: true } },
            patient: { include: { user: true } },
            department: true,
            payment: true
        }
    });

    if (!appointment) throw new Error("Appointment not found");
    const apt = appointment as any;

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Disposition", `attachment; filename=appointment_${apt.appointmentNumber}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);
    buildPDFContent(doc, apt);
    doc.end();
};

export const getAppointmentPDFBuffer = async (appointmentId: number): Promise<Buffer> => {
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            doctor: { include: { user: true, department: true } },
            patient: { include: { user: true } },
            department: true,
            payment: true
        }
    });

    if (!appointment) throw new Error("Appointment not found");
    const apt = appointment as any;

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: any[] = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        buildPDFContent(doc, apt);
        doc.end();
    });
};

const buildPDFContent = (doc: PDFKit.PDFDocument, apt: any) => {
    // --- Header ---
    doc.fillColor("#e11d48").fontSize(24).text("HealthPoint Medical Center", { align: "center" });
    doc.fillColor("#64748b").fontSize(10).text("Specialized Healthcare & Clinical Excellence", { align: "center" });
    doc.text("Phone: +977-9849000000 | Email: care@healthpoint.com", { align: "center" });

    doc.moveDown(1.5);
    doc.strokeColor("#f1f5f9").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1.5);

    // --- Title ---
    doc.fillColor("#0f172a").fontSize(16).text("APPOINTMENT SUMMARY", { align: "center", underline: true });
    doc.moveDown(2);

    // --- Appointment Info ---
    const startX = 50;
    const col2X = 300;

    doc.fontSize(12).fillColor("#000000");

    // Left column
    doc.font("Helvetica-Bold").text("Patient Details", startX);
    doc.font("Helvetica").fontSize(10).moveDown(0.5);
    doc.text(`Name: ${apt.patient.firstName} ${apt.patient.lastName}`);
    doc.text(`Gender: ${apt.patient.gender}`);
    doc.text(`Location: ${apt.patient.municipality}, ${apt.patient.district}`);

    // Right column
    doc.y = 188; // Reset Y to match patient details start
    doc.font("Helvetica-Bold").fontSize(12).text("Schedule Details", col2X);
    doc.font("Helvetica").fontSize(10).moveDown(0.5);
    doc.fillColor("#e11d48").font("Helvetica-Bold").text(`Appt No: ${apt.appointmentNumber}`);
    doc.fillColor("#000000").font("Helvetica").text(`Date: ${new Date(apt.dateTime).toLocaleDateString()}`);
    doc.text(`Time: ${new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    doc.text(`Status: ${apt.status}`);

    doc.moveDown(2.5);

    // Medical Info
    doc.y = 285;
    doc.font("Helvetica-Bold").fontSize(12).text("Doctor & Department", startX);
    doc.font("Helvetica").fontSize(10).moveDown(0.5);
    doc.text(`Doctor: Dr. ${apt.doctor.user.firstName} ${apt.doctor.user.lastName}`);
    doc.text(`Speciality: ${apt.doctor.speciality}`);
    doc.text(`Department: ${apt.doctor.department.name}`);

    // Payment Info
    doc.y = 285;
    doc.font("Helvetica-Bold").fontSize(12).text("Payment Information", col2X);
    doc.font("Helvetica").fontSize(10).moveDown(0.5);
    doc.text(`Method: ${apt.payment?.method || 'N/A'}`);
    doc.text(`Status: ${apt.payment?.status || 'PENDING'}`);
    if (apt.payment?.transactionId) doc.text(`Transaction ID: ${apt.payment.transactionId}`);

    // --- Footer ---
    doc.moveDown(5);
    doc.strokeColor("#f1f5f9").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fillColor("#94a3b8").fontSize(9).text("This is an electronically generated document. No signature required.", { align: "center" });
    doc.moveDown(0.5);
    doc.fillColor("#0f172a").fontSize(10).font("Helvetica-Bold").text("Thank you for choosing HealthPoint Medical Center.", { align: "center" });
};
