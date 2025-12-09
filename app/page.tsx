// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* HERO */}
      <section className="px-4 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-emerald-400 uppercase">
                Sealabid
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Buying is <span className="text-emerald-400">Subjective</span>.
              </h1>
              <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-300">
                A sealed-bid marketplace where sellers don&apos;t just pick the
                highest price – they choose the buyer. Bids stay hidden until
                the end, then the seller decides who wins based on{" "}
                <span className="font-semibold">price</span> and{" "}
                <span className="font-semibold">profile</span>.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition"
                >
                  Get started as a seller
                </Link>
                <Link
                  href="/current-listings"
                  className="inline-flex items-center justify-center rounded-full border border-slate-500 px-6 py-2.5 text-sm font-semibold text-slate-50 hover:border-emerald-400 hover:text-emerald-300 transition"
                >
                  Browse listings (coming soon)
                </Link>
              </div>
            </div>

            <div className="mt-6 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-emerald-500/10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">
                At a glance
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  <span>
                    Buyers place <span className="font-semibold">sealed bids</span>. 
                    Nobody sees prices until the auction ends.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  <span>
                    Seller has <span className="font-semibold">15 minutes</span> 
                    after the timer ends to open bids and choose a winner.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  <span>
                    Every bid is a <span className="font-semibold">binding offer</span>{" "}
                    if the seller accepts it and payment is approved.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  <span>
                    Sellers pay a <span className="font-semibold">£10 listing fee</span>, 
                    refunded if the sale completes successfully.
                  </span>
                </li>
              </ul>
              <p className="mt-4 text-[11px] leading-snug text-slate-400">
                This is an early preview of Sealabid. The information here is a
                plain-English summary of how the platform is intended to work
                and is not legal advice.
              </p>
            </div>
          </header>

          {/* HOW IT WORKS */}
          <section className="grid gap-8 md:grid-cols-2">
            {/* Sellers */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-slate-50">
                How it works for sellers
              </h2>
              <ol className="mt-4 space-y-3 text-sm text-slate-200">
                <li>
                  <span className="font-semibold text-emerald-400">1.</span>{" "}
                  Create an account and set up your seller profile.
                </li>
                <li>
                  <span className="font-semibold text-emerald-400">2.</span>{" "}
                  List your item: upload photos, write a description, and choose
                  a marketing window of <span className="font-semibold">7</span>
                  , <span className="font-semibold">14</span>, or{" "}
                  <span className="font-semibold">21</span> days.
                </li>
                <li>
                  <span className="font-semibold text-emerald-400">3.</span>{" "}
                  Pay a <span className="font-semibold">£10 listing fee</span>.
                  If you accept a bid and the sale completes, that £10 is
                  refunded.
                </li>
                <li>
                  <span className="font-semibold text-emerald-400">4.</span>{" "}
                  During the auction you only see{" "}
                  <span className="font-semibold">envelopes</span> – the number
                  of bids, never the amounts.
                </li>
                <li>
                  <span className="font-semibold text-emerald-400">5.</span>{" "}
                  When the timer ends, you have{" "}
                  <span className="font-semibold">15 minutes</span> to open the
                  envelopes, view each bid and buyer profile, and choose:
                  highest price, best profile, or{" "}
                  <span className="font-semibold">no sale</span>.
                </li>
                <li>
                  <span className="font-semibold text-emerald-400">6.</span>{" "}
                  If you accept a bid, the buyer&apos;s stored payment method is
                  charged and Sealabid takes a percentage of the final price.
                </li>
              </ol>
            </div>

            {/* Buyers */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-slate-50">
                How it works for buyers
              </h2>
              <ol className="mt-4 space-y-3 text-sm text-slate-200">
                <li>
                  <span className="font-semibold text-emerald-400">1.</span>{" "}
                  Create an account and build a{" "}
                  <span className="font-semibold">strong profile</span> – who
                  you are, what you do, charity or cause if relevant.
                </li>
                <li>
                  <span className="font-semibold text-emerald-400">2.</span>{" "}
                  Add and verify a payment method before you bid. This helps
                  keep time-wasters out.
                </li>
                <li>
                  <span className="font-semibold text-emerald-400">3.</span>{" "}
                  Place your <span className="font-semibold">sealed bid</span>.
                  You won&apos;t see other bids or whether you&apos;re
                  &quot;winning&quot;.
                </li>
                <li>
                  <span className="font-semibold text-emerald-400">4.</span>{" "}
                  When you bid, you are making a{" "}
                  <span className="font-semibold">binding offer</span> at that
                  price if the seller chooses you and your payment is approved.
                </li>
                <li>
                  <span className="font-semibold text-emerald-400">5.</span>{" "}
                  At the end of the auction, the seller compares bids and
                  profiles and chooses a buyer.{" "}
                  <span className="font-semibold">
                    The highest bid does not always win.
                  </span>
                </li>
                <li>
                  <span className="font-semibold text-emerald-400">6.</span>{" "}
                  If you&apos;re not chosen, that&apos;s it – you don&apos;t get
                  ranking or feedback. Buying here is{" "}
                  <span className="font-semibold">subjective</span>.
                </li>
              </ol>
            </div>
          </section>

          {/* KEY RULES */}
          <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-slate-50">
              Core rules of Sealabid
            </h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  This is a <span className="font-semibold">sealed-bid</span>{" "}
                  marketplace: bid amounts stay hidden until the auction ends.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  Sellers can choose any bid or{" "}
                  <span className="font-semibold">no sale</span>. The highest
                  bid is not guaranteed to win.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  Every bid is a{" "}
                  <span className="font-semibold">binding offer</span> if
                  accepted and payment succeeds. Don&apos;t bid more than you
                  can afford.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  Sealabid charges a{" "}
                  <span className="font-semibold">
                    percentage of the final price
                  </span>{" "}
                  on completed sales. Exact fees will be clearly shown before
                  you list or accept.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  Buyers and sellers can leave feedback on each other to build
                  reputation and reduce bad behaviour.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  Discrimination, harassment and abusive content in profiles or
                  messages is not allowed and may lead to removal from the
                  platform.
                </span>
              </li>
            </ul>
          </section>

          {/* FOOTER */}
          <footer className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Sealabid. Buying is subjective.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/terms" className="hover:text-emerald-300">
                Terms (coming soon)
              </Link>
              <Link href="/privacy" className="hover:text-emerald-300">
                Privacy (coming soon)
              </Link>
              <span className="text-slate-600">
                Early concept build – not yet live for real trading.
              </span>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
