import express, { json, Request, Response } from 'express';
import { authRouter } from './routes/auth.routes';
import dotenv from 'dotenv'
dotenv.config();
const app = express();
app.use(json())
app.get('/welcome', function (req: Request, res: Response) {
    res.send("Welcome to Public United Lumbini Hospital")
})


app.use('/auth', authRouter)

app.listen(9000, function () {
    console.log("Listening on port 9000;")
})

