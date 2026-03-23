'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Loader2, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ApiErrorResponse, Expense, ExpenseApi } from '@/lib/api/expense';

const suggestedCategories = [
	'Food',
	'Transport',
	'Entertainment',
	'Health',
	'Other',
];

const editExpenseSchema = z.object({
	title: z.string().trim().min(1, 'Title is required.').max(120, 'Title must be at most 120 characters.'),
	amount: z.number({ message: 'Amount is required.' }).positive('Amount must be greater than 0.'),
	category: z.string().trim().min(1, 'Category is required.').max(50, 'Category must be at most 50 characters.'),
	description: z
		.string()
		.trim()
		.max(1000, 'Description must be at most 1000 characters.')
		.optional()
		.or(z.literal('')),
	date: z.string().optional(),
});

type EditExpenseFormValues = z.infer<typeof editExpenseSchema>;

export interface EditExpenseSheetProps {
	expense: Expense;
	onUpdated?: (expense: Expense) => void;
}

function getApiErrorMessage(error: unknown) {
	if (axios.isAxiosError<ApiErrorResponse>(error)) {
		return error.response?.data?.message || 'Unable to update expense. Please try again.';
	}

	return 'Unable to update expense. Please try again.';
}

function toDateInputValue(value?: string): string {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return date.toISOString().slice(0, 10);
}

export default function EditExpenseSheet({ expense, onUpdated }: EditExpenseSheetProps) {
	const [open, setOpen] = useState(false);

	const defaultValues = useMemo<EditExpenseFormValues>(
		() => ({
			title: expense.title,
			amount: expense.amount,
			category: expense.category,
			description: expense.description || '',
			date: toDateInputValue(expense.date),
		}),
		[expense]
	);

	const form = useForm<EditExpenseFormValues>({
		resolver: zodResolver(editExpenseSchema),
		defaultValues,
		mode: 'onBlur',
	});

	const updateExpenseMutation = ExpenseApi.Update.useMutation({
		onSuccess: (updatedExpense) => {
			onUpdated?.(updatedExpense);
			setOpen(false);
		},
		onError: (error) => {
			form.setError('root', { message: getApiErrorMessage(error) });
		},
	});

	const onSubmit = (values: EditExpenseFormValues) => {
		form.clearErrors('root');

		updateExpenseMutation.mutate({
			expenseId: expense.id,
			payload: {
				title: values.title,
				amount: values.amount,
				category: values.category.trim(),
				description: values.description || undefined,
				date: values.date || undefined,
			},
		});
	};

	const isSubmitting = updateExpenseMutation.isPending;

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (nextOpen) {
					form.reset(defaultValues);
					form.clearErrors();
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="gap-2 border-slate-500 bg-slate-900 text-slate-100 hover:bg-slate-800"
				>
					<Pencil size={16} />
					Edit
				</Button>
			</DialogTrigger>

			<DialogContent className="w-full border border-slate-800 bg-slate-900 p-0 text-white sm:max-w-xl md:max-w-2xl">
				<div className="flex h-full flex-col">
					<DialogHeader className="border-b border-slate-800 px-6 py-5 text-left">
						<DialogTitle className="text-white">Edit Expense</DialogTitle>
						<DialogDescription className="text-slate-400">
							Update any field. You can choose a suggested category or type a custom one.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-y-auto px-6 py-6" noValidate>
						<div className="flex-1 space-y-5">
							<div className="space-y-2">
								<Label htmlFor="edit-title" className="text-slate-300">Title</Label>
								<Input
									id="edit-title"
									placeholder="e.g. Uber to Airport"
									className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-400"
									disabled={isSubmitting}
									{...form.register('title')}
								/>
								{form.formState.errors.title ? (
									<p className="text-xs font-medium text-red-400">{form.formState.errors.title.message}</p>
								) : null}
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="edit-amount" className="text-slate-300">Amount ($)</Label>
									<Input
										id="edit-amount"
										type="number"
										step="0.01"
										placeholder="0.00"
										className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-400"
										disabled={isSubmitting}
										{...form.register('amount', { valueAsNumber: true })}
									/>
									{form.formState.errors.amount ? (
										<p className="text-xs font-medium text-red-400">{form.formState.errors.amount.message}</p>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="edit-category" className="text-slate-300">Category</Label>
									<Input
										id="edit-category"
										list="edit-category-suggestions"
										placeholder="Select or type your own"
										className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-400"
										disabled={isSubmitting}
										{...form.register('category')}
									/>
									<datalist id="edit-category-suggestions">
										{suggestedCategories.map((category) => (
											<option key={category} value={category} />
										))}
									</datalist>
									{form.formState.errors.category ? (
										<p className="text-xs font-medium text-red-400">{form.formState.errors.category.message}</p>
									) : null}
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="edit-date" className="text-slate-300">Date (Optional)</Label>
								<Input
									id="edit-date"
									type="date"
									className="border-slate-700 bg-slate-800 text-white"
									disabled={isSubmitting}
									{...form.register('date')}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="edit-description" className="text-slate-300">Description (Optional)</Label>
								<Textarea
									id="edit-description"
									placeholder="Add a note..."
									className="min-h-24 border-slate-700 bg-slate-800 text-white placeholder:text-slate-400"
									disabled={isSubmitting}
									{...form.register('description')}
								/>
								{form.formState.errors.description ? (
									<p className="text-xs font-medium text-red-400">{form.formState.errors.description.message}</p>
								) : null}
							</div>

							{form.formState.errors.root ? (
								<div className="rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm font-medium text-red-200">
									{form.formState.errors.root.message}
								</div>
							) : null}
						</div>

						<Button
							type="submit"
							className="mt-6 w-full bg-teal-500 font-bold text-slate-900 hover:bg-teal-400"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="size-4 animate-spin" />
									Updating...
								</>
							) : (
								'Save Changes'
							)}
						</Button>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
