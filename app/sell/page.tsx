// app/sell/page.tsx
"use client";

import { FormEvent, useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import { ID, Permission, Role } from "appwrite";
import { account, databases, storage } from "@/lib/appwriteClient";

const DB_ID = "sealabid_main_db";
const LISTINGS_COLLECTION_ID = "listings";
const LISTING_IMAGES_BUCKET_ID = "listing_images";

type DurationOption = 7 | 14 | 21;

type Category =
  | "art"
  | "collectibles"
  | "fashion"
  | "tech"
  | "home"
  | "vehicles"
  | "charity"
  | "other";

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "art", label: "Art & prints" },
  { value: "collectibles", label: "Collectibles & memorabilia" },
  { value: "fashion", label: "Fashion & accessories" },
  { value: "tech", label: "Tech & gadgets" },
  { value: "home", label: "Home & furnishings" },
  { value: "vehicles", label: "Vehicles & related" },
  { value: "charity", label: "Charity / fundraising items" },
  { value: "other", label: "Other" },
];

// -----------------------------
// Listing reference helper
// -----------------------------
// Generates IDs like: SL25-A3F9
function generateListingReference(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // "25"
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase(); // "A3F9"
  return `SL${year}-${rand}`; // "SL25-A3F9"
}

export default function SellPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userVerified, setUserVerified] = useState<boolean | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [startingPrice, setStartingPrice] = useState("");
  const [durationDays, setDurationDays] = useState<DurationOption>(7);
  const [confirmRules, setConfirmRules] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check logged-in user + verification
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const me = await account.get();
        if (!cancelled) {
          setUserId(me.$id);
          // Appwrite user has emailVerification flag
          // @ts-ignore – type may not expose but it's there
          setUserVerified(Boolean(me.emailVerification));
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setAuthError("You must be logged in to create a listing.");
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

  function validateForm(): string | null {
    if (!title.trim()) return "Please add a title for your item.";
    if (!description.trim()) return "Please add a clear description.";
    if (!category) return "Please select a category for your item.";
    if (!confirmRules)
      return "You must confirm that you understand how sealed bids and subjective choice work.";
    if (!userVerified)
      return "You must verify your email before creating a listing.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!userId) {
      setError("You must be logged in to create a listing.");
      return;
    }
    if (!userVerified) {
      setError("You must verify your email before creating a listing.");
      return;
    }

    const basicError = validateForm();
    if (basicError) {
      setError(basicError);
      return;
    }

    // Parse "make me happy" target (optional, whole pounds)
    let startingPriceNumber: number | null = null;
    if (startingPrice.trim()) {
      const cleaned = startingPrice.replace(/[^0-9]/g, "");
      const parsed = Number(cleaned);

      if (!Number.isFinite(parsed) || parsed < 0) {
        setError(
          'Your "make me happy" target must be a valid whole number of pounds (or leave it blank).'
        );
        return;
      }

      startingPriceNumber = Math.round(parsed);
    }

    setSubmitting(true);

    try {
      const now = new Date();
      const msPerDay = 24 * 60 * 60 * 1000;
      const endsAt = new Date(
        now.getTime() + durationDays * msPerDay
      ).toISOString();

      // Generate human-friendly reference code
      const reference = generateListingReference();

      const data: any = {
        reference,
        title: title.trim(),
        description: description.trim(),
        category,
        durationDays,
        endsAt,
        status: "active",
        sellerId: userId,
        bidsCount: 0,
      };

      if (startingPriceNumber !== null) {
        data.startingPrice = startingPriceNumber;
      }

      const permissions = [
        Permission.read(Role.any()),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ];

      // 1) Create listing document
      const created = await databases.createDocument(
        DB_ID,
        LISTINGS_COLLECTION_ID,
        ID.unique(),
        data,
        permissions
      );

      const listingId = created.$id;

      // 2) Upload images (if any)
      let imageFileIds: string[] = [];

      if (files.length > 0) {
        for (const file of files) {
          const uploaded: any = await storage.createFile(
            LISTING_IMAGES_BUCKET_ID,
            ID.unique(),
            file,
            [
              Permission.read(Role.any()),
              Permission.update(Role.user(userId)),
              Permission.delete(Role.user(userId)),
            ]
          );
          imageFileIds.push(uploaded.$id);
        }
      }

      // 3) Attach image IDs to listing
      if (imageFileIds.length > 0) {
        await databases.updateDocument(
          DB_ID,
          LISTINGS_COLLECTION_ID,
          listingId,
          {
            imageFileIds,
          }
        );
      }

      setSuccessMessage(
        "Your listing has been created. The £10 listing fee will apply when we wire up payments."
      );
      setTitle("");
      setDescription("");
      setCategory("");
      setStartingPrice("");
      setDurationDays(7);
      setConfirmRules(false);
      setFiles([]);
    } catch (err: any) {
      console.error(err);
      const message =
        err?.message ||
        err?.response?.message ||
        "Failed to create listing. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;

    // If user cleared the input
    if (!fileList || fileList.length === 0) {
      setFiles([]);
      return;
    }

    const incoming = Array.from(fileList);

    setFiles((prev) => {
      // Build a simple uniqueness key (name + size + lastModified)
      const existingKeys = new Set(
        prev.map((f) => `${f.name}_${f.size}_${f.lastModified}`)
      );

      const newOnes = incoming.filter(
        (f) => !existingKeys.has(`${f.name}_${f.size}_${f.lastModified}`)
      );

      const combined = [...prev, ...newOnes];

      // Hard cap at 6 images
      return combined.slice(0, 6);
    });
  }

  if (checkingUser) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-md px-4 py-10 sm:py-14">
          <p className="text-sm text-slate-300">Checking your account…</p>
        </div>
      </main>
    );
  }

  if (authError || !userId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-md px-4 py-10 sm:py-14 space-y-3">
          <p className="text-sm text-red-300">
            {authError || "You must be logged in to create a listing."}
          </p>
          <div className="flex gap-2">
            <Link
              href="/login"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Go to login
            </Link>
            <Link
              href="/register"
              className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300"
            >
              Register
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const emailNotVerified = userVerified === false;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-xl px-4 py-10 sm:py-14 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Sell an <span className="text-emerald-400">item</span>
          </h1>
          <Link
            href="/"
            className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
          >
            ← Back to home
          </Link>
        </div>

        <p className="text-sm text-slate-300">
          Create a listing that buyers can place sealed bids on. Add clear photos,
          choose a category and set an optional private &quot;make me happy&quot;
          target.
        </p>

        {/* FEES & COMMISSION SECTION */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-200 space-y-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Fees & commission
          </h2>
          <p>
            <span className="font-semibold text-emerald-300">Listing fee:</span>{" "}
            £10.00, charged when you publish your listing.
          </p>
          <p>
            If you decide to accept an offer, that £10 is{" "}
            <span className="font-semibold">credited back</span> in your final
            settlement – it comes off the fees you pay. If you don&apos;t accept
            any offer (no sale), the £10 listing fee is not refunded.
          </p>
          <div className="mt-1">
            <p className="font-semibold text-[11px] text-slate-300">
              Commission bands (taken from the final agreed price):
            </p>
            <ul className="mt-1 space-y-1">
              <li>• Up to £4,999 – 10%</li>
              <li>• £5,000 – £9,999 – 8%</li>
              <li>• £10,000 – £24,999 – 6%</li>
              <li>• £25,000+ – 5%</li>
            </ul>
          </div>
          <p className="text-[11px] text-slate-400">
            In short: if you accept an offer, you effectively just pay the
            commission on the sale price – the £10 listing fee is credited back
            against those fees when we do the payout.
          </p>
        </section>

        {emailNotVerified && (
          <div className="rounded-md border border-amber-500/60 bg-amber-950/40 px-3 py-2 text-xs text-amber-100">
            Your email address is not verified. You can fill this form out, but you
            won&apos;t be able to publish the listing until you verify.{" "}
            <Link
              href="/verify-email"
              className="underline underline-offset-2 font-semibold"
            >
              Verify your email.
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-md border border-emerald-500/60 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
              {successMessage}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Listing title
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Original oil painting, vintage watch, limited edition print"
            />
          </div>

          {/* Category dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Category</label>
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={category || ""}
              onChange={(e) => setCategory((e.target.value as Category) || "")}
            >
              <option value="">Select a category…</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Category helps buyers find your listing and powers search and filters.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Description
            </label>
            <textarea
              className="min-h-[120px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what it is, condition, provenance, anything a serious buyer would want to know."
            />
          </div>

          {/* Photos */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Photos of the item
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-100 hover:file:bg-slate-700"
            />
            <p className="text-[11px] text-slate-400">
              You can upload up to 6 images. Clear, honest photos make it much
              easier for buyers to value your item.
            </p>
            {files.length > 0 && (
              <p className="text-[11px] text-emerald-300">
                {files.length} image{files.length === 1 ? "" : "s"} selected.
              </p>
            )}
          </div>

          {/* Make me happy target */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              My “make me happy” target (private)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300">£</span>
              <input
                type="text"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="Whole pounds only, or leave blank"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              This is your private “make me happy” number. Buyers never see it. It
              just helps you decide later whether a sealed offer feels good enough to
              accept.
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              How long should the listing run?
            </label>
            <div className="flex gap-2 text-xs">
              {[7, 14, 21].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDurationDays(d as DurationOption)}
                  className={`flex-1 rounded-full border px-3 py-1.5 font-medium transition ${
                    durationDays === d
                      ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {d} days
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              When you create the listing, we calculate an end time based on this
              choice. At the end, envelopes can be opened and you&apos;ll have 2
              hours to decide.
            </p>
          </div>

          {/* Rules confirm */}
          <div className="flex items-start gap-2">
            <input
              id="confirmRules"
              type="checkbox"
              className="mt-[3px] h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              checked={confirmRules}
              onChange={(e) => setConfirmRules(e.target.checked)}
            />
            <label
              htmlFor="confirmRules"
              className="text-xs text-slate-300 leading-snug"
            >
              I understand that buyers place sealed bids, I will not see amounts
              until the end of the listing, and when it ends I have up to 2 hours to
              choose a buyer (or no sale) based on both price and profile.
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !userVerified}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating listing..." : "Create listing (£10 listing fee)"}
          </button>

          <p className="text-[11px] text-slate-500">
            When payments are connected, we&apos;ll charge a £10 listing fee when
            you publish. If you accept an offer, that £10 is credited back in your
            final settlement and you just pay the commission band shown above.
          </p>
        </form>
      </div>
    </main>
  );
}
