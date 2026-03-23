import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendAppointmentEmail = async (to: string, appointmentDetails: any, pdfBuffer?: Buffer) => {
    const { appointmentNumber, patientName, doctorName, dateTime, department } = appointmentDetails;

    const brandColor = "#e11d48";
    const bgSecondary = "#f8fafc";
    const textColor = "#1e293b";

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: ${bgSecondary};">
            <div style="background-color: ${brandColor}; padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Public Lumbini United</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 1.5px;">Medical Confirmation</p>
            </div>
            
            <div style="background-color: white; margin: -20px 20px 20px; padding: 40px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                <h2 style="color: ${textColor}; margin: 0 0 20px; font-size: 22px;">Hello ${patientName},</h2>
                <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Great news! Your medical appointment has been successfully scheduled. We look forward to seeing you.
                </p>
                
                <div style="background-color: ${bgSecondary}; border-radius: 12px; padding: 25px; border-left: 4px solid ${brandColor};">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase;">Appointment ID</td>
                            <td style="padding: 8px 0; color: ${brandColor}; font-size: 16px; font-weight: 800; text-align: right;">${appointmentNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Doctor</td>
                            <td style="padding: 12px 0; border-top: 1px solid #e2e8f0; color: ${textColor}; font-size: 14px; font-weight: 600; text-align: right;">Dr. ${doctorName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Speciality</td>
                            <td style="padding: 12px 0; border-top: 1px solid #e2e8f0; color: ${textColor}; font-size: 14px; font-weight: 600; text-align: right;">${department}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Date & Time</td>
                            <td style="padding: 12px 0; border-top: 1px solid #e2e8f0; color: ${textColor}; font-size: 14px; font-weight: 600; text-align: right;">${new Date(dateTime).toLocaleString()}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin-top: 35px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Please bring a digital or printed copy of the attached summary.</p>
                </div>
            </div>
            
            <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
                <p style="margin: 0;">Public Lumbini United Medical Center | Resunga, Gulmi</p>
                <div style="margin-top: 10px;">
                    <a href="#" style="color: ${brandColor}; text-decoration: none; margin: 0 10px;">Our Services</a>
                    <a href="#" style="color: ${brandColor}; text-decoration: none; margin: 0 10px;">Contact Support</a>
                </div>
            </div>
        </div>
    `;

    const mailOptions: any = {
        from: `"Public Lumbini United" <${process.env.SMTP_USER}>`,
        to: to,
        subject: `Appointment Confirmation: ${appointmentNumber}`,
        html: htmlContent
    };

    if (pdfBuffer) {
        mailOptions.attachments = [
            {
                filename: `appointment_${appointmentNumber}.pdf`,
                content: pdfBuffer
            }
        ];
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const sendNotificationEmail = async (to: string, subject: string, message: string) => {
    const brandColor = "#e11d48";
    const bgSecondary = "#f8fafc";
    const textColor = "#1e293b";

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: ${bgSecondary};">
            <div style="background-color: ${brandColor}; padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Public Lumbini United</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 1.5px;">Update Notification</p>
            </div>
            
            <div style="background-color: white; margin: -20px 20px 20px; padding: 40px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                <h2 style="color: ${textColor}; margin: 0 0 20px; font-size: 22px;">Important Update,</h2>
                <div style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    ${message}
                </div>
                
                <div style="margin-top: 35px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">If you have any questions, please contact our support team.</p>
                </div>
            </div>
            
            <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
                <p style="margin: 0;">Public Lumbini United Medical Center | Resunga, Gulmi</p>
                <div style="margin-top: 10px;">
                    <a href="#" style="color: ${brandColor}; text-decoration: none; margin: 0 10px;">Our Services</a>
                    <a href="#" style="color: ${brandColor}; text-decoration: none; margin: 0 10px;">Contact Support</a>
                </div>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"Public Lumbini United" <${process.env.SMTP_USER}>`,
        to: to,
        subject: subject,
        text: message,
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending notification email:', error);
    }
};
