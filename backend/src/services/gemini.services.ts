import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "YOUR_API_KEY";
const genAI = new GoogleGenerativeAI(apiKey);

export async function getGeminiResponse(prompt: string) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: "You are the AI health assistant for PLU (Public Lumbini United Hospital). Your goal is to be helpful, polite, and extremely concise. Respond with simple, effective, and short replies. Avoid long paragraphs. Keep your response under 3 sentences unless absolutely necessary. Use a friendly medical tone."
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Gemini API error:", error);
        return "Sorry, I am having trouble connecting to my knowledge base right now. Please try again later.";
    }
}
