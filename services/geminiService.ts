
import { GoogleGenAI } from "@google/genai";
import { CREATOR_RESPONSE, CREATOR_KEYWORDS } from '../constants';
import { AIModel, Message } from '../types';

/**
 * Service de communication avec AideIA (Google Gemini API)
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

  // Create a new GoogleGenAI instance right before making an API call to ensure up-to-date configuration.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Correctly format contents for Gemini API: map 'assistant' role to 'model' and 'text' to 'parts'.
    const contents = history.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }]
    })).concat([{ role: 'user', parts: [{ text: prompt }] }]);

    const response = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: contents,
    });

    for await (const chunk of response) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error: any) {
    onChunk(`\n\n[Erreur: ${error.message}]`);
  }
};

export const generateStudioCode = async (
  prompt: string, 
  systemInstruction: string,
  onChunk: (chunk: string) => void
): Promise<void> => {
  // Create a new GoogleGenAI instance right before making an API call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error: any) {
    onChunk(`[Erreur Studio: ${error.message}]`);
  }
};

export const generateReasoningResponse = async (
  prompt: string,
  model: AIModel,
  history: Message[]
): Promise<{ content: string; reasoning_details: any }> => {
    // Create a new GoogleGenAI instance right before making an API call.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Fix: Properly map history to Gemini's expected Content format to avoid the TS error on line 150.
    // The previous code failed because it tried to concat a Message array with objects that didn't match the Message type.
    const contents = history.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }]
    })).concat([{ role: 'user', parts: [{ text: prompt }] }]);

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        // Use thinkingConfig for advanced reasoning tasks with gemini-3-pro-preview.
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });

    return {
        content: response.text || "",
        reasoning_details: null
    };
};
