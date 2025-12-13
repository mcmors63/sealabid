// app/fees/page.tsx
"use client";

import Link from "next/link";

export default function FeesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Sealabid
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Fees &amp; commission
          </h1>
          <p className="text-xs text-slate-400">
            This page explains exactly what you pay to use Sealabid – and what
            happens to the £10 listing fee when you decide to accept an offer.
          </p>
        </header>

        {/* Simple summary */}
        <section className="grid gap-4 md:grid-cols-3 text-xs sm:text-sm">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              1. Listing fee
            </h2>
            <p className="mt-2 text-slate-200">
              Every listing costs{" "}
              <span className="font-semibold text-emerald-300">£10</span>.
            </p>
            <p className="mt-1 text-slate-300">
              If you accept an offer and the sale completes, that £10 is
              treated as a{" "}
              <span className="font-semibold">credit against our commission</span>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              2. Seller commission
            </h2>
            <p className="mt-2 text-slate-200">
              We charge a percentage of the final accepted price:
            </p>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li>Up to £4,999 – 10%</li>
              <li>£5,000 – £9,999 – 8%</li>
              <li>£10,000 – £24,999 – 6%</li>
              <li>£25,000+ – 5%</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              3. Buyer fees
            </h2>
            <p className="mt-2 text-slate-200">
              There is currently{" "}
              <span className="font-semibold">no buyer premium</span> charged by
              Sealabid. Buyers pay the amount they agree with the seller, plus
              any payment-provider charges that may apply.
            </p>
          </div>
        </section>

        {/* Commission table */}
        <section className="space-y-3 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            Commission bands for sellers
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            When you accept an offer and the sale completes, we calculate our fee
            using the final sale price and the band it falls into.
          </p>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            <table className="min-w-full text-xs sm:text-sm">
              <thead className="bg-slate-900/90">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-300">
                    Final sale price
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-300">
                    Commission rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="px-4 py-2 text-slate-200">Up to £4,999</td>
                  <td className="px-4 py-2 text-slate-200">10%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-200">£5,000 – £9,999</td>
                  <td className="px-4 py-2 text-slate-200">8%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-200">
                    £10,000 – £24,999
                  </td>
                  <td className="px-4 py-2 text-slate-200">6%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-200">£25,000+</td>
                  <td className="px-4 py-2 text-slate-200">5%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Listing fee explanation */}
        <section className="space-y-3 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            What happens to the £10 listing fee?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            The listing fee is there to stop throwaway listings and to help cover
            the cost of running the platform. Here&apos;s how it works:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-xs sm:text-sm text-slate-300">
            <li>
              You pay <span className="font-semibold">£10</span> when you create
              a listing.
            </li>
            <li>
              If you accept an offer and the sale completes, that £10 is treated
              as a <span className="font-semibold">credit</span> and is{" "}
              <span className="font-semibold">
                deducted from the commission we charge
              </span>
              .
            </li>
            <li>
              If you don&apos;t accept any offer, or the sale does not complete
              for reasons within your control, the £10 listing fee is{" "}
              <span className="font-semibold">not refunded</span>.
            </li>
          </ul>

          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-xs sm:text-sm text-emerald-100">
            <p className="font-semibold text-emerald-200">
              In plain English:
            </p>
            <p className="mt-1">
              If you go ahead with a sale, you don&apos;t &quot;lose&quot; the
              £10 – it counts against what you owe us. If you walk away from all
              offers, you&apos;ve paid £10 for exposure and enquiries.
            </p>
          </div>
        </section>

        {/* Worked examples */}
        <section className="space-y-3 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            Examples of how your fee is worked out
          </h2>

          <div className="grid gap-4 md:grid-cols-2 text-xs sm:text-sm">
            {/* Example 1 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Example 1 – sale at £3,000
              </p>
              <ul className="space-y-1 text-slate-200">
                <li>Final accepted price: £3,000</li>
                <li>Band: Up to £4,999 → 10%</li>
                <li>Commission before credit: 10% of £3,000 = £300</li>
                <li>Less your £10 listing fee credit: £300 − £10 = £290</li>
              </ul>
              <p className="mt-1 text-slate-300">
                <span className="font-semibold text-emerald-300">
                  You receive: £3,000 − £290 = £2,710
                </span>{" "}
                (before any payment-provider charges).
              </p>
            </div>

            {/* Example 2 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Example 2 – sale at £12,000
              </p>
              <ul className="space-y-1 text-slate-200">
                <li>Final accepted price: £12,000</li>
                <li>Band: £10,000 – £24,999 → 6%</li>
                <li>Commission before credit: 6% of £12,000 = £720</li>
                <li>Less your £10 listing fee credit: £720 − £10 = £710</li>
              </ul>
              <p className="mt-1 text-slate-300">
                <span className="font-semibold text-emerald-300">
                  You receive: £12,000 − £710 = £11,290
                </span>{" "}
                (before any payment-provider charges).
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            These examples are for illustration only. Actual payouts can vary
            depending on payment-provider charges, refunds, chargebacks or other
            adjustments.
          </p>
        </section>

        {/* When fees are charged */}
        <section className="space-y-3 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            When fees are charged
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-xs sm:text-sm text-slate-300">
            <li>
              The <span className="font-semibold">£10 listing fee</span> is
              charged when you create the listing.
            </li>
            <li>
              Commission is calculated and charged when a seller accepts an offer
              and the sale is confirmed.
            </li>
            <li>
              Where possible, our fee is deducted from the buyer&apos;s payment
              before the remainder is passed on to the seller.
            </li>
          </ul>
          <p className="text-[11px] text-slate-500">
            The precise payment flow may depend on the payment provider we use
            (for example, card processor or wallet service). Any such provider
            will have its own terms, which you must also agree to.
          </p>
        </section>

        {/* Changes and legal cross-link */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            Changes to fees
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            We may update our fees and commission structure in future. If we do,
            changes will normally apply only to new listings created after the
            change, not listings that were already live.
          </p>
          <p className="text-xs sm:text-sm text-slate-300">
            For full legal details of how Sealabid operates, please read our{" "}
            <Link
              href="/terms"
              className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
            >
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </section>

        {/* Back link */}
        <div className="pt-2">
          <Link
            href="/"
            className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
