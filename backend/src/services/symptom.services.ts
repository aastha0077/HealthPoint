import { PrismaClient } from "@prisma/client";
import { getClinicalRecommendation } from "./ai.services";

const prisma = new PrismaClient();

/**
 * AI-DRIVEN DOCTOR MATCHING (User Recommendation)
 * This service treats AI as the primary mapper between symptoms and clinical departments.
 */

export async function getBodyRegions() {
    return await (prisma as any).bodyRegion.findMany({
        include: { organs: true }
    });
}

export async function getOrgansByRegion(regionId: number) {
    return await (prisma as any).organ.findMany({
        where: { regionId },
        include: { symptoms: true }
    });
}

export async function getSymptomsByOrgan(organId: number) {
    return await (prisma as any).symptom.findMany({
        where: {
            organs: {
                some: { id: organId }
            }
        }
    });
}

export async function searchDoctorsBySymptomAndOrgan(organId?: number, symptomIds?: number[], manualSymptoms?: string[]) {
    let aiInsight = "Synthesizing clinical correlation...";
    let aiConfidence = 0;
    let recommendedDepts: string[] = [];

    // --- 1. AI Analysis ---
    if (organId || (manualSymptoms && manualSymptoms.length > 0)) {
        let organName = "General / Systemic";
        let regionName = "Whole Body";

        if (organId) {
            const organ = await (prisma as any).organ.findUnique({ 
                where: { id: organId },
                include: { region: true } 
            });
            if (organ) {
                organName = organ.name;
                regionName = organ.region?.name || "Specified Region";
            }
        }

        const symptomsList = symptomIds ? await (prisma as any).symptom.findMany({ where: { id: { in: symptomIds } } }) : [];
        const predefinedSymptomNames = symptomsList.map((s: any) => s.name);
        
        // Combine predefined with manual symptoms
        const totalSymptoms = [...predefinedSymptomNames, ...(manualSymptoms || [])];

        const departments = await prisma.department.findMany({ select: { name: true, description: true } });
        const deptContext = departments.map(d => `${d.name}: ${d.description}`);

        const aiRec = await getClinicalRecommendation(regionName, organName, totalSymptoms, deptContext);
        aiInsight = aiRec.diagnosticInsight;
        aiConfidence = aiRec.confidenceScore;
        recommendedDepts = aiRec.relevantDepartments;
    }

    if (recommendedDepts.length === 0) {
        recommendedDepts = ["General Medicine"];
    }

    // --- 2. Fetch Doctors via AI Departments & Specialization ---
    // We include 'symptoms' and 'organs' solely for frontend display/badges, 
    // but the matching logic remains strictly AI-Department driven.
    const deptConditions: any[] = recommendedDepts.map(dept => ({
        department: { name: { contains: dept, mode: 'insensitive' } }
    }));

    const specialityConditions: any[] = recommendedDepts.map(dept => ({
        speciality: { contains: dept, mode: 'insensitive' }
    }));

    const doctors = await (prisma as any).doctor.findMany({
        where: {
            OR: [
                ...deptConditions,
                ...specialityConditions
            ]
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    profilePicture: true,
                    email: true
                }
            },
            department: true,
            organs: true,            // Restore for UI
            symptoms: true,          // Restore for UI (fixes frontend crash)
            timeSlots: { include: { Time: true } }
        }
    });

    // --- 3. Dynamic Relevance Scoring ---
    const scoredDoctors = doctors.map((doc: any) => {
        let score = 70; // Base score

        const deptName = doc.department?.name || "";
        const speciality = doc.speciality || "";

        const matches = recommendedDepts.filter(rd =>
            deptName.toLowerCase().includes(rd.toLowerCase()) ||
            speciality.toLowerCase().includes(rd.toLowerCase())
        );

        score += (matches.length * 10);

        if (recommendedDepts[0] && (
            deptName.toLowerCase().includes(recommendedDepts[0].toLowerCase()) ||
            speciality.toLowerCase().includes(recommendedDepts[0].toLowerCase())
        )) {
            score += 20;
        }

        return {
            ...doc,
            relevanceScore: Math.min(100, score),
            matchedSymptomsCount: 0
        };
    });

    scoredDoctors.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);

    return {
        clinicalInsight: aiInsight,
        diagnosticConfidence: aiConfidence,
        doctors: scoredDoctors.slice(0, 20).map((doc: any) => ({
            id: doc.id,
            firstName: doc.user?.firstName || "",
            lastName: doc.user?.lastName || "",
            profilePicture: doc.user?.profilePicture,
            email: doc.user?.email,
            speciality: doc.speciality,
            bio: doc.bio,
            department: doc.department?.name || "Specialist",
            available: doc.available,
            organs: (doc.organs || []).map((o: any) => o.name), // Ensure it exists
            symptoms: (doc.symptoms || []).map((s: any) => s.name), // Ensure it exists (fixes frontend crash)
            timeSlots: (doc.timeSlots || []).map((ts: any) => ts.Time?.time).filter(Boolean),
            relevanceScore: doc.relevanceScore
        }))
    };
}
