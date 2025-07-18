import { Router } from "express";
import { createDoctorController } from "../controllers/doctor.controllers";
const doctorRoutes = Router();

doctorRoutes.post('/', createDoctorController);

export { doctorRoutes }