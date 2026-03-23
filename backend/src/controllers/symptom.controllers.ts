import { Request, Response, NextFunction } from "express";
import { getBodyRegions, getSymptomsByOrgan, searchDoctorsBySymptomAndOrgan } from "../services/symptom.services";

export const getRegionsWithOrgans = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const regions = await getBodyRegions();
        res.json(regions);
    } catch (error) {
        next(error);
    }
}

export const getSymptomsForOrgan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { organId } = req.params;
        const symptoms = await getSymptomsByOrgan(parseInt(organId));
        res.json(symptoms);
    } catch (error) {
        next(error);
    }
}

export const searchSpecDoctors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { organId, symptomIds, manualSymptoms } = req.query;
        // symptomIds could be an array or string.
        let sIds: number[] | undefined;
        if (symptomIds) {
            sIds = (Array.isArray(symptomIds) ? symptomIds : [symptomIds]).map((id: any) => parseInt(id));
        }

        let mSymptoms: string[] | undefined;
        if (manualSymptoms) {
            mSymptoms = Array.isArray(manualSymptoms) ? (manualSymptoms as string[]) : [(manualSymptoms as string)];
        }

        const doctors = await searchDoctorsBySymptomAndOrgan(
            organId ? parseInt(organId as string) : undefined,
            sIds,
            mSymptoms
        );
        res.json(doctors);
    } catch (error) {
        next(error);
    }
}
