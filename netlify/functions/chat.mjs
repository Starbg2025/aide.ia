
export default async (req, context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Méthode non autorisée" }), { 
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { prompt, messages, model, stream = true, systemInstruction } = await req.json();
    // Utilisation de API_KEY car c'est la variable injectée par le système
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Clé API manquante dans l'environnement." }), { status: 500 });
    }

    // Préparation des messages
    let apiMessages = [];
    
    // Si une instruction système est fournie (mode Studio)
    if (systemInstruction) {
      apiMessages.push({ role: "system", content: systemInstruction });
    }

    if (messages && messages.length > 0) {
      apiMessages = [...apiMessages, ...messages.map(m => ({
        role: m.role,
        content: m.text || m.content,
        ...(m.reasoning_details ? { reasoning_details: m.reasoning_details } : {})
      }))];
    } else {
      apiMessages.push({ role: "user", content: prompt });
    }

    // Sélection du modèle OpenRouter
    let modelId = "deepseek/deepseek-r1-0528:free";
    let reasoningEnabled = false;

    if (model === 'qwen-coder') {
      modelId = "qwen/qwen3-coder:free";
    } else if (model === 'gemini-3-flash' || model === 'gemini-studio') {
      modelId = "google/gemini-3-flash-preview";
      reasoningEnabled = true;
    }

    const payload = {
      "model": modelId,
      "messages": apiMessages,
      "stream": stream,
      ...(reasoningEnabled ? { "reasoning": { "enabled": true } } : {})
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://aideia.com",
        "X-Title": "AideIA",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Erreur OpenRouter: ${response.status}`, details: errorText }), { status: response.status });
    }

    if (stream) {
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } else {
      const result = await response.json();
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
