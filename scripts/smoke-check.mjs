import assert from "node:assert/strict";
import http from "node:http";
import https from "node:https";

// Run against an already-started build. Synthetic flight facts only; no credentials.
const base = new URL(process.env.SMOKE_BASE_URL || "http://127.0.0.1:3107");
const endpoint = new URL("/api/evaluate", base);
const flight = { flightNumber: "AF 008", airline: "Air France", carrierLicence: "eu", date: "2026-10-14", originIata: "CDG", destIata: "JFK", delayHours: 5.5, passengers: 2, excuse: "technical" };
const post = (body, type = "application/json") => fetch(endpoint, {
  method: "POST", headers: { "Content-Type": type }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
});

const page = await fetch(base, { signal: AbortSignal.timeout(15000) });
assert.equal(page.status, 200);
assert.match(await page.text(), /SkyClaim/);
console.log("PASS: SkyClaim page responds.");

const csp = page.headers.get("content-security-policy") || "";
assert.match(csp, /script-src 'self' 'nonce-[^']+'/);
assert.doesNotMatch(csp, /unsafe-eval/);
assert.match(csp, /frame-ancestors 'none'/);
assert.equal(page.headers.get("x-content-type-options"), "nosniff");
assert.equal(page.headers.get("permissions-policy"), "camera=(), microphone=(), geolocation=(), payment=()");
const secondPage = await fetch(base);
assert.notEqual(secondPage.headers.get("content-security-policy"), csp);
for (const path of ["/roadmap", "/hackathon", "/privacy", "/api/health"]) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
}
assert.equal((await fetch(new URL("/missing-skyclaim-page", base))).status, 404);
const rejectedOrigin = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://elsewhere.example" }, body: JSON.stringify(flight) });
assert.equal(rejectedOrigin.status, 403);
console.log("PASS: Companion pages, health, 404, fresh CSP nonces and cross-origin rejection.");

const response = await post(flight);
assert.equal(response.status, 200);
assert.equal(response.headers.get("Cache-Control"), "no-store");
const result = await response.json();
assert.equal(result.computed.amountPerPassengerEur, 600);
assert.equal(result.computed.totalEur, 1200);
assert.match(result.drafted.claimLetter, /EUR 1200/);
console.log("PASS: Full evaluation and deterministic claim letter.");

const india = { ...flight, jurisdiction: "india", event: "cancellation", airline: "Air India", originIata: "DEL", destIata: "BOM", indianCarrier: "yes", blockMinutes: 135, basicFareInr: 6500, cancellationNoticeHours: 2, contactProvided: "yes", travelDecision: "no" };
const indiaResponse = await post(india);
assert.equal(indiaResponse.status, 200);
const indiaResult = await indiaResponse.json();
assert.equal(indiaResult.computed.currency, "INR");
assert.equal(indiaResult.computed.compensationPerPassenger, 6500);
assert.equal(indiaResult.computed.refund, "due");
assert.match(indiaResult.drafted.claimLetter, /INR 13000/);
assert.doesNotMatch(indiaResult.drafted.claimLetter, /Sturgeon|Art\. 9|EUR /);
console.log("PASS: DGCA cancellation compensation and separate refund.");

const us = { ...flight, jurisdiction: "us_dot", event: "delay", originIata: "SFO", destIata: "JFK", travelDecision: "no", delayHours: 3 };
const usResponse = await post(us);
assert.equal(usResponse.status, 200);
const usResult = await usResponse.json();
assert.equal(usResult.computed.refund, "due");
assert.equal(usResult.computed.compensationPerPassenger, 0);
const boardingResponse = await post({ ...us, event: "denied_boarding", oneWayFareUsd: 400, boardingEligibility: "eligible", replacementOffered: "yes", delayHours: 2 });
assert.equal(boardingResponse.status, 200);
assert.equal((await boardingResponse.json()).computed.compensationPerPassenger, 1600);
console.log("PASS: DOT refund and exact two-hour oversales boundary.");

assert.equal((await post({ ...flight, jurisdiction: "india" })).status, 422);
console.log("PASS: Missing regional facts are rejected.");

assert.equal((await post({ ...flight, delayHours: -1 })).status, 422);
console.log("PASS: Invalid arrival delay is rejected.");
assert.equal((await post(flight, "application/jsonp")).status, 415);
console.log("PASS: Unsupported media type is rejected.");
assert.equal((await post({ extra: "x".repeat(9000) })).status, 413);
console.log("PASS: Oversized body is rejected.");

const status = await new Promise((resolve, reject) => {
  const transport = endpoint.protocol === "https:" ? https : http;
  const request = transport.request(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Transfer-Encoding": "chunked" } }, (incoming) => {
    incoming.resume();
    incoming.on("end", () => { resolve(incoming.statusCode); request.destroy(); });
    incoming.on("error", reject);
  });
  request.setTimeout(9000, () => request.destroy(new Error("Stalled upload did not receive a bounded response.")));
  request.on("error", reject);
  request.write("{\"flightNumber\":"); // Deliberately leave the upload unfinished.
});
assert.equal(status, 408);
console.log("PASS: Stalled upload receives HTTP 408 without hanging.");
