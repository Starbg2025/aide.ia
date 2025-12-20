
import { CREATOR_RESPONSE, CREATOR_KEYWORDS } from '../constants';

export const generateResponse = async (prompt: string): Promise<string> => {
  const lowerCasePrompt = prompt.toLowerCase();
  
  // Réponse personnalisée pour le créateur
  if (CREATOR_KEYWORDS.some(keyword => lowerCasePrompt.includes(keyword))) {
    return CREATOR_RESPONSE;
  }

  try {
     // Appel à la fonction Netlify dédiée
     const apiResponse = await fetch('/.netlify/functions/deepseek', {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json',
         },
         body: JSON.stringify({ prompt })
     });

     if (apiResponse.ok) {
         const data = await apiResponse.json();
         return data.text;
     } else {
         const errorData = await apiResponse.json().catch(() => ({}));
         throw new Error(errorData.error || `Erreur serveur (${apiResponse.status})`); 
     }

  } catch (error) {
    console.error("Erreur AideIA Service:", error);
    
    // Message d'erreur pédagogique si la fonction n'est pas joignable
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return "Erreur : Impossible de joindre le serveur. Si vous êtes en local, utilisez 'netlify dev'. Si vous êtes en ligne, vérifiez le déploiement de vos fonctions sur Netlify.";
    }
    
    return `Désolé, une erreur est survenue : ${error.message}. Veuillez vérifier votre clé OPENROUTER_API_KEY sur Netlify.`;
  }
};
