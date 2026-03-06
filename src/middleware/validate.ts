import { RequestHandler } from 'express';
import Joi from 'joi';

import { ApiError } from '../utils/ApiError';

type RequestPart = 'params' | 'query' | 'body';
type SegmentSchema = Joi.ObjectSchema | Joi.ArraySchema;

export type ValidationSchema = Partial<Record<RequestPart, SegmentSchema>>;

const REQUEST_PARTS: RequestPart[] = ['params', 'query', 'body'];

const pick = <T extends object, K extends keyof T>(
	source: T,
	keys: readonly K[],
): Partial<Pick<T, K>> => {
	return keys.reduce<Partial<Pick<T, K>>>((result, key) => {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			result[key] = source[key];
		}

		return result;
	}, {});
};

const formatValidationError = (error: Joi.ValidationError): string => {
	return error.details.map((detail) => detail.message).join(', ');
};

const validate = (schema: ValidationSchema): RequestHandler => {
	const schemaToValidate = pick(schema, REQUEST_PARTS);
	const schemaKeys = Object.keys(schemaToValidate) as RequestPart[];
	const compiledSchema = Joi.compile(schemaToValidate);

	return (req, _res, next) => {
		const requestPayload = pick(req, schemaKeys);

		const { error, value } = compiledSchema
			.prefs({
				abortEarly: false,
				errors: { label: 'key' },
				stripUnknown: true,
			})
			.validate(requestPayload);

		if (error) {
			return next(new ApiError(400, formatValidationError(error)));
		}

		Object.assign(req, value);
		return next();
	};
};

export default validate;
