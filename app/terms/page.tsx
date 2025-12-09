// app/terms/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Terms – Sealabid",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Terms of Use <span className="text-emerald-400">[Draft]</span>
          </h1>
          <Link
            href="/"
            className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
          >
            ← Back to home
          </Link>
        </div>

        <p className="mb-6 text-sm text-slate-300">
          This is an early, plain-English summary of how Sealabid is intended to
          work. It is not formal legal advice and may change as the platform
          develops and once reviewed by a qualified lawyer. Do not use Sealabid
          for real transactions based solely on this draft.
        </p>

        <div className="space-y-6 text-sm text-slate-200">
          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-50">
              1. What Sealabid is
            </h2>
            <p>
              Sealabid is an online marketplace where people can list tangible
              items for sale and invite sealed bids from potential buyers. We
              provide the platform and payment processing, but we are not the
              buyer or seller in your transaction.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-50">
              2. Subjective purchasing
            </h2>
            <p className="mb-2">
              The central idea of Sealabid is that{" "}
              <span className="font-semibold">buying is subjective</span>. That
              means:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Buyers place <span className="font-semibold">sealed bids</span>.
                They cannot see other bid amounts or whether they are
                &quot;winning&quot;.
              </li>
              <li>
                Sellers only see an indication that bids exist (for example,
                envelope icons), not the amounts, until the auction ends.
              </li>
              <li>
                When the auction ends, the seller can choose{" "}
                <span className="font-semibold">
                  any one bid or make no sale at all
                </span>
                . The highest bid is not guaranteed to win.
              </li>
            </ul>
            <p className="mt-2">
              If you use Sealabid, you accept that your bid may not be selected
              even if it is the highest.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-50">
              3. Listing fees and platform fees
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Sellers pay a <span className="font-semibold">£10 listing fee</span>{" "}
                when creating a listing.
              </li>
              <li>
                If the seller accepts a bid and the transaction completes
                successfully, the £10 listing fee is refunded.
              </li>
              <li>
                Sealabid charges a{" "}
                <span className="font-semibold">
                  percentage of the final accepted price
                </span>{" "}
                on completed sales. The percentage and any additional charges
                will be clearly shown before you list or accept a bid.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-50">
              4. Binding bids and seller decision window
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                When you place a bid, you are making a{" "}
                <span className="font-semibold">binding offer</span> at that
                price, subject to the seller choosing you and your payment being
                successfully processed.
              </li>
              <li>
                Sellers have a limited decision window (currently intended to be{" "}
                <span className="font-semibold">15 minutes</span>) after an
                auction ends to open bids and select a winner.
              </li>
              <li>
                If the seller does not choose any bid within that window, the
                listing may be treated as{" "}
                <span className="font-semibold">no sale</span>, and the listing
                fee may not be refunded.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-50">
              5. Payment methods and charges
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Buyers must add and verify a valid payment method before
                bidding. This helps reduce time-wasting and fraudulent bids.
              </li>
              <li>
                If a seller selects your bid, Sealabid (via its payment
                provider) will attempt to charge your stored payment method for
                the bid amount plus any applicable fees.
              </li>
              <li>
                If payment fails, the sale may be cancelled and your account may
                be restricted.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-50">
              6. Profiles and feedback
            </h2>
            <p className="mb-2">
              Profiles are an important part of Sealabid. Sellers may choose a
              buyer based on both price and profile.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                You must provide honest and accurate information in your profile
                and listings.
              </li>
              <li>
                Buyers and sellers may leave feedback on each other after a
                transaction. Feedback should be fair, lawful and respectful.
              </li>
              <li>
                Abusive, discriminatory or misleading content may be removed,
                and accounts may be suspended.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-50">
              7. Prohibited behaviour
            </h2>
            <p className="mb-2">
              You agree not to use Sealabid for anything illegal, abusive or
              harmful. Examples include:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Listing illegal or stolen items.</li>
              <li>
                Using Sealabid to harass, threaten or discriminate against
                others.
              </li>
              <li>
                Creating fake accounts, fake bids or other attempts to manipulate
                auctions.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-50">
              8. Early stage platform disclaimer
            </h2>
            <p>
              Sealabid is currently in an early concept and development stage.
              Features, fees and rules may change as we test and improve the
              platform. Do not rely on this draft document as a final set of
              legal terms. Before launching real transactions, these terms
              should be formally reviewed by a qualified lawyer.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
