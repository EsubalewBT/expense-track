import {
	UseMutationOptions,
	UseMutationResult,
	UseQueryResult,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { api } from './axios';

export interface ApiErrorResponse {
	code?: number;
	message?: string;
}

export interface Expense {
	id: string;
	title: string;
	amount: number;
	category: string;
	description?: string;
	date: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface NewExpense {
	title: string;
	amount: number;
	category: string;
	description?: string;
	date?: string;
}

export interface UpdateExpensePayload {
	title?: string;
	amount?: number;
	category?: string;
	description?: string;
	date?: string;
}

export interface UpdateExpenseMutationInput {
	expenseId: string;
	payload: UpdateExpensePayload;
}

export interface DeleteExpenseResponse {
	message: string;
	expense: Expense;
}

export interface PaginatedResponse<T> {
	results: T[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

export interface ExpenseStat {
	category: string;
	totalAmount: number;
	count: number;
}

export interface GlobalTransactionStat {
	type: 'INCOME' | 'EXPENSE';
	total: number;
}

export interface ExpenseListParams {
	page?: number;
	limit?: number;
	sortBy?: string;
}

export const expenseQueryKeys = {
	all: ['expense'] as const,
	list: ['expense', 'list'] as const,
	stats: ['expense', 'stats'] as const,
};

export async function createExpenseFn(expense: NewExpense): Promise<Expense> {
	const response = await api.post<Expense>('/expense', expense);
	return response.data;
}

export async function updateExpenseFn({
	expenseId,
	payload,
}: UpdateExpenseMutationInput): Promise<Expense> {
	const response = await api.patch<Expense>(`/expense/${expenseId}`, payload);
	return response.data;
}

export async function deleteExpenseFn(expenseId: string): Promise<DeleteExpenseResponse> {
	const response = await api.delete<DeleteExpenseResponse>(`/expense/${expenseId}`);
	return response.data;
}

export async function getExpensesFn(limit = 5): Promise<PaginatedResponse<Expense>> {
	const response = await api.get<PaginatedResponse<Expense>>('/expense', {
		params: { limit },
	});

	return response.data;
}

export async function getExpenseListFn(
	params: ExpenseListParams = {}
): Promise<PaginatedResponse<Expense>> {
	const { page = 1, limit = 20, sortBy = 'date:desc' } = params;

	const response = await api.get<PaginatedResponse<Expense>>('/expense', {
		params: { page, limit, sortBy },
	});

	return response.data;
}

export async function getExpenseStatsFn(): Promise<ExpenseStat[]> {
	const response = await api.get<ExpenseStat[]>('/expense/stats');
	return response.data;
}

export async function getGlobalStatsFn(): Promise<GlobalTransactionStat[]> {
	const response = await api.get<GlobalTransactionStat[]>('/expense/stats');
	return response.data;
}

type CreateExpenseMutationOptions = UseMutationOptions<
	Expense,
	AxiosError<ApiErrorResponse>,
	NewExpense
>;

type UpdateExpenseMutationOptions = UseMutationOptions<
	Expense,
	AxiosError<ApiErrorResponse>,
	UpdateExpenseMutationInput
>;

type DeleteExpenseMutationOptions = UseMutationOptions<
	DeleteExpenseResponse,
	AxiosError<ApiErrorResponse>,
	string
>;

const ExpenseApi = {
	Create: {
		useMutation(
			options?: CreateExpenseMutationOptions
		): UseMutationResult<Expense, AxiosError<ApiErrorResponse>, NewExpense> {
			const queryClient = useQueryClient();
			const { onSuccess, ...restOptions } = options || {};

			return useMutation({
				mutationKey: ['expense', 'create'],
				mutationFn: createExpenseFn,
				...restOptions,
				onSuccess: (data, variables, onMutateResult, context) => {
					// Keep dashboard data fresh after creating an expense.
					queryClient.invalidateQueries({ queryKey: expenseQueryKeys.list });
					queryClient.invalidateQueries({ queryKey: expenseQueryKeys.stats });
					onSuccess?.(data, variables, onMutateResult, context);
				},
			});
		},
	},
	Update: {
		useMutation(
			options?: UpdateExpenseMutationOptions
		): UseMutationResult<Expense, AxiosError<ApiErrorResponse>, UpdateExpenseMutationInput> {
			const queryClient = useQueryClient();
			const { onSuccess, ...restOptions } = options || {};

			return useMutation({
				mutationKey: ['expense', 'update'],
				mutationFn: updateExpenseFn,
				...restOptions,
				onSuccess: (data, variables, onMutateResult, context) => {
					queryClient.invalidateQueries({ queryKey: expenseQueryKeys.list });
					queryClient.invalidateQueries({ queryKey: expenseQueryKeys.stats });
					onSuccess?.(data, variables, onMutateResult, context);
				},
			});
		},
	},
	Delete: {
		useMutation(
			options?: DeleteExpenseMutationOptions
		): UseMutationResult<DeleteExpenseResponse, AxiosError<ApiErrorResponse>, string> {
			const queryClient = useQueryClient();
			const { onSuccess, ...restOptions } = options || {};

			return useMutation({
				mutationKey: ['expense', 'delete'],
				mutationFn: deleteExpenseFn,
				...restOptions,
				onSuccess: (data, variables, onMutateResult, context) => {
					queryClient.invalidateQueries({ queryKey: expenseQueryKeys.list });
					queryClient.invalidateQueries({ queryKey: expenseQueryKeys.stats });
					onSuccess?.(data, variables, onMutateResult, context);
				},
			});
		},
	},
	GetRecent: {
		useQuery(limit = 5): UseQueryResult<PaginatedResponse<Expense>> {
			return useQuery({
				queryKey: [...expenseQueryKeys.list, 'recent', limit],
				queryFn: () => getExpensesFn(limit),
			});
		},
	},
	GetList: {
		useQuery(params: ExpenseListParams = {}): UseQueryResult<PaginatedResponse<Expense>> {
			const { page = 1, limit = 20, sortBy = 'date:desc' } = params;

			return useQuery({
				queryKey: [...expenseQueryKeys.list, 'all', page, limit, sortBy],
				queryFn: () => getExpenseListFn({ page, limit, sortBy }),
			});
		},
	},
	GetStats: {
		useQuery(): UseQueryResult<ExpenseStat[]> {
			return useQuery({
				queryKey: expenseQueryKeys.stats,
				queryFn: getExpenseStatsFn,
			});
		},
	},
};

export const TransactionApi = {
	GetGlobalStats: {
		useQuery: (): UseQueryResult<GlobalTransactionStat[]> =>
			useQuery({
				queryKey: ['global-stats'],
				queryFn: getGlobalStatsFn,
			}),
	},
};

export { ExpenseApi };
