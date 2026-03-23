import { Router } from "express";
const authRouter = Router();
import { loginController, signupController, refreshTokenController } from "../controllers/auth.controllers";


authRouter.post('/signup', signupController)
authRouter.post('/login', loginController)
authRouter.post('/refresh', refreshTokenController)


export { authRouter }
