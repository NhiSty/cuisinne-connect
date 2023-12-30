import { getUserFromToken } from '../services/user.service.js';

/**
 *
 * @param {import('express').Request} req Http request
 * @param {import('express').Response} res Http response
 * @param {import('express').NextFunction} next Pass control to the next middleware
 */
export async function userSessionMiddleware(req, res, next) {
	if (req.cookies.token) {
		const user = await getUserFromToken(req.cookies.token);
		req.user = user;

		if (!user) {
			res.clearCookie('token');
		}
	}

	next();
}
