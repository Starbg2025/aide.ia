
import { GoogleGenAI, Part } from "@google/genai";
import { CREATOR_RESPONSE, CREATOR_KEYWORDS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateResponse = async (prompt: string, imageFile?: File): Promise<string> => {
  const lowerCasePrompt = prompt.toLowerCase();
  
  if (CREATOR_KEYWORDS.some(keyword => lowerCasePrompt.includes(keyword))) {
    return CREATOR_RESPONSE;
  }

  try {
    const parts: Part[] = [];
    
    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      parts.push(imagePart);
    }
    
    parts.push({ text: prompt || (imageFile ? "Analyse cette image en détail." : "") });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Le plus rapide
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: "Tu es AideIA, l'IA la plus rapide au monde. Sois précis, utile et concis. Tu peux analyser des images et du texte.",
        temperature: 0.8,
      }
    });

    return response.text || "Désolé, je n'ai pas pu formuler de réponse.";
  } catch (error: any) {
    console.error("Erreur Gemini Service:", error);
    return `Erreur : ${error.message}`;
  }
};
