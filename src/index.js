// Librairie nécessaire pour pouvoir utiliser l'API OpenAI depuis Node ou un navigateur
import OpenAI from "openai";

// Instanciation de l'objet nous permettant de communiquer avec l'API
const openai = new OpenAI({
  // La clé d'API que vous avez récupéré depuis votre compte (NE JAMAIS LA PARTAGER !!!)
  apiKey: process.env.OPENAI_API_KEY
});

// L'objet qui contient la réponse de l'API OpenAI
const completions = await openai.chat.completions.create({
  // Le modèle d'intelligence artificielle à utiliser
  model: "gpt-3.5-turbo",
  // L'ensemble de la discussion entre vous et l'API (donc le contexte)
  messages: [
    {
      // Le rôle, il peut être un des suivants
      // user : c'est vous qui posez une question
      // assistant : c'est l'API qui vous répondras
      // system : c'est la personnalité ainsi que les
      // détails qui permettant de cadrer la réponse du modèle
      role: "system",
      // Le contenu est la valeur pour le rôles
      // cela peut être une question, une réponse de l'API ou un contexte
      content: "Tu es un terminal LINUX, à chaque fois qu'on tape une commande, tu vas ressortir un exemple de sortie exactement comme sur un vrai serveur et tu ne répondras à aucune question."
    },
    {
      role: "user",
      content: "ls -alh"
    }
  ]
});

// L'objet contient un certain nombre de propriétés
// donc "choices" qui nous intéresse et contient la
// réponse de l'API à notre question
console.log(completions.choices);
