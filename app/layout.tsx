// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sealabid – Buying is Subjective",
  description:
    "A sealed-bid marketplace where sellers choose the buyer, not just the highest price.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-950 text-slate-50">
          <Navbar />
          <div className="pt-2">{children}</div>
        </div>
      </body>
    </html>
  );
}
