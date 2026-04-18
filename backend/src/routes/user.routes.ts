import { Router } from "express";
import { verifyAccessToken, authorizeRoles } from "../middlewares/auth.middleware";
import { getUserProfile, updateUserProfile, getAllUsersController, getStaffUsersController } from "../controllers/user.controllers";
import { validate } from "../middlewares/validate.middleware";
import { updateUserProfileSchema } from "../validators/user.validator";

const userRoutes = Router();

userRoutes.get('/profile', verifyAccessToken, getUserProfile);
userRoutes.put('/profile', verifyAccessToken, validate(updateUserProfileSchema), updateUserProfile);
userRoutes.get('/all', verifyAccessToken, authorizeRoles("ADMIN"), getAllUsersController);
userRoutes.get('/staff', verifyAccessToken, authorizeRoles("ADMIN", "DOCTOR"), getStaffUsersController);

export { userRoutes };
