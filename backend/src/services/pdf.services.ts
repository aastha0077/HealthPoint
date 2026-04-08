import PDFDocument from "pdfkit";
import { PrismaClient } from "@prisma/client";
import { Response } from "express";

const prisma = new PrismaClient();

/**
 * --- GENERIC TABLE EXPORT ---
 * Generates a PDF containing a data table based on provided columns and rows.
 */
export const generateTablePDF = async (title: string, columns: string[], data: any[], res: Response) => {
    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
    const filename = `${title.toLowerCase().replace(/\s+/g, "_")}_export.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // Header
    doc.fillColor("#e11d48").fontSize(20).font("Helvetica-Bold").text("HealthPoint Medical Center", { align: "left" });
    doc.fillColor("#64748b").fontSize(10).font("Helvetica").text("System Data Export | Confidential", { align: "left" });
    doc.moveDown(1.5);
    
    doc.fillColor("#0f172a").fontSize(16).text(title.toUpperCase(), { align: "center" });
    doc.moveDown(2);

    // Table Logic
    const startY = doc.y;
    const startX = 40;
    const colWidth = (doc.page.width - 80) / columns.length;

    // Headers
    doc.rect(startX, startY, doc.page.width - 80, 25).fill("#f1f5f9");
    doc.fillColor("#475569").fontSize(10).font("Helvetica-Bold");

    columns.forEach((col, i) => {
        doc.text(col.toUpperCase(), startX + (i * colWidth) + 10, startY + 7, { width: colWidth - 10 });
    });

    // Rows
    let currentY = startY + 25;
    doc.font("Helvetica").fillColor("#334155");

    data.forEach((row, rowIndex) => {
        if (currentY > doc.page.height - 60) {
            doc.addPage({ layout: "landscape" });
            currentY = 40;
        }

        if (rowIndex % 2 === 0) {
            doc.rect(startX, currentY, doc.page.width - 80, 22).fill("#f8fafc");
        }
        
        doc.fillColor("#334155");
        columns.forEach((col, colIndex) => {
            const key = col.toLowerCase().replace(/\s+/g, "");
            let value = row[key] || row[col] || "";
            
            // Handle nested or formatted values
            if (typeof value === "object") value = value.name || value.id || "-";
            if (value instanceof Date) value = value.toLocaleDateString();

            doc.text(String(value), startX + (colIndex * colWidth) + 10, currentY + 6, { width: colWidth - 10 });
        });
        currentY += 22;
    });

    // Footer
    doc.fontSize(8).fillColor("#94a3b8").text(`Exported on ${new Date().toLocaleString()} | Page 1`, 40, doc.page.height - 30, { align: "center" });

    doc.end();
};

/**
 * --- FORMAL INVOICE GENERATION ---
 * Generates a professional invoice for an appointment.
 */
export const generateInvoicePDF = async (appointmentId: number, res: Response) => {
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

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const filename = `invoice_${apt.appointmentNumber}.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // 1. Header & Brand
    doc.fillColor("#e11d48").fontSize(26).font("Helvetica-Bold").text("HealthPoint", 50, 45);
    doc.fillColor("#1e293b").fontSize(10).font("Helvetica").text("MEDICAL SERVICES INVOICE", { align: "right" });
    
    doc.moveDown(0.5);
    doc.strokeColor("#f1f5f9").lineWidth(1).moveTo(50, 85).lineTo(545, 85).stroke();

    // 2. Info Grid
    doc.moveDown(4);
    const topY = 110;
    
    // Vendor Info
    doc.fontSize(10).font("Helvetica-Bold").text("FROM:", 50, topY);
    doc.font("Helvetica").text("HealthPoint Medical Center", 50, topY + 15);
    doc.text("Lumbini United, Nepal", 50, topY + 30);
    doc.text("VAT: 123456789", 50, topY + 45);

    // Client Info
    doc.font("Helvetica-Bold").text("BILL TO:", 350, topY);
    doc.font("Helvetica").text(`${apt.patient.firstName} ${apt.patient.lastName}`, 350, topY + 15);
    doc.text(`${apt.patient.municipality}, ${apt.patient.district}`, 350, topY + 30);
    doc.text(apt.patient.user.email, 350, topY + 45);

    // 3. Invoice Details Table
    doc.moveDown(6);
    const tableHeaderY = 220;
    
    doc.rect(50, tableHeaderY, 495, 25).fill("#0f172a");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
    doc.text("DESCRIPTION", 60, tableHeaderY + 8);
    doc.text("SERVICE PROVIDER", 200, tableHeaderY + 8);
    doc.text("DATE", 400, tableHeaderY + 8);
    doc.text("AMOUNT", 480, tableHeaderY + 8, { align: "right", width: 55 });

    // Table Row
    const rowY = tableHeaderY + 35;
    doc.fillColor("#1e293b").font("Helvetica").fontSize(10);
    doc.text(`${apt.department.name} Consultation`, 60, rowY);
    doc.text(`Dr. ${apt.doctor.user.firstName} ${apt.doctor.user.lastName}`, 200, rowY);
    doc.text(new Date(apt.dateTime).toLocaleDateString(), 400, rowY);
    
    const fee = apt.doctor.fee || 500; // Fallback if fee not in model
    doc.font("Helvetica-Bold").text(`Rs. ${fee}`, 480, rowY, { align: "right", width: 55 });

    doc.strokeColor("#f1f5f9").lineWidth(0.5).moveTo(50, rowY + 25).lineTo(545, rowY + 25).stroke();

    // 4. Totals
    const totalY = rowY + 60;
    doc.fontSize(10).fillColor("#64748b").text("Payment Method:", 350, totalY);
    doc.fillColor("#1e293b").text(apt.payment?.method || "Unpaid", 450, totalY, { align: "right", width: 85 });

    doc.moveDown(0.5);
    doc.fillColor("#64748b").text("Subtotal:", 350, doc.y);
    doc.fillColor("#1e293b").text(`Rs. ${fee}`, 450, doc.y, { align: "right", width: 85 });

    doc.moveDown(1);
    doc.rect(340, doc.y - 5, 215, 35).fill("#f1f5f9");
    doc.fillColor("#e11d48").fontSize(14).font("Helvetica-Bold").text("TOTAL DUE:", 350, doc.y + 7);
    doc.text(`Rs. ${fee}`, 450, doc.y, { align: "right", width: 85 });

    // 5. Status Stamp
    const isPaid = apt.payment?.status === "COMPLETED";
    if (isPaid) {
        doc.save();
        doc.rotate(-20, { origin: [150, 450] });
        doc.rect(100, 420, 120, 40).lineWidth(3).strokeColor("#22c55e").stroke();
        doc.fillColor("#22c55e").fontSize(20).font("Helvetica-Bold").text("PAID", 110, 430, { width: 100, align: "center" });
        doc.restore();
    }

    // 6. Footer
    const footerY = doc.page.height - 100;
    doc.fontSize(8).fillColor("#94a3b8").text("Note: This is a system-generated invoice for HealthPoint Medical Services. Please keep this for your records and medical history documentation.", 50, footerY, { align: "center", width: 495 });

    doc.end();
};

export const generateAppointmentPDF = async (appointmentId: number, res: any) => {
    // Keep internal for backward compatibility or refactor to invoice
    return generateInvoicePDF(appointmentId, res);
};
