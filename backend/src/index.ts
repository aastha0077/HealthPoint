import dotenv from 'dotenv';
dotenv.config();

/// <reference path="./types/express.d.ts" />
import express, { json, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { setupChatSocket } from './sockets/chat.sockets';
import { authRouter } from './routes/auth.routes';
import { verifyUser, verifyAccessToken } from './middlewares/auth.middleware';
import { appointmentRoutes } from './routes/appointment.routes';
import { doctorRoutes } from './routes/doctor.routes';
import { departmentRoutes } from './routes/department.routes';
import { chatRoutes } from './routes/chat.routes';
import cors from 'cors';
import { patientRouter } from './routes/patient.routes';
import { analyticsRoutes } from './routes/analytics.routes';
import { notificationRoutes } from './routes/notification.routes';
import { favoriteRoutes } from './routes/favorite.routes';
import { reviewRoutes } from './routes/review.routes';
import { doctorAvailabilityRoutes } from './routes/doctorAvailability.routes';
import { pdfRoutes } from './routes/pdf.routes';
import { userRoutes } from './routes/user.routes';
import { uploadRouter } from './routes/upload.routes';
import { adminRouter } from './routes/admin.routes';
import { khaltiRoutes } from './routes/khalti.routes';
import { symptomRoutes } from './routes/symptom.routes';
import { initReminders } from './services/reminder.services';

// Load environment variables
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

const app = express();
const httpServer = createServer(app);
setupChatSocket(httpServer);

const PORT = process.env.PORT || 8000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// CORS setup
app.use(cors({
    origin: FRONTEND_ORIGIN, // frontend origin
    credentials: true        // allow cookies/auth headers
}));

// Middleware to parse JSON body
app.use(json());

// Welcome route
app.get('/welcome', (req: Request, res: Response) => {
    res.send("Welcome to Public United Lumbini Hospital");
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/upload', verifyAccessToken, uploadRouter);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/patients', patientRouter);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/doctor-availability', doctorAvailabilityRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRouter);
app.use('/api/khalti', khaltiRoutes);
app.use('/api/symptoms', symptomRoutes);

// start scheduled tasks
initReminders();

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});
// Start the server
httpServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT};`);
});



