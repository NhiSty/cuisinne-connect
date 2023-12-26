import {
	fetchUserController,
	loginUserController,
	logoutUserController,
	registerUserController
} from './controllers/auth.js';
import { sendMessageController } from './controllers/openid.js';
import {
	fetchSeasonalRecipesController,
	getRecipesController,
	getRecipeController,
	getRecipeIngredientsController,
	getRecipeRatingController,
	getSimilarRecipesController,
	getRecipeSideDishController,
	getRecipeCommentsController,
	postCommentPostCommentController,
	getLastRecipe,
	getListCourse
} from './controllers/recipes.js';
import { authOnlyMiddleware } from './middleware/authOnly.js';
import { guestOnlyMiddleware } from './middleware/guestOnly.js';

/**
 * Configure application routes
 * @param {import('express').Express} app
 */
export function setupRoutes(app) {
	app.post('/api/send-message', sendMessageController);

	app
		.route('/api/auth')
		.post(guestOnlyMiddleware, loginUserController)
		.delete(authOnlyMiddleware, logoutUserController)
		.get(authOnlyMiddleware, fetchUserController);

	app.post('/api/auth/register', guestOnlyMiddleware, registerUserController);

	app.get('/api/recipes', getRecipesController);
	app.get('/api/recipes/last', getLastRecipe);
	app.get('/api/recipes/seasons', fetchSeasonalRecipesController);
	app.get('/api/recipes/:name', getRecipeController);
	app.get('/api/recipes/:name/rating', getRecipeRatingController);
	app.get('/api/recipes/:name/ingredients', getRecipeIngredientsController);
	app.get('/api/recipes/:name/similar', getSimilarRecipesController);
	app.get('/api/recipes/:name/sideDish', getRecipeSideDishController);
	app.get('/api/recipes/:name/listCourse', getListCourse);


	// recipe comment get
	app.get('/api/recipes/:name/comments', getRecipeCommentsController);
	// recipe comment post
	app.post('/api/recipes/:name/comments', authOnlyMiddleware, postCommentPostCommentController);
}
