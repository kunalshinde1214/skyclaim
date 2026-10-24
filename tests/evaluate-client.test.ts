import { afterEach, describe, expect, it, vi } from "vitest";
import { validateEvaluation } from "../lib/evaluation-contract";
import { requestEvaluation } from "../lib/evaluate-client";
import { evaluateClaim } from "../lib/eu261";
import { createLetter } from "../lib/letter-template";
import { rebuttals } from "../lib/rebuttal-fallbacks";
import { claimSchema, type ClaimInput } from "../lib/schema";

const flight: ClaimInput = { flightNumber: "AF 008", airline: "Air France", carrierLicence: "eu", date: "2026-10-14", originIata: "CDG", destIata: "JFK", delayHours: 5.5, passengers: 2, excuse: "technical" };
function responseFor(input = flight) {
  const computed = evaluateClaim(input);
  return { input, computed, drafted: { excuseRebuttal: rebuttals[input.excuse].text, claimLetter: createLetter(input, computed), nextSteps: ["Review the letter.", "Verify the address.", "Keep a copy."], confidenceNote: "Based on your facts." }, mode: "template" as const };
}
const slowFetch = () => vi.fn<typeof fetch>().mockImplementation((_url, init) => new Promise((_resolve, reject) => {
  init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
}));
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("verified evaluation response", () => {
  it.each([{}, { delayHours: 3.5 }, { delayHours: 2.5 }, { excuse: "weather" }, { originIata: "SFO", destIata: "LHR" }] as Partial<ClaimInput>[])("accepts the engine's complete outcome %j", (change) => {
    const input = { ...flight, ...change };
    expect(validateEvaluation(responseFor(input), input)).toEqual(responseFor(input));
  });
  it.each([null, {}, { computed: {} }])("rejects an incomplete successful response %j", (payload) => expect(() => validateEvaluation(payload, flight)).toThrow());
  it.each([{ totalEur: 9999 }, { amountPerPassengerEur: 900 }, { distanceKm: 1 }, { reductionApplied: true }, { tier: 1 }, { coverage: "outside_scope" }, { verdict: "likely_ineligible" }])("rejects changed computed facts %j", (change) => {
    const payload = responseFor();
    Object.assign(payload.computed, change);
    expect(() => validateEvaluation(payload, flight)).toThrow();
  });
  it("rejects a response for a different submitted flight", () => expect(() => validateEvaluation(responseFor({ ...flight, flightNumber: "AF 009" }), flight)).toThrow());
  it("rejects a letter that changes the demanded amount", () => {
    const payload = responseFor(); payload.drafted.claimLetter = payload.drafted.claimLetter.replace("EUR 1200", "EUR 9999");
    expect(() => validateEvaluation(payload, flight)).toThrow();
  });
});

describe("recoverable check requests", () => {
  it("submits only normalised flight facts and returns a verified result", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(responseFor()));
    const input = { ...flight, personalDetails: { name: "PRIVATE-EXAMPLE" } };
    const result = await requestEvaluation(input, { fetcher });
    expect(result.computed).toHaveProperty("totalEur", 1200);
    expect(JSON.parse(fetcher.mock.calls[0][1]!.body as string)).toEqual(flight);
    expect(fetcher.mock.calls[0][1]!.cache).toBe("no-store");
  });
  it("turns a malformed successful response into a recoverable error", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ hello: "world" }));
    await expect(requestEvaluation(flight, { fetcher })).rejects.toMatchObject({ kind: "response" });
  });
  it("handles a non-JSON gateway response without exposing markup", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("<h1>Gateway failed</h1>", { status: 502, headers: { "Content-Type": "text/html" } }));
    await expect(requestEvaluation(flight, { fetcher })).rejects.toMatchObject({ kind: "response", message: expect.not.stringContaining("<h1>") });
  });
  it("handles truncated JSON", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("{", { headers: { "Content-Type": "application/json" } }));
    await expect(requestEvaluation(flight, { fetcher })).rejects.toMatchObject({ kind: "response" });
  });
  it("retains known server field errors and discards unknown fields", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ error: "Check your arrival delay.", fields: { delayHours: "Use half-hour steps.", secret: "Do not render" } }, { status: 422 }));
    await expect(requestEvaluation(flight, { fetcher })).rejects.toMatchObject({ kind: "server", fields: { delayHours: "Use half-hour steps." } });
  });
  it("handles network failure", async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(requestEvaluation(flight, { fetcher })).rejects.toMatchObject({ kind: "network" });
  });
  it("does not start an already-cancelled request", async () => {
    const controller = new AbortController(); controller.abort(); const fetcher = vi.fn<typeof fetch>();
    await expect(requestEvaluation(flight, { fetcher, signal: controller.signal })).rejects.toMatchObject({ kind: "cancelled" });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("cancels an in-progress request", async () => {
    const controller = new AbortController(); const fetcher = slowFetch();
    const pending = requestEvaluation(flight, { fetcher, signal: controller.signal });
    const assertion = expect(pending).rejects.toMatchObject({ kind: "cancelled" });
    controller.abort(); await assertion;
    expect(fetcher.mock.calls[0][1]!.signal!.aborted).toBe(true);
  });
  it("enforces the client deadline and clears its timer", async () => {
    vi.useFakeTimers(); const fetcher = slowFetch();
    const pending = requestEvaluation(flight, { fetcher, timeoutMs: 30 });
    const assertion = expect(pending).rejects.toMatchObject({ kind: "timeout" });
    await vi.advanceTimersByTimeAsync(31); await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });
  it("discards a reply that arrives after cancellation", async () => {
    const controller = new AbortController();
    let reply: (response: Response) => void = () => {};
    const fetcher = vi.fn<typeof fetch>().mockImplementation(() => new Promise((resolve) => { reply = resolve; }));
    const pending = requestEvaluation(flight, { fetcher, signal: controller.signal });
    const assertion = expect(pending).rejects.toMatchObject({ kind: "cancelled" });
    controller.abort(); reply(Response.json(responseFor())); await assertion;
  });
  it("cleans up a completed request's deadline and cancellation listener", async () => {
    vi.useFakeTimers(); const controller = new AbortController();
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(responseFor()));
    await requestEvaluation(flight, { fetcher, signal: controller.signal });
    controller.abort();
    expect(fetcher.mock.calls[0][1]!.signal!.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("uses readable messages for empty and fractional arrival delays", () => {
    for (const [value, message] of [[NaN, "Enter the arrival delay in hours."], [3.25, "Use half-hour steps, such as 3 or 3.5 hours."]] as const) {
      const parsed = claimSchema.safeParse({ ...flight, delayHours: value });
      expect(parsed.success).toBe(false);
      if (!parsed.success) expect(parsed.error.issues.find((issue) => issue.path[0] === "delayHours")?.message).toBe(message);
    }
  });
});
