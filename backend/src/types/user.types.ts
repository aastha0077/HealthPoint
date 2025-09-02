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
    contactNumber: string,
    district: string
    municipality: string
    wardNo: string
    address: string
    role: string
}

type DoctorType = User & Doctor & { timeSlots: string[] }


export { LoginType, SignupType, DoctorType }