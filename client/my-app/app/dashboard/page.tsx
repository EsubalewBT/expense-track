'use client';

import { useState } from 'react';
import { Plus, TrendingUp, Layers } from 'lucide-react';
import { TransactionApi as TransactionStatsApi } from '@/lib/api/expense';
import { FintrackApi } from '@/lib/api/fintrack';
import { TransactionApi as VaultTransactionApi, type VaultTransaction } from '@/lib/api/transaction';
import FintrackCard from '@/components/features/fintrack.feature';
import { CreateFintrackModal } from '@/components/features/Fintrack.modal';
import { useRouter } from 'next/navigation';
import { useFintrackStore } from '@/store/useFintrack';

type StatRecord = {
  type?: string;
  total?: unknown;
  totalAmount?: unknown;
  amount?: unknown;
  _sum?: {
    amount?: unknown;
  };
};

function formatAmount(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatSignedAmount(value: number) {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}$${formatAmount(Math.abs(value))}`;
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

function extractStatTotal(stat: StatRecord | undefined): number {
  if (!stat) return 0;

  const candidate = stat.total ?? stat.totalAmount ?? stat.amount ?? stat._sum?.amount;
  return toSafeNumber(candidate);
}

const SPARKLINE_POINTS = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function buildSparklineSeries(transactions: VaultTransaction[]): number[] {
  if (!transactions.length) {
    return Array.from({ length: SPARKLINE_POINTS }, () => 0);
  }

  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (SPARKLINE_POINTS - 1) * 7);

  const buckets = Array.from({ length: SPARKLINE_POINTS }, () => 0);

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    if (Number.isNaN(txDate.getTime())) return;
    if (txDate < start) return;

    const diff = txDate.getTime() - start.getTime();
    const index = Math.min(SPARKLINE_POINTS - 1, Math.floor(diff / WEEK_MS));
    const amount = Math.abs(toSafeNumber(tx.amount));
    buckets[index] += tx.type === 'INCOME' ? amount : -amount;
  });

  return buckets;
}

export default function DashboardLobby() {
  const router = useRouter();
  const { setActiveFintrack } = useFintrackStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: fintracks = [], isLoading } = FintrackApi.GetAll.useQuery();
  const { data: globalStats } = TransactionStatsApi.GetGlobalStats.useQuery();

  const stats = (globalStats || []) as StatRecord[];
  const incomeFromStats = extractStatTotal(
    stats.find((item) => String(item.type || '').toUpperCase() === 'INCOME')
  );
  const expenseFromStats = extractStatTotal(
    stats.find((item) => String(item.type || '').toUpperCase() === 'EXPENSE')
  );
  const incomeFromBooks = fintracks.reduce((sum, fintrack) => sum + toSafeNumber(fintrack.income), 0);
  const expenseFromBooks = fintracks.reduce((sum, fintrack) => sum + toSafeNumber(fintrack.expense), 0);

  const totalIncome = incomeFromStats > 0 ? incomeFromStats : incomeFromBooks;
  const totalExpense = expenseFromStats > 0 ? expenseFromStats : expenseFromBooks;
  const netWorth = totalIncome - totalExpense;
  const totalTransactions = fintracks.reduce((sum, fintrack) => sum + (fintrack.transactionsCount || 0), 0);
  const booksCount = fintracks.length;
  const netTone = netWorth >= 0 ? 'text-[#22e8c8]' : 'text-rose-400';
  const netBadge = netWorth >= 0 ? 'Net positive' : 'Needs attention';
  const netBadgeStyle = netWorth >= 0
    ? 'border-[#22e8c8]/30 bg-[#22e8c8]/10 text-[#22e8c8]'
    : 'border-rose-400/30 bg-rose-400/10 text-rose-300';
  const vaultIds = fintracks.map((book) => book.id);
  const recentTransactionQueries = VaultTransactionApi.GetRecentByVault.useQueries(vaultIds, 80);
  const sparklineByVault = new Map<string, number[]>();

  vaultIds.forEach((vaultId, index) => {
    const transactions = recentTransactionQueries[index]?.data?.results || [];
    sparklineByVault.set(vaultId, buildSparklineSeries(transactions));
  });

  if (isLoading) {
    return (
      <div className="w-full space-y-6 pb-8">
        <div className="h-56 animate-pulse rounded-[26px] border border-[#273953] bg-linear-to-r from-[#131d34] to-[#173749]/65" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`dashboard-stat-skeleton-${index}`} className="h-24 animate-pulse rounded-[18px] border border-[#273953] bg-[#141f37]/70" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`dashboard-card-skeleton-${index}`} className="h-80 animate-pulse rounded-[18px] border border-[#273953] bg-[#141f37]/70" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-8 pb-8 lg:pb-12">
        <section className="relative overflow-hidden rounded-[26px] border border-[#2b3e59] bg-linear-to-r from-[#0f1b33] via-[#162640] to-[#142e44] px-6 py-6 shadow-[0_26px_70px_-45px_rgba(14,184,166,0.65)] sm:px-7">
          <div className="pointer-events-none absolute -left-20 -top-24 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-60 w-60 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10">
                  <Layers className="text-cyan-300" size={22} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/70">ExpenseFlow</p>
                  <h1 className="text-2xl font-semibold tracking-tight text-white [font-family:var(--font-display)] sm:text-3xl">
                    Portfolio overview
                  </h1>
                  <p className="text-xs text-slate-400 sm:text-sm">
                    Your books, cash flow, and balance health in one view.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-300 px-4 text-xs font-semibold tracking-wide text-slate-950 transition-colors hover:bg-cyan-200 md:w-auto"
              >
                <Plus size={16} /> Create New Book
              </button>
            </header>

            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-500">
                      <TrendingUp size={13} className="text-cyan-300" />
                      Total Net Worth
                    </div>
                    <h2
                      className={`text-[2.2rem] leading-none font-semibold tracking-tight [font-family:var(--font-geist-mono)] sm:text-[2.7rem] ${netTone}`}
                    >
                      {formatSignedAmount(netWorth)}
                    </h2>
                    <p className="mt-2 text-xs text-slate-400">
                      Across {booksCount} {booksCount === 1 ? 'book' : 'books'}
                    </p>
                  </div>

                  <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${netBadgeStyle}`}>
                    {netBadge}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">Total Income</p>
                  <p className="mt-2 text-lg font-semibold text-[#2fe6c6]">+${formatAmount(totalIncome)}</p>
                  <p className="text-xs text-slate-400">Cash in across all books</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">Total Expenses</p>
                  <p className="mt-2 text-lg font-semibold text-rose-400">-${formatAmount(totalExpense)}</p>
                  <p className="text-xs text-slate-400">Cash out across all books</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">Active Books</p>
                  <p className="mt-2 text-lg font-semibold text-white">{booksCount}</p>
                  <p className="text-xs text-slate-400">Ledgers in rotation</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">Transactions</p>
                  <p className="mt-2 text-lg font-semibold text-white">{totalTransactions}</p>
                  <p className="text-xs text-slate-400">All recorded activity</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-sm font-semibold tracking-[0.18em] text-slate-200">Your Books</h3>
              <p className="text-xs text-slate-500">Real-time snapshots for every ledger you manage.</p>
            </div>
            <span className="rounded-full border border-[#2e405d] bg-[#111c33] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {booksCount} {booksCount === 1 ? 'book' : 'books'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {fintracks.map((book) => (
              <FintrackCard
                key={book.id}
                title={book.title}
                description={book.description}
                icon={book.icon}
                color={book.color}
                balance={book.balance || 0}
                income={book.income || 0}
                expense={book.expense || 0}
                transactionsCount={book.transactionsCount || 0}
                sparkline={sparklineByVault.get(book.id) || []}
                onClick={() => {
                  setActiveFintrack(book.id);
                  router.push(`/dashboard/vault/${book.id}`);
                }}
              />
            ))}

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="group flex min-h-74 flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-[#2d405d] bg-[#101a2f]/55 text-slate-500 transition-all duration-300 hover:border-cyan-400/35 hover:bg-[#14223d] hover:text-cyan-200"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#364b67] bg-[#1a2c4a] text-cyan-200 transition-colors group-hover:border-cyan-300/70 group-hover:bg-cyan-300/14">
                <Plus size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.16em]">New Cashbook</span>
            </button>
          </div>
        </section>
      </div>

      <CreateFintrackModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </>
  );
}