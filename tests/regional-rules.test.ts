import { describe, expect, it, vi, afterEach } from "vitest";
import { claimSchema, type ClaimInput } from "../lib/schema";
import { assessClaim } from "../lib/assess";
import { evaluateIndia, evaluateUs, usBoardingAmount } from "../lib/regional-rules";
import { createLetter } from "../lib/letter-template";
import { emptyLetterDetails } from "../lib/letter-details";
import { draftClaim } from "../lib/llm";
import { validateEvaluation } from "../lib/evaluation-contract";
import { readHistory, recordFlight } from "../lib/history";
import { POST } from "../app/api/evaluate/route";

const flight: ClaimInput = { flightNumber: "AI 202", airline: "Air India", carrierLicence: "non_eu", date: "2026-10-14", originIata: "DEL", destIata: "BOM", delayHours: 3, passengers: 2, excuse: "technical" };
const india: ClaimInput = { ...flight, jurisdiction: "india", event: "cancellation", indianCarrier: "yes", blockMinutes: 135, basicFareInr: 12000, cancellationNoticeHours: 2, contactProvided: "yes", travelDecision: "no" };
const indiaDelay: ClaimInput = { ...flight, jurisdiction: "india", event: "delay", indianCarrier: "yes", blockMinutes: 150, departureDelayHours: 2, checkedInOnTime: "yes", nightDeparture: "no", travelDecision: "no" };
const indiaBoarding: ClaimInput = { ...flight, jurisdiction: "india", event: "denied_boarding", indianCarrier: "yes", basicFareInr: 6000, travelDecision: "yes", replacementOffered: "yes", alternateDepartureHours: 2, boardingEligibility: "eligible" };
const us: ClaimInput = { ...flight, airline: "United Airlines", jurisdiction: "us_dot", originIata: "SFO", destIata: "JFK", event: "delay", delayHours: 3, travelDecision: "no" };
const usBoarding: ClaimInput = { ...us, event: "denied_boarding", boardingEligibility: "eligible", oneWayFareUsd: 400, replacementOffered: "yes" };
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("DGCA cancellation compensation and independent refund", () => {
  it.each([[60, 5000], [61, 7500], [120, 7500], [121, 10000]])("block time %s minutes -> cap INR %s", (blockMinutes, amount) => {
    const r = evaluateIndia({ ...india, blockMinutes });
    expect(r).toMatchObject({ compensationPerPassenger: amount, totalCompensation: amount * 2, refund: "due", verdict: "likely_eligible" });
  });
  it("caps at basic fare plus fuel without adding the ticket refund", () => expect(evaluateIndia({ ...india, basicFareInr: 3456.75 })).toMatchObject({ compensationPerPassenger: 3456.75, totalCompensation: 6913.5, refund: "due" }));
  it.each([24, 336, 337])("notice of %s hours removes additional payment", (cancellationNoticeHours) => expect(evaluateIndia({ ...india, cancellationNoticeHours })).toMatchObject({ compensationPerPassenger: 0, refund: "due" }));
  it("no booking contacts removes cash, preserves refund", () => expect(evaluateIndia({ ...india, contactProvided: "no" })).toMatchObject({ compensationPerPassenger: 0, refund: "due" }));
  it("accepted alternate travel is not added to compensation plus refund", () => expect(evaluateIndia({ ...india, travelDecision: "yes" })).toMatchObject({ compensationPerPassenger: 0, refund: "not_due" }));
  it.each(["weather", "atc", "other"] as const)("%s cause leaves compensation conditional, refund independent", (excuse) => expect(evaluateIndia({ ...india, excuse })).toMatchObject({ verdict: "borderline", compensationPerPassenger: 10000, refund: "due" }));
  it("foreign-carrier payment basis needs review", () => expect(evaluateIndia({ ...india, indianCarrier: "no" })).toMatchObject({ verdict: "borderline", refund: "due" }));
});

describe("DGCA departure delays and care", () => {
  it.each([[150, 1.5, 0], [150, 2, 1], [151, 2.5, 0], [151, 3, 1], [300, 3, 1], [301, 3.5, 0], [301, 4, 1]])("%s block minutes, %s delayed hours -> %s meal entitlement", (blockMinutes, departureDelayHours, count) => {
    const r = evaluateIndia({ ...indiaDelay, blockMinutes, departureDelayHours });
    expect(r.care).toHaveLength(count); expect(r.compensationPerPassenger).toBe(0);
  });
  it.each([[6, "not_due"], [6.5, "option"]] as const)("domestic %s hours -> refund %s", (departureDelayHours, refund) => expect(evaluateIndia({ ...indiaDelay, departureDelayHours })).toMatchObject({ refund }));
  it("does not extend the domestic six-hour refund option internationally", () => expect(evaluateIndia({ ...indiaDelay, destIata: "JFK", departureDelayHours: 7 }).refund).toBe("not_due"));
  it("on-time check-in is required for meals", () => expect(evaluateIndia({ ...indiaDelay, checkedInOnTime: "no" }).care).toEqual([]));
  it.each([[24, "no", 1], [24.5, "no", 2], [6, "yes", 1], [6.5, "yes", 2]] as const)("%s hours, night %s -> %s care items", (departureDelayHours, nightDeparture, count) => expect(evaluateIndia({ ...indiaDelay, departureDelayHours, nightDeparture }).care).toHaveLength(count));
  it("extraordinary-circumstances care is conditional", () => { const r = evaluateIndia({ ...indiaDelay, excuse: "weather" }); expect(r.verdict).toBe("borderline"); expect(r.notes.join(" ")).toContain("3.4.4"); });
});

describe("DGCA involuntary oversales", () => {
  it.each([[1, 0], [1.5, 10000], [24, 10000], [24.5, 20000]])("alternate departure %s hours -> INR %s", (alternateDepartureHours, amount) => expect(evaluateIndia({ ...indiaBoarding, alternateDepartureHours })).toMatchObject({ compensationPerPassenger: amount, refund: "not_due" }));
  it("declining alternate travel means 400% plus a separate refund", () => expect(evaluateIndia({ ...indiaBoarding, basicFareInr: 2345.25, travelDecision: "no", replacementOffered: "no", alternateDepartureHours: undefined })).toMatchObject({ compensationPerPassenger: 9381, totalCompensation: 18762, refund: "due" }));
  it("checks the one-hour arranged-flight exception before a passenger’s refusal", () => expect(evaluateIndia({ ...indiaBoarding, travelDecision: "no", alternateDepartureHours: 1 })).toMatchObject({ compensationPerPassenger: 0, refund: "due" }));
  it("rejects accepted travel if no alternate was arranged", () => expect(claimSchema.safeParse({ ...indiaBoarding, replacementOffered: "no" }).success).toBe(false));
  it.each(["voluntary", "excluded"] as const)("does not award oversales money for %s", (boardingEligibility) => expect(evaluateIndia({ ...indiaBoarding, boardingEligibility }).compensationPerPassenger).toBe(0));
});

describe("DOT refund rights", () => {
  it.each([["JFK", 2.5, "not_due"], ["JFK", 3, "due"], ["DEL", 5.5, "not_due"], ["DEL", 6, "due"]] as const)("SFO-%s scheduled change %s -> %s", (destIata, delayHours, refund) => expect(evaluateUs({ ...us, destIata, delayHours })).toMatchObject({ refund, compensationPerPassenger: 0 }));
  it("covers inbound flights operated by foreign airlines", () => expect(evaluateUs({ ...us, airline: "Air India", originIata: "DEL", destIata: "JFK", delayHours: 6 }).refund).toBe("due"));
  it("cancellation refund applies regardless of weather and duration", () => expect(evaluateUs({ ...us, event: "cancellation", delayHours: 0, excuse: "weather" })).toMatchObject({ refund: "due", verdict: "likely_eligible", compensationPerPassenger: 0 }));
  it("accepted travel/voucher removes the assessed refund", () => expect(evaluateUs({ ...us, travelDecision: "yes" })).toMatchObject({ refund: "not_due", verdict: "likely_ineligible" }));
  it("undecided passengers receive a choice, not a confirmed refund", () => expect(evaluateUs({ ...us, travelDecision: "undecided" })).toMatchObject({ refund: "option", verdict: "borderline" }));
});

describe("DOT statutory oversales boundaries (14 CFR 250.5)", () => {
  it.each([[1, true, 0], [1.5, true, 800], [2, true, 1600], [3.5, false, 800], [4, false, 1600]])("arrival %s, domestic %s -> USD %s", (delay, domestic, amount) => expect(usBoardingAmount(400, delay as number, domestic as boolean, true).amount).toBe(amount));
  it("no substitute offered uses higher band even if arrival field is zero", () => expect(evaluateUs({ ...usBoarding, replacementOffered: "no", delayHours: 0 })).toMatchObject({ compensationPerPassenger: 1600, refund: "review" }));
  it.each([[1.5, 1075], [2, 2150]])("caps a high fare at %s hours -> USD %s", (delayHours, amount) => expect(evaluateUs({ ...usBoarding, oneWayFareUsd: 2000, delayHours }).compensationPerPassenger).toBe(amount));
  it("rounds cents before multiplying a group total", () => expect(evaluateUs({ ...usBoarding, oneWayFareUsd: 123.45, delayHours: 2 })).toMatchObject({ compensationPerPassenger: 493.8, totalCompensation: 987.6 }));
  it("inbound international oversales is outside Part 250", () => expect(evaluateUs({ ...usBoarding, originIata: "DEL", destIata: "JFK" }).verdict).toBe("outside_scope"));
  it("US territories use the domestic arrival-delay boundary", () => expect(evaluateUs({ ...usBoarding, destIata: "SJU", delayHours: 2 }).compensationPerPassenger).toBe(1600));
  it.each(["voluntary", "excluded"] as const)("excludes %s from the automatic award", (boardingEligibility) => expect(evaluateUs({ ...usBoarding, boardingEligibility }).compensationPerPassenger).toBe(0));
  it("unconfirmed eligibility remains conditional", () => expect(evaluateUs({ ...usBoarding, boardingEligibility: "unknown" }).verdict).toBe("borderline"));
});

describe("rule versions, schemas and region separation", () => {
  it.each([[india, "2023-02-14"], [us, "2024-05-15"], [usBoarding, "2025-01-21"]] as const)("does not apply current amounts before the supported date", (input, date) => expect(assessClaim({ ...input, date })).toMatchObject({ verdict: "outside_scope" }));
  it("India routes must touch India", () => expect(evaluateIndia({ ...india, originIata: "SFO", destIata: "JFK" }).verdict).toBe("outside_scope"));
  it("US refund routes must touch the US", () => expect(evaluateUs({ ...us, originIata: "DEL", destIata: "BOM" }).verdict).toBe("outside_scope"));
  it.each(["blockMinutes", "basicFareInr", "cancellationNoticeHours", "contactProvided", "travelDecision", "indianCarrier"] as const)("requires %s for Indian cancellation", (key) => expect(claimSchema.safeParse({ ...india, [key]: undefined }).success).toBe(false));
  it.each(["oneWayFareUsd", "boardingEligibility", "replacementOffered"] as const)("requires %s for US oversales", (key) => expect(claimSchema.safeParse({ ...usBoarding, [key]: undefined }).success).toBe(false));
  it.each([-1, NaN, Infinity, 1.001])("rejects invalid USD fare %s", (oneWayFareUsd) => expect(claimSchema.safeParse({ ...usBoarding, oneWayFareUsd }).success).toBe(false));
  it("does not silently process EU cancellations as delay claims", () => expect(claimSchema.safeParse({ ...flight, jurisdiction: "eu261", event: "cancellation" }).success).toBe(false));
  it("keeps old EU saved inputs compatible", () => expect(claimSchema.parse(flight)).toEqual(flight));
  it("retains the chosen law and necessary fare facts in local history", () => expect(readHistory(JSON.stringify(recordFlight([], india)))[0].input).toEqual(india));
});

describe("regional API, letters and verification", () => {
  it.each([india, indiaDelay, indiaBoarding, us, usBoarding])("returns verifiable results and correct legal letters", async (input) => {
    vi.stubEnv("OPENAI_API_KEY", "test-key"); const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const response = await POST(new Request("http://localhost/api/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }));
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(validateEvaluation(result, input)).toEqual(result);
    expect(result.drafted.claimLetter).not.toMatch(/Art\. 9|Sturgeon|EUR |EU261/);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects changed currency, refunds, care, money or source", async () => {
    const computed = evaluateIndia(india), draft = await draftClaim(india, computed);
    const response = { input: india, computed, ...draft };
    for (const change of [{ currency: "USD" }, { refund: "not_due" }, { compensationPerPassenger: 99999 }, { notes: [] }, { sourceUrl: "https://example.com" }]) expect(() => validateEvaluation({ ...response, computed: { ...computed, ...change } }, india)).toThrow();
  });
  it("private letter editing preserves INR facts without EU care citations", () => {
    const letter = createLetter(india, evaluateIndia(india), { ...emptyLetterDetails("2026-10-18"), name: "Jordan Example", includeCareExpenses: true });
    expect(letter).toContain("Jordan Example"); expect(letter).toContain("INR 20000"); expect(letter).not.toContain("Art. 9"); expect(letter).not.toContain("EUR");
  });
  it("refund letters do not demand a guessed USD amount", () => {
    const letter = createLetter(us, evaluateUs(us)); expect(letter).toContain("full refund for unused"); expect(letter).toContain("No fixed cash compensation"); expect(letter).not.toMatch(/USD \d/);
  });
  it("returns field errors for incomplete new checks", async () => {
    const response = await POST(new Request("http://localhost/api/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...flight, jurisdiction: "india" }) }));
    expect(response.status).toBe(422); expect((await response.json()).fields.departureDelayHours).toBeTruthy();
  });
});
