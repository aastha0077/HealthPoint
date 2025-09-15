import { Router } from "express";
import { createDoctorController, getDoctorsController } from "../controllers/doctor.controllers";
const doctorRoutes = Router();

doctorRoutes.post('/', createDoctorController);

doctorRoutes.get('/:pageNumber/:pageSize', getDoctorsController);

export { doctorRoutes }