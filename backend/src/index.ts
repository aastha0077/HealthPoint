import express, { json, Request, Response } from 'express';
import { authRouter } from './routes/auth.routes';
import dotenv from 'dotenv'
import { verifyUser } from './middlewares/auth.middleware';
import { appointmentRoutes } from './routes/appointment.routes';
import { doctorRoutes } from './routes/doctor.routes';
import { departmentRoutes } from './routes/department.routes';
import cors from "cors"

// Define CORS options (optional, but recommended for security)
// const corsOptions = {
//     origin: 'http://localhost:5173', // Replace with your frontend URL
//     credentials: true, // Allow cookies or authentication headers
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed HTTP methods
//     allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
//   };

dotenv.config();



const app = express();
// app.use(cors());       // Enable CORS
// app.options('*', cors(corsOptions)); // Handle preflight
app.use(json())

app.get('/welcome', function (req: Request, res: Response) {
    res.send("Welcome to Public United Lumbini Hospital")
})

app.get('/protected', verifyUser)

app.use('/auth', authRouter)

app.use('/appointment', appointmentRoutes)

app.use('/doctor', doctorRoutes)

app.use('/department', departmentRoutes)

app.listen(9000, function () {
    console.log("Listening on port 9000;")
})

