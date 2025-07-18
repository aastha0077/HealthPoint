import express, { json, Request, Response } from 'express';
import { authRouter } from './routes/auth.routes';
import dotenv from 'dotenv'
import { verifyUser } from './middlewares/auth.middleware';
import { appointmentRoutes } from './routes/appointment.routes';
import { doctorRoutes } from './routes/doctor.routes';
import { departmentRoutes } from './routes/department.routes';
dotenv.config();

const app = express();
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

