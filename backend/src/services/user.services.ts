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
            message: "User with this email already exists",
            success: false
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


    return {
        message: "signup successfull",
        success: true
    };
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
    let timeSlots = user.timeSlots
    const allTimeSlots = await prisma.time.findMany()
    const timeSlotResult = await Promise.all(timeSlots.map(async (timeSlot, index) => {
        const existing = allTimeSlots.filter(t => {
            return (t.time === timeSlot)
        })
        if (existing[0]) {
            return existing[0]
        }
        return await prisma.time.create({
            data: { time: timeSlot }
        })
    }))

    console.log(timeSlotResult)

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
            bio: user.bio,
        }
    })

    await Promise.all(timeSlotResult.map(async (time) => {
        const res = await prisma.timeslots.create({
            data: {
                timeId: time.id,
                doctorId: result.id
            }
        })

        return res
    }))

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
            message: "Email doesnot exists",
            success: false
        }
    }
    if (result?.password != null) {
        if (await bcrypt.compare(user.password, result.password)) {
            return {
                token: jwt.sign({ email: user.email }, process.env.JWT || "", { expiresIn: "1h" }),
                success: true,
                message: "login successfull"
            }
        }
    }

}

async function getDoctors(pageNumber: number, pageSize: number) {
    const result = await prisma.doctor.findMany({
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        select:{
            user:true,
            speciality:true,
            bio:true,
            address:true,
            available:true,
            department:true,
            timeSlots:{
                select:{
                    Time:{
                        select:{
                            time:true
                        }
                    }
                }
            }
        }
    });

    const doctors = result.map(doc =>
        ({ ...doc.user, speciality: doc.speciality, bio: doc.bio, address: doc.address, available: doc.available, department: doc.department, timeSlots: doc.timeSlots.map(ts => ts.Time.time) })
    );
    return { doctors, totalDoctors: await prisma.doctor.count() };
}
const userService = {
    saveUser,
    isValidUser,
    saveDoctor,
    getDoctors
}

export { userService }