
import { CREATOR_RESPONSE, CREATOR_KEYWORDS } from '../constants';
import { AIModel } from '../types';

/**
 * Génère une réponse en streaming
 * @param prompt Le texte de l'utilisateur
 * @param model Le modèle d'IA à utiliser
 * @param onChunk Callback appelé à chaque nouveau morceau de texte
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

export const generateResponse = async (prompt: string, model: AIModel = 'deepseek'): Promise<string> => {
  let fullText = "";
  await generateStreamingResponse(prompt, model, (chunk) => {
    fullText += chunk;
  });
  return fullText;
};
