// components/SiteFooter.tsx
"use client";

import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-slate-800 bg-slate-950/90">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} Sealabid.{" "}
          <span className="text-slate-500">Buying is subjective.</span>
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/terms"
            className="hover:text-emerald-300 underline underline-offset-2"
          >
            Terms &amp; Conditions
          </Link>
          <Link
            href="/privacy"
            className="hover:text-emerald-300 underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          <Link
            href="/cookies"
            className="hover:text-emerald-300 underline underline-offset-2"
          >
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
