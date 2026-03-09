'use client';

import { format } from 'date-fns';
import {
	ArrowDownRight,
	CreditCard,
	DollarSign,
	Receipt,
	Target,
} from 'lucide-react';
import { useMemo, useState, useSyncExternalStore } from 'react';

import AddExpenseSheet from '@/components/features/AddExpensesSheet';
import { ExpenseApi } from '@/lib/api/expense';
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
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

type CurrentUser = {
	name: string;
};

type ExpenseRow = {
	id: string;
	title: string;
	category: string;
	amount: number;
	date: string;
	description?: string;
};

function formatCurrency(value: number) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 2,
	}).format(value);
}

const noOpSubscribe = () => () => {};
const SERVER_USER_NAME_SNAPSHOT = 'there';

function getServerUserNameSnapshot(): string {
	return SERVER_USER_NAME_SNAPSHOT;
}

function getClientUserNameSnapshot(): string {
	const userString = window.localStorage.getItem('user');
	if (!userString) return 'there';

	try {
		const parsed = JSON.parse(userString) as Partial<CurrentUser>;
		if (parsed.name && typeof parsed.name === 'string') {
			return parsed.name;
		}
	} catch {
		return 'there';
	}

	return 'there';
}

function getServerDateSnapshot(): string {
	return 'Today';
}

function getClientDateSnapshot(): string {
	return format(new Date(), 'EEEE, MMMM d');
}

const DEFAULT_BUDGET_LIMIT = 1200;
const BUDGET_STORAGE_KEY = 'monthlyBudgetLimit';
const BUDGET_CHANGE_EVENT = 'budget-limit-change';

function subscribeToBudget(onStoreChange: () => void) {
	if (typeof window === 'undefined') return () => {};

	const handleStorage = (event: StorageEvent) => {
		if (event.key === null || event.key === BUDGET_STORAGE_KEY) {
			onStoreChange();
		}
	};

	window.addEventListener('storage', handleStorage);
	window.addEventListener(BUDGET_CHANGE_EVENT, onStoreChange);

	return () => {
		window.removeEventListener('storage', handleStorage);
		window.removeEventListener(BUDGET_CHANGE_EVENT, onStoreChange);
	};
}

function getServerBudgetLimitSnapshot(): number {
	return DEFAULT_BUDGET_LIMIT;
}

function getClientBudgetLimitSnapshot(): number {
	const savedValue = window.localStorage.getItem(BUDGET_STORAGE_KEY);
	if (!savedValue) return DEFAULT_BUDGET_LIMIT;

	const parsed = Number(savedValue);
	if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_BUDGET_LIMIT;

	return parsed;
}

export default function DashboardPage() {
	const userName = useSyncExternalStore(
		noOpSubscribe,
		getClientUserNameSnapshot,
		getServerUserNameSnapshot
	);

	const todayLabel = useSyncExternalStore(
		noOpSubscribe,
		getClientDateSnapshot,
		getServerDateSnapshot
	);

	const { data: statsData, isLoading: loadingStats } = ExpenseApi.GetStats.useQuery();
	const { data: recentData, isLoading: loadingRecent } = ExpenseApi.GetRecent.useQuery(5);
	const [selectedExpense, setSelectedExpense] = useState<ExpenseRow | null>(null);

	const recentExpenses: ExpenseRow[] = recentData?.results || [];

	const monthSpend = useMemo(
		() => statsData?.reduce((total, item) => total + item.totalAmount, 0) || 0,
		[statsData]
	);

	const topCategory = statsData?.[0]?.category || 'None';
	const totalTransactions = useMemo(
		() => statsData?.reduce((total, item) => total + item.count, 0) || 0,
		[statsData]
	);

	const budgetLimit = useSyncExternalStore(
		subscribeToBudget,
		getClientBudgetLimitSnapshot,
		getServerBudgetLimitSnapshot
	);
	const [budgetDraft, setBudgetDraft] = useState('');
	const [budgetError, setBudgetError] = useState<string | null>(null);

	const saveBudget = () => {
		const parsed = Number(budgetDraft);
		if (!Number.isFinite(parsed) || parsed <= 0) {
			setBudgetError('Enter a budget greater than 0.');
			return;
		}

		setBudgetError(null);
		window.localStorage.setItem(BUDGET_STORAGE_KEY, String(parsed));
		window.dispatchEvent(new Event(BUDGET_CHANGE_EVENT));
		setBudgetDraft('');
	};

	const budgetUsed = budgetLimit > 0 ? Math.min(100, (monthSpend / budgetLimit) * 100) : 0;
	const budgetUsedLabel = budgetUsed > 0 && budgetUsed < 1 ? '<1%' : `${Math.round(budgetUsed)}%`;

	return (
		<div className="space-y-6">
			<section className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row">
				<div>
					<Badge className="bg-cyan-300 text-slate-950">Overview</Badge>
					<h2 className="mt-3 text-3xl font-semibold tracking-tight text-white [font-family:var(--font-display)]">
						Welcome back, {userName}
					</h2>
					<p className="mt-1 text-sm text-slate-300">
						{todayLabel} - Here is your finance pulse for today.
					</p>
				</div>

				<AddExpenseSheet />
			</section>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card className="border-white/10 bg-slate-900/70">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm text-slate-300">This Month Spend</CardTitle>
						<DollarSign className="size-4 text-cyan-300" />
					</CardHeader>
					<CardContent>
						{loadingStats ? (
							<Skeleton className="h-9 w-32 bg-slate-800" />
						) : (
							<>
								<p className="text-3xl font-semibold text-white">{formatCurrency(monthSpend)}</p>
								<p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-300">
									<ArrowDownRight className="size-3.5" />
									Live total from your categories
								</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card className="border-white/10 bg-slate-900/70">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm text-slate-300">Transactions</CardTitle>
						<Receipt className="size-4 text-cyan-300" />
					</CardHeader>
					<CardContent>
						{loadingStats ? (
							<Skeleton className="h-9 w-16 bg-slate-800" />
						) : (
							<>
								<p className="text-3xl font-semibold text-white">{totalTransactions}</p>
								<p className="mt-1 text-xs text-slate-300">Total saved transactions</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card className="border-white/10 bg-slate-900/70">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm text-slate-300">Top Category</CardTitle>
						<CreditCard className="size-4 text-cyan-300" />
					</CardHeader>
					<CardContent>
						{loadingStats ? (
							<Skeleton className="h-9 w-24 bg-slate-800" />
						) : (
							<>
								<p className="text-3xl font-semibold text-white">{topCategory}</p>
								<p className="mt-1 text-xs text-slate-300">Category with highest spend</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card className="border-white/10 bg-slate-900/70">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm text-slate-300">Monthly Budget</CardTitle>
						<Target className="size-4 text-cyan-300" />
					</CardHeader>
					<CardContent className="space-y-3">
						<p className="text-3xl font-semibold text-white">{budgetUsedLabel}</p>
						<p className="mt-1 text-xs text-slate-300">{formatCurrency(budgetLimit - monthSpend)} remaining</p>
						<div className="flex items-center gap-2">
							<Input
								type="number"
								min="1"
								step="1"
								value={budgetDraft}
								onChange={(event) => {
									setBudgetDraft(event.target.value);
									if (budgetError) setBudgetError(null);
								}}
								placeholder={`Set budget (current ${budgetLimit})`}
								className="h-8 border-slate-700 bg-slate-800 text-white"
							/>
							<Button
								type="button"
								onClick={saveBudget}
								className="h-8 bg-cyan-300 px-3 text-xs font-semibold text-slate-950 hover:bg-cyan-200"
							>
								Save
							</Button>
						</div>
						{budgetError ? (
							<p className="text-xs font-medium text-red-400">{budgetError}</p>
						) : null}
					</CardContent>
				</Card>
			</section>

			<section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
				<Card className="border-white/10 bg-slate-900/70">
					<CardHeader className="pb-2">
						<CardTitle className="text-base text-white">Recent Transactions</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow className="border-white/10 hover:bg-transparent">
									<TableHead className="text-slate-300">Title</TableHead>
									<TableHead className="text-slate-300">Category</TableHead>
									<TableHead className="text-slate-300">Date</TableHead>
									<TableHead className="text-right text-slate-300">Amount</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loadingRecent ? (
									<>
										{Array.from({ length: 3 }).map((_, index) => (
											<TableRow key={`recent-skeleton-${index}`} className="border-white/10 hover:bg-transparent">
												<TableCell>
													<Skeleton className="h-4 w-48 bg-slate-800" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-5 w-20 rounded-full bg-slate-800" />
												</TableCell>
												<TableCell>
													<Skeleton className="h-4 w-28 bg-slate-800" />
												</TableCell>
												<TableCell className="text-right">
													<div className="ml-auto w-fit">
														<Skeleton className="h-4 w-20 bg-slate-800" />
													</div>
												</TableCell>
											</TableRow>
										))}
									</>
								) : recentExpenses.length === 0 ? (
									<TableRow className="border-white/10 hover:bg-transparent">
										<TableCell colSpan={4} className="h-24 text-center text-slate-400">
											No transactions yet.
										</TableCell>
									</TableRow>
								) : (
									recentExpenses.map((item) => (
										<TableRow
											key={item.id}
											className="cursor-pointer border-white/10 hover:bg-white/5"
											onClick={() => setSelectedExpense(item)}
											onKeyDown={(event) => {
												if (event.key === 'Enter' || event.key === ' ') {
													event.preventDefault();
													setSelectedExpense(item);
												}
											}}
											tabIndex={0}
											aria-label={`Open details for ${item.title}`}
										>
											<TableCell className="font-medium text-slate-100">{item.title}</TableCell>
											<TableCell>
												<Badge variant="outline" className="border-white/15 text-slate-200">
													{item.category}
												</Badge>
											</TableCell>
											<TableCell className="text-slate-300">{format(new Date(item.date), 'MMM d, yyyy')}</TableCell>
											<TableCell className="text-right font-semibold text-white">
												{formatCurrency(item.amount)}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				<Card className="border-white/10 bg-slate-900/70">
					<CardHeader className="pb-2">
						<CardTitle className="text-base text-white">Budget Health</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<div className="mb-2 flex items-center justify-between text-sm">
								<span className="text-slate-300">Monthly utilization</span>
								<span className="font-semibold text-slate-100">{budgetUsedLabel}</span>
							</div>
							<Progress value={budgetUsed} className="h-2 bg-slate-800" />
						</div>

						<Separator className="bg-white/10" />

						<div className="space-y-2 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-slate-300">Budget</span>
								<span className="font-medium text-white">{formatCurrency(budgetLimit)}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-slate-300">Spent</span>
								<span className="font-medium text-white">{formatCurrency(monthSpend)}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-slate-300">Remaining</span>
								<span className="font-medium text-emerald-300">
									{formatCurrency(Math.max(budgetLimit - monthSpend, 0))}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</section>

			<Dialog open={Boolean(selectedExpense)} onOpenChange={(open) => !open && setSelectedExpense(null)}>
				<DialogContent className="max-h-[85vh] max-w-[92vw] overflow-y-auto border-white/10 bg-slate-900 text-slate-100 sm:max-w-2xl">
					{selectedExpense ? (
						<>
							<DialogHeader>
								<DialogTitle className="text-white">Expense Details</DialogTitle>
								<DialogDescription className="text-slate-400">
									Details from your recent transaction list.
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
							</div>
						</>
					) : null}
				</DialogContent>
			</Dialog>
		</div>
	);
}

