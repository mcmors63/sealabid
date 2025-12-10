// app/verify-email/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { account } from "@/lib/appwriteClient";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [status, setStatus] = useState<"idle" | "verifying" | "verified" | "error">(
    userId && secret ? "verifying" : "idle"
  );
  const [message, setMessage] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function doVerify() {
      if (!userId || !secret) return;

      try {
        setStatus("verifying");
        setMessage(null);

        await account.updateVerification(userId, secret);

        if (cancelled) return;
        setStatus("verified");
        setMessage(
          "Your email has been verified. You can now sell items and place sealed bids."
        );
      } catch (err: any) {
        console.error(err);
        if (cancelled) return;
        setStatus("error");
        const msg =
          err?.message ||
          err?.response?.message ||
          "Verification link is invalid or has expired.";
        setMessage(msg);
      }
    }

    if (userId && secret) {
      doVerify();
    }

    return () => {
      cancelled = true;
    };
  }, [userId, secret]);

  async function handleResend() {
    setResendMessage(null);
    setResendError(null);
    setResending(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined"
          ? window.location.origin
          : "https://sealabid.com");

      const redirectUrl = `${baseUrl}/verify-email`;

      await account.createVerification(redirectUrl);

      setResendMessage("We’ve sent you a fresh verification link.");
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.message ||
        err?.response?.message ||
        "Could not resend verification email. Make sure you are logged in.";
      setResendError(msg);
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-md px-4 py-10 sm:py-14 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Verify your <span className="text-emerald-400">email</span>
        </h1>

        {status === "verifying" && (
          <p className="text-sm text-slate-300">Checking your verification link…</p>
        )}

        {status === "verified" && message && (
          <div className="space-y-4">
            <div className="rounded-md border border-emerald-500/60 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
              {message}
            </div>
            <p className="text-sm text-slate-300">
              You can now create listings, upload photos and place sealed bids.
            </p>
            <div className="flex gap-2">
              <Link
                href="/sell"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Sell an item
              </Link>
              <Link
                href="/listings"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300"
              >
                Browse listings
              </Link>
            </div>
          </div>
        )}

        {(status === "idle" || status === "error") && (
          <div className="space-y-4 text-sm text-slate-200">
            {message && (
              <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                {message}
              </div>
            )}

            {!userId && !secret && (
              <p className="text-sm text-slate-300">
                We send a verification link to the email address you used when you
                registered. Click that link to confirm your address.
              </p>
            )}

            <p className="text-sm text-slate-300">
              If you haven&apos;t received the email after a few minutes, check your spam
              folder or ask us to resend it.
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? "Resending verification email…" : "Resend verification email"}
            </button>

            {resendMessage && (
              <div className="rounded-md border border-emerald-500/60 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
                {resendMessage}
              </div>
            )}
            {resendError && (
              <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                {resendError}
              </div>
            )}

            <p className="text-[11px] text-slate-500">
              You need a verified email address to sell items or place sealed bids on
              Sealabid.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
