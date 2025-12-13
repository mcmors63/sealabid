// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { account } from "@/lib/appwriteClient";

// We treat admins as "any user whose email matches this env var"
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

type SimpleUser = {
  id: string;
  name: string;
  email: string;
};

export default function AdminPage() {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      setLoading(true);
      setError(null);

      try {
        const me: any = await account.get();
        if (cancelled) return;

        const simple: SimpleUser = {
          id: me.$id,
          name: me.name || "",
          email: me.email || "",
        };

        setUser(simple);

        if (
          ADMIN_EMAIL &&
          simple.email &&
          simple.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
        ) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Admin loadUser error:", err);
          setUser(null);
          setIsAdmin(false);
          setError("You must be logged in as an admin to view this page.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  // ------------- RENDER STATES -------------

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
          <p className="text-sm text-slate-300">Checking admin access…</p>
        </div>
      </main>
    );
  }

  // Not logged in / error
  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Admin area
          </h1>
          <p className="text-sm text-slate-300">
            {error ||
              "You need to be logged in with the admin account to view this page."}
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <Link
              href="/login"
              className="inline-flex rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Login
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-full border border-slate-600 px-4 py-2 font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Logged in but NOT admin
  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Admin area
          </h1>
          <p className="text-sm text-slate-300">
            You&apos;re logged in as{" "}
            <span className="font-semibold text-emerald-300">
              {user.name || user.email}
            </span>
            , but this account is not authorised to access the admin dashboard.
          </p>
          <p className="text-xs text-slate-500">
            If you think this is a mistake, check the{" "}
            <code className="rounded bg-slate-900 px-1 py-0.5 text-[10px]">
              NEXT_PUBLIC_ADMIN_EMAIL
            </code>{" "}
            value in your <code>.env.local</code> file.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  // Admin view
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-8">
        {/* Header */}
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Sealabid
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Admin dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Internal view for managing listings, abuse reports and deals. This
              area is for platform operators only.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/60 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
            <p className="font-semibold text-emerald-200">
              Signed in as admin
            </p>
            <p className="mt-1 text-[11px]">
              {user.name && (
                <>
                  {user.name} <span className="text-slate-400">•</span>{" "}
                </>
              )}
              {user.email}
            </p>
          </div>
        </header>

        {/* Sections – we’ll wire these up step by step later */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Listings
            </h2>
            <p className="mt-2 text-xs text-slate-300">
              Later this will show live / ended listings, let you hide items and
              jump into a detailed admin view for each listing.
            </p>
            <Link
              href="/admin/listings"
              className="mt-3 inline-flex text-[11px] font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Go to listings admin →
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Deals &amp; fees
            </h2>
            <p className="mt-2 text-xs text-slate-300">
              This will show accepted envelopes, fees and commissions so you can
              track deals and mark payments as paid, failed or cancelled.
            </p>
            <Link
              href="/admin/deals"
              className="mt-3 inline-flex text-[11px] font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Go to deals admin →
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Abuse &amp; safety
            </h2>
            <p className="mt-2 text-xs text-slate-300">
              Here you&apos;ll see reports from sellers about abusive messages
              and can review, record decisions and block accounts if needed.
            </p>
            <Link
              href="/admin/abuse"
              className="mt-3 inline-flex text-[11px] font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Go to abuse reports →
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Notes
          </h2>
          <p className="mt-2">
            This admin area is not intended to be indexed by search engines and
            is used only to operate the platform. Public, SEO-focused pages are
            your listings, item detail pages, and static info pages like Fees,
            Terms and Privacy.
          </p>
        </section>
      </div>
    </main>
  );
}
