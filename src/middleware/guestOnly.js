/**
 *
 * @param {import('express').Request} req Http request
 * @param {import('express').Response} res Http response
 * @param {import('express').NextFunction} next Pass control to the next middleware
 */
export function guestOnlyMiddleware(req, res, next) {
	if (req.user != null) {
		return res.status(401).send({
			message: 'Unauthorized'
		});
	}

	next();
}
