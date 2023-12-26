import { errors as vineErrors } from '@vinejs/vine';
import { AppError } from '../utils/errors.js';

/**
 * Express error handler
 * @param {Error} error Error to handle
 * @param {import('express').Request} req http request
 * @param {import('express').Response} res http response
 * @returns
 */
export function errorHandler(error, req, res, next) {
	if (error instanceof vineErrors.E_VALIDATION_ERROR) {
		return res.status(400).send({
			message: error.message,
			errors: error.messages
		});
	}

	if (error instanceof AppError) {
		return res.status(error.status || 500).send({
			message: error.message
		});
	}

	console.error(error);
	res.status(500).send({
		message: 'Internal Server Error'
	});
}
