'use client';

import { format } from 'date-fns';
import { AlertTriangle, ListOrdered } from 'lucide-react';
import { useMemo, useSyncExternalStore, useState } from 'react';

import AddExpenseSheet from '@/components/features/AddExpenseSheet';
import EditExpenseSheet from '@/components/features/EditExpenseSheet';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { ExpenseApi, type Expense } from '@/lib/api/expense';

const SORT_PREFERENCE_KEY = 'expensesSortPreference';
const SORT_PREFERENCE_EVENT = 'expenses-sort-preference-change';
const DEFAULT_SORT_BY = 'date:desc';

const sortOptions = [
	{ value: 'date:desc', label: 'Newest First' },
	{ value: 'date:asc', label: 'Oldest First' },
	{ value: 'amount:desc', label: 'Amount: High to Low' },
	{ value: 'amount:asc', label: 'Amount: Low to High' },
	{ value: 'title:asc', label: 'Title: A to Z' },
	{ value: 'title:desc', label: 'Title: Z to A' },
];

function subscribeToSortPreference(onStoreChange: () => void) {
	if (typeof window === 'undefined') return () => {};

	const handleStorage = (event: StorageEvent) => {
		if (event.key === null || event.key === SORT_PREFERENCE_KEY) {
			onStoreChange();
		}
	};

	window.addEventListener('storage', handleStorage);
	window.addEventListener(SORT_PREFERENCE_EVENT, onStoreChange);

	return () => {
		window.removeEventListener('storage', handleStorage);
		window.removeEventListener(SORT_PREFERENCE_EVENT, onStoreChange);
	};
}

function getServerSortPreferenceSnapshot() {
	return DEFAULT_SORT_BY;
}

function getClientSortPreferenceSnapshot() {
	const saved = window.localStorage.getItem(SORT_PREFERENCE_KEY);
	if (!saved) return DEFAULT_SORT_BY;

	const isValid = sortOptions.some((option) => option.value === saved);
	return isValid ? saved : DEFAULT_SORT_BY;
}

function formatCurrency(value: number) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 2,
	}).format(value);
}

function ExpenseTableSkeleton() {
	return (
		<>
			{Array.from({ length: 6 }).map((_, index) => (
				<TableRow key={`expense-row-skeleton-${index}`} className="border-white/10 hover:bg-transparent">
					<TableCell>
						<Skeleton className="h-4 w-8 bg-slate-800" />
					</TableCell>
					<TableCell>
						<Skeleton className="h-4 w-48 bg-slate-800" />
					</TableCell>
					<TableCell>
						<Skeleton className="h-5 w-24 rounded-full bg-slate-800" />
					</TableCell>
					<TableCell>
						<Skeleton className="h-4 w-28 bg-slate-800" />
					</TableCell>
					<TableCell className="text-right">
						<div className="ml-auto w-fit">
							<Skeleton className="h-4 w-20 bg-slate-800" />
						</div>
					</TableCell>
					<TableCell className="text-right">
						<div className="ml-auto w-fit">
							<Skeleton className="h-8 w-16 rounded-md bg-slate-800" />
						</div>
					</TableCell>
				</TableRow>
			))}
		</>
	);
}

export default function AllExpensesPage() {
	const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
	const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
	const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
	const sortBy = useSyncExternalStore(
		subscribeToSortPreference,
		getClientSortPreferenceSnapshot,
		getServerSortPreferenceSnapshot
	);
	const sortLabel = sortOptions.find((option) => option.value === sortBy)?.label || 'Newest First';

	const onSortChange = (nextSortBy: string) => {
		window.localStorage.setItem(SORT_PREFERENCE_KEY, nextSortBy);
		window.dispatchEvent(new Event(SORT_PREFERENCE_EVENT));
	};

	const {
		data: response,
		isLoading,
		isFetching,
		error,
		refetch,
	} = ExpenseApi.GetList.useQuery({ page: 1, limit: 50, sortBy });

	const deleteExpenseMutation = ExpenseApi.Delete.useMutation({
		onSettled: () => {
			setDeletingExpenseId(null);
			setExpenseToDelete(null);
		},
		onSuccess: (_, deletedExpenseId) => {
			if (selectedExpense?.id === deletedExpenseId) {
				setSelectedExpense(null);
			}
		},
	});

	const expenses: Expense[] = useMemo(() => response?.results || [], [response]);
	const totalResults = response?.totalResults || 0;

	const totalAmount = useMemo(
		() => expenses.reduce((sum, expense) => sum + expense.amount, 0),
		[expenses]
	);

	const closeDetailDialog = () => setSelectedExpense(null);

	const requestDeleteExpense = (expense: Expense) => setExpenseToDelete(expense);

	const confirmDeleteExpense = () => {
		if (!expenseToDelete) return;

		setDeletingExpenseId(expenseToDelete.id);
		deleteExpenseMutation.mutate(expenseToDelete.id);
	};

	if (error) {
		return (
			<div className="space-y-6">
				<section className="mb-2 flex flex-col items-start justify-between gap-4 md:flex-row">
					<div>
						<Badge className="bg-cyan-300 text-slate-950">Expenses</Badge>
						<h2 className="mt-3 text-3xl font-semibold tracking-tight text-white [font-family:var(--font-display)]">
							All Expenses
						</h2>
					</div>
					<AddExpenseSheet />
				</section>

				<Card className="border-red-500/30 bg-red-950/20">
					<CardContent className="flex flex-col items-center gap-3 py-10 text-center">
						<AlertTriangle className="size-7 text-red-300" />
						<p className="font-medium text-red-200">Failed to load expenses.</p>
						<button
							type="button"
							onClick={() => refetch()}
							className="rounded-md border border-red-300/50 px-3 py-1.5 text-sm font-medium text-red-100 hover:bg-red-900/40"
						>
							Try again
						</button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<section className="mb-2 flex flex-col items-start justify-between gap-4 md:flex-row">
				<div>
					<Badge className="bg-cyan-300 text-slate-950">Expenses</Badge>
					<h2 className="mt-3 text-3xl font-semibold tracking-tight text-white [font-family:var(--font-display)]">
						All Expenses
					</h2>
					<p className="mt-1 text-sm text-slate-300">
						Review and edit your full transaction history.
					</p>
				</div>
				<div className="flex w-full items-center justify-end gap-2 md:w-auto">
					<Select value={sortBy} onValueChange={onSortChange}>
						<SelectTrigger
							className="w-48 border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
							aria-label="Sort expenses"
						>
							<SelectValue placeholder="Sort expenses" />
						</SelectTrigger>
						<SelectContent className="border-white/10 bg-slate-900 text-slate-100">
							{sortOptions.map((option) => (
								<SelectItem key={option.value} value={option.value} className="text-slate-100">
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<AddExpenseSheet />
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-2">
				<Card className="border-white/10 bg-slate-900/70">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm text-slate-300">Showing</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-semibold text-white">{isLoading ? '--' : expenses.length}</p>
						<p className="mt-1 text-xs text-slate-300">of {isLoading ? '--' : totalResults} total expenses</p>
					</CardContent>
				</Card>

				<Card className="border-white/10 bg-slate-900/70">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm text-slate-300">Total Amount (Visible Rows)</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-semibold text-white">
							{isLoading ? '--' : formatCurrency(totalAmount)}
						</p>
						<p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-300">
							<ListOrdered className="size-3.5" />
							{isFetching ? 'Refreshing data...' : `Sorted by ${sortLabel}`}
						</p>
					</CardContent>
				</Card>
			</section>

			<Card className="border-white/10 bg-slate-900/70">
				<CardHeader className="pb-2">
					<CardTitle className="text-base text-white">Expense Table</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow className="border-white/10 hover:bg-transparent">
								<TableHead className="w-12 text-slate-300">#</TableHead>
								<TableHead className="text-slate-300">Title</TableHead>
								<TableHead className="text-slate-300">Category</TableHead>
								<TableHead className="text-slate-300">Description</TableHead>
								<TableHead className="text-slate-300">Date</TableHead>
								<TableHead className="text-right text-slate-300">Amount</TableHead>
								<TableHead className="text-right text-slate-300">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<ExpenseTableSkeleton />
							) : expenses.length === 0 ? (
								<TableRow className="border-white/10 hover:bg-transparent">
									<TableCell colSpan={7} className="h-28 text-center text-slate-400">
										No expenses found. Add your first transaction to get started.
									</TableCell>
								</TableRow>
							) : (
								expenses.map((expense, index) => (
									<TableRow
										key={expense.id}
										className="cursor-pointer border-white/10 hover:bg-white/5"
										onClick={() => setSelectedExpense(expense)}
										onKeyDown={(event) => {
											if (event.key === 'Enter' || event.key === ' ') {
												event.preventDefault();
												setSelectedExpense(expense);
											}
										}}
										tabIndex={0}
										aria-label={`Open details for ${expense.title}`}
									>
										<TableCell className="text-slate-400">{index + 1}</TableCell>
										<TableCell className="font-medium text-slate-100">{expense.title}</TableCell>
										<TableCell>
											<Badge variant="outline" className="border-white/15 text-slate-200">
												{expense.category}
											</Badge>
										</TableCell>
										<TableCell className="max-w-56 truncate text-slate-300">
											{expense.description?.trim() ? expense.description : 'No description'}
										</TableCell>
										<TableCell className="text-slate-300">
											{format(new Date(expense.date), 'MMM d, yyyy')}
										</TableCell>
										<TableCell className="text-right font-semibold text-white">
											{formatCurrency(expense.amount)}
										</TableCell>
										<TableCell className="text-right">
											<div
												className="ml-auto flex w-fit items-center gap-2"
												onClick={(event) => event.stopPropagation()}
												onKeyDown={(event) => event.stopPropagation()}
											>
												<EditExpenseSheet expense={expense} />
												<Button
													type="button"
													variant="destructive"
													size="sm"
													disabled={deletingExpenseId === expense.id}
													onClick={() => requestDeleteExpense(expense)}
												>
													{deletingExpenseId === expense.id ? 'Deleting...' : 'Delete'}
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Dialog open={Boolean(selectedExpense)} onOpenChange={(open) => !open && closeDetailDialog()}>
				<DialogContent className="max-h-[85vh] max-w-[92vw] overflow-y-auto border-white/10 bg-slate-900 text-slate-100 sm:max-w-2xl">
					{selectedExpense ? (
						<>
							<DialogHeader>
								<DialogTitle className="text-white">Expense Details</DialogTitle>
								<DialogDescription className="text-slate-400">
									Review this transaction entry.
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4">
								<div className="rounded-lg border border-white/10 bg-slate-800/50 p-4">
									<p className="text-xs font-medium uppercase tracking-wide text-slate-400">Title</p>
									<p className="mt-1 text-base font-semibold text-white">{selectedExpense.title}</p>
								</div>

								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
									<div className="rounded-lg border border-white/10 bg-slate-800/50 p-4">
										<p className="text-xs font-medium uppercase tracking-wide text-slate-400">Amount</p>
										<p className="mt-1 text-lg font-semibold text-white">
											{formatCurrency(selectedExpense.amount)}
										</p>
									</div>

									<div className="rounded-lg border border-white/10 bg-slate-800/50 p-4">
										<p className="text-xs font-medium uppercase tracking-wide text-slate-400">Category</p>
										<div className="mt-2">
											<Badge variant="outline" className="border-white/20 text-slate-200">
												{selectedExpense.category}
											</Badge>
										</div>
									</div>
								</div>

								<div className="rounded-lg border border-white/10 bg-slate-800/50 p-4">
									<p className="text-xs font-medium uppercase tracking-wide text-slate-400">Date</p>
									<p className="mt-1 text-sm text-slate-200">
										{format(new Date(selectedExpense.date), 'EEEE, MMMM d, yyyy')}
									</p>
								</div>

								<div className="rounded-lg border border-white/10 bg-slate-800/50 p-4">
									<p className="text-xs font-medium uppercase tracking-wide text-slate-400">Description</p>
									<p className="mt-1 text-sm leading-6 text-slate-200">
										{selectedExpense.description?.trim() || 'No description for this expense.'}
									</p>
								</div>

								<div className="flex justify-end">
									<Button
										type="button"
										variant="destructive"
										disabled={deletingExpenseId === selectedExpense.id}
										onClick={() => requestDeleteExpense(selectedExpense)}
									>
										{deletingExpenseId === selectedExpense.id ? 'Deleting...' : 'Delete Expense'}
									</Button>
								</div>
							</div>
						</>
					) : null}
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={Boolean(expenseToDelete)}
				onOpenChange={(open) => {
					if (!open) setExpenseToDelete(null);
				}}
			>
				<AlertDialogContent className="border-white/10 bg-slate-900 text-slate-100">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-white">Delete Expense?</AlertDialogTitle>
						<AlertDialogDescription className="text-slate-300">
							This will permanently delete{' '}
							<span className="font-semibold text-white">{expenseToDelete?.title || 'this expense'}</span>.
							 This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="border-white/10 bg-slate-900/60">
						<AlertDialogCancel className="border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={confirmDeleteExpense}
							disabled={Boolean(deletingExpenseId)}
						>
							{deletingExpenseId ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
