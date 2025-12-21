
import { GoogleGenAI, Part } from "@google/genai";
import { CREATOR_RESPONSE, CREATOR_KEYWORDS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const OCR_API_KEY = "K86736252288957";

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

/**
 * Utilise OCR.space pour extraire le texte d'une image
 */
const performOCR = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("apikey", OCR_API_KEY);
    formData.append("language", "fre");
    formData.append("isOverlayRequired", "false");
    formData.append("file", file);

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.IsErroredOnProcessing) {
      console.warn("OCR.space Error:", data.ErrorMessage);
      return null;
    }
    return data.ParsedResults?.[0]?.ParsedText || null;
  } catch (error) {
    console.error("OCR Request failed:", error);
    return null;
  }
};

export const generateResponse = async (prompt: string, imageFile?: File): Promise<string> => {
  const lowerCasePrompt = prompt.toLowerCase();
  
  if (CREATOR_KEYWORDS.some(keyword => lowerCasePrompt.includes(keyword))) {
    return CREATOR_RESPONSE;
  }

  let finalPrompt = prompt;

  // Traitement si une image est présente
  if (imageFile) {
    try {
      // 1. Tenter l'OCR pour extraire le texte (très utile pour documents/code)
      const extractedText = await performOCR(imageFile);
      
      if (extractedText) {
        // On enrichit le prompt avec le texte trouvé dans l'image
        finalPrompt = `[Contenu texte extrait de l'image jointe]:\n${extractedText}\n\n[Question de l'utilisateur]:\n${prompt || "Analyse ce texte."}`;
      } else {
        // 2. Si l'OCR ne trouve rien, on utilise Gemini Vision pour décrire l'image
        const parts: Part[] = [];
        const imagePart = await fileToGenerativePart(imageFile);
        parts.push(imagePart);
        parts.push({ text: "Décris précisément cette image et réponds à cette question si elle est fournie : " + (prompt || "Qu'est-ce que c'est ?") });

        const geminiVision = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ role: 'user', parts }],
          config: { temperature: 0.4 }
        });
        
        return geminiVision.text || "L'image a été reçue mais aucune analyse n'a pu être générée.";
      }
    } catch (error) {
      console.error("Image Analysis Fallback Error:", error);
      // On continue vers DeepSeek avec le prompt original si l'analyse d'image échoue totalement
    }
  }

  // Envoi du prompt final (éventuellement enrichi par l'OCR) à DeepSeek R1
  try {
    const response = await fetch('/.netlify/functions/deepseek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: finalPrompt })
    });

    if (response.ok) {
      const data = await response.json();
      return data.text;
    } else {
      // Fallback vers Gemini Flash si la fonction Netlify/DeepSeek échoue
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: finalPrompt,
        config: { temperature: 0.7 }
      });
      return fallbackResponse.text || "Erreur de génération.";
    }
  } catch (error) {
    console.error("Processing Error:", error);
    return "Désolé, AideIA rencontre une difficulté technique. Veuillez réessayer dans quelques instants.";
  }
};
