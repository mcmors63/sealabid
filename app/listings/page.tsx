// app/listings/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Query } from "appwrite";
import { databases } from "@/lib/appwriteClient";

const DB_ID = "sealabid_main_db";
const LISTINGS_COLLECTION_ID = "listings";

type Listing = {
  $id: string;
  title: string;
  description: string;
  startingPrice?: number;
  durationDays: number;
  endsAt: string;
  status: string;
  category?: string;
  bidsCount?: number;
};

type CategoryFilter =
  | "all"
  | "art"
  | "collectibles"
  | "fashion"
  | "tech"
  | "home"
  | "vehicles"
  | "charity"
  | "other";

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

function timeRemainingLabel(endsAt: string) {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = end - now;

  if (Number.isNaN(end)) return "Unknown end time";

  if (diff <= 0) return "Ended";

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `Ends in ${days} day${days === 1 ? "" : "s"}`;
  if (hours > 0) return `Ends in ${hours} hour${hours === 1 ? "" : "s"}`;
  return `Ends in ${minutes} min${minutes === 1 ? "" : "s"}`;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      try {
        const res = await databases.listDocuments(
          DB_ID,
          LISTINGS_COLLECTION_ID,
          [Query.equal("status", "active"), Query.orderAsc("endsAt")]
        );

        if (cancelled) return;

        const docs = res.documents as any[];

        const mapped: Listing[] = docs.map((doc) => ({
          $id: doc.$id,
          title: doc.title,
          description: doc.description,
          startingPrice: doc.startingPrice,
          durationDays: doc.durationDays,
          endsAt: doc.endsAt,
          status: doc.status,
          category: doc.category,
          bidsCount:
            typeof doc.bidsCount === "number" ? doc.bidsCount : 0,
        }));

        setListings(mapped);
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          const msg =
            err?.message ||
            err?.response?.message ||
            "Failed to load listings.";
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadListings();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return listings.filter((listing) => {
      // Category filter
      if (categoryFilter !== "all") {
        const cat = (listing.category || "other") as CategoryFilter;
        if (cat !== categoryFilter) return false;
      }

      // Text search (title + description)
      if (q) {
        const haystack =
          (listing.title || "").toLowerCase() +
          " " +
          (listing.description || "").toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [listings, categoryFilter, searchQuery]);

  const total = listings.length;
  const shown = filteredListings.length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Browse <span className="text-emerald-400">listings</span>
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl">
              These are active Sealabid listings. Bids are sealed – you
              won&apos;t see what anyone else has offered. When time is up, the
              seller chooses a buyer based on price and profile.
            </p>
          </div>
          <Link
            href="/sell"
            className="inline-flex rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Sell an item
          </Link>
        </div>

        {/* Filters */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`rounded-full px-3 py-1.5 font-medium transition ${
                  categoryFilter === "all"
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                All
              </button>
              {[
                "art",
                "collectibles",
                "fashion",
                "tech",
                "home",
                "vehicles",
                "charity",
                "other",
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat as CategoryFilter)}
                  className={`rounded-full px-3 py-1.5 font-medium transition ${
                    categoryFilter === cat
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title or description…"
                className="w-full rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-50 outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Showing{" "}
            <span className="font-semibold text-emerald-300">
              {shown}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-200">
              {total}
            </span>{" "}
            active listing{total === 1 ? "" : "s"}.
          </p>
        </section>

        {/* Loading / error / empty states */}
        {loading && (
          <p className="text-sm text-slate-300">Loading listings…</p>
        )}

        {error && (
          <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && total === 0 && (
          <p className="text-sm text-slate-300">
            There are no active listings yet. Be the first to{" "}
            <Link
              href="/sell"
              className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
            >
              create one
            </Link>
            .
          </p>
        )}

        {!loading && !error && total > 0 && shown === 0 && (
          <p className="text-sm text-slate-300">
            Nothing matches your filters. Try a different category or clear your
            search.
          </p>
        )}

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => {
            const timeLabel = timeRemainingLabel(listing.endsAt);
            const categoryKey =
              (listing.category as keyof typeof CATEGORY_LABELS) || "other";
            const categoryLabel =
              CATEGORY_LABELS[categoryKey] || "Other";
            const bidsCount = listing.bidsCount || 0;

            let envelopeLabel = "No envelopes yet";
            if (bidsCount === 1) envelopeLabel = "1 envelope";
            if (bidsCount > 1) envelopeLabel = `${bidsCount} envelopes`;

            return (
              <Link
                key={listing.$id}
                href={`/listings/${listing.$id}`}
                className="group rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-900/60 hover:border-emerald-400 hover:shadow-emerald-500/20 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-semibold text-slate-50 line-clamp-2 group-hover:text-emerald-200">
                    {listing.title}
                  </h2>
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                    {timeLabel}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400 line-clamp-3">
                  {listing.description}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-200">
                      {listing.startingPrice
                        ? `Make me happy: £${listing.startingPrice.toLocaleString(
                            "en-GB"
                          )}`
                        : "No “make me happy” target"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {categoryLabel} · {listing.durationDays} days
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-emerald-300">
                    <p>{envelopeLabel}</p>
                    <p className="text-slate-400 group-hover:text-emerald-200">
                      View details →
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
