import express, { json, Request, Response } from 'express';
import { authRouter } from './routes/auth.routes';
import dotenv from 'dotenv'
import { verifyUser } from './middlewares/auth.middleware';
import { appointmentRoutes } from './routes/appointment.routes';
import { doctorRoutes } from './routes/doctor.routes';
import { departmentRoutes } from './routes/department.routes';
import cors from 'cors'


dotenv.config();

const app = express()
// CORS setup
app.use(cors({
    origin: "http://localhost:5173", // frontend
    credentials: true               // allow cookies/auth headers
}));

app.use(json()); // parse JSON body


app.get('/welcome', function (req: Request, res: Response) {
    res.send("Welcome to Public United Lumbini Hospital")
})

app.get('/api/protected', verifyUser)

app.use('/api/auth', authRouter)

app.use('/api/appointments', appointmentRoutes)

app.use('/api/doctors', doctorRoutes)

app.use('/api/departments', departmentRoutes)

app.listen(8000, function () {
    console.log("Listening on port 8000;")
})




