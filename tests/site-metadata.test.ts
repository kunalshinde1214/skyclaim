import { afterEach, describe, expect, it, vi } from "vitest";
import { isPubliclyIndexable, pageMetadata, publicSiteOrigin } from "../lib/site-metadata";
import robots from "../app/robots";
import sitemap from "../app/sitemap";

afterEach(() => vi.unstubAllEnvs());
describe("public-site metadata", () => {
  it("keeps an unconfigured preview out of search without inventing a host", () => {
    vi.stubEnv("APP_ORIGIN", "");
    vi.stubEnv("SKYCLAIM_DEPLOYMENT_MODE", "demo");
    vi.stubEnv("SKYCLAIM_ALLOW_INDEXING", "true");
    const meta = pageMetadata("Preview", "Description", "/privacy");
    expect(meta.alternates).toBeUndefined();
    expect(meta.robots).toEqual({ index: false, follow: false });
    expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
    expect(sitemap()).toEqual([]);
  });
  it("rejects insecure, credential-bearing and path-based canonical origins", () => {
    for (const value of ["http://example.test", "https://user:secret@example.test", "https://example.test/path", "https://example.test?x=1", "https://localhost", "invalid"]) {
      vi.stubEnv("APP_ORIGIN", value);
      expect(publicSiteOrigin()).toBeUndefined();
    }
  });
  it("gives each companion page its own canonical and share URL", () => {
    vi.stubEnv("APP_ORIGIN", "https://skyclaim.example");
    const meta = pageMetadata("Privacy", "Data use", "/privacy");
    expect(String(meta.alternates?.canonical)).toBe("https://skyclaim.example/privacy");
    expect(String((meta.openGraph as { url: URL }).url)).toBe("https://skyclaim.example/privacy");
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", images: ["https://skyclaim.example/social-card.png"] });
  });
  it("requires an explicit production indexing opt-in", () => {
    vi.stubEnv("APP_ORIGIN", "https://skyclaim.example");
    vi.stubEnv("SKYCLAIM_DEPLOYMENT_MODE", "production");
    vi.stubEnv("SKYCLAIM_ALLOW_INDEXING", "false");
    expect(isPubliclyIndexable()).toBe(false);
    vi.stubEnv("SKYCLAIM_ALLOW_INDEXING", "true");
    expect(isPubliclyIndexable()).toBe(true);
    vi.stubEnv("SKYCLAIM_DEPLOYMENT_MODE", "demo");
    expect(isPubliclyIndexable()).toBe(false);
  });
  it("lists actual public pages and excludes the API after opt-in", () => {
    vi.stubEnv("APP_ORIGIN", "https://skyclaim.example");
    vi.stubEnv("SKYCLAIM_DEPLOYMENT_MODE", "production");
    vi.stubEnv("SKYCLAIM_ALLOW_INDEXING", "true");
    expect(sitemap().map(item => item.url)).toEqual(["https://skyclaim.example/", "https://skyclaim.example/roadmap", "https://skyclaim.example/trust", "https://skyclaim.example/privacy", "https://skyclaim.example/terms"]);
    expect(robots()).toEqual({ rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: "https://skyclaim.example/sitemap.xml" });
  });
});
