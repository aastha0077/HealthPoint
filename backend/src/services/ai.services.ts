import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
//  dont change the model
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

interface AIRecommendation {
    relevantDepartments: string[]; // e.g. ["Cardiology", "Emergency"]
    diagnosticInsight: string;     // e.g. "Symptoms of rapid heartbeat and chest tightness suggest a potential cardiac issue."
    confidenceScore: number;       // 0-100
}

export async function getClinicalRecommendation(
    regionName: string, 
    organName: string, 
    symptoms: string[], 
    deptContext: string[] = []
): Promise<AIRecommendation> {
    const prompt = `
        As an elite medical diagnostic engine at "Public Lumbini United (PLU) Medical Center", perform a clinical synthesis on the following case:
        
        CASE DATA:
        - Regional Focus: ${regionName}
        - Target Organ: ${organName}
        - Clinical Markers: ${symptoms.join(", ") || "No specific symptoms reported"}

        HOSPITAL DIRECTORY & SCOPE (Recommend ONLY from these EXACT department names):
        ${deptContext.join("\n        ") || "Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, General Medicine"}

        DIAGNOSTIC PROTOCOL:
        1. Compare markers against the SCOPE of our available departments.
        2. Select the "Primary" and if necessary "Secondary" department names that most precisely treat these symptoms.
        3. Do not suggest departments that are not in the list provided above.
        4. If symptoms cross multiple scopes (e.g., headache with vision issues), prioritize Neurology and ENT.

        RESPONSE ENGINE (Strict JSON):
        {
            "relevantDepartments": ["Exact Dept Name 1", "Exact Dept Name 2"],
            "diagnosticInsight": "A professional clinical summary (15-20 words).",
            "confidenceScore": 0-100
        }

        Output ONLY the raw JSON. No markdown blocks.
    `;

    try {
        console.log(`[AI-Diagnostics] Processing: ${organName} | Symptoms: ${symptoms.length}`);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Strip out any markdown code block artifacts
        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const data: AIRecommendation = JSON.parse(cleanJson);

        console.log(`[AI-Diagnostics] Insight: "${data.diagnosticInsight}" | Confidence: ${data.confidenceScore}%`);
        return data;
    } catch (err) {
        console.error("AI Clinical Recommendation Error:", err);
        return {
            relevantDepartments: [],
            diagnosticInsight: "Standard diagnostic parameters applied.",
            confidenceScore: 0
        };
    }
}
