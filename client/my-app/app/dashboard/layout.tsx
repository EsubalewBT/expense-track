'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';

type DashboardLayoutProps = {
	children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const router = useRouter();

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
					<div>
						<p className="text-xs tracking-[0.2em] text-cyan-200/80">EXPENSEFLOW</p>
						<p className="text-sm font-medium text-white">Dashboard</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							className="gap-2 border-red-300/50 bg-red-500/10 text-red-100 hover:bg-red-500/20 hover:text-red-50"
							onClick={handleLogout}
						>
							<LogOut size={16} />
							Sign Out
						</Button>
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

