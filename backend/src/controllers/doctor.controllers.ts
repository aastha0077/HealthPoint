import { Request, Response } from "express";
import { userService } from "../services/user.services";

async function createDoctorController(req: Request, res: Response) {
    const doctor = req.body
    const result = await userService.saveDoctor(doctor);
    res.send(result);

}


export { createDoctorController }