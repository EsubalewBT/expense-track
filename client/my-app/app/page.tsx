import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Landmark,
  LineChart,
  Receipt,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    title: "Instant recording",
    description:
      "Capture transactions in seconds with smart defaults, keyboard-first flows, and zero clutter.",
    Icon: Receipt,
    tone: "text-accent",
    halo: "bg-(--accent-soft)",
  },
  {
    title: "Operational analytics",
    description:
      "Understand cash in and cash out with real-time charts, category intelligence, and trend lines.",
    Icon: BarChart3,
    tone: "text-(--accent-2)",
    halo: "bg-(--accent-2-soft)",
  },
  {
    title: "Multi-ledger control",
    description:
      "Separate budgets by team, project, or entity with guardrails and approvals built in.",
    Icon: Landmark,
    tone: "text-(--accent-warm)",
    halo: "bg-(--accent-warm-soft)",
  },
  {
    title: "Forecast-ready",
    description:
      "Track balance health with running totals and forecasts to stay ahead of surprises.",
    Icon: LineChart,
    tone: "text-(--accent-cool)",
    halo: "bg-(--accent-cool-soft)",
  },
];

const STEPS = [
  {
    title: "Connect your ledgers",
    description:
      "Create books for each team, fund, or client and define how money flows between them.",
  },
  {
    title: "Capture transactions",
    description:
      "Use the right-side sheet to log cash in and cash out with categories and notes.",
  },
  {
    title: "Act on clarity",
    description:
      "Review dashboards, spot trends early, and keep every balance on target.",
  },
];

const PRINCIPLES = [
  {
    title: "Clarity over noise",
    description:
      "We build interfaces that remove distraction and focus teams on what matters most.",
  },
  {
    title: "Security by default",
    description:
      "Every workflow is designed around least-privilege access and secure data handling.",
  },
  {
    title: "Human support",
    description:
      "We partner with finance leaders to ship features that respect real operations.",
  },
];

const SECURITY_ITEMS = [
  "JWT authentication with refresh token rotation",
  "Role-aware access for finance teams",
  "Encrypted data at rest and in transit",
  "Audit-ready transaction history",
];

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-(--page-bg) text-slate-100 font-sans selection:bg-accent selection:text-slate-900"
      style={
        {
          "--page-bg": "#0a0f1d",
          "--surface": "#111c31",
          "--surface-2": "#16263f",
          "--surface-3": "#1c3352",
          "--border": "#2e4a6f",
          "--accent": "#22d3b8",
          "--accent-soft": "rgba(34, 211, 184, 0.15)",
          "--accent-2": "#5ab2ff",
          "--accent-2-soft": "rgba(90, 178, 255, 0.16)",
          "--accent-warm": "#f2b453",
          "--accent-warm-soft": "rgba(242, 180, 83, 0.18)",
          "--accent-cool": "#6ee7ff",
          "--accent-cool-soft": "rgba(110, 231, 255, 0.14)",
          "--text-soft": "#b6c0d6",
          "--text-muted": "#8d9ab4",
        } as CSSProperties
      }
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(34,211,184,0.32)_0%,rgba(10,15,29,0)_70%)] blur-2xl" />
          <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(90,178,255,0.3)_0%,rgba(10,15,29,0)_70%)] blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,180,83,0.18)_0%,rgba(10,15,29,0)_70%)] blur-3xl" />
          <div className="absolute inset-0 opacity-30 bg-[linear-gradient(transparent_0%,rgba(10,15,29,0.85)_40%,rgba(10,15,29,1)_100%)]" />
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[88px_88px]" />
        </div>

        <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-(--surface-2)">
              <Wallet className="h-5 w-5 text-accent" />
            </div>
            <span className="text-xl font-bold tracking-tight [font-family:var(--font-display)]">
              ExpenseFlow
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-(--text-soft) md:flex">
            <Link href="#product" className="transition-colors hover:text-white">
              Product
            </Link>
            <Link href="#security" className="transition-colors hover:text-white">
              Security
            </Link>
            <Link href="#company" className="transition-colors hover:text-white">
              Company
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/sign-in" className="text-sm font-semibold text-(--text-soft) hover:text-white">
              Sign In
            </Link>
            <Link href="/auth/sign-up">
              <Button className="h-10 rounded-full bg-accent px-5 font-semibold text-slate-950 hover:bg-[#2ee7cb]">
                Get Started
              </Button>
            </Link>
          </div>
        </header>

        <main className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-10">
          <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-(--surface) px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-(--text-soft) opacity-0 motion-safe:animate-[riseIn_0.8s_ease_forwards]">
                <Sparkles className="h-4 w-4 text-accent" />
                Built for modern finance teams
              </div>

              <h1
                className="text-4xl font-semibold leading-tight tracking-tight text-white opacity-0 motion-safe:animate-[riseIn_0.9s_ease_forwards] md:text-6xl"
                style={{ animationDelay: "120ms" }}
              >
                Every cash decision,
                <span className="block bg-linear-to-r from-accent via-[#42d9ff] to-(--accent-2) bg-clip-text text-transparent">
                  finally visible.
                </span>
              </h1>

              <p
                className="max-w-2xl text-lg leading-relaxed text-(--text-soft) opacity-0 motion-safe:animate-[riseIn_0.9s_ease_forwards] md:text-xl"
                style={{ animationDelay: "200ms" }}
              >
                ExpenseFlow is a multi-ledger finance workspace that keeps every
                inflow, outflow, and balance in one continuous view. Capture transactions,
                understand trends, and run decisions with confidence.
              </p>

              <div
                className="flex flex-col gap-4 opacity-0 motion-safe:animate-[riseIn_0.9s_ease_forwards] sm:flex-row"
                style={{ animationDelay: "280ms" }}
              >
                <Link href="/auth/sign-up" className="w-full sm:w-auto">
                  <Button className="h-12 w-full rounded-full bg-accent px-8 text-base font-semibold text-slate-950 hover:bg-[#2ee7cb] sm:w-auto">
                    Start for free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/sign-in" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-full border-border bg-(--surface) px-8 text-base font-semibold text-white hover:bg-(--surface-2) sm:w-auto"
                  >
                    Sign in to your workspace
                  </Button>
                </Link>
              </div>

              <div
                className="grid gap-4 text-sm text-(--text-muted) opacity-0 motion-safe:animate-[riseIn_0.9s_ease_forwards] sm:grid-cols-3"
                style={{ animationDelay: "360ms" }}
              >
                <div className="rounded-2xl border border-border bg-(--surface) p-4">
                  <p className="text-xs uppercase tracking-[0.2em]">Setup</p>
                  <p className="mt-2 text-lg font-semibold text-white [font-family:var(--font-geist-mono)]">
                    Minutes
                  </p>
                  <p className="text-xs text-(--text-muted)">From signup to first report</p>
                </div>
                <div className="rounded-2xl border border-border bg-(--surface) p-4">
                  <p className="text-xs uppercase tracking-[0.2em]">Visibility</p>
                  <p className="mt-2 text-lg font-semibold text-white [font-family:var(--font-geist-mono)]">
                    Real time
                  </p>
                  <p className="text-xs text-(--text-muted)">Live balances and trends</p>
                </div>
                <div className="rounded-2xl border border-border bg-(--surface) p-4">
                  <p className="text-xs uppercase tracking-[0.2em]">Control</p>
                  <p className="mt-2 text-lg font-semibold text-white [font-family:var(--font-geist-mono)]">
                    Granular
                  </p>
                  <p className="text-xs text-(--text-muted)">Role-based workflow</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-6 -top-10 hidden h-24 w-24 rounded-3xl border border-border bg-(--surface-3) opacity-70 motion-safe:animate-[float_7s_ease-in-out_infinite] lg:block" />
              <div className="rounded-3xl border border-border bg-(--surface) p-6 shadow-[0_20px_60px_rgba(6,12,26,0.55)]">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--text-muted)">
                    Live Ledger
                  </p>
                  <span className="rounded-full border border-border bg-(--surface-2) px-3 py-1 text-xs text-(--text-soft)">
                    Updated 3m ago
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-border bg-(--surface-2) p-4">
                    <p className="text-xs text-(--text-muted)">Net balance</p>
                    <p className="mt-2 text-3xl font-semibold text-white [font-family:var(--font-geist-mono)]">
                      $128,460.54
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-(--text-muted)">
                      <span className="inline-flex items-center gap-1 text-accent">
                        <Zap className="h-3 w-3" /> Cash in +12%
                      </span>
                      <span className="inline-flex items-center gap-1 text-(--accent-warm)">
                        <Wallet className="h-3 w-3" /> Cash out -4%
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {[
                      { label: "Product revenue", value: "+$46,200", tone: "text-accent" },
                      { label: "Operational spend", value: "-$18,420", tone: "text-rose-300" },
                      { label: "Partner payouts", value: "-$9,880", tone: "text-amber-300" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-2xl border border-border bg-(--surface-3) px-4 py-3"
                      >
                        <span className="text-sm text-(--text-soft)">{item.label}</span>
                        <span className={`text-sm font-semibold ${item.tone} [font-family:var(--font-geist-mono)]`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-20 grid gap-4 rounded-3xl border border-border bg-(--surface) px-6 py-6 sm:grid-cols-3">
            {["Founders", "Finance leads", "Operators"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-(--text-soft)">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-(--surface-2)">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                </div>
                Designed for {item.toLowerCase()} who need clarity now.
              </div>
            ))}
          </section>
        </main>
      </div>

      <section id="product" className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">
              Product
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white [font-family:var(--font-display)] md:text-4xl">
              A finance command center built for speed and trust.
            </h2>
          </div>
          <Link href="/auth/sign-up">
            <Button className="h-11 rounded-full bg-(--surface-2) px-6 text-sm font-semibold text-white hover:bg-(--surface-3)">
              See it in action
            </Button>
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-border bg-(--surface) p-6"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.halo}`}>
                <feature.Icon className={`h-6 w-6 ${feature.tone}`} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-(--text-soft)">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-(--surface-2) py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">
                Workflow
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white [font-family:var(--font-display)]">
                Move from transactions to decisions in one flow.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-(--text-soft)">
                ExpenseFlow connects capture, categorization, and analytics so your team can move
                without spreadsheets or disconnected tools.
              </p>
            </div>
            <div className="space-y-6">
              {STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className="flex items-start gap-4 rounded-3xl border border-border bg-(--surface) p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-(--surface-3) text-sm font-semibold text-white [font-family:var(--font-geist-mono)]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm text-(--text-soft)">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">
              Security
            </p>
            <h2 className="text-3xl font-semibold text-white [font-family:var(--font-display)]">
              Security, governance, and peace of mind.
            </h2>
            <p className="text-sm leading-relaxed text-(--text-soft)">
              ExpenseFlow is designed with security as a product feature, not an add-on. Control
              access, track every change, and keep audit-ready logs without extra tooling.
            </p>
            <div className="mt-6 space-y-3">
              {SECURITY_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-(--text-soft)">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-(--surface-2)">
                    <Check className="h-4 w-4 text-accent" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-(--surface) p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Status</p>
                <p className="mt-2 text-2xl font-semibold text-white [font-family:var(--font-display)]">Secure by design</p>
              </div>
              <ShieldCheck className="h-10 w-10 text-accent" />
            </div>
            <div className="mt-6 space-y-4 text-sm text-(--text-soft)">
              <p>
                Access is scoped per ledger. Approvals, edits, and deletions are recorded for
                compliance without slowing down the team.
              </p>
              <div className="rounded-2xl border border-border bg-(--surface-2) p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Monitoring</p>
                <p className="mt-2 text-sm text-white">Live alerts for unusual spend patterns</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="company" className="bg-(--surface-2) py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">
                Company
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white [font-family:var(--font-display)]">
                Built by a team obsessed with financial clarity.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-(--text-soft)">
                Our organization partners with modern finance leaders to build software that feels
                effortless, precise, and dependable. We measure progress by how quickly your team
                can act with confidence.
              </p>
            </div>
            <div className="grid gap-6">
              {PRINCIPLES.map((principle) => (
                <div
                  key={principle.title}
                  className="rounded-3xl border border-border bg-(--surface) p-5"
                >
                  <h3 className="text-base font-semibold text-white">{principle.title}</h3>
                  <p className="mt-2 text-sm text-(--text-soft)">{principle.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="rounded-3xl border border-border bg-(--surface) p-8 md:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Ready to start</p>
              <h2 className="mt-3 text-3xl font-semibold text-white [font-family:var(--font-display)]">
                Make ExpenseFlow your finance home base.
              </h2>
              <p className="mt-3 text-sm text-(--text-soft)">
                Launch a workspace, invite your team, and move from reporting to execution.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <Button className="h-11 w-full rounded-full bg-accent px-6 text-sm font-semibold text-slate-950 hover:bg-[#2ee7cb] sm:w-auto">
                  Start for free
                </Button>
              </Link>
              <Link href="/auth/sign-in" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-full border-border bg-(--surface-2) px-6 text-sm font-semibold text-white hover:bg-(--surface-3) sm:w-auto"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-(--surface-2)">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-(--text-muted) md:flex-row">
          <p>Copyright {new Date().getFullYear()} ExpenseFlow Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" /> Secure by design
            </span>
            <span className="inline-flex items-center gap-2">
              <Wallet className="h-4 w-4 text-(--accent-warm)" /> Built for finance
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}