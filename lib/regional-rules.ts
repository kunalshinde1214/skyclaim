import { getAirport } from "./airports";
import type { Verdict } from "./eu261";
import { claimSchema, type ClaimInput } from "./schema";

export const INDIA_SOURCE = "https://www.dgca.gov.in/digigov-portal/Upload?attachId=we1PSlOuQhYdHcwKKrm7ew%3D%3D&flag=iframeAttachView";
export const US_REFUND_SOURCE = "https://www.transportation.gov/individuals/aviation-consumer-protection/refunds";
export const US_BOARDING_SOURCE = "https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-250";
export const jurisdictionNames = { eu261: "EU261", india: "India · DGCA", us_dot: "USA · DOT" };
export const eventNames = { delay: "Flight delay", cancellation: "Airline cancellation", denied_boarding: "Denied boarding" };

export type RegionalComputed = {
  jurisdiction: "india" | "us_dot";
  verdict: Verdict;
  coverage: "covered" | "outside_scope";
  currency: "INR" | "USD";
  reason: string;
  compensationPerPassenger: number;
  totalCompensation: number;
  refund: "due" | "option" | "not_due" | "review";
  care: string[];
  notes: string[];
  formula: string;
  legalBasis: string;
  sourceUrl: string;
  passengers: number;
};
const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
// Part 250 includes US territories and possessions in domestic transportation.
const US_COUNTRIES = new Set(["United States", "Puerto Rico", "Guam", "Virgin Islands", "American Samoa", "Northern Mariana Islands"]);
export function formatMoney(n: number, currency: "INR" | "USD" | "EUR") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { style: "currency", currency, maximumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);
}
export function isRegional(facts: object): facts is RegionalComputed { return "jurisdiction" in facts; }

function base(input: ClaimInput, jurisdiction: "india" | "us_dot"): RegionalComputed {
  return { jurisdiction, verdict: "likely_ineligible", coverage: "covered", currency: jurisdiction === "india" ? "INR" : "USD", reason: "", compensationPerPassenger: 0, totalCompensation: 0, refund: "not_due", care: [], notes: [], formula: "No fixed cash compensation for an ordinary flight delay.", legalBasis: "", sourceUrl: jurisdiction === "india" ? INDIA_SOURCE : US_REFUND_SOURCE, passengers: input.passengers };
}
function outside(result: RegionalComputed, reason: string): RegionalComputed {
  return { ...result, verdict: "outside_scope", coverage: "outside_scope", reason, formula: "Not assessed by this rule version." };
}
function finish(result: RegionalComputed) {
  result.totalCompensation = money(result.compensationPerPassenger * result.passengers);
  return result;
}

// CAR Section 3, Series M Part IV, Revision 4; effective 15 February 2023.
export function evaluateIndia(raw: ClaimInput): RegionalComputed {
  const input = claimSchema.parse({ ...raw, jurisdiction: "india" });
  const r = base(input, "india");
  r.legalBasis = "DGCA CAR, Section 3, Series M Part IV (Rev. 4)";
  const origin = getAirport(input.originIata)!, dest = getAirport(input.destIata)!;
  if (origin.country !== "India" && dest.country !== "India") return outside(r, "This route does not touch India. Select another passenger-rights regime.");
  if (input.date < "2023-02-15") return outside(r, "This DGCA rule version applies from 15 February 2023. Earlier flights need a historical-rule assessment.");
  const event = input.event ?? "delay";
  const uncertainCause = ["weather", "atc", "other"].includes(input.excuse);
  if (event === "delay") {
    const delay = input.departureDelayHours!;
    const mealThreshold = input.blockMinutes! <= 150 ? 2 : input.blockMinutes! <= 300 ? 3 : 4;
    const timely = input.checkedInOnTime === "yes";
    if (timely && delay >= mealThreshold) r.care.push("Meals and refreshments appropriate to the airport waiting time.");
    if (delay > 24 || (input.nightDeparture === "yes" && delay > 6)) r.care.push("Hotel accommodation when necessary, including transfers.");
    const domestic = origin.country === "India" && dest.country === "India";
    if (domestic && delay > 6 && input.travelDecision !== "yes") {
      r.refund = "option";
      r.notes.push("For this domestic delay exceeding 6 hours, choose an alternate flight within 6 hours or a full ticket refund. Do not add a refund to travel already accepted.");
    }
    r.legalBasis += ", paras 3.4 and 3.8";
    r.reason = "DGCA does not set a fixed cash award for an ordinary delay. Your expected departure delay determines assistance and, for domestic delays over 6 hours, a refund or alternate-flight option.";
    if (r.care.length || r.refund === "option") r.verdict = "likely_eligible";
    if (uncertainCause && r.care.length) {
      r.verdict = "borderline";
      r.notes.push("The listed care is conditional: para 3.4.4 exempts unavoidable extraordinary circumstances. Ask for evidence of the cause and reasonable measures.");
    }
    if (!timely) r.notes.push("The meals entitlement in para 3.4.1 requires on-time check-in.");
  } else if (event === "cancellation") {
    r.legalBasis += ", paras 3.3, 3.6 and 3.7";
    const accepted = input.travelDecision === "yes";
    r.refund = accepted ? "not_due" : "due";
    r.verdict = "likely_eligible";
    const cap = input.blockMinutes! <= 60 ? 5000 : input.blockMinutes! <= 120 ? 7500 : 10000;
    const qualifies = input.cancellationNoticeHours! < 24 && input.contactProvided === "yes" && !accepted;
    r.formula = qualifies ? `Lower of INR ${cap} and the one-way basic fare plus airline fuel charge.` : "No additional cancellation compensation on these facts.";
    if (qualifies) r.compensationPerPassenger = money(Math.min(cap, input.basicFareInr!));
    r.reason = accepted ? "You accepted alternate travel. This checker does not add the compensation-plus-refund alternative to that travel." : "A cancelled flight gives a refund or acceptable alternate-travel choice. Additional fare-capped compensation depends on notice, contact details and any extraordinary-circumstances exemption.";
    if (input.cancellationNoticeHours! >= 24) r.notes.push("At least 24 hours’ notice was given. This direct-flight check does not award the additional para 3.3.2 cancellation payment.");
    if (input.contactProvided === "no") r.notes.push("Para 3.3.3 excludes financial compensation where adequate booking contact details were not provided; the refund/alternate-travel choice remains.");
    r.care.push("If you reported for the original flight and wait for alternate travel, meals and refreshments appropriate to the wait.");
    if (qualifies && uncertainCause) {
      r.verdict = "borderline";
      r.notes.push("The cash estimate is conditional. Paras 1.4, 1.5 and 3.3.4 exclude compensation for qualifying extraordinary circumstances; the refund choice is separate.");
    }
  } else {
    r.legalBasis += ", paras 3.2.2, 3.6 and 3.7";
    r.formula = "No statutory oversales payment established by these facts.";
    if (["voluntary", "excluded"].includes(input.boardingEligibility!)) {
      r.reason = "Voluntary surrender and refusals for health, safety, security or inadequate documents do not qualify for the involuntary oversales calculation. Check your agreement and ticket conditions.";
      return finish(r);
    }
    const alternate = input.travelDecision === "yes";
    const arranged = input.replacementOffered === "yes";
    const hours = input.alternateDepartureHours ?? 0;
    const factor = alternate && hours <= 24 ? 2 : 4;
    const cap = factor === 2 ? 10000 : 20000;
    const withinOneHour = arranged && hours <= 1;
    if (!withinOneHour) {
      r.compensationPerPassenger = money(Math.min(input.basicFareInr! * factor, cap));
      r.verdict = input.boardingEligibility === "unknown" ? "borderline" : "likely_eligible";
      r.formula = `${factor * 100}% of one-way basic fare plus airline fuel charge, capped at INR ${cap}.`;
    }
    if (!alternate) { r.refund = input.boardingEligibility === "unknown" ? "review" : "due"; r.verdict = input.boardingEligibility === "unknown" ? "borderline" : "likely_eligible"; }
    r.reason = withinOneHour ? "The arranged alternate flight departs within one hour of the original scheduled departure, so para 3.2.2 does not require cash compensation, even if you decline that flight." : "Involuntary oversales compensation uses the arranged alternate flight’s scheduled departure, not its arrival. If no alternate within one hour is arranged, declining alternate travel gives the 400% band plus a full ticket refund, subject to eligibility.";
    if (input.boardingEligibility === "unknown") r.notes.push("Confirm a valid reservation, on-time presentation and involuntary oversales before treating this estimate as payable.");
  }
  if (r.compensationPerPassenger > 0 && input.indianCarrier !== "yes") {
    r.verdict = "borderline";
    r.notes.push("For foreign carriers, para 3.6.1 allows compensation under their home regulations or the CAR. Confirm the applicable basis and avoid duplicate recovery.");
  }
  if (event !== "delay") r.notes.push("Cash or bank transfer is available for compensation; a travel voucher requires your signed agreement. Refunds are shown separately and are not included in the cash total.");
  return finish(r);
}

// 14 CFR 250.5 uses strict <2 / <4 hour upper bounds, unlike the simplified DOT table.
export function usBoardingAmount(fare: number, arrivalDelay: number, domestic: boolean, offered: boolean) {
  if (offered && arrivalDelay <= 1) return { amount: 0, factor: 0, cap: 0 };
  const factor = offered && arrivalDelay < (domestic ? 2 : 4) ? 2 : 4;
  const cap = factor === 2 ? 1075 : 2150;
  return { amount: money(Math.min(fare * factor, cap)), factor, cap };
}
export function evaluateUs(raw: ClaimInput): RegionalComputed {
  const input = claimSchema.parse({ ...raw, jurisdiction: "us_dot" });
  const r = base(input, "us_dot");
  const origin = getAirport(input.originIata)!, dest = getAirport(input.destIata)!;
  const fromUs = US_COUNTRIES.has(origin.country), toUs = US_COUNTRIES.has(dest.country);
  const domestic = fromUs && toUs;
  const event = input.event ?? "delay";
  r.legalBasis = event === "denied_boarding" ? "14 CFR 250.2, 250.5–250.8; caps effective 22 January 2025" : "49 USC 42305; 14 CFR Part 260";
  r.sourceUrl = event === "denied_boarding" ? US_BOARDING_SOURCE : US_REFUND_SOURCE;
  if (!fromUs && (!toUs || event === "denied_boarding")) return outside(r, event === "denied_boarding" ? "DOT involuntary oversales compensation requires departure from a US airport. Flights into the US from abroad need another check." : "DOT flight refund rules assessed here cover flights to, from or within the United States.");
  if (input.date < (event === "denied_boarding" ? "2025-01-22" : "2024-05-16")) return outside(r, "This flight predates the rule version supported here. Historical refund rules or older denied-boarding caps may apply.");
  if (event === "denied_boarding") {
    r.formula = "No statutory oversales payment established by these facts.";
    if (["voluntary", "excluded"].includes(input.boardingEligibility!)) {
      r.reason = "Volunteers and excluded cases do not qualify for this DOT oversales calculation. Exceptions include charter/small-aircraft flights, certain aircraft substitutions and safety-related refusals. Other refund or contract rights may apply.";
      return finish(r);
    }
    const band = usBoardingAmount(input.oneWayFareUsd!, input.delayHours, domestic, input.replacementOffered === "yes");
    r.compensationPerPassenger = band.amount;
    r.formula = band.factor ? `${band.factor * 100}% of the one-way fare including mandatory taxes, capped at USD ${band.cap}.` : "Offered transportation arrives no more than one hour late: no mandatory DOT oversales payment.";
    r.verdict = band.amount > 0 ? input.boardingEligibility === "unknown" ? "borderline" : "likely_eligible" : "likely_ineligible";
    r.reason = "DOT oversales compensation depends on the planned arrival of transportation offered at the time of the arrangement. No offered substitute uses the higher band. This is cash compensation, separate from any unused-ticket refund.";
    if (input.boardingEligibility === "unknown") r.notes.push("Confirm involuntary oversales, a confirmed reservation, on-time check-in and gate arrival, aircraft capacity of at least 30, and no applicable exception.");
    r.notes.push("Payment is due at the airport that day, or within 24 hours if substitute transportation leaves before payment can be prepared. Airlines may offer more than the statutory minimum calculated here.");
    r.notes.push("At exactly 2 hours domestically or 4 hours internationally, the regulation uses the 400% band. Award tickets require the lowest cash fare for the same class on that flight.");
    r.refund = "review";
  } else {
    const threshold = domestic ? 3 : 6;
    const disruption = event === "cancellation" || input.delayHours >= threshold;
    r.formula = "No automatic federal cash compensation for an ordinary delay or cancellation.";
    if (disruption && input.travelDecision !== "yes") {
      r.refund = input.travelDecision === "no" ? "due" : "option";
      r.verdict = input.travelDecision === "no" ? "likely_eligible" : "borderline";
      r.reason = `You have a refund ${input.travelDecision === "no" ? "right" : "choice"} because of ${event === "cancellation" ? "the airline cancellation" : `a scheduled arrival change of at least ${threshold} hours`}. You must decline the changed flight, alternative travel and vouchers/compensation offered instead of a refund. The cause of the disruption does not remove this refund right.`;
      r.notes.push("Refund the unused transportation and applicable unused fees to the original payment method: normally 7 business days for credit cards or 20 calendar days for other payments, once due. A refund is not an extra compensation award.");
      r.notes.push("If an agent sold the ticket, identify the merchant of record on your payment statement and contact that seller for the airfare refund.");
    } else {
      r.reason = input.travelDecision === "yes" ? "Accepting the changed flight, rebooking or a voucher/compensation instead of a refund does not establish a DOT disruption refund here. Ordinary delays do not create automatic federal cash compensation." : `The arrival change is below ${threshold} hours for this ${domestic ? "domestic" : "international"} route. This time-based DOT refund check does not establish a refund.`;
    }
    r.care.push("Meals, hotels and rebooking for controllable disruptions depend on the airline’s published commitments; check the DOT Airline Customer Service Dashboard.");
    r.notes.push("This checks airline cancellations and later scheduled arrivals on direct flights. Earlier departures, airport/connection changes, downgrades, accessibility changes, baggage and tarmac rules require a separate assessment.");
  }
  return finish(r);
}
