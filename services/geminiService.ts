
import { CREATOR_RESPONSE, CREATOR_KEYWORDS } from '../constants';
import { AIModel, Message } from '../types';

/**
 * Génère une réponse en streaming en tenant compte de l'historique
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
          if (dataStr === '[DONE]' || !dataStr) continue;
          
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
 * Génère une réponse non-streamée pour capturer les reasoning_details
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
 * Studio Code generation via OpenRouter Gemini 3 Flash (supporte reasoning)
 */
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

    if (!response.ok) throw new Error("Erreur Studio Backend");

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
    console.error("Studio Error:", error);
    onChunk(`[Erreur de génération Studio: ${error.message}]`);
  }
};
