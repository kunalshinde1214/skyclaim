import { afterEach, describe, expect, it, vi } from "vitest";
import { admitEvaluation, consumeBudget, createMemoryBudget } from "../lib/request-budget";
import { contentSecurityPolicy } from "../lib/security-headers";
import { draftClaim } from "../lib/llm";
import { evaluateClaim } from "../lib/eu261";
import { examples } from "../lib/examples";

afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });
describe("request admission", () => {
  it("enforces the same window across concurrent consumers", async () => {
    const store = createMemoryBudget();
    const decisions = await Promise.all(Array.from({ length: 20 }, () => consumeBudget(store, 123000, 5)));
    expect(decisions.filter((d) => d.allowed)).toHaveLength(5);
    expect(decisions.every((d) => d.retryAfter === 57)).toBe(true);
    expect((await consumeBudget(store, 180000, 5)).allowed).toBe(true);
  });
  it("computes a safe Retry-After at the window boundary", async () => {
    const store = createMemoryBudget();
    expect(await consumeBudget(store, 59999, 1)).toEqual({ allowed: true, retryAfter: 1 });
    expect(await consumeBudget(store, 59999, 1)).toEqual({ allowed: false, retryAfter: 1 });
    expect(await consumeBudget(store, 60000, 1)).toEqual({ allowed: true, retryAfter: 60 });
  });
  it("rejects cross-site browser requests before consuming a budget", async () => {
    const response = await admitEvaluation(new Request("https://example.com/api/evaluate", { headers: { Origin: "https://elsewhere.example" } }));
    expect(response?.status).toBe(403); expect(response?.headers.get("cache-control")).toBe("no-store");
  });
  it("also rejects Fetch Metadata cross-site requests without an Origin", async () => {
    expect((await admitEvaluation(new Request("https://example.com/api/evaluate", { headers: { "Sec-Fetch-Site": "cross-site" } })))?.status).toBe(403);
  });
  it("uses the configured external origin behind a hosting proxy", async () => {
    vi.stubEnv("APP_ORIGIN", "https://skyclaim.example");
    expect(await admitEvaluation(new Request("http://internal/api/evaluate", { headers: { Origin: "https://skyclaim.example" } }))).toBeUndefined();
  });
  it("accepts the browser's loopback Host when Next normalises the local URL", async () => {
    expect(await admitEvaluation(new Request("http://localhost:3107/api/evaluate", { headers: { host: "127.0.0.1:3107", origin: "http://127.0.0.1:3107" } }))).toBeUndefined();
  });
  it("does not replace the configured production origin with a supplied Host", async () => {
    vi.stubEnv("APP_ORIGIN", "https://skyclaim.example");
    expect((await admitEvaluation(new Request("http://internal/api/evaluate", { headers: { host: "other.example", origin: "https://other.example" } })))?.status).toBe(403);
  });
  it.each([{}, { APP_ORIGIN: "https://example.com" }, { APP_ORIGIN: "http://example.com", SKYCLAIM_RATE_LIMIT_BACKEND: "firestore" }, { APP_ORIGIN: "https://example.com/path", SKYCLAIM_RATE_LIMIT_BACKEND: "firestore" }, { APP_ORIGIN: "https://example.com", SKYCLAIM_RATE_LIMIT_BACKEND: "memory" }, { APP_ORIGIN: "https://example.com", SKYCLAIM_RATE_LIMIT_BACKEND: "firestore", FIRESTORE_EMULATOR_HOST: "localhost:8080" }])("fails closed for incomplete live configuration %j", async (env) => {
    vi.stubEnv("SKYCLAIM_DEPLOYMENT_MODE", "production");
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
    const response = await admitEvaluation(new Request("https://example.com/api/evaluate"));
    expect(response?.status).toBe(503); expect(response?.headers.get("Retry-After")).toBe("60");
  });
  it("does not leak provider details on a failed budget store", async () => {
    await expect(consumeBudget({ consume: async () => { throw new Error("private provider failure"); } })).rejects.toThrow();
  });
});
describe("browser security policy", () => {
  it("restricts production scripts to the per-response nonce and local assets", () => {
    const policy = contentSecurityPolicy("testNonce", false);
    expect(policy).toContain("script-src 'self' 'nonce-testNonce';");
    expect(policy).not.toContain("unsafe-eval");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("font-src 'self'");
  });
  it("allows only development eval/websocket exceptions", () => {
    const policy = contentSecurityPolicy("devNonce", true);
    expect(policy).toContain("'unsafe-eval'"); expect(policy).toContain("ws: wss:");
  });
  it("an explicit operator AI-off switch keeps the complete template", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key"); vi.stubEnv("SKYCLAIM_ENABLE_AI", "false");
    const result = await draftClaim(examples.eu261, evaluateClaim(examples.eu261));
    expect(result.mode).toBe("template"); expect(result.drafted.claimLetter).toContain("EUR 1200");
  });
});
