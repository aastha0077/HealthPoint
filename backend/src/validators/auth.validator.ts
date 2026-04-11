import { z } from "zod";

export const signupSchema = z.object({
    email: z.string().email("Invalid email format"),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(["USER", "DOCTOR", "ADMIN"]).optional(),
    profilePicture: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
});
