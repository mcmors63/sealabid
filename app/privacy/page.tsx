// app/privacy/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Privacy – Sealabid",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Privacy Policy <span className="text-emerald-400">[Draft]</span>
          </h1>
          <Link
            href="/"
            className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
          >
            ← Back to home
          </Link>
        </div>

        <p className="text-sm text-slate-300">
          This is a placeholder privacy page for the early Sealabid concept.
          We will add a proper privacy policy before the platform is used for
          real data and transactions.
        </p>
      </div>
    </main>
  );
}
