# SkyClaim product requirements

Help a frustrated traveler enter their delayed flight, understand a qualified
EU261 verdict, see the calculation and prepare a letter within one continuous flow.
Plain English, no account, no commission, and no claim sent on their behalf.

The form collects airports, operating airline, flight number, date, arrival delay,
passenger count and airline reason. Unknown inbound carrier licensing triggers a
review condition. The engine alone decides coverage, band and money.

Results must show route distance, delay, tier, any long-haul reduction and passenger
total. Uncertain causes show potential amounts and request evidence. Ineligible or
unsupported checks do not create a compensation demand. Letters include legal
references and explicit personal/contact/address placeholders. Copy has feedback;
print styles isolate the letter. Browser storage retains at most five flight inputs.
Optional personal letter fields stay in page memory and update preview/copy/print;
they never enter storage, the API or AI. Changing flight facts clears the old verdict
and personal details. History labels distinguish delay, passenger count and reason.

Success criteria: the demonstration completes from input to copied letter; boundary
and API tests pass; mobile/desktop layouts work; no-key and provider-failure paths
remain usable; API secrets never enter client code. Comprehensive public-launch
accessibility and legal review remain outstanding.

## Assumptions & Deviations

The original EU engine uses direct-flight EU27 scope from 2021 onward. India and
US scopes are specified below. No accounts, database, payments, live flight APIs,
sending, tracking, translations or PDFs.
The full detailed acceptance table is in docs/prd.md.

Sources: docs/brief.md, docs/prd.md, docs/ux.md.

## User-authorised scope expansion — 18 October 2026

India DGCA and US DOT are now included. This supersedes the jurisdiction-expansion
exclusion above. The selected-law form collects disruption-specific facts and
shows cash, refunds and assistance separately, with INR/USD letters and conditional
outcomes for unresolved exceptions. Direct-flight and privacy limits remain.
Acceptance rules and primary sources are in docs/regional-rules.md.

## Production and presentation acceptance

A visitor can explore three illustrative rulebooks from the landing page, open
a correctly populated checker, filter planned work on /roadmap, review verified
event details on /hackathon and understand data use on /privacy. Server admission
bounds shared live traffic, rejects cross-site browsers and fails closed on a
misconfigured/unavailable Firebase budget. CSP permits only nonce-authorised
inline scripts. The app remains usable with AI disabled. Live Firebase acceptance
and human/professional release gates are recorded separately.
