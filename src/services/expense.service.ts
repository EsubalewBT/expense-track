import mongoose from "mongoose";
import { CreateExpenseInput, Expense, ExpenseDocument, UpdateExpenseInput } from "../model/expense.model";
import { IOptions, QueryResult } from "../model/plugins/paginate.types";

export const createExpense = async (
	userId: string,
	expenseBody: CreateExpenseInput
): Promise<ExpenseDocument> => {
	const expense = await Expense.create({
		...expenseBody,
		user: userId,
	});
	return expense;
};

export const queryExpenses = async (
	userId: string,
	options: IOptions = {}
): Promise<QueryResult<ExpenseDocument>> => {
	return Expense.paginate({ user: userId }, options);
};

export const getExpenseById = async (id: string, userId: string): Promise<ExpenseDocument | null> => {
	if (!mongoose.isValidObjectId(id)) {
		return null;
	}

	return Expense.findOne({ _id: id, user: userId });
};

export const updateExpenseById = async (
	id: string,
	userId: string,
	updateBody: UpdateExpenseInput
): Promise<ExpenseDocument | null> => {
	if (!mongoose.isValidObjectId(id)) {
		return null;
	}

	const expense = await Expense.findOneAndUpdate({ _id: id, user: userId }, updateBody, {
		new: true,
		runValidators: true,
	});

	return expense;
};

export const deleteExpenseById = async (id: string, userId: string): Promise<ExpenseDocument | null> => {
	if (!mongoose.isValidObjectId(id)) {
		return null;
	}

	const expense = await Expense.findOneAndDelete({ _id: id, user: userId });
	return expense;
};
