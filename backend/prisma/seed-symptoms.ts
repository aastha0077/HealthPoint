import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding high-accuracy medical data...");

    // 1. Body Regions
    const regions = [
        { name: "Head & Neck" },
        { name: "Chest & Upper Back" },
        { name: "Abdomen & Digestive" },
        { name: "Pelvis & Urinary" },
        { name: "Limbs & Joints" },
        { name: "Skin & General" },
    ];

    for (const region of regions) {
        await prisma.bodyRegion.upsert({
            where: { name: region.name },
            update: {},
            create: region,
        });
    }

    const head = await prisma.bodyRegion.findUnique({ where: { name: "Head & Neck" } });
    const chest = await prisma.bodyRegion.findUnique({ where: { name: "Chest & Upper Back" } });
    const abdomen = await prisma.bodyRegion.findUnique({ where: { name: "Abdomen & Digestive" } });
    const pelvis = await prisma.bodyRegion.findUnique({ where: { name: "Pelvis & Urinary" } });
    const limbs = await prisma.bodyRegion.findUnique({ where: { name: "Limbs & Joints" } });
    const skin = await prisma.bodyRegion.findUnique({ where: { name: "Skin & General" } });

    // 2. Comprehensive Organs
    const organs = [
        { name: "Brain", regionId: head!.id },
        { name: "Eyes", regionId: head!.id },
        { name: "Thyroid", regionId: head!.id },
        { name: "Teeth & Gums", regionId: head!.id },
        { name: "Heart", regionId: chest!.id },
        { name: "Lungs", regionId: chest!.id },
        { name: "Ribs", regionId: chest!.id },
        { name: "Stomach", regionId: abdomen!.id },
        { name: "Liver", regionId: abdomen!.id },
        { name: "Pancreas", regionId: abdomen!.id },
        { name: "Intestines", regionId: abdomen!.id },
        { name: "Kidneys", regionId: pelvis!.id },
        { name: "Bladder", regionId: pelvis!.id },
        { name: "Reproductive", regionId: pelvis!.id },
        { name: "Shoulders", regionId: limbs!.id },
        { name: "Knees", regionId: limbs!.id },
        { name: "Spine", regionId: limbs!.id },
        { name: "Skin Layer", regionId: skin!.id },
    ];

    for (const organ of organs) {
        await prisma.organ.upsert({
            where: { name: organ.name },
            update: { regionId: organ.regionId },
            create: organ,
        });
    }

    // 3. Precise Symptoms
    const mappings: { [key: string]: string[] } = {
        "Severe Headache": ["Brain"],
        "Memory Loss": ["Brain"],
        "Seizures": ["Brain"],
        "Blurred Vision": ["Eyes"],
        "Eye Redness": ["Eyes"],
        "Difficulty Swallowing": ["Thyroid"],
        "Neck Swelling": ["Thyroid"],
        "Toothache": ["Teeth & Gums"],
        "Bleeding Gums": ["Teeth & Gums"],
        "Chest Tightness": ["Heart"],
        "Rapid Heartbeat": ["Heart"],
        "Chronic Cough": ["Lungs"],
        "Wheezing": ["Lungs"],
        "Sharp Side Pain": ["Ribs", "Liver"],
        "Acid Reflux": ["Stomach"],
        "Bloating & Gas": ["Intestines", "Stomach"],
        "Jaundice (Yellow Skin)": ["Liver", "Pancreas"],
        "Abdominal Cramps": ["Intestines"],
        "Blood in Urine": ["Kidneys", "Bladder"],
        "Lower Back Pain": ["Kidneys", "Spine"],
        "Painful Urination": ["Bladder"],
        "Joint Stiffness": ["Shoulders", "Knees"],
        "Muscle Weakness": ["Shoulders", "Knees"],
        "Numbness in Limbs": ["Spine"],
        "Eczema/Rashes": ["Skin Layer"],
        "Acne/Pimples": ["Skin Layer"],
    };

    for (const [symptomName, organNames] of Object.entries(mappings)) {
        await prisma.symptom.upsert({
            where: { name: symptomName },
            update: {
                organs: {
                    connect: organNames.map(name => ({ name }))
                }
            },
            create: {
                name: symptomName,
                organs: {
                    connect: organNames.map(name => ({ name }))
                }
            },
        });
    }

    // 4. Update Doctors with Multi-Disciplinary accuracy
    const doctors = await prisma.doctor.findMany({ include: { department: true } });
    
    for (const doctor of doctors) {
        const dept = doctor.department.name.toLowerCase();
        let targetOrgans: string[] = [];
        let targetSymptoms: string[] = [];

        if (dept.includes("cardio")) {
            targetOrgans = ["Heart"];
            targetSymptoms = ["Chest Tightness", "Rapid Heartbeat"];
        } else if (dept.includes("neuro")) {
            targetOrgans = ["Brain", "Spine"];
            targetSymptoms = ["Severe Headache", "Memory Loss", "Seizures", "Numbness in Limbs"];
        } else if (dept.includes("ortho")) {
            targetOrgans = ["Shoulders", "Knees", "Spine", "Ribs"];
            targetSymptoms = ["Joint Stiffness", "Muscle Weakness", "Lower Back Pain"];
        } else if (dept.includes("derm")) {
            targetOrgans = ["Skin Layer"];
            targetSymptoms = ["Eczema/Rashes", "Acne/Pimples"];
        } else if (dept.includes("gast")) {
            targetOrgans = ["Stomach", "Liver", "Pancreas", "Intestines"];
            targetSymptoms = ["Acid Reflux", "Bloating & Gas", "Jaundice (Yellow Skin)", "Abdominal Cramps"];
        } else {
            // General physicians link to many common ones
            targetOrgans = ["Brain", "Heart", "Stomach", "Skin Layer"];
            targetSymptoms = ["Severe Headache", "Acid Reflux", "Acne/Pimples"];
        }

        await prisma.doctor.update({
            where: { id: doctor.id },
            data: {
                organs: { connect: targetOrgans.map(name => ({ name })) },
                symptoms: { connect: targetSymptoms.map(name => ({ name })) }
            }
        });
    }

    console.log("High-accuracy seeding completed.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
