'use client';

import type { CSSProperties } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
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
      form.setError('root', {
        message: getAuthErrorMessage(error, 'Unable to create your account right now.'),
      });
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

      <section className="relative mx-auto grid w-full max-w-5xl items-stretch gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card className="order-2 w-full rounded-3xl border border-border bg-(--surface) py-0 shadow-[0_24px_70px_-35px_rgba(6,12,26,0.75)] backdrop-blur lg:order-1">
          <CardHeader className="space-y-2 border-b border-border px-6 py-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-(--surface-2) px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-(--text-soft)">
              <Sparkles className="size-3.5 text-accent" />
              Start Free
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-50 [font-family:var(--font-display)]">
              Create your ExpenseFlow account
            </CardTitle>
            <CardDescription className="text-(--text-soft)">
              One account to track every expense category with confidence.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-6 text-slate-100">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-(--text-soft)">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Alex Morgan"
                  autoComplete="name"
                  className="border-border bg-(--surface-2) text-white placeholder:text-(--text-muted)"
                  disabled={registerMutation.isPending}
                  {...form.register('name')}
                />
                {form.formState.errors.name ? (
                  <p className="text-xs font-medium text-rose-200">{form.formState.errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-(--text-soft)">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="border-border bg-(--surface-2) text-white placeholder:text-(--text-muted)"
                  disabled={registerMutation.isPending}
                  {...form.register('email')}
                />
                {form.formState.errors.email ? (
                  <p className="text-xs font-medium text-rose-200">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-(--text-soft)">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="border-border bg-(--surface-2) text-white placeholder:text-(--text-muted)"
                    disabled={registerMutation.isPending}
                    {...form.register('password')}
                  />
                  {form.formState.errors.password ? (
                    <p className="text-xs font-medium text-rose-200">{form.formState.errors.password.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-(--text-soft)">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className="border-border bg-(--surface-2) text-white placeholder:text-(--text-muted)"
                    disabled={registerMutation.isPending}
                    {...form.register('confirmPassword')}
                  />
                  {form.formState.errors.confirmPassword ? (
                    <p className="text-xs font-medium text-rose-200">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  ) : null}
                </div>
              </div>

              {form.formState.errors.root ? (
                <div className="rounded-lg border border-rose-400/40 bg-rose-950/50 px-3 py-2 text-sm font-medium text-rose-200">
                  {form.formState.errors.root.message}
                </div>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 bg-accent text-slate-950 hover:bg-[#2ee7cb]"
                disabled={registerMutation.isPending}
              >
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

            <p className="mt-6 text-center text-sm text-(--text-soft)">
              Already have an account?{' '}
              <Link href="/auth/sign-in" className="font-semibold text-accent hover:text-white hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <aside className="order-1 rounded-3xl border border-border bg-(--surface) p-7 shadow-[0_24px_70px_-40px_rgba(6,12,26,0.7)] backdrop-blur-xl lg:order-2">
          <Link
            href="/auth/sign-in"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-(--accent-2) transition hover:text-accent"
          >
            <ArrowLeft className="size-4" />
            Back to sign in
          </Link>

          <h2 className="text-3xl leading-tight font-semibold text-white [font-family:var(--font-display)]">
            Build financial habits that actually stick.
          </h2>
          <p className="mt-3 text-sm leading-6 text-(--text-soft)">
            ExpenseFlow gives you a clean daily snapshot, trend insights, and category-level clarity
            without dashboard clutter.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-(--text-soft)">
            <div className="rounded-xl border border-border bg-(--surface-2) p-3">
              Live category distribution and spending trend charts.
            </div>
            <div className="rounded-xl border border-border bg-(--surface-2) p-3">
              Smart filtering by day, week, and month with instant totals.
            </div>
            <div className="rounded-xl border border-border bg-(--surface-2) p-3">
              Secure account auth with automatic session handling.
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
