# Release readiness — 19 October 2026

**Status: hardened release candidate, verified locally. A live production service
has not yet been verified.** The user selected preparation for a new Firebase
project; account/billing and the first cloud rollout remain outside this local run.

| Area | Evidence / status |
| --- | --- |
| Existing legal engines and letters | Preserved; EU, DGCA and DOT regression suite passes |
| Automated suite | 231 tests pass across 8 files using patched Vitest5.0.5 |
| Production build / TypeScript | next build and its TypeScript phase pass |
| Dependency advisories | npm audit reports zero for the full installed tree on 19 October |
| HTTP checks | Companion pages, health, 404, fresh CSP nonces, origin rejection, three rulebooks, invalid/oversized requests and stalled-upload408 pass |
| Desktop browser | Interactive India hero example populates the form and completes through INR13,000 letter; no console errors |
| Mobile browser | 390×844 landing, roadmap filtering, hackathon deadline and USD3,200 letter complete without horizontal overflow |
| Fonts | Locally served WOFF2 subsets with OFL notices; no Google font browser dependency |
| Browser policy | Nonce-authorised scripts; APIs use a restrictive static policy and bypass header-cloning proxy to preserve streaming |
| Firebase adapter | Shared transactions, initialisation concurrency, thresholds, expiry-only records and provider failure/timeout tested with mocks |
| Firebase live service | Not configured or exercised; project, IAM, TTL, budget and provider-adapter behaviour require staging acceptance |
| CI | Workflow prepared; GitHub-hosted execution has not been observed |
| Reusable product workflow | Validated and installed in the user's personal Codex skills folder; source retained in workflows/idea-to-product |
| Legal/privacy/operating sign-off | Independent review, operator identity/contact, applicable notices and retention decisions still required before public launch |
| Hackathon entry | Preparation complete; curriculum/provenance, public source/license, video and user-authored entry remain unverified |

Two integration issues were found by real verification and fixed: the local
browser Host versus Next's normalised URL, and proxy buffering of an unfinished API
upload. The smoke suite retains the streamed-upload check; admission tests retain
the local/proxy origin case. Mobile QA also caught and corrected a merged-word
headline caused by a hidden line break.

## Your concrete next steps

1. Follow [firebase-setup.md](firebase-setup.md) to create the new project, review
   Blaze billing, configure the database and runtime identity, and set APP_ORIGIN.
2. Run the documented staging acceptance and rollback rehearsal. Do not replace
   those checks with a local build or mock results.
3. Complete a qualified review of legal rules/letters and public-facing privacy
   obligations for the actual operator and target countries.
4. Resolve the entry requirements in [hackathon-preparation.md](hackathon-preparation.md).
   The custom reusable workflow does not establish required Devpost curriculum use.

Run locally with Node22: `npm ci`, then `npm run dev -- --port 3107`.
The README contains additional copyable commands.
For a release check use npm run verify, then start the build and run npm run smoke.
Do not use production credentials or load probes against a service you do not own.
