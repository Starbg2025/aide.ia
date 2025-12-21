
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
    const { prompt, messages, model, stream = true } = await req.json();
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterKey) {
      return new Response(JSON.stringify({ error: "Clé API OpenRouter manquante." }), { status: 500 });
    }

    // Préparation des messages pour l'API
    let apiMessages = messages || [{ role: "user", content: prompt }];
    
    // Nettoyage des messages pour ne garder que le format attendu par OpenRouter (role, content, reasoning_details)
    apiMessages = apiMessages.map(m => ({
      role: m.role,
      content: m.text || m.content,
      ...(m.reasoning_details ? { reasoning_details: m.reasoning_details } : {})
    }));

    // Sélection du modèle
    let modelId = "deepseek/deepseek-r1-0528:free";
    let reasoningEnabled = false;

    if (model === 'qwen-coder') {
      modelId = "qwen/qwen3-coder:free";
    } else if (model === 'gemini-3-flash') {
      modelId = "google/gemini-3-flash-preview";
      reasoningEnabled = true; // Activer le raisonnement pour Gemini 3 Flash
    }

    // Fix: Use object spread to initialize the payload with optional properties.
    // This prevents errors related to dynamic property assignment (e.g., line 57: Property 'reasoning' does not exist).
    const payload = {
      "model": modelId,
      "messages": apiMessages,
      "stream": stream,
      ...(reasoningEnabled ? { reasoning: { enabled: true } } : {})
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://aideia.com",
        "X-Title": "AideIA Studio",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), { status: response.status });
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
