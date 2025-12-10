// app/listings/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Query } from "appwrite";
import { databases, storage } from "@/lib/appwriteClient";

const DB_ID = "sealabid_main_db";
const LISTINGS_COLLECTION_ID = "listings";
const LISTING_IMAGES_BUCKET_ID = "listing_images";

type Listing = {
  $id: string;
  title: string;
  description?: string;
  durationDays: number;
  endsAt: string;
  status: string;
  category?: string;
  bidsCount?: number;
  imageFileIds?: string[];
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

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await databases.listDocuments(DB_ID, LISTINGS_COLLECTION_ID, [
          Query.orderDesc("endsAt"),
        ]);

        if (cancelled) return;

        const docs = res.documents as any[];

        const mapped: Listing[] = docs.map((doc) => ({
          $id: doc.$id,
          title: doc.title,
          description: doc.description,
          durationDays: doc.durationDays,
          endsAt: doc.endsAt,
          status: doc.status,
          category: doc.category,
          bidsCount: typeof doc.bidsCount === "number" ? doc.bidsCount : 0,
          imageFileIds: Array.isArray(doc.imageFileIds) ? doc.imageFileIds : [],
        }));

        setListings(mapped);
      } catch (err: any) {
        console.error(err);
        const msg =
          err?.message ||
          err?.response?.message ||
          "Failed to load listings. Please try again.";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Sealabid
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Current listings
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Browse items accepting sealed bids. You&apos;ll only ever see
              envelopes, never someone else&apos;s amount.
            </p>
          </div>
          <Link
            href="/sell"
            className="hidden rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 sm:inline-flex"
          >
            Sell an item
          </Link>
        </div>

        {loading && (
          <p className="text-sm text-slate-300">Loading listings…</p>
        )}

        {error && (
          <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <p className="text-sm text-slate-300">
            No listings yet. Be the first to{" "}
            <Link
              href="/sell"
              className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
            >
              list an item
            </Link>
            .
          </p>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {listings.map((listing) => {
            const timeInfo = timeStatus(listing.endsAt);
            const bidsCount = listing.bidsCount || 0;
            const hasImages =
              listing.imageFileIds && listing.imageFileIds.length > 0;
            const categoryKey =
              (listing.category as keyof typeof CATEGORY_LABELS) || "other";
            const categoryLabel = CATEGORY_LABELS[categoryKey] || "Other";

            let envelopeLabel = "No envelopes yet";
            if (bidsCount === 1) envelopeLabel = "1 envelope";
            if (bidsCount > 1) envelopeLabel = `${bidsCount} envelopes`;

            const previewSrc =
              hasImages && listing.imageFileIds
                ? storage.getFileView(
                    LISTING_IMAGES_BUCKET_ID,
                    listing.imageFileIds[0]
                  )
                : null;

            return (
              <Link
                key={listing.$id}
                href={`/listings/${listing.$id}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 hover:border-emerald-500/60 hover:bg-slate-900 transition"
              >
                {/* Image */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  {previewSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={String(previewSrc)}
                      alt={listing.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-xs text-slate-400">
                      No photos yet
                    </div>
                  )}

                  <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-100">
                    {categoryLabel}
                  </div>

                  <div
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                      timeInfo.ended
                        ? "bg-slate-900/80 text-slate-200"
                        : "bg-emerald-500/90 text-slate-950"
                    }`}
                  >
                    {timeInfo.label}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-50 line-clamp-2">
                      {listing.title}
                    </h2>
                    {listing.description && (
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                        {listing.description}
                      </p>
                    )}
                  </div>

                  {/* Envelopes */}
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Envelopes
                      </p>
                      <p className="text-xs text-emerald-300">{envelopeLabel}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {bidsCount === 0 && (
                          <span className="text-[11px] text-slate-500">
                            Be the first to bid
                          </span>
                        )}
                        {Array.from({ length: Math.min(bidsCount, 5) }).map(
                          (_, i) => (
                            <div
                              key={i}
                              className="flex h-6 w-8 items-center justify-center rounded-md border border-amber-400/60 bg-amber-500/10 text-[10px]"
                            >
                              ✉️
                            </div>
                          )
                        )}
                        {bidsCount > 5 && (
                          <span className="ml-1 text-[11px] text-amber-200">
                            +{bidsCount - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400">
                      <p className="font-semibold text-slate-100">
                        {timeInfo.ended ? "Ended" : "Active"}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Tap to see details
                      </p>
                    </div>
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
