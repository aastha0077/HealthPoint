import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function createDepartmentController(req: Request, res: Response) {
    const departmentData = req.body;
    console.log('departmentData')
    console.log(departmentData)
    const department = await prisma.department.create({
        data: departmentData
    })

    res.send(department)
}


async function getAllDepartmentController(req: Request, res: Response) {
    const departments = await prisma.department.findMany();
    res.send(departments)

}

export { createDepartmentController, getAllDepartmentController }