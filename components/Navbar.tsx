// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { account } from "@/lib/appwriteClient";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Browse" },
  { href: "/sell", label: "Sell an item" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

type SimpleUser = {
  name?: string;
  email?: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<SimpleUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const res = await account.get();
        if (!cancelled) {
          setUser({ name: res.name, email: res.email });
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    try {
      await account.deleteSession("current");
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      router.push("/");
    }
  }

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-sm font-semibold tracking-[0.2em] uppercase text-emerald-400">
            Sealabid
          </span>
          <span className="hidden text-[11px] text-slate-400 sm:inline">
            Buying is subjective
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {/* Left nav links */}
          <div className="hidden items-center gap-4 text-xs sm:flex sm:text-sm">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition hover:text-emerald-300 ${
                    active ? "text-emerald-400" : "text-slate-300"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth area */}
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            {checking ? (
              <span className="text-slate-500 text-[11px]">Checking…</span>
            ) : user ? (
              <>
                <span className="hidden text-slate-300 sm:inline">
                  Logged in as{" "}
                  <span className="font-semibold text-emerald-300">
                    {user.name || user.email}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-300 transition"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-emerald-300"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
