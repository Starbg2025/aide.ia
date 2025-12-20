
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { CREATOR_RESPONSE, CREATOR_KEYWORDS } from '../constants';
import { AIProvider } from '../types';

const getAiClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API key missing. Please check your configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

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

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const generateResponse = async (prompt: string, provider: AIProvider = 'gemini', image?: File): Promise<string> => {
  const lowerCasePrompt = prompt.toLowerCase();
  if (CREATOR_KEYWORDS.some(keyword => lowerCasePrompt.includes(keyword))) {
    return CREATOR_RESPONSE;
  }

  try {
     let imageBase64 = undefined;
     if (image) {
         const fullBase64 = await fileToBase64(image);
         imageBase64 = fullBase64.split(',')[1];
     }

     const apiResponse = await fetch('/.netlify/functions/chat', {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
         },
         body: JSON.stringify({
             prompt: prompt,
             provider: provider,
             image: imageBase64
         })
     });

     if (apiResponse.ok) {
         const data = await apiResponse.json();
         return data.text;
     } else {
         throw new Error(`API error: ${apiResponse.status}`); 
     }

  } catch (apiError) {
    // Fallback local uniquement pour Gemini car DeepSeek nécessite OpenRouter (Server-side)
    if (provider === 'gemini') {
        try {
            const ai = getAiClient();
            const parts: Part[] = [{ text: prompt }];
            if (image) {
                const imagePart = await fileToGenerativePart(image);
                parts.unshift(imagePart);
            }
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: parts },
                config: {
                    systemInstruction: "Tu es AideIA, un assistant IA amical et expert.",
                }
            });
            return response.text || "Erreur de génération.";
        } catch (err) {
            console.error(err);
            return "Erreur technique. Vérifiez votre clé API dans les variables d'environnement.";
        }
    }
    return "Désolé, ce modèle (DeepSeek) nécessite une configuration serveur active sur Netlify.";
  }
};
