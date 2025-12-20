
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

  // Si une image est présente, on utilise obligatoirement Gemini (Vision)
  if (imageFile) {
    try {
      const parts: Part[] = [];
      const imagePart = await fileToGenerativePart(imageFile);
      parts.push(imagePart);
      parts.push({ text: prompt || "Analyse cette image." });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: "Tu es AideIA. Analyse l'image fournie avec rapidité et précision.",
          temperature: 0.7,
        }
      });
      return response.text || "Erreur d'analyse d'image.";
    } catch (error: any) {
      console.error("Gemini Vision Error:", error);
      return "Erreur lors de l'analyse de l'image.";
    }
  }

  // Sinon, on utilise DeepSeek R1 via notre fonction Netlify (pour le texte)
  try {
    const response = await fetch('/.netlify/functions/deepseek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (response.ok) {
      const data = await response.json();
      return data.text;
    } else {
      // Fallback vers Gemini si DeepSeek/OpenRouter échoue
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { temperature: 0.8 }
      });
      return fallbackResponse.text || "Une erreur est survenue.";
    }
  } catch (error) {
    console.error("DeepSeek Error, using fallback:", error);
    const fallbackResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return fallbackResponse.text || "Désolé, service indisponible.";
  }
};
