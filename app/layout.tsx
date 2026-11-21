import type { Metadata } from "next";
import { connection } from "next/server";
import { headers } from "next/headers";
import { pageMetadata, publicSiteOrigin } from "../lib/site-metadata";
import "./globals.css";
import "./product.css";

export const metadata: Metadata = pageMetadata("SkyClaim — Your flight was late. Your claim shouldn't be.", "Check EU261, India DGCA and US DOT flight disruption rights. Understand compensation, refunds and assistance, and prepare your own letter.");

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Each HTML response needs the nonce supplied by proxy.ts, including framework scripts.
  await connection();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const schema = { "@context": "https://schema.org", "@type": "WebApplication", name: "SkyClaim",
    applicationCategory: "TravelApplication", operatingSystem: "Web", url: publicSiteOrigin(),
    description: "Direct-flight passenger-rights information and draft letters under EU261, India DGCA and US DOT. Information, not legal advice." };
  return <html lang="en"><body><script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />{children}</body></html>;
}
