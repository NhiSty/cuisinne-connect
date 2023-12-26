import { db } from '../database.js';
import { promptToGPT, searchAndSortRecipes } from '../services/gpt.service.js';
import {
	getAllRecipes,
	getRecipe,
	getRecipeRatings,
	getRecipeSideDish,
	getLastRecipeFromDb
} from '../services/recipes.service.js';
import {
	recipeCommentSchemaValidator,
	recipeListCourse,
	recipeNameParamValidator,
	recipeSearchParamValidator,
	seasonalRecipesValidator
} from '../validation/recipes.validator.js';

/**
 *
 * @param {import('express').Request} req Express http request
 * @param {import('express').Request} res Express http response
 */
export async function getRecipesController(req, res) {
	const userInput = await recipeSearchParamValidator.validate(req.query.search);

	// Get all the recipes names
	const recipes = await getAllRecipes();

	// Ask GPT to search recipes based on the user input
	const { results } = await searchAndSortRecipes(recipes, userInput);

	res.status(200).send({ items: results });
}

export async function getRecipeController(req, res) {
	const name = await recipeNameParamValidator.validate(req.params.name);
	const recipe = await getRecipe(name, req.user);

	res.json(recipe);
}

export async function getRecipeRatingController(req, res) {
	const name = await recipeNameParamValidator.validate(req.params.name);
	const rating = await getRecipeRatings(name);

	res.json({ rating });
}

export async function getRecipeIngredientsController(req, res) {
	const title = await recipeNameParamValidator.validate(req.params.name);
	const recipe = await getRecipe(title);
	const ingredients = await db.recipeIngredient.findMany({ where: { recipeId: recipe.id } });

	if (!ingredients) {
		return res.status(404).json({ error: 'Ingredients not found' });
	}

	res.json(ingredients);
}

/**
 * Fetch seasonal recommendations from GPT
 * @param {import('express').Request} req Express http request
 * @param {import('express').Response} res Express http response
 */
export async function fetchSeasonalRecipesController(req, res) {
	const now = new Date();
	const month = now.getMonth();

	const gptResponse = await promptToGPT(
		`Nous sommes le ${month + 1}ème mois de l'année.\
		Quelles sont les meilleures recommendations de recette de saisons (qui respecte les ingrédients de saison) pour cette période de l'année ?
		Réponds en français dès que possible.
		Schéma de réponse (5 éléments):
		{
			"recipes": ["Nom de la recette", "", ...],
		}
		`
	);

	const obj = JSON.parse(gptResponse);
	const data = await seasonalRecipesValidator.validate(obj);

	res.json(data);
}

/**
 * Fetch similar recipes from GPT
 * @param {import('express'.Request)} req Express http request
 * @param {import('express'.Response)} res Express http response
 */
export async function getSimilarRecipesController(req, res) {
	const name = await recipeNameParamValidator.validate(req.params.name);
	const recipe = await getRecipe(name);

	const now = new Date();
	const month = now.getMonth();

	const gptResponse = await promptToGPT(
		`Nous sommes le ${month + 1}ème mois de l'année.

		Je veux une recette similaire à ${recipe.title}.
		Les recettes doivent utiliser des ingrédients de saison.
		
		Il doit absolument y avoir 5 éléments.
		Si on n'a pas 5 éléments, proposez de nouvelles recettes qui
		pourraient intéresser l'utilisateur.
	
		Tous les noms doivent être en français dès que possible.

		Schéma de réponse (5 éléments):
		{
			"recipes": ["Nom de la recette", "", ...],
		}
		`
	);

	const obj = JSON.parse(gptResponse);
	const data = await seasonalRecipesValidator.validate(obj);

	res.json(data);
}

/**
 * Fetch recipe side dish from GPT
 * @param {import('express').Request} req Express http request
 * @param {import('express').Response} res Express http response
 */
export async function getRecipeSideDishController(req, res) {
	const name = await recipeNameParamValidator.validate(req.params.name);
	const sideDishes = await getRecipeSideDish(name);

	res.send({
		sideDishes
	});
}

/**
 * Fetch recipe comments from database
 * @param {import('express').Request} req Express http request
 * @param {import('express').Response} res Express http response
 */
export async function getRecipeCommentsController(req, res) {
	const name = await recipeNameParamValidator.validate(req.params.name);
	const recipe = await getRecipe(name);

	const comments = await db.rating.findMany({
		where: {
			recipeId: recipe.id
		},
		include: {
			user: true
		}
	});

	res.json(comments);
}

/**
 * Post a new comment into database
 * @param {import('express').Request} req Express http request
 * @param {import('express').Response} res Express http response
 */
export async function postCommentPostCommentController(req, res) {

	req.body.rating = parseFloat(req.body.rating);

	const name = await recipeNameParamValidator.validate(req.params.name);

	const recipe = await getRecipe(name);


	const data = await recipeCommentSchemaValidator.validate(req.body);

	const comment = await db.rating.create({
		data: {
			rating: data.rating,
			comment: data.comment,
			recipeId: recipe.id,
			userId: req.user.id
		}
	});

	res.json(comment);
}


/**
 * Get last recipe from database
 * @param {import('express').Request} req Express http request
 * @param {import('express').Response} res Express http response
 */
export async function getLastRecipe(req, res) {
	
	const recipe = await getLastRecipeFromDb();
	console.log(recipe);
	res.json(recipe);
}

/**
 * Get course list from gpt for a specific recipe
 * @param {import('express').Request} req Express http request
 * @param {import('express').Response} res Express http response
 */
export async function getListCourse(req, res) {
	const name = await recipeNameParamValidator.validate(req.params.name);
	const recipe = await getRecipe(name);

	const ingredients = await db.recipeIngredient.findMany({ where: { recipe: { title: name }} });

	const gptResponse = await promptToGPT(
		`Je veux une liste de courses pour ${recipe.title}.
		Je veux que tu te bases sur les ingrédients de la recette qui sont les suivants : ${ingredients.map((i) => i.name).join(', ')} et que tu ajoutes a la liste les éléments manquants, tel que le sel, le poivre, etc et les ustensiles de cuisine.
	
		La réponse doit être en français.

		Schéma de réponse :
		{
			"listCourse": ["Element a acheter", "", ...],
		}
		`
	);

	const obj = JSON.parse(gptResponse);
	const data = await recipeListCourse.validate(obj);

	res.json(data);
}