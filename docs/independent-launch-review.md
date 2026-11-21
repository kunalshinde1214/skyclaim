# Outside-view release review — 21 November 2026

**Verdict: do not schedule Product Hunt yet.** The product is a coherent local
research preview, with useful engineering safeguards. It is not a verified public
service, a legally cleared brand, an independently reviewed legal tool or a validated
business. More visual polish cannot close those gaps.

Method: two isolated assessments (A: `/root/outside_design_review`; B:
`/root/technical_review`) plus a primary-source legal/product review and fresh local
checks by the implementation owner. These are AI/code reviews, not outside counsel,
a penetration test or customer research. The reviewers saw changing source, and
the implementation owner reran verification after fixes. The deterministic
Impeccable scanner was attempted but its missing engine/cache permissions prevented
execution. No detector counts or overlay are claimed. Reviewers could not attach
independent browser tabs; their screenshot evidence was an October baseline.

After implementation, fresh local verification passed246tests, TypeScript, Next
production build and the HTTP smoke suite; final audit reports0advisories. Parent
browser verified exact-delay and privacy controls, mobile India result and the
new disclosure pages. See verification-2026-11-21.md for evidence and limits.

## What an outsider is likely to think

“This looks carefully built. I like seeing the calculation and keeping control of
the letter. But why should I trust its legal classification, who is responsible for
an error, and is this the same SkyClaim I found elsewhere? I still need my records,
an airline contact and the confidence to send a claim. Why use this instead of an
official guide, a generic draft, or a service that pursues recovery for me?”

That is a reviewer interpretation, not a quote from a real user. There are no
measured recovery rates, user interviews or willingness-to-pay results here.

## Blocking findings and dispositions

| Finding | Severity | Evidence and decision |
| --- | --- | --- |
| Brand conflict/confusion | **Block launch** | Existing flight-compensation services use SkyClaim/Sky Claim. Search results reference skyclaim.org and skyclaim.ro; direct fetches were partially blocked. This is a credible collision signal, not a finding of infringement or a completed trademark search. Clear a new name or obtain qualified clearance before buying a domain/launching. |
| No independent aviation/legal sign-off | **Block launch** | Tests establish consistency with our model, not completeness of that model. EU booking/check-in, prior third-country recovery, carrier history and local deadlines are incompletely assessed. Qualified review must cover every marketed jurisdiction, not just amounts. |
| Operator identity and privacy accountability | **Block launch** | Owner supplied public support email kunalshinde1805@gmail.com. Legal operator name/country and actual provider retention, transfer and rights-handling arrangements are unconfirmed. A contact email alone is not a complete privacy notice. |
| No verified cloud service | **Block launch** | Firebase config and mocked adapter tests exist. Actual project, IAM, TTL, region, live shared counters, monitoring, edge controls and rollback are not proved. Owner will deploy and supply URL. |
| Known dependency advisories | **Fixed locally** | Fresh audit initially found8 affected packages; compatible updates patched Next to16.4.6 and updated the allowed Firestore chain. Final audit reports0. This is a point-in-time advisory result, not proof of no vulnerabilities. |
| Wrong rounding pressure in delay form | **Fixed locally** | Former half-hour-only input rejected3.75h. Rounding to4h would change the implemented long-haul result fromEUR300 toEUR600. Exact numeric hours now accepted and regression tested. |
| Silent local retention | **Fixed locally** | History was automatic and had no time limit. New saving is opt-in, max5,30days; future/expired records excluded. Old stored records are not silently shown without opt-in. Deletion runs when the site next accesses storage, not while closed. |
| Accidental external AI processing | **Fixed locally** | Previously a key could enable AI unless false was set. Now requires explicit true. AI stays disabled for launch; structural prose validation still cannot prove semantic legal accuracy. |
| Shared budget exhaustion | **Partly fixed; live gate open** | Malformed/invalid bodies no longer consume the Firestore assessment budget. Valid-request flooding and Firestore reads can still affect availability/cost. Global120/minute is not per-client fairness or a WAF. Edge admission and a bounded staging test are mandatory before promotion. |
| Overconfident authority and unclear coverage | **Improved; review still required** | New coverage/trust page, research-preview notice, provisional result labels and pre-letter evidence checklist. These reduce misinterpretation; they do not make a legally incomplete engine safe by declaration alone. |
| Unproven customer value | **Pilot gate** | A letter is an intermediate outcome. No evidence says travelers can finish unaided, choose the right rulebook, understand a conditional result or recover money. Do not advertise saved time/recovery/success statistics. |

## Legal review brief for a qualified professional

The brief is specific so review produces changes rather than a generic disclaimer:

1. Confirm service classification in the operator's jurisdiction and marketed
   countries: automated information versus personalized legal advice/claims
   management; professional, registration, advertising or insurance obligations.
   Free service and “not legal advice” language do not automatically decide this.
2. Review route/event/date coverage, check-in/reservation/fare exceptions, operating
   carrier identity, already accepted travel/vouchers/settlements, overlapping
   recoveries and limitation periods. Decide which unanswered facts must force
   a conditional/out-of-scope result instead of a cash-demand draft.
3. Independently walk EU, DGCA and DOT branch tables and actual generated letters.
   Source checks reconfirmed the referenced DGCA Rev4 and DOT amounts; EU guidance
   remains the source for covered direct-flight delay checks. This is not a claim
   that reform proposals, every historic version or every exception are modeled.
4. Review operator-specific terms, consumer rights, privacy notices and actual
   deployment data flows. Check GDPR applicability when offering to EU users,
   device-storage rules and India DPDP commencement/applicability. MeitY's official
   notifications phase provisions; do not claim that all duties began together or
   that nothing applies until the final phase. Other existing duties may remain.
5. Conduct relevant-market trademark/name clearance, including confusingly similar
   names and common-law/unregistered uses. Exact-string web search and an available
   domain are not clearance. Review original design rights, dependency licensing,
   ODbL/DbCL airport-data attribution and font notices.

Do not add a sweeping liability waiver and call that compliance. Retain mandatory
consumer rights. Keep operator-specific legal approval and evidence references in
the release record; never invent a lawyer's review or certification badge.

## Security assessment

Strong local controls:8KB/5second request-body limits, Zod validation, uncached
responses, restrictive nonce CSP, no server case database, sanitized local history,
no personal letter fields in API/AI, deterministic money/letters, independent
response consistency checks, provider timeouts and fail-closed live budgets.

Limitations: the client and server reuse our legal algorithm, so they can agree on
the same legal mistake. Firestore Admin bypasses client security rules; IAM matters.
Health is liveness only. No independent penetration test, cloud configuration audit,
measured load envelope or incident rehearsal has been observed. No API authentication
is expected for this public no-account checker, but Origin checks do not stop bots.

Before live promotion: test429/503 behavior, shared counters and rate controls;
configure error/uptime/billing alerts and masked logs; restrict runtime privileges;
review dependency updates; document incident triage, assessment kill switch and
rollback. Disclose a private support/security contact, not “file your ticket publicly.”

## Independent UX assessment

Assessment A scored the source-based baseline **25/40** on ten Nielsen heuristics.
This is a subjective design score, not a conversion or accessibility result.

| Heuristic | Baseline /4 | Main observation |
| --- | --- | --- |
| Status visibility | 3 | Loading/cancellation exist; changes can destroy local draft details |
| Real-world match | 2 | Novice must choose the applicable legislation |
| User control | 2 | Useful exports; no undo after changing facts |
| Consistency | 3 | Strong visual identity, inconsistent confidence labels |
| Error prevention | 2 | Input validation cannot verify guessed legal/factual answers |
| Recognition | 2 | Good examples; still requires unfamiliar booking facts |
| Efficiency | 3 | Keyboard/search/export support |
| Minimalist design | 3 | Distinctive paper/navy identity; consequential fine print too small |
| Error recovery | 3 | Request failures preserve entered facts |
| Help/documentation | 2 | Sources exist; operator/review accountability incomplete |

Preserve the visual identity. The biggest improvement is understandable evidence
and accountability, not a generic redesign. New trust/limitations pages and clearer
labels address several findings. Placeholder contrast and supporting text were
improved; full accessibility conformance is not established.

Next usability work, after the pilot: route-first suggestions explaining which
supported law may apply, factual boarding questions instead of one complex
eligibility choice, and protection against losing completed draft details. Keep an
explicit law override and never silently select whichever law pays more.

## Commercial and Product Hunt judgment

This could interest makers who value privacy and transparent rule-based software.
That is not proof that disrupted travelers need or trust another claims tool.
Product Hunt reach is an acquisition experiment, not product-market fit.

Before launch, observe five outside users, at least two on phones, completing a
supported case and explaining their outcome. Target:4/5 finish without live coaching,
all distinguish refund from compensation, no one interprets the estimate as a
guarantee. These are proposed acceptance targets, not research already performed.
Record friction and fix high-impact misunderstandings. Use no real booking/identity
data in published examples. Follow up about whether the letter helped; do not imply
successful recovery from a download event.

## Decision and next sequence

1. Resolve brand; confirm operator name/country and engage the appropriate reviewer.
2. Owner deploys staging using firebase-deploy-handoff.md; keep AI/indexing off.
3. Verify live service, close security/privacy/operational evidence, run the pilot.
4. Refresh approved assets under the cleared name, complete accurate Product Hunt
   draft, and schedule only when all recorded release gates pass.

`npm run launch:check` intentionally fails until docs/launch-gates.json contains
actual ready evidence, owners and recent verification dates plus production config.
It checks records/configuration, not legal truth or the cloud by itself.

Questions skipped: the owner already requested fixes and a release plan. Missing
operator/deployment facts were requested separately; no extra design questionnaire
is needed. No Product Hunt post, legal approval or cloud deployment is claimed.

## Primary references / checked21November

- [Existing Sky Claim terms](https://www.skyclaim.ro/en/terms-and-conditions/) and
  [SkyClaim.org](https://www.skyclaim.org/) — collision signals; full live content
  was not consistently fetchable. Not a registry clearance result.
- [USPTO search guidance](https://www.uspto.gov/trademarks/search).
- [EU passenger-rights guidance](https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_en.htm)
  and [GDPR official text](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng).
- [DGCA CAR Rev4](https://www.dgca.gov.in/digigov-portal/Upload?attachId=we1PSlOuQhYdHcwKKrm7ew%3D%3D&flag=iframeAttachView).
- [DOT refund guidance](https://www.transportation.gov/individuals/aviation-consumer-protection/refunds)
  and [14 CFR250.5](https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-250/section-250.5).
- [MeitY commencement notification](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf)
  and [DPDP Rules2025](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf).
- [Product Hunt launch-page guide](https://help.producthunt.com/en/articles/17834537-4-build-your-product-page)
  and [featuring guidance](https://help.producthunt.com/en/articles/9883485-product-hunt-featuring-guidelines).
