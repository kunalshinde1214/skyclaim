---
doc: spec
status: draft
reviewed_on: 2026-10-23
---
# SkyClaim — continuation technical plan

This reviews the existing root specification; it is not a retrospective approval.

## How This Works, In Plain Language

The form sends flight facts to the server. Code validates those facts, applies the
chosen rulebook and constructs the letter. The browser checks that the returned
facts and amounts agree with the same rules before showing them. Optional personal
letter details are added in the browser and never included in the server request.

## The Core Journey Through the System

`app/page.tsx` submit → `lib/evaluate-client.ts` → `/api/evaluate` → `lib/assess.ts`
→ regional/EU rules and letter template → validated response → result and letter.
Implements `prd.md > The Core Journey` and `Qualified assessment`.

## Stack

- [Next.js](https://nextjs.org/docs) App Router 16.4.2, React19, TypeScript, Tailwind4.
- [Zod](https://zod.dev/) for request/response validation.
- [Firebase App Hosting](https://firebase.google.com/docs/app-hosting) and Admin
  Firestore adapter prepared for aggregate request budgets; live setup unverified.
- [Vitest](https://vitest.dev/) 5.0.5 for the existing 231-test suite.

Next.js/Firebase are user-selected. The local demo requires no cloud credentials.
Versions are pinned by package-lock.json; Node22 is the configured runtime.

## Where It Runs and How Someone Tries It

`npm ci`, `npm run build`, `npm run start -- --hostname 127.0.0.1 --port 3107`.
Open http://127.0.0.1:3107, load an example and choose Check my eligibility.
Run `npm run typecheck`, `npm test` and `npm run smoke` with the server running.
AI is off for recording. Firebase live acceptance is in `docs/firebase-setup.md`.
Repository/video URLs are added to `docs/submission-status.md` only once verified.

## Look and Feel

Use the existing CSS tokens and local Inter/Playfair fonts. Mobile fields use
16px text, one-column form layout, 44px+ controls and the same actual legal content.

## Components

### Navigation and examples

`components/site-navigation.tsx` uses the current pathname for aria-current.
`components/landing-hero.tsx` uses `lib/examples.ts` and the real rules engine.
Implements `prd.md > Screens and Layout` and `Companion pages`.

### Flight checker and results

`app/page.tsx`, regional fields/results and API validation implement
`prd.md > Flight facts and validation` and `Qualified assessment`.
The API has bounded JSON size/upload time, origin admission and request budgets.

### Letter editor and export

`components/claim-letter.tsx` calls the same deterministic template for preview,
copy, print and local UTF-8 text download. Blob URLs are revoked after use.
Implements `prd.md > Private letter actions`; it adds no server persistence.

## Data Model

ClaimInput is validated by `lib/schema.ts`. Browser history stores sanitized
flight facts only. Personal details exist in component state. The production
Firestore budget stores count/expiresAt only; no cases or passenger details.

## File Structure

```text
app/                    pages, API routes, styles, recovery views
components/             form branches, results, letter, navigation and narrative
lib/                    rules, templates, validation, history and request controls
data/                   separately licensed airport subset
public/fonts/           local fonts with OFL notices
tests/                  rule boundaries, API contracts, failure controls
docs/                   sources, release reports, cloud setup and submission status
devpost/                dated review drafts and offline app map
```

## External Services and Dependencies

No flight-status provider is called. Optional EU explanatory rewording is server
only, off by default, with deterministic fallback. Live Firebase uses ADC, IAM
and a shared counter; see the setup runbook for billing, ceilings and acceptance.
No real AI/provider calls or live Firebase operation are implied by local tests.

## Important Failure Modes

Invalid facts → field guidance; deadline/provider failure → recoverable check
error without losing form values; inconsistent response → rejected before display;
clipboard/download unavailable → select the letter manually. Firestore failure
in production fails closed. No money comes from AI or a failed fallback.

## Decisions and Open Issues

The user requested autonomous implementation and submission preparation. Personal
learning claims and learner approvals are not established. Existing code predates
pack inspection; organiser interpretation is unresolved. Screenshots/video are
synthetic local examples; public deployment and normal-browser print QA remain separate.
