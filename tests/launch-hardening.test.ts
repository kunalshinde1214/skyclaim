import { afterEach, describe, expect, it, vi } from "vitest";
import { HISTORY_TTL_MS, readHistory, recordFlight } from "../lib/history";
import { admitEvaluation } from "../lib/request-budget";
import { draftClaim } from "../lib/llm";
import { assessClaim } from "../lib/assess";
import { examples } from "../lib/examples";
import { claimSchema } from "../lib/schema";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("launch safety regressions", () => {
  it("preserves exact delay facts at a compensation boundary", () => {
    const input = claimSchema.parse({ ...examples.eu261, delayHours: 3.75 });
    expect(assessClaim(input)).toMatchObject({ amountPerPassengerEur: 300, totalEur: 600 });
    expect(assessClaim({ ...input, delayHours: 4 })).toMatchObject({ amountPerPassengerEur: 600 });
  });
  it("does not send an AI request just because a key is configured", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only"); vi.stubEnv("SKYCLAIM_ENABLE_AI", "");
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    expect((await draftClaim(examples.eu261, assessClaim(examples.eu261))).mode).toBe("template");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects an unconfigured public production deployment", async () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("SKYCLAIM_DEPLOYMENT_MODE", ""); vi.stubEnv("APP_ORIGIN", "");
    expect((await admitEvaluation(new Request("https://public.example/api/evaluate")))?.status).toBe(503);
    expect((await admitEvaluation(new Request("https://public.example/api/evaluate", { headers: { host: "localhost:3107" } })))?.status).toBe(503);
  });
  it("preserves the no-credential local production demo", async () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("APP_ORIGIN", ""); vi.stubEnv("SKYCLAIM_DEPLOYMENT_MODE", "demo");
    expect(await admitEvaluation(new Request("http://localhost:3107/api/evaluate", { headers: { host: "127.0.0.1:3107" } }))).toBeUndefined();
  });
  it("lets an operator stop assessments without sending provider requests", async () => {
    vi.stubEnv("SKYCLAIM_CHECKS_ENABLED", "false");
    const response = await admitEvaluation(new Request("http://localhost:3107/api/evaluate"));
    expect(response?.status).toBe(503); expect(response?.headers.get("Retry-After")).toBe("60");
  });
  it("drops expired and future history timestamps at the retention boundary", () => {
    const now = Date.parse("2026-11-21T12:00:00Z");
    const rows = [-HISTORY_TTL_MS, -HISTORY_TTL_MS + 1, 1].map((offset, i) => ({ input: { ...examples.eu261, flightNumber: `AF ${i + 10}` }, savedAt: new Date(now + offset).toISOString() }));
    const history = readHistory(JSON.stringify(rows), now);
    expect(history.map(row => row.input.flightNumber)).toEqual(["AF 11"]);
  });
  it("also removes expired records when a new flight is saved", () => {
    const old = recordFlight([], examples.eu261, "2026-09-01T00:00:00Z");
    expect(recordFlight(old, examples.india, "2026-11-21T00:00:00Z")).toHaveLength(1);
  });
});
