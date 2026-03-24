import mongoose from "mongoose";
import { Fintrack, IFintrack } from "../model/Fintrack.model";
import { Transaction } from "../model/transaction.model";

export interface CreateFintrackInput {
	title: string;
	description?: string;
	icon?: "wallet" | "briefcase" | "zap" | "home" | "piggy-bank" | "trending-up";
	color?: string;
}

export interface FintrackWithBalance {
	balance: number;
	income: number;
	expense: number;
	transactionsCount: number;
	[key: string]: unknown;
}

type TransactionStat = {
	_id: "INCOME" | "EXPENSE";
	total: number;
};

export const createFintrack = async (
	body: Partial<CreateFintrackInput>,
	userId: string
): Promise<IFintrack> => {
	return Fintrack.create({ ...body, user: userId });
};

const withBalance = async (
	fintrack: IFintrack,
	userObjectId: mongoose.Types.ObjectId
): Promise<FintrackWithBalance> => {
	const stats = await Transaction.aggregate<TransactionStat>([
		{ $match: { fintrack: fintrack._id, user: userObjectId } },
		{ $group: { _id: "$type", total: { $sum: "$amount" } } },
	]);

	const income = stats.find((s) => s._id === "INCOME")?.total || 0;
	const expense = stats.find((s) => s._id === "EXPENSE")?.total || 0;
	const transactionsCount = await Transaction.countDocuments({
		fintrack: fintrack._id,
		user: userObjectId,
	});

	return {
		...fintrack.toJSON(),
		balance: income - expense,
		income,
		expense,
		transactionsCount,
	};
};

export const getFintracks = async (userId: string): Promise<FintrackWithBalance[]> => {
	if (!mongoose.isValidObjectId(userId)) {
		return [];
	}

	const userObjectId = new mongoose.Types.ObjectId(userId);
	const fintracks = await Fintrack.find({ user: userObjectId });

	const fintracksWithBalance = await Promise.all(fintracks.map((fintrack) => withBalance(fintrack, userObjectId)));

	return fintracksWithBalance;
};

export const getFintrackById = async (
	id: string,
	userId: string
): Promise<FintrackWithBalance | null> => {
	if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
		return null;
	}

	const userObjectId = new mongoose.Types.ObjectId(userId);
	const fintrack = await Fintrack.findOne({ _id: id, user: userObjectId });

	if (!fintrack) {
		return null;
	}

	return withBalance(fintrack, userObjectId);
};

export const updateFintrackById = async (
	id: string,
	userId: string,
	body: Partial<CreateFintrackInput>
): Promise<IFintrack | null> => {
	if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
		return null;
	}

	return Fintrack.findOneAndUpdate({ _id: id, user: userId }, body, {
		new: true,
		runValidators: true,
	});
};

export const deleteFintrackById = async (id: string, userId: string): Promise<IFintrack | null> => {
	if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
		return null;
	}

	return Fintrack.findOneAndDelete({ _id: id, user: userId });
};
