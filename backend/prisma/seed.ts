const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const DEPARTMENTS = [
    { name: "Cardiology", description: "Heart and cardiovascular care including diagnostic echo, stress tests, cardiac surgery, and preventive heart health programs." },
    { name: "Neurology", description: "Comprehensive care for brain, spine, and nervous system conditions including stroke management, epilepsy, and neuroimaging." },
    { name: "Orthopedics", description: "Expert treatment for bone, joint, and musculoskeletal disorders including joint replacement, sports medicine, and physiotherapy." },
    { name: "Pediatrics", description: "Specialized healthcare for infants, children, and adolescents covering vaccinations, growth monitoring, and pediatric emergencies." },
    { name: "Dermatology", description: "Skin, hair, and nail care including treatment of acne, eczema, psoriasis, cosmetic procedures, and skin cancer screening." },
    { name: "Ophthalmology", description: "Complete eye care services including cataract surgery, glaucoma treatment, LASIK, and retinal disease management." },
    { name: "General Surgery", description: "Surgical interventions for a wide range of conditions including appendectomy, hernia repair, and laparoscopic procedures." },
    { name: "Gynecology & Obstetrics", description: "Women's health services including prenatal care, safe delivery, gynecological surgery, and reproductive health." },
    { name: "ENT (Otolaryngology)", description: "Ear, nose, and throat care including sinus surgery, hearing tests, tonsillectomy, and head/neck tumor treatment." },
    { name: "Psychiatry", description: "Mental health services including counseling, medication management for depression, anxiety, bipolar disorder, and substance abuse." },
    { name: "Emergency Medicine", description: "24/7 trauma and emergency medical services with advanced life support, critical care, and rapid response teams." },
    { name: "Gastroenterology", description: "Digestive system care including endoscopy, colonoscopy, liver disease treatment, and management of GI disorders." },
    { name: "Pulmonology", description: "Lung and respiratory care including asthma management, COPD treatment, sleep studies, and pulmonary function testing." },
    { name: "Nephrology", description: "Kidney care and dialysis services including treatment of chronic kidney disease, kidney stones, and hypertension." },
    { name: "Urology", description: "Urinary tract and male reproductive health services including kidney stone treatment, prostate care, and urological surgery." },
    { name: "Radiology & Imaging", description: "State-of-the-art diagnostic imaging including Digital X-Ray, MRI, CT Scan, ultrasound, and interventional radiology." },
    { name: "Oncology", description: "Cancer diagnosis and treatment including chemotherapy, radiation therapy, immunotherapy, and palliative care." },
    { name: "Endocrinology", description: "Hormonal and metabolic disorder treatment including diabetes management, thyroid disease, and adrenal disorders." },
    { name: "Rheumatology", description: "Autoimmune and inflammatory disease care including arthritis, lupus, fibromyalgia, and joint inflammation." },
    { name: "Anesthesiology", description: "Perioperative care, pain management, and anesthesia services for surgical and non-surgical procedures." },
];

const SPECIALITIES = [
    "Cardiologist", "Neurologist", "Orthopedic Surgeon", "Pediatrician",
    "Dermatologist", "Ophthalmologist", "General Surgeon", "Gynecologist",
    "ENT Specialist", "Psychiatrist", "Emergency Physician", "Gastroenterologist",
    "Pulmonologist", "Nephrologist", "Urologist", "Radiologist",
    "Oncologist", "Endocrinologist", "Rheumatologist", "Anesthesiologist",
];

const FIRST_NAMES = [
    "Aarav", "Sita", "Bikash", "Priya", "Ramesh", "Sunita", "Kiran", "Anita",
    "Suresh", "Gita", "Prakash", "Mina", "Rajesh", "Kamala", "Deepak", "Laxmi",
    "Sandesh", "Sarita", "Bimal", "Nirmala", "Arjun", "Puja", "Nabin", "Asha",
    "Dipendra", "Rekha", "Ganesh", "Maya", "Mahesh", "Sushila", "Bijay", "Rita",
    "Sunil", "Bindu", "Anil", "Durga", "Raju", "Samjhana", "Krishna", "Tara",
    "Hari", "Sabina", "Gopal", "Manisha", "Sanjay", "Bimala", "Mohan", "Indira",
    "Narayan", "Kopila",
];

const LAST_NAMES = [
    "Sharma", "Adhikari", "Thapa", "Bhandari", "Poudel", "Kc", "Basnet",
    "Shrestha", "Gurung", "Tamang", "Rai", "Magar", "Neupane", "Bhattarai",
    "Subedi", "Acharya", "Pokharel", "Koirala", "Lama", "Karki",
    "Rijal", "Dhakal", "Sapkota", "Devkota", "Ghimire", "Pant", "Joshi",
    "Dahal", "Regmi", "Pandey",
];

const ALL_TIMES = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00",
];

const TIME_SLOT_OPTIONS = [
    ["08:00", "09:00", "10:00", "11:00"],
    ["09:00", "10:00", "11:00", "12:00"],
    ["10:00", "11:00", "14:00", "15:00"],
    ["08:00", "09:00", "14:00", "15:00", "16:00"],
    ["09:00", "10:00", "11:00", "14:00", "15:00"],
    ["08:30", "09:30", "10:30", "11:30", "14:30"],
    ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00"],
    ["08:00", "10:00", "12:00", "14:00", "16:00"],
];

const BIOS = [
    "Dedicated healthcare professional with over 10 years of clinical experience.",
    "Passionate about patient-centered care and evidence-based medicine.",
    "Highly skilled specialist committed to improving patient outcomes.",
    "Expert in the latest treatment protocols and diagnostic techniques.",
    "Known for compassionate care and thorough clinical assessments.",
    "Published researcher with expertise in advanced medical procedures.",
    "Focused on preventive medicine and holistic patient wellness.",
    "Award-winning practitioner with an excellent patient satisfaction record.",
    "Experienced in both clinical practice and medical education.",
    "Serving the community with integrity and medical excellence.",
];

async function seed() {
    console.log("🌱 Starting seed...\n");

    const hashedPassword = await bcrypt.hash("doctor@123", 10);

    // --- 1. Create Time records ---
    console.log("⏰ Ensuring Time records exist...");
    const timeMap: Record<string, number> = {};
    for (const t of ALL_TIMES) {
        let record = await prisma.time.findUnique({ where: { time: t } });
        if (!record) {
            record = await prisma.time.create({ data: { time: t } });
        }
        timeMap[t] = record.id;
    }
    console.log(`✅ ${Object.keys(timeMap).length} time records ready.\n`);

    // --- 2. Create Departments ---
    console.log(`📋 Creating ${DEPARTMENTS.length} departments...`);
    const deptRecords = [];
    for (const dept of DEPARTMENTS) {
        const existing = await prisma.department.findFirst({ where: { name: dept.name } });
        if (existing) {
            deptRecords.push(existing);
        } else {
            const created = await prisma.department.create({ data: dept });
            deptRecords.push(created);
        }
    }
    console.log(`✅ ${deptRecords.length} departments ready.\n`);

    // --- 3. Create 100 Doctors ---
    console.log("👨‍⚕️ Creating 100 doctors...");
    let created = 0;

    for (let i = 0; i < 100; i++) {
        const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
        const lastName = LAST_NAMES[i % LAST_NAMES.length];
        const deptIndex = i % deptRecords.length;
        const dept = deptRecords[deptIndex];
        const speciality = SPECIALITIES[deptIndex % SPECIALITIES.length];
        const email = `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@healthpoint.com`;
        const bio = BIOS[i % BIOS.length];
        const slotsForDoctor = TIME_SLOT_OPTIONS[i % TIME_SLOT_OPTIONS.length];

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log(`  ⚠️ Skipping ${email} — already exists`);
            continue;
        }

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: "DOCTOR",
            }
        });

            const existingDoctor = await prisma.doctor.findUnique({ where: { userId: user.id } });
            if (existingDoctor) continue;

            const doctor = await prisma.doctor.upsert({
                where: { userId: user.id },
                update: {},
                create: {
                    userId: user.id,
                    departmentId: dept.id,
                    speciality,
                    bio,
                    qualifications: `MBBS, MD (${speciality})`,
                }
            });

        // Create Timeslot links
        for (const t of slotsForDoctor) {
            const timeId = timeMap[t];
            if (timeId) {
                await prisma.timeslots.create({
                    data: { doctorId: doctor.id, timeId }
                });
            }
        }

        created++;
        if (created % 20 === 0) console.log(`  ... ${created} doctors created`);
    }

    console.log(`\n✅ ${created} doctors created (password: doctor@123)`);
    console.log("🎉 Seed complete!");
}

seed()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
