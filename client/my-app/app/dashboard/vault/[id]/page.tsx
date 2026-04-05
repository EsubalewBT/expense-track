'use client';

import { format } from 'date-fns';
import { ArrowDown, ArrowUp, BarChart3, Landmark, Loader2, Search, Trash2, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import VaultHeader from '@/components/features/VaultHeader';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FintrackApi } from '@/lib/api/fintrack';
import {
	TransactionApi,
	type VaultCategoryStat,
	type VaultTransaction,
} from '@/lib/api/transaction';

const CATEGORY_COLORS = ['#22d3aa', '#fb7185', '#f59e0b', '#818cf8', '#38bdf8', '#e879f9', '#4ade80'];

type NormalizedStat = {
	type?: string;
	total?: unknown;
};

type TimeRange = 'all' | 'week' | 'month' | 'year';
type TransactionMode = 'INCOME' | 'EXPENSE';
type PaymentMode = 'BANK' | 'CASH';
type VaultTab = 'transactions' | 'analytics';

const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
	{ value: 'all', label: 'All Time' },
	{ value: 'week', label: 'This Week' },
	{ value: 'month', label: 'This Month' },
	{ value: 'year', label: 'This Year' },
];

const SUGGESTED_TRANSACTION_CATEGORIES = [
	'Salary',
	'Investment',
	'Food',
	'Transport',
	'Housing',
	'Entertainment',
	'Health',
	'Other',
];

const ALLOWED_TRANSACTION_CATEGORIES = new Set(SUGGESTED_TRANSACTION_CATEGORIES);

const PAYMENT_MODE_PREFIX = /^\[MODE:(BANK|CASH)\]\s*/i;

function getTodayDateInputValue(): string {
	const now = new Date();
	const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
	return local.toISOString().slice(0, 10);
}

function getPaymentModeFromDescription(description?: string): PaymentMode {
	if (!description) {
		return 'BANK';
	}

	const match = description.match(PAYMENT_MODE_PREFIX);
	if (!match) {
		return 'BANK';
	}

	return match[1].toUpperCase() === 'CASH' ? 'CASH' : 'BANK';
}

function getNotesFromDescription(description?: string): string {
	if (!description) {
		return '';
	}

	return description.replace(PAYMENT_MODE_PREFIX, '').trim();
}

function toSafeNumber(value: unknown): number {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : 0;
	}

	if (typeof value === 'string') {
		const parsed = Number.parseFloat(value.replace(/,/g, '').trim());
		return Number.isFinite(parsed) ? parsed : 0;
	}

	if (value && typeof value === 'object' && 'toString' in value) {
		const parsed = Number.parseFloat(String(value));
		return Number.isFinite(parsed) ? parsed : 0;
	}

	return 0;
}

function formatAmount(value: number): string {
	return value.toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

function extractStatsTotal(stats: NormalizedStat[], type: 'INCOME' | 'EXPENSE'): number {
	const found = stats.find((item) => String(item.type || '').toUpperCase() === type);
	return toSafeNumber(found?.total);
}

function getSignedAmount(transaction: VaultTransaction): number {
	const amount = Math.abs(toSafeNumber(transaction.amount));
	return transaction.type === 'INCOME' ? amount : -amount;
}

function isTransactionInRange(rawDate: string, range: TimeRange): boolean {
	if (range === 'all') return true;

	const txDate = new Date(rawDate);
	if (Number.isNaN(txDate.getTime())) return false;

	const now = new Date();

	if (range === 'year') {
		return txDate.getFullYear() === now.getFullYear();
	}

	if (range === 'month') {
		return (
			txDate.getFullYear() === now.getFullYear() &&
			txDate.getMonth() === now.getMonth()
		);
	}

	const startOfWeek = new Date(now);
	startOfWeek.setHours(0, 0, 0, 0);
	startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

	const endOfWeek = new Date(startOfWeek);
	endOfWeek.setDate(endOfWeek.getDate() + 7);

	return txDate >= startOfWeek && txDate < endOfWeek;
}

function HeatmapCell({ count, maxCount }: { count: number; maxCount: number }) {
	const ratio = maxCount > 0 ? count / maxCount : 0;

	let colorClass = 'bg-[#1a3250]';
	if (count > 0 && ratio <= 0.34) colorClass = 'bg-[#235246]';
	if (ratio > 0.34 && ratio <= 0.67) colorClass = 'bg-[#2a7562]';
	if (ratio > 0.67) colorClass = 'bg-[#31a689]';

	return (
		<div className={`h-14 rounded-md border border-white/5 ${colorClass} sm:h-20`} />
	);
}

export default function VaultPage() {
	const params = useParams<{ id: string }>();
	const vaultId = Array.isArray(params?.id) ? params.id[0] : (params?.id || '');
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const tabParam = searchParams.get('tab');
	const activeTab: VaultTab = tabParam === 'analytics' ? 'analytics' : 'transactions';

	const [searchTerm, setSearchTerm] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('all');
	const [timeRange, setTimeRange] = useState<TimeRange>('all');
	const [isRecordSheetOpen, setIsRecordSheetOpen] = useState(false);
	const [recordType, setRecordType] = useState<TransactionMode>('INCOME');
	const [recordAmount, setRecordAmount] = useState('');
	const [recordTitle, setRecordTitle] = useState('');
	const [recordCategory, setRecordCategory] = useState('');
	const [recordPaymentMode, setRecordPaymentMode] = useState<PaymentMode>('BANK');
	const [recordDate, setRecordDate] = useState(getTodayDateInputValue());
	const [recordNotes, setRecordNotes] = useState('');
	const [recordError, setRecordError] = useState<string | null>(null);
	const [transactionToDelete, setTransactionToDelete] = useState<VaultTransaction | null>(null);
	const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);

	const handleTabChange = (value: string) => {
		const nextTab: VaultTab = value === 'analytics' ? 'analytics' : 'transactions';
		const params = new URLSearchParams(searchParams.toString());
		if (nextTab === 'transactions') {
			params.delete('tab');
		} else {
			params.set('tab', nextTab);
		}
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
	};

	const deleteTransactionMutation = TransactionApi.Delete.useMutation({
		onMutate: ({ transactionId }) => {
			setDeletingTransactionId(transactionId);
		},
		onSuccess: async () => {
			setTransactionToDelete(null);
		},
		onSettled: () => {
			setDeletingTransactionId(null);
		},
	});

	const createTransactionMutation = TransactionApi.Create.useMutation({
		onSuccess: async (_data, variables) => {
			setIsRecordSheetOpen(false);
			setRecordAmount('');
			setRecordTitle('');
			setRecordCategory('');
			setRecordPaymentMode('BANK');
			setRecordDate(getTodayDateInputValue());
			setRecordNotes('');
			setRecordError(null);
			toast.success(variables.type === 'INCOME' ? 'Income saved successfully.' : 'Expense saved successfully.');

		},
		onError: (error: unknown) => {
			const message =
				typeof (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message ===
				'string'
					? String((error as { response?: { data?: { message?: string } } }).response?.data?.message)
					: 'Unable to record this transaction. Please try again.';

			setRecordError(message);
			toast.error(message);
		},
	});

	const openRecordSheet = (type: TransactionMode) => {
		setRecordType(type);
		setRecordAmount('');
		setRecordTitle('');
		setRecordCategory(type === 'INCOME' ? 'Salary' : 'Food');
		setRecordPaymentMode('BANK');
		setRecordDate(getTodayDateInputValue());
		setRecordNotes('');
		setRecordError(null);
		setIsRecordSheetOpen(true);
	};

	const submitRecordTransaction = () => {
		setRecordError(null);

		if (!vaultId) {
			const message = 'Vault is missing. Please refresh and try again.';
			setRecordError(message);
			toast.error(message);
			return;
		}

		const amount = Number.parseFloat(recordAmount);
		if (!Number.isFinite(amount) || amount <= 0) {
			const message = 'Enter a valid amount greater than 0.';
			setRecordError(message);
			toast.error(message);
			return;
		}

		const normalizedTitle = recordTitle.trim() || (recordType === 'INCOME' ? 'Income' : 'Expense');
		const rawCategory = recordCategory.trim();
		const normalizedCategory = ALLOWED_TRANSACTION_CATEGORIES.has(rawCategory)
			? rawCategory
			: recordType === 'INCOME'
				? 'Salary'
				: 'Other';

		const notes = recordNotes.trim();
		const description = `[MODE:${recordPaymentMode}]${notes ? ` ${notes}` : ''}`;

		createTransactionMutation.mutate({
			title: normalizedTitle,
			type: recordType,
			amount,
			category: normalizedCategory,
			description,
			date: recordDate || undefined,
			fintrackId: vaultId,
		});
	};

	const requestDeleteTransaction = (transaction: VaultTransaction) => {
		setTransactionToDelete(transaction);
	};

	const confirmDeleteTransaction = () => {
		if (!transactionToDelete) return;
		deleteTransactionMutation.mutate({ transactionId: transactionToDelete.id, vaultId });
	};

	const {
		data: vault,
		isLoading: isVaultLoading,
		isError: isVaultError,
	} = FintrackApi.GetById.useQuery(vaultId);

	const { data: rawStats = [] } = FintrackApi.GetStats.useQuery(vaultId);
	const {
		data: transactionsResponse,
		isLoading: isTransactionsLoading,
	} = TransactionApi.GetByVault.useQuery(vaultId, {
		page: 1,
		limit: 100,
		sortBy: 'date:desc',
	});
	const { data: rawCategoryStats = [] } = TransactionApi.GetVaultCategoryStats.useQuery(vaultId);

	const stats = (rawStats || []) as NormalizedStat[];
	const transactions = useMemo(
		() => (transactionsResponse?.results || []) as VaultTransaction[],
		[transactionsResponse]
	);
	const categoryStats = useMemo(
		() => (rawCategoryStats || []) as VaultCategoryStat[],
		[rawCategoryStats]
	);

	const totalIn = extractStatsTotal(stats, 'INCOME') || toSafeNumber(vault?.income);
	const totalOut = extractStatsTotal(stats, 'EXPENSE') || toSafeNumber(vault?.expense);
	const netBalance = totalIn - totalOut || toSafeNumber(vault?.balance);

	const categoryOptions = useMemo(
		() => ['all', ...new Set(transactions.map((tx) => tx.category).filter(Boolean))],
		[transactions]
	);

	const recordCategoryOptions = useMemo(
		() =>
			Array.from(
				new Set([
					...SUGGESTED_TRANSACTION_CATEGORIES,
					...transactions.map((tx) => tx.category).filter(Boolean),
				])
			),
		[transactions]
	);

	const parsedRecordAmount = Number.parseFloat(recordAmount);
	const recordAmountPreview = Number.isFinite(parsedRecordAmount) ? parsedRecordAmount : 0;

	const filteredTransactions = useMemo(() => {
		const keyword = searchTerm.trim().toLowerCase();

		return transactions.filter((tx) => {
			const transactionCategory = (tx.category || '').toLowerCase();
			const matchesSearch =
				keyword.length === 0 ||
				tx.title.toLowerCase().includes(keyword) ||
				transactionCategory.includes(keyword) ||
				(tx.description || '').toLowerCase().includes(keyword);

			const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
			const matchesTimeRange = isTransactionInRange(tx.date, timeRange);

			return matchesSearch && matchesCategory && matchesTimeRange;
		});
	}, [categoryFilter, searchTerm, timeRange, transactions]);

	const sortedFilteredTransactions = useMemo(
		() =>
			[...filteredTransactions].sort(
				(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
			),
		[filteredTransactions]
	);

	const transactionsWithBalance = useMemo(
		() =>
			sortedFilteredTransactions.map((tx) => ({
				tx,
				signedAmount: getSignedAmount(tx),
				rowBalance: toSafeNumber(tx.runningBalance),
			})),
		[sortedFilteredTransactions]
	);

	const averageTransaction = useMemo(() => {
		if (!transactions.length) return 0;

		const total = transactions.reduce((sum, tx) => sum + Math.abs(toSafeNumber(tx.amount)), 0);
		return total / transactions.length;
	}, [transactions]);

	const pieData = useMemo(
		() =>
			categoryStats
				.map((item) => ({
					name: item._id,
					value: Math.abs(toSafeNumber(item.total)),
				}))
				.filter((item) => item.value > 0),
		[categoryStats]
	);

	const monthlyData = useMemo(() => {
		const months = Array.from({ length: 6 }).map((_, offset) => {
			const date = new Date();
			date.setDate(1);
			date.setMonth(date.getMonth() - (5 - offset));

			const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
			return {
				key,
				month: format(date, 'MMM yy'),
			};
		});

		const buckets = new Map<string, { income: number; expense: number }>();
		months.forEach((month) => {
			buckets.set(month.key, { income: 0, expense: 0 });
		});

		transactions.forEach((tx) => {
			const date = new Date(tx.date);
			if (Number.isNaN(date.getTime())) return;

			const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
			const target = buckets.get(key);
			if (!target) return;

			const amount = Math.abs(toSafeNumber(tx.amount));
			if (tx.type === 'INCOME') {
				target.income += amount;
			} else {
				target.expense += amount;
			}
		});

		return months.map((month) => {
			const bucket = buckets.get(month.key) || { income: 0, expense: 0 };
			return {
				month: month.month,
				income: bucket.income,
				expense: bucket.expense,
			};
		});
	}, [transactions]);

	const activityHeatmap = useMemo(() => {
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth();
		const firstDay = new Date(year, month, 1);
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		const countByDay = new Map<number, number>();
		transactions.forEach((tx) => {
			const date = new Date(tx.date);
			if (date.getFullYear() !== year || date.getMonth() !== month) return;

			const day = date.getDate();
			countByDay.set(day, (countByDay.get(day) || 0) + 1);
		});

		const cells: Array<{ day: number | null; count: number }> = [];
		for (let index = 0; index < firstDay.getDay(); index += 1) {
			cells.push({ day: null, count: 0 });
		}

		for (let day = 1; day <= daysInMonth; day += 1) {
			cells.push({
				day,
				count: countByDay.get(day) || 0,
			});
		}

		const remainder = cells.length % 7;
		if (remainder > 0) {
			for (let index = 0; index < 7 - remainder; index += 1) {
				cells.push({ day: null, count: 0 });
			}
		}

		const maxCount = Math.max(0, ...Array.from(countByDay.values()));

		return {
			cells,
			maxCount,
			monthLabel: format(firstDay, 'MMMM yyyy'),
		};
	}, [transactions]);

	if (!vaultId) {
		return (
			<div className="rounded-xl border border-rose-400/30 bg-rose-950/30 p-5 text-sm text-rose-200">
				Invalid vault route. Please return to dashboard and open a vault again.
			</div>
		);
	}

	if (isVaultError) {
		return (
			<div className="rounded-xl border border-rose-400/30 bg-rose-950/30 p-5 text-sm text-rose-200">
				Could not load this vault.
			</div>
		);
	}

	if (isVaultLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-42 w-full bg-slate-900" />
				<Skeleton className="h-9 w-48 bg-slate-900" />
				<Skeleton className="h-96 w-full bg-slate-900" />
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-330 space-y-6 pb-8">
			<p className="text-xs text-slate-300">
				Dashboard / <span className="text-cyan-200">{vault?.title || 'Vault'}</span>
			</p>

			<VaultHeader
				title={vault?.title || 'Vault'}
				description={vault?.description}
				icon={vault?.icon}
				color={vault?.color}
				netBalance={netBalance}
				totalIn={totalIn}
				totalOut={totalOut}
			/>

			<Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<Button
							type="button"
							onClick={() => openRecordSheet('INCOME')}
							className="h-9 bg-emerald-500 text-white hover:bg-emerald-400"
						>
							<ArrowUp className="size-4" /> Cash In
						</Button>
						<Button
							type="button"
							onClick={() => openRecordSheet('EXPENSE')}
							className="h-9 bg-rose-500 text-white hover:bg-rose-400"
						>
							<ArrowDown className="size-4" /> Cash Out
						</Button>
					</div>

					<TabsList className="h-9 border border-[#355173] bg-[#1a2f4b]">
						<TabsTrigger
							value="transactions"
							className="text-xs font-semibold text-slate-200 hover:bg-[#2a4164] hover:text-white data-active:border-[#5c7ba4] data-active:bg-[#2f496f] data-active:text-white"
						>
							Transactions
						</TabsTrigger>
						<TabsTrigger
							value="analytics"
							className="text-xs font-semibold text-slate-200 hover:bg-[#2a4164] hover:text-white data-active:border-[#5c7ba4] data-active:bg-[#2f496f] data-active:text-white"
						>
							Analytics
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="transactions" className="space-y-4">
					<div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_auto_220px]">
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
							<Input
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
								placeholder="Search transactions..."
								className="h-10 border-[#2f4769] bg-[#162944] pl-9 text-slate-100 placeholder:text-slate-400"
							/>
						</div>

						<div className="flex h-10 flex-wrap items-center gap-1.5 rounded-xl border border-[#2f4769] bg-[#162944] px-2 py-1">
							{TIME_RANGE_OPTIONS.map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() => setTimeRange(option.value)}
									className={`h-8 rounded-md px-2.5 text-xs transition ${
										timeRange === option.value
											? 'bg-[#355f8d] text-slate-100'
											: 'text-slate-300 hover:bg-[#263f62] hover:text-white'
									}`}
								>
									{option.label}
								</button>
							))}
						</div>

						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="h-10 border-[#2f4769] bg-[#162944] text-slate-100">
								<SelectValue placeholder="All Categories" />
							</SelectTrigger>
							<SelectContent className="border-[#2f4769] bg-[#1b3150] text-slate-100">
								{categoryOptions.map((category) => (
									<SelectItem key={category} value={category}>
										{category === 'all' ? 'All Categories' : category}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Card className="overflow-hidden border-[#314c6f] bg-[#162944]">
						<CardHeader className="border-b border-[#314c6f] pb-3">
							<CardTitle className="text-sm text-slate-100">
								Vault Transactions
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							{isTransactionsLoading ? (
								<div className="space-y-2 p-4">
									<Skeleton className="h-11 w-full bg-slate-900" />
									<Skeleton className="h-11 w-full bg-slate-900" />
									<Skeleton className="h-11 w-full bg-slate-900" />
								</div>
							) : (
									<Table className="table-fixed">
										<TableHeader className="bg-[#1d3658]">
											<TableRow className="border-[#314c6f] hover:bg-transparent">
												<TableHead className="w-[16%] text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-200">Date & Time</TableHead>
												<TableHead className="w-[27%] text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-200">Title</TableHead>
												<TableHead className="w-[15%] text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-200">Category</TableHead>
												<TableHead className="w-[12%] text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-200">Mode</TableHead>
												<TableHead className="w-[12%] text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-200">Amount</TableHead>
												<TableHead className="w-[12%] text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-200">Balance</TableHead>
												<TableHead className="w-11 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-200"> </TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{transactionsWithBalance.length === 0 ? (
												<TableRow className="border-[#314c6f] hover:bg-transparent">
													<TableCell colSpan={7} className="h-24 text-center text-slate-300">
													No transactions found for this filter.
												</TableCell>
											</TableRow>
										) : (
											transactionsWithBalance.map(({ tx, signedAmount, rowBalance }) => {
												const paymentMode = getPaymentModeFromDescription(tx.description);
												const notes = getNotesFromDescription(tx.description);

												return (
													<TableRow key={tx.id} className="group/tx border-[#314c6f] hover:bg-sky-500/10">
														<TableCell className="text-slate-300">
															<p>{format(new Date(tx.date), 'MMM d, yy')}</p>
															<p className="text-xs text-slate-400">{format(new Date(tx.date), 'hh:mm a')}</p>
														</TableCell>
														<TableCell className="text-slate-100">
															<p className="font-medium">{tx.title}</p>
															<p className="line-clamp-1 text-xs text-slate-400">{notes || '-'}</p>
														</TableCell>
														<TableCell>
															<Badge className="max-w-full border-[#466185] bg-[#243c5b] text-slate-100">
																{tx.category}
															</Badge>
														</TableCell>
														<TableCell>
															<Badge
																className={
																	paymentMode === 'BANK'
																		? 'border-cyan-300/20 bg-cyan-500/15 text-cyan-200'
																		: 'border-amber-300/20 bg-amber-500/15 text-amber-200'
																}
															>
																{paymentMode === 'BANK' ? (
																	<>
																		<Landmark className="mr-1 size-3" /> Bank
																	</>
																) : (
																	<>
																		<Wallet className="mr-1 size-3" /> Cash
																	</>
																)}
															</Badge>
														</TableCell>
														<TableCell className="text-right font-semibold">
															<span className={signedAmount >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
																{signedAmount >= 0 ? '+' : '-'}${formatAmount(Math.abs(signedAmount))}
															</span>
														</TableCell>
														<TableCell className="text-right font-semibold">
															<span className={rowBalance >= 0 ? 'text-cyan-300' : 'text-rose-300'}>
																{rowBalance >= 0 ? '$' : '-$'}{formatAmount(Math.abs(rowBalance))}
															</span>
														</TableCell>
														<TableCell className="text-right">
															<button
																type="button"
																onClick={() => requestDeleteTransaction(tx)}
																disabled={deletingTransactionId === tx.id}
																className="pointer-events-none ml-auto inline-flex size-8 items-center justify-center rounded-md border border-rose-300/45 bg-rose-500/15 text-rose-100 opacity-0 transition-all hover:bg-rose-500/25 group-hover/tx:pointer-events-auto group-hover/tx:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 disabled:pointer-events-none disabled:opacity-65"
																aria-label={`Delete ${tx.title}`}
															>
																{deletingTransactionId === tx.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
															</button>
														</TableCell>
													</TableRow>
												);
											})
										)}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						<Card className="border-[#314c6f] bg-[#1a3352]">
							<CardHeader className="pb-1">
								<CardTitle className="text-xs text-slate-300">Total Income</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-semibold text-emerald-300">+${formatAmount(totalIn)}</p>
							</CardContent>
						</Card>

						<Card className="border-[#314c6f] bg-[#1a3352]">
							<CardHeader className="pb-1">
								<CardTitle className="text-xs text-slate-300">Total Expense</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-semibold text-rose-300">-${formatAmount(totalOut)}</p>
							</CardContent>
						</Card>

						<Card className="border-[#314c6f] bg-[#1a3352]">
							<CardHeader className="pb-1">
								<CardTitle className="text-xs text-slate-300">Net Balance</CardTitle>
							</CardHeader>
							<CardContent>
								<p className={`text-2xl font-semibold ${netBalance >= 0 ? 'text-cyan-300' : 'text-rose-300'}`}>
									{netBalance >= 0 ? '+' : '-'}${formatAmount(Math.abs(netBalance))}
								</p>
							</CardContent>
						</Card>

						<Card className="border-[#314c6f] bg-[#1a3352]">
							<CardHeader className="pb-1">
								<CardTitle className="text-xs text-slate-300">Avg Transaction</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-semibold text-cyan-300">${formatAmount(averageTransaction)}</p>
							</CardContent>
						</Card>
					</section>

					<Card className="border-[#314c6f] bg-[#162944]">
						<CardHeader className="pb-2">
							<CardTitle className="text-base text-white">Activity Heatmap</CardTitle>
							<p className="text-xs text-slate-300">{activityHeatmap.monthLabel} - transaction density by day</p>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="grid grid-cols-7 gap-1.5">
								{activityHeatmap.cells.map((cell, index) => (
									<div key={`heat-cell-${index}`} className="space-y-1">
										<HeatmapCell count={cell.count} maxCount={activityHeatmap.maxCount} />
										<p className="text-center text-[10px] text-slate-400">{cell.day || ''}</p>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<section className="grid gap-4 lg:grid-cols-2">
						<Card className="border-[#314c6f] bg-[#162944]">
							<CardHeader className="pb-2">
								<CardTitle className="text-base text-white">Expense Breakdown</CardTitle>
								<p className="text-xs text-slate-300">Where your money goes</p>
							</CardHeader>
							<CardContent className="h-72">
								{pieData.length === 0 ? (
									<p className="pt-20 text-center text-sm text-slate-300">No expense data for chart.</p>
								) : (
									<div className="flex h-full items-center gap-4">
										<div className="h-full flex-1">
											<ResponsiveContainer width="100%" height="100%">
												<PieChart>
													<Pie
														data={pieData}
														dataKey="value"
														nameKey="name"
														innerRadius={58}
														outerRadius={88}
														paddingAngle={2}
													>
														{pieData.map((entry, index) => (
															<Cell key={`pie-cell-${entry.name}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
														))}
													</Pie>
													<Tooltip
														formatter={(value: number) => [`$${formatAmount(value)}`, 'Spend']}
														contentStyle={{
															background: '#1a3352',
															border: '1px solid rgba(148, 163, 184, 0.35)',
															borderRadius: 8,
														}}
													/>
												</PieChart>
											</ResponsiveContainer>
										</div>

										<div className="w-34 space-y-1 text-xs">
											{pieData.slice(0, 6).map((item, index) => (
												<div key={`legend-${item.name}`} className="flex items-center justify-between gap-2 text-slate-100">
													<span className="inline-flex items-center gap-1.5 truncate">
														<span
															className="size-2 rounded-full"
															style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
														/>
														<span className="truncate">{item.name}</span>
													</span>
													<span>${formatAmount(item.value)}</span>
												</div>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						<Card className="border-[#314c6f] bg-[#162944]">
							<CardHeader className="pb-2">
								<CardTitle className="inline-flex items-center gap-2 text-base text-white">
									<BarChart3 className="size-4 text-cyan-300" />
									Monthly Comparison
								</CardTitle>
								<p className="text-xs text-slate-300">Income vs Expenses - last 6 months</p>
							</CardHeader>
							<CardContent className="h-72">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={monthlyData} barGap={8}>
										<CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.22)" />
										<XAxis dataKey="month" stroke="#cbd5e1" tick={{ fontSize: 11 }} />
										<YAxis stroke="#cbd5e1" tick={{ fontSize: 11 }} />
										<Tooltip
											formatter={(value: number) => `$${formatAmount(value)}`}
											contentStyle={{
												background: '#1a3352',
												border: '1px solid rgba(148, 163, 184, 0.35)',
												borderRadius: 8,
											}}
										/>
										<Legend iconType="circle" />
										<Bar dataKey="income" fill="#22d3aa" radius={[6, 6, 0, 0]} />
										<Bar dataKey="expense" fill="#fb7185" radius={[6, 6, 0, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</section>
				</TabsContent>
			</Tabs>

			<Sheet
				open={isRecordSheetOpen}
				onOpenChange={(open) => {
					if (!createTransactionMutation.isPending) {
						setIsRecordSheetOpen(open);
					}
					if (!open) {
						setRecordError(null);
					}
				}}
			>
				<SheetContent
					side="right"
					className="w-full border-white/10 bg-[#0f1a30] p-0 text-slate-100 sm:max-w-90"
				>
					<SheetHeader className="border-b border-white/10 px-4 py-3">
						<SheetTitle className="text-base text-white">
							{recordType === 'INCOME' ? 'Record Income' : 'Record Expense'}
						</SheetTitle>
						<SheetDescription className="text-xs text-slate-400">
							Add a new transaction
						</SheetDescription>
					</SheetHeader>

					<div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
						<div className="space-y-2">
							<Label className="text-xs text-slate-400">Amount</Label>
							<div className="rounded-xl border border-cyan-400/25 bg-cyan-500/8 px-3 py-2">
								<p className="text-[2rem] font-semibold tracking-tight text-cyan-300 [font-family:var(--font-geist-mono)]">
									${formatAmount(Math.abs(recordAmountPreview))}
								</p>
							</div>
							<Input
								type="number"
								step="0.01"
								min="0"
								value={recordAmount}
								onChange={(event) => setRecordAmount(event.target.value)}
								placeholder="0.00"
								className="h-10 border-white/10 bg-[#1a2842] text-slate-100"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-xs text-slate-400">Transaction Type</Label>
							<div className="grid grid-cols-2 rounded-lg border border-white/10 bg-[#1a2842] p-1">
								<button
									type="button"
									onClick={() => setRecordType('INCOME')}
									className={`inline-flex h-8 items-center justify-center rounded-md text-xs font-medium ${
										recordType === 'INCOME'
											? 'bg-emerald-500 text-white'
											: 'text-slate-400 hover:bg-white/5'
									}`}
								>
									<ArrowUp className="mr-1 size-3.5" /> Income
								</button>
								<button
									type="button"
									onClick={() => setRecordType('EXPENSE')}
									className={`inline-flex h-8 items-center justify-center rounded-md text-xs font-medium ${
										recordType === 'EXPENSE'
											? 'bg-rose-500 text-white'
											: 'text-slate-400 hover:bg-white/5'
									}`}
								>
									<ArrowDown className="mr-1 size-3.5" /> Expense
								</button>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-xs text-slate-400">Title</Label>
							<Input
								value={recordTitle}
								onChange={(event) => setRecordTitle(event.target.value)}
								placeholder="e.g. Monthly salary, Grocery run"
								className="h-10 border-white/10 bg-[#1a2842] text-slate-100"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-xs text-slate-400">Category</Label>
							<Select value={recordCategory} onValueChange={setRecordCategory}>
								<SelectTrigger className="h-10 border-white/10 bg-[#1a2842] text-slate-100">
									<SelectValue placeholder="Select a category" />
								</SelectTrigger>
								<SelectContent className="border-white/10 bg-[#111c32] text-slate-100">
									{recordCategoryOptions.map((category) => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label className="text-xs text-slate-400">Payment Mode</Label>
							<div className="grid grid-cols-2 gap-2">
								<button
									type="button"
									onClick={() => setRecordPaymentMode('BANK')}
									className={`inline-flex h-9 items-center justify-center rounded-lg border text-xs font-medium ${
										recordPaymentMode === 'BANK'
											? 'border-cyan-400/35 bg-cyan-500/15 text-cyan-200'
											: 'border-white/10 bg-[#1a2842] text-slate-400 hover:bg-white/5'
									}`}
								>
									<Landmark className="mr-1.5 size-3.5" /> Bank
								</button>
								<button
									type="button"
									onClick={() => setRecordPaymentMode('CASH')}
									className={`inline-flex h-9 items-center justify-center rounded-lg border text-xs font-medium ${
										recordPaymentMode === 'CASH'
											? 'border-amber-400/35 bg-amber-500/15 text-amber-200'
											: 'border-white/10 bg-[#1a2842] text-slate-400 hover:bg-white/5'
									}`}
								>
									<Wallet className="mr-1.5 size-3.5" /> Cash
								</button>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-xs text-slate-400">Date</Label>
							<Input
								type="date"
								value={recordDate}
								onChange={(event) => setRecordDate(event.target.value)}
								className="h-10 border-white/10 bg-[#1a2842] text-slate-100"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-xs text-slate-400">Notes (Optional)</Label>
							<Textarea
								value={recordNotes}
								onChange={(event) => setRecordNotes(event.target.value)}
								placeholder="Add any extra notes"
								className="min-h-24 border-white/10 bg-[#1a2842] text-slate-100 placeholder:text-slate-500"
							/>
						</div>

						{recordError ? (
							<div className="rounded-lg border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
								{recordError}
							</div>
						) : null}
					</div>

					<SheetFooter className="border-t border-white/10 p-4">
						<Button
							type="button"
							onClick={submitRecordTransaction}
							disabled={createTransactionMutation.isPending}
							className={`w-full ${
								recordType === 'INCOME'
									? 'bg-emerald-500 text-white hover:bg-emerald-400'
									: 'bg-rose-500 text-white hover:bg-rose-400'
							}`}
						>
							{createTransactionMutation.isPending ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" /> Saving...
								</>
							) : recordType === 'INCOME' ? (
								'Record Income'
							) : (
								'Record Expense'
							)}
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>

			<AlertDialog
				open={Boolean(transactionToDelete)}
				onOpenChange={(open) => {
					if (!open && !deleteTransactionMutation.isPending) {
						setTransactionToDelete(null);
					}
				}}
			>
				<AlertDialogContent className="border-white/10 bg-[#0f1a30] text-slate-100">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-slate-50">Delete transaction?</AlertDialogTitle>
						<AlertDialogDescription className="text-slate-400">
							This action cannot be undone. This will permanently remove
							{transactionToDelete ? ` \"${transactionToDelete.title}\"` : ' this transaction'}.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							disabled={deleteTransactionMutation.isPending}
							className="border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(event) => {
								event.preventDefault();
								confirmDeleteTransaction();
							}}
							disabled={deleteTransactionMutation.isPending}
							className="bg-rose-500 text-white hover:bg-rose-400"
						>
							{deleteTransactionMutation.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
