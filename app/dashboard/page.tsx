// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Query } from "appwrite";
import { account, databases } from "@/lib/appwriteClient";

const DB_ID = "sealabid_main_db";
const LISTINGS_COLLECTION_ID = "listings";
const BIDS_COLLECTION_ID = "bids";

type SimpleUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean | null;
  accountType?: string;
  profileBio?: string;
};

type ListingSummary = {
  $id: string;
  title: string;
  endsAt: string;
  status: string;
  bidsCount: number;
  category?: string;
  winnerBidId?: string | null; // ✅ chosen sealed bid, if any
};

type BidSummary = {
  $id: string;
  listingId: string;
  listingTitle: string;
  amount: number;
  createdAt: string;
  decisionStatus?: string; // ✅ pending / accepted / rejected
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
    return { label: "Ended", ended: true };
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

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);

  const [bids, setBids] = useState<BidSummary[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [bidsError, setBidsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoadingUser(true);
      setListingsError(null);
      setBidsError(null);

      try {
        // -----------------------------
        // 1) Load account (may throw 401 if not logged in)
        // -----------------------------
        const me: any = await account.get();
        if (cancelled) return;

        const prefs = me.prefs || {};

        const simple: SimpleUser = {
          id: me.$id,
          name: me.name || "",
          email: me.email || "",
          // @ts-ignore
          emailVerified: Boolean(me.emailVerification),
          accountType: prefs.accountType,
          profileBio: prefs.profileBio,
        };

        setUser(simple);
        setLoadingUser(false);

        // -----------------------------
        // 2) Load user's own listings
        // -----------------------------
        setLoadingListings(true);
        try {
          const res = await databases.listDocuments(
            DB_ID,
            LISTINGS_COLLECTION_ID,
            [
              Query.equal("sellerId", simple.id),
              Query.orderDesc("endsAt"),
              Query.limit(5),
            ]
          );
          if (!cancelled) {
            const docs = res.documents as any[];
            const mapped: ListingSummary[] = docs.map((doc) => ({
              $id: doc.$id,
              title: doc.title,
              endsAt: doc.endsAt,
              status: doc.status,
              bidsCount:
                typeof doc.bidsCount === "number" ? doc.bidsCount : 0,
              category: doc.category,
              winnerBidId: doc.winnerBidId ?? null,
            }));
            setListings(mapped);
          }
        } catch (err: any) {
          if (!cancelled) {
            const msg =
              err?.message ||
              err?.response?.message ||
              "Failed to load your listings.";
            setListingsError(msg);
          }
        } finally {
          if (!cancelled) setLoadingListings(false);
        }

        // -----------------------------
        // 3) Load user's recent bids
        // -----------------------------
        setLoadingBids(true);
        try {
          const res = await databases.listDocuments(
            DB_ID,
            BIDS_COLLECTION_ID,
            [
              Query.equal("bidderId", simple.id),
              Query.orderDesc("$createdAt"),
              Query.limit(5),
            ]
          );
          if (!cancelled) {
            const docs = res.documents as any[];
            const mapped: BidSummary[] = docs.map((doc) => ({
              $id: doc.$id,
              listingId: doc.listingId,
              listingTitle: doc.listingTitle || "(Listing)",
              amount: doc.amount,
              createdAt: doc.$createdAt,
              decisionStatus: doc.decisionStatus || "pending",
            }));
            setBids(mapped);
          }
        } catch (err: any) {
          if (!cancelled) {
            const msg =
              err?.message ||
              err?.response?.message ||
              "Failed to load your recent bids.";
            setBidsError(msg);
          }
        } finally {
          if (!cancelled) setLoadingBids(false);
        }
      } catch (err: any) {
        // -----------------------------
        // account.get() failed
        // -----------------------------
        if (cancelled) return;

        // If it's just "guest user, no account scope", treat as normal logged-out state
        if (err?.code === 401 || err?.type === "user_unauthorized") {
          setUser(null);
          setLoadingUser(false);
          return;
        }

        // Anything else is a real error
        console.error("Unexpected dashboard error:", err);
        setUser(null);
        setLoadingUser(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  // -----------------------------
  // Not logged in
  // -----------------------------
  if (!loadingUser && !user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Your dashboard
          </h1>
          <p className="text-sm text-slate-300">
            You need to be logged in to see your dashboard.
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <Link
              href="/login"
              className="inline-flex rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex rounded-full border border-slate-600 px-4 py-2 font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300"
            >
              Register
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <p className="text-sm text-slate-300">Loading your dashboard…</p>
        </div>
      </main>
    );
  }

  if (!user) {
    // Just in case
    return null;
  }

  const activeListings = listings.filter((l) => l.status === "active");
  const endedListings = listings.filter((l) => l.status !== "active");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Sealabid
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Your dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              A quick overview of your profile, items you&apos;ve listed, and
              where you&apos;ve placed sealed bids.
            </p>
          </div>
          <Link
            href="/sell"
            className="inline-flex rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400"
          >
            Sell an item
          </Link>
        </div>

        {/* TOP GRID: PROFILE + QUICK LINKS */}
        <section className="grid gap-4 md:grid-cols-[3fr,2fr]">
          {/* Profile summary */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Profile
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-50">
              {user.name || "(No name yet)"}
            </p>
            <p className="text-xs text-slate-400">{user.email}</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Account type:{" "}
              <span className="font-medium text-slate-200">
                {user.accountType || "Not set"}
              </span>
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Email status:{" "}
              {user.emailVerified ? (
                <span className="font-semibold text-emerald-300">
                  Verified
                </span>
              ) : (
                <span className="font-semibold text-amber-300">
                  Not verified
                </span>
              )}
            </p>
            {user.profileBio && (
              <p className="mt-3 line-clamp-3 text-xs text-slate-300">
                {user.profileBio}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Link
                href="/profile"
                className="inline-flex rounded-full border border-slate-600 px-3 py-1.5 font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300"
              >
                Edit profile details
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Shortcuts
            </h2>
            <ul className="mt-2 space-y-2 text-xs text-slate-300">
              <li>
                <Link
                  href="/sell"
                  className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
                >
                  List a new item with sealed bids
                </Link>
              </li>
              <li>
                <Link
                  href="/my-listings"
                  className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
                >
                  View all your listings
                </Link>
              </li>
              <li>
                <Link
                  href="/listings"
                  className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
                >
                  Browse current listings
                </Link>
              </li>
            </ul>
            <p className="mt-3 text-[11px] text-slate-500">
              Later we&apos;ll add payment methods, feedback, and more tools
              here.
            </p>
          </div>
        </section>

        {/* SELLING SECTION */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-50">
              Your recent listings
            </h2>
            <Link
              href="/my-listings"
              className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
            >
              View all →
            </Link>
          </div>

          {loadingListings && (
            <p className="text-xs text-slate-400">Loading your listings…</p>
          )}

          {listingsError && (
            <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {listingsError}
            </div>
          )}

          {!loadingListings && !listingsError && listings.length === 0 && (
            <p className="text-xs text-slate-400">
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

          {listings.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {listings.map((l) => {
                const t = timeStatus(l.endsAt);
                const bidsCount = l.bidsCount || 0;
                const categoryKey =
                  (l.category as keyof typeof CATEGORY_LABELS) || "other";
                const categoryLabel = CATEGORY_LABELS[categoryKey] || "Other";

                const hasWinner = Boolean(l.winnerBidId);
                const canDecide =
                  t.ended && bidsCount > 0 && !hasWinner;

                return (
                  <Link
                    key={l.$id}
                    href={`/listings/${l.$id}`}
                    className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm hover:border-emerald-500/60 hover:bg-slate-900"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-50">
                        {l.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {categoryLabel} • {t.label}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="space-y-1">
                        <p>
                          Status:{" "}
                          <span className="font-semibold text-slate-200">
                            {l.status === "active" ? "Active" : "Ended"}
                          </span>
                          {t.ended && (
                            <span className="ml-1 text-[10px] text-slate-400">
                              •{" "}
                              {hasWinner
                                ? "Winner chosen"
                                : bidsCount > 0
                                ? "Awaiting your decision"
                                : "No envelopes"}
                            </span>
                          )}
                        </p>

                        {canDecide && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/dashboard/listings/${l.$id}`);
                            }}
                            className="mt-1 inline-flex items-center rounded-full border border-emerald-400 px-3 py-1 text-[10px] font-semibold text-emerald-200 hover:bg-emerald-500/10"
                          >
                            Review sealed bids
                          </button>
                        )}

                        {t.ended && hasWinner && (
                          <p className="mt-1 text-[10px] text-emerald-300">
                            Deal in progress – you&apos;ve accepted a buyer.
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-emerald-300">
                          {bidsCount} envelope{bidsCount === 1 ? "" : "s"}
                        </span>
                        <div className="flex gap-1">
                          {Array.from({
                            length: Math.min(bidsCount, 4),
                          }).map((_, i) => (
                            <div
                              key={i}
                              className="flex h-4 w-6 items-center justify-center rounded-md border border-amber-400/60 bg-amber-500/10 text-[9px]"
                            >
                              ✉️
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {endedListings.length > 0 && (
            <p className="text-[11px] text-slate-500">
              Ended listings with envelopes can be opened on the{" "}
              <span className="font-semibold text-emerald-300">
                &quot;Review sealed bids&quot;
              </span>{" "}
              screen where you pick a buyer or mark as no sale.
            </p>
          )}
        </section>

        {/* BUYING SECTION */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-50">
            Your recent sealed bids
          </h2>

          {loadingBids && (
            <p className="text-xs text-slate-400">Loading your bids…</p>
          )}

          {bidsError && (
            <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {bidsError}
            </div>
          )}

          {!loadingBids && !bidsError && bids.length === 0 && (
            <p className="text-xs text-slate-400">
              You haven&apos;t placed any sealed bids yet.{" "}
              <Link
                href="/listings"
                className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
              >
                Browse current listings
              </Link>{" "}
              to get started.
            </p>
          )}

          {bids.length > 0 && (
            <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300">
              {bids.map((b) => {
                const statusRaw = b.decisionStatus || "pending";
                let statusLabel = "Awaiting seller decision";
                let statusClass = "text-amber-300";

                if (statusRaw === "accepted") {
                  statusLabel = "Winner – offer accepted";
                  statusClass = "text-emerald-300";
                } else if (statusRaw === "rejected") {
                  statusLabel = "Not selected";
                  statusClass = "text-slate-400";
                }

                return (
                  <div
                    key={b.$id}
                    className="flex items-center justify-between gap-3 border-b border-slate-800/70 pb-2 last:border-b-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <Link
                        href={`/listings/${b.listingId}`}
                        className="font-semibold text-slate-50 hover:text-emerald-300"
                      >
                        {b.listingTitle}
                      </Link>
                      <p className="text-[11px] text-slate-400">
                        Your sealed bid:{" "}
                        <span className="font-semibold text-emerald-300">
                          £{b.amount.toLocaleString("en-GB")}
                        </span>
                      </p>
                      <p className={`text-[11px] mt-1 ${statusClass}`}>
                        {statusLabel}
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <p>
                        Placed:{" "}
                        {new Date(b.createdAt).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-[11px] text-slate-500">
            When a listing you&apos;ve bid on ends, the seller has 2 hours to
            open envelopes and choose a buyer. You&apos;ll be notified if
            you&apos;re selected as the winner once payments are wired up.
          </p>
        </section>
      </div>
    </main>
  );
}
