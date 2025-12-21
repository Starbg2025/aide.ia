
import { GoogleGenAI } from "@google/genai";
import { CREATOR_RESPONSE, CREATOR_KEYWORDS } from '../constants';
import { AIModel } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Génère une réponse en streaming via OpenRouter (DeepSeek/Qwen)
 */
export const generateStreamingResponse = async (
  prompt: string, 
  model: AIModel,
  onChunk: (chunk: string) => void
): Promise<void> => {
  const lowerCasePrompt = prompt.toLowerCase();
  
  if (CREATOR_KEYWORDS.some(keyword => lowerCasePrompt.includes(keyword))) {
    onChunk(CREATOR_RESPONSE);
    return;
  }

  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Erreur lors de la communication avec l'IA.");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("Impossible de lire le flux de réponse.");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') continue;
          
          try {
            const data = JSON.parse(dataStr);
            const content = data.choices?.[0]?.delta?.content || "";
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Ignorer les erreurs de parsing sur les fragments incomplets
          }
        }
      }
    }
  } catch (error: any) {
    console.error("Streaming Error:", error);
    onChunk(`\n\n[Erreur: ${error.message || "AideIA rencontre une difficulté technique."}]`);
  }
};

/**
 * Génère du code d'application/site via Gemini 3 Pro pour le Studio
 */
export const generateStudioCode = async (prompt: string, onChunk: (chunk: string) => void): Promise<void> => {
  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: `Tu es un expert développeur Full Stack et UI/UX designer. 
        Ta mission est de générer du code complet, moderne et fonctionnel pour des sites web ou des applications mobiles.
        Utilise HTML5, Tailwind CSS et si nécessaire du JavaScript moderne.
        Réponds DIRECTEMENT avec le code, sans explications superflues, sauf si c'est crucial.
        Assure-toi que le design soit "pixel-perfect", responsive et esthétiquement impressionnant.`,
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        onChunk(text);
      }
    }
  } catch (error) {
    console.error("Studio Generation Error:", error);
    onChunk("Erreur lors de la génération du code. Veuillez réessayer.");
  }
};

export const generateResponse = async (prompt: string, model: AIModel = 'deepseek'): Promise<string> => {
  let fullText = "";
  await generateStreamingResponse(prompt, model, (chunk) => {
    fullText += chunk;
  });
  return fullText;
};
