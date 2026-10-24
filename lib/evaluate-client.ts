import { z } from "zod";
import { validateEvaluation } from "./evaluation-contract";
import { claimSchema, type ClaimInput } from "./schema";

export class EvaluationError extends Error {
  constructor(message: string, public kind: "cancelled" | "timeout" | "network" | "response" | "server", public fields: Record<string, string> = {}) {
    super(message);
    this.name = "EvaluationError";
  }
}

const errorSchema = z.object({ error: z.string().min(1).max(300), fields: z.record(z.string(), z.string().max(300)).optional() });
const fieldNames = new Set(["flightNumber", "airline", "carrierLicence", "date", "originIata", "destIata", "delayHours", "passengers", "excuse", "jurisdiction", "event", "blockMinutes", "departureDelayHours", "basicFareInr", "oneWayFareUsd", "cancellationNoticeHours", "contactProvided", "travelDecision", "alternateDepartureHours", "checkedInOnTime", "nightDeparture", "indianCarrier", "boardingEligibility", "replacementOffered"]);

export async function requestEvaluation(input: ClaimInput, options: { signal?: AbortSignal; timeoutMs?: number; fetcher?: typeof fetch } = {}) {
  const controller = new AbortController();
  const cancel = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener("abort", cancel, { once: true });
  if (options.signal?.aborted) cancel();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, options.timeoutMs ?? 15000);
  const signal = controller.signal;
  try {
    signal.throwIfAborted();
    const flight = claimSchema.parse(input);
    const response = await (options.fetcher ?? fetch)("/api/evaluate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flight), signal, cache: "no-store",
    });
    signal.throwIfAborted();
    if (response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      throw new EvaluationError("We could not read the check result. Your details are still here. Please try again.", "response");
    }
    let payload: unknown;
    try { payload = await response.json(); }
    catch { signal.throwIfAborted(); throw new EvaluationError("We could not read the check result. Your details are still here. Please try again.", "response"); }
    signal.throwIfAborted();
    if (!response.ok) {
      const error = errorSchema.safeParse(payload);
      if (error.success) {
        const fields = Object.fromEntries(Object.entries(error.data.fields ?? {}).filter(([name]) => fieldNames.has(name)));
        throw new EvaluationError(error.data.error, "server", fields);
      }
      throw new EvaluationError("The check is unavailable right now. Your details are still here. Please try again.", "server");
    }
    try { return validateEvaluation(payload, flight); }
    catch { throw new EvaluationError("We could not verify the check result. Your details are still here. Reload the page if trying again does not help.", "response"); }
  } catch (error) {
    if (options.signal?.aborted) throw new EvaluationError("Check cancelled. Your flight details are still in the form.", "cancelled");
    if (timedOut) throw new EvaluationError("The check took too long. Your details are still here; please try again.", "timeout");
    if (error instanceof EvaluationError) throw error;
    throw new EvaluationError("We could not reach the checker. Check your connection and try again. Your details are still here.", "network");
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", cancel);
  }
}
