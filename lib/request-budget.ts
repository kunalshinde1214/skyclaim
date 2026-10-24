// A shared request budget deliberately avoids recording IP addresses or flight facts.
export type BudgetResult = { allowed: boolean; retryAfter: number };
export type BudgetStore = { consume: (bucket: number, limit: number) => Promise<boolean> };
export function createMemoryBudget(): BudgetStore {
  let current = -1, count = 0;
  return { async consume(bucket, limit) { if (bucket !== current) { current = bucket; count = 0; } if (count >= limit) return false; count++; return true; } };
}
const memoryBudget = createMemoryBudget();
export async function consumeBudget(store: BudgetStore, now = Date.now(), limit = 120): Promise<BudgetResult> {
  const bucket = Math.floor(now / 60000);
  return { allowed: await store.consume(bucket, limit), retryAfter: Math.max(1, Math.ceil(((bucket + 1) * 60000 - now) / 1000)) };
}
let firebaseStorePromise: Promise<BudgetStore> | undefined;
function getFirebaseStore(): Promise<BudgetStore> {
  if (!firebaseStorePromise) firebaseStorePromise = initialiseFirebaseStore().catch((error) => { firebaseStorePromise = undefined; throw error; });
  return firebaseStorePromise;
}
async function initialiseFirebaseStore(): Promise<BudgetStore> {
  const { getApps, initializeApp, applicationDefault } = await import("firebase-admin/app");
  const { getFirestore, Timestamp } = await import("firebase-admin/firestore");
  const app = getApps().find((a) => a.name === "skyclaim-server") ?? initializeApp({ credential: applicationDefault() }, "skyclaim-server");
  const db = getFirestore(app);
  db.settings({ preferRest: true });
  return { async consume(bucket, limit) {
    const ref = db.collection("requestBudgets").doc(`evaluate-${bucket}`);
    return db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const count = snapshot.exists ? snapshot.get("count") : 0;
      if (typeof count !== "number" || !Number.isInteger(count) || count < 0) throw new Error("Invalid request budget.");
      if (count >= limit) return false;
      transaction.set(ref, { count: count + 1, expiresAt: Timestamp.fromMillis((bucket + 2) * 60000) });
      return true;
    }, { maxAttempts: 3 });
  } };
}

export async function admitEvaluation(request: Request): Promise<Response | undefined> {
  const common = { "Cache-Control": "no-store" };
  const origin = request.headers.get("origin");
  const configured = process.env.APP_ORIGIN;
  const requestOrigin = new URL(request.url).origin;
  // Next's local server can normalise the URL to localhost even when the browser
  // connected to 127.0.0.1. Host reflects that browser target; live uses APP_ORIGIN.
  let expectedOrigin = configured || requestOrigin;
  if (!configured && process.env.SKYCLAIM_DEPLOYMENT_MODE !== "production") {
    const host = request.headers.get("host");
    if (host && !/[\s/\\?#@]/.test(host)) {
      try { expectedOrigin = new URL(`${new URL(request.url).protocol}//${host}`).origin; } catch { /* Fall back to the request URL. */ }
    }
  }
  if (origin && origin !== expectedOrigin) return Response.json({ error: "Open SkyClaim directly to check a flight." }, { status: 403, headers: common });
  if (request.headers.get("sec-fetch-site") === "cross-site") return Response.json({ error: "Open SkyClaim directly to check a flight." }, { status: 403, headers: common });
  const live = process.env.SKYCLAIM_DEPLOYMENT_MODE === "production";
  let validLiveOrigin = false;
  try { const url = new URL(configured || ""); validLiveOrigin = url.protocol === "https:" && url.origin === configured; } catch { /* Fail closed below. */ }
  if (live && (!validLiveOrigin || process.env.SKYCLAIM_RATE_LIMIT_BACKEND !== "firestore" || process.env.FIRESTORE_EMULATOR_HOST)) {
    return Response.json({ error: "Flight checks are temporarily unavailable. Please try again later." }, { status: 503, headers: { ...common, "Retry-After": "60" } });
  }
  try {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const operation = async () => {
      const store = process.env.SKYCLAIM_RATE_LIMIT_BACKEND === "firestore" ? await getFirebaseStore() : memoryBudget;
      return consumeBudget(store);
    };
    let result: BudgetResult;
    try {
      result = await Promise.race([operation(), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Request budget unavailable.")), 2500); })]);
    } finally { clearTimeout(timer); }
    if (!result.allowed) return Response.json({ error: "SkyClaim is handling many checks. Please wait a minute and try again." }, { status: 429, headers: { ...common, "Retry-After": String(result.retryAfter) } });
  } catch {
    // No fallback to a per-instance counter in live mode, and no supplied data is logged.
    return Response.json({ error: "Flight checks are temporarily unavailable. Please try again later." }, { status: 503, headers: { ...common, "Retry-After": "60" } });
  }
}
