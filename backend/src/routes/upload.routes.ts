import { Router } from "express";
import multer from "multer";
import { uploadFileController } from "../controllers/upload.controllers";

const uploadRouter = Router();

// Temp storage for multer
const upload = multer({ dest: "uploads/" });

uploadRouter.post("/", upload.single("file"), uploadFileController);

export { uploadRouter };
