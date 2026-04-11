import { Request, Response, RequestHandler } from "express";
import { getDoctorById, getDoctors, saveDoctor, updateDoctor, getDoctorByUserId } from "../services/user.services";

const createDoctorController: RequestHandler = async (req, res) => {
    try {
        const doctor = req.body;
        const result = await saveDoctor(doctor);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Internal error occurred"
        });
    }
}


const getDoctorsController: RequestHandler = async (req, res) => {
    try {
        const { pageNumber, pageSize } = req.params;
        const { search, departmentId } = req.query;
        const doctors = await getDoctors(
            parseInt(pageNumber),
            parseInt(pageSize),
            search as string,
            departmentId ? parseInt(departmentId as string) : undefined
        );
        res.json(doctors);
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ message: "Internal error occurred" });
    }
}

const getDoctorByIdController: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getDoctorById(parseInt(id));
        if (!result) {
            res.status(404).json({ message: "Doctor not found" });
            return;
        }
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Internal error occurred" });
    }
}

const updateDoctorController: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await updateDoctor(parseInt(id), req.body);
        res.status(200).json(result);
    } catch (error: any) {
        console.error("[UpdateDoctorController] Error:", error.message);
        res.status(400).json({ message: error.message || "Internal error occurred" });
    }
}

const getDoctorByUserIdController: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const result = await getDoctorByUserId(userId);
        if (!result) {
            res.status(404).json({ message: "Doctor profile not found" });
            return;
        }
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Internal error occurred" });
    }
}

export { createDoctorController, getDoctorsController, getDoctorByIdController, updateDoctorController, getDoctorByUserIdController };