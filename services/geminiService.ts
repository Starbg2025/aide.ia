
import { CREATOR_RESPONSE, CREATOR_KEYWORDS } from '../constants';
import { AIModel, Message } from '../types';

/**
 * Service de communication avec OpenRouter
 * Implémente la logique de raisonnement (Reasoning) et de streaming
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
        messages: history.concat([{ id: 'tmp', role: 'user', text: prompt }]),
        stream: true
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Erreur communication");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) throw new Error("Flux illisible");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]' || !dataStr) continue;
          try {
            const data = JSON.parse(dataStr);
            const content = data.choices?.[0]?.delta?.content || "";
            if (content) onChunk(content);
          } catch (e) {}
        }
      }
    }
  } catch (error: any) {
    onChunk(`\n\n[Erreur: ${error.message}]`);
  }
};

/**
 * Workflow spécifique : Raisonnement Avancé (Capturer et renvoyer reasoning_details)
 * Comme demandé dans l'exemple SDK OpenRouter
 */
export const generateReasoningResponse = async (
  prompt: string,
  model: AIModel,
  history: Message[]
): Promise<{ content: string; reasoning_details: any }> => {
  // On prépare les messages en préservant les reasoning_details existants
  const messages = history.map(m => ({
    role: m.role,
    content: m.text,
    ...(m.reasoning_details ? { reasoning_details: m.reasoning_details } : {})
  })).concat([{ role: 'user', content: prompt }]);

  const response = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      model: 'gemini-3-flash', // On force le modèle de raisonnement
      messages: messages,
      stream: false,
      reasoning: { enabled: true }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Erreur Raisonnement");
  }

  const result = await response.json();
  const assistantMsg = result.choices[0].message;
  
  return {
    content: assistantMsg.content,
    reasoning_details: assistantMsg.reasoning_details // Détails préservés pour le tour suivant
  };
};

export const generateStudioCode = async (
  prompt: string, 
  systemInstruction: string,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt, 
        model: 'gemini-studio',
        systemInstruction,
        stream: true
      })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]' || !dataStr) continue;
          try {
            const data = JSON.parse(dataStr);
            const content = data.choices?.[0]?.delta?.content || "";
            if (content) onChunk(content);
          } catch (e) {}
        }
      }
    }
  } catch (error: any) {
    onChunk(`[Erreur Studio: ${error.message}]`);
  }
};
