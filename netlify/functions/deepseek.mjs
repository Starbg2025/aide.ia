
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
    const { prompt } = await req.json();
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterKey) {
      return new Response(JSON.stringify({ 
        error: "Clé API OpenRouter manquante." 
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
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
        "model": "moonshotai/kimi-k2:free",
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erreur OpenRouter: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Désolé, aucune réponse générée.";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
