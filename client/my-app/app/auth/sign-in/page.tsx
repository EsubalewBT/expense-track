'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { ArrowRight, Loader2, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthApi, ApiErrorResponse } from '@/lib/api/auth';
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

function getApiErrorMessage(error: unknown) {
	if (axios.isAxiosError<ApiErrorResponse>(error)) {
		return error.response?.data?.message || 'Unable to sign in. Please try again.';
	}

	return 'Unable to sign in. Please try again.';
}

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
			form.setError('root', { message: getApiErrorMessage(error) });
		},
	});

	const onSubmit = (values: LoginFormValues) => {
		form.clearErrors('root');
		loginMutation.mutate(values);
	};

	return (
		<main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_10%,#1d4ed833_0%,transparent_36%),radial-gradient(circle_at_85%_80%,#0f766e2e_0%,transparent_42%),linear-gradient(160deg,#0b1220_0%,#111c33_55%,#0f172a_100%)] px-4 py-10 sm:px-8">
			<div className="pointer-events-none absolute inset-0 opacity-80">
				<div className="absolute -left-20 top-10 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
				<div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl" />
			</div>

			<section className="relative mx-auto grid w-full max-w-5xl items-stretch gap-6 lg:grid-cols-[1.2fr_0.9fr]">
				<div className="hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
					<div className="space-y-4">
						<div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-100">
							<Wallet className="size-4" />
							ExpenseFlow
						</div>
						<h1 className="max-w-sm text-4xl leading-tight font-semibold text-white [font-family:var(--font-display)]">
							Run your money like a calm, modern command center.
						</h1>
						<p className="max-w-md text-sm leading-6 text-slate-200/90">
							Track spending, uncover patterns, and make smarter decisions with a focused
							dashboard built for clarity.
						</p>
					</div>
					<div className="rounded-2xl border border-white/15 bg-slate-950/30 p-4 text-sm text-slate-200">
						<p className="font-medium text-white">Tip</p>
						<p className="mt-1">
							Use the same account you registered with your API to access your dashboard data.
						</p>
					</div>
				</div>

				<Card className="mx-auto w-full max-w-md rounded-3xl border border-slate-700/70 bg-slate-900/90 py-0 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.75)] backdrop-blur">
					<CardHeader className="space-y-2 border-b border-slate-700/80 px-6 py-6 text-center">
						<CardTitle className="text-2xl font-semibold tracking-tight text-slate-50 [font-family:var(--font-display)]">
							Welcome back
						</CardTitle>
						<CardDescription className="text-slate-300">
							Sign in to continue managing your expenses.
						</CardDescription>
					</CardHeader>

					<CardContent className="px-6 py-6 text-slate-100">
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
							<div className="space-y-2">
								<Label htmlFor="email" className="text-slate-100">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									autoComplete="email"
									className="border-slate-600 bg-slate-950/40 text-slate-100 placeholder:text-slate-400"
									disabled={loginMutation.isPending}
									{...form.register('email')}
								/>
								{form.formState.errors.email ? (
									<p className="text-xs font-medium text-red-600">
										{form.formState.errors.email.message}
									</p>
								) : null}
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="password" className="text-slate-100">Password</Label>
									<Link
										href="/auth/forgot-password"
										className="text-xs font-medium text-cyan-200 underline-offset-4 hover:text-cyan-100 hover:underline"
									>
										Forgot password?
									</Link>
								</div>
								<Input
									id="password"
									type="password"
									placeholder="Enter your password"
									autoComplete="current-password"
									className="border-slate-600 bg-slate-950/40 text-slate-100 placeholder:text-slate-400"
									disabled={loginMutation.isPending}
									{...form.register('password')}
								/>
								{form.formState.errors.password ? (
									<p className="text-xs font-medium text-red-600">
										{form.formState.errors.password.message}
									</p>
								) : null}
							</div>

							{form.formState.errors.root ? (
								<div className="rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm font-medium text-red-200">
									{form.formState.errors.root.message}
								</div>
							) : null}

							<Button
								type="submit"
								size="lg"
								className="mt-2 w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200"
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

						<p className="mt-6 text-center text-sm text-slate-300">
							New here?{' '}
							<Link href="/auth/sign-up" className="font-semibold text-cyan-200 hover:text-cyan-100 hover:underline">
								Create an account
							</Link>
						</p>
					</CardContent>
				</Card>
			</section>
		</main>
	);
}

