import { getUserFromToken } from '../services/user.service.js';

/**
 *
 * @param {import('express').Request} req Http request
 * @param {import('express').Response} res Http response
 * @param {import('express').NextFunction} next Pass control to the next middleware
 */
export async function userSessionMiddleware(req, res, next) {
	// If there is a token cookie
	if (req.cookies.token) {
		// Try to get the user from it
		const user = await getUserFromToken(req.cookies.token);
		req.user = user;

		// If the user is null, delete the cookie
		if (!user) {
			res.clearCookie('token');
		}
	}
	next();
}
