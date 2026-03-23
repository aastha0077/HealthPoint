import { createPatient, getMyPatients, getAllPatients } from "../services/patient.service";
import { Request, Response, NextFunction } from "express";

async function createPatientController(req: Request, res: Response): Promise<void> {
    try {
        const patientData = req.body;
        const email = req.email || req.user?.email;

        // No email check - allow Guest patient creation

        // Basic validation for patientData
        if (!patientData.firstName || !patientData.lastName || !patientData.district || !patientData.municipality || !patientData.wardNo || !patientData.gender) {
            res.status(400).json({ message: "Missing required patient fields" });
            return;
        }

        // Validate wardNo is a number
        const wardNo = parseInt(patientData.wardNo);
        if (isNaN(wardNo)) {
            res.status(400).json({ message: "Ward Number must be a valid number" });
            return;
        }
        patientData.wardNo = wardNo; // Update with parsed number

        const result = await createPatient(patientData, email);
        console.log(`[createPatientController] Patient created successfully for user ${email}: ${result.id}`);
        res.status(201).json(result);
    } catch (err: any) {
        console.error("[createPatientController] Error creating patient:", err.message);
        res.status(400).json({ message: err.message || "Error creating patient" });
    }
}

async function getMyPatientsController(req: Request, res: Response): Promise<void> {
    try {
        const email = req.email || req.user?.email;
        console.log(`[GetMyPatients] Fetching patients for ${email}`);

        if (!email) {
            res.status(401).json({ message: "Unauthorized: No email found in token" });
            return;
        }

        const result = await getMyPatients(email);
        console.log(`[GetMyPatients] Found ${result.length} patients`);
        res.status(200).json(result);
    } catch (err: any) {
        console.error("[GetMyPatients] Error:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

async function getAllPatientsController(req: Request, res: Response): Promise<void> {
    try {
        const result = await getAllPatients();
        res.status(200).json(result);
    } catch (err: any) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export { createPatientController, getMyPatientsController, getAllPatientsController };

