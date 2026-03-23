import { Doctor, User } from "@prisma/client"
interface LoginType {
    email: string
    password: string
}

interface SignupType {
    email: string
    firstName: string,
    lastName: string,
    password: string,
    contactNumber?: string,
    address?: string
    role?: string
    profilePicture?: string
}

type DoctorType = User & Doctor & { timeSlots: string[] }


export { LoginType, SignupType, DoctorType }