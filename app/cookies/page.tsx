// app/cookies/page.tsx

import Link from "next/link";

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Sealabid
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Cookies Policy
          </h1>
          <p className="text-xs text-slate-400">
            How and why Sealabid uses cookies and similar technologies.
          </p>
        </header>

        {/* Intro */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-3">
          <p className="text-slate-200">
            This Cookies Policy explains what cookies are, how we use them on
            Sealabid, and the choices you have. Cookies are small text files
            that are stored on your device when you visit a website.
          </p>
          <p className="text-xs text-slate-400">
            This page sits alongside our{" "}
            <Link
              href="/privacy"
              className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
            >
              Privacy Policy
            </Link>
            , which explains in more detail how we handle personal data.
          </p>
        </section>

        {/* 1. Types of cookies */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            1. Types of cookies we use
          </h2>
          <p className="text-slate-300">
            On Sealabid we use the following categories of cookies:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>
              <span className="font-semibold">Strictly necessary cookies</span>{" "}
              – required for the website and secure login to work. Without
              these, you wouldn&apos;t be able to create an account, stay logged
              in or submit sealed bids.
            </li>
            <li>
              <span className="font-semibold">Performance and analytics
              cookies</span> – help us understand how people find and use
              Sealabid (for example, which pages are most popular) so we can
              improve the experience. Where they are not strictly necessary,
              they only run with your consent.
            </li>
            <li>
              <span className="font-semibold">Functionality cookies</span> – may
              remember your preferences, such as whether you have dismissed
              certain banners, or how you prefer to view listings.
            </li>
          </ul>
        </section>

        {/* 2. Examples / table-style info */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-3">
          <h2 className="text-sm font-semibold text-slate-50">
            2. Examples of cookies in use
          </h2>
          <p className="text-slate-300">
            The exact cookies may change as we improve Sealabid, but typical
            examples include:
          </p>
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
            <table className="min-w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2">Cookie</th>
                  <th className="px-4 py-2">Purpose</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Typical duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-800">
                  <td className="px-4 py-2 font-mono text-[11px]">
                    sealabid_session
                  </td>
                  <td className="px-4 py-2">
                    Keeps you logged in securely between page views.
                  </td>
                  <td className="px-4 py-2">Strictly necessary</td>
                  <td className="px-4 py-2">Session</td>
                </tr>
                <tr className="border-t border-slate-800">
                  <td className="px-4 py-2 font-mono text-[11px]">
                    sealabid_csrf
                  </td>
                  <td className="px-4 py-2">
                    Helps protect forms and logins from unauthorised requests.
                  </td>
                  <td className="px-4 py-2">Strictly necessary</td>
                  <td className="px-4 py-2">Session</td>
                </tr>
                <tr className="border-t border-slate-800">
                  <td className="px-4 py-2 font-mono text-[11px]">
                    sealabid_consent
                  </td>
                  <td className="px-4 py-2">
                    Remembers whether you accepted or rejected optional
                    analytics cookies.
                  </td>
                  <td className="px-4 py-2">Functionality</td>
                  <td className="px-4 py-2">Up to 12 months</td>
                </tr>
                <tr className="border-t border-slate-800">
                  <td className="px-4 py-2 font-mono text-[11px]">
                    analytics_*
                  </td>
                  <td className="px-4 py-2">
                    Anonymous statistics about traffic and usage (for example,
                    which pages are visited most).
                  </td>
                  <td className="px-4 py-2">Performance / analytics</td>
                  <td className="px-4 py-2">
                    Depends on the analytics provider settings
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400">
            Cookie names and durations may vary slightly depending on our
            technical setup and providers. We aim to keep this table broadly
            accurate and will update it when we make material changes.
          </p>
        </section>

        {/* 3. Managing cookies */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            3. Managing your cookie choices
          </h2>
          <p className="text-slate-300">
            When you first visit Sealabid, you may see a banner or notice asking
            you to confirm your cookie preferences. Where required by law, we
            will only set non-essential cookies (such as analytics) after you
            have given consent.
          </p>
          <p className="text-slate-300">
            You can also control cookies through your browser settings. Exact
            steps vary by browser, but generally you can:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>See which cookies are stored on your device.</li>
            <li>Delete existing cookies.</li>
            <li>
              Block all cookies or only accept cookies from certain websites.
            </li>
          </ul>
          <p className="text-xs text-slate-400">
            If you block or delete strictly necessary cookies, parts of
            Sealabid (for example login, creating listings or placing sealed
            bids) may stop working properly.
          </p>
        </section>

        {/* 4. Third-party cookies */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            4. Third-party cookies
          </h2>
          <p className="text-slate-300">
            Some cookies may be set by third-party services that we use, such as
            hosting, analytics or payment providers. These third parties are
            responsible for their own privacy and cookie practices.
          </p>
          <p className="text-slate-300">
            We aim to work only with reputable providers and keep the number of
            third-party cookies to what is genuinely needed to run Sealabid and
            improve the experience.
          </p>
        </section>

        {/* 5. Updates */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-slate-50">
            5. Changes to this Cookies Policy
          </h2>
          <p className="text-slate-300">
            We may update this Cookies Policy as we add new features or change
            our technology stack. When we make significant changes, we&apos;ll
            update the date below and may show a notice on the site.
          </p>
          <p className="text-xs text-slate-500">
            Last updated: {new Date().getFullYear()}
          </p>
        </section>
      </div>
    </main>
  );
}
