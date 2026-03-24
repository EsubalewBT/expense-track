'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Briefcase, Home, Loader2, PiggyBank, TrendingUp, Wallet, Zap } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FintrackApi } from '@/lib/api/fintrack';

const iconValues = ['wallet', 'briefcase', 'zap', 'home', 'piggy-bank', 'trending-up'] as const;
const colorValues = ['teal', 'violet', 'amber', 'rose', 'blue', 'emerald'] as const;

const ICONS = [
	{ value: 'wallet', Icon: Wallet },
	{ value: 'briefcase', Icon: Briefcase },
	{ value: 'zap', Icon: Zap },
	{ value: 'home', Icon: Home },
	{ value: 'piggy-bank', Icon: PiggyBank },
	{ value: 'trending-up', Icon: TrendingUp },
] as const;

const COLOR_OPTIONS = [
	{ value: 'teal', className: 'bg-[#11d8c4]' },
	{ value: 'violet', className: 'bg-[#6c4de6]' },
	{ value: 'amber', className: 'bg-[#b7831a]' },
	{ value: 'rose', className: 'bg-[#a9375c]' },
	{ value: 'blue', className: 'bg-[#3167d8]' },
	{ value: 'emerald', className: 'bg-[#0c8474]' },
] as const;

const formSchema = z.object({
	title: z.string().trim().min(1, 'Name is required').max(120, 'Name must be at most 120 characters.'),
	description: z.string().trim().max(500, 'Description must be at most 500 characters.').optional().or(z.literal('')),
	icon: z.enum(iconValues),
	color: z.enum(colorValues),
});

type CreateFintrackFormValues = z.infer<typeof formSchema>;

interface CreateFintrackModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface ApiErrorResponse {
	message?: string;
}

function getApiErrorMessage(error: unknown): string {
	if (axios.isAxiosError<ApiErrorResponse>(error)) {
		return error.response?.data?.message || 'Failed to create fintrack.';
	}

	return 'Failed to create fintrack.';
}

export function CreateFintrackModal({ open, onOpenChange }: CreateFintrackModalProps) {
	const form = useForm<CreateFintrackFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { title: '', description: '', icon: 'wallet', color: 'teal' },
		mode: 'onBlur',
	});

	const createMutation = FintrackApi.Create.useMutation();
	const selectedIcon = useWatch({ control: form.control, name: 'icon' });
	const selectedColor = useWatch({ control: form.control, name: 'color' });

	const onSubmit = (values: CreateFintrackFormValues) => {
		form.clearErrors('root');

		createMutation.mutate(
			{
				title: values.title,
				description: values.description || undefined,
				icon: values.icon,
				color: values.color,
			},
			{
				onSuccess: () => {
					toast.success('New ledger established.');
					form.reset();
					onOpenChange(false);
				},
				onError: (error) => {
					const message = getApiErrorMessage(error);
					form.setError('root', { message });
					toast.error(message);
				},
			}
		);
	};

	const isSubmitting = createMutation.isPending;

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				onOpenChange(nextOpen);
				if (!nextOpen) {
					form.clearErrors();
				}
			}}
		>
			<DialogContent className="overflow-hidden border border-[#263756]/85 bg-[#0d1834] p-0 text-[#dbe8ff] shadow-[0_28px_90px_rgba(0,0,0,0.65)] sm:max-w-130">
				<div className="p-6 sm:p-7">
					<DialogHeader className="space-y-1.5">
						<DialogTitle className="text-3xl font-semibold tracking-tight text-[#e6efff]">Create New Cashbook</DialogTitle>
					</DialogHeader>

					<form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
					<div className="space-y-2">
						<Label htmlFor="fintrack-title" className="text-sm font-medium text-[#9cb1d9]">
							Book Name
						</Label>
						<Input
							id="fintrack-title"
							placeholder="e.g. Personal, Business..."
							className="h-11 rounded-lg border-[#2a4064] bg-[#1b2a44] text-[#d7e4ff] placeholder:text-[#6e83ab] focus-visible:ring-[#14cfbc]"
							disabled={isSubmitting}
							{...form.register('title')}
						/>
						{form.formState.errors.title ? (
							<p className="text-xs font-medium text-red-400">{form.formState.errors.title.message}</p>
						) : null}
					</div>

					<div className="space-y-2">
						<Label htmlFor="fintrack-description" className="text-sm font-medium text-[#9cb1d9]">
							Description
						</Label>
						<Input
							id="fintrack-description"
							placeholder="Short description..."
							className="h-11 rounded-lg border-[#2a4064] bg-[#1b2a44] text-[#d7e4ff] placeholder:text-[#6e83ab] focus-visible:ring-[#14cfbc]"
							disabled={isSubmitting}
							{...form.register('description')}
						/>
						{form.formState.errors.description ? (
							<p className="text-xs font-medium text-red-400">{form.formState.errors.description.message}</p>
						) : null}
					</div>

					<div className="space-y-2">
						<Label className="text-sm font-medium text-[#9cb1d9]">Icon</Label>
						<div className="grid grid-cols-6 gap-2.5">
							{ICONS.map((item) => {
								const isActive = selectedIcon === item.value;
								return (
									<button
										key={item.value}
										type="button"
										onClick={() => form.setValue('icon', item.value, { shouldDirty: true })}
										disabled={isSubmitting}
										className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
											isActive
												? 'border-[#14cfbc] bg-[#14cfbc]/20 text-[#49ffea]'
												: 'border-[#2a4064] bg-[#182742] text-[#7a8cb1] hover:border-[#36517c] hover:text-[#b7c4e0]'
										}`}
									>
										<item.Icon size={20} />
									</button>
								);
							})}
						</div>
					</div>

					<div className="space-y-2">
						<Label className="text-sm font-medium text-[#9cb1d9]">Color</Label>
						<div className="flex items-center gap-2.5">
							{COLOR_OPTIONS.map((item) => {
								const isActive = selectedColor === item.value;
								return (
									<button
										key={item.value}
										type="button"
										onClick={() => form.setValue('color', item.value, { shouldDirty: true })}
										aria-label={`Select ${item.value} color`}
										disabled={isSubmitting}
										className={`h-8 w-8 rounded-full border-2 transition-all ${item.className} ${
											isActive ? 'scale-110 border-white/90' : 'border-transparent opacity-90 hover:opacity-100'
										}`}
									/>
								);
							})}
						</div>
					</div>

					{form.formState.errors.root ? (
						<div className="rounded-lg border border-red-300/35 bg-red-950/35 px-3 py-2 text-sm font-medium text-red-200">
							{form.formState.errors.root.message}
						</div>
					) : null}

					<Button
						type="submit"
						disabled={isSubmitting}
						className="mt-1 h-12 w-full rounded-xl bg-linear-to-r from-[#119c95] to-[#16b2a7] text-base font-semibold text-[#083430] hover:from-[#13afa6] hover:to-[#1ac6ba]"
					>
						{isSubmitting ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Creating...
							</>
						) : (
							'Create Book'
						)}
					</Button>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
