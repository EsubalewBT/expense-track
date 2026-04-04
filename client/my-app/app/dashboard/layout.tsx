'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { ArrowLeft, ChevronDown, LogOut, UserCircle2 } from 'lucide-react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DashboardLayoutProps = {
	children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const router = useRouter();
	const pathname = usePathname();
	const showBackButton = pathname !== '/dashboard';

	useEffect(() => {
		const token = window.localStorage.getItem('accessToken');
		if (!token) {
			router.replace('/auth/sign-in');
		}
	}, [router]);

	const handleLogout = () => {
		window.localStorage.removeItem('accessToken');
		window.localStorage.removeItem('refreshToken');
		window.localStorage.removeItem('user');
		router.replace('/auth/sign-in');
	};

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,#1e3a8a20_0%,transparent_35%),radial-gradient(circle_at_95%_0%,#0f766e22_0%,transparent_30%),linear-gradient(180deg,#070b14_0%,#0b1220_45%,#0f172a_100%)] text-slate-100">
			<header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/65 px-4 py-3 backdrop-blur">
				<div className="flex w-full flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-3">
						{showBackButton ? (
							<Link
								href="/dashboard"
								className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
								aria-label="Back to dashboard"
							>
								<ArrowLeft size={16} />
							</Link>
						) : null}
						<div>
							<p className="text-xs tracking-[0.2em] text-cyan-200/80">EXPENSEFLOW</p>
							<p className="text-sm font-medium text-white">Dashboard</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
								>
									<span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
										<UserCircle2 size={16} />
									</span>
									<span className="hidden text-[11px] uppercase tracking-[0.18em] text-slate-300 sm:inline">Account</span>
									<ChevronDown className="size-4 text-slate-400" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-44 border-white/10 bg-slate-950/95 text-slate-100">
								<DropdownMenuLabel className="text-slate-400">Workspace</DropdownMenuLabel>
								<DropdownMenuSeparator className="bg-white/10" />
								<DropdownMenuItem variant="destructive" onClick={handleLogout}>
									<LogOut className="size-4" />
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</header>

			<main className="px-4 py-6 lg:px-8 lg:py-8">
				<div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:p-6 lg:p-8">
					{children}
				</div>
			</main>
		</div>
	);
}

