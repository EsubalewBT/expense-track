import { Prisma, Transaction, TransactionType } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { IOptions, QueryResult } from "../types/pagination";

type CreateExpenseInput = {
	title: string;
	type: TransactionType;
	amount: number;
	category: string;
	date?: Date | string;
	description?: string;
	fintrackId?: string;
};
type UpdateExpenseInput = Partial<CreateExpenseInput>;
type ExpenseDocument = Transaction;
export type TransactionWithBalance = Transaction & { runningBalance?: number };

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DEFAULT_PAGE = 1;

const toPositiveInt = (value: unknown, fallback: number): number => {
	const parsed = Number.parseInt(String(value), 10);

	if (!Number.isFinite(parsed) || parsed <= 0) {
		return fallback;
	}

	return parsed;
};

const mapSortField = (field: string): keyof Prisma.TransactionOrderByWithRelationInput | null => {
	const fieldMap: Record<string, keyof Prisma.TransactionOrderByWithRelationInput> = {
		id: "id",
		title: "title",
		type: "type",
		amount: "amount",
		category: "category",
		date: "date",
		createdAt: "createdAt",
		updatedAt: "updatedAt",
	};

	return fieldMap[field] ?? null;
};

type SortSegment = {
	field: keyof Prisma.TransactionOrderByWithRelationInput;
	direction: "asc" | "desc";
};

const parseSortBySegments = (sortBy?: string): SortSegment[] => {
	if (!sortBy) {
		return [{ field: "createdAt", direction: "desc" }];
	}

	const segments = sortBy
		.split(",")
		.map((segment) => segment.trim())
		.filter(Boolean)
		.map((segment) => {
			const [rawField, rawOrder] = segment.split(":").map((token) => token.trim());
			const field = mapSortField(rawField || "");

			if (!field) {
				return null;
			}

			return {
				field,
				direction: rawOrder === "asc" ? "asc" : "desc",
			} satisfies SortSegment;
		})
		.filter((value): value is SortSegment => Boolean(value));

	return segments.length > 0 ? segments : [{ field: "createdAt", direction: "desc" }];
};

const buildOrderBy = (sortBy?: string): Prisma.TransactionOrderByWithRelationInput[] => {
	if (!sortBy) {
		return [{ createdAt: "desc" }];
	}

	const orderBy = sortBy
		.split(",")
		.map((segment) => segment.trim())
		.filter(Boolean)
		.map((segment) => {
			const [rawField, rawOrder] = segment.split(":").map((token) => token.trim());
			const field = mapSortField(rawField || "");

			if (!field) {
				return null;
			}

			return {
				[field]: rawOrder === "asc" ? "asc" : "desc",
			} as Prisma.TransactionOrderByWithRelationInput;
		})
		.filter((value): value is Prisma.TransactionOrderByWithRelationInput => Boolean(value));

	return orderBy.length > 0 ? orderBy : [{ createdAt: "desc" }];
};

const buildSqlOrderBy = (sortBy?: string): Prisma.Sql => {
	const segments = parseSortBySegments(sortBy);
	const clauses = segments.map((segment) =>
		Prisma.sql`${Prisma.raw(`"${segment.field}"`)} ${Prisma.raw(segment.direction.toUpperCase())}`
	);

	return Prisma.sql`ORDER BY ${Prisma.join(clauses, ', ')}`;
};

const toDateOrUndefined = (value: Date | string | undefined): Date | undefined => {
	if (!value) {
		return undefined;
	}

	return value instanceof Date ? value : new Date(value);
};

const toCreateData = (expenseBody: CreateExpenseInput, userId: string): Prisma.TransactionUncheckedCreateInput => {
	return {
		title: expenseBody.title,
		type: expenseBody.type,
		amount: Number(expenseBody.amount),
		category: expenseBody.category,
		description: expenseBody.description,
		date: toDateOrUndefined(expenseBody.date),
		userId,
		fintrackId: expenseBody.fintrackId || null,
	};
};

const toUpdateData = (updateBody: UpdateExpenseInput): Prisma.TransactionUncheckedUpdateInput => {
	const data: Prisma.TransactionUncheckedUpdateInput = {};

	if (updateBody.title !== undefined) {
		data.title = updateBody.title;
	}

	if (updateBody.type !== undefined) {
		data.type = updateBody.type;
	}

	if (updateBody.amount !== undefined) {
		data.amount = Number(updateBody.amount);
	}

	if (updateBody.category !== undefined) {
		data.category = updateBody.category;
	}

	if (updateBody.description !== undefined) {
		data.description = updateBody.description;
	}

	if (updateBody.date !== undefined) {
		data.date = toDateOrUndefined(updateBody.date);
	}

	if (updateBody.fintrackId !== undefined) {
		data.fintrackId = updateBody.fintrackId || null;
	}

	return data;
};

export interface ExpenseCategoryStat {
	type: "INCOME" | "EXPENSE";
	total: number;
}

export const createExpense = async (
	userId: string,
	expenseBody: CreateExpenseInput
): Promise<ExpenseDocument> => {
	const expense = await prisma.transaction.create({
		data: toCreateData(expenseBody, userId),
	});

	return expense;
};

export const queryExpenses = async (
	userId: string,
	options: IOptions = {}
): Promise<QueryResult<TransactionWithBalance>> => {
	if (options.fintrackId) {
		return getVaultTransactionsWithBalance(String(options.fintrackId), userId, options);
	}

	const limit = Math.min(toPositiveInt(options.limit, DEFAULT_LIMIT), MAX_LIMIT);
	const page = toPositiveInt(options.page, DEFAULT_PAGE);
	const skip = (page - 1) * limit;
	const orderBy = buildOrderBy(options.sortBy);
	const where: Prisma.TransactionWhereInput = {
		userId,
	};

	const [totalResults, results] = await Promise.all([
		prisma.transaction.count({ where }),
		prisma.transaction.findMany({
			where,
			orderBy,
			skip,
			take: limit,
		}),
	]);

	return {
		results,
		page,
		limit,
		totalPages: Math.ceil(totalResults / limit),
		totalResults,
	};
};

export const getVaultTransactionsWithBalance = async (
	fintrackId: string,
	userId: string,
	options: IOptions = {}
): Promise<QueryResult<TransactionWithBalance>> => {
	const limit = Math.min(toPositiveInt(options.limit, DEFAULT_LIMIT), MAX_LIMIT);
	const page = toPositiveInt(options.page, DEFAULT_PAGE);
	const skip = (page - 1) * limit;
	const orderBySql = buildSqlOrderBy(options.sortBy);

	const [totalResults, results] = await Promise.all([
		prisma.transaction.count({
			where: {
				fintrackId,
				userId,
			},
		}),
		prisma.$queryRaw<TransactionWithBalance[]>`
			SELECT *
			FROM (
				SELECT
					"Transaction".*,
					SUM(CASE WHEN type = 'INCOME' THEN amount ELSE -amount END)
						OVER (PARTITION BY "fintrackId" ORDER BY date ASC, "id" ASC) AS "runningBalance"
				FROM "Transaction"
				WHERE "fintrackId" = ${fintrackId} AND "userId" = ${userId}
			) AS "transactionWithBalance"
			${orderBySql}
			LIMIT ${limit} OFFSET ${skip}
		`,
	]);

	return {
		results,
		page,
		limit,
		totalPages: Math.ceil(totalResults / limit),
		totalResults,
	};
};

export const getExpenseById = async (id: string, userId: string): Promise<ExpenseDocument | null> => {
	return prisma.transaction.findFirst({ where: { id, userId } });
};

export const updateExpenseById = async (
	id: string,
	userId: string,
	updateBody: UpdateExpenseInput
): Promise<ExpenseDocument | null> => {
	const expense = await prisma.transaction.findFirst({ where: { id, userId } });
	if (!expense) {
		return null;
	}

	return prisma.transaction.update({
		where: { id },
		data: toUpdateData(updateBody),
	});
};

export const deleteExpenseById = async (id: string, userId: string): Promise<ExpenseDocument | null> => {
	const expense = await prisma.transaction.findFirst({ where: { id, userId } });
	if (!expense) {
		return null;
	}

	await prisma.transaction.delete({ where: { id } });
	return expense;
};

export const getExpenseStats = async (userId: string): Promise<ExpenseCategoryStat[]> => {
	const grouped = await prisma.transaction.groupBy({
		by: ["type"],
		where: { userId },
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

/**
 * Get category breakdown for a specific vault (For the Donut Chart)
 */
export const getVaultCategoryStats = async (fintrackId: string, userId: string) => {
	const grouped = await prisma.transaction.groupBy({
		by: ["category"],
		where: {
			fintrackId,
			userId,
			type: "EXPENSE",
		},
		_sum: {
			amount: true,
		},
	});

	return grouped
		.map((item) => ({
			_id: item.category,
			total: item._sum.amount ?? 0,
		}))
		.sort((a, b) => b.total - a.total);
};
