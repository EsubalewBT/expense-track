'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, Loader2, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
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

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password.' }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message || 'Unable to reset password right now.';
  }

  return 'Unable to reset password right now.';
}

export default function ResetPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const resetPasswordMutation = AuthApi.ResetPassword.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
      form.setError('root', {});
      setTimeout(() => {
        router.replace('/auth/sign-in');
      }, 1500);
    },
    onError: (error) => {
      form.setError('root', { message: getApiErrorMessage(error) });
    },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    form.clearErrors('root');

    if (!token) {
      form.setError('root', { message: 'Missing reset token. Please request a new reset email.' });
      return;
    }

    resetPasswordMutation.mutate({
      token,
      password: values.password,
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_10%,#1d4ed833_0%,transparent_36%),radial-gradient(circle_at_85%_80%,#0f766e2e_0%,transparent_42%),linear-gradient(160deg,#0b1220_0%,#111c33_55%,#0f172a_100%)] px-4 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-20 top-10 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-[80vh] w-full max-w-4xl items-center justify-center">
        <Card className="w-full max-w-lg rounded-3xl border border-slate-700/70 bg-slate-900/90 py-0 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.75)] backdrop-blur">
          <CardHeader className="space-y-3 border-b border-slate-700/80 px-6 py-6">
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center gap-2 text-sm font-medium text-cyan-100 transition hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Back to sign in
            </Link>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-100">
              <LockKeyhole className="size-3.5" />
              Set new password
            </div>
            <CardTitle className="text-2xl font-semibold text-slate-50 [font-family:var(--font-display)]">Reset your password</CardTitle>
            <CardDescription className="text-slate-300">
              Choose a new password to secure your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-6 text-slate-100">
            {isSuccess ? (
              <div className="rounded-xl border border-emerald-400/40 bg-emerald-950/35 p-4 text-emerald-100">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5" />
                  <div>
                    <p className="text-sm font-semibold">Password reset successful</p>
                    <p className="mt-1 text-sm text-emerald-200/90">
                      Your password has been updated. Redirecting to sign in...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-100">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="border-slate-600 bg-slate-950/40 text-slate-100 placeholder:text-slate-400"
                    disabled={resetPasswordMutation.isPending}
                    {...form.register('password')}
                  />
                  {form.formState.errors.password ? (
                    <p className="text-xs font-medium text-red-600">{form.formState.errors.password.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-100">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    className="border-slate-600 bg-slate-950/40 text-slate-100 placeholder:text-slate-400"
                    disabled={resetPasswordMutation.isPending}
                    {...form.register('confirmPassword')}
                  />
                  {form.formState.errors.confirmPassword ? (
                    <p className="text-xs font-medium text-red-600">{form.formState.errors.confirmPassword.message}</p>
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
                  className="w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    'Reset password'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
