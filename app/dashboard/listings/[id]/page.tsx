// app/dashboard/listings/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Query } from "appwrite";
import { account, databases } from "@/lib/appwriteClient";

const DB_ID = "sealabid_main_db";
const LISTINGS_COLLECTION_ID = "listings";

// Envelopes live in their own collection
const ENVELOPES_DB_ID = process.env.NEXT_PUBLIC_APPWRITE_ENVELOPES_DB_ID!;
const ENVELOPES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_ENVELOPES_COLLECTION_ID!;

type Listing = {
  $id: string;
  title?: string;
  endsAt?: string;
  status?: string;
  sellerId?: string;
};

type EnvelopeStatus = "submitted" | "withdrawn" | "winner" | "rejected";

type Envelope = {
  $id: string;
  listingId: string;
  buyerId: string;
  amount: number;
  message?: string;
  status: EnvelopeStatus;
  $createdAt: string;
};

export default function DashboardListingReviewPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id as string | string[] | undefined;
  const listingId = Array.isArray(rawId) ? rawId[0] : rawId || "";

  const [user, setUser] = useState<any | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [choosingId, setChoosingId] = useState<string | null>(null);
  const [reloadingEnvelopes, setReloadingEnvelopes] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!listingId) {
        setError("Listing ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1) Load current user
        const me = await account.get();
        if (cancelled) return;
        setUser(me);

        // 2) Load listing
        const doc: any = await databases.getDocument(
          DB_ID,
          LISTINGS_COLLECTION_ID,
          listingId
        );
        if (cancelled) return;

        const l: Listing = {
          $id: doc.$id,
          title: doc.title,
          endsAt: doc.endsAt,
          status: doc.status,
          sellerId: doc.sellerId,
        };

        // Ensure this listing belongs to the logged-in user
        if (l.sellerId && l.sellerId !== me.$id) {
          setError("This listing does not belong to your account.");
          setListing(null);
          setLoading(false);
          return;
        }

        setListing(l);

        // 3) Load envelopes for this listing (highest amount first)
        const envRes: any = await databases.listDocuments(
          ENVELOPES_DB_ID,
          ENVELOPES_COLLECTION_ID,
          [
            Query.equal("listingId", listingId),
            Query.orderDesc("amount"),
          ]
        );

        if (cancelled) return;

        const docs = (envRes.documents || []) as any[];
        const mapped: Envelope[] = docs.map((d) => ({
          $id: d.$id,
          listingId: d.listingId,
          buyerId: d.buyerId,
          amount: d.amount,
          message: d.message,
          status: d.status || "submitted",
          $createdAt: d.$createdAt,
        }));

        setEnvelopes(mapped);
      } catch (err: any) {
        console.error("Error loading listing/envelopes:", err);
        if (err?.code === 401) {
          router.push("/login");
          return;
        }
        setError(
          err?.message ||
            err?.response?.message ||
            "We couldn't load this listing or its envelopes."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [listingId, router]);

  const deadline = listing?.endsAt ? new Date(listing.endsAt) : null;
  const now = new Date();
  const canDecideTime = deadline ? deadline <= now : true;

  const winnerEnvelope = envelopes.find((e) => e.status === "winner");

  async function reloadEnvelopes() {
    if (!listing) return;
    setReloadingEnvelopes(true);
    try {
      const envRes: any = await databases.listDocuments(
        ENVELOPES_DB_ID,
        ENVELOPES_COLLECTION_ID,
        [
          Query.equal("listingId", listing.$id),
          Query.orderDesc("amount"),
        ]
      );
      const docs = (envRes.documents || []) as any[];
      const mapped: Envelope[] = docs.map((d) => ({
        $id: d.$id,
        listingId: d.listingId,
        buyerId: d.buyerId,
        amount: d.amount,
        message: d.message,
        status: d.status || "submitted",
        $createdAt: d.$createdAt,
      }));
      setEnvelopes(mapped);
    } catch (err) {
      console.error("Error reloading envelopes:", err);
    } finally {
      setReloadingEnvelopes(false);
    }
  }

  async function handleAccept(envelopeId: string) {
    if (!listing || !user) return;

    const selected = envelopes.find((e) => e.$id === envelopeId);
    if (!selected) return;

    const ok = window.confirm(
      `Accept this sealed bid of £${selected.amount.toLocaleString(
        "en-GB"
      )}? Other non-withdrawn envelopes will be marked as not selected.`
    );
    if (!ok) return;

    if (!canDecideTime) {
      alert("You can only choose a buyer once the listing has ended.");
      return;
    }

    try {
      setChoosingId(envelopeId);
      setError(null);

      // Mark chosen envelope as winner, others (that aren't withdrawn) as rejected
      const updates = envelopes.map(async (env) => {
        if (env.$id === envelopeId) {
          await databases.updateDocument(
            ENVELOPES_DB_ID,
            ENVELOPES_COLLECTION_ID,
            env.$id,
            { status: "winner" }
          );
        } else if (env.status !== "withdrawn") {
          await databases.updateDocument(
            ENVELOPES_DB_ID,
            ENVELOPES_COLLECTION_ID,
            env.$id,
            { status: "rejected" }
          );
        }
      });

      await Promise.all(updates);

      await reloadEnvelopes();
    } catch (err: any) {
      console.error("Error accepting envelope:", err);
      setError(
        err?.message ||
          err?.response?.message ||
          "We couldn't accept that envelope. Please try again."
      );
    } finally {
      setChoosingId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <p className="text-sm text-slate-300">
            Loading listing and envelopes…
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

  const totalEnvelopes = envelopes.length;
  const submittedCount = envelopes.filter(
    (e) =>
      e.status === "submitted" ||
      e.status === "winner" ||
      e.status === "rejected"
  ).length;

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
              Review sealed envelopes
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              This view is only visible to you as the seller. Buyers never see
              each other&apos;s offers or messages.
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
              {listing.endsAt
                ? new Date(listing.endsAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Not set"}
            </span>
          </p>

          {deadline && deadline > now && (
            <p className="mt-2 text-xs text-amber-300">
              The sealed-bid window is still open. You&apos;ll be able to accept
              a buyer once the end time has passed.
            </p>
          )}

          {winnerEnvelope && (
            <p className="mt-2 text-xs text-emerald-300">
              You&apos;ve already chosen a winning envelope. This listing is now
              in a deal-in-progress state (you can still see all envelopes
              below).
            </p>
          )}
        </section>

        {/* Envelopes list */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Sealed envelopes
            </h2>
            <p className="text-[11px] text-slate-500">
              Highest amounts shown first. Only you can see this.
            </p>
          </div>

          {totalEnvelopes === 0 && (
            <p className="mt-3 text-xs text-slate-400">
              No envelopes were submitted for this listing. You can mark it as
              no sale in your dashboard later.
            </p>
          )}

          {totalEnvelopes > 0 && (
            <>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Total envelopes:{" "}
                  <span className="font-medium text-slate-200">
                    {totalEnvelopes}
                  </span>
                </span>
                <span>
                  Submitted / decided:{" "}
                  <span className="font-medium text-slate-200">
                    {submittedCount}
                  </span>
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {envelopes.map((env, idx) => {
                  const created = new Date(env.$createdAt);
                  const isWinner = env.status === "winner";
                  const isRejected = env.status === "rejected";
                  const isWithdrawn = env.status === "withdrawn";

                  let statusLabel = "Submitted";
                  if (isWinner) statusLabel = "Accepted winner";
                  else if (isRejected) statusLabel = "Not selected";
                  else if (isWithdrawn) statusLabel = "Withdrawn";

                  let statusClasses =
                    "bg-slate-800 text-slate-200 border-slate-600/80";
                  if (isWinner) {
                    statusClasses =
                      "bg-emerald-500/10 text-emerald-300 border-emerald-500/60";
                  } else if (isRejected) {
                    statusClasses =
                      "bg-red-500/10 text-red-300 border-red-500/60";
                  } else if (isWithdrawn) {
                    statusClasses =
                      "bg-slate-800 text-slate-300 border-slate-600/80";
                  }

                  const canAccept =
                    canDecideTime &&
                    !winnerEnvelope &&
                    !isWithdrawn &&
                    !isRejected;

                  return (
                    <div
                      key={env.$id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-slate-100">
                            {idx + 1}
                          </span>
                          <p className="text-sm font-semibold text-slate-50">
                            £{env.amount.toLocaleString("en-GB")}
                          </p>
                        </div>
                        {env.message && (
                          <p className="mt-1 text-[11px] text-slate-200">
                            “{env.message}”
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-slate-500">
                          Buyer ID:{" "}
                          <span className="font-mono text-slate-300">
                            {env.buyerId.slice(0, 8)}…
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Submitted:{" "}
                          {created.toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-2 md:items-end">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusClasses}`}
                        >
                          {statusLabel}
                        </span>

                        {canAccept && (
                          <button
                            type="button"
                            onClick={() => handleAccept(env.$id)}
                            disabled={!!choosingId}
                            className="inline-flex items-center rounded-full border border-emerald-400 px-3 py-1 text-[10px] font-semibold text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-60"
                          >
                            {choosingId === env.$id
                              ? "Accepting…"
                              : "Accept this envelope"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!canDecideTime && totalEnvelopes > 0 && (
                <p className="mt-4 text-[11px] text-amber-300">
                  You&apos;ll be able to choose a buyer once the listing end
                  time has passed.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
