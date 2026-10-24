import type { Metadata } from "next";
import { connection } from "next/server";
import "./globals.css";
import "./product.css";

export const metadata: Metadata = {
  title: "SkyClaim — Your flight was late. Your claim shouldn't be.",
  description: "Check EU261, India DGCA and US DOT flight disruption rights. Understand compensation, refunds and assistance, and prepare your own letter.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Each HTML response needs the nonce supplied by proxy.ts, including framework scripts.
  await connection();
  return <html lang="en"><body>{children}</body></html>;
}
