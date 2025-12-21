
import { AIModel } from '../types';
import { CREATOR_RESPONSE, CREATOR_KEYWORDS } from '../constants';

const OCR_API_KEY = "K86736252288957";

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

export const generateResponse = async (prompt: string, model: AIModel = 'kimi', imageFile?: File): Promise<string> => {
  const lowerCasePrompt = prompt.toLowerCase();
  
  if (CREATOR_KEYWORDS.some(keyword => lowerCasePrompt.includes(keyword))) {
    return CREATOR_RESPONSE;
  }

  let finalPrompt = prompt;

  if (imageFile) {
    const extractedText = await performOCR(imageFile);
    if (extractedText) {
      finalPrompt = `[Texte extrait de l'image]:\n${extractedText}\n\n[Question]:\n${prompt || "Analyse ce texte."}`;
    } else {
      return "Je n'ai pas pu lire de texte dans cette image. Assurez-vous que le texte est bien visible et réessayez.";
    }
  }

  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: finalPrompt, model })
    });

    const data = await response.json();

    if (response.ok) {
      return data.text;
    } else {
      // Retourne l'erreur précise venant du backend
      return `Oups ! Une erreur est survenue côté serveur : ${data.error || 'Erreur inconnue'}.`;
    }
  } catch (error) {
    console.error("Network or Processing Error:", error);
    return "Impossible de contacter AideIA. Si vous êtes en local, utilisez 'netlify dev'. Sinon, vérifiez votre connexion internet.";
  }
};
