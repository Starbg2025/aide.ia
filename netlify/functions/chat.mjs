
import { GoogleGenAI } from "@google/genai";

export default async (req, context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { prompt, image, provider = 'gemini' } = await req.json();

    // ---- LOGIQUE DEEPSEEK (OPENROUTER) ----
    if (provider === 'deepseek') {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) {
        return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY missing" }), { status: 500 });
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://aideia.com",
          "X-Title": "AideIA",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-r1-0528:free",
          "messages": [{ "role": "user", "content": prompt }]
        })
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "Aucune réponse de DeepSeek.";

      return new Response(JSON.stringify({ text }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // ---- LOGIQUE GEMINI (PAR DÉFAUT) ----
    if (!process.env.API_KEY) {
      return new Response(JSON.stringify({ error: "API_KEY missing" }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts = [];
    if (image) {
      parts.push({ inlineData: { data: image, mimeType: "image/jpeg" } });
    }
    parts.push({ text: prompt });

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: parts },
      config: {
        systemInstruction: "Tu es AideIA, un assistant IA expert. Réponds de manière claire et concise."
      }
    });

    return new Response(JSON.stringify({ text: result.text }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
