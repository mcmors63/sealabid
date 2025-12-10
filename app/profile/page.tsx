// app/profile/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { account } from "@/lib/appwriteClient";

type AccountType = "individual" | "business" | "charity";

export default function ProfilePage() {
  // Loading / saving state
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Messages
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Basic account fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);

  // Extended profile (stored in prefs)
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [postcode, setPostcode] = useState("");
  const [profileBio, setProfileBio] = useState("");

  // Change password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ---------------------------------
  // Load current account + prefs
  // ---------------------------------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setProfileError(null);

        const me: any = await account.get();
        if (cancelled) return;

        const prefs = me.prefs || {};

        setName(me.name || "");
        setEmail(me.email || "");
        // @ts-ignore
        setEmailVerified(Boolean(me.emailVerification));

        setAccountType(
          (prefs.accountType as AccountType) || "individual"
        );
        setPhoneNumber(prefs.phoneNumber || "");
        setAddressLine1(prefs.addressLine1 || "");
        setAddressLine2(prefs.addressLine2 || "");
        setCity(prefs.city || "");
        setCounty(prefs.county || "");
        setPostcode(prefs.postcode || "");
        setProfileBio(prefs.profileBio || "");
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setProfileError(
            err?.message ||
              err?.response?.message ||
              "Failed to load your profile."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------------
  // Save profile (NOT password)
  // ---------------------------------
  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    const cleanName = name.trim();
    const cleanPostcode = postcode.trim();

    if (!cleanName) {
      setProfileError("Please enter your name.");
      return;
    }

    // Light validation, we can tighten later if needed
    if (addressLine1.trim() && !cleanPostcode) {
      setProfileError("Please enter a postcode with your address.");
      return;
    }

    setProfileSaving(true);

    try {
      // 1) Update name (email stays locked)
      await account.updateName(cleanName);

      // 2) Update preferences (address, phone, type, bio)
      await account.updatePrefs({
        accountType,
        phoneNumber,
        addressLine1,
        addressLine2,
        city,
        county,
        postcode: cleanPostcode,
        profileBio,
      });

      setProfileSuccess("Your profile has been updated.");
    } catch (err: any) {
      console.error(err);
      setProfileError(
        err?.message ||
          err?.response?.message ||
          "Failed to update your profile. Please try again."
      );
    } finally {
      setProfileSaving(false);
    }
  }

  // ---------------------------------
  // Change password
  // ---------------------------------
  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password should be at least 8 characters long.");
      return;
    }

    // Simple strength hint – letters + numbers
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError(
        "Use a mix of letters and numbers for a stronger password."
      );
      return;
    }

    setPasswordSaving(true);

    try {
      await account.updatePassword(newPassword, currentPassword);

      setPasswordSuccess("Your password has been changed.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      setPasswordError(
        err?.message ||
          err?.response?.message ||
          "Failed to change your password. Check your current password and try again."
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  // ---------------------------------
  // Render
  // ---------------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <p className="text-sm text-slate-300">Loading your profile…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Sealabid
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Your profile
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Keep your details up to date. Sellers and buyers will see your
              profile when they&apos;re deciding which envelope to accept.
              Your email address is locked because it&apos;s used for login
              and verification.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
          >
            ← Back to dashboard
          </Link>
        </div>

        {/* PROFILE FORM */}
        <form
          onSubmit={handleProfileSubmit}
          className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm"
        >
          <h2 className="text-sm font-semibold text-slate-50">
            Personal details & address
          </h2>

          {profileError && (
            <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="rounded-md border border-emerald-500/60 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
              {profileSuccess}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Name
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Email (cannot be changed)
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full cursor-not-allowed rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-400"
            />
            <p className="text-[11px] text-slate-500">
              Your email is used for login and verification. To change it,
              you&apos;d need a manual account change via support.
            </p>
            {emailVerified === false && (
              <p className="text-[11px] text-amber-300 mt-1">
                Your email isn&apos;t verified yet. Go to your inbox and click
                the verification link we sent, or request a new one from the
                dashboard.
              </p>
            )}
          </div>

          {/* Account type */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-200">
              Account type
            </p>
            <p className="text-[11px] text-slate-400">
              This helps people understand who&apos;s behind an envelope – an
              individual, business, or charity.
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAccountType("individual")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
                  accountType === "individual"
                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                    : "border-slate-700 bg-slate-900 text-slate-200"
                }`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => setAccountType("business")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
                  accountType === "business"
                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                    : "border-slate-700 bg-slate-900 text-slate-200"
                }`}
              >
                Business
              </button>
              <button
                type="button"
                onClick={() => setAccountType("charity")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
                  accountType === "charity"
                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                    : "border-slate-700 bg-slate-900 text-slate-200"
                }`}
              >
                Charity / cause
              </button>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Phone number
            </label>
            <input
              type="tel"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 07123 456789"
            />
            <p className="text-[11px] text-slate-500">
              This won&apos;t be shown publicly, but may be used for contact
              around a sale.
            </p>
          </div>

          {/* Address */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-200">
                Address line 1
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="House name / number and street"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-200">
                Address line 2 (optional)
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Building, area, etc."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Town / city
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Town / city"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                County / region (optional)
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="County / region"
              />
            </div>
            <div className="space-y-1 sm:col-span-2 sm:max-w-xs">
              <label className="text-xs font-semibold text-slate-200">
                Postcode
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 uppercase outline-none focus:border-emerald-400"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                placeholder="e.g. SW1A 1AA"
              />
            </div>
          </div>

          {/* Public story */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Public profile / story
            </label>
            <textarea
              className="min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={profileBio}
              onChange={(e) => setProfileBio(e.target.value)}
              placeholder="Tell people who you are. If you're a charity, explain your cause. If you're an individual, share a short honest description."
            />
            <p className="text-[11px] text-slate-500">
              This can influence who a seller chooses when offers are close.
              Keep it honest and relevant.
            </p>
          </div>

          {/* Save profile */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {profileSaving ? "Saving profile…" : "Save profile"}
            </button>
          </div>
        </form>

        {/* CHANGE PASSWORD */}
        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm"
        >
          <h2 className="text-sm font-semibold text-slate-50">
            Change password
          </h2>
          <p className="text-[11px] text-slate-500">
            Use a strong password you don&apos;t reuse elsewhere. You&apos;ll
            need your current password to change it.
          </p>

          {passwordError && (
            <div className="rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="rounded-md border border-emerald-500/60 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
              {passwordSuccess}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Current password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              New password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">
              Confirm new password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center justify-center rounded-full bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-50 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordSaving ? "Changing password…" : "Change password"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
