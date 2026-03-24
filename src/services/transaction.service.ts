import mongoose from "mongoose";
import {
	Transaction,
	TransactionAttributes,
	TransactionDocument,
} from "../model/transaction.model";
import { IOptions, QueryResult } from "../model/plugins/paginate.types";

type CreateExpenseInput = Omit<TransactionAttributes, "user">;
type UpdateExpenseInput = Partial<CreateExpenseInput>;
type ExpenseDocument = TransactionDocument;

export interface ExpenseCategoryStat {
	type: "INCOME" | "EXPENSE";
	total: number;
}

export const createExpense = async (
	userId: string,
	expenseBody: CreateExpenseInput
): Promise<ExpenseDocument> => {
	const expense = await Transaction.create({
		...expenseBody,
		user: userId,
	});
	return expense;
};

export const queryExpenses = async (
	userId: string,
	options: IOptions = {}
): Promise<QueryResult<ExpenseDocument>> => {
	return Transaction.paginate({ user: userId }, options);
};

export const getExpenseById = async (id: string, userId: string): Promise<ExpenseDocument | null> => {
	if (!mongoose.isValidObjectId(id)) {
		return null;
	}

	return Transaction.findOne({ _id: id, user: userId });
};

export const updateExpenseById = async (
	id: string,
	userId: string,
	updateBody: UpdateExpenseInput
): Promise<ExpenseDocument | null> => {
	if (!mongoose.isValidObjectId(id)) {
		return null;
	}

	const expense = await Transaction.findOneAndUpdate({ _id: id, user: userId }, updateBody, {
		new: true,
		runValidators: true,
	});

	return expense;
};

export const deleteExpenseById = async (id: string, userId: string): Promise<ExpenseDocument | null> => {
	if (!mongoose.isValidObjectId(id)) {
		return null;
	}

	const expense = await Transaction.findOneAndDelete({ _id: id, user: userId });
	return expense;
};

export const getExpenseStats = async (userId: string): Promise<ExpenseCategoryStat[]> => {
	if (!mongoose.isValidObjectId(userId)) {
		return [];
	}

	const userObjectId = new mongoose.Types.ObjectId(userId);

	return Transaction.aggregate<ExpenseCategoryStat>([
		{
			$match: { user: userObjectId },
		},
		{
			$group: {
				_id: "$type",
				total: { $sum: "$amount" },
			},
		},
		{
			$project: {
				_id: 0,
				type: "$_id",
				total: 1,
			},
		},
		{
			$sort: { total: -1 },
		},
	]).exec();
};

/**
 * Get category breakdown for a specific vault (For the Donut Chart)
 */
export const getVaultCategoryStats = async (fintrackId: string, userId: string) => {
	if (!mongoose.isValidObjectId(fintrackId) || !mongoose.isValidObjectId(userId)) {
		return [];
	}

	return Transaction.aggregate([
		{
			$match: {
				fintrack: new mongoose.Types.ObjectId(fintrackId),
				user: new mongoose.Types.ObjectId(userId),
				type: "EXPENSE",
			},
		},
		{
			$group: {
				_id: "$category",
				total: { $sum: "$amount" },
			},
		},
		{ $sort: { total: -1 } },
	]);
};
