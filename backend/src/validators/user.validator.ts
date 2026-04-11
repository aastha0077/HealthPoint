import { z } from "zod";

export const updateUserProfileSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    profilePicture: z.string().optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
});
