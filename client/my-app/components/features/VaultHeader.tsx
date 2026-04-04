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

type VaultHeaderProps = {
  title: string;
  description?: string;
  icon?: FintrackIcon;
  color?: string;
  netBalance: number;
  totalIn: number;
  totalOut: number;
};

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
    shell: 'border-cyan-400/35 bg-cyan-400/10 text-cyan-300',
    accent: 'text-cyan-300',
  },
  violet: {
    shell: 'border-violet-400/35 bg-violet-400/10 text-violet-300',
    accent: 'text-violet-300',
  },
  amber: {
    shell: 'border-amber-400/35 bg-amber-400/10 text-amber-300',
    accent: 'text-amber-300',
  },
  rose: {
    shell: 'border-rose-400/35 bg-rose-400/10 text-rose-300',
    accent: 'text-rose-300',
  },
  blue: {
    shell: 'border-blue-400/35 bg-blue-400/10 text-blue-300',
    accent: 'text-blue-300',
  },
  emerald: {
    shell: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-300',
    accent: 'text-emerald-300',
  },
} as const;

function formatCurrency(value: number, withSign = false) {
  const amount = Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (!withSign) {
    return `$${amount}`;
  }

  const sign = value >= 0 ? '+' : '-';
  return `${sign}$${amount}`;
}

export default function VaultHeader({
  title,
  description,
  icon,
  color,
  netBalance,
  totalIn,
  totalOut,
}: VaultHeaderProps) {
  const iconName = icon && ICON_MAP[icon] ? icon : 'wallet';
  const Icon = ICON_MAP[iconName];
  const theme = COLOR_THEME[color as keyof typeof COLOR_THEME] || COLOR_THEME.teal;

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-[#345174] bg-linear-to-r from-[#172c49] via-[#1d3557] to-[#1a4255] px-5 py-4 shadow-[0_24px_60px_-45px_rgba(20,184,166,0.6)] sm:px-6 sm:py-5">
      <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-cyan-400/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-52 w-52 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl border', theme.shell)}>
              <Icon className="size-4" />
          </div>
          <div>
              <p className="line-clamp-1 text-[10px] text-slate-300">{description?.trim() || 'Personal vault ledger'}</p>
            <h1 className="text-[1.7rem] font-semibold leading-none tracking-tight text-white">{title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4 md:border-t-0 md:pt-0">
          <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-300">Net Balance</p>
            <p className={cn('mt-1 text-[1.05rem] font-semibold [font-family:var(--font-geist-mono)]', netBalance >= 0 ? 'text-[#21e4c5]' : 'text-rose-400')}>
              {formatCurrency(netBalance, true)}
            </p>
          </div>
          <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-300">Total In</p>
            <p className={cn('mt-1 text-[0.98rem] font-semibold [font-family:var(--font-geist-mono)]', theme.accent)}>
              +{formatCurrency(totalIn)}
            </p>
          </div>
          <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-300">Total Out</p>
            <p className="mt-1 text-[0.98rem] font-semibold text-rose-400 [font-family:var(--font-geist-mono)]">
              -{formatCurrency(totalOut)}
            </p>
          </div>
        </div>
      </div>

        <div className="relative mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-slate-300">
        <TrendingUp className="size-3.5 text-cyan-300" />
        Vault Overview
      </div>
    </section>
  );
}
