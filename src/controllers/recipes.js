import { db } from '../database.js';
import { promptToGPT, searchAndSortRecipes } from '../services/gpt.service.js';
import {
	getAllRecipes,
	getLastRecipeFromDb,
	getRecipe,
	getRecipeRatings,
	getRecipeSideDish,
	isRecipeInUserFavorites,
	toggleInFavorites
} from '../services/recipes.service.js';
import {
	commentIdParamValidator,
	recipeRatingValidator,
	recipeNameParamValidator,
	recipeListCourse,
	recipeSearchParamValidator,
	seasonalRecipesValidator,
	recipeCommentValidator
} from '../validation/recipes.validator.js';
import { getUserFavorites } from '../services/user.service.js';

/**
 *
 * @param {import('express').Request} req Express http request
 * @param {import('express').Request} res Express http response
 */
export async function getRecipesController(req, res) {
	const userInput = await recipeSearchParamValidator.validate(req.query.search);
	const lang = req.headers['accept-language'] || 'fr';

	const recipes = await getAllRecipes();

	const { results } = await searchAndSortRecipes(recipes, userInput);

	/*const items = await promptToGPT(
		`Voici un JSON, retourne le en traduisant le contenu en "${lang}" (si nécéssaire):
		\`\`\`
		${JSON.stringify(results)}
		\`\`\`
		`,
		lang
	);*/

	res.status(200).send({ items:results });
}

export async function getRecipeController(req, res) {
	const name = await recipeNameParamValidator.validate(req.params.name);
	const lang = req.headers['accept-language'] || 'fr';

	const recipe = await getRecipe(name, req.user);
	let isInFavorites;

	if (req.user) {
		isInFavorites = await isRecipeInUserFavorites(req.user, recipe);
	}

	const translatedRecipe = await promptToGPT(
		`Voici un JSON, retourne le en traduisant le contenu en "${lang}" (si nécessaire):
		\`\`\`
		${JSON.stringify(recipe)}
		\`\`\`
		`,
		lang
	);

	res.json({
		...JSON.parse(translatedRecipe),
		title: recipe.title,
		isFavorite: isInFavorites
	});
}

/**
 * Fetch recipe comments from database
 * @param {import('express').Request} req Express http request
 * @param {import('express').Response} res Express http response
 */
export async function getRecipeRatingsController(req, res) {
	const name = await recipeNameParamValidator.validate(req.params.name);
	const recipe = await getRecipe(name);

	const ratings = await db.rating.findMany({
		where: {
			recipeId: recipe.id
		},
		include: {
			user: true,
			comment: true
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	let hasVoted = false;

	if (req.user) {
		const comment = await db.rating.findFirst({
			where: {
				recipeId: recipe.id,
				userId: req.user.id
			}
		});

		hasVoted = comment !== null;
	}

	res.json({ ratings, hasVoted });
}

export async function getRecipeIngredientsController(req, res) {
	const title = await recipeNameParamValidator.validate(req.params.name);
	const recipe = await getRecipe(title);
	const ingredients = await db.recipeIngredient.findMany({ where: { recipeId: recipe.id } });
	const lang = req.headers['accept-language'] || 'fr';


	if (!ingredients) {
		return res.status(404).json({ error: 'Ingredients not found' });
	}
	const translatedIngredients = await promptToGPT(
		`Voici un tableau, retourne le en traduisant le contenu en "${lang}" (si nécessaire):
		\`\`\`
		${JSON.stringify(ingredients)}
		\`\`\`
		`,
		lang
	);

	res.json(JSON.parse(translatedIngredients).ingredients);
}

/**
 * Toggle favorite state for a recipe
 * @param {import('express').Request} req Express http request
 * @param {import('express').Response} res Express http response
 */
export async function updateRecipeFavoriteForUser(req, res) {
	const name = await recipeNameParamValidator.validate(req.params.name);
	const recipe = await getRecipe(name);

	await toggleInFavorites(req.user, recipe);

	res.sendStatus(204);
}

/**
 * Fetch user favorites recipes
 */
export async function getUserFavoritesController(req, res) {
	const recipes = await getUserFavorites(req.user);

	res.json({ items: recipes });
}

/**
 * Fetch comment responses
 */
export async function getCommentResponseController(req, res) {
	const name = await recipeNameParamValidator.validate(req.params.name);
	const id = await commentIdParamValidator.validate(req.params.id);
	const recipe = await getRecipe(name);

	const comments = await db.comment.findMany({
		where: {
			recipeId: recipe.id,
			parentId: id
		},
		orderBy: {
			createdAt: 'desc'
		},
		include: {
			user: true
		}
	});

	res.json(comments);
}

/**
 * Post a new comment response into database
 * @param {import('express').Request} req Express http request
 * @param {import('express').Response} res Express http response
 */
export async function postCommentController(req, res) {
	const name = await recipeNameParamValidator.validate(req.params.name);
	const id = await commentIdParamValidator.validate(req.params.id);
	const recipe = await getRecipe(name);

	const data = await recipeCommentValidator.validate(req.body);

	const newComment = await db.comment.create({
		data: {
			content: data.comment,
			recipeId: recipe.id,
			userId: req.user.id,
			parentId: id
		}
	});

	res.json(newComment);
}

export async function getRecipeRatingController(req, res) {
	const name = await recipeNameParamValidator.validate(req.params.name);
	const rating = await getRecipeRatings(name);

	res.json({ rating });
}

/**
 * Fetch seasonal recommendations from GPT
 * @param {import('express').Request} req Express http request
 * @param {import('express').Response} res Express http response
 */
export async function fetchSeasonalRecipesController(req, res) {
	const now = new Date();
	const month = now.getMonth();
	const lang = req.headers['accept-language'] || 'fr';

	const gptResponse = await promptToGPT(
		`Nous sommes le ${month + 1}ème mois de l'année.\
		Quelles sont les meilleures recommendations de recette de saisons (qui respecte les ingrédients de saison) pour cette période de l'année ?
		Réponds en ${lang} dès que possible.
		Schéma de réponse (5 éléments):
		{
			"recipes": ["Nom de la recette", "", ...],
		}
		`, lang
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
	const lang = req.headers['accept-language'] || 'fr';

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
		`, lang
	);

	const obj = JSON.parse(gptResponse);
	const data = await seasonalRecipesValidator.validate(obj);

	const translatedData = await promptToGPT(
		`Voici un JSON, retourne le en traduisant le continue en "${lang}" (si nécéssaire):
		\`\`\`
		{
			"recipes": ${JSON.stringify(data)}
		}
		\`\`\`
		`,
		lang
	);

	res.json(JSON.parse(translatedData));
}

/**
 * Fetch recipe side dish from GPT
 * @param {import('express').Request} req Express http request
 * @param {import('express').Response} res Express http response
 */
export async function getRecipeSideDishController(req, res) {
	const name = await recipeNameParamValidator.validate(req.params.name);
	const sideDishes = await getRecipeSideDish(name);
	const lang = req.headers['accept-language'] || 'fr';

	if (!sideDishes) {
		return res.status(404).json({ error: 'Side dishes not found' });
	}

	const translatedSideDishes = await promptToGPT(
		`Voici un tableau, retourne le en traduisant le contenu en "${lang}" (si nécessaire):
		\`\`\`
		{
			"sideDishes": ${JSON.stringify(sideDishes)}
		}
		\`\`\`
		`,
		lang
	);

	res.json(JSON.parse(translatedSideDishes));
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

	const ingredients = await db.recipeIngredient.findMany({ where: { recipe: { title: name } } });

	const gptResponse = await promptToGPT(
		`Je veux une liste de courses pour ${recipe.title}.
		Je veux que tu te bases sur les ingrédients de la recette qui sont les suivants : ${ingredients
			.map((i) => i.name)
			.join(
				', '
			)} et que tu ajoutes a la liste les éléments manquants, tel que le sel, le poivre, etc et les ustensiles de cuisine.
	
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

/**
 * Post a new comment into database
 * @param {import('express').Request} req Express http request
 * @param {import('express').Response} res Express http response
 */
export async function postRatingController(req, res) {
	const name = await recipeNameParamValidator.validate(req.params.name);
	const recipe = await getRecipe(name);

	const userComment = await db.rating.findFirst({
		where: {
			recipeId: recipe.id,
			userId: req.user.id
		}
	});

	if (userComment) {
		return res.status(400).json({ error: 'You have already voted for this recipe' });
	}

	const data = await recipeRatingValidator.validate(req.body);

	const newComment = await db.rating.create({
		data: {
			rating: data.rating,
			comment: {
				create: {
					content: data.comment,
					recipeId: recipe.id,
					userId: req.user.id
				}
			},
			recipe: { connect: { id: recipe.id } },
			user: { connect: { id: req.user.id } }
		}
	});

	res.json(newComment);
}
