import type { ClaimInput } from "./schema";
export const examples: Record<"eu261" | "india" | "us_dot", ClaimInput> = {
  eu261: { flightNumber: "AF 008", airline: "Air France", carrierLicence: "eu", date: "2026-10-14", originIata: "CDG", destIata: "JFK", delayHours: 5.5, passengers: 2, excuse: "technical" },
  india: { flightNumber: "AI 202", airline: "Air India", carrierLicence: "non_eu", date: "2026-10-14", originIata: "DEL", destIata: "BOM", delayHours: 0, passengers: 2, excuse: "technical", jurisdiction: "india", event: "cancellation", indianCarrier: "yes", blockMinutes: 135, basicFareInr: 6500, cancellationNoticeHours: 2, contactProvided: "yes", travelDecision: "no" },
  us_dot: { flightNumber: "UA 100", airline: "United Airlines", carrierLicence: "non_eu", date: "2026-10-14", originIata: "SFO", destIata: "JFK", delayHours: 3, passengers: 2, excuse: "overbooking", jurisdiction: "us_dot", event: "denied_boarding", boardingEligibility: "eligible", oneWayFareUsd: 400, replacementOffered: "yes" },
};
