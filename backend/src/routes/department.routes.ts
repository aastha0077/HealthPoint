import { Router } from "express";
import { 
    createDepartmentController, 
    getAllDepartmentController, 
    updateDepartmentController, 
    deleteDepartmentController 
} from "../controllers/department.controllers";
const departmentRoutes = Router();

departmentRoutes.post('/', createDepartmentController);
departmentRoutes.get('/', getAllDepartmentController);
departmentRoutes.put('/:id', updateDepartmentController);
departmentRoutes.delete('/:id', deleteDepartmentController);

export { departmentRoutes }