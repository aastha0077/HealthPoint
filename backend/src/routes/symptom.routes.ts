import { Router } from "express";
import { getRegionsWithOrgans, getSymptomsForOrgan, searchSpecDoctors } from "../controllers/symptom.controllers";

const symptomRoutes = Router();

symptomRoutes.get("/regions", getRegionsWithOrgans);
symptomRoutes.get("/organs/:organId/symptoms", getSymptomsForOrgan);
symptomRoutes.get("/doctors", searchSpecDoctors);

export { symptomRoutes };
