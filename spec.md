# SkyClaim technical specification

Next.js App Router + TypeScript + React + Tailwind CSS + Zod. The browser submits
flight facts to POST /api/evaluate. An 8KiB-bounded JSON reader and Zod schema validate
the request; a pure rules engine produces immutable facts; code assembles the letter.
The response is uncached and contains input, computed, drafted and mode fields.
The upload reader has a five-second deadline and releases its stream on timeout or
cancellation. The client has a fifteen-second deadline and a cancel control; it
validates the response schema, submitted flight, calculated facts and template letter
before rendering. Older or cancelled requests cannot update the current result.

The engine checks EU27 departure or EU27 arrival on an EU-licensed carrier. It uses
unrounded haversine distance, the three-hour arrival threshold, the EUR250/400/600
bands, the intra-EU exception and the EUR300 long-haul band for three to under four
hours. Passenger totals are multiplication in code. Evidence-dependent causes and
unknown inbound licences are conditional. Below-threshold or unsupported routes
have no monetary demand letter.

The optional Responses adapter can reword generic explanatory prose. Two attempts
are limited to 1.1 seconds each, validated by a strict schema and a no-number/no-money
guard. Any failure returns deterministic text. The model never supplies the letter,
its money, flight details or citations. The app works without an API key.

Optional personal letter details live only in React component state. The same pure
letter template interpolates them at explicit locations while retaining evaluated
flight facts. They are cleared with the result when flight inputs change. History
restoration validates and strips fields, deduplicates inputs and retains five checks.

Core modules: lib/eu261.ts, lib/airports.ts, lib/airlines.ts, lib/schema.ts,
lib/letter-template.ts, lib/rebuttal-fallbacks.ts, lib/llm.ts. The UI and responsive/
print styles are in app/. The static airport database is attributed in data/README.md.

Validation includes distance/delay boundaries, coverage, totals, letter facts,
input validation, malformed/oversized API bodies and model failure/money rejection.
Use npm test, npm run typecheck and npm run build. Exact versions are lockfile-pinned.

## Assumptions & Deviations

A server host is required for the API; this is not a pure static export. No database
or server-side flight persistence. Public hosting and live AI calls are unverified.
See docs/qa-strategy.md for executed checks and limits.

Sources: docs/architecture.md, docs/tech-stack.md, docs/prd.md, docs/legal-sources.md.

## India / US expansion

The API dispatches through lib/assess.ts. lib/regional-rules.ts returns a strict
regional response with currency, compensationPerPassenger, totalCompensation,
refund status, care, notes, formula and official source. The response contract
recomputes every field and the full letter. The old EU response remains compatible.
New fields are optional for old EU history but conditionally required for regional
checks; no fare, booking or alternative-travel facts are assumed. The form clears
previous regional facts on changing law or disruption. See docs/regional-rules.md.

## Production configuration

proxy.ts supplies a fresh script nonce and security policy; the root layout uses
connection() for request-time rendering. Fonts are served from public/fonts.
lib/request-budget.ts checks browser origin/Fetch Metadata and consumes an atomic
Firestore budget in live mode, with a 2.5s lookup deadline. Local demo mode uses
a process counter. Firebase Admin is server-only; client database rules deny all
access. apphosting.yaml sets instance/concurrency limits and leaves AI disabled.
The /api/health endpoint is liveness only. CI audits dependencies and runs tests,
build and live HTTP smoke. See docs/firebase-setup.md for configuration and limits.
