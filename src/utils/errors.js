export class AppError extends Error {
	constructor(message) {
		super(message);
		this.status = 500;
	}
}

export class NotFoundError extends AppError {
	constructor(message = 'Route not found') {
		super(message);
		this.status = 404;
	}
}
