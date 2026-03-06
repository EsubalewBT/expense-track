import { Request, Response } from "express";

import * as expenseService from "../services/expense.service";
import { ApiError } from "../utils/ApiError";
import catchAsync from "../utils/catchAsync";

const getRequestId = (req: Request): string => {
	return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
};

export const createExpense = catchAsync(async (req: Request, res: Response): Promise<void> => {
	const expense = await expenseService.createExpense(req.body);
	res.status(201).json(expense);
});

export const getExpenses = catchAsync(async (_req: Request, res: Response): Promise<void> => {
	const expenses = await expenseService.queryExpenses();
	res.status(200).json(expenses);
});

export const getExpense = catchAsync(async (req: Request, res: Response): Promise<void> => {
	const expense = await expenseService.getExpenseById(getRequestId(req));

	if (!expense) {
		throw new ApiError(404, "Expense not found");
	}

	res.status(200).json(expense);
});

export const updateExpense = catchAsync(async (req: Request, res: Response): Promise<void> => {
	const expense = await expenseService.updateExpenseById(getRequestId(req), req.body);

	if (!expense) {
		throw new ApiError(404, "Expense not found");
	}

	res.status(200).json(expense);
});

export const deleteExpense = catchAsync(async (req: Request, res: Response): Promise<void> => {
	const expense = await expenseService.deleteExpenseById(getRequestId(req));

	if (!expense) {
		throw new ApiError(404, "Expense not found");
	}

	res.status(200).json({
		message: "Expense deleted successfully",
		expense,
	});
});
