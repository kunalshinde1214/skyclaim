import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "../app/api/evaluate/route";
import { draftClaim } from "../lib/llm";
import { evaluateClaim } from "../lib/eu261";
import type { ClaimInput } from "../lib/schema";

const flight: ClaimInput = { flightNumber: "AF 008", airline: "Air France", carrierLicence: "eu", date: "2026-10-14", originIata: "CDG", destIata: "JFK", delayHours: 5.5, passengers: 2, excuse: "technical" };
const request = (body: unknown) => new Request("http://localhost/api/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("evaluate API", () => {
  it("returns an uncached complete template response with no API key", async () => { vi.stubEnv("OPENAI_API_KEY", ""); const response = await POST(request(flight)); expect(response.status).toBe(200); expect(response.headers.get("Cache-Control")).toBe("no-store"); const data = await response.json(); expect(data.computed.totalEur).toBe(1200); expect(data.mode).toBe("template"); expect(data.drafted.claimLetter).toContain("EUR 1200"); });
  it("returns field errors instead of evaluating unknown airports", async () => { const response = await POST(request({ ...flight, originIata: "XYZ" })); expect(response.status).toBe(422); expect((await response.json()).fields.originIata).toBeTruthy(); });
  it("rejects malformed JSON", async () => { const response = await POST(new Request("http://localhost/api/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" })); expect(response.status).toBe(400); });
  it("rejects other content types", async () => { const response = await POST(new Request("http://localhost/api/evaluate", { method: "POST", body: "hi" })); expect(response.status).toBe(415); });
  it("bounds request size even without a Content-Length", async () => { const response = await POST(request({ extra: "x".repeat(9000) })); expect(response.status).toBe(413); });
  it("ignores client-supplied amounts", async () => { vi.stubEnv("OPENAI_API_KEY", ""); const data = await (await POST(request({ ...flight, computed: { totalEur: 999999 } }))).json(); expect(data.computed.totalEur).toBe(1200); expect(data.input).not.toHaveProperty("computed"); });
  it("does not echo or use accidental personal fields", async () => { vi.stubEnv("OPENAI_API_KEY", ""); const response = await POST(request({ ...flight, personalDetails: { name: "Jordan Example", bookingReference: "PRIVATE-EXAMPLE" } })); const data = await response.json(); expect(JSON.stringify(data)).not.toContain("Jordan Example"); expect(JSON.stringify(data)).not.toContain("PRIVATE-EXAMPLE"); expect(data.drafted.claimLetter).toContain("[Your name]"); });
});

describe("bounded AI adapter and independent letter", () => {
  const prose = "Routine technical faults are generally part of running an airline. Ask for the specific cause and evidence of the reasonable measures taken. Exceptional underlying events may require a different assessment.";
  const modelResponse = (content: unknown) => Response.json({ output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(content) }] }] });
  it("accepts valid optional prose without letting the model supply the letter", async () => { vi.stubEnv("OPENAI_API_KEY", "test-only"); const fetcher = vi.fn().mockResolvedValue(modelResponse({ explanation: prose })); vi.stubGlobal("fetch", fetcher); const result = await draftClaim(flight, evaluateClaim(flight)); expect(result.mode).toBe("ai"); expect(result.drafted.excuseRebuttal).toBe(prose); expect(result.drafted.claimLetter).toContain("EUR 1200"); expect(fetcher).toHaveBeenCalledTimes(1); const body = JSON.parse(fetcher.mock.calls[0][1].body); expect(body.input).not.toContain("AF 008"); expect(body.store).toBe(false); });
  it("retries invalid JSON once then falls back", async () => { vi.stubEnv("OPENAI_API_KEY", "test-only"); const fetcher = vi.fn().mockImplementation(async () => Response.json({ output: [] })); vi.stubGlobal("fetch", fetcher); const result = await draftClaim(flight, evaluateClaim(flight)); expect(result.mode).toBe("template"); expect(result.drafted.claimLetter).toContain("EUR 1200"); expect(fetcher).toHaveBeenCalledTimes(2); });
  it("rejects invented money and extra fields", async () => { vi.stubEnv("OPENAI_API_KEY", "test-only"); const fetcher = vi.fn().mockImplementation(async () => modelResponse({ explanation: "You are owed EUR 9999. This compensation is guaranteed and the airline must pay.", claimLetter: "Fake letter" })); vi.stubGlobal("fetch", fetcher); const result = await draftClaim(flight, evaluateClaim(flight)); expect(result.mode).toBe("template"); expect(result.drafted.claimLetter).not.toContain("9999"); });
  it("survives network failure with two bounded attempts", async () => { vi.stubEnv("OPENAI_API_KEY", "test-only"); const fetcher = vi.fn().mockRejectedValue(new Error("offline")); vi.stubGlobal("fetch", fetcher); expect((await draftClaim(flight, evaluateClaim(flight))).mode).toBe("template"); expect(fetcher).toHaveBeenCalledTimes(2); });
  it("does not call AI for an unsupported route", async () => { vi.stubEnv("OPENAI_API_KEY", "test-only"); const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher); const input = { ...flight, originIata: "SFO", destIata: "LHR" }; expect((await draftClaim(input, evaluateClaim(input))).drafted.claimLetter).toBe(""); expect(fetcher).not.toHaveBeenCalled(); });
});
