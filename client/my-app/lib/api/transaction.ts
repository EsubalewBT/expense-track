import {
	type UseMutationOptions,
	type UseMutationResult,
	type UseQueryResult,
	useMutation,
	useQueries,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { api } from './axios';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface VaultTransaction {
	id: string;
	title: string;
	type: TransactionType;
	amount: number;
	category: string;
	description?: string;
	date: string;
	fintrackId?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface ApiErrorResponse {
	code?: number;
	message?: string;
}

export interface CreateTransactionPayload {
	title: string;
	type: TransactionType;
	amount: number;
	category: string;
	description?: string;
	date?: string;
	fintrackId: string;
}

export interface DeleteTransactionResponse {
	message: string;
	expense: VaultTransaction;
}

export interface PaginatedResponse<T> {
	results: T[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}

export interface VaultTransactionsQueryParams {
	page?: number;
	limit?: number;
	sortBy?: string;
}

export interface VaultCategoryStat {
	_id: string;
	total: number;
}

export type DeleteTransactionInput = {
	transactionId: string;
	vaultId?: string;
};

type VaultTransactionsRequestParams = {
	page: number;
	limit: number;
	sortBy: string;
};

async function getVaultTransactionsPageFn(
	vaultId: string,
	params: VaultTransactionsRequestParams
): Promise<PaginatedResponse<VaultTransaction>> {
	const response = await api.get<PaginatedResponse<VaultTransaction>>('/expense', {
		params: {
			page: params.page,
			limit: params.limit,
			sortBy: params.sortBy,
			fintrackId: vaultId,
		},
	});

	return response.data;
}

async function getVaultTransactionsFn(
	vaultId: string,
	params: VaultTransactionsQueryParams = {}
): Promise<PaginatedResponse<VaultTransaction>> {
	const { page = 1, limit = 50, sortBy = 'date:desc' } = params;
	const firstPage = await getVaultTransactionsPageFn(vaultId, { page, limit, sortBy });

	if (page !== 1) {
		return firstPage;
	}

	const totalPages = Math.max(1, Number(firstPage.totalPages) || 1);
	if (totalPages === 1) {
		return firstPage;
	}

	const remainingPageNumbers = Array.from({ length: totalPages - 1 }, (_, index) => index + 2);
	const remainingPages = await Promise.all(
		remainingPageNumbers.map((nextPage) =>
			getVaultTransactionsPageFn(vaultId, {
				page: nextPage,
				limit,
				sortBy,
			})
		)
	);

	const mergedResults = [firstPage, ...remainingPages].flatMap((pageData) => pageData.results || []);

	return {
		...firstPage,
		results: mergedResults,
		page: 1,
		limit: mergedResults.length,
		totalPages: 1,
		totalResults: Number(firstPage.totalResults) || mergedResults.length,
	};
}

async function getVaultCategoryStatsFn(vaultId: string): Promise<VaultCategoryStat[]> {
	const response = await api.get<VaultCategoryStat[]>(`/expense/vault-stats/${vaultId}`);
	return response.data;
}

async function getRecentVaultTransactionsFn(
	vaultId: string,
	limit = 60
): Promise<PaginatedResponse<VaultTransaction>> {
	return getVaultTransactionsPageFn(vaultId, { page: 1, limit, sortBy: 'date:desc' });
}

async function createTransactionFn(payload: CreateTransactionPayload): Promise<VaultTransaction> {
	const response = await api.post<VaultTransaction>('/expense', payload);
	return response.data;
}

async function deleteTransactionFn(transactionId: string): Promise<DeleteTransactionResponse> {
	const response = await api.delete<DeleteTransactionResponse>(`/expense/${transactionId}`);
	return response.data;
}

type CreateTransactionMutationOptions = UseMutationOptions<
	VaultTransaction,
	AxiosError<ApiErrorResponse>,
	CreateTransactionPayload
>;

type DeleteTransactionMutationOptions = UseMutationOptions<
	DeleteTransactionResponse,
	AxiosError<ApiErrorResponse>,
	DeleteTransactionInput
>;

export const TransactionApi = {
	Create: {
		useMutation(
			options?: CreateTransactionMutationOptions
		): UseMutationResult<VaultTransaction, AxiosError<ApiErrorResponse>, CreateTransactionPayload> {
			const queryClient = useQueryClient();
			const { onSuccess, ...restOptions } = options || {};

			return useMutation({
				mutationKey: ['transaction', 'create'],
				mutationFn: createTransactionFn,
				...restOptions,
				onSuccess: (data, variables, onMutateResult, context) => {
					if (variables.fintrackId) {
						queryClient.invalidateQueries({
							queryKey: ['vault-transactions', variables.fintrackId],
						});
						queryClient.invalidateQueries({
							queryKey: ['vault-category-stats', variables.fintrackId],
						});
						queryClient.invalidateQueries({ queryKey: ['fintracks', variables.fintrackId] });
						queryClient.invalidateQueries({
							queryKey: ['fintracks', variables.fintrackId, 'stats'],
						});
					}
					queryClient.invalidateQueries({ queryKey: ['fintracks'] });
					onSuccess?.(data, variables, onMutateResult, context);
				},
			});
		},
	},
	Delete: {
		useMutation(
			options?: DeleteTransactionMutationOptions
		): UseMutationResult<DeleteTransactionResponse, AxiosError<ApiErrorResponse>, DeleteTransactionInput> {
			const queryClient = useQueryClient();
			const { onSuccess, ...restOptions } = options || {};

			return useMutation({
				mutationKey: ['transaction', 'delete'],
				mutationFn: ({ transactionId }) => deleteTransactionFn(transactionId),
				...restOptions,
				onSuccess: (data, variables, onMutateResult, context) => {
					if (variables.vaultId) {
						queryClient.invalidateQueries({
							queryKey: ['vault-transactions', variables.vaultId],
						});
						queryClient.invalidateQueries({
							queryKey: ['vault-category-stats', variables.vaultId],
						});
						queryClient.invalidateQueries({ queryKey: ['fintracks', variables.vaultId] });
						queryClient.invalidateQueries({
							queryKey: ['fintracks', variables.vaultId, 'stats'],
						});
					}
					queryClient.invalidateQueries({ queryKey: ['fintracks'] });
					onSuccess?.(data, variables, onMutateResult, context);
				},
			});
		},
	},
	GetRecentByVault: {
		useQuery: (
			vaultId: string,
			limit = 60
		): UseQueryResult<PaginatedResponse<VaultTransaction>> =>
			useQuery({
				queryKey: ['vault-transactions', 'recent', vaultId, limit],
				queryFn: () => getRecentVaultTransactionsFn(vaultId, limit),
				enabled: Boolean(vaultId),
			}),
		useQueries: (vaultIds: string[], limit = 60) =>
			useQueries({
				queries: vaultIds.map((vaultId) => ({
					queryKey: ['vault-transactions', 'recent', vaultId, limit],
					queryFn: () => getRecentVaultTransactionsFn(vaultId, limit),
					enabled: Boolean(vaultId),
				})),
			}),
	},
	GetByVault: {
		useQuery: (
			vaultId: string,
			params: VaultTransactionsQueryParams = {}
		): UseQueryResult<PaginatedResponse<VaultTransaction>> =>
			useQuery({
				queryKey: ['vault-transactions', vaultId, params.page, params.limit, params.sortBy],
				queryFn: () => getVaultTransactionsFn(vaultId, params),
				enabled: Boolean(vaultId),
			}),
	},

	GetVaultCategoryStats: {
		useQuery: (vaultId: string): UseQueryResult<VaultCategoryStat[]> =>
			useQuery({
				queryKey: ['vault-category-stats', vaultId],
				queryFn: () => getVaultCategoryStatsFn(vaultId),
				enabled: Boolean(vaultId),
			}),
	},
};
