// app/admin/listings/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Query } from "appwrite";
import { account, databases } from "@/lib/appwriteClient";

// Same admin rule as /admin
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

const DB_ID = "sealabid_main_db";
const LISTINGS_COLLECTION_ID = "listings";

type SimpleUser = {
  id: string;
  name: string;
  email: string;
};

type ListingRow = {
  $id: string;
  reference: string;
  title: string;
  status: string;
  endsAt: string | null;
  category?: string;
  bidsCount: number;
  sellerId?: string;
  createdAt: string;
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

function timeStatus(endsAt: string | null) {
  if (!endsAt) return { label: "No end time", ended: false };

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

export default function AdminListingsPage() {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "ended">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Load admin user
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      setLoadingUser(true);
      setUserError(null);

      try {
        const me: any = await account.get();
        if (cancelled) return;

        const simple: SimpleUser = {
          id: me.$id,
          name: me.name || "",
          email: me.email || "",
        };

        setUser(simple);

        if (
          ADMIN_EMAIL &&
          simple.email &&
          simple.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
        ) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Admin listings loadUser error:", err);
          setUser(null);
          setIsAdmin(false);
          setUserError("You must be logged in as an admin to view this page.");
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

  // Load listings (only if admin)
  useEffect(() => {
    if (!isAdmin || !user) return;

    let cancelled = false;

    async function loadListings() {
      setLoadingListings(true);
      setListingsError(null);

      try {
        const res: any = await databases.listDocuments(
          DB_ID,
          LISTINGS_COLLECTION_ID,
          [
            // Admin wants to see everything, newest first by createdAt
            Query.orderDesc("$createdAt"),
            Query.limit(100), // cap for now – enough to manage early-stage usage
          ]
        );

        if (cancelled) return;

        const docs = (res.documents || []) as any[];

        const mapped: ListingRow[] = docs.map((doc) => ({
          $id: doc.$id,
          reference: doc.reference || doc.$id,
          title: doc.title || "(No title)",
          status: doc.status || "unknown",
          endsAt: doc.endsAt || null,
          category: doc.category,
          bidsCount: typeof doc.bidsCount === "number" ? doc.bidsCount : 0,
          sellerId: doc.sellerId,
          createdAt: doc.$createdAt,
        }));

        setListings(mapped);
      } catch (err: any) {
        if (!cancelled) {
          console.error("Admin listings load error:", err);
          const msg =
            err?.message ||
            err?.response?.message ||
            "Failed to load listings for admin.";
          setListingsError(msg);
        }
      } finally {
        if (!cancelled) setLoadingListings(false);
      }
    }

    loadListings();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, user]);

  // ------------------ RENDER STATES ------------------

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <p className="text-sm text-slate-300">Checking admin access…</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Admin – listings
          </h1>
          <p className="text-sm text-slate-300">
            {userError ||
              "You need to be logged in with the admin account to view this page."}
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <Link
              href="/login"
              className="inline-flex rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Login
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-full border border-slate-600 px-4 py-2 font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 space-y-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Admin – listings
          </h1>
          <p className="text-sm text-slate-300">
            You&apos;re logged in as{" "}
            <span className="font-semibold text-emerald-300">
              {user.name || user.email}
            </span>
            , but this account is not authorised to access the admin listings
            panel.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  // Filter + search
  const filteredListings = listings.filter((l) => {
    if (statusFilter === "active" && l.status !== "active") return false;
    if (statusFilter === "ended" && l.status === "active") return false;

    if (!searchTerm.trim()) return true;

    const q = searchTerm.trim().toLowerCase();
    return (
      l.reference.toLowerCase().includes(q) ||
      l.title.toLowerCase().includes(q) ||
      (l.sellerId && l.sellerId.toLowerCase().includes(q))
    );
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14 space-y-6">
        {/* Header */}
        <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Sealabid – Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Listings admin
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Internal view of all listings. Use this to monitor activity, check
              envelopes and quickly jump to public pages or seller-facing views.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">Admin account</p>
            <p className="mt-1 text-[11px]">
              {user.name && (
                <>
                  {user.name} <span className="text-slate-500">•</span>{" "}
                </>
              )}
              {user.email}
            </p>
            <Link
              href="/admin"
              className="mt-2 inline-flex text-[11px] font-semibold text-emerald-300 hover:text-emerald-200"
            >
              ← Back to admin dashboard
            </Link>
          </div>
        </header>

        {/* Filters & search */}
        <section className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">
              Filter
            </span>
            <div className="inline-flex rounded-full border border-slate-700 bg-slate-950 p-1 text-[11px]">
              {["all", "active", "ended"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setStatusFilter(key as "all" | "active" | "ended")
                  }
                  className={`px-3 py-1.5 rounded-full font-semibold transition ${
                    statusFilter === key
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {key === "all"
                    ? "All"
                    : key === "active"
                    ? "Active"
                    : "Ended"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">
              Search
            </span>
            <input
              type="text"
              className="w-full max-w-xs rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-50 outline-none focus:border-emerald-400"
              placeholder="Ref, title or seller ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>

        {/* Listings table/cards */}
        <section className="space-y-3">
          {loadingListings && (
            <p className="text-xs text-slate-400">Loading listings…</p>
          )}

          {listingsError && (
            <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {listingsError}
            </div>
          )}

          {!loadingListings && !listingsError && filteredListings.length === 0 && (
            <p className="text-xs text-slate-400">
              No listings match your current filters/search.
            </p>
          )}

          {!loadingListings && !listingsError && filteredListings.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
              <div className="hidden grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-3 border-b border-slate-800 px-4 py-2 text-[11px] text-slate-400 md:grid">
                <span>Listing</span>
                <span className="text-center">Status</span>
                <span className="text-center">Ends</span>
                <span className="text-center">Envelopes</span>
                <span className="text-center">Seller</span>
              </div>

              <div className="divide-y divide-slate-800">
                {filteredListings.map((l) => {
                  const t = timeStatus(l.endsAt);
                  const categoryKey =
                    (l.category as keyof typeof CATEGORY_LABELS) || "other";
                  const categoryLabel = CATEGORY_LABELS[categoryKey] || "Other";

                  return (
                    <div
                      key={l.$id}
                      className="flex flex-col gap-2 px-4 py-3 text-xs text-slate-200 md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr]"
                    >
                      {/* Listing info */}
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-50">
                          {l.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Ref:{" "}
                          <span className="font-mono">{l.reference}</span>{" "}
                          <span className="text-slate-600">•</span>{" "}
                          {categoryLabel}
                        </p>
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          <Link
                            href={`/listings/${l.$id}`}
                            className="inline-flex items-center rounded-full border border-slate-700 px-2 py-1 font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
                          >
                            View public page
                          </Link>
                          {/* Placeholder for future admin detail view */}
                          {/* <Link
                            href={`/admin/listings/${l.$id}`}
                            className="inline-flex items-center rounded-full border border-slate-700 px-2 py-1 font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
                          >
                            Admin view
                          </Link> */}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center md:justify-center">
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                            l.status === "active"
                              ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                              : "border-slate-600 bg-slate-800 text-slate-200"
                          }`}
                        >
                          {l.status === "active" ? "Active" : "Ended / other"}
                        </span>
                      </div>

                      {/* Ends at */}
                      <div className="flex flex-col items-start text-[11px] text-slate-300 md:items-center">
                        <span>
                          {l.endsAt
                            ? new Date(l.endsAt).toLocaleString("en-GB", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "—"}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {t.label}
                        </span>
                      </div>

                      {/* Envelopes */}
                      <div className="flex flex-col items-start text-[11px] md:items-center">
                        <span className="font-semibold text-emerald-300">
                          {l.bidsCount} envelope{l.bidsCount === 1 ? "" : "s"}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Count stored on listing
                        </span>
                      </div>

                      {/* Seller */}
                      <div className="flex flex-col items-start text-[11px] text-slate-300 md:items-center">
                        <span className="font-mono break-all">
                          {l.sellerId || "—"}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Seller Appwrite user ID
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
