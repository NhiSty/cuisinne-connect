import OpenAI from 'openai';
import {
	gptGeneratedRecipeValidator,
	gptGeneratedSideDishesValidator,
	gptSortedRecipesValidator
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

export async function promptToSearchRecipe(prompt) {
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
		response_format: { type: 'json_object' },
		functions: [
			{
				name: 'search_recipe',
				description: 'List of recipes',
				parameters: {
					type: 'object',
					properties: {
						recipes: {
							type: 'array',
							description: 'List of recipes',
							items: {
								type: 'object',
								properties: {
									title: {
										type: 'string',
										description: 'Title of the recipe'
									},
									description: {
										type: 'string',
										description: 'Description of the recipe'
									},
									calories: {
										type: 'number',
										description: 'Number of calories of the recipe for one serving'
									}
								}
							}
						}
					}
				}
			}
		],
		function_call: { name: 'search_recipe' }
	});

	return openaiResponse.choices[0].message.function_call.arguments;
}

/**
 * Sort and search recipes based on database entries and GPT knowledges
 * @param {string} input User input to search recipes
 * @param {import('@prisma/client').User} user User object
 * @returns {Promise<{ title: string; description: string }[]>} List of recipes sorted by GPT
 */
export async function searchAndSortRecipes(input, user) {
	const now = new Date();
	const month = now.getMonth();

	let preferences = '';

	if (user) {
		preferences = `
		L'utilisateur:
		- est allergique à: $$$${user.allergies.map((a) => a.name).join(', ')}$$$;
		- a le régime: $$$${user.diets.map((d) => d.diet).join(', ')}$$$;
		- a les préférences: $$$${user.preferences.map((p) => p.preference).join(', ')}$$$;
		`;
	}

	const result = await promptToSearchRecipe(`
	Tu es un chef cuisinier étoilé, réputé pour tes talents culinaires du monde entier.
	L'utilisateur recherche des recettes avec le mot-clé suivant : $$${input}$$. 
	
	Génère des recettes qui correspondent à la recherche de l'utilisateur.
	Ensuite, triez-les en fonction de leur pertinence par rapport à la recherche de l'utilisateur.
	De plus, comme nous sommes au ${month + 1}ème mois de l'année, met en avant les
	recettes qui utilisent des ingrédients de saison.
	Tous les noms doivent être en français dès que possible.
	
	${preferences}

	10 éléments sont attendus.
	`);

	const obj = JSON.parse(result);

	return obj;
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

async function promptToGenerateRecipe(prompt) {
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
		response_format: { type: 'json_object' },
		functions: [
			{
				name: 'generate_recipe',
				parameters: {
					type: 'object',
					properties: {
						title: {
							type: 'string',
							description: 'Titre de la recette'
						},
						cookingTime: {
							type: 'string',
							description: 'Temps de cuisson de la recette en minutes'
						},
						description: {
							type: 'string',
							description: 'Description de la recette'
						},
						calories: {
							type: 'number',
							description: 'Nombre de calories de la recette pour une portion'
						},
						servings: {
							type: 'number',
							description: 'Nombre de portions de la recette'
						},
						ingredients: {
							type: 'array',
							description: 'Liste des ingrédients de la recette',
							items: {
								type: 'string'
							}
						},
						instructions: {
							type: 'array',
							description: 'Liste des instructions de la recette',
							items: {
								type: 'string'
							}
						}
					}
				}
			}
		],
		function_call: { name: 'generate_recipe' }
	});

	return openaiResponse.choices[0].message.function_call.arguments;
}

export async function generateRecipe2(name) {
	const result = await promptToGenerateRecipe(
		`
		Donne-moi cette recette : $$${name}$$.
		Réponds en français dès que possible.
	`
	);

	const obj = JSON.parse(result);

	return obj;
}

async function promptToSearchRecipesByCalories(prompt) {
	const openaiResponse = await openai.chat.completions.create({
		model: 'gpt-3.5-turbo-0613',
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
		// response_format: { type: 'json_object' },
		functions: [
			{
				name: 'fetch_recipes_by_calorie',
				description: 'Get list of recipes by calories',
				parameters: {
					type: 'object',
					properties: {
						items: {
							type: 'array',
							description: 'List of recipes',
							items: {
								type: 'object',
								properties: {
									title: {
										type: 'string',
										description: 'Titre de la recette'
									},
									description: {
										type: 'string',
										description: 'Description de la recette'
									},
									calories: {
										type: 'number',
										description: 'Nombre de calories de la recette pour une portion'
									}
								}
							}
						}
					}
				}
			}
		],
		function_call: { name: 'fetch_recipes_by_calorie' }
	});

	console.log(openaiResponse.choices[0].message.function_call.arguments);

	return openaiResponse.choices[0].message.function_call.arguments;
}

export async function searchRecipesByCalories(calories, user) {
	const [min, max] = calories.split('-');
	const now = new Date();
	const month = now.getMonth();
	let preferences = '';

	if (user) {
		preferences = `
		L'utilisateur:
		- est allergique à: $$$${user.allergies.map((a) => a.name).join(', ')}$$$;
		- a le régime: $$$${user.diets.map((d) => d.diet).join(', ')}$$$;
		- a les préférences: $$$${user.preferences.map((p) => p.preference).join(', ')}$$$;
		`;
	}

	const result = await promptToSearchRecipesByCalories(
		`
			Tu es un chef cuisinier étoilé, réputé pour tes talents culinaires du monde entier.
	Génère des recettes qui ont entre $$${min}$$ et $$${max}$$ calories.
	Ensuite, triez-les en fonction de leur pertinence par rapport à la recherche de l'utilisateur.
	De plus, comme nous sommes au ${month + 1}ème mois de l'année, met en avant les
	recettes qui utilisent des ingrédients de saison.
	Tous les noms doivent être en français dès que possible.

	${preferences}
	`
	);

	console.log(result);
	console.log(min, max);

	return JSON.parse(result);
}
