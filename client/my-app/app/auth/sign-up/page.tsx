'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
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

const signUpSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .regex(/[A-Za-z]/, { message: 'Password must include at least one letter.' })
      .regex(/\d/, { message: 'Password must include at least one number.' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password.' }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message || 'Unable to create your account right now.';
  }

  return 'Unable to create your account right now.';
}

export default function SignUpPage() {
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const registerMutation = AuthApi.Register.useMutation({
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('accessToken');
        window.localStorage.removeItem('refreshToken');
        window.localStorage.removeItem('user');
      }
      router.replace('/auth/sign-in');
    },
    onError: (error) => {
      form.setError('root', { message: getApiErrorMessage(error) });
    },
  });

  const onSubmit = (values: SignUpFormValues) => {
    form.clearErrors('root');
    registerMutation.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_0%,#1e3a8a33_0%,transparent_34%),radial-gradient(circle_at_100%_15%,#115e5929_0%,transparent_36%),linear-gradient(160deg,#0b1220_0%,#101a2e_52%,#111827_100%)] px-4 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-75">
        <div className="absolute left-8 top-1/3 h-44 w-44 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="absolute right-6 top-12 h-52 w-52 rounded-full bg-emerald-300/15 blur-3xl" />
      </div>

      <section className="relative mx-auto grid w-full max-w-5xl items-stretch gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card className="order-2 w-full rounded-3xl border border-slate-700/70 bg-slate-900/90 py-0 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.75)] backdrop-blur lg:order-1">
          <CardHeader className="space-y-2 border-b border-slate-700/80 px-6 py-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-100">
              <Sparkles className="size-3.5" />
              Start Free
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-50 [font-family:var(--font-display)]">
              Create your ExpenseFlow account
            </CardTitle>
            <CardDescription className="text-slate-300">
              One account to track every expense category with confidence.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-6 text-slate-100">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-100">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Alex Morgan"
                  autoComplete="name"
                  className="border-slate-600 bg-slate-950/40 text-slate-100 placeholder:text-slate-400"
                  disabled={registerMutation.isPending}
                  {...form.register('name')}
                />
                {form.formState.errors.name ? (
                  <p className="text-xs font-medium text-red-600">{form.formState.errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-100">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="border-slate-600 bg-slate-950/40 text-slate-100 placeholder:text-slate-400"
                  disabled={registerMutation.isPending}
                  {...form.register('email')}
                />
                {form.formState.errors.email ? (
                  <p className="text-xs font-medium text-red-600">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-100">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="border-slate-600 bg-slate-950/40 text-slate-100 placeholder:text-slate-400"
                    disabled={registerMutation.isPending}
                    {...form.register('password')}
                  />
                  {form.formState.errors.password ? (
                    <p className="text-xs font-medium text-red-600">{form.formState.errors.password.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-100">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className="border-slate-600 bg-slate-950/40 text-slate-100 placeholder:text-slate-400"
                    disabled={registerMutation.isPending}
                    {...form.register('confirmPassword')}
                  />
                  {form.formState.errors.confirmPassword ? (
                    <p className="text-xs font-medium text-red-600">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  ) : null}
                </div>
              </div>

              {form.formState.errors.root ? (
                <div className="rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm font-medium text-red-200">
                  {form.formState.errors.root.message}
                </div>
              ) : null}

              <Button type="submit" size="lg" className="w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-300">
              Already have an account?{' '}
              <Link href="/auth/sign-in" className="font-semibold text-cyan-200 hover:text-cyan-100 hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <aside className="order-1 rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:order-2">
          <Link
            href="/auth/sign-in"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-cyan-100 transition hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>

          <h2 className="text-3xl leading-tight font-semibold text-white [font-family:var(--font-display)]">
            Build financial habits that actually stick.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-200/90">
            ExpenseFlow gives you a clean daily snapshot, trend insights, and category-level clarity
            without dashboard clutter.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-slate-100/95">
            <div className="rounded-xl border border-white/15 bg-slate-950/30 p-3">
              Live category distribution and spending trend charts.
            </div>
            <div className="rounded-xl border border-white/15 bg-slate-950/30 p-3">
              Smart filtering by day, week, and month with instant totals.
            </div>
            <div className="rounded-xl border border-white/15 bg-slate-950/30 p-3">
              Secure account auth with automatic session handling.
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
