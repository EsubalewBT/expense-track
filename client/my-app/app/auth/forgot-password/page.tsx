'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
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

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message || 'Unable to send reset email right now.';
  }

  return 'Unable to send reset email right now.';
}

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const forgotPasswordMutation = AuthApi.ForgotPassword.useMutation({
    onSuccess: () => {
      form.setError('root', {});
    },
    onError: (error) => {
      form.setError('root', { message: getApiErrorMessage(error) });
    },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    form.clearErrors('root');
    setSubmittedEmail(values.email);
    forgotPasswordMutation.mutate(values);
  };

  const isSuccess = forgotPasswordMutation.isSuccess;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_0%_0%,#1e3a8a33_0%,transparent_35%),radial-gradient(circle_at_100%_80%,#0f766e2a_0%,transparent_40%),linear-gradient(145deg,#0b1220_0%,#111c33_50%,#0f172a_100%)] px-4 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute left-10 top-16 h-44 w-44 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl" />
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
              <Mail className="size-3.5" />
              Password recovery
            </div>
            <CardTitle className="text-2xl font-semibold text-slate-50 [font-family:var(--font-display)]">Forgot password?</CardTitle>
            <CardDescription className="text-slate-300">
              Enter your account email and we will send you a reset link.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-6 text-slate-100">
            {isSuccess ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-400/40 bg-emerald-950/35 p-4 text-emerald-100">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5" />
                    <div>
                      <p className="text-sm font-semibold">Reset link sent</p>
                      <p className="mt-1 text-sm text-emerald-200/90">
                        If an account exists for <span className="font-medium">{submittedEmail}</span>,
                        you will receive reset instructions shortly.
                      </p>
                    </div>
                  </div>
                </div>
                <Button asChild size="lg" className="w-full">
                  <Link href="/auth/sign-in">Return to sign in</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-100">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="border-slate-600 bg-slate-950/40 text-slate-100 placeholder:text-slate-400"
                    disabled={forgotPasswordMutation.isPending}
                    {...form.register('email')}
                  />
                  {form.formState.errors.email ? (
                    <p className="text-xs font-medium text-red-600">{form.formState.errors.email.message}</p>
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
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    'Send reset link'
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
