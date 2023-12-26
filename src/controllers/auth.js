import { userLoginValidator, userRegisterValidator } from '../validation/user.validator.js';
import {
	createUser,
	generateUserToken,
	getUserByEmail,
	validateUserPassword
} from '../services/user.service.js';

/**
 * @constant {number} SESSION_COOKIE_DURATION Session cookie duration in milliseconds (7 days)
 */
const SESSION_COOKIE_DURATION = 1000 * 60 * 60 * 24 * 7;

/**
 * User login route
 */
export async function loginUserController(req, res) {
	const data = await userLoginValidator.validate(req.body);

	const user = await getUserByEmail(data.email);

	if (!(await validateUserPassword(user, data.password))) {
		return res.sendStatus(401);
	}

	const jwt = await generateUserToken(user);

	return res
		.cookie('token', jwt, {
			httpOnly: true,
			sameSite: 'strict',
			maxAge: SESSION_COOKIE_DURATION
		})
		.send(user);
}

/**
 * User register route
 * @param {import('express').Request} req Express request
 * @param {import('express').Response} res Express response
 */
export async function registerUserController(req, res) {
	const data = await userRegisterValidator.validate(req.body);

	const user = await createUser({
		username: data.username,
		email: data.email,
		password: data.password
	});

	const jwt = await generateUserToken(user);

	return res
		.cookie('token', jwt, {
			httpOnly: true,
			sameSite: 'strict',
			maxAge: SESSION_COOKIE_DURATION
		})
		.send(user);
}

/**
 * Delete user session
 */
export async function logoutUserController(req, res) {
	return res.clearCookie('token').sendStatus(204);
}

/**
 * Fetch user data
 */
export async function fetchUserController(req, res) {
	return res.send(req.user);
}
