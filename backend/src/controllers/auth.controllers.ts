import { Request, Response } from "express";
import { LoginType, SignupType } from "../types/user.types";
import { isValidUser, saveUser, refreshUserToken } from "../services/user.services";

async function loginController(req: Request, res: Response) {
    try {
        const user: LoginType = req.body;
        const result = await isValidUser(user);

        if (result?.success) {
            res.status(200).json({
                success: true,
                message: result.message,
                token: result.token,
                refreshToken: result.refreshToken,
                user: result.user
            });
            return;
        }
        res.status(401).json({
            success: false,
            message: result?.message
        });
        return;

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error occurred"
        });
        return;
    }
}

async function signupController(req: Request, res: Response) {
    try {
        const user: SignupType = req.body;
        const result = await saveUser(user)
        if (result.success) {
            res.status(201).json({
                message: result.message
            });
            return;
        }
        res.status(409).json({
            message: result.message
        })
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

async function refreshTokenController(req: Request, res: Response) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ success: false, message: "Refresh token is required" });
            return;
        }
        const result = await refreshUserToken(refreshToken);
        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message,
                token: result.token,
                refreshToken: result.refreshToken
            });
            return;
        }
        res.status(401).json({ success: false, message: result.message });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
        return;
    }
}

export { loginController, signupController, refreshTokenController }


