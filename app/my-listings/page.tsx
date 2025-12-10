// app/my-listings/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Query } from "appwrite";
import { account, databases } from "@/lib/appwriteClient";

const DB_ID = "sealabid_main_db";
const LISTINGS_COLLECTION_ID = "listings";

type Listing = {
  $id: string;
  title: string;
  durationDays: number;
  endsAt: string;
  status: string;
  bidsCount?: number;
  category?: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  art: "Art & prints",
  collectibles: "Collectibles & memorabilia",
  fashion: "Fashion & accessories",
  tech: "Tech & gadgets",
  home: "Home & furnishings",
  vehicles: "Vehicles & related",
  charity: "Charity / fundraising items",
  other: "Other",
};

function timeStatus(endsAt: string) {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = end - now;

  if (Number.isNaN(end)) {
    return { label: "Unknown end time", ended: false };
  }

  if (diff <= 0) {
    return { label: "Auction ended", ended: true };
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0)
    return { label: `Ends in ${days} day${days === 1 ? "" : "s"}`, ended: false };
  if (hours > 0)
    return { label: `Ends in ${hours} hour${hours === 1 ? "" : "s"}`, ended: false };
  return { label: `Ends in ${minutes} min${minutes === 1 ? "" : "s"}`, ended: false };
}

export default function MyListingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const me = await account.get();
        if (!cancelled) {
          setUserId(me.$id);
        }
      } catch {
        if (!cancelled) {
          setUserId(null);
        }
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function loadListings() {
      try {
        setError(null);
        setLoadingListings(true);

        const res = await databases.listDocuments(
          DB_ID,
          LISTINGS_COLLECTION_ID,
          [
            // Tell TS this is definitely a string at this point
            Query.equal("sellerId", userId as string),
            Query.orderDesc("endsAt"),
          ]
        );

        if (cancelled) return;

        const docs = res.documents as any[];
        const mapped: Listing[] = docs.map((doc) => ({
          $id: doc.$id,
          title: doc.title,
          durationDays: doc.durationDays,
          endsAt: doc.endsAt,
          status: doc.status,
          bidsCount: typeof doc.bidsCount === "number" ? doc.bidsCount : 0,
          category: doc.category,
        }));

        setListings(mapped);
      } catch (err: any) {
        console.error(err);
        const msg =
          err?.message ||
          err?.response?.message ||
          "Failed to load your listings.";
        setError(msg);
      } finally {
        if (!cancelled) setLoadingListings(false);
      }
    }

    loadListings();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
          <p className="text-sm text-slate-300">Checking your account…</p>
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 space-y-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Your listings
          </h1>
          <p className="text-sm text-slate-300">
            You need to be logged in to see the items you&apos;ve listed.
          </p>
          <Link
            href="/login"
            className="inline-flex rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Log in
          </Link>
        </div>
      </main>
    );
  }

  const active = listings.filter((l) => l.status === "active");
  const ended = listings.filter((l) => l.status !== "active");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Sealabid
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Your listings
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              See items you&apos;ve put up for sealed bids, how many envelopes
              they have, and when they end.
            </p>
          </div>
          <Link
            href="/sell"
            className="hidden rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 sm:inline-flex"
          >
            Sell another item
          </Link>
        </div>

        {loadingListings && (
          <p className="text-sm text-slate-300">Loading your listings…</p>
        )}

        {error && (
          <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}

        {!loadingListings && listings.length === 0 && !error && (
          <p className="text-sm text-slate-300">
            You haven&apos;t listed anything yet.{" "}
            <Link
              href="/sell"
              className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
            >
              Sell your first item
            </Link>
            .
          </p>
        )}

        {active.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">
              Active listings
            </h2>
            <div className="space-y-3">
              {active.map((l) => {
                const t = timeStatus(l.endsAt);
                const bids = l.bidsCount || 0;
                const categoryKey =
                  (l.category as keyof typeof CATEGORY_LABELS) || "other";
                const categoryLabel =
                  CATEGORY_LABELS[categoryKey] || "Other";

                return (
                  <Link
                    key={l.$id}
                    href={`/listings/${l.$id}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm hover:border-emerald-500/60 hover:bg-slate-900"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-50">{l.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {categoryLabel} • {t.label}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <p className="font-semibold text-emerald-300">
                        {bids} envelope{bids === 1 ? "" : "s"}
                      </p>
                      <div className="mt-1 flex justify-end gap-1">
                        {Array.from({ length: Math.min(bids, 4) }).map((_, i) => (
                          <div
                            key={i}
                            className="flex h-5 w-7 items-center justify-center rounded-md border border-amber-400/60 bg-amber-500/10 text-[9px]"
                          >
                            ✉️
                          </div>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {ended.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">
              Ended listings
            </h2>
            <div className="space-y-3">
              {ended.map((l) => {
                const t = timeStatus(l.endsAt);
                const bids = l.bidsCount || 0;
                const categoryKey =
                  (l.category as keyof typeof CATEGORY_LABELS) || "other";
                const categoryLabel =
                  CATEGORY_LABELS[categoryKey] || "Other";

                return (
                  <Link
                    key={l.$id}
                    href={`/listings/${l.$id}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm hover:border-slate-700"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-50">{l.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {categoryLabel} • {t.label}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <p className="font-semibold text-slate-200">
                        {bids} envelope{bids === 1 ? "" : "s"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
