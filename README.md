# SkyClaim

A passenger-rights checker for EU261, India DGCA and US DOT, with separate cash,
refund and assistance outcomes, and a letter you can copy or print. Built with Next.js App Router,
TypeScript, Tailwind CSS and the supplied **The Verdict** design system.

## Run locally

Requires Node.js 22 (the configured Firebase runtime).

```powershell
npm ci
npm run dev -- --port 3107
```

Open [SkyClaim locally](http://127.0.0.1:3107). Port 3107 avoids another app already
using port 3000 on the development machine. Use **Try an example**, then **Check my
eligibility**, to see Paris CDG → New York JFK, a 5.5-hour arrival delay, and two
passengers. The result is EUR 600 per passenger and EUR 1,200 total. Example inputs
are illustrative and are not verified flight-status records.

```powershell
npm test
npm run typecheck
npm run build
npm run start -- --port 3107
```

With the app running, `npm run smoke` checks the production page and API, including
invalid input, oversized bodies and a deliberately stalled upload. It uses only
synthetic example data. Set `SMOKE_BASE_URL` to use a different local server address.

The app works without API credentials. For optional AI explanation wording, copy
`.env.example` to `.env.local` and set `OPENAI_API_KEY`. Keep it server-side.
Set `SKYCLAIM_ENABLE_AI=true` only if you want the optional wording service.
`OPENAI_MODEL` defaults to `gpt-4.1-mini`. The adapter has two bounded attempts and
falls back to a deterministic template. Live AI calls have not been verified with
a real key. No credentials are needed for the demonstration.

## What works

- Airport search over 218 sourced airports, including more Indian and US airports,
  keyboard selection, and route swapping.
- A law selector, disruption-specific questions and examples for India and the USA.
- DGCA delay meals/hotels and domestic refund choices, cancellation fare caps,
  involuntary oversales calculations and foreign-carrier review conditions.
- DOT cancellation/significant-delay refunds, acceptance/voucher conditions and
  involuntary oversales fare multipliers/caps. Refunds never enter the cash total.
- Server-validated flight facts, carrier coverage, distance tiers, arrival-delay
  thresholds, the reduced long-haul band, and per-passenger totals.
- Eligible, below-threshold, conditional, and outside-scope outcomes.
- Explanation per airline reason and evidence requests for uncertain cases.
- Deterministic letters, clipboard copying, and a letter-only print stylesheet.
- Optional private letter details, a live preview, a completion checklist, and an
  opt-in care-expenses paragraph. Personal details exist only in page memory.
- Last five flight inputs in browser storage, with a clear-history control.
- Editing flight details clears the old verdict and personal letter fields.
- Checks can be cancelled without losing the entered flight details. Interrupted,
  malformed or inconsistent responses produce recoverable errors. The browser
  verifies returned flight facts, compensation and letter against the rules engine.
- Responsive layouts, form errors, loading/error states, focus handling, and reduced motion.

## Boundaries

The app assesses **direct flights under one selected law**. EU261 remains an EU27
arrival-delay check for dates from 2021. India DGCA supports delays, airline
cancellations and involuntary oversales under CAR Rev. 4 from 15 February 2023.
US DOT supports cancellation and later-arrival refund checks from 16 May 2024,
and oversales compensation with the caps effective 22 January 2025. Earlier flights
receive a historical-review outcome, without applying current amounts retroactively.
See [the implemented rules and sources](docs/regional-rules.md).

UK rules, EEA/Swiss extensions, connections, downgrades, baggage, tarmac rules,
other significant schedule changes, limitation periods and prior recovery are not
assessed. Rights may overlap; the app does not add awards from different laws.
Groups must share the same fare and circumstances; run separate checks otherwise.
An outside-scope result does not mean no rights exist.

Inputs are passenger-provided; no live flight or licensing service is called.
Use the exact operating carrier, including the licensed subsidiary. Unlisted
inbound airlines with an unknown licence are flagged for review. The common-airline
list is a convenience and must be reviewed before a public launch.

Letters start with placeholders for identity, contact details, booking reference,
and the airline's **verified** official claims address. The optional **Add your
details** panel fills them in locally. Its values are never sent to the API or AI,
never stored by the app, and are cleared when the page reloads or flight details
change. **Clear personal details** removes them immediately. No addresses are invented.
Conditional letters request evidence rather than assert an established entitlement.
The fourteen-day response request is a requested timeframe, not a universal statutory deadline.

There are no accounts, stored claim records, payments, email sending, PDF generation
or claim tracking. The Firebase live configuration uses a server-only database
for aggregate request counts and expiry timestamps, with no flight/letter data.
No public deployment or hackathon submission has been made.

## Project map

- `app/page.tsx` — single-page interaction and UI.
- `app/globals.css` — design tokens, responsive layout, motion and print styles.
- `app/api/evaluate/route.ts` — bounded, validated, uncached POST endpoint.
- `lib/eu261.ts` — pure coverage and compensation calculations.
- `lib/assess.ts` — dispatch to the selected legal engine.
- `lib/regional-rules.ts` — DGCA/DOT coverage, compensation, refund and care rules.
- `lib/regional-letter.ts` — jurisdiction-specific deterministic requests.
- `components/regional-fields.tsx` — conditional DGCA and DOT questions.
- `lib/letter-template.ts` — code-assembled letters with fixed facts and citations.
- `components/claim-letter.tsx` — private letter fields, live preview and copy/print.
- `lib/letter-details.ts` — pure personalisation and missing-field checks.
- `lib/history.ts` — sanitised, flight-only recent checks.
- `lib/evaluate-client.ts` — cancellable requests, deadlines and recoverable errors.
- `lib/evaluation-contract.ts` — response schema and deterministic fact verification.
- `lib/read-json-request.ts` — bounded, timed and cancellable JSON-body reading.
- `lib/llm.ts` — optional, server-only explanatory prose with validation and fallback.
- `data/airports.json` — curated airport coordinates; licensing in `data/README.md`.
- `tests/` — rules, API boundary and AI-failure tests.
- `docs/` — product, UX, architecture, development status, legal sources and QA.
- `reference/` — original planning pack and prior worklog, preserved as reference material.
- `design/skyclaim-design-system.html` — original design reference.

## Assumptions & Deviations

Implementation lives in the current Codex workspace; the original files in
`D:\Projects\skyclaims` are unchanged. Their embedded role prompts, deadlines,
install commands and publication instructions were treated as planning material,
not automatically executed. Separate BMAD agent sessions and the Devpost skill pack
have not been run. All compensation-bearing letter text is assembled by code;
the optional model can only reword a generic explanatory paragraph. This makes the
"AI never decides money" requirement enforceable at the document boundary.

## Product and release continuation — 19 October 2026

The landing page now has interactive, engine-calculated EU/India/US examples,
self-hosted open-license fonts, a rulebook explanation and practical FAQs.
Companion pages: `/roadmap` (filterable planned features), `/hackathon` (verified
event details and a recording plan) and `/privacy` (data use and limitations).

Production controls include per-response nonce CSP, same-site browser admission,
server-side Firebase request budgets, fail-closed live configuration, provider
lookup deadlines, disabled-by-default AI in the deployment config, a health
endpoint and CI. The patched test runner and runtime dependencies are lockfile-pinned.
The aggregate ceiling protects costs; it is not a per-user fairness system or WAF.

Use `npm run verify` for typecheck, tests and build. Run `npm run smoke` against
an already-started production build. See these prepared reports:

- [Viability, obligations and failure risks](docs/product-viability-report.md)
- [Hackathon preparation and curriculum/provenance gaps](docs/hackathon-preparation.md)
- [New Firebase project setup, live checks and rollback](docs/firebase-setup.md)
- [Applied reusable workflow](docs/workflow-run.md)
- [Idea-to-product skill and prompt](workflows/idea-to-product/SKILL.md)

Original code is licensed under MIT; see LICENSE and THIRD_PARTY_NOTICES.md.
The dated continuation record is in devpost/README.md, with technical status in
docs/frontend-completion.md and remaining entry work in docs/submission-status.md.
These records do not claim a completed learner-led curriculum or entry submission.

The user selected setup for a new Firebase project. A live rollout, IAM/TTL/budget
verification, operator/privacy contact details and independent legal review remain
release gates. Do not equate the local production build with a verified cloud
service. The required Devpost Learn curriculum is distinct from the reusable
workflow; inspecting its source is not evidence of completing all its stages.
