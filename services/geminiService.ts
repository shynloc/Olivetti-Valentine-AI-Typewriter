
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
      
      // Logic: If user provided a custom key, assume they want the latest/best (Gemini 3.0 Preview)
      // If using default system env key, stick to 2.5 Flash for stability/cost.
      const modelName = apiKeys.gemini ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
      
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

export const generateImage = async (prompt: string, apiKeys: APIKeys): Promise<string | null> => {
    const apiKey = getGeminiKey(apiKeys.gemini);
    const ai = new GoogleGenAI({ apiKey });

    try {
        // Attempt with the requested High-Quality model first
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview', // Nano Banana Pro
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                    imageSize: "1K"
                }
            }
        });

        // Extract image
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    } catch (error) {
        console.warn("Gemini 3 Pro Image Gen failed (likely permission/quota), falling back to Flash Image.", error);
        
        // Fallback to standard model
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [{ text: prompt }]
                },
                config: {
                    imageConfig: {
                        aspectRatio: "1:1"
                        // imageSize is NOT supported on flash-image, do not include it
                    }
                }
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        } catch (fallbackError) {
             console.error("Image Gen Error (Fallback)", fallbackError);
             throw fallbackError;
        }
    }
    return null;
};
