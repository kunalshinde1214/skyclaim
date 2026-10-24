import { describe, expect, it } from "vitest";
import { createLetter } from "../lib/letter-template";
import { emptyLetterDetails, resolveLetterDetails, type LetterDetails } from "../lib/letter-details";
import { evaluateClaim } from "../lib/eu261";
import type { ClaimInput } from "../lib/schema";
import { readHistory, recordFlight } from "../lib/history";

const flight: ClaimInput = { flightNumber: "AF 008", airline: "Air France", carrierLicence: "eu", date: "2026-10-14", originIata: "CDG", destIata: "JFK", delayHours: 5.5, passengers: 2, excuse: "technical" };
const details: LetterDetails = {
  name: "Jordan Example", postalAddress: "10 Example Lane\nExampletown", contactDetails: "jordan@example.invalid",
  bookingReference: "EXAMPLE", airlineAddress: "Claims Department\nVerified address supplied by passenger",
  letterDate: "2026-10-18", otherPassengers: "Taylor Example — authority attached", includeCareExpenses: false,
};

describe("private letter personalisation", () => {
  it("fills the sender, signature, addresses, date and reference without changing computed facts", () => {
    const facts = evaluateClaim(flight);
    const letter = createLetter(flight, facts, details);
    expect(letter).toContain("Jordan Example\n10 Example Lane\nExampletown");
    expect(letter).toContain("18 October 2026");
    expect(letter).toContain("Booking reference: EXAMPLE");
    expect(letter).toContain("Yours faithfully,\nJordan Example\nTaylor Example");
    expect(letter).toContain("EUR 600 per passenger");
    expect(letter).toContain("EUR 1200");
    expect(letter).toContain("AF 008");
    expect(letter).toContain("5.5 hours");
    expect(letter).not.toMatch(/\[Your|\[Date|\[Airline|\[Optional|\[Other/);
    expect(resolveLetterDetails(details, 2).missingFields).toEqual([]);
    expect(facts).toEqual(evaluateClaim(flight));
  });
  it("leaves clear placeholders for whitespace-only or missing details", () => {
    const blank = { ...emptyLetterDetails("2026-10-18"), name: "   " };
    const fields = resolveLetterDetails(blank, 2);
    expect(fields.name).toBe("[Your name]");
    expect(fields.missingFields).toContain("Other passengers / authority");
    expect(fields.missingFields).not.toContain("Letter date");
    expect(fields.missingFields).toHaveLength(6);
  });
  it.each(["2026-02-30", "not-a-date", "2026-99-01"])("does not invent a letter date for %s", (date) => {
    const fields = resolveLetterDetails({ ...details, letterDate: date }, 2);
    expect(fields.date).toBe("[Date of this letter]");
    expect(fields.missingFields).toContain("Letter date");
  });
  it("only includes a care request when the passenger opts in", () => {
    const facts = evaluateClaim(flight);
    expect(createLetter(flight, facts, details)).not.toContain("Itemised receipts are attached");
    expect(createLetter(flight, facts, { ...details, includeCareExpenses: true })).toContain("Itemised receipts are attached");
  });
  it("does not require other passengers for a single-passenger claim", () => {
    const input = { ...flight, passengers: 1 };
    const personal = { ...details, otherPassengers: "" };
    expect(resolveLetterDetails(personal, 1).missingFields).toEqual([]);
    expect(createLetter(input, evaluateClaim(input), personal)).not.toContain("[Other passengers");
  });
  it("does not interpret replacement syntax or placeholders inside user input", () => {
    const input = { ...flight, airline: "[Your name] Airlines" };
    const personal = { ...details, name: "$& [Your booking reference]" };
    const letter = createLetter(input, evaluateClaim(input), personal);
    expect(letter).toContain("[Your name] Airlines — Customer Relations");
    expect(letter).toContain("Yours faithfully,\n$& [Your booking reference]");
    expect(letter).toContain("Booking reference: EXAMPLE");
  });
  it("keeps conditional assessments conditional after personalisation", () => {
    const input = { ...flight, excuse: "weather" as const };
    const letter = createLetter(input, evaluateClaim(input), details);
    expect(letter).toContain("conditional assessment");
    expect(letter).not.toContain("I request compensation of");
    expect(letter).toContain(details.name);
  });
  it("never generates a demand for an unsupported or under-threshold flight", () => {
    for (const input of [{ ...flight, delayHours: 2 }, { ...flight, originIata: "SFO", destIata: "LHR" }]) {
      expect(createLetter(input, evaluateClaim(input), details)).toBe("");
    }
  });
});

describe("flight-only history", () => {
  it("handles corrupt, unexpected or invalid stored data", () => {
    for (const stored of [null, "{broken", "null", "{}", JSON.stringify([{ input: flight, savedAt: "not a date" }])]) expect(readHistory(stored)).toEqual([]);
  });
  it("strips personal and unknown fields from previously stored entries", () => {
    const stored = JSON.stringify([{ input: { ...flight, ...details }, savedAt: "2026-10-18T08:00:00Z", personal: details }]);
    const history = readHistory(stored);
    expect(history).toHaveLength(1);
    expect(history[0].input).toEqual(flight);
    expect(JSON.stringify(history)).not.toContain("Jordan");
    expect(history[0]).not.toHaveProperty("personal");
  });
  it("retains only the last five distinct flight inputs", () => {
    let history = [] as ReturnType<typeof readHistory>;
    for (let i = 0; i < 7; i++) history = recordFlight(history, { ...flight, flightNumber: `AF ${100 + i}` }, `2026-10-18T08:00:0${i}Z`);
    expect(history).toHaveLength(5);
    expect(history[0].input.flightNumber).toBe("AF 106");
    expect(history[4].input.flightNumber).toBe("AF 102");
    const restored = readHistory(JSON.stringify([...history, history[0]]));
    expect(restored).toEqual(history);
  });
  it("distinguishes checks of the same flight with different delays", () => {
    const first = recordFlight([], flight);
    const second = recordFlight(first, { ...flight, delayHours: 3.5 });
    expect(second).toHaveLength(2);
    expect(recordFlight(second, flight)).toHaveLength(2);
    expect(recordFlight(second, flight)[0].input.delayHours).toBe(5.5);
  });
});
