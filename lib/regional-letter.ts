import { getAirport } from "./airports";
import { resolveLetterDetails, type LetterDetails } from "./letter-details";
import { eventNames, jurisdictionNames, type RegionalComputed } from "./regional-rules";
import type { ClaimInput } from "./schema";

export function createRegionalLetter(input: ClaimInput, facts: RegionalComputed, details?: LetterDetails) {
  if (["outside_scope", "likely_ineligible"].includes(facts.verdict)) return "";
  const p = resolveLetterDetails(details, input.passengers);
  const event = input.event ?? "delay";
  const origin = getAirport(input.originIata)!, dest = getAirport(input.destIata)!;
  const conditional = facts.verdict === "borderline";
  const cash = facts.compensationPerPassenger > 0
    ? `${conditional ? "Subject to the eligibility and exemption questions below, the conditional calculation is" : "I request statutory compensation of"} ${facts.currency} ${facts.compensationPerPassenger} per passenger (${facts.currency} ${facts.totalCompensation} for ${input.passengers} passenger(s)). Calculation: ${facts.formula}` : "No fixed cash compensation is claimed in this letter.";
  const refund = {
    due: "I also request the applicable full refund for unused transportation and unused services. Please provide an itemised calculation and confirm the refund to the original payment method. This refund is separate from any compensation above; no refund amount has been estimated here.",
    option: "Please confirm my refund and alternate-travel options before any election is treated as final. I understand that accepting travel or a voucher instead of a refund may affect that refund right.",
    not_due: "No disruption refund is claimed in this letter on the facts entered.",
    review: "Please confirm any separate unused-ticket refund entitlement and the effect of alternative transportation offered. No refund amount is claimed without that clarification.",
  }[facts.refund];
  const timing = facts.jurisdiction === "india" && event === "delay" ? `The expected departure delay was ${input.departureDelayHours} hours; scheduled block time was ${input.blockMinutes} minutes.`
    : event === "denied_boarding" ? facts.jurisdiction === "india"
      ? `${input.replacementOffered === "yes" ? `The arranged alternate flight was scheduled to depart ${input.alternateDepartureHours} hours after the original departure.` : "No alternate flight was arranged."} ${input.travelDecision === "yes" ? "I accepted alternate travel." : "I did not opt for alternate travel."}`
      : input.replacementOffered === "yes" ? `The offered substitute was planned to arrive ${input.delayHours} hours after the original arrival.` : "No substitute transportation was offered."
    : event === "cancellation" ? `The airline cancelled the flight.${facts.jurisdiction === "india" ? ` Notice was ${input.cancellationNoticeHours} hours before departure; adequate contact details ${input.contactProvided === "yes" ? "were" : "were not"} provided when booking.` : ""}`
    : `The airline's changed schedule showed arrival ${input.delayHours} hours after the original arrival.`;
  const expenses = details?.includeCareExpenses ? "Please also assess reimbursement of documented necessary expenses under the applicable passenger-care rules or your published commitments. Itemised receipts are attached. I do not assume every expense is recoverable.\n\n" : "";
  const escalation = facts.jurisdiction === "india" ? "If unresolved, I may raise a grievance through AirSewa and pursue the applicable redress procedure." : "If unresolved, I may file an aviation consumer complaint with the US Department of Transportation.";
  return `${p.name}\n${p.postalAddress}\n${p.contactDetails}\n${p.date}\n\n${input.airline} — Customer Relations / Refunds\n${p.airlineAddress}\n\nRe: ${conditional ? "Request for evidence and rights assessment" : "Passenger rights request"} · ${jurisdictionNames[facts.jurisdiction]}\nFlight ${input.flightNumber} · ${input.date}\nBooking reference: ${p.bookingReference}\n\nDear Sir or Madam,\n\nI am writing about ${eventNames[event].toLowerCase()} affecting flight ${input.flightNumber}, operated by ${input.airline}, from ${origin.city} (${origin.iata}) to ${dest.city} (${dest.iata}) on ${input.date}. This request concerns ${input.passengers} passenger(s). ${timing}\n\n${cash}\n\n${refund}\n\n${facts.care.length ? `Please assess the following assistance, subject to the stated conditions:\n${facts.care.map((s) => `• ${s}`).join("\n")}\n\n` : ""}${facts.notes.join("\n\n")}\n\nPlease explain the disruption and supply evidence supporting any exemption or exception you rely on. ${conditional ? "This is a conditional request for assessment, not a statement that payment is confirmed. " : ""}Legal basis: ${facts.legalBasis}.\nOfficial source: ${facts.sourceUrl}\n\n${expenses}Please respond in writing within 14 days, as requested, without extending any statutory payment deadline. ${escalation}\n\nYours faithfully,\n${p.name}${p.otherPassengers ? `\n${p.otherPassengers}` : ""}\n\nPrepared with SkyClaim from passenger-provided facts. Information, not legal advice.`;
}
