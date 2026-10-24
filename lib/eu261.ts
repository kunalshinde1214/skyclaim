import { EU_COUNTRIES, getAirport, type Airport } from "./airports";
import { carrierLicence } from "./airlines";
import type { ClaimInput } from "./schema";

export type Verdict = "likely_eligible" | "likely_ineligible" | "borderline" | "outside_scope";
export type Computed = {
  verdict: Verdict;
  coverage: "covered" | "unconfirmed" | "outside_scope";
  reason: string;
  distanceKm: number;
  tier: 1 | 2 | 3;
  baseAmountEur: number;
  amountPerPassengerEur: number;
  totalEur: number;
  reductionApplied: boolean;
  intraEu: boolean;
  delayHours: number;
  passengers: number;
  legalBasis: string;
};

export function haversineKm(origin: Pick<Airport, "lat" | "lon">, destination: Pick<Airport, "lat" | "lon">) {
  const radians = (n: number) => n * Math.PI / 180;
  const dLat = radians(destination.lat - origin.lat);
  const dLon = radians(destination.lon - origin.lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(origin.lat)) * Math.cos(radians(destination.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(Math.min(1, a)), Math.sqrt(Math.max(0, 1 - a)));
}

export function compensationTier(distanceKm: number, intraEu: boolean) {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) throw new Error("Invalid distance.");
  if (distanceKm <= 1500) return { tier: 1 as const, baseAmountEur: 250 };
  if (intraEu || distanceKm <= 3500) return { tier: 2 as const, baseAmountEur: 400 };
  return { tier: 3 as const, baseAmountEur: 600 };
}

export function amountForDelay(tier: 1 | 2 | 3, delayHours: number) {
  if (!Number.isFinite(delayHours) || delayHours < 0) throw new Error("Invalid delay.");
  if (delayHours < 3) return { amount: 0, reductionApplied: false };
  const reductionApplied = tier === 3 && delayHours < 4;
  return { amount: reductionApplied ? 300 : ({ 1: 250, 2: 400, 3: 600 })[tier], reductionApplied };
}

// Input is validated at the API boundary. All compensation and coverage decisions stay here.
export function evaluateClaim(input: ClaimInput): Computed {
  const origin = getAirport(input.originIata);
  const dest = getAirport(input.destIata);
  if (!origin || !dest || origin.iata === dest.iata) throw new Error("Invalid airport pair.");
  if (!Number.isInteger(input.passengers) || input.passengers < 1 || input.passengers > 9) throw new Error("Invalid passenger count.");
  const originEu = EU_COUNTRIES.has(origin.country);
  const destEu = EU_COUNTRIES.has(dest.country);
  const licence = carrierLicence(input.airline, input.carrierLicence);
  const coverage = originEu || (destEu && licence === "eu") ? "covered"
    : destEu && licence === "unknown" ? "unconfirmed" : "outside_scope";
  const intraEu = originEu && destEu;
  const rawDistance = haversineKm(origin, dest);
  // Decide on the unrounded distance. Only display is rounded.
  const tier = compensationTier(rawDistance, intraEu);
  const band = amountForDelay(tier.tier, input.delayHours);
  let verdict: Verdict = "likely_eligible";
  let reason = "Your route and arrival delay meet this check's EU261 conditions. Compensation still depends on the airline's evidence.";
  if (coverage === "outside_scope") {
    verdict = "outside_scope";
    reason = "This flight is outside the EU27 coverage assessed here. UK, Swiss and EEA extensions and other passenger-rights regimes may still apply.";
  } else if (input.delayHours < 3) {
    verdict = "likely_ineligible";
    reason = "Your final arrival delay is below the three-hour threshold for this delay-compensation check. Other assistance rights may still apply.";
  } else if (coverage === "unconfirmed") {
    verdict = "borderline";
    reason = "For a flight into the EU from outside it, confirm that the operating carrier holds an EU licence before claiming.";
  } else if (["atc", "weather", "other", "overbooking"].includes(input.excuse)) {
    verdict = "borderline";
    reason = input.excuse === "overbooking"
      ? "Denied boarding follows separate rules. This version checks arrival delays; ask the airline to clarify what happened before using a compensation demand."
      : "The airline's stated cause needs evidence. Your amount is conditional on the event failing the extraordinary-circumstances test.";
  }
  const amount = verdict === "outside_scope" || verdict === "likely_ineligible" ? 0 : band.amount;
  return {
    verdict, coverage, reason, distanceKm: Math.round(rawDistance), ...tier,
    amountPerPassengerEur: amount, totalEur: amount * input.passengers,
    reductionApplied: amount > 0 && band.reductionApplied,
    intraEu, delayHours: input.delayHours, passengers: input.passengers,
    legalBasis: `Reg. (EC) No 261/2004, Art. 7(1)(${({ 1: "a", 2: "b", 3: "c" })[tier.tier]})`,
  };
}
