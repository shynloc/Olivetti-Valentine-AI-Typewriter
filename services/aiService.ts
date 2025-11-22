
import { GoogleGenAI } from "@google/genai";
import { APIKeys, AIModel } from "../types";

// Helper to get the active key or fallback
const getGeminiKey = (userKey?: string) => userKey || process.env.API_KEY || "";
const getDeepSeekKey = (userKey?: string) => userKey || "";

export const generateAIResponse = async (
  prompt: string, 
  model: AIModel, 
  apiKeys: APIKeys,
  systemInstruction: string = "You are a helpful assistant typing on a vintage typewriter. Your output will be rendered using Markdown. Please use Markdown formatting (e.g., # headers, **bold**, *italics*, - lists) to structure your response nicely. Keep the tone nostalgic and concise.",
  errorFallbackText: string = "Error: Ribbon jammed. Connection failed.",
  temperature: number = 0.7
): Promise<string> => {
  
  if (model === 'gemini') {
    try {
      const apiKey = getGeminiKey(apiKeys.gemini);
      const ai = new GoogleGenAI({ apiKey });
      
      // Use selected model or default to Flash
      const modelName = apiKeys.geminiModel || 'gemini-2.5-flash';
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { 
          systemInstruction,
          temperature: temperature
        }
      });
      
      return response.text || "The machine hums, but no words come...";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return errorFallbackText + " (Gemini)";
    }
  } 
  
  else if (model === 'deepseek') {
    try {
      const apiKey = getDeepSeekKey(apiKeys.deepseek);
      const deepSeekModel = apiKeys.deepSeekModel || 'deepseek-chat';
      
      if (!apiKey) {
        return "Error: DeepSeek requires an API Key. Please check the CONFIDENTIAL folder.";
      }

      // Standard OpenAI-compatible endpoint for DeepSeek
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: deepSeekModel,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          temperature: temperature,
          stream: false
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "DeepSeek API request failed");
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "Silence from the deep...";

    } catch (error) {
      console.error("DeepSeek API Error:", error);
      return errorFallbackText + " (DeepSeek)";
    }
  }

  return "Error: Unknown model selected.";
};