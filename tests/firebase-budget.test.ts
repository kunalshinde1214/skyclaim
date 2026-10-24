import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ settings: vi.fn(), transaction: vi.fn(), initialise: vi.fn(), get: vi.fn(), set: vi.fn(), millis: vi.fn((value: number) => value), collection: vi.fn(), doc: vi.fn() }));
vi.mock("firebase-admin/app", () => ({ getApps: () => [], initializeApp: mocks.initialise, applicationDefault: () => "test-credential" }));
vi.mock("firebase-admin/firestore", () => ({ getFirestore: () => ({ settings: mocks.settings, collection: mocks.collection, runTransaction: mocks.transaction }), Timestamp: { fromMillis: mocks.millis } }));

beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks();
  vi.stubEnv("SKYCLAIM_DEPLOYMENT_MODE", "production");
  vi.stubEnv("SKYCLAIM_RATE_LIMIT_BACKEND", "firestore");
  vi.stubEnv("APP_ORIGIN", "https://skyclaim.example");
  vi.stubEnv("FIRESTORE_EMULATOR_HOST", "");
  mocks.initialise.mockReturnValue({ name: "skyclaim-server" });
  mocks.collection.mockReturnValue({ doc: mocks.doc }); mocks.doc.mockReturnValue("counter-ref");
  mocks.get.mockResolvedValue({ exists: true, get: () => 0 });
  mocks.transaction.mockImplementation(async (callback) => callback({ get: mocks.get, set: mocks.set }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });
const request = () => new Request("https://skyclaim.example/api/evaluate");

describe("Firebase admission adapter", () => {
  it("initialises once when the first requests arrive together", async () => {
    const { admitEvaluation } = await import("../lib/request-budget");
    expect(await Promise.all([admitEvaluation(request()), admitEvaluation(request())])).toEqual([undefined, undefined]);
    expect(mocks.settings).toHaveBeenCalledTimes(1); expect(mocks.initialise).toHaveBeenCalledTimes(1);
  });
  it("uses the transaction's shared count and returns Retry-After at the ceiling", async () => {
    mocks.get.mockResolvedValue({ exists: true, get: () => 120 });
    const { admitEvaluation } = await import("../lib/request-budget");
    const response = await admitEvaluation(request());
    expect(response?.status).toBe(429); expect(Number(response?.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it("stores only an incremented count and a deletion timestamp", async () => {
    mocks.get.mockResolvedValue({ exists: true, get: () => 119 });
    const { admitEvaluation } = await import("../lib/request-budget");
    expect(await admitEvaluation(request())).toBeUndefined();
    const record = mocks.set.mock.calls[0][1];
    expect(Object.keys(record).sort()).toEqual(["count", "expiresAt"]); expect(record.count).toBe(120);
    expect(record.expiresAt).toBeGreaterThan(Date.now());
    expect(mocks.doc.mock.calls[0][0]).toMatch(/^evaluate-\d+$/);
  });
  it("rejects a malformed counter instead of bypassing the budget", async () => {
    mocks.get.mockResolvedValue({ exists: true, get: () => "invalid" });
    const { admitEvaluation } = await import("../lib/request-budget");
    expect((await admitEvaluation(request()))?.status).toBe(503); expect(mocks.set).not.toHaveBeenCalled();
  });
  it("fails closed without exposing provider errors", async () => {
    mocks.transaction.mockRejectedValue(new Error("private-project-and-credential-details"));
    const { admitEvaluation } = await import("../lib/request-budget");
    const response = await admitEvaluation(request());
    expect(response?.status).toBe(503); expect(await response?.text()).not.toContain("private-project");
  });
  it("bounds a stalled provider before any evaluation starts", async () => {
    vi.useFakeTimers(); mocks.transaction.mockImplementation(() => new Promise(() => {}));
    const { admitEvaluation } = await import("../lib/request-budget");
    const pending = admitEvaluation(request());
    await vi.advanceTimersByTimeAsync(2500);
    expect((await pending)?.status).toBe(503); expect(vi.getTimerCount()).toBe(0);
  });
});
