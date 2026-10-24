import { getAirport } from "./airports";
import type { Assessment } from "./assess";
import { isRegional } from "./regional-rules";
import { createRegionalLetter } from "./regional-letter";
import { rebuttals } from "./rebuttal-fallbacks";
import type { ClaimInput } from "./schema";
import { resolveLetterDetails, type LetterDetails } from "./letter-details";

const letterRebuttals = {
  technical: "The delay was attributed to a technical or maintenance issue. Routine technical faults generally form part of an airline's normal operations. Please identify the precise cause and explain any exceptional event and reasonable measures on which you rely.",
  crew: "The delay was attributed to unavailable crew. Ordinary staffing and rostering generally fall within the airline's operations. Please explain the specific cause and the reasonable measures taken to avoid the delay.",
  atc: "I understand that air traffic control restrictions or a strike may constitute extraordinary circumstances. Please provide evidence linking the event to this flight and explain the reasonable measures considered to avoid the delay.",
  weather: "I understand that weather incompatible with safe operation may constitute extraordinary circumstances. Please identify the specific weather event, provide evidence of its impact on this flight, and explain the reasonable measures taken.",
  overbooking: "Overbooking was given as the reason. Please clarify whether this was an arrival delay or involuntary denied boarding and provide the relevant records. I understand that denied boarding requires a separate assessment under Art. 4.",
  none: "No specific reason for the delay has been provided. Please supply the cause in writing, with supporting evidence if you rely on extraordinary circumstances, and explain the reasonable measures taken.",
  other: "Please state the precise reason for the disruption in writing and provide evidence of any extraordinary circumstances and the reasonable measures taken.",
};

export function createLetter(input: ClaimInput, facts: Assessment, details?: LetterDetails) {
  if (isRegional(facts)) return createRegionalLetter(input, facts, details);
  if (["outside_scope", "likely_ineligible"].includes(facts.verdict)) return "";
  const conditional = facts.verdict === "borderline";
  const personal = resolveLetterDetails(details, input.passengers);
  const origin = getAirport(input.originIata)!;
  const dest = getAirport(input.destIata)!;
  const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${input.date}T12:00:00Z`));
  const subject = conditional ? "Request for delay evidence and compensation assessment" : "Claim for flight delay compensation";
  const demand = conditional
    ? `Please provide the specific cause of the disruption, evidence that it affected this flight, and the reasonable measures taken to avoid the delay. ${facts.coverage === "unconfirmed" ? "Please also confirm the operating carrier's EU licensing status. " : ""}If EU261 applies and no exemption is established, the delay compensation assessed here is EUR ${facts.amountPerPassengerEur} per passenger (EUR ${facts.totalEur} for ${input.passengers} passenger(s)). This is a conditional assessment, not a confirmed entitlement.`
    : `I request compensation of EUR ${facts.amountPerPassengerEur} per passenger under ${facts.legalBasis}, read with Sturgeon and Others (Joined Cases C-402/07 and C-432/07). For ${input.passengers} passenger(s), the total requested is EUR ${facts.totalEur}. ${facts.reductionApplied ? "This request reflects the fifty-percent long-haul reduction for an arrival delay of at least three but less than four hours." : ""}`;
  return `${personal.name}\n${personal.postalAddress}\n${personal.contactDetails}\n${personal.date}\n\n${input.airline} — Customer Relations\n${personal.airlineAddress}\n\nRe: ${subject}\nFlight ${input.flightNumber} · ${date}\nBooking reference: ${personal.bookingReference}\n\nDear Sir or Madam,\n\nI am writing about flight ${input.flightNumber}, operated by ${input.airline}, from ${origin.city} (${origin.iata}) to ${dest.city} (${dest.iata}) on ${date}. The final-destination arrival delay was ${input.delayHours} hours. This request concerns ${input.passengers} affected passenger(s); their names and authority to claim should be supplied where required.\n\n${demand.trim()}\n\n${letterRebuttals[input.excuse]}\nLegal reference: ${rebuttals[input.excuse].citation}.\n\n${personal.careParagraph ? `${personal.careParagraph}\n\n` : ""}Please provide a written response within 14 days of this letter. If the matter remains unresolved, I may refer it to the relevant national enforcement body or an applicable approved alternative dispute resolution scheme, subject to its procedure and time limits.\n\nYours faithfully,\n${personal.name}${personal.otherPassengers ? `\n${personal.otherPassengers}` : ""}\n\nPrepared with SkyClaim from passenger-provided facts. Information, not legal advice.`;
}
