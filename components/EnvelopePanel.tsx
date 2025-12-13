"use client";

import { useEffect, useState, FormEvent } from "react";
import { Client, Account, Databases, ID, Query } from "appwrite";

// -----------------------------
// Appwrite browser client
// -----------------------------
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);
const databases = new Databases(client);

const ENVELOPES_DB_ID = process.env.NEXT_PUBLIC_APPWRITE_ENVELOPES_DB_ID!;
const ENVELOPES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_ENVELOPES_COLLECTION_ID!;

// -----------------------------
// Simple abuse / safety rules
// -----------------------------
const MAX_MESSAGE_LENGTH = 800;

// Very simple phrase filters – this is NOT perfect,
// just catches clearly dodgy stuff. You can expand this list later.
const BLOCKED_PATTERNS: RegExp[] = [
  /kill/i,
  /death/i,
  /threat/i,
  /violence/i,
  /abuse/i,
];

function checkMessageForAbuse(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null; // empty is allowed

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return "Your message is too long. Please keep it under 800 characters.";
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return "Your message looks like it may contain abusive or threatening language. Please reword it.";
    }
  }

  return null;
}

// -----------------------------
// Types
// -----------------------------
type EnvelopeStatus = "submitted" | "withdrawn" | "winner" | "rejected";

type EnvelopeDoc = {
  $id: string;
  listingId: string;
  buyerId: string;
  amount: number;
  message?: string;
  status: EnvelopeStatus;
};

type EnvelopePanelProps = {
  listingId: string;
  // ISO string – envelope deadline for this listing
  deadline: string;
};

export default function EnvelopePanel({ listingId, deadline }: EnvelopePanelProps) {
  // Auth + envelope state
  const [user, setUser] = useState<any | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [envelope, setEnvelope] = useState<EnvelopeDoc | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const [loadingEnvelope, setLoadingEnvelope] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // -----------------------------
  // Derived values
  // -----------------------------
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const envelopesClosed = now >= deadlineDate;

  // EDIT RULE:
  // - Before deadline
  // - Logged in
  // - Either no envelope yet OR envelope is still "submitted"
  const canEdit =
    !envelopesClosed &&
    !!user &&
    (!envelope || envelope.status === "submitted");

  // -----------------------------
  // Load current user
  // -----------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      setUserLoading(true);
      try {
        const current = await account.get();
        if (!cancelled) {
          setUser(current);
        }
      } catch (err) {
        // Not logged in – that's fine, just keep user = null
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) setUserLoading(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  // -----------------------------
  // Load existing envelope for this user + listing
  // -----------------------------
  useEffect(() => {
    if (!user) {
      setEnvelope(null);
      setLoadingEnvelope(false);
      return;
    }

    let cancelled = false;

    async function loadEnvelope() {
      setLoadingEnvelope(true);
      setError(null);
      try {
        const res = await databases.listDocuments<EnvelopeDoc>(
          ENVELOPES_DB_ID,
          ENVELOPES_COLLECTION_ID,
          [
            Query.equal("listingId", listingId),
            Query.equal("buyerId", user.$id),
            Query.orderDesc("$createdAt"),
            Query.limit(1),
          ]
        );

        if (cancelled) return;

        if (res.documents.length > 0) {
          const doc = res.documents[0] as any as EnvelopeDoc;
          setEnvelope(doc);
          setAmount(doc.amount?.toString() ?? "");
          setMessage(doc.message ?? "");
        } else {
          setEnvelope(null);
          setAmount("");
          setMessage("");
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Error loading envelope", err);
          setError("Could not load your envelope. Please try again.");
        }
      } finally {
        if (!cancelled) setLoadingEnvelope(false);
      }
    }

    loadEnvelope();
    return () => {
      cancelled = true;
    };
  }, [user, listingId]);

  // -----------------------------
  // Handlers
  // -----------------------------
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError("You need to be logged in to submit an envelope.");
      return;
    }

    if (envelopesClosed) {
      setError("Envelopes are closed for this listing.");
      return;
    }

    const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid offer amount.");
      return;
    }

    // --- Abuse / safety check for message ---
    const abuseError = checkMessageForAbuse(message);
    if (abuseError) {
      setError(abuseError);
      return;
    }

    setSaving(true);
    try {
      if (envelope && envelope.status === "submitted") {
        // Update existing envelope – stays "submitted"
        const updated = await databases.updateDocument<EnvelopeDoc>(
          ENVELOPES_DB_ID,
          ENVELOPES_COLLECTION_ID,
          envelope.$id,
          {
            amount: numericAmount,
            message: message.trim() || undefined,
            status: "submitted",
          }
        );

        const doc = updated as any as EnvelopeDoc;
        setEnvelope(doc);
        setSuccess("Envelope updated.");
      } else if (!envelope) {
        // Create new envelope
        const created = await databases.createDocument<EnvelopeDoc>(
          ENVELOPES_DB_ID,
          ENVELOPES_COLLECTION_ID,
          ID.unique(),
          {
            listingId,
            buyerId: user.$id,
            amount: numericAmount,
            message: message.trim() || undefined,
            status: "submitted", // "pending"
          }
        );

        const doc = created as any as EnvelopeDoc;
        setEnvelope(doc);
        setSuccess("Envelope submitted.");
      } else {
        // Already winner/rejected – no edits allowed
        setError("This envelope can no longer be changed.");
      }
    } catch (err: any) {
      console.error("Error saving envelope", err);
      setError("Could not save your envelope. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // Render helpers
  // -----------------------------
  function renderStatus() {
    if (envelopesClosed) {
      // After deadline
      if (envelope) {
        if (envelope.status === "winner") {
          return (
            <p className="text-sm text-green-700 font-medium">
              The seller has chosen your envelope as the winner. They&apos;ll be
              in touch with next steps.
            </p>
          );
        }

        if (envelope.status === "rejected") {
          return (
            <p className="text-sm text-gray-700">
              The seller has chosen a different envelope. Your offer is now
              closed for this listing.
            </p>
          );
        }

        if (envelope.status === "withdrawn") {
          return (
            <p className="text-sm text-gray-700">
              You previously withdrew your envelope. This listing has now
              closed.
            </p>
          );
        }

        // submitted but after deadline – seller deciding
        return (
          <p className="text-sm text-gray-700 font-medium">
            Envelopes are closed. Your offer has been submitted and is now
            locked while the seller reviews all envelopes.
          </p>
        );
      }

      // No envelope at all, after deadline
      return (
        <p className="text-sm text-gray-700 font-medium">
          Envelopes closed – you can no longer submit an offer for this
          listing.
        </p>
      );
    }

    // Before deadline
    if (!user) {
      return (
        <p className="text-sm text-gray-700">
          You&apos;re not logged in. Log in or create an account to submit a
          sealed envelope.
        </p>
      );
    }

    if (envelope) {
      if (envelope.status === "winner") {
        return (
          <p className="text-sm text-green-700 font-medium">
            The seller has already chosen your envelope as the winner. You
            can&apos;t change it now.
          </p>
        );
      }

      if (envelope.status === "rejected") {
        return (
          <p className="text-sm text-gray-700">
            The seller has already chosen a different envelope. You can&apos;t
            change this one now.
          </p>
        );
      }

      if (envelope.status === "withdrawn") {
        return (
          <p className="text-sm text-gray-700">
            You previously withdrew your envelope. New envelopes are not
            allowed for this listing.
          </p>
        );
      }

      // submitted + before deadline
      return (
        <p className="text-sm text-gray-700">
          You&apos;ve already submitted an envelope. You can update your offer
          while envelopes are still open.
        </p>
      );
    }

    // No envelope yet, before deadline
    return (
      <p className="text-sm text-gray-700">
        Submit one sealed envelope. The seller will choose a buyer after the
        deadline. Other buyers can&apos;t see your offer.
      </p>
    );
  }

  // -----------------------------
  // Main render
  // -----------------------------
  return (
    <section className="mt-6 max-w-xl border border-gray-200 rounded-xl bg-white shadow-sm p-5">
      <h2 className="text-lg font-semibold mb-1">Submit your sealed envelope</h2>

      <p className="text-xs text-gray-500 mb-3">
        Deadline:{" "}
        <span className="font-medium">
          {deadlineDate.toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </p>

      {renderStatus()}

      {error && (
        <div className="mt-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
          {success}
        </div>
      )}

      {(userLoading || loadingEnvelope) && (
        <p className="mt-3 text-sm text-gray-500">Loading your envelope…</p>
      )}

      {/* Form */}
      {user && !envelopesClosed && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Offer amount (£)
            </label>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!canEdit || saving}
              placeholder="e.g. 12500"
            />
            {envelope && (
              <p className="mt-1 text-xs text-green-700">
                Current submitted offer:{" "}
                <span className="font-semibold">
                  £
                  {envelope.amount.toLocaleString("en-GB", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message to the seller (optional)
            </label>
            <textarea
              id="message"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black min-h-[80px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!canEdit || saving}
              placeholder="Tell the seller anything relevant about your offer, timing, or situation. Keep it polite and factual – abuse isn’t allowed."
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={!canEdit || saving}
              className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving
                ? "Saving…"
                : envelope
                ? "Update envelope"
                : "Submit envelope"}
            </button>
          </div>

          <p className="text-[11px] text-gray-500">
            By submitting, you&apos;re making a{" "}
            <span className="font-medium">sealed offer</span>. The seller will
            review all envelopes together after the deadline and choose a buyer
            at their discretion. Messages that contain abuse or threats are not
            allowed and may lead to your account being blocked.
          </p>
        </form>
      )}

      {/* If not logged in and not loading */}
      {!user && !userLoading && (
        <p className="mt-4 text-xs text-gray-500">
          You must log in or create an account to submit a sealed envelope.
        </p>
      )}
    </section>
  );
}
