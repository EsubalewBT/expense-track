'use client';

import { Layers, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FintrackCardProps {
  title: string;
  balance: number;
  income: number;
  expense: number;
  transactionsCount: number;
  onClick: () => void;
}

export default function FintrackCard({ title, balance, income, expense, transactionsCount, onClick }: FintrackCardProps) {
  return (
    <div 
      onClick={onClick}
      className="group relative cursor-pointer rounded-3xl border border-slate-800 bg-slate-900/40 p-6 transition-all hover:border-teal-500/50 hover:bg-slate-900/60"
    >
      {/* Icon and More Menu */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
          <Layers size={22} />
        </div>
        <button className="text-slate-600 hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Title and Description */}
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Source of Funds</p>
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
      </div>

      {/* Main Balance */}
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Current Balance</p>
        <p className="text-3xl font-black text-emerald-400 tracking-tighter">
          ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Mini Chart Placeholder (Sparkline) */}
      <div className="h-12 w-full mb-6 opacity-30 group-hover:opacity-100 transition-opacity">
        <svg viewBox="0 0 100 20" className="w-full h-full stroke-emerald-500 stroke-[1.5] fill-none">
          <path d="M0,15 Q10,5 20,12 T40,8 T60,15 T80,5 T100,10" />
        </svg>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase text-slate-500 font-bold">Cash In</span>
          <span className="text-xs font-semibold text-emerald-500/80">+${income.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase text-slate-500 font-bold">Cash Out</span>
          <span className="text-xs font-semibold text-rose-500/80">-${expense.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase text-slate-500 font-bold">Total Tx</span>
          <span className="text-xs font-semibold text-slate-300">{transactionsCount}</span>
        </div>
      </div>
    </div>
  );
}