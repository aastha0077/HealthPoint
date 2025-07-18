import { Request, Response } from "express";
import { LoginType, SignupType } from "../types/user.types";
import { userService } from "../services/user.services";

async function loginController(req: Request, res: Response) {
    const user: LoginType = req.body;
    const token = await userService.isValidUser(user);
    res.send({
        message: "Login Successfull",
        token: token
    })
}

async function signupController(req: Request, res: Response) {
    const user: SignupType = req.body;
    const result = await userService.saveUser(user)
    res.send({
        message: "Signup Successfull ",
        data: result
    });
}

export { loginController, signupController }


