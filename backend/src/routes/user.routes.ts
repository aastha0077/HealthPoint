import { Router } from "express";
import { verifyAccessToken, authorizeRoles } from "../middlewares/auth.middleware";
import { getUserProfile, updateUserProfile, getAllUsersController } from "../controllers/user.controllers";

const userRoutes = Router();

userRoutes.get('/profile', verifyAccessToken, getUserProfile);
userRoutes.put('/profile', verifyAccessToken, updateUserProfile);
userRoutes.get('/all', verifyAccessToken, authorizeRoles("ADMIN"), getAllUsersController);

export { userRoutes };
