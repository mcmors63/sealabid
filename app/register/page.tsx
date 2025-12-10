// app/register/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ID } from "appwrite";
import { account } from "@/lib/appwriteClient";

type AccountType = "individual" | "business" | "charity";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [townCity, setTownCity] = useState("");
  const [postcode, setPostcode] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validatePassword(pw: string): string | null {
    if (pw.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/i.test(pw)) return "Password must contain at least one letter.";
    if (!/[0-9]/.test(pw)) return "Password must contain at least one number.";
    return null;
  }

  function validateForm(): string | null {
    if (!name.trim()) return "Please enter your name or organisation.";
    if (!email.trim()) return "Please enter your email address.";
    if (!password) return "Please choose a password.";
    if (password !== password2) return "Passwords do not match.";

    const pwError = validatePassword(password);
    if (pwError) return pwError;

    if (!addressLine1.trim()) return "Please enter your address line 1.";
    if (!townCity.trim()) return "Please enter your town / city.";
    if (!postcode.trim()) return "Please enter your postcode.";

    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const cleanEmail = email.trim();
      const cleanName = name.trim();

      // 1) Create user
      await account.create(ID.unique(), cleanEmail, password, cleanName);

      // 2) Create email/password session so we can set prefs + send verification
      await account.createEmailPasswordSession(cleanEmail, password);

      // 3) Save basic profile in preferences (no extra database needed yet)
      await account.updatePrefs({
        accountType,
        addressLine1: addressLine1.trim(),
        townCity: townCity.trim(),
        postcode: postcode.trim(),
      });

      // 4) Send verification email with stable redirect URL
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined"
          ? window.location.origin
          : "https://sealabid.com");

      const redirectUrl = `${baseUrl}/verify-email`;

      await account.createVerification(redirectUrl);

      // 5) Send them to verify-email info page
      router.push("/verify-email");
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.message ||
        err?.response?.message ||
        "Failed to create account. Please try again.";
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-md px-4 py-10 sm:py-14 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Create your <span className="text-emerald-400">Sealabid</span> account
        </h1>
        <p className="text-sm text-slate-300">
          One account for buying and selling. You&apos;ll need a verified email address
          before you can list items or place sealed bids.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Name / organisation
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe, Hope Charity, Smith & Co"
            />
          </div>

          {/* Account type */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Account type
            </label>
            <div className="flex gap-2 text-xs">
              {(["individual", "business", "charity"] as AccountType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAccountType(type)}
                  className={`flex-1 rounded-full border px-3 py-1.5 font-medium capitalize transition ${
                    accountType === type
                      ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              This helps sellers understand who&apos;s bidding – an individual, business
              or charity.
            </p>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Email address
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters, letters & numbers"
            />
          </div>

          {/* Confirm password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Confirm password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Type it again"
            />
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Address line 1
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="House / building and street"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Town / city
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
                value={townCity}
                onChange={(e) => setTownCity(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Postcode
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account & send verification"}
          </button>

          <p className="text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
            >
              Log in
            </Link>
            .
          </p>
        </form>
      </div>
    </main>
  );
}
