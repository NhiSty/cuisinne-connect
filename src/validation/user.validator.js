import vine from '@vinejs/vine';
import { db } from '../database.js';

/**
 * @interface UniqueRuleOption
 * @property {string} field
 */

/**
 * @param {unknown} value
 * @param {UniqueRuleOption} option
 */
const unique = vine.createRule(async (value, option, field) => {
	if (typeof value !== 'string') {
		return;
	}

	if (!field.isValid) {
		return;
	}

	const user = await db.user.findFirst({ where: { [option.field]: value } });

	console.log(user);

	if (user) {
		field.report('The {{ field }} field is not unique', 'unique', field);
	}
});

const userLoginSchema = vine.object({
	email: vine.string().email(),
	password: vine.string().minLength(6)
});
export const userLoginValidator = vine.compile(userLoginSchema);

const userRegisterSchema = vine.object({
	username: vine
		.string()
		.minLength(3)
		.use(unique({ field: 'username' })),
	email: vine
		.string()
		.email()
		.use(unique({ field: 'email' })),
	password: vine.string().minLength(6).confirmed({ confirmationField: 'confirmation' })
});
export const userRegisterValidator = vine.compile(userRegisterSchema);
