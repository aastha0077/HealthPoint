import { PrismaClient } from "@prisma/client";
import { DoctorType, LoginType, SignupType } from "../types/user.types";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

export async function saveUser(user: SignupType) {
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
            password: hash,
            role: "USER",
            profilePicture: user.profilePicture
        }
    })

    return {
        message: "signup successfull",
        success: true
    };
}
export async function saveDoctor(user: DoctorType) {
    const existingUser = await prisma.user.findFirst({
        where: { email: user.email }
    });
    if (existingUser) {
        return { message: "User with this email already exists" };
    }

    // 1. Prepare Time Slots
    const allTimeSlots = await prisma.time.findMany();
    const timeSlotsToLink = await Promise.all((user.timeSlots || []).map(async (slot) => {
        const existing = allTimeSlots.find(t => t.time === slot);
        if (existing) return existing;
        return await prisma.time.create({ data: { time: slot } });
    }));

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);

    // 3. Execute Transaction
    return await prisma.$transaction(async (tx) => {
        // Create User
        const newUser = await tx.user.create({
            data: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                password: hash,
                role: "DOCTOR",
                profilePicture: user.profilePicture
            }
        });

        // Create Doctor Profile (linking to user)
        await tx.doctor.create({
            data: {
                id: newUser.id,
                userId: newUser.id,
                speciality: user.speciality,
                available: true,
                departmentId: user.departmentId,
                bio: user.bio,
            }
        });

        // Link Time Slots
        await Promise.all(timeSlotsToLink.map(time => 
            tx.timeslots.create({
                data: {
                    timeId: time.id,
                    doctorId: newUser.id
                }
            })
        ));

        return newUser;
    });
}

export async function isValidUser(user: LoginType) {
    const result = await prisma.user.findFirst({
        where: {
            email: user.email
        }
    });

    if (!result) {
        return {
            success: false,
            message: "Email does not exist"
        };
    }

    if (!result.password) {
        return {
            success: false,
            message: "Password not set for this account"
        };
    }

    const isMatch = await bcrypt.compare(user.password, result.password);

    if (!isMatch) {
        return {
            success: false,
            message: "Invalid credentials"
        };
    }

    const accessToken = jwt.sign(
        { id: result.id, email: user.email, role: result.role },
        process.env.JWT_SECRET || process.env.JWT || "secret",
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { id: result.id, email: user.email },
        process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
        { expiresIn: "7d" }
    );

    await prisma.user.update({
        where: { id: result.id },
        data: { refreshToken }
    });

    return {
        success: true,
        message: "Login successful",
        token: accessToken,
        refreshToken: refreshToken,
        user: {
            id: result.id,
            email: result.email,
            role: result.role,
            firstName: result.firstName,
            lastName: result.lastName
        }
    };
}

export async function getDoctors(pageNumber: number, pageSize: number, searchTerm?: string, departmentId?: number) {
    const where: any = {};

    if (departmentId) {
        where.departmentId = departmentId;
    }

    if (searchTerm) {
        where.OR = [
            { speciality: { contains: searchTerm, mode: 'insensitive' } },
            {
                user: {
                    OR: [
                        { firstName: { contains: searchTerm, mode: 'insensitive' } },
                        { lastName: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                }
            }
        ];
    }

    const skip = isNaN(pageNumber) || isNaN(pageSize) ? 0 : Math.max(0, (pageNumber - 1) * pageSize);
    const take = isNaN(pageSize) || pageSize <= 0 ? 10 : pageSize;

    const result = await prisma.doctor.findMany({
        where,
        skip,
        take,
        select: {
            id: true,
            user: true,
            speciality: true,
            bio: true,
            available: true,
            department: true,
            timeSlots: {
                select: {
                    Time: {
                        select: {
                            time: true
                        }
                    }
                }
            }
        }
    });

    const doctors = result.map(doc =>
        ({ ...doc.user, doctorId: doc.id, speciality: doc.speciality, bio: doc.bio, available: doc.available, department: doc.department, timeSlots: doc.timeSlots.map(ts => ts.Time.time) })
    );

    const totalDoctors = await prisma.doctor.count({ where });

    return { doctors, totalDoctors };
}

export async function getDoctorById(id: number) {
    const doc = await prisma.doctor.findUnique({
        where: { id },
        include: {
            user: true,
            department: true,
            timeSlots: {
                include: {
                    Time: true
                }
            },
            reviews: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            profilePicture: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (!doc) return null;

    return {
        ...doc.user,
        userId: doc.user.id,
        doctorId: doc.id,
        speciality: doc.speciality,
        bio: doc.bio,
        available: doc.available,
        department: doc.department,
        timeSlots: doc.timeSlots.map(ts => ts.Time.time),
        reviews: doc.reviews.map(r => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            userName: `${r.user.firstName} ${r.user.lastName}`,
            userProfilePicture: r.user.profilePicture
        }))
    };
}

export async function getDoctorByUserId(userId: number) {
    const doc = await prisma.doctor.findUnique({
        where: { userId },
        include: {
            user: true,
            department: true,
            timeSlots: {
                include: {
                    Time: true
                }
            },
            reviews: {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            profilePicture: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (!doc) return null;

    return {
        ...doc.user,
        userId: doc.user.id,
        doctorId: doc.id,
        speciality: doc.speciality,
        bio: doc.bio,
        available: doc.available,
        department: doc.department,
        timeSlots: doc.timeSlots.map(ts => ts.Time.time),
        reviews: doc.reviews.map(r => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            userName: `${r.user.firstName} ${r.user.lastName}`,
            userProfilePicture: r.user.profilePicture
        }))
    };
}

export async function refreshUserToken(token: string) {
    try {
        const decoded: any = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || "refresh_secret");

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user || user.refreshToken !== token) {
            return {
                success: false,
                message: "Invalid refresh token"
            };
        }

        const accessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || process.env.JWT || "secret",
            { expiresIn: "15m" }
        );

        const newRefreshToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
            { expiresIn: "7d" }
        );

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken }
        });

        return {
            success: true,
            message: "Token refreshed successfully",
            token: accessToken,
            refreshToken: newRefreshToken
        };
    } catch (error) {
        return {
            success: false,
            message: "Invalid or expired refresh token"
        };
    }
}

export async function updateDoctor(id: number, data: any) {
    const { firstName, lastName, email, speciality, bio, departmentId, profilePicture, timeSlots, password } = data;

    // 1. Pre-fetch Data
    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw new Error("Doctor not found");

    const userData: any = { firstName, lastName, email, profilePicture };
    if (password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(password, salt);
    }

    const doctorUpdateData: any = { speciality, bio };
    const parsedDeptId = parseInt(departmentId);
    if (!isNaN(parsedDeptId)) {
        doctorUpdateData.department = { connect: { id: parsedDeptId } };
    }

    // 2. Prepare Time Slots if provided
    let timeSlotRecords: any[] = [];
    if (timeSlots && Array.isArray(timeSlots)) {
        const allTimeRecords = await prisma.time.findMany();
        timeSlotRecords = await Promise.all(timeSlots.map(async (slotString: string) => {
            const existing = allTimeRecords.find(t => t.time === slotString);
            if (existing) return existing;
            return await prisma.time.create({ data: { time: slotString } });
        }));
    }

    // 3. Execute Transaction
    return await prisma.$transaction(async (tx) => {
        // Update User
        await tx.user.update({
            where: { id: doctor.userId },
            data: userData
        });

        // Update Doctor Profile
        await tx.doctor.update({
            where: { id },
            data: doctorUpdateData
        });

        // Update Time Slots if provided
        if (timeSlots && Array.isArray(timeSlots)) {
            await tx.timeslots.deleteMany({ where: { doctorId: id } });
            for (const timeRecord of timeSlotRecords) {
                await tx.timeslots.create({
                    data: {
                        doctorId: id,
                        timeId: timeRecord.id
                    }
                });
            }
        }
        return { success: true, message: "Doctor updated successfully" };
    });
}