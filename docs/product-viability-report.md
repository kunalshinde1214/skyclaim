# SkyClaim: viability, obligations and hackathon assessment

Prepared 19 October 2026. This is an evidence-based product assessment, not a
prediction of prize results or professional legal sign-off.

## Recommendation

**Continue as a focused DIY passenger-rights product and a credible hackathon
entry. Commercial success is unvalidated.** The strongest demonstration is one
complete journey: enter facts, understand a qualified result, obtain a usable
letter. The distinctive engineering choice is that legal amounts and letters are
assembled by code while uncertainty remains visible. Extra AI is not required to
make this useful or demonstrate AI-assisted product development.

The category already exists. [AirHelp](https://www.airhelp.com/en/) offers passenger
compensation support; [EU official guidance](https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_en.htm)
and [DOT consumer resources](https://www.transportation.gov/airconsumer) provide
free rights information. SkyClaim should compete on transparent, self-service
guidance across three selected frameworks, not claim that flight claims or online
rights checkers are novel. No user acquisition, recovery rate, revenue or market
share has been measured in this project.

## Who it may help, and the assumptions to test

The initial user is a traveler who has booking records, wants to act personally
and needs help distinguishing cash, refunds and care. Some users will prefer a
service that pursues a claim for them; SkyClaim currently does not do that.

Test these hypotheses before investing in a paid product:

| Hypothesis | Low-cost experiment | Proposed decision signal, not a measured result |
| --- | --- | --- |
| Travelers can complete the checker without legal vocabulary | Observe 8 consenting travelers using synthetic cases | At least 6 complete the core journey unaided in 3 minutes |
| The money/refund distinction improves understanding | Ask users to explain a US refund result in their own words | At least 6 of 8 do not mistake the refund for extra compensation |
| The letter helps a real task | Have 5 volunteers review a draft against their own records, without collecting those records | Record corrections, missing evidence and willingness to send it themselves |
| People return or recommend it | Run a small opt-in pilot after deployment/legal review | Choose a retention/referral target before measuring it; do not invent one afterwards |
| Someone would pay for extra workflow support | Interview potential partners/travelers after useful free checks | Evidence of demand for a specific service, not compliments or hypothetical market size |

## Key obligations and practical responses

| Area | Obligation or risk to resolve | Current response / remaining requirement |
| --- | --- | --- |
| Legal accuracy | Correct scope, version, trigger, exemption and evidence treatment | Deterministic branch tests, official sources and conditional outcomes; independent reviewer and ongoing rule-change ownership still needed |
| Privacy | Identify the operator, lawful processing basis where required, retention, rights requests and processor roles | No account/doc uploads; transient personal letter fields; publish operator contact and reviewed notices before launch |
| Jurisdiction | Different passenger and data laws may apply to different users | Assess one selected regime; obtain qualified advice about actual target markets and service activities |
| Security | Keep secrets server-side, restrict data access and bound untrusted input | Nonce CSP, same-site checks, bounded requests, deny-all client rules, shared live request budget; staging/IAM verification remains |
| Truthful claims | Do not promise entitlement, recovery or all-route coverage | Illustrative demos, explicit scope, separate refunds and evidence-dependent results |
| Data/assets | Have rights to airport data, fonts, integrations and published source | OpenFlights attribution/ODbL terms, font OFL notices; review supplied reference/design ownership before public reuse |
| Operating cost | Avoid unbounded AI or cloud exposure | AI disabled in the Firebase release config; scale/request limits; account budget alerts and live usage review still required |
| Reliability | Detect failure and recover a known version | Health endpoint, CI, smoke tests and rollback runbook; deployed monitoring and on-call contact still needed |
| Accessibility | A legal-information workflow must be usable beyond one device | Keyboard controls, labelled errors, reduced motion, mobile QA; full assistive-technology/contrast and print review still needed |

GDPR assessment should consider the actual service and processing, including its
data-minimisation and transparency principles; merely keeping fields in memory is
not proof of compliance. See the [official regulation](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng).
For India, check the [MeitY DPDP rules and commencement materials](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025)
for the relevant phased effective dates instead of asserting every provision is
already in force. Firebase's processor/service responsibilities are described in
its [privacy documentation](https://firebase.google.com/support/privacy). This
report does not conclude compliance in India, the EU or any US state.

## Why this could fail as a product

1. **People want recovery, not another document.** A letter preparer may solve only
   the first part of the problem. Test outcomes before adding an expensive case team.
2. **The form is harder than the problem feels.** Regional facts require time,
   fares and choices a user may not know. Improve evidence guidance; do not guess.
3. **Low trust or a wrong legal result.** A single confident error can outweigh
   polished design. Prioritise external review and source/version traceability.
4. **Limited evidence.** Entered times and airline causes are not verified records.
   A future licensed data integration must expose provenance and correction paths.
5. **Distribution and repeat use are weak.** Flight disruption is episodic. Validate
   travel-partner distribution before assuming a consumer subscription will work.
6. **Unit costs or support costs exceed value.** Cloud, AI, legal upkeep and user
   support must be observed in a pilot. A free demo does not prove a business model.
7. **Coverage expands too fast.** Connections, other regimes and historical law are
   separate products of legal modelling. A narrow correct tool is easier to trust.

## Hackathon fit and failure risks

The official [Build With AI: Basics overview](https://learn-ai-basics.devpost.com/)
identifies Design, Innovation/Idea and Presentation. The [rules](https://learn-ai-basics.devpost.com/rules)
require a new project in the event period, required skill-pack use, planning files,
a public source repository and a working demo video. The submission cutoff is
26 October 2026, 17:00 EDT / **27 October 2026, 02:30 IST**. These are checked source
facts, not evidence that this entry has been accepted or submitted.

| Risk | Severity | Response before submission |
| --- | --- | --- |
| Required Devpost curriculum use/provenance not demonstrated | Critical | Do not label a custom workflow as the required pack. See hackathon-preparation.md for actual inspected source and unfinished curriculum evidence |
| Public repo or video absent | Critical | Prepare both links, validate unauthenticated access, and finish the entry personally |
| Weak differentiation from existing claim tools | High | Explain the auditable cross-regime DIY experience; show why refunds and compensation differ |
| Video shows pages but no complete outcome | High | Record the real check and letter; keep the recording near 2 minutes |
| Legal overclaim or hidden uncertainty | High | Show a conditional result and the scope boundary, not guaranteed money |
| Demo depends on provider/network access | Medium | Use synthetic examples and deterministic template mode; rehearse a local recording |
| Too much roadmap in the pitch | Medium | Separate available functionality from planned work; spend most video time on the kernel |
| Fabricated authorship or backdated Git history | Critical | Keep honest provenance; never manufacture a commit history or curriculum approvals |

My assessment: the project can be a coherent entry if those critical requirements
are resolved. Its novelty is a product/architecture argument, not a proven unique
invention. There is no defensible numerical probability of winning without the
actual judging decisions and competing entries.

## Future priorities

The public /roadmap page maintains the feature list and dependencies. First:
legal review, verified Firebase rollout, accessibility/print review and evidence
guidance. Later: itinerary/connection support, UK/EEA/Swiss rules, optional Firebase
case accounts, authorised flight evidence, baggage/downgrade modules and reviewed
translations. Document storage, automated sending and legal representation need
separate consent, security and operational decisions; none is quietly implied.

## Release decision

The code can be hardened and demonstrated locally now. A public claim of fully
production-ready operation waits for an actual Firebase staging/live acceptance,
operator/privacy setup, dependency checks, budget/IAM/TTL verification and a legal
review appropriate to its launch scope. docs/firebase-setup.md records those steps.
The user selected a new Firebase project, so cloud credentials and billing setup
remain user-owned actions, not development work that can be truthfully fabricated.
