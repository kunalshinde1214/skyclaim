---
doc: prd
status: draft
reviewed_on: 2026-10-23
---
# SkyClaim — continuation product requirements

Source: `scope.md > The Core Loop` and the existing root `prd.md`.
This describes implemented behavior plus the authorized frontend completion pass.

## The Core Journey

1. Explore a clearly illustrative EU/India/US case on the landing page.
2. Load an example or enter the actual flight, selected law and relevant facts.
3. Submit; see progress, with a cancellation option that preserves entered facts.
4. Inspect compensation, refund and care separately, including conditions and sources.
5. Add optional personal details locally; inspect, copy, download or print the letter.

## Screens and Layout

The main checker contains the form, result and letter. Companion roadmap, hackathon
and privacy pages are linked from the shared navigation/footer. Navigation identifies
the current page. Mobile controls must remain readable without horizontal scrolling.

## Look and Feel

Continue the existing paper/navy/brass visual direction. Keep illustrative input,
conditional eligibility and planned work visibly labelled. No fabricated testimonials.

## Features and Behavior

### Flight facts and validation

Search actual supported airports by city/code with keyboard selection. Collect
disruption-specific facts without assuming fares or alternative-travel decisions.
Invalid input focuses a relevant field; editing facts removes stale results.

### Qualified assessment

Display code-calculated per-person amounts and totals, source references, review
conditions and next steps. Refund amounts are never guessed or added to cash totals.
Unsupported coverage does not imply the traveler has no other rights.

### Private letter actions

Personal fields stay in page memory. Copy and UTF-8 text download use the same
current letter preview. Downloads include the entered details and are explicitly
user initiated. Reloading/editing flight facts clears the personal fields.

### Companion pages

Roadmap filtering distinguishes planned work. Hackathon information reflects the
official rules, including Potential Impact despite its omission on the overview.
Privacy describes actual data flow and incomplete public-launch operator details.

## States and Boundaries

Empty form, field errors, loading/cancelled check, recoverable request failures,
eligible, ineligible, conditional and outside-scope results. Keep at most five
sanitized flight inputs locally; no personal letter values go to history/API/AI.

## Acceptance for this continuation

- At 390px width, inputs use at least 16px text, touch controls remain usable,
  all three navigation links appear, and no horizontal document overflow occurs.
- A downloaded EU draft retains the displayed amount and synthetic flight facts.
- The three regional examples complete through the actual API and letter.
- Root planning files, factual setup instructions and separate license notices
  accompany the reviewed public source package.

## Product Decisions and Open Questions

User choices: include India and US rules, retain Next.js/Firebase, improve landing
design, document risks/roadmap and prepare the hackathon entry. Specific form/layout
refinements are agent implementation choices under the completion request.
Learner review, independent legal review, cloud rollout and organiser acceptance
of the actual curriculum chronology remain outstanding.
