import vine from '@vinejs/vine';

/*
 *	seasonalRecipesValidator
 */
const seasonalRecipesSchema = vine.object({
	recipes: vine.array(vine.string())
});
export const seasonalRecipesValidator = vine.compile(seasonalRecipesSchema);

/*
 *	recipeSearchParamValidator
 */
const recipeSearchParamSchema = vine.string().minLength(1);
export const recipeSearchParamValidator = vine.compile(recipeSearchParamSchema);

/*
 *	gptSortedRecipesValidator
 */
const gptSortedRecipesSchema = vine.object({
	results: vine.array(
		vine.object({
			title: vine.string(),
			description: vine.string()
		})
	)
});
export const gptSortedRecipesValidator = vine.compile(gptSortedRecipesSchema);

/*
 *	recipeNameParamValidator
 */
const recipeNameParamSchema = vine.string().minLength(1);
export const recipeNameParamValidator = vine.compile(recipeNameParamSchema);

/*
 *	gptGeneratedRecipeValidator
 */
const gptGeneratedRecipe = vine.object({
	title: vine.string(),
	description: vine.string(),
	cookingTime: vine.number(),
	nombre_calories: vine.number(),
	price: vine.number(),
	servings: vine.number(),
	ingredients: vine.array(vine.string()),
	instructions: vine.array(vine.string())
});
export const gptGeneratedRecipeValidator = vine.compile(gptGeneratedRecipe);

/*
 *	gptGeneratedSideDishesValidator
 */
const gptGeneratedSideDishes = vine.object({
	sideDishes: vine.array(vine.string())
});
export const gptGeneratedSideDishesValidator = vine.compile(gptGeneratedSideDishes);

/*
 *	recipeRatingValidator
 */
const recipeRatingSchema = vine.object({
	rating: vine.number().min(0).max(5),
	comment: vine.string().optional()
});
export const recipeRatingValidator = vine.compile(recipeRatingSchema);

/*
 *	commentIdParamValidator
 */
const commentIdParamSchema = vine.number().min(1);
export const commentIdParamValidator = vine.compile(commentIdParamSchema);

/*
 *	recipeCommentValidator
 */
const recipeCommentSchema = vine.object({
	comment: vine.string().optional()
});
export const recipeCommentValidator = vine.compile(recipeCommentSchema);

/*
 *	recipeListCourse
 */
const gptGeneratesListCourse = vine.object({
	listCourse: vine.array(vine.string())
});
export const recipeListCourse = vine.compile(gptGeneratesListCourse);
