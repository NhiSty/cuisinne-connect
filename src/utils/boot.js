import { appVariablesValidator } from '../validation/app.validator.js';

export const appVariables = await appVariablesValidator.validate({
	port: process.env.PORT || 3000,
	JWT_SECRET: process.env.JWT_SECRET
});
