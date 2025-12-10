// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwriteClient";
import Link from "next/link";

type ProfileData = {
  name: string;
  email: string;
  accountType?: string;
  about?: string;
  address1?: string;
  address2?: string;
  city?: string;
  postcode?: string;
  country?: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const me = await account.get();

        const prefs: any = me.prefs || {};

        if (!cancelled) {
          setProfile({
            name: me.name || "",
            email: me.email,
            accountType: prefs.accountType,
            about: prefs.about,
            address1: prefs.address1,
            address2: prefs.address2,
            city: prefs.city,
            postcode: prefs.postcode,
            country: prefs.country,
          });
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setError("You need to be logged in to view your profile.");
          // give them a second to read then push to login
          setTimeout(() => {
            router.push("/login");
          }, 1200);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-md px-4 py-10 sm:py-14">
          <p className="text-sm text-slate-300">Loading your profile…</p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-md px-4 py-10 sm:py-14 space-y-3">
          <p className="text-sm text-red-300">{error}</p>
          <Link
            href="/login"
            className="inline-flex rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-xl px-4 py-10 sm:py-14 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            My <span className="text-emerald-400">profile</span>
          </h1>
          <Link
            href="/"
            className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
          >
            ← Back to home
          </Link>
        </div>

        <p className="text-sm text-slate-300">
          This is what sellers and buyers may see when they look at your profile
          on Sealabid.
        </p>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Account details
            </h2>
            <dl className="mt-2 space-y-1 text-sm text-slate-200">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400 text-xs uppercase tracking-wide">
                  Name
                </dt>
                <dd>{profile.name || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400 text-xs uppercase tracking-wide">
                  Email
                </dt>
                <dd>{profile.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400 text-xs uppercase tracking-wide">
                  Type
                </dt>
                <dd>{profile.accountType || "Not set"}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              About you
            </h2>
            <p className="mt-1 text-sm text-slate-200">
              {profile.about || (
                <span className="text-slate-500">
                  You haven&apos;t added anything yet.
                </span>
              )}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Address (private)
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Your address is used for transactions and verification. It isn&apos;t
              shown publicly in full.
            </p>
            <div className="mt-2 text-sm text-slate-200 space-y-0.5">
              <p>{profile.address1}</p>
              {profile.address2 && <p>{profile.address2}</p>}
              <p>
                {profile.city && <span>{profile.city}, </span>}
                {profile.postcode}
              </p>
              <p>{profile.country}</p>
            </div>
          </div>
        </section>

        <p className="text-[11px] text-slate-500">
          Editing your profile and address will be added later in the build.
        </p>
      </div>
    </main>
  );
}
