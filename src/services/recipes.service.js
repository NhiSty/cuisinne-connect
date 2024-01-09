import { db } from '../database.js';
import { generateRecipe, generateRecipeSideDish } from './gpt.service.js';

export async function getRecipe(name) {
	const recipe = await db.recipe.findUnique({
		where: {
			title: name
		},
		include: {
			instructions: true,
			author: true
		}
	});

	return recipe;
}

export async function getRecipeOrGenerate(name, currentUser = null) {
	const recipe = await getRecipe(name);

	if (recipe) return recipe;

	// If the recipe does not exist, then ask ChatGPT to create it
	const generatedRecipe = await generateRecipe(name);

	// Then create the recipe in database
	const result = await db.recipe.create({
		data: {
			title: generatedRecipe.title,
			description: generatedRecipe.description,
			cookingTime: generatedRecipe.cookingTime,
			servings: generatedRecipe.servings,
			ingredients: {
				createMany: {
					data: generatedRecipe.ingredients.map((ingredient) => ({
						name: ingredient
					}))
				}
			},
			authorId: currentUser?.id,
			instructions: {
				createMany: {
					data: generatedRecipe.instructions.map((instructions) => ({ instructions }))
				}
			}
		},
		include: {
			instructions: true,
			author: true
		}
	});

	return result;
}

export async function getManyRecipes(name) {
	const recipe = await db.recipe.findMany({
		where: {
			title: {

			}
		}
	});

	return recipe;
}

export async function findRecipesByName(name) {
	return db.recipe.findMany({
		where: {
			title: {
				equals: `%${name}%`,
				mode: 'insensitive'
			}
		},
		orderBy: {
			createdAt: 'desc',
		},
		take: 5,
		select: {
			title: true,
			description: true
		}
	});
}

export async function getLastRecipeFromDb() {
	const recipe = await db.recipe.findFirst({
		orderBy: {
			createdAt: 'desc'
		}
	});

	return recipe || null;
}

export async function getRecipeRatings(name) {
	const ratings = await db.rating.aggregate({
		where: {
			recipe: {
				title: name
			}
		},
		_avg: {
			rating: true
		}
	});

	// If there is no ratings, return 0
	if (!ratings) {
		return null;
	}

	const val = ratings._avg.rating || 0;

	return Math.round(val * 10) / 10;
}

export async function getRecipeSideDish(name) {
	return await generateRecipeSideDish(name);
}

export async function isRecipeInUserFavorites(user, recipe) {
	const isInFavorites = await db.favoriteRecipe.findFirst({
		where: {
			userId: user.id,
			recipeId: recipe.id
		}
	});

	return isInFavorites != null;
}

export async function toggleInFavorites(user, recipe) {
	const favorite = await db.favoriteRecipe.findFirst({
		where: {
			userId: user.id,
			recipeId: recipe.id
		}
	});

	if (favorite != null) {
		await db.favoriteRecipe.delete({ where: { id: favorite.id } });
	} else {
		await db.favoriteRecipe.create({
			data: {
				recipeId: recipe.id,
				userId: user.id
			}
		});
	}
}
