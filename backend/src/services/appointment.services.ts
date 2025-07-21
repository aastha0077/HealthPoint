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
        appointmentDateTime: new Date(appointmentDateTime).toISOString()
    }
    const createdAppointment = await prisma.appointment.create({
        data: appointment
    })
    return createdAppointment;

}


async function getAllAppointments() {
    const appointments = await prisma.appointment.findMany();
    return appointments;
}

const appointmentService = {
    createAppointment: createAppointment,
    getAllAppointments: getAllAppointments
}

export { appointmentService }