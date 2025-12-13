// app/dashboard/listings/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Query } from "appwrite";
import { account, databases } from "@/lib/appwriteClient";

const DB_ID = "sealabid_main_db";
const LISTINGS_COLLECTION_ID = "listings";

// Use the same env vars as EnvelopePanel
const ENVELOPES_DB_ID =
  process.env.NEXT_PUBLIC_APPWRITE_ENVELOPES_DB_ID || DB_ID;
const ENVELOPES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_ENVELOPES_COLLECTION_ID || "envelopes";

type EnvelopeStatus = "submitted" | "withdrawn" | "winner" | "rejected";

type Listing = {
  $id: string;
  title?: string;
  endsAt?: string;
  status?: string;
  sellerId?: string;
  winnerBidId?: string | null;
  dealStatus?: string | null;
};

type Envelope = {
  $id: string;
  listingId: string;
  buyerId: string;
  amount: number;
  message?: string;
  status: EnvelopeStatus;
  $createdAt?: string;
};

export default function ReviewListingBidsPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id as string | string[] | undefined;
  const listingId = Array.isArray(rawId) ? rawId[0] : rawId || "";

  const [user, setUser] = useState<any | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------
  // Load user, listing, envelopes
  // -----------------------------
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!listingId) return;

      try {
        setLoading(true);
        setError(null);

        // 1) Get logged-in user
        const me = await account.get();
        if (cancelled) return;
        setUser(me);

        // 2) Load listing
        const listingDoc = await databases.getDocument(
          DB_ID,
          LISTINGS_COLLECTION_ID,
          listingId
        );
        if (cancelled) return;

        const l = listingDoc as unknown as Listing;

        // Only seller can view this
        if (l.sellerId && l.sellerId !== me.$id) {
          setError("This listing does not belong to your account.");
          setLoading(false);
          return;
        }

        setListing(l);

        // 3) Load envelopes for this listing (highest amount first)
        const envRes = await databases.listDocuments<Envelope>(
          ENVELOPES_DB_ID,
          ENVELOPES_COLLECTION_ID,
          [
            Query.equal("listingId", listingId),
            Query.orderDesc("amount"),
          ]
        );

        if (cancelled) return;

        setEnvelopes(envRes.documents as any as Envelope[]);
      } catch (err: any) {
        console.error("Error loading listing/envelopes:", err);
        if (err?.code === 401) {
          router.push("/login");
          return;
        }
        setError(
          err?.message ||
            err?.response?.message ||
            "We couldn't load this listing or its sealed envelopes."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [listingId, router]);

  // -----------------------------
  // Helpers
  // -----------------------------
  const formatDateTime = (value?: string) => {
    if (!value) return "Not set";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount?: number) => {
    if (typeof amount !== "number") return "£—";
    return `£${amount.toLocaleString("en-GB", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const deadline = listing?.endsAt ? new Date(listing.endsAt) : null;
  const now = new Date();
  const canDecideTime = deadline ? deadline <= now : true;
  const winnerId = listing?.winnerBidId || null;

  // -----------------------------
  // Accept a chosen envelope
  // -----------------------------
  const handleAccept = async (envelopeId: string) => {
    if (!listing) return;

    const selected = envelopes.find((e) => e.$id === envelopeId);
    if (!selected) return;

    const ok = window.confirm(
      `Accept this sealed bid of ${formatAmount(
        selected.amount
      )}? This will choose this buyer and mark other envelopes as not selected.`
    );
    if (!ok) return;

    try {
      setAcceptingId(envelopeId);
      setError(null);

      // 1) Update listing: mark winner + deal in progress
      const updatedListing = await databases.updateDocument(
        DB_ID,
        LISTINGS_COLLECTION_ID,
        listing.$id,
        {
          winnerBidId: envelopeId,
          dealStatus: "deal_in_progress",
        }
      );

      // 2) Mark chosen envelope as winner
      await databases.updateDocument(
        ENVELOPES_DB_ID,
        ENVELOPES_COLLECTION_ID,
        envelopeId,
        {
          status: "winner",
        }
      );

      // 3) Mark other envelopes as rejected (except withdrawn)
      const others = envelopes.filter((e) => e.$id !== envelopeId);
      await Promise.all(
        others.map((e) =>
          e.status === "withdrawn"
            ? Promise.resolve()
            : databases.updateDocument(
                ENVELOPES_DB_ID,
                ENVELOPES_COLLECTION_ID,
                e.$id,
                {
                  status: "rejected",
                }
              )
        )
      );

      // 4) Update local state
      setListing(updatedListing as unknown as Listing);
      setEnvelopes((prev) =>
        prev.map((e) =>
          e.$id === envelopeId
            ? { ...e, status: "winner" }
            : e.status === "withdrawn"
            ? e
            : { ...e, status: "rejected" }
        )
      );
    } catch (err: any) {
      console.error("Error accepting envelope:", err);
      setError(
        err?.message ||
          err?.response?.message ||
          "We couldn't accept that bid. Please try again."
      );
    } finally {
      setAcceptingId(null);
    }
  };

  // -----------------------------
  // Render states
  // -----------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <p className="text-sm text-slate-300">
            Loading listing and sealed envelopes…
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-md px-4 py-10 sm:py-14">
          <div className="space-y-3 rounded-2xl border border-red-700/60 bg-red-950/40 p-4 text-sm text-red-100">
            <p>{error}</p>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
            >
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-6">
        {/* Top nav */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <Link
              href="/dashboard"
              className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200"
            >
              ← Back to dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Review sealed bids
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              This view is only visible to you as the seller. Buyers never see
              each other&apos;s envelopes.
            </p>
          </div>
        </div>

        {/* Listing summary */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Listing
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-50">
            {listing.title || "(Untitled listing)"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Ends at:{" "}
            <span className="font-medium text-slate-100">
              {formatDateTime(listing.endsAt)}
            </span>
          </p>
          {deadline && deadline > now && (
            <p className="mt-2 text-xs text-amber-300">
              Offers are still open. You&apos;ll be able to accept a sealed bid
              once the end time has passed.
            </p>
          )}
          {winnerId && (
            <p className="mt-2 text-xs text-emerald-300">
              You&apos;ve already chosen a winning bid. This listing is now in{" "}
              <span className="font-semibold">deal in progress</span>.
            </p>
          )}
        </section>

        {/* Envelopes / bids list */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Sealed bids
            </h2>
            <p className="text-[11px] text-slate-500">
              Highest offers shown first. Only you can see this.
            </p>
          </div>

          {envelopes.length === 0 ? (
            <p className="mt-3 text-xs text-slate-400">
              No sealed bids were submitted for this listing. You can mark it
              as no sale later.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {envelopes.map((env, idx) => {
                const isWinner = winnerId === env.$id || env.status === "winner";
                const status = env.status;
                const isRejected = status === "rejected";
                const isWithdrawn = status === "withdrawn";
                const canAccept =
                  canDecideTime &&
                  !winnerId &&
                  !isWinner &&
                  !isRejected &&
                  !isWithdrawn;

                return (
                  <div
                    key={env.$id}
                    className={`flex flex-col gap-3 rounded-2xl border px-4 py-3 text-xs md:flex-row md:items-center md:justify-between ${
                      isWinner
                        ? "border-emerald-400/70 bg-emerald-500/10"
                        : isRejected
                        ? "border-slate-700 bg-slate-900"
                        : isWithdrawn
                        ? "border-slate-700 bg-slate-900/60"
                        : "border-slate-700 bg-slate-900/70"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-slate-100">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-50">
                          {formatAmount(env.amount)}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Buyer ID:{" "}
                        <span className="font-mono text-slate-200">
                          {env.buyerId
                            ? env.buyerId.slice(0, 8) + "…"
                            : "Unknown"}
                        </span>
                      </p>
                      {env.message && (
                        <p className="mt-1 text-[11px] text-slate-200">
                          “{env.message}”
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-slate-500">
                        Submitted: {formatDateTime(env.$createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 md:items-end">
                      {/* Status tag */}
                      {isWinner ? (
                        <span className="inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-semibold text-emerald-200">
                          Accepted winner
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-[10px] font-semibold text-slate-300">
                          Not selected
                        </span>
                      ) : isWithdrawn ? (
                        <span className="inline-flex rounded-full bg-slate-800/70 px-3 py-1 text-[10px] font-semibold text-slate-300">
                          Withdrawn by buyer
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-800/80 px-3 py-1 text-[10px] font-medium text-slate-200">
                          Pending decision
                        </span>
                      )}

                      {/* Accept button */}
                      {canAccept && (
                        <button
                          type="button"
                          onClick={() => handleAccept(env.$id)}
                          disabled={!!acceptingId}
                          className="inline-flex items-center rounded-full border border-emerald-400 px-3 py-1 text-[10px] font-semibold text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-60"
                        >
                          {acceptingId === env.$id
                            ? "Accepting…"
                            : "Accept this bid"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!canDecideTime && envelopes.length > 0 && (
            <p className="mt-4 text-[11px] text-amber-300">
              You&apos;ll be able to choose a buyer once the listing end time
              has passed.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
