import { z } from "zod";
import { getAirport } from "./airports";

export const excuseOptions = [
  { value: "technical", label: "Technical / maintenance issue" },
  { value: "crew", label: "Crew unavailable" },
  { value: "atc", label: "Air traffic control restrictions or strike" },
  { value: "weather", label: "Severe weather" },
  { value: "overbooking", label: "Overbooking" },
  { value: "none", label: "No reason given" },
  { value: "other", label: "Other" },
] as const;
export type Excuse = typeof excuseOptions[number]["value"];

export function todayIso() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export const claimSchema = z.object({
  flightNumber: z.string().trim().toUpperCase().regex(/^[A-Z0-9][A-Z0-9 -]{1,11}$/, "Enter a flight number, such as AF 008."),
  airline: z.string().trim().min(2, "Enter the operating airline.").max(80, "Keep the airline name to 80 characters or fewer.").refine((s) => !/[\r\n\x00-\x1f<>]/.test(s), "Enter the airline name only."),
  carrierLicence: z.enum(["eu", "non_eu", "unknown"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((s) => {
    const date = new Date(`${s}T12:00:00Z`);
    return !isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === s && s >= "2021-01-01" && s <= todayIso();
  }, "Choose a valid past flight date from 2021 onwards."),
  originIata: z.string().toUpperCase().refine((s) => !!getAirport(s), "Choose a departure airport from the suggestions."),
  destIata: z.string().toUpperCase().refine((s) => !!getAirport(s), "Choose an arrival airport from the suggestions."),
  delayHours: z.number({ error: "Enter the arrival delay in hours." }).min(0, "Arrival delay cannot be negative.").max(72, "This checker supports arrival delays up to 72 hours.").multipleOf(0.5, "Use half-hour steps, such as 3 or 3.5 hours."),
  passengers: z.number({ error: "Choose the number of affected passengers." }).int("Choose a whole number of passengers.").min(1, "Include at least one passenger.").max(9, "Check up to nine passengers at a time."),
  excuse: z.enum(["technical", "crew", "atc", "weather", "overbooking", "none", "other"]),
  // Optional keys preserve saved EU checks. Regional facts are required below, never guessed.
  jurisdiction: z.enum(["eu261", "india", "us_dot"]).optional(),
  event: z.enum(["delay", "cancellation", "denied_boarding"]).optional(),
  blockMinutes: z.number().int().min(1).max(1440).optional(),
  departureDelayHours: z.number().min(0).max(168).multipleOf(0.5).optional(),
  basicFareInr: z.number().min(0).max(10000000).refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.00001, "Use no more than two decimal places.").optional(),
  oneWayFareUsd: z.number().positive().max(1000000).refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.00001, "Use no more than two decimal places.").optional(),
  cancellationNoticeHours: z.number().min(0).max(87600).optional(),
  contactProvided: z.enum(["yes", "no"]).optional(),
  travelDecision: z.enum(["yes", "no", "undecided"]).optional(),
  alternateDepartureHours: z.number().min(0).max(168).multipleOf(0.5).optional(),
  checkedInOnTime: z.enum(["yes", "no"]).optional(),
  nightDeparture: z.enum(["yes", "no"]).optional(),
  indianCarrier: z.enum(["yes", "no", "unknown"]).optional(),
  boardingEligibility: z.enum(["eligible", "voluntary", "excluded", "unknown"]).optional(),
  replacementOffered: z.enum(["yes", "no"]).optional(),
}).superRefine((d, ctx) => {
  const required = (key: keyof typeof d, message: string) => { if (d[key] === undefined) ctx.addIssue({ code: "custom", path: [key], message }); };
  if (d.originIata && d.originIata === d.destIata) ctx.addIssue({ code: "custom", path: ["destIata"], message: "Choose two different airports." });
  const jurisdiction = d.jurisdiction ?? "eu261";
  const event = d.event ?? "delay";
  if (jurisdiction === "eu261") {
    if (event !== "delay") ctx.addIssue({ code: "custom", path: ["event"], message: "The EU261 checker currently supports arrival delays only." });
    return;
  }
  if (jurisdiction === "india") {
    required("indianCarrier", "Confirm whether the operating airline is licensed in India.");
    if (event !== "denied_boarding") required("blockMinutes", "Enter the scheduled block time in minutes.");
    if (event === "delay") {
      required("departureDelayHours", "Enter the expected departure delay.");
      required("checkedInOnTime", "Confirm whether you checked in on time.");
      required("nightDeparture", "Confirm whether departure was scheduled between 20:00 and 03:00.");
    }
    if (event !== "delay") required("basicFareInr", "Enter the one-way basic fare plus airline fuel charge in INR.");
    if (event === "cancellation") {
      required("cancellationNoticeHours", "Enter the cancellation notice in hours; use 0 if none.");
      required("contactProvided", "Confirm whether contact details were provided when booking.");
    }
    required("travelDecision", "Choose whether you accepted alternative travel.");
    if (d.travelDecision === "undecided" && event !== "delay") ctx.addIssue({ code: "custom", path: ["travelDecision"], message: "Choose yes or no for this assessment." });
    if (event === "denied_boarding") {
      required("replacementOffered", "Confirm whether the airline arranged an alternate flight.");
      if (d.replacementOffered === "yes") required("alternateDepartureHours", "Enter when the arranged alternate flight was scheduled to depart.");
      if (d.replacementOffered === "no" && d.travelDecision === "yes") ctx.addIssue({ code: "custom", path: ["travelDecision"], message: "No alternate flight was arranged. Choose no or correct the alternate-flight answer." });
    }
  }
  if (jurisdiction === "us_dot" && event !== "denied_boarding") required("travelDecision", "Choose whether you accepted travel or a voucher instead of a refund.");
  if (event === "denied_boarding") {
    required("boardingEligibility", "Choose the circumstances of denied boarding.");
    if (jurisdiction === "us_dot") {
      required("oneWayFareUsd", "Enter the one-way fare including mandatory taxes in USD.");
      required("replacementOffered", "Confirm whether the airline offered substitute transportation.");
    }
  }
});

export type ClaimInput = z.infer<typeof claimSchema>;
