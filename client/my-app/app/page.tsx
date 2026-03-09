import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, ShieldCheck, Wallet } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-teal-500 selection:text-slate-900">
      {/* NAVIGATION */}
      <header className="container mx-auto flex items-center justify-between px-6 py-6">
        <div className="text-2xl font-black tracking-tighter text-white">
          Expense<span className="text-teal-400">Flow</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/auth/sign-in"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link href="/auth/sign-up">
            {/* Assuming you built a /register page */}
            <Button className="rounded-full bg-teal-500 px-6 font-bold text-slate-950 hover:bg-teal-400">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      {/* HERO SECTION */}
      <main className="container mx-auto max-w-4xl px-6 pb-32 pt-24 text-center">
        <div className="mb-8 inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-sm font-medium text-teal-300">
          <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-teal-500"></span>
          Now available for public beta
        </div>

        <h1 className="mb-8 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
          Take absolute control of your{" "}
          <span className="bg-linear-to-r from-teal-400 to-emerald-600 bg-clip-text text-transparent">
            financial future.
          </span>
        </h1>

        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
          The modern, blazing-fast expense tracker built for professionals.
          Monitor your spending, analyze trends, and stay on budget without the
          spreadsheet headache.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register">
            <Button
              size="lg"
              className="h-14 w-full rounded-full bg-teal-500 px-8 text-lg font-bold text-slate-950 hover:bg-teal-400 sm:w-auto"
            >
              Start Tracking for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-full rounded-full border-slate-700 bg-white px-8 text-lg font-bold text-slate-900 hover:bg-slate-200 hover:text-slate-900 sm:w-auto"
            >
              View Live Demo
            </Button>
          </Link>
        </div>
      </main>

      {/* FEATURES SECTION */}
      <section className="border-t border-slate-800 bg-slate-900/50 py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="space-y-4">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Instant Recording</h3>
              <p className="leading-relaxed text-slate-400">
                Log your expenses in seconds. Our zero-friction interface means
                you spend less time typing and more time living.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Smart Analytics</h3>
              <p className="leading-relaxed text-slate-400">
                Beautiful, real-time charts that actually make sense. See exactly
                where your money is going at a glance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Bank-Grade Security</h3>
              <p className="leading-relaxed text-slate-400">
                Your data is encrypted and stored securely. We use
                industry-standard JWT authentication to keep your vault locked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="container mx-auto border-t border-slate-800 px-6 py-8 text-center text-sm text-slate-500">
        <p>
          © {new Date().getFullYear()} ExpenseFlow Inc. All rights reserved.
          Built by Franckley.
        </p>
      </footer>
    </div>
  );
}