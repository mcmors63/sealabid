// app/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { account } from "@/lib/appwriteClient";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);

    try {
      await account.createEmailPasswordSession({
        email,
        password,
      });

      // If this email is the admin email → send to /admin
      if (
        ADMIN_EMAIL &&
        email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      ) {
        router.push("/admin");
      } else {
        // Normal users go to their dashboard
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      const message =
        err?.message ||
        err?.response?.message ||
        "Login failed. Check your details and try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-md px-4 py-10 sm:py-14">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Log in to <span className="text-emerald-400">Sealabid</span>
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Use the email and password you registered with.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing you in..." : "Log in"}
          </button>

          <p className="text-xs text-slate-400">
            New to Sealabid?{" "}
            <Link
              href="/register"
              className="text-emerald-300 hover:text-emerald-200"
            >
              Create an account
            </Link>
            .
          </p>
        </form>
      </div>
    </main>
  );
}
