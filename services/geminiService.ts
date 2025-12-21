
import { GoogleGenAI } from "@google/genai";
import { CREATOR_RESPONSE, CREATOR_KEYWORDS } from '../constants';
import { AIModel, Message } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Génère une réponse en streaming en tenant compte de l'historique (pour reasoning_details)
 */
export const generateStreamingResponse = async (
  prompt: string, 
  model: AIModel,
  history: Message[],
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
      body: JSON.stringify({ 
        prompt, 
        model, 
        messages: history.concat([{ id: 'temp', role: 'user', text: prompt }])
      })
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
          } catch (e) {}
        }
      }
    }
  } catch (error: any) {
    console.error("Streaming Error:", error);
    onChunk(`\n\n[Erreur: ${error.message}]`);
  }
};

/**
 * Génère une réponse non-streamée pour capturer les reasoning_details (requis par le prompt utilisateur)
 */
export const generateReasoningResponse = async (
  prompt: string,
  model: AIModel,
  history: Message[]
): Promise<{ content: string; reasoning_details: any }> => {
  const response = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      prompt, 
      model, 
      messages: history.concat([{ id: 'temp', role: 'user', text: prompt }]),
      stream: false
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Erreur API");
  }

  const result = await response.json();
  const choice = result.choices[0].message;
  return {
    content: choice.content,
    reasoning_details: choice.reasoning_details
  };
};

/**
 * Studio Code generation using the specified Gemini 3 Flash Reasoning logic
 */
export const generateStudioCode = async (prompt: string, onChunk: (chunk: string) => void): Promise<void> => {
  try {
    // On utilise ici le streaming direct pour la fluidité dans le Studio
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: `Tu es un expert développeur et designer UI de chez Google AI Studio. 
        Génère une application ou un site web "pixel-perfect" avec Tailwind CSS. 
        Réponds par le code HTML complet et autonome.`,
        thinkingConfig: { thinkingBudget: 8000 }
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) onChunk(text);
    }
  } catch (error) {
    console.error("Studio Error:", error);
    onChunk("Erreur lors de la génération. Réessayez.");
  }
};
