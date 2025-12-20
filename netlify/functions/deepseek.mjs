
export default async (req, context) => {
  // Gestion du CORS pour les requêtes de pré-vérification (OPTIONS)
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
        error: "Configuration manquante : OPENROUTER_API_KEY n'est pas définie dans les variables d'environnement Netlify." 
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Appel à OpenRouter avec les paramètres demandés
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://aideia.com", // URL de votre site
        "X-Title": "AideIA",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-r1-0528:free",
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
      console.error("Erreur OpenRouter:", errorData);
      throw new Error(`Erreur OpenRouter: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Désolé, aucune réponse n'a été générée.";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error("Erreur dans la fonction deepseek:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
