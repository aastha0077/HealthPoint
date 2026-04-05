import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "YOUR_API_KEY";
const genAI = new GoogleGenerativeAI(apiKey);

export async function getGeminiResponse(prompt: string) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are the AI health assistant for HealthPoint Medical Center. Your goal is to be helpful, polite, and extremely concise. Respond with simple, effective, and short replies. Avoid long paragraphs. Keep your response under 3 sentences unless absolutely necessary. Use a friendly medical tone."
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Gemini API error:", error);
        if (error?.status === 503 || error?.status === 429) {
            return "Our AI assistant is currently helping many patients. Please try again in 1-2 minutes, or speak with our live front desk if it's urgent.";
        }
        return "I'm having a brief connection issue. Please try your message again, or refresh the page.";
    }
}
