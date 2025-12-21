
import { CREATOR_RESPONSE, CREATOR_KEYWORDS } from '../constants';
import { AIModel, Message } from '../types';

/**
 * Service de communication avec AideIA (via OpenRouter DeepSeek R1)
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
    const messages = history.map(m => ({
      role: m.role,
      content: m.text,
      ...(m.reasoning_details ? { reasoning_details: m.reasoning_details } : {})
    })).concat([{ role: 'user', content: prompt }]);

    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: messages,
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
 * Workflow pour capturer les détails de raisonnement si disponible
 */
export const generateReasoningResponse = async (
  prompt: string,
  model: AIModel,
  history: Message[]
): Promise<{ content: string; reasoning_details: any }> => {
  const messages = history.map(m => ({
    role: m.role,
    content: m.text,
    ...(m.reasoning_details ? { reasoning_details: m.reasoning_details } : {})
  })).concat([{ role: 'user', content: prompt }]);

  const response = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      messages: messages,
      stream: false
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
    reasoning_details: assistantMsg.reasoning_details 
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
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
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
