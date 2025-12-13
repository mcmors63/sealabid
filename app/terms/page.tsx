// app/terms/page.tsx
"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Sealabid
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs text-slate-400">
            Please read these terms carefully before using Sealabid. By creating an
            account, listing an item or placing a sealed bid, you agree to be bound
            by these Terms &amp; Conditions.
          </p>
        </header>

        {/* Last updated / summary note */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300 space-y-2">
          <p>
            <span className="font-semibold text-slate-100">Last updated:</span>{" "}
            13 December 2025
          </p>
          <p>
            Sealabid is currently in early launch. These terms are written in plain
            English to make them easier to understand. They do not replace
            independent legal advice.
          </p>
          <p>
            We may update these Terms from time to time. When we do, we will update
            the date above and, where the changes are material, we will notify
            registered users by email or in your dashboard. If you continue to use
            Sealabid after changes take effect, you will be treated as having
            accepted the updated Terms.
          </p>
        </section>

        {/* 1. Who we are and what we provide */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            1. Who we are and what we provide
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Sealabid (referred to as{" "}
            <span className="italic">&quot;Sealabid&quot;, &quot;we&quot;</span> or{" "}
            <span className="italic">&quot;us&quot;</span>) is an online platform
            that allows users to:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-300 space-y-1">
            <li>list items they wish to sell; and</li>
            <li>invite and receive sealed bids from potential buyers.</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300">
            Sealabid provides the technology and tools for buyers and sellers to
            find each other. We do not buy or sell items ourselves and we are not a
            traditional auction house.
          </p>
          <p className="text-xs sm:text-sm text-slate-300">
            The contract for any sale is{" "}
            <span className="font-semibold">between the buyer and the seller</span>,
            not with Sealabid. We are not a party to that contract.
          </p>
        </section>

        {/* 2. Eligibility and accounts */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            2. Eligibility and your account
          </h2>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-300 space-y-1">
            <li>You must be at least 18 years old to use Sealabid.</li>
            <li>
              You must provide true, accurate and up-to-date information when
              creating your account and when listing items.
            </li>
            <li>
              You are responsible for keeping your login details safe and for all
              activity carried out through your account.
            </li>
            <li>
              If you believe your account has been compromised, you should change
              your password immediately and contact us.
            </li>
            <li>
              We may suspend or close accounts where we reasonably believe there is
              fraud, abuse, non-payment, repeated breaches of these Terms or other
              misuse of the platform.
            </li>
          </ul>
        </section>

        {/* 3. Sellers, listings and your obligations */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            3. Sellers, listings and your obligations
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            If you create a listing on Sealabid, you confirm that:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-300 space-y-1">
            <li>
              you have the legal right to sell the item and to complete the sale if
              you accept an offer;
            </li>
            <li>
              your listing (including title, description, photos, category and any
              other information) is honest, accurate and not misleading;
            </li>
            <li>
              you will not list items that are illegal to sell, dangerous, or
              otherwise inappropriate for an online marketplace;
            </li>
            <li>
              you own, or have the right to use, any images and content you upload,
              and you grant Sealabid a non-exclusive licence to host, display and
              use that content in connection with operating the platform;
            </li>
            <li>
              you will respond within a reasonable time once you have accepted a
              buyer, so that the transaction can progress without unnecessary delay.
            </li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300">
            We reserve the right to edit, hide or remove listings that we consider
            misleading, inappropriate or in breach of these Terms, or where we are
            required to do so by law or by a regulator.
          </p>
        </section>

        {/* 4. Buyers, sealed bids and “buying is subjective” */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            4. Buyers, sealed bids and &quot;buying is subjective&quot;
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Sealabid operates on a sealed-bid model. In summary:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-300 space-y-1">
            <li>
              Buyers submit a single sealed offer (an &quot;envelope&quot;) on a
              listing before the deadline shown.
            </li>
            <li>
              Buyers cannot see other buyers&apos; envelopes, and sellers cannot see
              envelopes until the sealed-bid window ends.
            </li>
            <li>
              Buyers may update their envelope before the deadline but may not place
              multiple separate envelopes on the same listing.
            </li>
            <li>
              When the sealed-bid window ends, the seller can review all envelopes
              and choose a buyer based on{" "}
              <span className="font-semibold">price and any other factors</span> that
              matter to them (for example, timing, buyer profile or message).
            </li>
            <li>
              The highest offer does <span className="font-semibold">not</span>{" "}
              automatically win.{" "}
              <span className="font-semibold">Buying is subjective</span>, and the
              seller is free to choose any envelope or decide that there is no sale.
            </li>
            <li>
              Submitting an envelope is a serious expression of intent to buy, but it
              does not by itself create a binding contract. A binding agreement
              arises only once a seller accepts an offer and both parties agree to
              proceed.
            </li>
          </ul>
        </section>

        {/* 5. Fees, commission and listing charges */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            5. Fees, commission and listing charges
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            We charge fees so that we can operate and improve Sealabid. The current
            structure is set out in detail on our{" "}
            <Link
              href="/fees"
              className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
            >
              Fees
            </Link>{" "}
            page, including worked examples.
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-300 space-y-1">
            <li>
              A <span className="font-semibold">£10 listing fee</span> is charged
              when you create a listing. This is usually non-refundable.
            </li>
            <li>
              If you accept an offer and the sale completes through Sealabid, the
              £10 listing fee is treated as a{" "}
              <span className="font-semibold">credit against the final selling fee</span>{" "}
              (so effectively deducted from the commission we charge).
            </li>
            <li>
              We charge commission as a percentage of the accepted sale price, using
              the bands shown on the Fees page (for example, different rates for
              under £5,000, £5,000–£9,999, £10,000–£24,999 and £25,000+).
            </li>
            <li>
              If you choose not to accept any offer, or where a sale fails to
              complete for reasons within your control, the listing fee will
              normally <span className="font-semibold">not</span> be refunded.
            </li>
            <li>
              We may change fees and commission rates in future. Any changes will
              apply to new listings created after the change takes effect, not to
              listings that are already live at that time.
            </li>
          </ul>
        </section>

        {/* 6. Payments, settlement and off-platform deals */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            6. Payments, settlement and off-platform deals
          </h2>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-300 space-y-1">
            <li>
              Payments and seller payouts may be handled by one or more third-party
              payment providers (for example, card processors or payment platforms).
              By using Sealabid, you also agree to their separate terms.
            </li>
            <li>
              We are not responsible for delays, refusals or errors caused by
              third-party payment providers, but we will act reasonably to help
              users resolve issues where we can.
            </li>
            <li>
              You must not use Sealabid solely to find a buyer or seller and then
              deliberately complete the transaction away from the platform in order
              to avoid fees.
            </li>
            <li>
              Where we reasonably suspect fee-avoidance, we may charge the relevant
              fees, suspend or close accounts, restrict access to the platform, or
              take other appropriate action.
            </li>
          </ul>
        </section>

        {/* 7. Behaviour, messages and content rules */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            7. Behaviour, messages and content rules
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            We want Sealabid to be safe, respectful and fair. You must not use the
            platform to:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-300 space-y-1">
            <li>
              send abusive, threatening, harassing, hateful or otherwise
              inappropriate content;
            </li>
            <li>
              upload images, text or other content that is illegal, discriminatory,
              defamatory, misleading or infringes someone else&apos;s rights (for
              example, copyright or trade marks);
            </li>
            <li>
              attempt to defraud other users or Sealabid, or interfere with the
              proper operation of the platform (for example by hacking, scraping,
              overloading or trying to bypass security or fee systems);
            </li>
            <li>
              create multiple accounts to mislead other users or to get around
              account restrictions.
            </li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300">
            We may review, edit, suspend or remove content and listings that we
            reasonably believe break these rules, and we may suspend or terminate
            accounts involved in serious or repeated breaches.
          </p>
        </section>

        {/* 8. Platform availability and changes */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            8. Platform availability and changes to Sealabid
          </h2>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-300 space-y-1">
            <li>
              We aim to keep Sealabid available and running smoothly, but we do not
              guarantee that the platform will be available at all times.
            </li>
            <li>
              We may suspend or limit access to Sealabid for maintenance, security
              reasons or to make improvements. Where reasonable, we will try to give
              notice of planned downtime.
            </li>
            <li>
              We may change, add or remove features from Sealabid from time to time.
              We will aim to ensure that any changes do not unfairly disadvantage
              users who already have live listings.
            </li>
          </ul>
        </section>

        {/* 9. Our responsibility and limits on liability */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            9. Our responsibility and limits on liability
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Sealabid provides a platform for buyers and sellers to find each other
            and agree deals. We do not control, verify or guarantee:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-300 space-y-1">
            <li>the existence, quality, safety or legality of items listed;</li>
            <li>the truth or accuracy of content, listings or profiles; or</li>
            <li>that a buyer or seller will actually complete a transaction.</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300">
            To the fullest extent permitted by law:
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-300 space-y-1">
            <li>
              we are not liable for any loss of profits, loss of opportunity, loss
              of data, or any indirect or consequential loss arising out of or in
              connection with your use of Sealabid; and
            </li>
            <li>
              our total liability to you for any claim arising out of or in
              connection with these Terms or your use of Sealabid will be limited to
              the higher of (a) the total fees you have paid to Sealabid in the 12
              months before the event giving rise to the claim; or (b) £100.
            </li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300">
            Nothing in these Terms excludes or limits any liability that cannot be
            excluded or limited by law, such as liability for fraud or for death or
            personal injury caused by our negligence.
          </p>
        </section>

        {/* 10. Your responsibility to us */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            10. Your responsibility to us
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            If you misuse Sealabid, breach these Terms, or violate the rights of
            another person while using the platform, and that causes us loss, you
            agree to reimburse us for reasonable costs, losses, damages and expenses
            (including reasonable legal fees) arising from that breach, but only to
            the extent permitted by law.
          </p>
        </section>

        {/* 11. Privacy and cookies */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            11. Privacy and cookies
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            We explain what personal data we collect, how we use it and the choices
            you have in our{" "}
            <Link
              href="/privacy"
              className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
            >
              Privacy Policy
            </Link>
            . Our use of cookies and similar technologies is explained in our{" "}
            <Link
              href="/cookies"
              className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
            >
              Cookies Policy
            </Link>
            .
          </p>
        </section>

        {/* 12. Changes, suspension and termination */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            12. Changes, suspension and termination of your access
          </h2>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-300 space-y-1">
            <li>
              We may update these Terms from time to time. We will put the latest
              version on this page and update the &quot;Last updated&quot; date.
            </li>
            <li>
              We may suspend or restrict access to Sealabid where necessary for
              maintenance, security, legal compliance or to investigate suspected
              misuse.
            </li>
            <li>
              We may close your account where you seriously or repeatedly breach
              these Terms, misuse the platform, fail to pay fees that are due, or
              where we are required to do so by law or by a regulator.
            </li>
          </ul>
        </section>

        {/* 13. Governing law and disputes */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            13. Governing law and disputes
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            These Terms, and any dispute or claim arising out of or in connection
            with them (including non-contractual disputes or claims), are governed
            by the laws of England and Wales.
          </p>
          <p className="text-xs sm:text-sm text-slate-300">
            The courts of England and Wales will have non-exclusive jurisdiction in
            relation to any such dispute or claim. This means you or we may also be
            able to bring proceedings in another country if applicable law allows.
          </p>
        </section>

        {/* 14. Contact details */}
        <section className="space-y-2 text-sm text-slate-200">
          <h2 className="text-sm font-semibold text-slate-50">
            14. Contacting us
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            If you have questions about these Terms or about using Sealabid, please
            contact us by email at{" "}
            <a
              href="mailto:info@sealabid.com"
              className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
            >
              info@sealabid.com
            </a>
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
