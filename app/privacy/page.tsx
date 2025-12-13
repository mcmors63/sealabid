// app/privacy/page.tsx

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Sealabid
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400">
            How we collect, use and protect personal data when you use Sealabid.
          </p>
        </header>

        {/* Intro + important note */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-3">
          <p className="text-slate-200">
            This Privacy Policy explains how Sealabid (&quot;we&quot;,
            &quot;us&quot;, &quot;our&quot;) handles your personal data when you
            use our website, create an account, list an item or place a sealed
            bid.
          </p>
          <p className="text-xs text-slate-400">
            This document is a general template and does not replace tailored
            legal advice. You are responsible for ensuring it accurately
            reflects how Sealabid operates and for keeping it up to date with
            UK data protection law.
          </p>
          <p className="text-xs text-slate-400">
            If you have questions about this policy, or want to exercise your
            data rights, you can contact us at:
          </p>
          <p className="text-xs font-mono text-slate-300">
            Email: support@sealabid.com
          </p>
        </section>

        {/* 1. Who we are */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            1. Who we are and role as data controller
          </h2>
          <p className="text-slate-300">
            Sealabid is a UK-based online sealed-bid marketplace where people
            can list items and buyers submit one private &quot;envelope&quot;
            offer. When you use Sealabid, we act as the{" "}
            <span className="font-semibold">data controller</span> for the
            personal information you provide to us.
          </p>
          <p className="text-slate-300">
            We process your data in line with the UK General Data Protection
            Regulation (UK GDPR) and the Data Protection Act 2018.
          </p>
        </section>

        {/* 2. What data we collect */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            2. What personal data we collect
          </h2>
          <p className="text-slate-300">We may collect and store:</p>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>
              <span className="font-semibold">Account details</span> – your
              name, email address, password (hashed), and basic profile
              information you choose to add.
            </li>
            <li>
              <span className="font-semibold">Listing data</span> – the items
              you list for sale, descriptions, categories, photos and any
              optional &quot;make me happy&quot; target you set (this target is
              private and not shown to other users).
            </li>
            <li>
              <span className="font-semibold">Sealed bids</span> – the amount
              you offer, any message you send to the seller, and internal
              status (submitted, winner, not selected).
            </li>
            <li>
              <span className="font-semibold">Usage data</span> – basic logs
              such as pages visited, dates and times, and actions taken (for
              example, creating a listing or updating an envelope).
            </li>
            <li>
              <span className="font-semibold">Technical data</span> – IP
              address, browser type, device information and similar data
              collected by our hosting and security providers to run and protect
              the site.
            </li>
            <li>
              <span className="font-semibold">Communications</span> – messages
              you send us by email or through support channels, plus any abuse
              reports you submit about another user.
            </li>
          </ul>
        </section>

        {/* 3. How we use your data */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            3. How we use your data
          </h2>
          <p className="text-slate-300">
            We use your personal data to run Sealabid and keep the marketplace
            safe and fair. This includes:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>Creating and managing your Sealabid account.</li>
            <li>Letting you create listings, upload photos and set deadlines.</li>
            <li>
              Allowing you to place sealed bids and send optional messages to
              sellers.
            </li>
            <li>
              Showing sellers the bids they have received once the listing
              ends, so they can choose a buyer.
            </li>
            <li>
              Detecting and responding to abuse, fraud or misuse (for example,
              threatening messages or spam).
            </li>
            <li>
              Running analytics to understand how the site is used and to
              improve features, layouts and performance.
            </li>
            <li>
              Complying with our legal obligations, including responding to
              lawful requests from authorities where required.
            </li>
          </ul>
        </section>

        {/* 4. Legal bases */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            4. Legal bases we rely on
          </h2>
          <p className="text-slate-300">
            Under UK GDPR we must have a legal basis for using your data. We
            mainly rely on:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>
              <span className="font-semibold">Contract</span> – to create your
              account, enable listings and sealed bids, and operate the
              marketplace features you use.
            </li>
            <li>
              <span className="font-semibold">Legitimate interests</span> – to
              keep the platform secure, prevent abuse and fraud, run analytics,
              and improve Sealabid in ways that are reasonable and expected.
            </li>
            <li>
              <span className="font-semibold">Consent</span> – where we use
              optional cookies or send you marketing communications that you
              explicitly sign up for.
            </li>
            <li>
              <span className="font-semibold">Legal obligation</span> – where we
              are required to keep certain records or share information with
              authorities.
            </li>
          </ul>
        </section>

        {/* 5. Who we share with */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            5. Who we share your data with
          </h2>
          <p className="text-slate-300">
            We don&apos;t sell your personal data. We do share it with:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>
              <span className="font-semibold">Technical providers</span> – such
              as our hosting, storage and database providers (for example,
              services like Vercel and Appwrite) who help us run the site.
            </li>
            <li>
              <span className="font-semibold">Payment and fraud providers</span>{" "}
              – if and when online payments are integrated, we will share
              limited data with a payment processor to take payments securely
              and detect fraud.
            </li>
            <li>
              <span className="font-semibold">Analytics providers</span> – if we
              use tools like analytics, they may collect anonymised or
              pseudonymised information about how the site is used.
            </li>
            <li>
              <span className="font-semibold">Law enforcement or regulators</span>{" "}
              – where we are legally required to do so, or to protect our
              rights and other users (for example in cases of threats, fraud or
              serious abuse).
            </li>
          </ul>
          <p className="text-xs text-slate-400">
            Each provider is only given the data they need to perform their
            service and is required to keep it secure.
          </p>
        </section>

        {/* 6. Storage & retention */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            6. How long we keep your data
          </h2>
          <p className="text-slate-300">
            We keep personal data only for as long as it is genuinely needed:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>
              Account details are kept while you have an active account and for
              a reasonable period afterwards if needed for legal or accounting
              purposes.
            </li>
            <li>
              Listing and sealed-bid records may be kept for several years to
              help resolve disputes, prevent abuse and maintain a reliable
              transaction history.
            </li>
            <li>
              Abuse reports and security logs may be retained longer where
              necessary to protect the platform and other users.
            </li>
          </ul>
          <p className="text-xs text-slate-400">
            When data is no longer needed, we either delete it or anonymise it
            so it no longer identifies you.
          </p>
        </section>

        {/* 7. International transfers */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            7. Where your data is stored
          </h2>
          <p className="text-slate-300">
            Our service providers may store or process your data in the UK, the
            European Economic Area (EEA) or other countries. Where data is
            transferred outside the UK / EEA, we take reasonable steps to ensure
            appropriate safeguards are in place, such as standard contractual
            clauses or equivalent protections.
          </p>
        </section>

        {/* 8. Your rights */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            8. Your rights
          </h2>
          <p className="text-slate-300">
            Under UK data protection law you have rights, including to:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>Request a copy of the personal data we hold about you.</li>
            <li>Ask us to correct inaccurate or incomplete data.</li>
            <li>Ask us to delete your data in certain circumstances.</li>
            <li>
              Ask us to restrict how we use your data in certain situations.
            </li>
            <li>
              Object to certain uses of your data, especially where we rely on
              legitimate interests.
            </li>
            <li>
              Request a copy of your data in a portable format (where
              technically possible).
            </li>
          </ul>
          <p className="text-xs text-slate-400">
            To exercise these rights, contact{" "}
            <span className="font-mono">support@sealabid.com</span>. You also
            have the right to complain to the UK Information Commissioner&apos;s
            Office (ICO) if you are unhappy with how we handle your data.
          </p>
        </section>

        {/* 9. Cookies & tracking */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            9. Cookies and tracking
          </h2>
          <p className="text-slate-300">
            We use cookies and similar technologies to keep you logged in, keep
            the platform secure and understand how people use Sealabid. Some
            cookies are strictly necessary for the site to work; others (like
            analytics) are optional and only used with your consent.
          </p>
          <p className="text-xs text-slate-400">
            For more detail on the specific cookies we use and how to manage
            your choices, please see our{" "}
            <Link
              href="/cookies"
              className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
            >
              Cookies Policy
            </Link>
            .
          </p>
        </section>

        {/* 10. Changes */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            10. Changes to this policy
          </h2>
          <p className="text-slate-300">
            We may update this Privacy Policy from time to time. When we make
            significant changes we will update the date shown here and, where
            reasonable, let you know through the site or by email.
          </p>
          <p className="text-xs text-slate-500">
            Last updated: {new Date().getFullYear()}
          </p>
        </section>
      </div>
    </main>
  );
}
