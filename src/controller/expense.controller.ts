import { Request, Response } from "express";

import * as expenseService from "../services/expense.service";
import { IOptions } from "../model/plugins/paginate.types";
import { ApiError } from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";

const getRequestId = (req: Request): string => {
	return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
};

const getAuthenticatedUserId = (req: Request): string => {
	if (!req.user?._id) {
		throw new ApiError(401, "Please authenticate");
	}

	return req.user._id.toString();
};

const firstQueryValue = (value: unknown): string | undefined => {
	if (Array.isArray(value)) {
		return value[0] ? String(value[0]) : undefined;
	}

	if (value === undefined || value === null) {
		return undefined;
	}

	return String(value);
};

const getPaginationOptions = (req: Request): IOptions => {
	return {
		sortBy: firstQueryValue(req.query.sortBy),
		projectBy: firstQueryValue(req.query.projectBy),
		limit: firstQueryValue(req.query.limit),
		page: firstQueryValue(req.query.page),
	};
};

export const createExpense = catchAsync(async (req: Request, res: Response): Promise<void> => {
	const expense = await expenseService.createExpense(getAuthenticatedUserId(req), req.body);
	res.status(201).json(expense);
});

export const getExpenses = catchAsync(async (_req: Request, res: Response): Promise<void> => {
	const expenses = await expenseService.queryExpenses(
		getAuthenticatedUserId(_req),
		getPaginationOptions(_req)
	);
	res.status(200).json(expenses);
});

export const getExpense = catchAsync(async (req: Request, res: Response): Promise<void> => {
	const expense = await expenseService.getExpenseById(getRequestId(req), getAuthenticatedUserId(req));

	if (!expense) {
		throw new ApiError(404, "Expense not found");
	}

	res.status(200).json(expense);
});

export const updateExpense = catchAsync(async (req: Request, res: Response): Promise<void> => {
	const expense = await expenseService.updateExpenseById(
		getRequestId(req),
		getAuthenticatedUserId(req),
		req.body
	);

	if (!expense) {
		throw new ApiError(404, "Expense not found");
	}

	res.status(200).json(expense);
});

export const deleteExpense = catchAsync(async (req: Request, res: Response): Promise<void> => {
	const expense = await expenseService.deleteExpenseById(getRequestId(req), getAuthenticatedUserId(req));

	if (!expense) {
		throw new ApiError(404, "Expense not found");
	}

	res.status(200).json({
		message: "Expense deleted successfully",
		expense,
	});
});
