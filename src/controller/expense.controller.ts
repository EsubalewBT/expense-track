import { Request, Response } from "express";
import * as expenseService from "../services/expense.service";

const getErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}

	return "Unknown error";
};

export const createExpense = async (req: Request, res: Response): Promise<void> => {
	try {
		const expense = await expenseService.createExpense(req.body);
		res.status(201).json(expense);
	} catch (error) {
		res.status(400).json({
			message: "Error creating expense",
			error: getErrorMessage(error),
		});
	}
};

export const getExpenses = async (_req: Request, res: Response): Promise<void> => {
	try {
		const expenses = await expenseService.queryExpenses();
		res.status(200).json(expenses);
	} catch (error) {
		res.status(500).json({
			message: "Error fetching expenses",
			error: getErrorMessage(error),
		});
	}
};

export const getExpense = async (req: Request, res: Response): Promise<void> => {
	try {
		const expense = await expenseService.getExpenseById(
			Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
		);

		if (!expense) {
			res.status(404).json({ message: "Expense not found" });
			return;
		}

		res.status(200).json(expense);
	} catch (error) {
		res.status(500).json({
			message: "Error fetching expense",
			error: getErrorMessage(error),
		});
	}
};

export const updateExpense = async (req: Request, res: Response): Promise<void> => {
	try {
		const expense = await expenseService.updateExpenseById(
			Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
			req.body
		);

		if (!expense) {
			res.status(404).json({ message: "Expense not found" });
			return;
		}

		res.status(200).json(expense);
	} catch (error) {
		res.status(400).json({
			message: "Error updating expense",
			error: getErrorMessage(error),
		});
	}
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
	try {
		const expense = await expenseService.deleteExpenseById(
			Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
		);

		if (!expense) {
			res.status(404).json({ message: "Expense not found" });
			return;
		}

		res.status(200).json({
			message: "Expense deleted successfully",
			expense,
		});
	} catch (error) {
		res.status(500).json({
			message: "Error deleting expense",
			error: getErrorMessage(error),
		});
	}
};
