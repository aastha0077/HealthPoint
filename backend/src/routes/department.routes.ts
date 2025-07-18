import { Router } from "express";
import { createDepartmentController, getAllDepartmentController } from "../controllers/department.controllers";
const departmentRoutes = Router();

departmentRoutes.post('/', createDepartmentController);
departmentRoutes.get('/', getAllDepartmentController)

export { departmentRoutes }