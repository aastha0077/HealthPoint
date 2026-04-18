import { z } from "zod";

export const createDoctorSchema = z.object({
    email: z.string().email("Invalid email format"),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    speciality: z.string().min(2, "Speciality is required"),
    departmentId: z.number().int().positive("Invalid department ID"),
    bio: z.string().optional(),
    profilePicture: z.string().optional(),
    timeSlots: z.array(z.string()).optional(),
});

export const updateDoctorSchema = z.object({
    email: z.string().email("Invalid email format").optional().nullable().or(z.literal("")),
    firstName: z.string().min(2).optional().nullable().or(z.literal("")),
    lastName: z.string().min(2).optional().nullable().or(z.literal("")),
    password: z.string().min(6).or(z.literal("")).optional().nullable(),
    speciality: z.string().min(2).optional().nullable().or(z.literal("")),
    departmentId: z.union([z.number(), z.string()]).optional().nullable(),
    bio: z.string().optional().nullable().or(z.literal("")),
    profilePicture: z.string().optional().nullable().or(z.literal("")),
    timeSlots: z.array(z.string()).optional().nullable(),
});
