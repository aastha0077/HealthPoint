import { PrismaClient } from "@prisma/client";
import { LoginType, SignupType } from "../types/user.types";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';
import { json } from "express";
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
            password: hash,
            role: user.role,
        }
    })

    const patient = await prisma.patient.create({
        data: {
            firstName: user.firstName,
            lastName: user.lastName,
            contactNumber: user.contactNumber,
            district: user.district,
            municipality: user.municipality,
            wardNo: user.wardNo,
            address: user.address,
            userId: result.id
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
    isValidUser: isValidUser
}



export { userService }