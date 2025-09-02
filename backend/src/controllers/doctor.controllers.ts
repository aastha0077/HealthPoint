import { Request, Response } from "express";
import { userService } from "../services/user.services";

async function createDoctorController(req: Request, res: Response) {
    try {
        const doctor = req.body
        console.log(doctor)
        const result = await userService.saveDoctor(doctor);
        res.send(result);
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: "Internal error occured"
        })
    }

}
export { createDoctorController } 