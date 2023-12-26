import { db } from '../database.js';
import { NotFoundError } from '../utils/errors.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { appVariables } from '../utils/boot.js';

/**
 * Get a user from the email address
 * @param {string} email user email address
 * @returns {Promise<import('@prisma/client').User>} User object
 */
export async function getUserByEmail(email) {
	const user = await db.user.findUnique({ where: { email } });

	if (!user) {
		throw new NotFoundError('User not found');
	}

	return user;
}

/**
 * Validate user password
 * @param {import('@prisma/client').User} user User to validate
 * @param {string} password Password to validate
 * @returns {Promise<boolean>} True if password is valid
 */
export async function validateUserPassword(user, password) {
	return await argon2.verify(user.passwordHash, password);
}

/**
 * Generate user JWT token
 * @param {import('@prisma/client').User} user User to generate token for
 * @returns {Promise<string>} JWT token
 */
export async function generateUserToken(user) {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.user
		},
		appVariables.JWT_SECRET
	);
}

/**
 * Get user from JWT token
 * @param {string} token JWT token
 * @returns {Promise<import('@prisma/client').User | null>} User object
 */
export async function getUserFromToken(token) {
	try {
		const data = jwt.verify(token, appVariables.JWT_SECRET);
		return await getUserByEmail(data.email);
	} catch (err) {
		return null;
	}
}

/**
 * @interface CreateUserOption
 * @property {string} username
 * @property {string} email
 * @property {string} password password
 */
/**
 * Create a new user in database
 * @param {CreateUserOption} user User data
 * @returns {Promise<import('@prisma/client').User>} Created user
 */
export async function createUser(user) {
	const passwordHash = await argon2.hash(user.password);

	return await db.user.create({
		data: {
			username: user.username,
			email: user.email,
			passwordHash
		}
	});
}
