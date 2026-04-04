'use client';

import type { CSSProperties } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthApi, getAuthErrorMessage } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
	email: z.string().email({ message: 'Please enter a valid email address.' }),
	password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function SignInPage() {
	const router = useRouter();

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: '', password: '' },
		mode: 'onBlur',
	});

	const loginMutation = AuthApi.Login.useMutation({
		onSuccess: () => {
			router.replace('/dashboard');
		},
		onError: (error) => {
			form.setError('root', {
				message: getAuthErrorMessage(error, 'Unable to sign in. Please try again.'),
			});
		},
	});

	const onSubmit = (values: LoginFormValues) => {
		form.clearErrors('root');
		loginMutation.mutate(values);
	};

	return (
		<main
			className="relative min-h-screen overflow-hidden bg-(--page-bg) px-4 py-10 text-slate-100 font-sans selection:bg-accent selection:text-slate-900 sm:px-8"
			style={
				{
					'--page-bg': '#0a0f1d',
					'--surface': '#111c31',
					'--surface-2': '#16263f',
					'--surface-3': '#1c3352',
					'--border': '#2e4a6f',
					'--accent': '#22d3b8',
					'--accent-soft': 'rgba(34, 211, 184, 0.15)',
					'--accent-2': '#5ab2ff',
					'--accent-2-soft': 'rgba(90, 178, 255, 0.16)',
					'--accent-warm': '#f2b453',
					'--accent-warm-soft': 'rgba(242, 180, 83, 0.18)',
					'--accent-cool': '#6ee7ff',
					'--accent-cool-soft': 'rgba(110, 231, 255, 0.14)',
					'--text-soft': '#b6c0d6',
					'--text-muted': '#8d9ab4',
				} as CSSProperties
			}
		>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(34,211,184,0.32)_0%,rgba(10,15,29,0)_70%)] blur-2xl" />
				<div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(90,178,255,0.3)_0%,rgba(10,15,29,0)_70%)] blur-3xl" />
				<div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,180,83,0.18)_0%,rgba(10,15,29,0)_70%)] blur-3xl" />
				<div className="absolute inset-0 opacity-30 bg-[linear-gradient(transparent_0%,rgba(10,15,29,0.85)_40%,rgba(10,15,29,1)_100%)]" />
				<div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[88px_88px]" />
			</div>

			<section className="relative mx-auto grid w-full max-w-5xl items-stretch gap-6 lg:grid-cols-[1.2fr_0.9fr]">
				<div className="hidden rounded-3xl border border-border bg-(--surface) p-8 shadow-[0_24px_70px_-40px_rgba(6,12,26,0.7)] backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
					<div className="space-y-5">
						<div className="inline-flex items-center gap-2 rounded-full border border-border bg-(--surface-2) px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-(--text-soft)">
							<Wallet className="size-4 text-accent" />
							ExpenseFlow
						</div>
						<h1 className="max-w-sm text-4xl leading-tight font-semibold text-white [font-family:var(--font-display)]">
							Run your money like a calm, modern command center.
						</h1>
						<p className="max-w-md text-sm leading-6 text-(--text-soft)">
							Track spending, uncover patterns, and make smarter decisions with a focused
							dashboard built for clarity.
						</p>
					</div>
					<div className="rounded-2xl border border-border bg-(--surface-2) p-4 text-sm text-(--text-soft)">
						<p className="font-medium text-white">Tip</p>
						<p className="mt-1">
							Use the same account you registered to access your dashboard data.
						</p>
					</div>
				</div>

				<Card className="mx-auto w-full max-w-md rounded-3xl border border-border bg-(--surface) py-0 shadow-[0_24px_70px_-35px_rgba(6,12,26,0.75)] backdrop-blur">
					<CardHeader className="space-y-2 border-b border-border px-6 py-6 text-center">
						<CardTitle className="text-2xl font-semibold tracking-tight text-slate-50 [font-family:var(--font-display)]">
							Welcome back
						</CardTitle>
						<CardDescription className="text-(--text-soft)">
							Sign in to continue managing your expenses.
						</CardDescription>
					</CardHeader>

					<CardContent className="px-6 py-6 text-slate-100">
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
							<div className="space-y-2">
								<Label htmlFor="email" className="text-(--text-soft)">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									autoComplete="email"
									className="border-border bg-(--surface-2) text-white placeholder:text-(--text-muted)"
									disabled={loginMutation.isPending}
									{...form.register('email')}
								/>
								{form.formState.errors.email ? (
									<p className="text-xs font-medium text-rose-200">
										{form.formState.errors.email.message}
									</p>
								) : null}
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="password" className="text-(--text-soft)">Password</Label>
									<Link
										href="/auth/forgot-password"
										className="text-xs font-medium text-(--accent-2) underline-offset-4 hover:text-accent hover:underline"
									>
										Forgot password?
									</Link>
								</div>
								<Input
									id="password"
									type="password"
									placeholder="Enter your password"
									autoComplete="current-password"
									className="border-border bg-(--surface-2) text-white placeholder:text-(--text-muted)"
									disabled={loginMutation.isPending}
									{...form.register('password')}
								/>
								{form.formState.errors.password ? (
									<p className="text-xs font-medium text-rose-200">
										{form.formState.errors.password.message}
									</p>
								) : null}
							</div>

							{form.formState.errors.root ? (
								<div className="rounded-lg border border-rose-400/40 bg-rose-950/50 px-3 py-2 text-sm font-medium text-rose-200">
									{form.formState.errors.root.message}
								</div>
							) : null}

							<Button
								type="submit"
								size="lg"
								className="mt-2 w-full gap-2 bg-accent text-slate-950 hover:bg-[#2ee7cb]"
								disabled={loginMutation.isPending}
							>
								{loginMutation.isPending ? (
									<>
										<Loader2 className="size-4 animate-spin" />
										Signing in...
									</>
								) : (
									<>
										Sign in
										<ArrowRight className="size-4" />
									</>
								)}
							</Button>
						</form>

						<p className="mt-6 text-center text-sm text-(--text-soft)">
							New here?{' '}
							<Link href="/auth/sign-up" className="font-semibold text-accent hover:text-white hover:underline">
								Create an account
							</Link>
						</p>
					</CardContent>
				</Card>
			</section>
		</main>
	);
}

