
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
    const { prompt, messages, model, stream = true, systemInstruction, reasoning } = await req.json();
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Clé API absente du serveur." }), { status: 500 });
    }

    let apiMessages = [];
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

    // Mappage des modèles selon la demande de l'utilisateur
    // Utilisation de z-ai/glm-4.5-air:free comme modèle principal
    let modelId = "z-ai/glm-4.5-air:free";
    
    if (model === 'qwen-coder') {
      modelId = "qwen/qwen3-coder:free";
    } else if (model === 'gemini-3-flash' || model === 'gemini-studio') {
      // On garde un modèle capable de raisonnement pour ces options
      modelId = "google/gemini-2.0-flash-thinking-exp:free";
    }

    const payload = {
      "model": modelId,
      "messages": apiMessages,
      "stream": stream,
      ...(reasoning ? { "reasoning": reasoning } : {})
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
      const errText = await response.text();
      return new Response(JSON.stringify({ error: `Erreur API: ${response.status}`, details: errText }), { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": stream ? "text/event-stream" : "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
