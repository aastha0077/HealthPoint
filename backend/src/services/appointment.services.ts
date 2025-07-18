import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function createAppointment(patientId: number, doctorId: number, appointmentDateTime: string) {
    // const doctor = await prisma.$queryRaw`Select * from Doctor where doctorId=${doctorId}`;
    const doctor = await prisma.doctor.findFirst({
        where: {
            id: doctorId
        },
        include: {
            department: true
        }
    })
    if (!doctor) {
        throw Error("Doctor not found")
    }
    const appointment = {
        patientId: patientId,
        doctorId: doctorId,
        departmentId: doctor.departmentId,
        appointmentDateTime: appointmentDateTime
    }
    const createdAppointment = await prisma.appointment.create({
        data: appointment
    })
    return createAppointment;

}

const appointmentService = {
    createAppointment: createAppointment
}

export { appointmentService }