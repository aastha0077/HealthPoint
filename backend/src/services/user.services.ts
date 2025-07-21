import { PrismaClient } from "@prisma/client";
import { DoctorType, LoginType, SignupType } from "../types/user.types";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

async function saveUser(user: SignupType) {
    const output = await prisma.user.findFirst({
        where: {
            email: user.email
        }
    })
    if (output) {
        return {
            message: "User with this email already exists"
        }
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    const result = await prisma.user.create({
        data: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            contactNumber: user.contactNumber,
            password: hash,
            role: "USER",
        }
    })

    const patient = await prisma.patient.create({
        data: {
            id: result.id,
            district: user.district,
            municipality: user.municipality,
            wardNo: user.wardNo,
        }
    })
    return result;
}
async function saveDoctor(user: DoctorType) {

    const output = await prisma.user.findFirst({
        where: {
            email: user.email
        }
    })
    if (output) {
        return {
            message: "User with this email already exists"
        }
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    const result = await prisma.user.create({
        data: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            contactNumber: user.contactNumber,
            password: hash,
            role: "DOCTOR",
        }
    })

    const doctor = await prisma.doctor.create({
        data: {
            id: result.id,
            address: user.address,
            speciality: user.speciality,
            available: true,
            departmentId: user.departmentId,
            bio: user.bio

        }
    })
    return result;
}

async function isValidUser(user: LoginType) {
    const result = await prisma.user.findFirst({
        where: {
            email: user.email
        }
    })
    if (!result) {
        return {
            message: "Email doesnot exists"
        }
    }
    if (result?.password != null) {
        if (await bcrypt.compare(user.password, result.password)) {
            //@ts-ignore
            return jwt.sign(user.email, process.env.JWT)
        }
    }
}

const userService = {
    saveUser: saveUser,
    isValidUser: isValidUser,
    saveDoctor: saveDoctor
}

export { userService }