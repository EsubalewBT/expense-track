import { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import { config } from '../config/config';
import { ApiError } from '../utils/ApiError';

type ErrorWithStatus = {
	statusCode?: number;
	message?: string;
	stack?: string;
};

const isMongooseBadRequestError = (error: unknown): boolean => {
	return (
		error instanceof mongoose.Error.ValidationError ||
		error instanceof mongoose.Error.CastError
	);
};

const getSafeMessage = (statusCode: number, error: ErrorWithStatus): string => {
	if (typeof error.message === 'string' && error.message.trim().length > 0) {
		return error.message;
	}

	if (statusCode === httpStatus.BAD_REQUEST) {
		return 'Bad Request';
	}

	return 'Internal Server Error';
};

export const errorConverter: ErrorRequestHandler = (err, _req, _res, next) => {
	if (err instanceof ApiError) {
		return next(err);
	}

	const incomingError = (err ?? {}) as ErrorWithStatus;
	const statusCode =
		typeof incomingError.statusCode === 'number'
			? incomingError.statusCode
			: isMongooseBadRequestError(err)
				? httpStatus.BAD_REQUEST
				: httpStatus.INTERNAL_SERVER_ERROR;

	const convertedError = new ApiError(statusCode, getSafeMessage(statusCode, incomingError), false);
	convertedError.stack = incomingError.stack;

	return next(convertedError);
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	const apiError = err instanceof ApiError
		? err
		: new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error', false);

	let statusCode = apiError.statusCode;
	let message = apiError.message;

	if (config.env === 'production' && !apiError.isOperational) {
		statusCode = httpStatus.INTERNAL_SERVER_ERROR;
		message = 'Internal Server Error';
	}

	res.locals.errorMessage = apiError.message;

	const response: { code: number; message: string; stack?: string } = {
		code: statusCode,
		message,
	};

	if (config.env === 'development') {
		response.stack = apiError.stack;
		console.error(apiError);
	}

	res.status(statusCode).json(response);
};
