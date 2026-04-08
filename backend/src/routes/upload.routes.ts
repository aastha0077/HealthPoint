import { Router } from "express";
import multer from "multer";
import { uploadFileController } from "../controllers/upload.controllers";

const uploadRouter = Router();

// Temp storage for multer
const upload = multer({ dest: "uploads/" });

uploadRouter.post(
    "/",
    upload.fields([
        { name: "file", maxCount: 1 },
        { name: "image", maxCount: 1 }
    ]),
    uploadFileController
);

export { uploadRouter };
