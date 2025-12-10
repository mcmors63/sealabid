// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar"; // or "@/components/Navbar" if you prefer

export const metadata: Metadata = {
  title: "Sealabid – Buying is subjective",
  description:
    "Sealabid is a sealed-bid marketplace where sellers choose buyers based on price and profile – not just who clicked fastest.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        {/* This will appear on EVERY page */}
        <Navbar />

        {/* Page content */}
        {children}
      </body>
    </html>
  );
}
