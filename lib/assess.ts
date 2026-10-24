import { evaluateClaim, type Computed } from "./eu261";
import { evaluateIndia, evaluateUs, type RegionalComputed } from "./regional-rules";
import type { ClaimInput } from "./schema";

export type Assessment = Computed | RegionalComputed;
export function assessClaim(input: ClaimInput): Assessment {
  if (input.jurisdiction === "india") return evaluateIndia(input);
  if (input.jurisdiction === "us_dot") return evaluateUs(input);
  return evaluateClaim(input);
}
