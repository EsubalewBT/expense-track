'use client';

import { useState } from 'react';
import { Plus, TrendingUp, Layers } from 'lucide-react';
import { TransactionApi } from '@/lib/api/expense';
import { FintrackApi } from '@/lib/api/fintrack';
import FintrackCard from '@/components/features/fintrack.feature';
import { CreateFintrackModal } from '@/components/features/Fintrack.modal';
import { useRouter } from 'next/navigation';
import { useFintrackStore } from '@/store/useFintrack';

export default function DashboardLobby() {
  const router = useRouter();
  const { setActiveFintrack } = useFintrackStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // 1. Fetch data from your real backend
  const { data: fintracks = [], isLoading } = FintrackApi.GetAll.useQuery();
  const { data: globalStats } = TransactionApi.GetGlobalStats.useQuery();

  // Calculate totals for the Hero Card
  const totalIncome = globalStats?.find((s: { type: 'INCOME' | 'EXPENSE'; total: number }) => s.type === 'INCOME')?.total || 0;
  const totalExpense = globalStats?.find((s: { type: 'INCOME' | 'EXPENSE'; total: number }) => s.type === 'EXPENSE')?.total || 0;
  const netWorth = totalIncome - totalExpense;

  if (isLoading) return <div className="p-10 text-white animate-pulse">Initializing Dashboard...</div>;

  return (
    <>
    <div className="w-full space-y-8 pb-8 lg:space-y-10 lg:pb-12">
      
      {/* 1. FIGMA HEADER */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20">
             <Layers className="text-teal-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter sm:text-3xl">Expense<span className="text-teal-400">Flow</span></h1>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Multi-Ledger Dashboard</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200 md:w-auto"
        >
          <Plus size={18} /> Create New Book
        </button>
      </div>

      {/* 2. FIGMA HERO CARD (The Glow Card) */}
      <div className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-7 lg:rounded-[32px] lg:p-8">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 h-64 w-64 bg-teal-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <TrendingUp size={16} className="text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Total Net Balance · All Books</span>
            </div>
            <h2 className={`text-4xl font-black tracking-tighter sm:text-5xl lg:text-6xl ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              +${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="grid w-full grid-cols-2 gap-5 border-t border-slate-800 pt-6 sm:grid-cols-4 md:w-auto md:border-t-0 md:pt-0">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total Income</p>
              <p className="text-lg font-bold text-emerald-400">+${totalIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total Expenses</p>
              <p className="text-lg font-bold text-rose-400">-${totalExpense.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Active Books</p>
              <p className="text-lg font-bold text-white">{fintracks?.length || 0}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Transactions</p>
              <p className="text-lg font-bold text-white">
                {fintracks.reduce((sum, fintrack) => sum + (fintrack.transactionsCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FIGMA GRID SECTION */}
      <div>
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Your Books</h3>
          <span className="bg-slate-900 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-800">
            {fintracks?.length || 0} BOOKS TOTAL
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {fintracks?.map((book) => (
            <FintrackCard 
              key={book.id}
              title={book.title}
              balance={book.balance || 0}
              income={book.income || 0}
              expense={book.expense || 0}
              transactionsCount={book.transactionsCount || 0}
              onClick={() => {
                setActiveFintrack(book.id);
                router.push(`/dashboard/vault/${book.id}`);
              }}
            />
          ))}

          {/* Add New Book Trigger */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-[28px] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-4 py-14 text-slate-600 transition-all hover:border-teal-500/50 hover:bg-teal-500/5 hover:text-teal-400"
          >
            <div className="p-4 bg-slate-900 rounded-2xl">
              <Plus size={32} />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">New Cashbook</span>
          </button>
        </div>
      </div>

    </div>
    <CreateFintrackModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </>
  );
}