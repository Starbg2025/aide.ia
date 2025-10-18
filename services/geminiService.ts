import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { CREATOR_RESPONSE, CREATOR_KEYWORDS } from '../constants';

// The API key MUST be obtained exclusively from the environment variable `process.env.API_KEY`.
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

export const generateResponse = async (prompt: string, image?: File): Promise<string> => {
  // Check for creator-related keywords
  const lowerCasePrompt = prompt.toLowerCase();
  if (CREATOR_KEYWORDS.some(keyword => lowerCasePrompt.includes(keyword))) {
    return CREATOR_RESPONSE;
  }

  try {
    const parts: Part[] = [{ text: prompt }];

    if (image) {
      const imagePart = await fileToGenerativePart(image);
      parts.unshift(imagePart); // Put image first for better context
    }
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: parts },
        // Add a system instruction to guide the AI's personality
        config: {
            systemInstruction: "Tu es AideIA, un assistant IA amical, expert et pédagogue. Ton but est de simplifier la vie de tes utilisateurs en fournissant des réponses claires, précises et créatives. Tu es multilingue et peux gérer une large gamme de tâches, de l'aide aux devoirs au support technique. Sois toujours respectueux et encourageant. Pour l'analyse d'images, sois extrêmement méticuleux : identifie les objets, les personnes et les lieux, lis et transcris tout texte visible (OCR), et réponds aux questions en te basant exclusivement sur le contenu de l'image. Si aucune question n'est posée, fournis une description riche et détaillée. Pour toute question mathématique, agis comme un excellent professeur. Ta mission est d'enseigner, pas seulement de répondre. Ne donne JAMAIS la réponse finale sans une explication complète. Tu dois impérativement : 1. Reformuler le problème pour t'assurer de l'avoir compris. 2. Détailler la solution étape par étape, en expliquant la logique derrière chaque calcul. 3. Utiliser le format Markdown (par exemple, en utilisant des blocs de code pour les formules complexes) pour rendre les équations et les expressions mathématiques parfaitement lisibles. Ta réponse doit être si claire que quelqu'un qui a des difficultés avec le sujet puisse la comprendre.",
        }
    });

    const text = response.text;
    if (text) {
        return text;
    } else {
        return "Je n'ai pas pu générer de réponse. Veuillez réessayer.";
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       return "Erreur de configuration: La clé API n'est pas valide. Veuillez contacter le support technique.";
    }
    return "Désolé, une erreur est survenue lors de la communication avec l'IA. Veuillez vérifier votre connexion ou réessayer plus tard.";
  }
};
