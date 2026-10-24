import { z } from "zod";
import { claimSchema, type ClaimInput } from "./schema";
import { assessClaim } from "./assess";
import { createLetter } from "./letter-template";
import type { EvaluationResponse } from "./types";

const responseSchema = z.object({
  input: claimSchema,
  computed: z.union([z.object({
    verdict: z.enum(["likely_eligible", "likely_ineligible", "borderline", "outside_scope"]),
    coverage: z.enum(["covered", "unconfirmed", "outside_scope"]),
    reason: z.string().min(1).max(1000),
    distanceKm: z.number().int().nonnegative(),
    tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    baseAmountEur: z.number().int().nonnegative(),
    amountPerPassengerEur: z.number().int().nonnegative(),
    totalEur: z.number().int().nonnegative(),
    reductionApplied: z.boolean(), intraEu: z.boolean(),
    delayHours: z.number().nonnegative(), passengers: z.number().int().min(1).max(9),
    legalBasis: z.string().min(1).max(200),
  }).strict(), z.object({
    jurisdiction: z.enum(["india", "us_dot"]),
    verdict: z.enum(["likely_eligible", "likely_ineligible", "borderline", "outside_scope"]),
    coverage: z.enum(["covered", "outside_scope"]),
    currency: z.enum(["INR", "USD"]), reason: z.string().min(1).max(2000),
    compensationPerPassenger: z.number().nonnegative(), totalCompensation: z.number().nonnegative(),
    refund: z.enum(["due", "option", "not_due", "review"]),
    care: z.array(z.string().max(1500)).max(10), notes: z.array(z.string().max(1500)).max(10),
    formula: z.string().min(1).max(1000), legalBasis: z.string().min(1).max(300),
    sourceUrl: z.string().url(), passengers: z.number().int().min(1).max(9),
  }).strict()]),
  drafted: z.object({
    excuseRebuttal: z.string().min(1).max(1000),
    claimLetter: z.string().max(15000),
    nextSteps: z.array(z.string().min(1).max(1000)).length(3),
    confidenceNote: z.string().min(1).max(1000),
  }).strict(),
  mode: z.enum(["ai", "template"]),
}).strict();

export function validateEvaluation(raw: unknown, submitted: ClaimInput): EvaluationResponse {
  const parsed = responseSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Unexpected evaluation response.");
  const input = claimSchema.parse(submitted);
  if (JSON.stringify(parsed.data.input) !== JSON.stringify(input)) throw new Error("Response belongs to a different flight.");
  const expected = assessClaim(input);
  // Compare every field, including ordered care/notes arrays; reject extra or cross-regime facts.
  const ordered = (value: object) => Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
  if (JSON.stringify(ordered(parsed.data.computed)) !== JSON.stringify(ordered(expected))) throw new Error("Computed facts did not match the flight.");
  if (parsed.data.drafted.claimLetter !== createLetter(input, expected)) throw new Error("Claim letter did not match the computed facts.");
  return parsed.data;
}
