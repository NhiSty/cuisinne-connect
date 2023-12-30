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
	getLastRecipe,
	getListCourse,
	getRecipeRatingsController,
	getCommentResponseController,
	postRatingController,
	postCommentController,
	updateRecipeFavoriteForUser,
	getUserFavoritesController
} from './controllers/recipes.js';
import { authOnlyMiddleware } from './middleware/authOnly.js';
import { guestOnlyMiddleware } from './middleware/guestOnly.js';
import { getUserSettingsController, updateUserSettingsController } from './controllers/user.js';

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
	app.get('/api/user/favorites', authOnlyMiddleware, getUserFavoritesController);

	app.get('/api/recipes', getRecipesController);
	app.get('/api/recipes/last', getLastRecipe);
	app.get('/api/recipes/seasons', fetchSeasonalRecipesController);
	app.get('/api/recipes/:name', getRecipeController);
	app.get('/api/recipes/:name/rating', getRecipeRatingController);
	app.get('/api/recipes/:name/ingredients', getRecipeIngredientsController);
	app.get('/api/recipes/:name/similar', getSimilarRecipesController);
	app.get('/api/recipes/:name/sideDish', getRecipeSideDishController);
	app.get('/api/recipes/:name/listCourse', getListCourse);
	app.put('/api/recipes/:name/favorite', authOnlyMiddleware, updateRecipeFavoriteForUser);

	// recipe comment get
	app.get('/api/recipes/:name/comments', getRecipeRatingsController);
	app.get('/api/recipes/:name/comments/:id', getCommentResponseController);
	// recipe comment post
	app.post('/api/recipes/:name/comments', authOnlyMiddleware, postRatingController);
	app.post('/api/recipes/:name/comments/:id', authOnlyMiddleware, postCommentController);

	/**
	 * User preferences
	 */
	// Get settings
	app.get('/api/user/settings', authOnlyMiddleware, getUserSettingsController);
	// Update settings
	app.post('/api/user/settings', authOnlyMiddleware, updateUserSettingsController);
}
