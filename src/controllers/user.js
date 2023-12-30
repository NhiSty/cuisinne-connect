import { db } from '../database.js';
import { updateUserSettings } from '../services/user.service.js';
import { userSettingsValidator } from '../validation/user.validator.js';

/**
 * Fetch user settings
 * @param {import('express').Request} req Express http request
 * @param {import('express').Response} res Express http response
 */
export async function getUserSettingsController(req, res) {
	res.send({
		diets: req.user.diets.map(({ diet }) => diet),
		allergies: req.user.allergies.map(({ allergy }) => allergy),
		preferences: req.user.preferences.map(({ preference }) => preference)
	});
}

/**
 * Update user settings
 * @param {import('express').Request} req Express http request
 * @param {import('express').Response} res Express http response
 */
export async function updateUserSettingsController(req, res) {
	const data = await userSettingsValidator.validate(req.body);

	await updateUserSettings(req.user, data);

	res.sendStatus(204);
}
