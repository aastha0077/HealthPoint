import { Patient, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function createPatient(patient: Patient, email?: string) {
    let userId = null;
    if (email) {
        const user = await prisma.user.findFirst({
            where: { email: email },
        });
        if (user) {
            userId = user.id;
        }
    }

    return await prisma.patient.create({
        data: {
            ...patient,
            userId: userId
        }
    });
}

export async function getMyPatients(email: string) {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) return [];

    return await prisma.patient.findMany({
        where: { userId: user.id }
    });
}

export async function getAllPatients() {
    return await prisma.patient.findMany({
        include: { user: { select: { email: true, firstName: true, lastName: true } } }
    });
}