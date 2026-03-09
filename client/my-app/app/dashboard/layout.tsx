'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { LayoutDashboard, LogOut, Menu, Receipt, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

type DashboardLayoutProps = {
	children: ReactNode;
};

type NavItem = {
	href: string;
	label: string;
	icon: typeof LayoutDashboard;
	isActive: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
	{
		href: '/dashboard',
		label: 'Overview',
		icon: LayoutDashboard,
		isActive: (pathname) => pathname === '/dashboard',
	},
	{
		href: '/dashboard/expenses',
		label: 'All Expenses',
		icon: Receipt,
		isActive: (pathname) => pathname.startsWith('/dashboard/expenses'),
	},
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const pathname = usePathname();
	const router = useRouter();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const currentSection = useMemo(
		() => navItems.find((item) => item.isActive(pathname))?.label || 'Dashboard',
		[pathname]
	);

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

	const handleNavigateFromMobile = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,#1e3a8a20_0%,transparent_35%),radial-gradient(circle_at_95%_0%,#0f766e22_0%,transparent_30%),linear-gradient(180deg,#070b14_0%,#0b1220_45%,#0f172a_100%)] text-slate-100">
			<aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-white/10 bg-slate-950/55 px-5 py-6 backdrop-blur-xl lg:flex lg:flex-col">
				<div className="mb-8 border-b border-white/10 pb-5">
					<p className="text-xs font-semibold tracking-[0.22em] text-cyan-200/90">EXPENSE | FLOW</p>
					<h1 className="mt-2 text-2xl font-semibold text-white [font-family:var(--font-display)]">Dashboard</h1>
				</div>

				<nav className="flex-1 space-y-2">
					{navItems.map((item) => {
						const Icon = item.icon;
						const active = item.isActive(pathname);

						return (
							<Button
								key={item.href}
								asChild
								variant={active ? 'secondary' : 'ghost'}
								className={
									active
										? 'w-full justify-start gap-3 bg-cyan-300 text-slate-950 hover:bg-cyan-200'
										: 'w-full justify-start gap-3 text-slate-200 hover:bg-white/10 hover:text-white'
								}
							>
										<Link href={item.href} onClick={handleNavigateFromMobile}>
									<Icon size={18} />
									{item.label}
								</Link>
							</Button>
						);
					})}
				</nav>

				<div className="mt-5 border-t border-white/10 pt-5">
					<Button
						variant="outline"
						className="w-full gap-3 border-red-300/50 bg-red-500/10 text-red-100 hover:bg-red-500/20 hover:text-red-50"
						onClick={handleLogout}
					>
						<LogOut size={18} />
						Sign Out
					</Button>
				</div>
			</aside>

			<header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/65 px-4 py-3 backdrop-blur lg:hidden">
				<div className="mx-auto flex max-w-6xl items-center justify-between">
					<div>
						<p className="text-xs tracking-[0.2em] text-cyan-200/80">EXPENSEFLOW</p>
						<p className="text-sm font-medium text-white">{currentSection}</p>
					</div>
					<Button
						variant="outline"
						size="icon"
						className="border-white/20 bg-white/5 text-slate-100 hover:bg-white/10"
						onClick={() => setIsMobileMenuOpen((prev) => !prev)}
						aria-label="Toggle navigation"
					>
						{isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
					</Button>
				</div>
			</header>

			{isMobileMenuOpen ? (
				<div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
					<aside
						className="absolute left-0 top-0 h-full w-72 border-r border-white/10 bg-slate-950/95 p-5"
						onClick={(event) => event.stopPropagation()}
					>
						<p className="text-xs font-semibold tracking-[0.22em] text-cyan-200/90">EXPENSEFLOW</p>
						<nav className="mt-6 space-y-2">
							{navItems.map((item) => {
								const Icon = item.icon;
								const active = item.isActive(pathname);

								return (
									<Button
										key={item.href}
										asChild
										variant={active ? 'secondary' : 'ghost'}
										className={
											active
												? 'w-full justify-start gap-3 bg-cyan-300 text-slate-950 hover:bg-cyan-200'
												: 'w-full justify-start gap-3 text-slate-200 hover:bg-white/10 hover:text-white'
										}
									>
										<Link href={item.href}>
											<Icon size={18} />
											{item.label}
										</Link>
									</Button>
								);
							})}
						</nav>
						<Button
							variant="outline"
							className="mt-6 w-full gap-3 border-red-300/50 bg-red-500/10 text-red-100 hover:bg-red-500/20 hover:text-red-50"
							onClick={handleLogout}
						>
							<LogOut size={18} />
							Sign Out
						</Button>
					</aside>
				</div>
			) : null}

			<main className="px-4 py-6 lg:ml-72 lg:px-8 lg:py-8">
				<div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:p-6 lg:p-8">
					{children}
				</div>
			</main>
		</div>
	);
}

