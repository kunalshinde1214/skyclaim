import { claimSchema, type ClaimInput } from "./schema";

export const HISTORY_KEY = "skyclaim:flights:v1";
export const HISTORY_PREFERENCE_KEY = "skyclaim:remember-flights:v1";
export const HISTORY_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export type SavedFlight = { input: ClaimInput; savedAt: string };
const fingerprint = (input: ClaimInput) => JSON.stringify(input);

export function readHistory(serialised: string | null, now = Date.now()): SavedFlight[] {
  try {
    const parsed: unknown = JSON.parse(serialised || "[]");
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const history: SavedFlight[] = [];
    for (const item of parsed.slice(0, 100)) {
      if (!item || typeof item !== "object" || typeof item.savedAt !== "string" || !Number.isFinite(Date.parse(item.savedAt))) continue;
      const age = now - Date.parse(item.savedAt);
      if (age < 0 || age >= HISTORY_TTL_MS) continue;
      const input = claimSchema.safeParse(item.input);
      if (!input.success || seen.has(fingerprint(input.data))) continue;
      seen.add(fingerprint(input.data));
      // Retain only schema-defined flight facts, including when reading old browser data.
      history.push({ input: input.data, savedAt: new Date(item.savedAt).toISOString() });
      if (history.length === 5) break;
    }
    return history;
  } catch {
    return [];
  }
}

export function recordFlight(history: SavedFlight[], input: ClaimInput, savedAt = new Date().toISOString()): SavedFlight[] {
  const valid = claimSchema.parse(input);
  const timestamp = new Date(savedAt).toISOString();
  return [{ input: valid, savedAt: timestamp }, ...readHistory(JSON.stringify(history), Date.parse(timestamp)).filter((entry) => fingerprint(entry.input) !== fingerprint(valid))].slice(0, 5);
}
