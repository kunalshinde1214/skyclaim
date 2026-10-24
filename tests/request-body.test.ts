import { afterEach, describe, expect, it, vi } from "vitest";
import { readJsonRequest } from "../lib/read-json-request";
import { POST } from "../app/api/evaluate/route";
import { draftClaim } from "../lib/llm";
import { evaluateClaim } from "../lib/eu261";
import type { ClaimInput } from "../lib/schema";

const flight: ClaimInput = { flightNumber: "AF 008", airline: "Air France", carrierLicence: "eu", date: "2026-10-14", originIata: "CDG", destIata: "JFK", delayHours: 5.5, passengers: 2, excuse: "technical" };
function streamRequest(stream: ReadableStream<Uint8Array>, signal?: AbortSignal) {
  return new Request("http://localhost/api/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: stream, signal, duplex: "half" } as RequestInit & { duplex: string });
}
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("bounded request body", () => {
  it("accepts JSON media types case-insensitively with charset parameters", async () => {
    const request = new Request("http://localhost", { method: "POST", headers: { "Content-Type": "Application/JSON; charset=UTF-8" }, body: "{\"ok\":true}" });
    expect(await readJsonRequest(request)).toEqual({ ok: true });
  });
  it("rejects a lookalike JSON media type", async () => {
    const request = new Request("http://localhost", { method: "POST", headers: { "Content-Type": "application/jsonp" }, body: "{}" });
    await expect(readJsonRequest(request)).rejects.toMatchObject({ status: 415 });
  });
  it("rejects an oversized declared body before reading it", async () => {
    const request = new Request("http://localhost", { method: "POST", headers: { "Content-Type": "application/json", "Content-Length": "9000" }, body: "{}" });
    await expect(readJsonRequest(request)).rejects.toMatchObject({ status: 413 });
  });
  it("cancels the stream when actual bytes exceed the limit", async () => {
    const cancel = vi.fn(); const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new Uint8Array(20)); }, cancel });
    await expect(readJsonRequest(streamRequest(stream), { maxBytes: 10 })).rejects.toMatchObject({ status: 413 });
    expect(cancel).toHaveBeenCalledOnce(); expect(stream.locked).toBe(false);
  });
  it("does not hang on a stalled body and releases the stream", async () => {
    vi.useFakeTimers(); const cancel = vi.fn(); const stream = new ReadableStream<Uint8Array>({ cancel });
    const pending = readJsonRequest(streamRequest(stream), { timeoutMs: 30 });
    const assertion = expect(pending).rejects.toMatchObject({ status: 408 });
    await vi.advanceTimersByTimeAsync(31); await assertion;
    expect(cancel).toHaveBeenCalledOnce(); expect(stream.locked).toBe(false); expect(vi.getTimerCount()).toBe(0);
  });
  it("responds to cancellation while waiting for more bytes", async () => {
    const cancel = vi.fn(); const stream = new ReadableStream<Uint8Array>({ cancel }); const controller = new AbortController();
    const pending = readJsonRequest(streamRequest(stream, controller.signal));
    const assertion = expect(pending).rejects.toMatchObject({ status: 408 });
    controller.abort(); await assertion;
    expect(cancel).toHaveBeenCalledOnce(); expect(stream.locked).toBe(false);
  });
  it("rejects malformed UTF-8 rather than replacing bytes silently", async () => {
    const request = new Request("http://localhost", { method: "POST", headers: { "Content-Type": "application/json" }, body: new Uint8Array([123, 34, 120, 34, 58, 34, 255, 34, 125]) });
    await expect(readJsonRequest(request)).rejects.toMatchObject({ status: 400 });
  });
  it("returns a recoverable API response for a stalled upload", async () => {
    vi.useFakeTimers(); const pending = POST(streamRequest(new ReadableStream<Uint8Array>()));
    await vi.advanceTimersByTimeAsync(5001);
    const response = await pending;
    expect(response.status).toBe(408); expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});

describe("cancelled optional drafting", () => {
  it("does not call the provider for an already-cancelled check", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only"); const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const controller = new AbortController(); controller.abort();
    expect((await draftClaim(flight, evaluateClaim(flight), controller.signal)).mode).toBe("template");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("aborts the provider and skips the retry after cancellation", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only"); const controller = new AbortController();
    const fetcher = vi.fn<typeof fetch>().mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
    }));
    vi.stubGlobal("fetch", fetcher);
    const pending = draftClaim(flight, evaluateClaim(flight), controller.signal);
    controller.abort();
    expect((await pending).mode).toBe("template"); expect(fetcher).toHaveBeenCalledOnce();
  });
});
