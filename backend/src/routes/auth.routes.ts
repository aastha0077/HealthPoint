import { Router } from "express";
const authRouter = Router();
import { loginController, signupController, refreshTokenController } from "../controllers/auth.controllers";
import { validate } from "../middlewares/validate.middleware";
import { signupSchema, loginSchema, refreshTokenSchema } from "../validators/auth.validator";


authRouter.post('/signup', validate(signupSchema), signupController)
authRouter.post('/login', validate(loginSchema), loginController)
authRouter.post('/refresh', validate(refreshTokenSchema), refreshTokenController)


export { authRouter }
