// app/admin/abuse/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Query } from "appwrite";
import { account, databases } from "@/lib/appwriteClient";

const DB_ID = "sealabid_main_db";
const ABUSE_REPORTS_COLLECTION_ID = "abuse_reports";
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

type SimpleUser = {
  id: string;
  email: string;
  name?: string | null;
};

type AbuseReport = {
  $id: string;
  listingId: string;
  envelopeId: string;
  sellerId: string;
  buyerId: string;
  message?: string;
  reason: string;
  status: string; // "open" | "in_review" | "resolved" | "dismissed" | etc
  createdAt: string;
};

export default function AdminAbusePage() {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [reports, setReports] = useState<AbuseReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Load / check user
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const me: any = await account.get();
        if (cancelled) return;

        const simple: SimpleUser = {
          id: me.$id,
          email: me.email || "",
          name: me.name || "",
        };

        const isAdminEmail =
          !!ADMIN_EMAIL &&
          !!simple.email &&
          simple.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        setUser(simple);
        setIsAdmin(isAdminEmail);
      } catch {
        if (!cancelled) {
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) setCheckingUser(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load abuse reports for admin
  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;

    async function loadReports() {
      setLoadingReports(true);
      setReportsError(null);

      try {
        const res: any = await databases.listDocuments(
          DB_ID,
          ABUSE_REPORTS_COLLECTION_ID,
          [
           Query.orderDesc("$createdAt"),
           // any other queries
        ]

        );

        if (cancelled) return;

        const docs = res.documents || [];
        const mapped: AbuseReport[] = docs.map((doc: any) => ({
          $id: doc.$id,
          listingId: doc.listingId,
          envelopeId: doc.envelopeId,
          sellerId: doc.sellerId,
          buyerId: doc.buyerId,
          message: doc.message,
          reason: doc.reason,
          status: doc.status || "open",
          createdAt: doc.createdAt || doc.$createdAt,
        }));

        setReports(mapped);
      } catch (err: any) {
        if (!cancelled) {
          console.error("Error loading abuse reports", err);
          const msg =
            err?.message ||
            err?.response?.message ||
            "Failed to load abuse reports.";
          setReportsError(msg);
        }
      } finally {
        if (!cancelled) setLoadingReports(false);
      }
    }

    loadReports();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  async function handleUpdateStatus(reportId: string, newStatus: string) {
    if (!isAdmin) return;
    setUpdatingId(reportId);
    setReportsError(null);

    try {
      await databases.updateDocument(
        DB_ID,
        ABUSE_REPORTS_COLLECTION_ID,
        reportId,
        { status: newStatus }
      );

      setReports((prev) =>
        prev.map((r) =>
          r.$id === reportId ? { ...r, status: newStatus } : r
        )
      );
    } catch (err: any) {
      console.error("Error updating report status", err);
      const msg =
        err?.message ||
        err?.response?.message ||
        "Failed to update report status.";
      setReportsError(msg);
    } finally {
      setUpdatingId(null);
    }
  }

  if (checkingUser) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <p className="text-sm text-slate-300">
            Checking your admin access…
          </p>
        </div>
      </main>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Admin – abuse reports
          </h1>
          <p className="text-sm text-slate-300">
            This page is only available to the Sealabid admin account.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-6">
        <header className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Admin
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Abuse &amp; message reports
          </h1>
          <p className="text-sm text-slate-300">
            Sellers can flag abusive or inappropriate buyer messages. Use this
            screen to review reports, record what you did, and keep a paper
            trail in case anything escalates.
          </p>
        </header>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link
            href="/admin"
            className="text-emerald-300 hover:text-emerald-200"
          >
            ← Back to admin home
          </Link>
          <span>
            Logged in as{" "}
            <span className="font-semibold text-emerald-300">
              {user.email}
            </span>
          </span>
        </div>

        {reportsError && (
          <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
            {reportsError}
          </div>
        )}

        {loadingReports && (
          <p className="text-sm text-slate-300">
            Loading abuse reports…
          </p>
        )}

        {!loadingReports && reports.length === 0 && !reportsError && (
          <p className="text-sm text-slate-300">
            No reports have been submitted yet.
          </p>
        )}

        {!loadingReports && reports.length > 0 && (
          <section className="space-y-3">
            {reports.map((r) => {
              const created = new Date(r.createdAt);
              let statusLabel = r.status || "open";
              let statusClass =
                "bg-slate-800 text-slate-200 border-slate-600/80";

              if (r.status === "open") {
                statusLabel = "Open";
                statusClass =
                  "bg-amber-500/10 text-amber-300 border-amber-500/60";
              } else if (r.status === "in_review") {
                statusLabel = "In review";
                statusClass =
                  "bg-sky-500/10 text-sky-300 border-sky-500/60";
              } else if (r.status === "resolved") {
                statusLabel = "Resolved";
                statusClass =
                  "bg-emerald-500/10 text-emerald-300 border-emerald-500/60";
              } else if (r.status === "dismissed") {
                statusLabel = "Dismissed";
                statusClass =
                  "bg-slate-800 text-slate-300 border-slate-600/80";
              }

              return (
                <div
                  key={r.$id}
                  className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-100">
                        Reported message / behaviour
                      </p>
                      <p className="mt-1 text-xs text-slate-300 whitespace-pre-wrap">
                        {r.reason}
                      </p>
                      {r.message && (
                        <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2">
                          <p className="text-[11px] font-semibold text-slate-200 mb-1">
                            Buyer message (as reported)
                          </p>
                          <p className="text-xs text-slate-300 whitespace-pre-wrap">
                            {r.message}
                          </p>
                        </div>
                      )}
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusClass}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="grid gap-2 text-[11px] text-slate-400 sm:grid-cols-2">
                    <p>
                      Listing ID:{" "}
                      <Link
                        href={`/listings/${r.listingId}`}
                        className="font-mono text-emerald-300 hover:text-emerald-200"
                      >
                        {r.listingId}
                      </Link>
                    </p>
                    <p>
                      Envelope ID:{" "}
                      <span className="font-mono text-slate-300">
                        {r.envelopeId}
                      </span>
                    </p>
                    <p>
                      Seller ID:{" "}
                      <span className="font-mono text-slate-300">
                        {r.sellerId}
                      </span>
                    </p>
                    <p>
                      Buyer ID:{" "}
                      <span className="font-mono text-slate-300">
                        {r.buyerId}
                      </span>
                    </p>
                    <p>
                      Reported:{" "}
                      <span className="font-mono text-slate-300">
                        {created.toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(r.$id, "in_review")}
                      disabled={updatingId === r.$id}
                      className="rounded-full border border-sky-500/70 px-3 py-1 font-semibold text-sky-200 hover:bg-sky-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Mark in review
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(r.$id, "resolved")}
                      disabled={updatingId === r.$id}
                      className="rounded-full border border-emerald-500/70 px-3 py-1 font-semibold text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Mark resolved
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(r.$id, "dismissed")}
                      disabled={updatingId === r.$id}
                      className="rounded-full border border-slate-500/70 px-3 py-1 font-semibold text-slate-200 hover:bg-slate-700/60 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
