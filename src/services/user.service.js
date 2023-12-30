import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { db } from '../database.js';
import { NotFoundError } from '../utils/errors.js';
import { appVariables } from '../utils/boot.js';

/**
 * Get a user from the email address
 * @param {string} email user email address
 * @returns {Promise<import('@prisma/client').User>} User object
 */
export async function getUserByEmail(email) {
	const user = await db.user.findUnique({
		where: { email },
		include: { diets: true, allergies: true, preferences: true }
	});

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

/**
 * Get user favorites recipes
 * @param {user} user User object
 * @returns {Promise<import('@prisma/client').Recipe[]>} User favorites recipes
 */
export async function getUserFavorites(user) {
	return db.recipe.findMany({
		where: {
			favoriteRecipes: {
				some: {
					userId: user.id
				}
			}
		}
	});
}

/**
 * Get user settings
 * @param {user} user User object
 * @returns {Promise<import('@prisma/client').UserSettings>} User settings
 */
export async function getUserSettings(user) {
	return await db.userSettings.findUnique({
		where: {
			userId: user.id
		}
	});
}

/**
 * Update user settings
 * @param {user} user User object
 * @param {{ diets: string[]; allergies: string[]; preferences: string[] }} settings User settings
 */
export async function updateUserSettings(user, settings) {
	return db.$transaction([
		db.userDiet.deleteMany({
			where: {
				userId: user.id
			}
		}),
		db.userAllergy.deleteMany({
			where: {
				userId: user.id
			}
		}),
		db.userPreference.deleteMany({
			where: {
				userId: user.id
			}
		}),

		// Then create the new user settings
		db.userDiet.createMany({
			data: settings.diets.map((val) => ({ diet: val, userId: user.id }))
		}),
		db.userAllergy.createMany({
			data: settings.allergies.map((val) => ({ allergy: val, userId: user.id }))
		}),
		db.userPreference.createMany({
			data: settings.preferences.map((val) => ({ preference: val, userId: user.id }))
		})
	]);
}
