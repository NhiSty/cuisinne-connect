import OpenAI from 'openai';
import {
	gptGeneratedRecipeValidator,
	gptSortedRecipesValidator,
	gptGeneratedSideDishesValidator
} from '../validation/recipes.validator.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_CHAT_KEY });

/**
 * Prompt a text to ChatGPT and return the response
 * @param {string} prompt Text to prompt to ChatGPT
 * @returns {Promise<string>} Response from ChatGPT
 */
export async function promptToGPT(prompt) {
	const openaiResponse = await openai.chat.completions.create({
		model: 'gpt-3.5-turbo-1106',
		messages: [
			{
				role: 'system',
				content: 'You are a helpful assistant designed to output JSON.' // a ne pas toucher
			},
			{
				role: 'user',
				content: prompt
			}
		],
		response_format: { type: 'json_object' }
	});

	return openaiResponse.choices[0].message.content;
}

/**
 * Sort and search recipes based on database entries and GPT knowledges
 * @param {{ title: string; summary: string}[]} recipes List of recipes names from the database
 * @param {string} input User input to search recipes
 * @returns {Promise<string[]>} List of recipes sorted by GPT
 */
export async function searchAndSortRecipes(recipes, input) {
	const now = new Date();
	const month = now.getMonth();

	const result = await promptToGPT(`
	Tu es un chef cuisinier étoilé, réputé pour tes talents culinaires du monde entier.
	L'utilisateur recherche des recettes avec le mot-clé suivant : $$${input}$$. 
	
	Parmi les recettes de la base de données, veuillez filtrer celles qui correspondent à la recherche de l'utilisateur.
	Ensuite, triez-les en fonction de leur pertinence par rapport à la recherche de l'utilisateur.
	De plus, comme nous sommes au ${month + 1}ème mois de l'année, veuillez mettre en avant les
	recettes qui utilisent des ingrédients de saison.

	Il doit absolument y avoir 8 éléments, si ce n'est pas le cas, proposez de nouvelles recettes qui
	pourraient intéresser l'utilisateur.

	Garde les nom exactement à l'identique de ceux fournit depuis la base de donnée.
	Tous les noms doivent être en français dès que possible.

	Recettes venant de la base de donnée:
	${recipes.map((r) => `- ${r.title} : ${r.description}`).join('\n')}
	[FIN DE LISTE]

	Schéma de réponse (8 éléments):
	{
		"results": [
			{
				title: "Nom de la recette",
				description: "Court résumé de la recette"
			},
			...
		]
	}
	`);

	const obj = JSON.parse(result);
	const data = await gptSortedRecipesValidator.validate(obj);

	return data;
}

/**
 * Generate a recipe from its name
 * @param {string} name Name of the recipe to generate
 * @returns {Promise<any>} Generated recipe
 */
export async function generateRecipe(name) {
	const result = await promptToGPT(`
	Tu es un chef cuisinier étoilé, réputé pour tes talents culinaires du monde entier.
	L'utilisateur demande la recette de la recette suivante : $$${name}$$.
	
	Veuillez générer la recette de la recette demandée par l'utilisateur.
	Réponds en français dès que possible.

	Schéma de réponse:
	{
		"title": "Nom de la recette",
		"description": "A description",
		"cookingTime": 0,
		"servings": 0,
		"ingredients": [
			"ingrédient 1",
			"ingrédient 2",
			...
		],
		"instructions": [
			"étape 1",
			"étape 2",
			...
		]
	}
	`);

	const obj = JSON.parse(result);
	const data = await gptGeneratedRecipeValidator.validate(obj);

	return data;
}

/**
 * Generate recipe possible side dishes list from its name
 * @param {string} name Name of the recipe to generate
 * @returns {Promise<string[]>} Generated recipe side dishes
 */
export async function generateRecipeSideDish(name) {
	const result = await promptToGPT(`
	Tu es un chef cuisinier étoilé, réputé pour tes talents culinaires du monde entier.
	L'utilisateur demande les accompagnements possibles pour la recette suivante : $$${name}$$.
	
	Veuillez générer les accompagnements possibles pour la recette demandée par l'utilisateur que ce soit du vins, des desserts, des fromages, etc.
	Réponds en français dès que possible.

	Schéma de réponse:
	{
		"sideDishes": [
			"accompagnement 1",
			"accompagnement 2",
			...
		]
	}
	`);

	const obj = JSON.parse(result);
	const data = await gptGeneratedSideDishesValidator.validate(obj);

	return data.sideDishes;
}
