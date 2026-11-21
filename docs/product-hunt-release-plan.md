# Product Hunt release plan — 21 November 2026

**Decision: prepare a draft; do not schedule yet.** The old hackathon is historical
context. Product Hunt is a separate launch with different requirements.

## Positioning to validate

Audience: a traveler with a supported disrupted direct flight who wants to prepare
their own airline request. Promise: clear estimates and editable drafts with visible
sources. Differentiator: separate refund/cash/care outcomes and deterministic money,
with optional local personalization and no account. Claim handling/recovery and
verified flight evidence are not offered. Do not market “AI lawyer,” “guaranteed
compensation,” “legally certified,” global coverage or tested success rates.

## Release order and evidence

| Order | Owner | Work | Exit evidence |
| --- | --- | --- | --- |
| 1 | Product owner + trademark reviewer | Clear the name or choose and clear a replacement | Written name decision/search scope; no known unresolved collision |
| 2 | Aviation/service/privacy reviewer + owner | Review marketed branches/letters, service classification and notices | Dated review, corrected exceptions, recorded launch markets/operator |
| 3 | Owner deploys; engineering verifies | Firebase staging, runtime IAM/TTL, exact origin, counters and failures | Real URL, clean-browser journeys, cloud behavior and rollback evidence |
| 4 | Deployment owner | Edge abuse controls, masked logs, support, billing/error alerts | Bounded staging exercise,429/503 behavior and incident/kill-switch rehearsal |
| 5 | Outside testers + owner | Five-person task pilot including mobile and conditional cases | Observations and corrections; no invented user testimonials |
| 6 | Product owner | Cleared-name logo, three actual gallery screens and fresh demo | Assets match the deployed release and reveal no private data |
| 7 | Maker | Complete Product Hunt draft; review final public claims | Accurate URL, pricing, tags, maker credit and support availability |
| 8 | Maker | Pick launch date after all gates pass | Recent launch:check pass and manual final review |

Do not pick a calendar deadline ahead of evidence. A ready repository is not the
same as a ready hosted product. Do not enable indexing to compensate for missing gates.

## Draft listing copy — use only after review

Name: **the cleared product name**. “SkyClaim” remains a development name pending
the collision review. Do not reuse another service's Product Hunt page or social identity.

Tagline: **Understand flight rights. Prepare your own airline request.**

Description: **Check selected EU261, India DGCA and US DOT rights for a disrupted
direct flight. See compensation, refunds and care separately, then personalize
and export a draft for the airline. Code calculates amounts; personal letter details
stay in your browser. Estimates depend on your facts and evidence.**

Maker-comment material should reflect your actual reason for building it. Explain
the supported audience, deterministic calculations and privacy boundary; acknowledge
what is unverified and ask what part of the flow is confusing. Do not invent a
personal travel incident, user count, recovery story or independent certification.

Pricing: free preview if that remains true on launch day. Categories/tags: choose
up to three currently available relevant tags in the form; do not invent tag IDs.

## Assets and submission checks

The [current official guide](https://help.producthunt.com/en/articles/17834537-4-build-your-product-page)
specifies name up to40characters, tagline60 and description500, plus logo, at least
one product gallery image, tags and maker/hunter role. Recommended assets:240×240
logo and1270×760 gallery. Video and clickable demo are optional; this is different
from the earlier Devpost requirements. Recheck the live form before posting.

Recommended gallery sequence: real input → provisional result with separated
rights → usable letter with evidence checklist. A fourth screenshot may show the
trust/data page. Keep text legible. Refresh the October video; its old retention
and interface assumptions no longer represent the current release.

Keep a Product Hunt draft until ready. Scheduling is public publication and is not
performed by this task. Featuring is discretionary. Ask for feedback, not upvotes;
no vote buying, engagement swaps, spam or invented testimonials.

## Launch day and rollback

Have a maker available to answer questions and a deployment owner monitoring
errors/latency/counters/costs. Record support issues without collecting tickets in
public. If a rule is wrong, use SKYCLAIM_CHECKS_ENABLED=false, preserve evidence,
correct/retest and communicate the affected version/scope. Roll back to a verified
release for operational failure. Do not keep a harmful assessment live to preserve
launch momentum. Measure completed checks/draft usefulness with a reviewed,
privacy-conscious method; a pageview or download is not recovered compensation.
