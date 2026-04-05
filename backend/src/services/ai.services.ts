import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        As an elite medical diagnostic engine at "HealthPoint Medical Center", perform a clinical synthesis on the following case:
        
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
    } catch (err: any) {
        console.error("AI Clinical Recommendation Error:", err);
        
        // Handle demand spikes or service unavailable with a beautiful message
        if (err?.status === 503 || err?.status === 429 || err?.message?.includes("demand")) {
            return {
                relevantDepartments: ["General Medicine"],
                diagnosticInsight: "Our AI specialists are currently experiencing a high volume of requests. For your immediate care, we've prioritized a mapping to our expert General Medicine team.",
                confidenceScore: 0
            };
        }

        return {
            relevantDepartments: [],
            diagnosticInsight: "Standard diagnostic parameters applied. Please proceed with the mapped specialists.",
            confidenceScore: 0
        };
    }
}
