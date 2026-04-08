import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export async function uploadFileController(req: Request, res: Response): Promise<void> {
    try {
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        // The file is in req.file (from multer)
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "healthpoint",
            resource_type: "auto"
        });
        
        console.log(`[UploadController] Cloudinary Success:`, result.secure_url);

        // Delete local temp file
        fs.unlinkSync(req.file.path);

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
