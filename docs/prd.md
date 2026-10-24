# Product requirements — initial working version

## Goal and journey

A traveler enters flight details, sees a qualified eligibility verdict with the
calculation, reads the explanation, then copies or prints a draft letter. The
passenger reviews all placeholders and sends the letter through the airline's
official claims channel. The app never submits a claim.

## Requirements and acceptance

| ID | Requirement | Acceptance |
| --- | --- | --- |
| FR-1 | Flight number, exact operating airline, date, airports, arrival delay, passenger count and reason | Required-field errors appear; search supports keyboard selection; server rejects invalid values |
| FR-2 | Deterministic EU261 calculation | Distance, thresholds, tiers, reduction and coverage boundary tests pass |
| FR-3 | Clear verdict with calculation | Eligible, ineligible, conditional and outside-scope outcomes show reasons; conditional money is labelled potential |
| FR-4 | Explanation by airline reason | All seven options have cited deterministic wording; optional AI failure retains a working explanation |
| FR-5 | Usable draft letter | Code fills flight facts, per-passenger and total amounts, legal basis, response request and escalation wording. Optional page-only personal fields update preview/copy/print without changing computed facts; care text is opt-in |
| FR-6 | Copy and print | Copy success/error is announced; print styles remove surrounding UI and scrolling limits |
| FR-7 | Browser-local history | Only last five distinct flight inputs are retained; personal letter details never enter storage; restored data is validated and stripped of unknown fields; delay/count/reason distinguish checks |
| FR-8 | Resilience | No key works; provider failures fall back; malformed input returns structured errors; network/timeout/response failures preserve entries; cancellation discards late replies; successful responses must match submitted facts and the rules engine |

## Non-functional requirements

Responsive mobile and desktop layouts; visible keyboard focus; labelled controls;
reduced-motion support; server-only secrets; no server persistence or flight-data
logging. The optional model gets generic reason text and stance, not flight records.
There are two model attempts with a 1.1-second timeout each. No-key requests avoid
the provider entirely. Cold-start latency and production accessibility certification
are not asserted by the local checks.

## Non-goals

Accounts, databases, payments, sending messages, live schedules, jurisdiction
expansion, multilingual UI, PDF generation and claim tracking are excluded.

## Assumptions & Deviations

The initial assessment is EU27-only and direct-flight-only. Dates before 2021,
connections, cancellations, denied boarding and limitation periods require separate
assessment. Overbooking is flagged for review rather than using incomplete denied-
boarding logic. The airport subset now has 218 entries. The exact airline claims address
is a clearly marked placeholder, not a guessed address. See legal-sources.md.

## User-requested jurisdiction expansion

The 18 October 2026 request adds India DGCA and US DOT. Earlier EU-only exclusions
are superseded for these regimes. See regional-rules.md for implemented acceptance
criteria, supported dates, care thresholds, fare caps and refund/compensation
separation. Each region has conditional form fields, an example and its own letter.
