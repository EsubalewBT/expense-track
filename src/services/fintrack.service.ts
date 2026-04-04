import { Fintrack, TransactionType } from "@prisma/client";

import { prisma } from "../lib/prisma";

export interface CreateFintrackInput {
	title: string;
	description?: string;
	icon?: "wallet" | "briefcase" | "zap" | "home" | "piggy-bank" | "trending-up";
	color?: string;
}

export type FintrackWithBalance = Fintrack & {
	balance: number;
	income: number;
	expense: number;
	transactionsCount: number;
};

const getFintrackStats = async (
	fintrackId: string,
	userId: string
): Promise<{ income: number; expense: number; transactionsCount: number }> => {
	const grouped = await prisma.transaction.groupBy({
		by: ["type"],
		where: {
			fintrackId,
			userId,
		},
		_sum: {
			amount: true,
		},
		_count: {
			_all: true,
		},
	});

	const income = grouped.find((item) => item.type === TransactionType.INCOME)?._sum.amount ?? 0;
	const expense = grouped.find((item) => item.type === TransactionType.EXPENSE)?._sum.amount ?? 0;
	const transactionsCount = grouped.reduce((total, item) => total + item._count._all, 0);

	return {
		income,
		expense,
		transactionsCount,
	};
};

export const createFintrack = async (
	body: Partial<CreateFintrackInput>,
	userId: string
): Promise<Fintrack> => {
	return prisma.fintrack.create({
		data: {
			title: body.title || "Untitled",
			description: body.description,
			icon: body.icon || "wallet",
			color: body.color || "teal",
			userId,
		},
	});
};

export const getFintracks = async (userId: string): Promise<FintrackWithBalance[]> => {
	const fintracks = await prisma.fintrack.findMany({ where: { userId } });
 
	if (fintracks.length === 0) {
		return [];
	}

	const grouped = await prisma.transaction.groupBy({
		by: ["fintrackId", "type"],
		where: {
			userId,
			fintrackId: { in: fintracks.map((item) => item.id) },
		},
		_sum: {
			amount: true,
		},
		_count: {
			_all: true,
		},
	});

	const statMap = new Map<string, { income: number; expense: number; transactionsCount: number }>();

	grouped.forEach((item) => {
		if (!item.fintrackId) {
			return;
		}

		const current = statMap.get(item.fintrackId) || {
			income: 0,
			expense: 0,
			transactionsCount: 0,
		};

		if (item.type === TransactionType.INCOME) {
			current.income = item._sum.amount ?? 0;
		} else {
			current.expense = item._sum.amount ?? 0;
		}

		current.transactionsCount += item._count._all;
		statMap.set(item.fintrackId, current);
	});

	return fintracks.map((fintrack) => {
		const stats = statMap.get(fintrack.id) || {
			income: 0,
			expense: 0,
			transactionsCount: 0,
		};

		return {
			...fintrack,
			balance: stats.income - stats.expense,
			income: stats.income,
			expense: stats.expense,
			transactionsCount: stats.transactionsCount,
		};
	});
};

export const getFintrackById = async (
	id: string,
	userId: string
): Promise<FintrackWithBalance | null> => {
	const fintrack = await prisma.fintrack.findFirst({
		where: {
			id,
			userId,
		},
	});

	if (!fintrack) {
		return null;
	}

	const stats = await getFintrackStats(fintrack.id, userId);

	return {
		...fintrack,
		balance: stats.income - stats.expense,
		income: stats.income,
		expense: stats.expense,
		transactionsCount: stats.transactionsCount,
	};
};

export const updateFintrackById = async (
	id: string,
	userId: string,
	body: Partial<CreateFintrackInput>

): Promise<Fintrack | null> => {
	const existingFintrack = await prisma.fintrack.findFirst({ where: { id, userId } });
	if (!existingFintrack) {
		return null;
	}

	return prisma.fintrack.update({
		where: { id },
		data: {
			title: body.title,
			description: body.description,
			icon: body.icon,
			color: body.color,
		},
	});
};

export const deleteFintrackById = async (id: string, userId: string): Promise<Fintrack | null> => {
	const existingFintrack = await prisma.fintrack.findFirst({ where: { id, userId } });
	if (!existingFintrack) {
		return null;
	}

	return prisma.fintrack.delete({ where: { id } });
};

export const getVaultStats = async (vaultId: string, userId: string) => {
	const grouped = await prisma.transaction.groupBy({
		by: ["type"],
		where: {
			fintrackId: vaultId,
			userId,
		},
		_sum: {
			amount: true,
		},
	});

	return grouped
		.map((item) => ({
			type: item.type,
			total: item._sum.amount ?? 0,
		}))
		.sort((a, b) => b.total - a.total);
};
