import type { MetadataRoute } from "next";
import { isPubliclyIndexable, publicSiteOrigin } from "../lib/site-metadata";

export const dynamic = "force-dynamic";
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = publicSiteOrigin();
  return origin && isPubliclyIndexable()
    ? ["/", "/roadmap", "/trust", "/privacy", "/terms"].map(path => ({ url: new URL(path, origin).href }))
    : [];
}
