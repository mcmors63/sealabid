// app/listings/[id]/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ID, Permission, Role } from "appwrite";
import { databases, account, storage } from "@/lib/appwriteClient";

const DB_ID = "sealabid_main_db";
const LISTINGS_COLLECTION_ID = "listings";
const BIDS_COLLECTION_ID = "bids";
const LISTING_IMAGES_BUCKET_ID = "listing_images";

type Listing = {
  $id: string;
  title: string;
  description: string;
  startingPrice?: number;
  durationDays: number;
  endsAt: string;
  status: string;
  category?: string;
  sellerId?: string;
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

export default function ListingDetailPage() {
  const params = useParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  const [listing, setListing] = useState<Listing | null>(null);
  const [loadingListing, setLoadingListing] = useState(true);
  const [listingError, setListingError] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserVerified, setCurrentUserVerified] = useState<boolean | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

  const [bidAmount, setBidAmount] = useState("");
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);

  // Load listing
  useEffect(() => {
    if (!id) {
      setListingError("Listing ID is missing.");
      setLoadingListing(false);
      return;
    }

    let cancelled = false;

    async function loadListing() {
      try {
        const doc: any = await databases.getDocument(
          DB_ID,
          LISTINGS_COLLECTION_ID,
          id
        );

        if (cancelled) return;

        setListing({
          $id: doc.$id,
          title: doc.title,
          description: doc.description,
          startingPrice: doc.startingPrice,
          durationDays: doc.durationDays,
          endsAt: doc.endsAt,
          status: doc.status,
          category: doc.category,
          sellerId: doc.sellerId,
          bidsCount: typeof doc.bidsCount === "number" ? doc.bidsCount : 0,
          imageFileIds: Array.isArray(doc.imageFileIds) ? doc.imageFileIds : [],
        });
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          const msg =
            err?.message ||
            err?.response?.message ||
            "Listing not found or failed to load.";
          setListingError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoadingListing(false);
        }
      }
    }

    loadListing();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Load current user (if any)
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const me = await account.get();
        if (!cancelled) {
          setCurrentUserId(me.$id);
          setCurrentUserName(me.name || me.email);
          // @ts-ignore
          setCurrentUserVerified(Boolean(me.emailVerification));
        }
      } catch {
        if (!cancelled) {
          setCurrentUserId(null);
          setCurrentUserName(null);
          setCurrentUserVerified(null);
        }
      } finally {
        if (!cancelled) {
          setCheckingUser(false);
        }
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handlePlaceBid(e: FormEvent) {
    e.preventDefault();
    setBidError(null);
    setBidSuccess(null);

    if (!listing) {
      setBidError("Listing not loaded.");
      return;
    }

    if (!currentUserId) {
      setBidError("You must be logged in to place a bid.");
      return;
    }

    if (!currentUserVerified) {
      setBidError("You must verify your email before placing a bid.");
      return;
    }

    if (listing.sellerId && listing.sellerId === currentUserId) {
      setBidError("You can't bid on your own listing.");
      return;
    }

    const timeInfo = timeStatus(listing.endsAt);
    if (timeInfo.ended || listing.status !== "active") {
      setBidError("This listing is no longer accepting bids.");
      return;
    }

    if (!bidAmount.trim()) {
      setBidError("Please enter your bid amount.");
      return;
    }

    const cleaned = bidAmount.replace(/[^0-9]/g, "");
    const parsed = Number(cleaned);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      setBidError("Bid must be a positive whole number of pounds.");
      return;
    }

    const amount = Math.round(parsed);

    setBidSubmitting(true);

    try {
      // 1) Create bid document (sealed)
      const sellerId = listing.sellerId || "";

      const permissions = [
        // Bidder can see their own bid
        Permission.read(Role.user(currentUserId)),
        // Seller can see bids on their listing (for envelope opening later)
        sellerId ? Permission.read(Role.user(sellerId)) : null,
        sellerId ? Permission.update(Role.user(sellerId)) : null,
        sellerId ? Permission.delete(Role.user(sellerId)) : null,
      ].filter(Boolean) as string[];

      await databases.createDocument(
        DB_ID,
        BIDS_COLLECTION_ID,
        ID.unique(),
        {
          listingId: listing.$id,
          bidderId: currentUserId,
          bidderName: currentUserName,
          amount,
        },
        permissions
      );

      // 2) Increment bidsCount on listing
      const newCount = (listing.bidsCount || 0) + 1;

      await databases.updateDocument(
        DB_ID,
        LISTINGS_COLLECTION_ID,
        listing.$id,
        {
          bidsCount: newCount,
        }
      );

      // 3) Update local state
      setListing((prev) => (prev ? { ...prev, bidsCount: newCount } : prev));

      setBidSuccess("Your sealed bid has been recorded.");
      setBidAmount("");
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.message ||
        err?.response?.message ||
        "Failed to place bid. Please try again.";
      setBidError(msg);
    } finally {
      setBidSubmitting(false);
    }
  }

  // Loading / error states
  if (loadingListing) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-xl px-4 py-10 sm:py-14">
          <p className="text-sm text-slate-300">Loading listing…</p>
        </div>
      </main>
    );
  }

  if (listingError || !listing) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-xl px-4 py-10 sm:py-14 space-y-3">
          <p className="text-sm text-red-300">
            {listingError || "Listing not found."}
          </p>
          <Link
            href="/listings"
            className="inline-flex rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
          >
            ← Back to listings
          </Link>
        </div>
      </main>
    );
  }

  const timeInfo = timeStatus(listing.endsAt);
  const categoryKey =
    (listing.category as keyof typeof CATEGORY_LABELS) || "other";
  const categoryLabel = CATEGORY_LABELS[categoryKey] || "Other";
  const bidsCount = listing.bidsCount || 0;

  const biddingClosed = timeInfo.ended || listing.status !== "active";

  const userIsSeller = currentUserId && listing.sellerId === currentUserId;

  let envelopeLabel = "No envelopes yet";
  if (bidsCount === 1) envelopeLabel = "1 envelope so far";
  if (bidsCount > 1) envelopeLabel = `${bidsCount} envelopes so far`;

  const hasImages = listing.imageFileIds && listing.imageFileIds.length > 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Sealabid listing
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {listing.title}
            </h1>
          </div>
          <Link
            href="/listings"
            className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
          >
            ← Back to listings
          </Link>
        </div>

        {/* PHOTOS */}
        {hasImages && (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
              {listing.imageFileIds!.slice(0, 1).map((fileId) => {
                const src = storage.getFilePreview(
                  LISTING_IMAGES_BUCKET_ID,
                  fileId,
                  900,
                  900
                );
                return (
                  <div
                    key={fileId}
                    className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={String(src)}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                );
              })}

              {listing.imageFileIds!.length > 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {listing.imageFileIds!.slice(1, 5).map((fileId) => {
                    const src = storage.getFilePreview(
                      LISTING_IMAGES_BUCKET_ID,
                      fileId,
                      600,
                      600
                    );
                    return (
                      <div
                        key={fileId}
                        className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={String(src)}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* MAIN CARD */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          {/* Status row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1 text-sm text-slate-200">
              <p>
                <span className="text-slate-400 text-xs uppercase tracking-wide">
                  Status:{" "}
                </span>
                <span className="font-semibold">
                  {listing.status === "active" && !timeInfo.ended
                    ? "Active"
                    : "Ended"}
                </span>
              </p>
              <p className="text-xs text-slate-400">
                Ends at: {formatEndsAt(listing.endsAt)}
              </p>
              <p className="text-xs text-slate-400">
                Category:{" "}
                <span className="font-medium text-slate-200">
                  {categoryLabel}
                </span>
              </p>
              <p className="text-xs text-slate-400">
                Envelopes:{" "}
                <span className="font-medium text-emerald-300">
                  {envelopeLabel}
                </span>
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                timeInfo.ended
                  ? "bg-slate-800 text-slate-300"
                  : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/50"
              }`}
            >
              {timeInfo.label}
            </span>
          </div>

          {/* Content + side panel */}
          <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
            <div>
              <h2 className="text-sm font-semibold text-slate-50">
                Description
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                {listing.description}
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Listing details
              </h3>
              <p className="text-slate-200">
                <span className="text-slate-400 text-xs uppercase tracking-wide">
                  Duration:
                </span>{" "}
                {listing.durationDays} days
              </p>
              <p className="text-slate-200">
                <span className="text-slate-400 text-xs uppercase tracking-wide">
                  “Make me happy” target:
                </span>{" "}
                {listing.startingPrice
                  ? `£${listing.startingPrice.toLocaleString("en-GB")}`
                  : "Seller has not set a target"}
              </p>
              <p className="text-[11px] text-slate-400">
                This “make me happy” target is private to the seller. Buyers never
                see it – it simply helps the seller decide whether sealed offers
                feel worth accepting.
              </p>
            </div>
          </div>
        </section>

        {/* PLACE BID SECTION */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 space-y-3 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            Place a sealed bid
          </h2>

          {/* Various states */}
          {biddingClosed && (
            <p className="text-xs text-slate-400">
              Bidding is closed on this listing. The seller can decide whether to
              accept one of the envelopes or mark it as no sale.
            </p>
          )}

          {!biddingClosed && userIsSeller && (
            <p className="text-xs text-slate-400">
              You&apos;re the seller for this listing. You&apos;ll see your envelopes
              when the listing ends – you can&apos;t bid on your own item.
            </p>
          )}

          {!biddingClosed &&
            !userIsSeller &&
            !checkingUser &&
            !currentUserId && (
              <p className="text-xs text-slate-400">
                To place a sealed bid you&apos;ll need an account and a verified email.{" "}
                <Link
                  href="/login"
                  className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
                >
                  Log in or register
                </Link>{" "}
                to continue.
              </p>
            )}

          {!biddingClosed &&
            currentUserId &&
            !userIsSeller &&
            currentUserVerified === false && (
              <p className="text-xs text-slate-400">
                Your email address is not verified. You must verify it before placing a
                sealed bid.{" "}
                <Link
                  href="/verify-email"
                  className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
                >
                  Verify your email.
                </Link>
              </p>
            )}

          {!biddingClosed &&
            currentUserId &&
            !userIsSeller &&
            currentUserVerified && (
              <form onSubmit={handlePlaceBid} className="space-y-3 max-w-sm">
                {bidError && (
                  <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                    {bidError}
                  </div>
                )}
                {bidSuccess && (
                  <div className="rounded-md border border-emerald-500/60 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
                    {bidSuccess}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Your sealed bid amount
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-300">£</span>
                    <input
                      type="text"
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Whole pounds only"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    You won&apos;t see other bids and there&apos;s no
                    &quot;currently winning&quot; indicator. This is what the item is
                    worth to you, not a public bidding game.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={bidSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bidSubmitting ? "Placing sealed bid..." : "Place sealed bid"}
                </button>
              </form>
            )}

          <p className="text-[11px] text-slate-500">
            When this listing ends, the seller will open all envelopes and can choose a
            buyer based on price and profile – or decide there&apos;s no sale. The
            highest amount doesn&apos;t always win.
          </p>
        </section>
      </div>
    </main>
  );
}
