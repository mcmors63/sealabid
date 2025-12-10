// app/page.tsx

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center">
          <div className="h-64 w-[36rem] rounded-full bg-emerald-500/20 blur-3xl" />
        </div>

        <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 pb-16 pt-10 sm:pt-16">
          {/* HERO */}
          <section className="grid gap-10 md:grid-cols-[3fr,2fr] md:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                <span className="text-[10px]">●</span>
                Sealed bids · Human decisions
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Buying is subjective.
                <span className="block text-emerald-300">
                  Your marketplace should be too.
                </span>
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Sealabid is a sealed-bid marketplace. Buyers make private offers
                in envelopes. Sellers only see how many envelopes there are –
                not the amounts – until the listing ends. Then, within{" "}
                <span className="font-semibold text-emerald-300">
                  2 hours
                </span>
                , the seller opens them and chooses who to sell to based on{" "}
                price <em>and</em> profile – or decides there&apos;s no sale.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/sell"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/40 hover:bg-emerald-400"
                >
                  Sell an item with sealed bids
                </Link>
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-xs font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300"
                >
                  Browse current listings
                </Link>
              </div>

              <p className="text-[11px] text-slate-500">
                Everyone must register and add a card before bidding or selling.
                Money is only taken when a seller accepts an offer.
              </p>
            </div>

            {/* Envelope visual */}
            <div className="relative">
              <div className="pointer-events-none absolute -left-10 -top-6 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl" />
              <div className="pointer-events-none absolute -right-6 bottom-0 h-20 w-20 rounded-full bg-cyan-500/20 blur-2xl" />

              <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 shadow-xl shadow-black/40">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  A listing on Sealabid
                </p>

                <p className="mt-3 text-sm font-semibold text-slate-50">
                  Handmade oak coffee table
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Seller sees:{" "}
                  <span className="font-semibold text-emerald-300">
                    4 sealed envelopes
                  </span>{" "}
                  – no amounts.
                </p>

                <div className="mt-4 flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex h-12 flex-1 items-center justify-center rounded-xl border border-amber-400/60 bg-gradient-to-br from-amber-500/20 to-amber-400/10 text-lg"
                    >
                      ✉️
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-2">
                  <div className="text-[11px]">
                    <p className="font-semibold text-slate-200">
                      Ends in 3 hours
                    </p>
                    <p className="text-slate-500">
                      Seller will have 2 hours to open envelopes and choose.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                    Subjective sale
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* BALLOON STEPS */}
          <section className="space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              How Sealabid fits you
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Step 1: Register */}
              <div className="relative rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-[0_0_40px_rgba(16,185,129,0.12)]">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-slate-950">
                    1
                  </span>
                  Register
                </div>
                <p className="text-sm font-semibold text-slate-50">
                  Create a profile that actually matters
                </p>
                <p className="mt-2 text-xs text-slate-300">
                  Sign up, verify your email and complete your profile – name,
                  account type (individual, business, charity), address and a
                  short story. Sellers use this when choosing a buyer.
                </p>
                <div className="mt-3 text-[11px] text-emerald-300">
                  <Link
                    href="/register"
                    className="underline underline-offset-2 hover:text-emerald-200"
                  >
                    Create your account →
                  </Link>
                </div>
              </div>

              {/* Step 2: How buying works */}
              <div className="relative rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-[0_0_40px_rgba(96,165,250,0.12)]">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-blue-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-slate-950">
                    2
                  </span>
                  How buying works
                </div>
                <p className="text-sm font-semibold text-slate-50">
                  Submit what the item is worth to you
                </p>
                <p className="mt-2 text-xs text-slate-300">
                  Browse listings and place a sealed bid. You see how many
                  envelopes exist, but never the amounts. You&apos;re never
                  “outbid” in public – you just decide your true maximum and
                  submit once.
                </p>
                <p className="mt-2 text-[11px] text-slate-400">
                  If the seller chooses you, your saved payment method is
                  charged for the amount you offered.
                </p>
              </div>

              {/* Step 3: How selling works */}
              <div className="relative rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-[0_0_40px_rgba(244,114,182,0.12)]">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-pink-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] text-slate-950">
                    3
                  </span>
                  How selling works
                </div>
                <p className="text-sm font-semibold text-slate-50">
                  List your item and choose your winner
                </p>
                <p className="mt-2 text-xs text-slate-300">
                  Upload photos, write an honest description and set a private
                  “make me happy” target. Choose 7, 14 or 21 days to advertise.
                  When the listing ends, you have 2 hours to open envelopes and
                  pick a buyer – or decide there&apos;s no sale.
                </p>
                <div className="mt-3 text-[11px] text-pink-200">
                  <Link
                    href="/sell"
                    className="underline underline-offset-2 hover:text-pink-100"
                  >
                    Start a sealed listing →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* EXPLAIN THE SUBJECTIVE BIT */}
          <section className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-[3fr,2fr]">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Why &quot;Buying is subjective&quot; actually matters
              </h2>
              <p className="text-sm text-slate-200">
                On most marketplaces the highest visible bid or the fastest
                click wins. Sealabid is different: we accept that value is
                personal. Something that&apos;s worth £20 to one person might be
                worth £200 to another – and sellers might care who it goes to.
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="mt-[3px] text-emerald-400">•</span>
                  <span>
                    <span className="font-semibold">
                      Bids are sealed, not public.
                    </span>{" "}
                    No bidding wars, no last-second sniping – just one honest
                    offer from each buyer.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-[3px] text-emerald-400">•</span>
                  <span>
                    <span className="font-semibold">
                      Profiles carry real weight.
                    </span>{" "}
                    A charity, a small business or a collector with a clear
                    story might win even if they&apos;re not the very highest
                    bidder.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-[3px] text-emerald-400">•</span>
                  <span>
                    <span className="font-semibold">
                      Sellers keep the final say.
                    </span>{" "}
                    When the envelopes are opened, the seller can choose a
                    winner or mark the listing as no sale. No auto-accept
                    traps.
                  </span>
                </li>
              </ul>
            </div>

            {/* Quick stats / reassurance */}
            <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                What you agree to when you list or bid
              </h3>
              <ul className="space-y-2 text-[13px] text-slate-300">
                <li className="flex gap-2">
                  <span className="mt-[3px] text-emerald-400">✓</span>
                  You understand the process is subjective – there is no
                  &quot;currently winning bidder&quot; and you may not win,
                  even with a strong offer.
                </li>
                <li className="flex gap-2">
                  <span className="mt-[3px] text-emerald-400">✓</span>
                  Sellers must make a decision within a fixed 2-hour window
                  after the listing ends.
                </li>
                <li className="flex gap-2">
                  <span className="mt-[3px] text-emerald-400">✓</span>
                  Buyers must have a validated payment method before bidding.
                  Money is only taken once an offer is accepted.
                </li>
                <li className="flex gap-2">
                  <span className="mt-[3px] text-emerald-400">✓</span>
                  A small listing fee may apply and can be refunded when a
                  successful sale goes through.
                </li>
              </ul>
              <div className="pt-1 text-[11px] text-slate-500">
                Full details are in our{" "}
                <Link
                  href="/terms"
                  className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
                >
                  Terms &amp; Conditions
                </Link>
                .
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-sky-500/10 p-[1px]">
            <div className="flex flex-col items-start justify-between gap-4 rounded-[22px] bg-slate-950 px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Ready to try a different kind of marketplace?
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  Create your profile, list an item or place your first sealed
                  bid. The fun starts when the envelopes open.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Get started in minutes
                </Link>
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center rounded-full border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-300"
                >
                  Just have a look first
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
