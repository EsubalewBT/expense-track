export class ApiError extends Error {
	public readonly statusCode: number;
	public readonly isOperational: boolean;

	constructor(statusCode: number, message: string, isOperational = true) {
		super(message);

		this.name = new.target.name;
		this.statusCode = statusCode;
		this.isOperational = isOperational;

		// Ensures `instanceof ApiError` works correctly in transpiled output.
		Object.setPrototypeOf(this, new.target.prototype);

		// Available in V8 runtimes (Node.js). Keeps stack trace clean.
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, new.target);
		}
	}
}
