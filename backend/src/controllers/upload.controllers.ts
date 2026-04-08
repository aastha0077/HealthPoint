import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export async function uploadFileController(req: Request, res: Response): Promise<void> {
    try {
        const files = req.files as
            | { [fieldname: string]: Express.Multer.File[] }
            | Express.Multer.File[]
            | undefined;

        const uploadedFile =
            req.file ||
            (Array.isArray(files) ? files[0] : files?.file?.[0] || files?.image?.[0]);

        if (!uploadedFile) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        const result = await cloudinary.uploader.upload(uploadedFile.path, {
            folder: "healthpoint",
            resource_type: "auto"
        });
        
        console.log(`[UploadController] Cloudinary Success:`, result.secure_url);

        // Delete local temp file
        fs.unlinkSync(uploadedFile.path);

        res.json({
            success: true,
            message: "File uploaded successfully to clinical storage",
            fileUrl: result.secure_url,
            metadata: {
                format: result.format,
                resource_type: result.resource_type,
                original_filename: result.original_filename,
                bytes: result.bytes
            }
        });
    } catch (error: any) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
}
