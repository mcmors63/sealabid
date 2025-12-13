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
  reference: string;
  title: string;
  description: string;
  startingPrice?: number;
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

function formatEndsAt(endsAt: string) {
  const d = new Date(endsAt);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Same helper as item page – but takes "now" so we can tick every second
function timeStatus(endsAt: string, nowMs: number = Date.now()) {
  const end = new Date(endsAt).getTime();

  if (Number.isNaN(end)) {
    return {
      label: "Unknown end time",
      ended: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const diff = end - nowMs;

  if (diff <= 0) {
    return {
      label: "Auction ended",
      ended: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  let label: string;
  if (days > 0) {
    label = `Ends in ${days} day${days === 1 ? "" : "s"}`;
  } else if (hours > 0) {
    label = `Ends in ${hours} hour${hours === 1 ? "" : "s"}`;
  } else if (minutes > 0) {
    label = `Ends in ${minutes} min${minutes === 1 ? "" : "s"}`;
  } else {
    label = `Ends in ${seconds} sec${seconds === 1 ? "" : "s"}`;
  }

  return {
    label,
    ended: false,
    days,
    hours,
    minutes,
    seconds,
  };
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shared "now" so all cards tick once per second
  const [nowMs, setNowMs] = useState<number>(Date.now());

  // Load listings
  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      setLoading(true);
      setError(null);
      try {
        const res: any = await databases.listDocuments(
          DB_ID,
          LISTINGS_COLLECTION_ID,
          [Query.equal("status", "active"), Query.orderAsc("endsAt")]
        );

        if (cancelled) return;

        const docs = res.documents || [];
        const mapped: Listing[] = docs.map((doc: any) => ({
          $id: doc.$id,
          reference: doc.reference || doc.$id,
          title: doc.title,
          description: doc.description,
          startingPrice: doc.startingPrice,
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
          err?.message || err?.response?.message || "Failed to load listings.";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadListings();

    return () => {
      cancelled = true;
    };
  }, []);

  // Live tick
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
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
            <p className="mt-1 text-xs text-slate-400 max-w-xl">
              Each item is running a sealed-envelope window. Place the value it
              has to you – not a penny more, not a penny less.
            </p>
          </div>
          <Link
            href="/sell"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400"
          >
            List an item
          </Link>
        </div>

        {loading && (
          <p className="text-sm text-slate-300">Loading listings…</p>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <p className="text-sm text-slate-300">
            No active listings right now. Check back soon.
          </p>
        )}

        {!loading && !error && listings.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => {
              const timeInfo = timeStatus(listing.endsAt, nowMs);
              const categoryKey =
                (listing.category as keyof typeof CATEGORY_LABELS) || "other";
              const categoryLabel = CATEGORY_LABELS[categoryKey] || "Other";
              const bidsCount = listing.bidsCount || 0;

              // Same wording as item page
              let envelopeLabel = "No post delivered";
              if (bidsCount === 1) {
                envelopeLabel = "This item has received 1 sealed bid";
              } else if (bidsCount > 1) {
                envelopeLabel = `This item has received ${bidsCount} sealed bids`;
              }

              const countdownString = !timeInfo.ended
                ? `${String(timeInfo.days).padStart(2, "0")}d ${String(
                    timeInfo.hours
                  ).padStart(2, "0")}h ${String(timeInfo.minutes).padStart(
                    2,
                    "0"
                  )}m ${String(timeInfo.seconds).padStart(2, "0")}s`
                : "00d 00h 00m 00s";

              const hasImages =
                listing.imageFileIds && listing.imageFileIds.length > 0;

              let mainImageUrl: string | null = null;
              if (hasImages) {
                const fileId = listing.imageFileIds![0];
                const viewUrl = storage.getFileView(
                  LISTING_IMAGES_BUCKET_ID,
                  fileId
                );
                mainImageUrl = String(viewUrl);
              }

              return (
                <Link
                  key={listing.$id}
                  href={`/listings/${listing.$id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 hover:border-emerald-400/60 transition-colors"
                >
                  {/* IMAGE AREA */}
                  <div className="relative h-40 w-full overflow-hidden border-b border-slate-800 bg-slate-950">
                    {mainImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mainImageUrl}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                        <span className="text-[11px] font-medium text-slate-400">
                          No image yet
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CARD CONTENT */}
                  <div className="flex flex-1 flex-col p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-wide text-slate-400">
                          {categoryLabel}
                        </p>
                        <h2 className="text-sm font-semibold text-slate-50 line-clamp-2">
                          {listing.title}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Ref: {listing.reference}
                        </p>
                      </div>
                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                          timeInfo.ended
                            ? "bg-slate-800 text-slate-300"
                            : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/50"
                        }`}
                      >
                        {timeInfo.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-3">
                      {listing.description}
                    </p>

                    <div className="mt-auto space-y-2 pt-1">
                      {/* Ends at */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          Ends:{" "}
                          <span className="font-medium text-slate-200">
                            {formatEndsAt(listing.endsAt)}
                          </span>
                        </span>
                      </div>

                      {/* Post / sealed bid */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="whitespace-nowrap">Post:</span>
                        <span className="font-medium text-emerald-300">
                          {envelopeLabel}
                        </span>

                        {bidsCount > 0 && (
                          <div className="inline-flex items-center gap-2 rounded-md border border-amber-400 bg-amber-50 px-3 py-1 shadow-sm">
                            <svg
                              viewBox="0 0 24 16"
                              aria-hidden="true"
                              className="h-4 w-6"
                            >
                              <rect
                                x={1}
                                y={1}
                                width={22}
                                height={14}
                                rx={2}
                                fill="#FEF3C7"
                                stroke="#D97706"
                                strokeWidth={1.2}
                              />
                              <polyline
                                points="2,2 12,9 22,2"
                                fill="none"
                                stroke="#B45309"
                                strokeWidth={1.2}
                              />
                            </svg>
                            <span className="text-[9px] font-semibold uppercase tracking-wide text-amber-900">
                              Sealed bid
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Live countdown */}
                      {!timeInfo.ended && (
                        <p className="text-[11px] text-slate-400">
                          Live countdown:{" "}
                          <span className="font-mono text-emerald-300">
                            {countdownString}
                          </span>
                        </p>
                      )}

                      {/* 🔕 No "make me happy" target shown here anymore */}
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
