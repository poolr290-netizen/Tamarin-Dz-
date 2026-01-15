
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "./constants";

// Correctly initialize with named parameter and use process.env.API_KEY
// Note: GoogleGenAI initialization must use the named parameter object { apiKey: string }
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const solveExercise = async (
  prompt: string, 
  year: string, 
  major: string, 
  imageBase64?: string
) => {
  const ai = getAIClient();
  const context = `السنة: ${year}, التخصص: ${major}. التمرين: ${prompt}`;
  
  const parts: any[] = [];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }
  
  parts.push({ text: context });

  try {
    // Using ai.models.generateContent directly as per guidelines for Gemini 3
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
      },
    });
    
    // Access .text property directly, which returns a string | undefined
    return response.text || "عذراً، لم أتمكن من استخراج الحل. حاول مرة أخرى.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "حدث خطأ أثناء الاتصال بالخادم. يرجى التأكد من اتصالك بالإنترنت.";
  }
};
