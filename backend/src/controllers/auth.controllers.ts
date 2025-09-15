import { Request, Response } from "express";
import { LoginType, SignupType } from "../types/user.types";
import { userService } from "../services/user.services";

async function loginController(req: Request, res: Response) {
    try {
        const user: LoginType = req.body;
        const result = await userService.isValidUser(user);
        console.log(result)
        if (result?.success) {
            res.json({
                message: result.message,
                token: result?.token
            })
        }

        res.send({ "message": result?.message })

    }
    catch (error) {
        console.log(error)
        res.status(500).send({ "message": "internal server error occurred" })
    }
}

async function signupController(req: Request, res: Response) {
    try {
        const user: SignupType = req.body;
        console.log("user")
        console.log(user)
        const result = await userService.saveUser(user)
        if (result.success) {
            res.status(201).json({
                message: result.message
            });
        }
        res.status(409).json({
            message: result.message
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { loginController, signupController }


