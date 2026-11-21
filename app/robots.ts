import type { MetadataRoute } from "next";
import { isPubliclyIndexable, publicSiteOrigin } from "../lib/site-metadata";

export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  return isPubliclyIndexable()
    ? { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: `${publicSiteOrigin()}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
