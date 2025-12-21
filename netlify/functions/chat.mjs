
export default async (req, context) => {
  // Gestion du CORS pour les requêtes de pré-vérification
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
    const { prompt, model } = await req.json();
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterKey) {
      return new Response(JSON.stringify({ 
        error: "Clé API OpenRouter (OPENROUTER_API_KEY) manquante dans l'environnement Netlify." 
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Définition de l'ID du modèle selon le choix de l'utilisateur
    // Utilisation de l'ID spécifique demandé : deepseek/deepseek-r1-0528:free
    const modelId = model === 'deepseek' 
      ? "deepseek/deepseek-r1-0528:free" 
      : "moonshotai/kimi-k2:free";

    // Structure fetch demandée par l'utilisateur
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://aideia.com", 
        "X-Title": "AideIA", 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": modelId,
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ 
        error: `Erreur OpenRouter (${response.status}): ${errorText}` 
      }), { 
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Désolé, l'IA n'a pas renvoyé de réponse.";

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
