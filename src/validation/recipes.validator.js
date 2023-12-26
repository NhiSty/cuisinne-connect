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
*	recipeCommentSchemaValidator
*/
const recipeCommentSchema = vine.object({
	rating: vine.number().decimal([1, 5]),
	comment: vine.string().optional()
});
export const recipeCommentSchemaValidator = vine.compile(recipeCommentSchema);

/*
*	recipeListCourse
*/
const gptGeneratesListCourse = vine.object({
	listCourse: vine.array(vine.string())	
});
export const recipeListCourse = vine.compile(gptGeneratesListCourse);
