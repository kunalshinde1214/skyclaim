import type { Assessment } from "./assess";
import type { Drafted } from "./llm";
import type { ClaimInput } from "./schema";
export type EvaluationResponse = { input: ClaimInput; computed: Assessment; drafted: Drafted; mode: "ai" | "template" };
