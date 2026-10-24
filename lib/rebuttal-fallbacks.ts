import type { Excuse } from "./schema";

export const rebuttals: Record<Excuse, { title: string; text: string; citation: string }> = {
  technical: {
    title: "A technical fault is not the whole story.",
    text: "Routine technical faults are generally part of running an airline. Calling a fault unexpected does not, by itself, make it extraordinary. Ask the airline to identify the specific cause and explain the reasonable measures it took. Exceptional events such as a hidden manufacturing defect may need a different assessment.",
    citation: "Wallentin-Hermann, C-549/07; van der Lans, C-257/14",
  },
  crew: {
    title: "Staffing is usually the airline's responsibility.",
    text: "Ordinary crew planning and rostering problems generally fall within the airline's operations. Ask for the specific cause and the steps taken to avoid the delay. A different underlying event may change the assessment, so the airline's evidence matters.",
    citation: "Reg. (EC) No 261/2004, Art. 5(3)",
  },
  atc: {
    title: "Ask for evidence of the restriction.",
    text: "Air traffic control restrictions or an external strike can be extraordinary. Ask the airline to show how the event affected your flight and which reasonable measures it considered. Compensation is uncertain until that evidence is assessed. Assistance rights may still apply.",
    citation: "Reg. (EC) No 261/2004, Art. 5(3) and Art. 9",
  },
  weather: {
    title: "Bad weather needs a specific explanation.",
    text: "Weather incompatible with safe operation can be extraordinary. Ask for evidence linking the conditions to your flight and an explanation of the reasonable measures taken. Do not assume compensation is due before that evidence is reviewed. Keep receipts for necessary care expenses.",
    citation: "Reg. (EC) No 261/2004, Art. 5(3) and Art. 9",
  },
  overbooking: {
    title: "Denied boarding needs its own assessment.",
    text: "Overbooking can give rise to denied-boarding rights with different conditions and reduction rules. This version checks arrival delays only. Ask the airline whether you were involuntarily denied boarding, and retain your boarding pass and rebooking details. This draft requests evidence rather than asserting a denied-boarding entitlement.",
    citation: "Reg. (EC) No 261/2004, Art. 4 and Art. 7",
  },
  none: {
    title: "The airline needs to explain the delay.",
    text: "No explanation is not proof of an extraordinary circumstance. Ask the airline to give the specific cause in writing. If it relies on an extraordinary event, it must substantiate that event and the reasonable measures taken. Your eligibility remains based on the facts you provided.",
    citation: "Reg. (EC) No 261/2004, Art. 5(3)",
  },
  other: {
    title: "Get the reason in writing.",
    text: "Ask the airline for a precise written explanation and supporting evidence. The label used by the airline does not decide the claim. Both the cause of the disruption and the reasonable measures taken need to be assessed before entitlement can be confirmed.",
    citation: "Reg. (EC) No 261/2004, Art. 5(3)",
  },
};
