import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, ZodIssue } from "zod";

export const validate = (schema: ZodSchema<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                console.error("[Validation Error]", JSON.stringify(error.issues, null, 2));
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.issues.map((err: ZodIssue) => ({
                        path: err.path.join("."),
                        message: err.message
                    }))
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: "Internal server error during validation"
            });
        }
    };
};
