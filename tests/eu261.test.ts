import { describe, expect, it } from "vitest";
import { amountForDelay, compensationTier, evaluateClaim, haversineKm } from "../lib/eu261";
import { airports, EU_COUNTRIES, getAirport } from "../lib/airports";
import { claimSchema, type ClaimInput } from "../lib/schema";
import { createLetter } from "../lib/letter-template";

export const flight: ClaimInput = { flightNumber: "AF 008", airline: "Air France", carrierLicence: "eu", date: "2026-10-14", originIata: "CDG", destIata: "JFK", delayHours: 5.5, passengers: 2, excuse: "technical" };
const evaluate = (changes: Partial<ClaimInput> = {}) => evaluateClaim({ ...flight, ...changes });

describe("distance and compensation boundaries", () => {
  it.each([
    [0, false, 1, 250], [1500, false, 1, 250], [1500.001, false, 2, 400],
    [3500, false, 2, 400], [3500.001, false, 3, 600], [4200, true, 2, 400],
  ])("%s km, intra-EU %s -> tier %s, EUR %s", (distance, intraEu, tier, baseAmountEur) => {
    expect(compensationTier(distance as number, intraEu as boolean)).toEqual({ tier, baseAmountEur });
  });
  it.each([
    [1, 2.999, 0, false], [1, 3, 250, false], [2, 3, 400, false],
    [3, 2.999, 0, false], [3, 3, 300, true], [3, 3.999, 300, true],
    [3, 4, 600, false], [3, 4.001, 600, false], [2, 3.5, 400, false],
  ])("tier %s, %s hours -> EUR %s, reduction %s", (tier, delay, amount, reductionApplied) => {
    expect(amountForDelay(tier as 1 | 2 | 3, delay as number)).toEqual({ amount, reductionApplied });
  });
  it("rejects invalid distance and delay values", () => {
    for (const number of [NaN, Infinity, -1]) { expect(() => compensationTier(number, false)).toThrow(); expect(() => amountForDelay(3, number)).toThrow(); }
  });
  it("calculates great-circle distances without direction dependence", () => {
    const paris = getAirport("CDG")!, jfk = getAirport("JFK")!;
    const distance = haversineKm(paris, jfk);
    expect(distance).toBeGreaterThan(5800); expect(distance).toBeLessThan(5900);
    expect(haversineKm(jfk, paris)).toBeCloseTo(distance, 8);
    expect(haversineKm(paris, paris)).toBe(0);
    expect(haversineKm({ lat: 0, lon: 0 }, { lat: 0, lon: 180 })).toBeCloseTo(Math.PI * 6371.0088);
  });
});

describe("coverage, causation and totals", () => {
  it("calculates the complete demo path", () => { const c = evaluate(); expect(c).toMatchObject({ verdict: "likely_eligible", coverage: "covered", tier: 3, amountPerPassengerEur: 600, totalEur: 1200, reductionApplied: false, delayHours: 5.5, passengers: 2 }); expect(c.distanceKm).toBe(Math.round(haversineKm(getAirport("CDG")!, getAirport("JFK")!))); });
  it("covers any carrier departing the EU", () => expect(evaluate({ airline: "United Airlines", carrierLicence: "non_eu" }).verdict).toBe("likely_eligible"));
  it("covers an inbound EU-licensed operating carrier", () => expect(evaluate({ originIata: "JFK", destIata: "CDG" }).coverage).toBe("covered"));
  it("excludes an inbound non-EU carrier and cannot be bypassed with a false declaration", () => expect(evaluate({ originIata: "JFK", destIata: "CDG", airline: "United Airlines", carrierLicence: "eu" })).toMatchObject({ verdict: "outside_scope", totalEur: 0 }));
  it("does not classify the original SFO-LHR BA sample as EU261", () => expect(evaluate({ originIata: "SFO", destIata: "LHR", airline: "British Airways" })).toMatchObject({ verdict: "outside_scope", totalEur: 0 }));
  it("asks for proof when an inbound carrier licence is unknown", () => expect(evaluate({ originIata: "JFK", destIata: "CDG", airline: "Example Air", carrierLicence: "unknown" })).toMatchObject({ coverage: "unconfirmed", verdict: "borderline", amountPerPassengerEur: 600 }));
  it("honours declared licensing for unlisted operating carriers", () => expect(evaluate({ originIata: "JFK", destIata: "CDG", airline: "Example Air", carrierLicence: "eu" }).verdict).toBe("likely_eligible"));
  it("gives zero for an arrival delay under three hours", () => expect(evaluate({ delayHours: 2.5 })).toMatchObject({ verdict: "likely_ineligible", amountPerPassengerEur: 0, totalEur: 0 }));
  it("caps an intra-EU flight longer than 3500km at EUR400 without reduction", () => expect(evaluate({ originIata: "HEL", destIata: "LPA", delayHours: 3.5 })).toMatchObject({ tier: 2, intraEu: true, amountPerPassengerEur: 400, reductionApplied: false }));
  it.each(["weather", "atc", "other", "overbooking"] as const)("marks %s conditional instead of guaranteeing money", (excuse) => expect(evaluate({ excuse }).verdict).toBe("borderline"));
  it.each(["technical", "crew", "none"] as const)("keeps %s provisionally eligible", (excuse) => expect(evaluate({ excuse }).verdict).toBe("likely_eligible"));
  it("multiplies the reduced band by the passenger count", () => expect(evaluate({ delayHours: 3.5, passengers: 3 })).toMatchObject({ amountPerPassengerEur: 300, totalEur: 900, reductionApplied: true }));
  it("rejects invalid airport pairs and passengers", () => { expect(() => evaluate({ destIata: "CDG" })).toThrow(); expect(() => evaluate({ destIata: "XXX" })).toThrow(); expect(() => evaluate({ passengers: -1 })).toThrow(); });
});

describe("input, data and letters", () => {
  it.each([{ passengers: 0 }, { passengers: 1.5 }, { passengers: 10 }, { delayHours: -1 }, { delayHours: 3.25 }, { date: "2026-02-30" }, { date: "2099-01-01" }, { date: "2020-01-01" }, { destIata: "CDG" }, { originIata: "XYZ" }, { airline: "Air\nFrance" }])("rejects unsupported input %j", (changes) => expect(claimSchema.safeParse({ ...flight, ...changes }).success).toBe(false));
  it("normalises flight numbers and IATA codes", () => expect(claimSchema.parse({ ...flight, flightNumber: " af 008 ", originIata: "cdg" })).toMatchObject({ flightNumber: "AF 008", originIata: "CDG" }));
  it("contains unique sourced airport codes and valid coordinates", () => { expect(airports.length).toBeGreaterThanOrEqual(120); expect(new Set(airports.map((a) => a.iata)).size).toBe(airports.length); expect(EU_COUNTRIES.size).toBe(27); for (const airport of airports) { expect(airport.iata).toMatch(/^[A-Z]{3}$/); expect(Math.abs(airport.lat)).toBeLessThanOrEqual(90); expect(Math.abs(airport.lon)).toBeLessThanOrEqual(180); } });
  it("spot-checks five source coordinates", () => { expect(getAirport("CDG")!.lat).toBeCloseTo(49.0128, 3); expect(getAirport("JFK")!.lon).toBeCloseTo(-73.7789, 3); expect(getAirport("LHR")!.lat).toBeCloseTo(51.4706, 3); expect(getAirport("FRA")!.lon).toBeCloseTo(8.57056, 3); expect(getAirport("SFO")!.lat).toBeCloseTo(37.619, 3); });
  it("assembles the correct facts and amounts into a usable claim", () => { const letter = createLetter(flight, evaluate()); expect(letter).toContain("EUR 600 per passenger"); expect(letter).toContain("EUR 1200"); expect(letter).toContain("AF 008"); expect(letter).toContain("14 October 2026"); expect(letter).toContain("5.5 hours"); expect(letter).toContain("Art. 7(1)(c)"); expect(letter).toContain("C-402/07"); expect(letter).toContain("14 days"); expect(letter).toContain("[Your booking reference]"); expect(letter).toContain("verify before sending"); });
  it("writes an evidence request rather than a guaranteed compensation demand for weather", () => { const input = { ...flight, excuse: "weather" as const }; const letter = createLetter(input, evaluate({ excuse: "weather" })); expect(letter).toContain("Request for delay evidence"); expect(letter).toContain("conditional assessment"); expect(letter).not.toContain("I request compensation of"); });
  it("suppresses compensation letters for under-threshold or unsupported flights", () => { expect(createLetter({ ...flight, delayHours: 2 }, evaluate({ delayHours: 2 }))).toBe(""); expect(createLetter(flight, evaluate({ originIata: "SFO", destIata: "LHR" }))).toBe(""); });
});
