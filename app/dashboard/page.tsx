// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Query } from "appwrite";
import { account, databases } from "@/lib/appwriteClient";

const DB_ID = "sealabid_main_db";
const LISTINGS_COLLECTION_ID = "listings";
const BIDS_COLLECTION_ID = "bids";

type UserSummary = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  accountType?: string;
  profileBio?: string;
};

type Listing = {
  $id: string;
  title: string;
  durationDays: number;
  endsAt: string;
  status: string;
  bidsCount?: number;
  category?: string;
};

type Bid = {
  $id: string;
  listingId: string;
  amount: number;
  createdAt: string;
  listingTitle?: string;
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

export default function DashboardPage() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);

  const [bids, setBids] = useState<Bid[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [bidsError, setBidsError] = useState<string | null>(null);

  // 1) Load user
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const me: any = await account.get();
        if (cancelled) return;

        const prefs = me.prefs || {};
        const summary: UserSummary = {
          id: me.$id,
          name: me.name || "",
          email: me.email,
          emailVerified: Boolean(me.emailVerification),
          accountType: prefs.accountType,
          profileBio: prefs.profileBio,
        };

        setUser(summary);
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setUser(null);
          setUserError(
            err?.message ||
              err?.response?.message ||
              "Failed to load your account."
          );
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

  // 2) Load listings (selling) for this user
  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    async function loadListings() {
      try {
        setListingsError(null);
        setLoadingListings(true);

        const res = await databases.listDocuments(
          DB_ID,
          LISTINGS_COLLECTION_ID,
          [Query.equal("sellerId", user.id), Query.orderDesc("endsAt")]
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
        if (!cancelled) {
          setListingsError(
            err?.message ||
              err?.response?.message ||
              "Failed to load your listings."
          );
        }
      } finally {
        if (!cancelled) setLoadingListings(false);
      }
    }

    loadListings();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // 3) Load bids (buying) for this user
  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    async function loadBids() {
      try {
        setBidsError(null);
        setLoadingBids(true);

        const res = await databases.listDocuments(
          DB_ID,
          BIDS_COLLECTION_ID,
          [Query.equal("bidderId", user.id), Query.orderDesc("$createdAt")]
        );

        if (cancelled) return;

        const docs = res.documents as any[];
        const baseBids: Bid[] = docs.map((doc) => ({
          $id: doc.$id,
          listingId: doc.listingId,
          amount: doc.amount,
          createdAt: doc.$createdAt,
        }));

        // Fetch titles for listings you’ve bid on
        const uniqueListingIds = Array.from(
          new Set(baseBids.map((b) => b.listingId).filter(Boolean))
        );

        const titles: Record<string, string> = {};

        await Promise.all(
          uniqueListingIds.map(async (listingId) => {
            try {
              const doc: any = await databases.getDocument(
                DB_ID,
                LISTINGS_COLLECTION_ID,
                listingId
              );
              titles[listingId] = doc.title;
            } catch (err) {
              console.error("Failed to load listing for bid", listingId, err);
            }
          })
        );

        const enriched = baseBids.map((b) => ({
          ...b,
          listingTitle: titles[b.listingId] || "Listing",
        }));

        setBids(enriched);
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setBidsError(
            err?.message ||
              err?.response?.message ||
              "Failed to load your bids."
          );
        }
      } finally {
        if (!cancelled) setLoadingBids(false);
      }
    }

    loadBids();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // If user not logged in
  if (!loadingUser && !user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Your dashboard
          </h1>
          <p className="text-sm text-slate-300">
            You need to be logged in to view your dashboard.
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Sealabid
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Your dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Manage your profile, see what you&apos;re selling and what you&apos;ve
              bid on. Everyone registers to buy or sell – this is your control
              centre.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/sell"
              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400"
            >
              Sell an item
            </Link>
            <Link
              href="/listings"
              className="rounded-full border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
            >
              Browse items
            </Link>
          </div>
        </div>

        {/* Profile card */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-sm font-semibold text-slate-50">
            Your profile
          </h2>

          {loadingUser ? (
            <p className="mt-2 text-sm text-slate-300">Loading profile…</p>
          ) : userError ? (
            <p className="mt-2 text-sm text-red-300">{userError}</p>
          ) : user ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 text-sm text-slate-200">
                <p>
                  <span className="text-slate-400 text-xs uppercase tracking-wide">
                    Name:
                  </span>{" "}
                  {user.name || "Not set"}
                </p>
                <p>
                  <span className="text-slate-400 text-xs uppercase tracking-wide">
                    Email:
                  </span>{" "}
                  {user.email}
                </p>
                <p>
                  <span className="text-slate-400 text-xs uppercase tracking-wide">
                    Email status:
                  </span>{" "}
                  {user.emailVerified ? (
                    <span className="text-emerald-300 font-medium">
                      Verified
                    </span>
                  ) : (
                    <span className="text-amber-300 font-medium">
                      Not verified
                    </span>
                  )}
                </p>
                <p>
                  <span className="text-slate-400 text-xs uppercase tracking-wide">
                    Account type:
                  </span>{" "}
                  {user.accountType
                    ? user.accountType.charAt(0).toUpperCase() +
                      user.accountType.slice(1)
                    : "Not set"}
                </p>
              </div>
              <div className="space-y-2 text-sm text-slate-200">
                <p className="text-slate-400 text-xs uppercase tracking-wide">
                  Profile bio
                </p>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">
                  {user.profileBio || "You haven’t added a bio yet."}
                </p>
                <p className="text-[11px] text-slate-400">
                  Your profile helps sellers choose a buyer when price isn&apos;t the
                  only factor – especially for charities or causes.
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Link
              href="/profile"
              className="rounded-full border border-slate-600 px-3 py-1.5 font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
            >
              Edit profile details
            </Link>
            <button
              type="button"
              disabled
              className="rounded-full border border-slate-700 px-3 py-1.5 font-semibold text-slate-500"
            >
              Manage payment methods (coming soon)
            </button>
          </div>
        </section>

        {/* Selling + Buying columns */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Selling */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-50">
                Selling
              </h2>
              <Link
                href="/my-listings"
                className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200"
              >
                View all listings →
              </Link>
            </div>

            {loadingListings ? (
              <p className="mt-2 text-sm text-slate-300">Loading listings…</p>
            ) : listingsError ? (
              <p className="mt-2 text-sm text-red-300">{listingsError}</p>
            ) : listings.length === 0 ? (
              <p className="mt-2 text-sm text-slate-300">
                You haven&apos;t listed anything yet.
              </p>
            ) : (
              <>
                <div className="mt-3 space-y-2">
                  {listings.slice(0, 5).map((l) => {
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
                        className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm hover:border-emerald-500/60 hover:bg-slate-950"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-50 line-clamp-1">
                            {l.title}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {categoryLabel} • {t.label}
                          </p>
                        </div>
                        <div className="text-right text-[11px] text-slate-400">
                          <p className="font-semibold text-emerald-300">
                            {bids} envelope{bids === 1 ? "" : "s"}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {listings.length > 5 && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    Showing 5 of {listings.length} listings.
                  </p>
                )}
              </>
            )}
          </section>

          {/* Buying */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-sm font-semibold text-slate-50">
              Buying (your sealed bids)
            </h2>

            {loadingBids ? (
              <p className="mt-2 text-sm text-slate-300">Loading your bids…</p>
            ) : bidsError ? (
              <p className="mt-2 text-sm text-red-300">{bidsError}</p>
            ) : bids.length === 0 ? (
              <p className="mt-2 text-sm text-slate-300">
                You haven&apos;t placed any sealed bids yet.
              </p>
            ) : (
              <>
                <div className="mt-3 space-y-2">
                  {bids.slice(0, 5).map((b) => {
                    const created = new Date(b.createdAt);
                    const createdLabel = created.toLocaleString("en-GB", {
                      dateStyle: "short",
                      timeStyle: "short",
                    });

                    return (
                      <div
                        key={b.$id}
                        className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-50 line-clamp-1">
                            {b.listingTitle || "Listing"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Placed: {createdLabel}
                          </p>
                        </div>
                        <div className="text-right text-[11px] text-slate-400">
                          <p className="font-semibold text-slate-200">
                            £{b.amount.toLocaleString("en-GB")}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Result decided by seller
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {bids.length > 5 && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    Showing 5 of {bids.length} bids. A full bids history page can
                    come later.
                  </p>
                )}
              </>
            )}

            <p className="mt-3 text-[11px] text-slate-500">
              Remember: you never see other people&apos;s amounts and you may not
              win, even with a strong bid. Sellers choose based on both price and
              profile.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
