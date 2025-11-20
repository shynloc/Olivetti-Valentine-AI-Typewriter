import { GoogleGenAI } from "@google/genai";

// Initialize the client
// Note: In a real production app, you might handle the API key more securely or via proxy,
// but per instructions we use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful assistant. You are typing on a vintage typewriter. Keep your responses concise, nostalgic, and formatted in short paragraphs suitable for printing on paper. Avoid markdown bold/italic syntax if possible, stick to plain text.",
      }
    });
    
    return response.text || "The machine hums, but no words come...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Ribbon jammed. Connection failed.";
  }
};