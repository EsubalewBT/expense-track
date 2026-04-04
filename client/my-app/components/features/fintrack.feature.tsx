'use client';

import {
  Briefcase,
  Home,
  PiggyBank,
  TrendingUp,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FintrackIcon = 'wallet' | 'briefcase' | 'zap' | 'home' | 'piggy-bank' | 'trending-up';

interface FintrackCardProps {
  title: string;
  description?: string;
  icon?: FintrackIcon;
  color?: string;
  balance: number;
  income: number;
  expense: number;
  transactionsCount: number;
  sparkline?: number[];
  onClick: () => void;
}

const ICON_MAP: Record<FintrackIcon, LucideIcon> = {
  wallet: Wallet,
  briefcase: Briefcase,
  zap: Zap,
  home: Home,
  'piggy-bank': PiggyBank,
  'trending-up': TrendingUp,
};

const COLOR_THEME = {
  teal: {
    border: 'border-[#2a3f58] hover:border-[#11d8c4]/45',
    halo: 'bg-[#11d8c4]/22',
    iconShell: 'border-[#2b4c5b] bg-[#0f2f3d]/70',
    iconText: 'text-[#34e7d4]',
    balanceText: 'text-[#1be4cf]',
    chartStroke: '#11d8c4',
    chartFillFrom: '#11d8c4',
    incomeText: 'text-[#29e1c3]',
  },
  violet: {
    border: 'border-[#2f365b] hover:border-[#6c4de6]/45',
    halo: 'bg-[#6c4de6]/24',
    iconShell: 'border-[#433e69] bg-[#252345]/70',
    iconText: 'text-[#9b86ff]',
    balanceText: 'text-[#8f7ef8]',
    chartStroke: '#7e68ff',
    chartFillFrom: '#7e68ff',
    incomeText: 'text-[#8f7ef8]',
  },
  amber: {
    border: 'border-[#3f3b3a] hover:border-[#b7831a]/45',
    halo: 'bg-[#e39b17]/22',
    iconShell: 'border-[#5b4f32] bg-[#3a3118]/70',
    iconText: 'text-[#ffca58]',
    balanceText: 'text-[#ffbe45]',
    chartStroke: '#f2a50f',
    chartFillFrom: '#f2a50f',
    incomeText: 'text-[#ffca58]',
  },
  rose: {
    border: 'border-[#473746] hover:border-[#a9375c]/45',
    halo: 'bg-[#e14f88]/20',
    iconShell: 'border-[#604155] bg-[#3a1f2f]/70',
    iconText: 'text-[#ff84b0]',
    balanceText: 'text-[#ff78a8]',
    chartStroke: '#e14f88',
    chartFillFrom: '#e14f88',
    incomeText: 'text-[#ff88b2]',
  },
  blue: {
    border: 'border-[#31425f] hover:border-[#3167d8]/45',
    halo: 'bg-[#3f84ff]/20',
    iconShell: 'border-[#3f4f70] bg-[#1d2b48]/70',
    iconText: 'text-[#75a4ff]',
    balanceText: 'text-[#7ab0ff]',
    chartStroke: '#4d89ff',
    chartFillFrom: '#4d89ff',
    incomeText: 'text-[#73a8ff]',
  },
  emerald: {
    border: 'border-[#27413f] hover:border-[#0c8474]/45',
    halo: 'bg-[#10b39c]/20',
    iconShell: 'border-[#2e544f] bg-[#1a342f]/70',
    iconText: 'text-[#39d1be]',
    balanceText: 'text-[#37cfba]',
    chartStroke: '#19c0a9',
    chartFillFrom: '#19c0a9',
    incomeText: 'text-[#38cfbb]',
  },
} as const;

type SparklinePath = {
  line: string;
  area: string;
};

function buildSparklinePath(values: number[], width = 208, height = 44, padding = 4): SparklinePath {
  if (values.length === 0) {
    const y = height - padding;
    return {
      line: `M${padding} ${y} L${width - padding} ${y}`,
      area: `M${padding} ${y} L${width - padding} ${y} L${width - padding} ${y} L${padding} ${y} Z`,
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

  const points = values.map((value, index) => {
    const x = padding + step * index;
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
  const area = `${line} L${width - padding} ${height - padding} L${padding} ${height - padding} Z`;

  return { line, area };
}

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

export default function FintrackCard({
  title,
  description,
  icon,
  color,
  balance,
  income,
  expense,
  transactionsCount,
  sparkline = [],
  onClick,
}: FintrackCardProps) {
  const iconValue = icon && ICON_MAP[icon] ? icon : 'wallet';
  const Icon = ICON_MAP[iconValue];
  const theme = COLOR_THEME[color as keyof typeof COLOR_THEME] || COLOR_THEME.teal;
  const cardSummary = description?.trim() || 'Day-to-day personal finances';
  const safeIncome = Math.abs(income);
  const safeExpense = Math.abs(expense);
  const netAmount = safeIncome - safeExpense;
  const netTone = netAmount >= 0 ? theme.incomeText : 'text-rose-400';
  const sparklineValues = sparkline.length > 1 ? sparkline : [0, 0, 0, 0, 0, 0, 0, 0];
  const { line: sparklinePath, area: sparklineArea } = buildSparklinePath(sparklineValues);
  const gradientId = `spark-${title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'ledger'}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-[18px] border bg-linear-to-b from-[#151f36] to-[#10182d] p-4 text-left shadow-[0_22px_50px_-34px_rgba(2,6,23,0.95)] transition-all duration-300 hover:-translate-y-0.5 sm:p-5',
        theme.border
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-16 -top-14 h-44 w-44 rounded-full opacity-35 blur-3xl transition-opacity duration-300 group-hover:opacity-60',
          theme.halo
        )}
      />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', theme.iconShell, theme.iconText)}>
            <Icon className="size-4" />
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {transactionsCount} tx
          </span>
        </div>

        <p className="line-clamp-1 text-[10px] text-slate-500">{cardSummary}</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">{title}</h3>

        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Current Balance</p>
        <p className={cn('mt-1 text-[1.95rem] font-semibold leading-none tracking-tight', theme.balanceText)}>
          {formatSignedAmount(balance)}
        </p>

        <div className="mt-4 h-12 w-full">
          <svg viewBox="0 0 208 44" className="h-full w-full">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.chartFillFrom} stopOpacity="0.35" />
                <stop offset="100%" stopColor={theme.chartFillFrom} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={sparklineArea} fill={`url(#${gradientId})`} />
            <path d={sparklinePath} fill="none" stroke={theme.chartStroke} strokeWidth="1.9" strokeLinecap="round" />
          </svg>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>Last 8 weeks</span>
            <span className={cn('font-semibold', netTone)}>{formatSignedAmount(netAmount)}</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 border-t border-white/10 pt-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">Cash In</p>
            <p className={cn('mt-1 text-xs font-semibold', theme.incomeText)}>+${formatAmount(Math.abs(income))}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">Cash Out</p>
            <p className="mt-1 text-xs font-semibold text-rose-400">-${formatAmount(Math.abs(expense))}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">Transactions</p>
            <p className="mt-1 text-xs font-semibold text-slate-300">{transactionsCount}</p>
          </div>
        </div>
      </div>
    </button>
  );
}