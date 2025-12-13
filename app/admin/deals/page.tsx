// app/admin/deals/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Query } from "appwrite";
import { account, databases } from "@/lib/appwriteClient";

const DB_ID = "sealabid_main_db";
const LISTINGS_COLLECTION_ID = "listings";

// Envelopes DB/collection (same as elsewhere)
const ENVELOPES_DB_ID = process.env.NEXT_PUBLIC_APPWRITE_ENVELOPES_DB_ID!;
const ENVELOPES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_ENVELOPES_COLLECTION_ID!;

// Very simple admin check – by email
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

// -----------------------------
// Types
// -----------------------------
type DealRow = {
  envelopeId: string;
  listingId: string;
  listingTitle: string;
  listingRef: string;
  sellerId: string;
  buyerId: string;
  amount: number;
  endsAt: string;
  envelopeCreatedAt: string;
};

export default function AdminDealsPage() {
  const router = useRouter();

  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [deals, setDeals] = useState<DealRow[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [dealsError, setDealsError] = useState<string | null>(null);

  // -----------------------------
  // Check admin
  // -----------------------------
  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      try {
        const me = await account.get();
        if (cancelled) return;

        const email = (me.email || "").toLowerCase();
        const adminEmail = ADMIN_EMAIL.toLowerCase();

        if (adminEmail && email === adminEmail) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setAuthError("You do not have permission to view the admin area.");
        }
      } catch (err) {
        console.error("Admin check failed:", err);
        if (!cancelled) {
          setIsAdmin(false);
          setAuthError("You must be logged in as an admin to view this page.");
        }
      } finally {
        if (!cancelled) setCheckingAdmin(false);
      }
    }

    checkAdmin();
    return () => {
      cancelled = true;
    };
  }, []);

  // -----------------------------
  // Load winner envelopes + join listings
  // -----------------------------
  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;

    async function loadDeals() {
      setLoadingDeals(true);
      setDealsError(null);

      try {
        // 1) Get all winner envelopes
        const envRes: any = await databases.listDocuments(
          ENVELOPES_DB_ID,
          ENVELOPES_COLLECTION_ID,
          [
            Query.equal("status", "winner"),
            Query.orderDesc("$createdAt"),
            Query.limit(100),
          ]
        );

        if (cancelled) return;

        const envelopes: any[] = envRes.documents || [];
        if (envelopes.length === 0) {
          setDeals([]);
          setLoadingDeals(false);
          return;
        }

        // 2) Collect unique listing IDs
        const listingIds = Array.from(
          new Set(envelopes.map((e) => e.listingId).filter(Boolean))
        );

        // 3) Fetch each listing
        const listingMap: Record<string, any> = {};
        await Promise.all(
          listingIds.map(async (listingId) => {
            try {
              const doc = await databases.getDocument(
                DB_ID,
                LISTINGS_COLLECTION_ID,
                listingId
              );
              listingMap[listingId] = doc;
            } catch (err) {
              console.error("Error loading listing for deal view:", err);
            }
          })
        );

        if (cancelled) return;

        // 4) Build DealRow[]
        const rows: DealRow[] = envelopes
          .map((env) => {
            const listing = listingMap[env.listingId];
            if (!listing) return null;

            return {
              envelopeId: env.$id,
              listingId: env.listingId,
              listingTitle: listing.title || "(Untitled listing)",
              listingRef: listing.reference || listing.$id,
              sellerId: listing.sellerId || "Unknown",
              buyerId: env.buyerId || "Unknown",
              amount: Number(env.amount) || 0,
              endsAt: listing.endsAt,
              envelopeCreatedAt: env.$createdAt,
            } as DealRow;
          })
          .filter(Boolean) as DealRow[];

        setDeals(rows);
      } catch (err: any) {
        console.error("Error loading admin deals:", err);
        const msg =
          err?.message ||
          err?.response?.message ||
          "Failed to load deals for admin.";
        setDealsError(msg);
      } finally {
        if (!cancelled) setLoadingDeals(false);
      }
    }

    loadDeals();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  // -----------------------------
  // Helpers
  // -----------------------------
  function formatDateTime(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "Unknown";
    return d.toLocaleString("en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  // -----------------------------
  // Auth states
  // -----------------------------
  if (checkingAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <p className="text-sm text-slate-300">Checking admin access…</p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Admin access required
          </h1>
          <p className="text-sm text-slate-300">
            {authError ||
              "You must be logged in with an admin account to view this page."}
          </p>
          <div className="flex gap-3 text-xs">
            <Link
              href="/"
              className="rounded-full border border-slate-600 px-4 py-2 font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300"
            >
              ← Back to home
            </Link>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Go to login
            </button>
          </div>
        </div>
      </main>
    );
  }

  // -----------------------------
  // MAIN RENDER
  // -----------------------------
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Deals &amp; winners overview
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              A simple read-only view of listings where a seller has chosen a
              winning envelope. Payments and payouts will plug into this later.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href="/admin"
              className="rounded-full border border-slate-700 px-3 py-1.5 font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
            >
              ← Back to admin home
            </Link>
            <Link
              href="/admin/listings"
              className="rounded-full border border-slate-700 px-3 py-1.5 font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
            >
              Listings overview
            </Link>
          </div>
        </div>

        {/* Info banner */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300 space-y-1">
          <p>
            This table only shows deals where the seller has explicitly chosen a{" "}
            <span className="font-semibold text-emerald-300">winner</span> envelope.
          </p>
          <p>
            At this stage it&apos;s informational only – we&apos;re not yet recording
            Stripe payment intents or payout status here. Once payments are wired
            up, we&apos;ll attach fee calculations and payment states to each row.
          </p>
        </section>

        {/* Deals table */}
        <section className="space-y-3">
          {loadingDeals && (
            <p className="text-xs text-slate-400">Loading deals…</p>
          )}

          {dealsError && (
            <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {dealsError}
            </div>
          )}

          {!loadingDeals && !dealsError && deals.length === 0 && (
            <p className="text-xs text-slate-400">
              No winners have been selected yet, so there are no deals to show.
            </p>
          )}

          {deals.length > 0 && (
            <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/70">
              <table className="min-w-full border-collapse text-xs">
                <thead className="bg-slate-900/90">
                  <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-2 text-left font-semibold">Listing</th>
                    <th className="px-3 py-2 text-left font-semibold">Ref</th>
                    <th className="px-3 py-2 text-left font-semibold">Seller</th>
                    <th className="px-3 py-2 text-left font-semibold">Buyer</th>
                    <th className="px-3 py-2 text-right font-semibold">Winning offer</th>
                    <th className="px-3 py-2 text-left font-semibold">Listing ended</th>
                    <th className="px-3 py-2 text-left font-semibold">Winner picked</th>
                    <th className="px-3 py-2 text-right font-semibold">Links</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((d) => (
                    <tr
                      key={d.envelopeId}
                      className="border-b border-slate-800/70 last:border-b-0 hover:bg-slate-800/40"
                    >
                      <td className="px-3 py-2 align-top text-slate-100">
                        <div className="max-w-xs truncate">{d.listingTitle}</div>
                      </td>
                      <td className="px-3 py-2 align-top font-mono text-[11px] text-slate-300">
                        {d.listingRef}
                      </td>
                      <td className="px-3 py-2 align-top text-slate-300">
                        <span className="font-mono text-[10px]">{d.sellerId}</span>
                      </td>
                      <td className="px-3 py-2 align-top text-slate-300">
                        <span className="font-mono text-[10px]">{d.buyerId}</span>
                      </td>
                      <td className="px-3 py-2 align-top text-right text-emerald-300 font-semibold">
                        £{d.amount.toLocaleString("en-GB")}
                      </td>
                      <td className="px-3 py-2 align-top text-slate-200">
                        {formatDateTime(d.endsAt)}
                      </td>
                      <td className="px-3 py-2 align-top text-slate-200">
                        {formatDateTime(d.envelopeCreatedAt)}
                      </td>
                      <td className="px-3 py-2 align-top text-right">
                        <div className="flex flex-col items-end gap-1">
                          <Link
                            href={`/listings/${d.listingId}`}
                            className="inline-flex rounded-full border border-slate-600 px-3 py-1 text-[11px] font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300"
                          >
                            View listing
                          </Link>
                          <span className="text-[9px] text-slate-500">
                            Envelope ID:{" "}
                            <span className="font-mono">{d.envelopeId}</span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
