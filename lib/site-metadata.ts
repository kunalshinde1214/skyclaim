import type { Metadata } from "next";

export function publicSiteOrigin(): string | undefined {
  const value = process.env.APP_ORIGIN?.trim();
  if (!value) return;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password &&
      url.pathname === "/" && !url.search && !url.hash &&
      url.hostname !== "localhost" && !url.hostname.endsWith(".localhost")) return url.origin;
  } catch { /* A local demo must not advertise a guessed canonical host. */ }
}

export function isPubliclyIndexable(): boolean {
  return !!publicSiteOrigin() && process.env.SKYCLAIM_DEPLOYMENT_MODE === "production" &&
    process.env.SKYCLAIM_ALLOW_INDEXING === "true";
}

export function pageMetadata(title: string, description: string, path = "/"): Metadata {
  const origin = publicSiteOrigin();
  const url = origin ? new URL(path, origin) : undefined;
  const image = origin ? new URL("/social-card.png", origin).href : undefined;
  return {
    title, description, applicationName: "SkyClaim",
    metadataBase: origin ? new URL(origin) : undefined,
    alternates: url ? { canonical: url } : undefined,
    robots: { index: isPubliclyIndexable(), follow: isPubliclyIndexable() },
    openGraph: { title, description, type: "website", siteName: "SkyClaim", locale: "en_US",
      url, images: image ? [{ url: image, width: 1200, height: 630, alt: "SkyClaim: Flight disrupted? Start with your rights. EU261, India DGCA and US DOT." }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}
