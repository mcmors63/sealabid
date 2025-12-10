// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="px-4 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* HERO – BUYING IS SUBJECTIVE */}
        <section className="grid gap-8 lg:grid-cols-[1.4fr,1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-emerald-400 uppercase">
              Sealabid
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Buying is <span className="text-emerald-400">Subjective</span>.
            </h1>
            <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-300">
              Sealabid is a sealed-bid marketplace where the seller doesn&apos;t
              just chase the highest price. Bids stay hidden until the end, then
              the seller chooses who wins based on{" "}
              <span className="font-semibold">price</span> and{" "}
              <span className="font-semibold">profile</span> – an individual, a
              business, a charity or a cause they want to support.
            </p>

            <p className="mt-3 max-w-xl text-xs sm:text-sm text-slate-400">
              If you use Sealabid, you accept that the{" "}
              <span className="font-semibold">highest bid does not always win</span>. 
              You&apos;re bidding what the item is worth to you – not playing a
              public bidding game.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition"
              >
                Create a Sealabid account
              </Link>
              <span className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-300">
                Early concept – not yet live for real trading
              </span>
            </div>
          </div>

          {/* SIDE CARD – QUICK IDEA SUMMARY */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-emerald-500/10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">
              Inside a Sealabid auction
            </p>
            <ul className="space-y-3 text-sm text-slate-200">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  Buyers place <span className="font-semibold">sealed bids</span>. 
                  Nobody sees anyone else&apos;s amounts.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  Sellers only see the number of bids – shown as{" "}
                  <span className="font-semibold">envelopes</span> – until the
                  auction ends.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  When time&apos;s up, the seller opens the envelopes and chooses
                  a winner based on <span className="font-semibold">price</span>{" "}
                  and <span className="font-semibold">who the buyer is</span> – 
                  not just the biggest number.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  Sellers pay a <span className="font-semibold">£10 listing fee</span>. 
                  If the sale completes, the £10 is refunded and Sealabid takes a
                  percentage of the final price.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* THREE BALLOONS – STEP 1 / STEP 2 / STEP 3 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-50">
            How Sealabid works, step by step
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            Everything on Sealabid revolves around your profile and sealed
            offers. These three steps are the core of the platform – whether
            you&apos;re buying, selling, or both.
          </p>

          <div className="mt-4 grid gap-6 md:grid-cols-3">
            {/* STEP 1 – REGISTER */}
            <div className="relative rounded-3xl border border-emerald-500/40 bg-slate-900/80 p-5 shadow-lg shadow-emerald-500/20">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Step 1 · Register
              </div>
              <h3 className="text-sm font-semibold text-slate-50">
                Create a profile that actually matters
              </h3>
              <p className="mt-2 text-sm text-slate-200">
                Sign up, choose whether you&apos;re an{" "}
                <span className="font-semibold">individual</span>,{" "}
                <span className="font-semibold">business</span> or{" "}
                <span className="font-semibold">charity</span>, and write a short
                profile. Sellers will see this next to your bid at the end of the
                auction.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                The stronger and more honest your profile, the more likely a
                seller is to pick you over someone with a higher but anonymous
                offer.
              </p>
            </div>

            {/* STEP 2 – HOW TO BUY */}
            <div className="relative rounded-3xl border border-sky-500/40 bg-slate-900/80 p-5 shadow-lg shadow-sky-500/20">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-300">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                Step 2 · How to buy
              </div>
              <h3 className="text-sm font-semibold text-slate-50">
                Place a sealed bid and wait
              </h3>
              <p className="mt-2 text-sm text-slate-200">
                Add a valid payment method, find something you want, and submit
                a <span className="font-semibold">sealed bid</span>. You can&apos;t
                see other bids, you don&apos;t get hints, and there is no
                &quot;currently winning&quot; message.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                When you bid, you make a{" "}
                <span className="font-semibold">binding offer</span> at that
                price if the seller picks you and payment succeeds. If they
                choose someone else, you may simply never hear more – that&apos;s
                part of the deal.
              </p>
            </div>

            {/* STEP 3 – HOW TO SELL */}
            <div className="relative rounded-3xl border border-purple-500/40 bg-slate-900/80 p-5 shadow-lg shadow-purple-500/20">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-purple-300">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                Step 3 · How to sell
              </div>
              <h3 className="text-sm font-semibold text-slate-50">
                Collect envelopes, then choose your buyer
              </h3>
              <p className="mt-2 text-sm text-slate-200">
                List your item, upload photos, choose{" "}
                <span className="font-semibold">7 / 14 / 21 days</span> and pay
                a <span className="font-semibold">£10 listing fee</span>. During
                the auction you only ever see envelopes – how many bids you
                have, not the prices.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                When the countdown ends, you have up to{" "}
                <span className="font-semibold">2 hours</span> to open the
                envelopes, compare bid amounts and profiles, and either accept
                one buyer or choose <span className="font-semibold">no sale</span>.
                If you do complete the sale through Sealabid, your £10 listing
                fee is refunded.
              </p>
            </div>
          </div>
        </section>

        {/* WHAT "BUYING IS SUBJECTIVE" REALLY MEANS */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-slate-50">
            What does &quot;Buying is Subjective&quot; actually mean here?
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2 text-sm text-slate-200">
            <div className="space-y-2">
              <p>
                On most marketplaces, the highest number wins by default. On
                Sealabid, the seller can look at a{" "}
                <span className="font-semibold">charity</span>, a{" "}
                <span className="font-semibold">collector</span>, a{" "}
                <span className="font-semibold">reseller</span> and an{" "}
                <span className="font-semibold">everyday buyer</span> – and pick
                the outcome that feels right to them, even if one of the others
                is offering a bit more.
              </p>
              <p>
                A painting might be worth £50 to one person and £500 to
                another. Sealabid lets those values be{" "}
                <span className="font-semibold">personal and private</span> until
                the moment of choice.
              </p>
            </div>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  You&apos;re not bidding to &quot;win the game&quot; – you&apos;re
                  offering what the item is genuinely worth to you.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  Sellers have full discretion to choose any buyer or no sale at
                  all, within our rules on fairness and behaviour.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  No public bid ladder, no last-second sniping, no pressure to
                  outbid strangers in real time.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                <span>
                  Profiles and reputation matter: who you are can be just as
                  important as what you&apos;re offering.
                </span>
              </li>
            </ul>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Sealabid will also include clear Terms, Privacy and dispute
            processes before any real transactions go live. This page is a
            concept overview, not formal legal wording.
          </p>
        </section>

        {/* FOOTER */}
        <footer className="flex flex-col gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Sealabid. Buying is subjective.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/terms" className="hover:text-emerald-300">
              Terms (draft)
            </Link>
            <Link href="/privacy" className="hover:text-emerald-300">
              Privacy (draft)
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
