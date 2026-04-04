'use client';

import type { CSSProperties } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
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

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const forgotPasswordMutation = AuthApi.ForgotPassword.useMutation({
    onSuccess: (data) => {
      setPreviewUrl(data?.previewUrl ?? null);
      form.setError('root', {});
    },
    onError: (error) => {
      form.setError('root', {
        message: getAuthErrorMessage(error, 'Unable to send reset email right now.'),
      });
    },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    form.clearErrors('root');
    setPreviewUrl(null);
    setSubmittedEmail(values.email);
    forgotPasswordMutation.mutate(values);
  };

  const isSuccess = forgotPasswordMutation.isSuccess;

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

      <section className="relative mx-auto flex min-h-[80vh] w-full max-w-4xl items-center justify-center">
        <Card className="w-full max-w-lg rounded-3xl border border-border bg-(--surface) py-0 shadow-[0_24px_70px_-35px_rgba(6,12,26,0.75)] backdrop-blur">
          <CardHeader className="space-y-3 border-b border-border px-6 py-6">
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center gap-2 text-sm font-medium text-(--accent-2) transition hover:text-accent"
            >
              <ArrowLeft className="size-4" />
              Back to sign in
            </Link>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-(--surface-2) px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-(--text-soft)">
              <Mail className="size-3.5 text-accent" />
              Password recovery
            </div>
            <CardTitle className="text-2xl font-semibold text-slate-50 [font-family:var(--font-display)]">Forgot password?</CardTitle>
            <CardDescription className="text-(--text-soft)">
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
                {previewUrl ? (
                  <div className="rounded-xl border border-border bg-(--surface-2) p-4 text-(--text-soft)">
                    <p className="text-sm font-semibold">Development email preview</p>
                    <p className="mt-1 text-sm text-(--text-muted)">
                      You are using a test SMTP inbox. Open your reset email here.
                    </p>
                    <Button asChild size="sm" variant="outline" className="mt-3 border-border text-(--accent-2) hover:bg-(--surface-3)">
                      <a href={previewUrl} target="_blank" rel="noreferrer">
                        Open Email Preview
                      </a>
                    </Button>
                  </div>
                ) : null}
                <Button asChild size="lg" className="w-full bg-accent text-slate-950 hover:bg-[#2ee7cb]">
                  <Link href="/auth/sign-in">Return to sign in</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-(--text-soft)">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="border-border bg-(--surface-2) text-white placeholder:text-(--text-muted)"
                    disabled={forgotPasswordMutation.isPending}
                    {...form.register('email')}
                  />
                  {form.formState.errors.email ? (
                    <p className="text-xs font-medium text-rose-200">{form.formState.errors.email.message}</p>
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
                  className="w-full bg-accent text-slate-950 hover:bg-[#2ee7cb]"
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
