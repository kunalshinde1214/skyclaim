# QA strategy and run record

## Executed checks — 18 October 2026

| Check | Result |
| --- | --- |
| Vitest | PASS: 117 tests in five files |
| TypeScript check | PASS: npm run typecheck; also checked by production builds |
| Production build | PASS: Next.js page, icon and evaluation route generated |
| Live local HTTP check | PASS: HTTP 200 with SkyClaim title and form |
| Browser happy path | PASS: CDG–JFK, 5.5h, two passengers → EUR600 each / EUR1200 total and letter |
| Reduced long-haul band | PASS: browser check showed EUR300 each at 3.5h |
| Weather uncertainty | PASS: conditional stamp and evidence-request letter |
| Below threshold | PASS: 2.5h shows ineligible and no letter |
| Non-EU route regression | PASS: BA SFO–LHR is outside scope and produces no letter |
| Airport keyboard selection | PASS: typed FRA, Arrow Down, Enter selects Frankfurt |
| Empty form validation | PASS: field errors appear and focus moves to an invalid field |
| Local history | PASS: generated entries appeared; clear followed by reload removed them |
| Clipboard control | PASS: browser success message; independent session-clipboard content check was inconclusive |
| Responsive geometry | PASS: checked 1440×1000 and 390×844; document width stayed within viewport |
| Private letter editor | PASS: completed fields updated preview with no remaining personal placeholders; EUR600/passenger and EUR1200 total stayed unchanged |
| Private details lifecycle | PASS: clear restores placeholders; flight edits remove the result; reload and recheck restore no previous personal name |
| Care-expense wording | PASS: appears only after opt-in and disappears after clearing details |
| Personalised copying | PASS: completed-letter copy success feedback; copy uses the preview string |
| Recent-check labels | PASS: 3.5h and 5.5h checks of the same flight are distinguishable and survive reload |
| Editor keyboard / layout | PASS: Enter opens the disclosure; 1440×1100 uses two columns and 390×844 uses one, without horizontal overflow |
| Browser console | No errors or warnings observed during the checked flows |
| Client response contract | PASS: malformed, wrong-flight, changed-money and changed-letter responses are rejected before rendering |
| Cancellation and deadlines | PASS: automated tests cover pre-cancelled, pending, late-response and timed-out requests, including timer/listener cleanup |
| Production HTTP smoke check | PASS: page, complete evaluation, invalid input, unsupported media type, oversized body and a real stalled upload returning HTTP 408 |
| Readable delay errors | PASS: browser shows plain-English messages for an empty delay and a non-half-hour value; changing the delay removes the old verdict |
| Corrected retry | PASS: correcting 3.25h to 5.5h clears the field error, passes response verification and produces the EUR1200 letter with no browser errors |

The suite covers the exact 1,500/3,500km boundaries, fractional distances, the
three-/four-hour boundaries, long intra-EU routes, coverage, unknown carriers,
passenger multiplication, letter amounts, invalid dates/airports, malformed and
oversized API input, caller-supplied money, provider failure, invalid model output
and model money rejection. It includes the pure-engine checks below the half-hour
UI step so strict boundary comparisons remain tested.

Model calls are mocked. No real API credentials or external flight records were
used. The no-key path is the demonstrated local path.

The continuation adds tests for personalisation without changing calculated money,
conditional-letter wording, literal placeholder-like text in user input, opt-in
care text, invalid letter dates, single-passenger signatures, flight-only history
restoration, unknown-field stripping, deduplication and a five-check limit. The API
also rejects accidental personal fields from its validated output and template.
One timestamp round-trip mismatch was found and fixed by normalising timestamps
when recording as well as restoring history.

The reliability pass adds a verified response contract, bounded upload reading and
request cancellation. The live no-key request completed before the browser automation
could select Cancel; cancellation and late-result suppression were exercised with
controlled fetch/stream tests rather than reported as a browser-cancel pass. Normal
completion passed the new contract in the browser. Phone error states fit at 390×844.

## Remaining manual checks

- Native print dialog and physical/PDF page pagination in a normal browser. The
  in-app browser did not expose a verifiable print dialog, so this is not signed
  off. The print stylesheet isolates the complete letter; the UI offers guidance
  when an embedded browser does not open a dialog.
- Assistive-technology testing, full contrast audit and additional mobile devices.
- Provider latency and real model output with a developer-supplied key.
- Independent legal review, carrier data review and deployment abuse controls.

## Assumptions & Deviations

Passing checks cover the executed scope only. This is not public-launch legal,
accessibility or print certification. Browser tests used synthetic demonstration
data. No airline, claims service, recipient or public hosting endpoint was contacted.

## India / US expansion verification — 19 October 2026

- All 208 automated tests pass in six files, including 91 regional rule/API/letter
  tests. Production build and its TypeScript check pass.
- Production HTTP smoke checks pass for EU, India cancellation, DOT refunds and
  the exact two-hour oversales boundary, missing regional facts, media type,
  oversized requests and an actually stalled upload returning HTTP408.
- Desktop browser: India cancellation example shows INR6,500 per passenger,
  INR13,000 total and a separate refund; the letter contains DGCA references.
  US oversales example shows USD1,600 per passenger, USD3,200 total and a Part250
  letter without EU citations. The response-verification contract passes live.
- Mobile 390×844: DOT domestic 3h arrival-change check shows USD0 cash and refund
  due, with no horizontal overflow. Switching to India removes the old result;
  submitting without required regional facts exposes the expected field errors.
- Saved screenshots: artifacts/skyclaim-india-result.png,
  artifacts/skyclaim-us-result.png and artifacts/skyclaim-us-mobile-refund.png.

The preview used synthetic example facts. No claim was submitted, no real model
was called and no public hosting was created. Normal-browser print pagination
and independent legal launch review remain unverified as described above.

## Production and presentation pass — 19 October 2026

231 tests pass in 8 files on Vitest5.0.5. The complete dependency audit reports
zero advisories. The production build and TypeScript phase pass. Live production
HTTP checks verify all companion routes, 404, health, per-response CSP nonces,
same-site admission, all three rulebooks, malformed/oversized requests and a real
stalled upload returning408. Browser testing found and fixed a preview Host/origin
mismatch and proxy body buffering before the upload deadline could start.

Desktop1440×1000: the new India hero example populates the form, returns the
correct result and produces its INR letter without console errors. Roadmap
Coverage filtering shows the three expected features, and the hackathon page
shows 27 October2026,02:30IST. Privacy navigation completes.

Mobile390×844: corrected headline spacing, roadmap Workflow filtering (four
features), hackathon date layout and a full US oversales result/letter pass, with
no horizontal overflow. No browser warning/error logs were returned. Screenshots:
artifacts/skyclaim-landing-redesign.png, skyclaim-mobile-redesign.png,
skyclaim-roadmap.png and skyclaim-hackathon-page.png.

Firebase admission adapter tests use mocked SDK calls; live credentials, provider
IAM/TTL/budget behaviour and a cloud rollout remain unverified. CI is configured
but not executed on GitHub. Independent legal review, full assistive-technology
review and normal-browser print pagination remain release gates. See
production-readiness.md for the precise handoff state.
