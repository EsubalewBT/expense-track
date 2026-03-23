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
}

export const FintrackApi = {
	GetAll: {
		useQuery: () =>
			useQuery({
				queryKey: ['fintracks'],
				queryFn: async () => {
					const res = await api.get<Fintrack[]>('/fintracks');
					return res.data;
				},
			}),
	},

	Create: {
		useMutation: () => {
			const queryClient = useQueryClient();
			return useMutation({
				mutationFn: async (data: Partial<Fintrack>) => {
					const res = await api.post('/fintracks', data);
					return res.data;
				},
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ['fintracks'] });
				},
			});
		},
	},
};
