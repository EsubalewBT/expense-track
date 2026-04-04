import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './axios';

// This must match what the backend returns.
export interface Fintrack {
	id: string;
	title: string;
	description?: string;
	icon: 'wallet' | 'briefcase' | 'zap' | 'home' | 'piggy-bank' | 'trending-up';
	color: string;
	balance: number;
	income: number;
	expense: number;
	transactionsCount: number;
}

export interface FintrackStat {
	type: 'INCOME' | 'EXPENSE';
	total: number;
}

export const FintrackApi = {
	GetAll: {
		useQuery: () =>
			useQuery({
				queryKey: ['fintracks'],
				queryFn: async () => {
					const res = await api.get<Fintrack[]>('/fintrack');
					return res.data;
				},
			}),
	},

	GetById: {
		useQuery: (id: string) =>
			useQuery({
				queryKey: ['fintracks', id],
				queryFn: async () => {
					const res = await api.get<Fintrack>(`/fintrack/${id}`);
					return res.data;
				},
				enabled: Boolean(id),
			}),
	},

	GetStats: {
		useQuery: (id: string) =>
			useQuery({
				queryKey: ['fintracks', id, 'stats'],
				queryFn: async () => {
					const res = await api.get<FintrackStat[]>(`/fintrack/${id}/stats`);
					return res.data;
				},
				enabled: Boolean(id),
			}),
	},

	Create: {
		useMutation: () => {
			const queryClient = useQueryClient();
			return useMutation({
				mutationFn: async (data: Partial<Fintrack>) => {
					const res = await api.post('/fintrack', data);
					return res.data;
				},
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ['fintracks'] });
				},
			});
		},
	},
};
