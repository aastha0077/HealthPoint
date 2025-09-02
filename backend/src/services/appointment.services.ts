import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function createNewAppointment(patientId: number, doctorId: number, appointmentDateTime: string) {
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
        appointmentDateTime: new Date(appointmentDateTime).toISOString()
    }
    const createdAppointment = await prisma.appointment.create({
        //@ts-ignore
        data: appointment
    })
    return createdAppointment;

}


async function getAllAppointments() {
    const appointments = await prisma.appointment.findMany();
    return appointments;
}

async function getAppointmentById(id: number) {
    const appointment = await prisma.appointment.findFirst({
        where: {
            id: id
        }
    })
    return appointment;

}

const appointmentService = {
    createNewAppointment: createNewAppointment,
    getAllAppointments: getAllAppointments
}

export { appointmentService }