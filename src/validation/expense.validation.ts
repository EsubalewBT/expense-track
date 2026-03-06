import Joi from 'joi';

import type { ValidationSchema } from '../middleware/validate';

const expenseCategories = ['Food', 'Transport', 'Entertainment', 'Health', 'Other'] as const;

const objectIdSchema = Joi.string()
	.length(24)
	.hex()
	.required()
	.messages({
		'string.base': 'id must be a string',
		'string.length': 'id must be a valid Mongo ObjectId',
		'string.hex': 'id must be a valid Mongo ObjectId',
		'any.required': 'id is required',
	});

const createExpenseBodySchema = Joi.object({
	title: Joi.string().trim().min(1).max(120).required(),
	amount: Joi.number().min(0).required(),
	category: Joi.string()
		.valid(...expenseCategories)
		.required(),
	description: Joi.string().trim().max(1000).allow('').optional(),
	date: Joi.date().optional(),
});

const updateExpenseBodySchema = Joi.object({
	title: Joi.string().trim().min(1).max(120),
	amount: Joi.number().min(0),
	category: Joi.string().valid(...expenseCategories),
	description: Joi.string().trim().max(1000).allow(''),
	date: Joi.date(),
})
	.min(1)
	.messages({
		'object.min': 'At least one field is required to update an expense',
	});

export const createExpenseSchema: ValidationSchema = {
	body: createExpenseBodySchema,
};

export const updateExpenseSchema: ValidationSchema = {
	params: Joi.object({
		id: objectIdSchema,
	}),
	body: updateExpenseBodySchema,
};

export const getExpenseIdSchema: ValidationSchema = {
	params: Joi.object({
		id: objectIdSchema,
	}),
};

export const deleteExpenseSchema: ValidationSchema = {
	params: Joi.object({
		id: objectIdSchema,
	}),
};
