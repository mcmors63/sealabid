// app/listings/[id]/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Query, ID } from "appwrite";
import { databases, account, storage } from "@/lib/appwriteClient";
import EnvelopePanel from "@/components/EnvelopePanel";

const DB_ID = "sealabid_main_db";
const LISTINGS_COLLECTION_ID = "listings";
const LISTING_IMAGES_BUCKET_ID = "listing_images";

// Envelopes live in the same DB but their own collection
const ENVELOPES_DB_ID = process.env.NEXT_PUBLIC_APPWRITE_ENVELOPES_DB_ID!;
const ENVELOPES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_ENVELOPES_COLLECTION_ID!;

// New collection for abuse reports
const ABUSE_REPORTS_COLLECTION_ID = "abuse_reports";

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
  sellerId?: string;
  bidsCount?: number;
  imageFileIds?: string[];
};

type EnvelopeStatus = "submitted" | "withdrawn" | "winner" | "rejected";

type EnvelopeDoc = {
  $id: string;
  listingId: string;
  buyerId: string;
  amount: number;
  message?: string;
  status: EnvelopeStatus;
  $createdAt: string;
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

// Live time helper – takes "now" as a parameter so we can update it
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
  const [currentUserVerified, setCurrentUserVerified] = useState<boolean | null>(
    null
  );
  const [checkingUser, setCheckingUser] = useState(true);

  // "Now" for the live timer
  const [nowMs, setNowMs] = useState<number>(Date.now());

  // Seller envelopes state
  const [envelopes, setEnvelopes] = useState<EnvelopeDoc[]>([]);
  const [envelopesLoading, setEnvelopesLoading] = useState(false);
  const [envelopesError, setEnvelopesError] = useState<string | null>(null);
  const [choosingWinnerId, setChoosingWinnerId] = useState<string | null>(null);

  // Abuse report state
  const [reportingEnvelope, setReportingEnvelope] =
    useState<EnvelopeDoc | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  // -----------------------------
  // Load listing
  // -----------------------------
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
          reference: doc.reference || doc.$id,
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

  // -----------------------------
  // Load current user (if any)
  // -----------------------------
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

  // -----------------------------
  // Live timer – tick every second while active
  // -----------------------------
  useEffect(() => {
    if (!listing) return;

    const end = new Date(listing.endsAt).getTime();
    if (Number.isNaN(end)) return;
    if (end <= Date.now()) return; // already ended

    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [listing?.endsAt, listing]);

  const timeInfo = listing ? timeStatus(listing.endsAt, nowMs) : null;
  const categoryKey =
    listing && listing.category
      ? ((listing.category as keyof typeof CATEGORY_LABELS) || "other")
      : "other";
  const categoryLabel = CATEGORY_LABELS[categoryKey] || "Other";
  const bidsCount = listing?.bidsCount || 0;

  const biddingClosed =
    !!listing && !!timeInfo && (timeInfo.ended || listing.status !== "active");
  const userIsSeller =
    !!listing && !!currentUserId && listing.sellerId === currentUserId;

  // Wording identical to listings page
  let envelopeLabel = "No post delivered";
  if (bidsCount === 1) {
    envelopeLabel = "This item has received 1 sealed bid";
  } else if (bidsCount > 1) {
    envelopeLabel = `This item has received ${bidsCount} sealed bids`;
  }

  const hasImages =
    listing && listing.imageFileIds && listing.imageFileIds.length > 0;

  const countdownString =
    timeInfo && !timeInfo.ended
      ? `${String(timeInfo.days).padStart(2, "0")}d ${String(
          timeInfo.hours
        ).padStart(2, "0")}h ${String(timeInfo.minutes).padStart(
          2,
          "0"
        )}m ${String(timeInfo.seconds).padStart(2, "0")}s`
      : "00d 00h 00m 00s";

  // -----------------------------
  // Load envelopes for seller (AFTER deadline only)
  // -----------------------------
  useEffect(() => {
    if (!listing || !currentUserId) return;
    if (listing.sellerId !== currentUserId) return;

    // If the deadline hasn't passed yet, don't show envelopes
    const endsMs = new Date(listing.endsAt).getTime();
    if (!Number.isFinite(endsMs) || endsMs > Date.now()) {
      return;
    }

    const listingIdForQuery = listing.$id; // non-null after guards
    let cancelled = false;

    async function loadEnvelopes() {
      setEnvelopesLoading(true);
      setEnvelopesError(null);
      try {
        const res: any = await databases.listDocuments(
          ENVELOPES_DB_ID,
          ENVELOPES_COLLECTION_ID,
          [
            Query.equal("listingId", listingIdForQuery),
            Query.orderDesc("$createdAt"),
          ]
        );

        if (cancelled) return;

        const docs: EnvelopeDoc[] = res.documents || [];
        setEnvelopes(docs);
      } catch (err: any) {
        if (!cancelled) {
          console.error("Error loading envelopes", err);
          setEnvelopesError(
            err?.message ||
              err?.response?.message ||
              "Could not load envelopes for this listing."
          );
        }
      } finally {
        if (!cancelled) setEnvelopesLoading(false);
      }
    }

    loadEnvelopes();
    return () => {
      cancelled = true;
    };
  }, [listing?.$id, listing?.sellerId, listing?.endsAt, currentUserId]);

  // -----------------------------
  // Seller chooses a winner
  // -----------------------------
  async function handleChooseWinner(envelopeId: string) {
    if (!listing || !currentUserId) return;
    if (listing.sellerId !== currentUserId) return;

    const ok = window.confirm(
      "Confirm this buyer as your chosen winner? All other envelopes will be marked as rejected."
    );
    if (!ok) return;

    setEnvelopesError(null);
    setChoosingWinnerId(envelopeId);

    try {
      const updates = envelopes.map(async (env) => {
        if (env.$id === envelopeId) {
          await databases.updateDocument(
            ENVELOPES_DB_ID,
            ENVELOPES_COLLECTION_ID,
            env.$id,
            { status: "winner" }
          );
        } else {
          await databases.updateDocument(
            ENVELOPES_DB_ID,
            ENVELOPES_COLLECTION_ID,
            env.$id,
            { status: "rejected" }
          );
        }
      });

      await Promise.all(updates);

      // Reload envelopes after updates
      const res: any = await databases.listDocuments(
        ENVELOPES_DB_ID,
        ENVELOPES_COLLECTION_ID,
        [
          Query.equal("listingId", listing.$id),
          Query.orderDesc("$createdAt"),
        ]
      );
      setEnvelopes(res.documents || []);
    } catch (err: any) {
      console.error("Error choosing winner", err);
      setEnvelopesError(
        err?.message ||
          err?.response?.message ||
          "Could not update envelopes. Please try again."
      );
    } finally {
      setChoosingWinnerId(null);
    }
  }

  // -----------------------------
  // Abuse reporting
  // -----------------------------
  function handleOpenReport(env: EnvelopeDoc) {
    setReportingEnvelope(env);
    setReportReason("");
    setReportSuccess(null);
    setEnvelopesError(null);
  }

  async function handleSubmitReport(e: FormEvent) {
    e.preventDefault();
    if (!listing || !currentUserId || !reportingEnvelope) return;

    const trimmed = reportReason.trim();
    if (!trimmed) {
      setEnvelopesError("Please describe what happened.");
      return;
    }

    setReportSubmitting(true);
    setEnvelopesError(null);
    setReportSuccess(null);

    try {
      await databases.createDocument(
        DB_ID,
        ABUSE_REPORTS_COLLECTION_ID,
        ID.unique(),
        {
          listingId: listing.$id,
          envelopeId: reportingEnvelope.$id,
          sellerId: currentUserId,
          buyerId: reportingEnvelope.buyerId,
          message: reportingEnvelope.message || "",
          reason: trimmed,
          status: "open",
          createdAt: new Date().toISOString(),
        }
      );

      setReportSuccess("Thank you. Your report has been submitted.");
      setReportingEnvelope(null);
      setReportReason("");
    } catch (err: any) {
      console.error("Error submitting abuse report", err);
      setEnvelopesError(
        err?.message ||
          err?.response?.message ||
          "Could not submit report. Please try again."
      );
    } finally {
      setReportSubmitting(false);
    }
  }

  // -----------------------------
  // Loading / error states
  // -----------------------------
  if (loadingListing) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-xl px-4 py-10 sm:py-14">
          <p className="text-sm text-slate-300">Loading listing…</p>
        </div>
      </main>
    );
  }

  if (listingError || !listing || !timeInfo) {
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

  // Small helpers for seller envelopes
  const winnerEnvelope = envelopes.find((e) => e.status === "winner");
  const activeEnvelopes = envelopes.filter(
    (e) => e.status === "submitted" || e.status === "winner"
  );
  const totalSubmitted = envelopes.filter(
    (e) =>
      e.status === "submitted" ||
      e.status === "winner" ||
      e.status === "rejected"
  ).length;

  // -----------------------------
  // RENDER
  // -----------------------------
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
            <p className="mt-1 text-[11px] text-slate-400 font-mono">
              Ref: {listing.reference}
            </p>
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
                const src = storage.getFileView(
                  LISTING_IMAGES_BUCKET_ID,
                  fileId
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
                    const src = storage.getFileView(
                      LISTING_IMAGES_BUCKET_ID,
                      fileId
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

              {/* Post / sealed bid row – same style as listings page */}
              <div className="flex items-center justify-between text-[11px] mt-1">
                <div className="flex items-center gap-2 text-slate-400">
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

                {!timeInfo.ended && (
                  <span className="font-mono text-[10px] text-slate-300">
                    {countdownString}
                  </span>
                )}
              </div>
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
                  Reference:
                </span>{" "}
                <span className="font-mono">{listing.reference}</span>
              </p>
              {/* NOTE: no "make me happy" target on the public listing page */}
            </div>
          </div>
        </section>

        {/* BUYER PLACE BID SECTION */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 space-y-3 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            Place a sealed bid
          </h2>

          {/* Various states */}
          {biddingClosed && (
            <p className="text-xs text-slate-400">
              Bidding is closed on this listing. The seller can decide whether
              to accept one of the envelopes or mark it as no sale.
            </p>
          )}

          {!biddingClosed && userIsSeller && (
            <p className="text-xs text-slate-400">
              You&apos;re the seller for this listing. You&apos;ll see your
              envelopes after the sealed-bid window has closed – you can&apos;t
              bid on your own item.
            </p>
          )}

          {!biddingClosed &&
            !userIsSeller &&
            !checkingUser &&
            !currentUserId && (
              <p className="text-xs text-slate-400">
                To place a sealed bid you&apos;ll need an account and a verified
                email.{" "}
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
                Your email address is not verified. You must verify it before
                placing a sealed bid.{" "}
                <Link
                  href="/verify-email"
                  className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
                >
                  Verify your email.
                </Link>
              </p>
            )}

          {/* Envelope panel for eligible buyers */}
          {!biddingClosed &&
            currentUserId &&
            !userIsSeller &&
            currentUserVerified && (
              <div className="mt-2">
                <EnvelopePanel listingId={listing.$id} deadline={listing.endsAt} />
              </div>
            )}

          <p className="text-[11px] text-slate-500">
            When this listing ends, the seller will open all envelopes and can
            choose a buyer based on price and profile – or decide there&apos;s
            no sale. The highest amount doesn&apos;t always win.
          </p>
        </section>

        {/* SELLER ENVELOPE REVIEW SECTION */}
        {userIsSeller && (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 space-y-3 text-sm text-slate-200">
            <h2 className="text-sm font-semibold text-slate-50">
              Envelopes for this listing
            </h2>

            {!timeInfo.ended && (
              <p className="text-xs text-slate-400">
                You&apos;ll see all envelopes here once the sealed-bid window
                has ended. Until then, they stay sealed.
              </p>
            )}

            {timeInfo.ended && (
              <>
                {envelopesLoading && (
                  <p className="text-xs text-slate-400">Loading envelopes…</p>
                )}

                {envelopesError && (
                  <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                    {envelopesError}
                  </div>
                )}

                {!envelopesLoading && !envelopesError && envelopes.length === 0 && (
                  <p className="text-xs text-slate-400">
                    No envelopes were submitted for this listing.
                  </p>
                )}

                {!envelopesLoading && envelopes.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Total envelopes (including rejected/withdrawn):{" "}
                        <span className="font-medium text-slate-200">
                          {envelopes.length}
                        </span>
                      </span>
                      {winnerEnvelope && (
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300 border border-emerald-500/50">
                          Winner chosen
                        </span>
                      )}
                    </div>

                    {winnerEnvelope && (
                      <div className="rounded-2xl border border-emerald-500/60 bg-emerald-950/30 px-3 py-3 text-xs text-emerald-50">
                        <p className="font-semibold text-emerald-200">
                          Your chosen buyer
                        </p>
                        <p className="mt-1">
                          Amount:{" "}
                          <span className="font-semibold">
                            £{winnerEnvelope.amount.toLocaleString("en-GB")}
                          </span>
                        </p>
                        <p className="mt-1 text-[11px] text-emerald-100/80">
                          Buyer ID (internal):{" "}
                          <span className="font-mono">
                            {winnerEnvelope.buyerId}
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {envelopes.map((env) => {
                        const created = new Date(env.$createdAt);
                        const statusLabel =
                          env.status === "submitted"
                            ? "Submitted"
                            : env.status === "withdrawn"
                            ? "Withdrawn"
                            : env.status === "winner"
                            ? "Winner"
                            : "Rejected";

                        const statusClasses =
                          env.status === "winner"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/60"
                            : env.status === "withdrawn"
                            ? "bg-slate-800 text-slate-300 border-slate-600/80"
                            : env.status === "rejected"
                            ? "bg-red-500/10 text-red-300 border-red-500/60"
                            : "bg-slate-800 text-slate-200 border-slate-600/80";

                        return (
                          <div
                            key={env.$id}
                            className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-xs text-slate-400">
                                  Offer amount
                                </p>
                                <p className="text-sm font-semibold text-slate-50">
                                  £{env.amount.toLocaleString("en-GB")}
                                </p>
                              </div>
                              <span
                                className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusClasses}`}
                              >
                                {statusLabel}
                              </span>
                            </div>

                            {env.message && (
                              <div>
                                <p className="text-[11px] text-slate-400">
                                  Buyer message
                                </p>
                                <p className="mt-1 text-xs text-slate-200 whitespace-pre-wrap">
                                  {env.message}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReport(env)}
                                  className="mt-2 inline-flex items-center rounded-full border border-rose-500/60 bg-rose-950/40 px-3 py-1.5 text-[11px] font-semibold text-rose-100 hover:border-rose-400"
                                >
                                  Report abuse
                                </button>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span className="font-mono">
                                Buyer ID: {env.buyerId}
                              </span>
                              <span>
                                Submitted:{" "}
                                {created.toLocaleString("en-GB", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </span>
                            </div>

                            {timeInfo.ended &&
                              env.status === "submitted" &&
                              !winnerEnvelope && (
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleChooseWinner(env.$id)}
                                    disabled={
                                      choosingWinnerId !== null ||
                                      envelopesLoading
                                    }
                                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {choosingWinnerId === env.$id
                                      ? "Choosing winner…"
                                      : "Choose this buyer as winner"}
                                  </button>
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {reportingEnvelope && (
                  <div className="mt-4 rounded-2xl border border-rose-500/60 bg-rose-950/40 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-rose-50">
                          Report abusive message
                        </p>
                        <p className="mt-1 text-[11px] text-rose-100">
                          This sends us the buyer&apos;s message and your
                          explanation so we can review it.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReportingEnvelope(null);
                          setReportReason("");
                          setReportSuccess(null);
                        }}
                        className="text-[11px] text-rose-100 hover:text-rose-50"
                      >
                        Close ✕
                      </button>
                    </div>

                    {reportingEnvelope.message && (
                      <div className="rounded-xl border border-rose-500/50 bg-rose-950/70 px-3 py-2">
                        <p className="text-[11px] font-semibold text-rose-50 mb-1">
                          Message being reported
                        </p>
                        <p className="text-[12px] text-rose-50 whitespace-pre-wrap">
                          {reportingEnvelope.message}
                        </p>
                      </div>
                    )}

                    <form onSubmit={handleSubmitReport} className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-rose-50">
                          What&apos;s the issue?
                        </label>
                        <textarea
                          className="mt-1 w-full rounded-md border border-rose-400/70 bg-rose-950/70 px-3 py-2 text-sm text-rose-50 outline-none focus:border-rose-200"
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          placeholder="e.g. Threatening language, harassment, hate speech…"
                          rows={3}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={reportSubmitting}
                        className="inline-flex items-center justify-center rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-rose-950 shadow-md shadow-rose-500/30 hover:bg-rose-400 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {reportSubmitting
                          ? "Submitting report…"
                          : "Submit report"}
                      </button>

                      {reportSuccess && (
                        <p className="text-[11px] text-rose-100">
                          {reportSuccess}
                        </p>
                      )}
                    </form>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
