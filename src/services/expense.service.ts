import mongoose from "mongoose";
import { Expense, ExpenseAttributes, ExpenseDocument } from "../model/expense.model";

export const createExpense = async (expenseBody: ExpenseAttributes): Promise<ExpenseDocument> => {
	const expense = await Expense.create(expenseBody);
	return expense;
};

export const queryExpenses = async (): Promise<ExpenseDocument[]> => {
	const expenses = await Expense.find().sort({ date: -1 });
	return expenses;
};

export const getExpenseById = async (id: string): Promise<ExpenseDocument | null> => {
	if (!mongoose.isValidObjectId(id)) {
		return null;
	}

	return Expense.findById(id);
};

export const updateExpenseById = async (
	id: string,
	updateBody: Partial<ExpenseAttributes>
): Promise<ExpenseDocument | null> => {
	if (!mongoose.isValidObjectId(id)) {
		return null;
	}

	const expense = await Expense.findByIdAndUpdate(id, updateBody, {
		new: true,
		runValidators: true,
	});

	return expense;
};

export const deleteExpenseById = async (id: string): Promise<ExpenseDocument | null> => {
	if (!mongoose.isValidObjectId(id)) {
		return null;
	}

	const expense = await Expense.findByIdAndDelete(id);
	return expense;
};
