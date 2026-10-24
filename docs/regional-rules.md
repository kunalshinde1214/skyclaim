# India DGCA and US DOT implementation

Implemented at the user's request on 18 October 2026. These requirements supersede
the original EU-only exclusion for these jurisdictions. All rules are deterministic;
the regional paths do not call AI. The API and browser independently calculate the
same assessment and verify currency, cash, refund status, care, notes and letter.

## India

Primary source: [DGCA CAR Section 3, Series M Part IV, Revision 4](https://www.dgca.gov.in/digigov-portal/Upload?attachId=we1PSlOuQhYdHcwKKrm7ew%3D%3D&flag=iframeAttachView),
dated 25 January 2023, effective 15 February 2023. Checked 18 October 2026.
The older MoCA 2019 passenger charter is not used to override this revision.

- Coverage: direct flights within, to or from India. Para 3.6.1 makes foreign-carrier
  compensation conditional on reviewing the carrier's home rules or CAR basis.
- Delays (3.4): meals require on-time check-in and expected departure delay of at
  least 2h for block time up to 150 minutes, 3h for 151–300 minutes, or 4h above 300.
  Domestic delays strictly over 6h offer alternate travel within 6h or a full refund.
  Necessary hotel/transfers are assessed above 24h, or above 6h for a scheduled
  20:00–03:00 departure. Para 3.4.4 makes care conditional for qualifying unavoidable
  extraordinary circumstances. There is no general fixed delay cash award here.
- Cancellation (3.3): alternate travel or refund is kept separate from compensation.
  With notice under 24h, adequate booking contact details and no accepted alternate
  travel, the cash estimate is the lower of basic fare plus fuel and INR5,000
  (block ≤60min), INR7,500 (61–120min), or INR10,000 (>120min). Notice of at least 24h
  does not enter the additional-payment branch for this direct-flight model.
  Extraordinary circumstances can exclude cash; the refund choice remains separate.
- Involuntary oversales (3.2.2): an alternate arranged to depart within 1h excludes
  cash. Otherwise an accepted alternate scheduled within 24h uses 200% of basic fare
  plus fuel, capped at INR10,000; above 24h uses 400%, capped at INR20,000. Declining
  alternate travel uses the latter band plus a separate full refund, after the
  one-hour exception. Volunteers and safety/document refusals are excluded.
- Para 3.7: cash/bank transfer; vouchers require signed agreement. Escalation is
  airline first, then AirSewa (3.9). No complaints are sent by SkyClaim.

## United States

Primary sources, checked 18 October 2026:

- [DOT refunds guidance](https://www.transportation.gov/individuals/aviation-consumer-protection/refunds).
- [DOT refund-rule compliance guidance](https://www.transportation.gov/sites/dot.gov/files/2024-12/Refund%20Final%20Rule%20Small%20Business%20Compliance%20Guidance.pdf),
  including the 16 May 2024 date and payment timing.
- [14 CFR Part 250](https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-250),
  especially §§250.2, .5, .6 and .8.
- [89 FR 84815, 24 October 2024](https://www.govinfo.gov/content/pkg/FR-2024-10-24/pdf/2024-23588.pdf),
  caps effective 22 January 2025.
- [DOT airline customer service dashboard](https://www.transportation.gov/airconsumer/airline-customer-service-dashboard)
  for carrier commitments, rather than invented universal meals/hotel entitlements.

Refund checks cover US and foreign airlines on direct flights to/from/within the US.
A cancellation or changed scheduled arrival at least 3h late domestically or 6h
internationally gives a refund choice. A confirmed refund outcome requires declining
changed/rebooked travel and vouchers/compensation instead of refund. An undecided
passenger gets a conditional choice. Taking the changed flight does not produce a
refund of that flight. No automatic federal delay/cancellation cash award is added.
Refunds normally use 7 business days for credit cards and 20 calendar days for other
payments once due. Agents' merchant-of-record responsibilities are identified.

Oversales compensation requires a US departure, confirmed booking, on-time check-in
and gate arrival, involuntary oversales and no Part 250 exception. US territories
and possessions are domestic. Fare includes mandatory taxes; award tickets require
the lowest cash fare in the same class. Offered substitute arrival within 1h means
zero; over 1h but strictly below 2h domestic / 4h international uses 200%, capped at
USD1,075. At or above those upper boundaries, or with no substitute offered, 400%
is capped at USD2,150. The text of §250.5 governs exact boundaries; the simplified
DOT consumer table's wording is less precise. Payment is normally due at the airport
that day, or within 24h if the substitute leaves before payment can be prepared.

## Shared limits

Refund amounts are not estimated or added to cash totals. Same-fare groups only;
different fares or circumstances need separate checks. Current rule versions are
not applied to older flights. Claims already paid, overlapping laws, connections,
non-time schedule-change triggers, baggage, downgrades, accessibility and tarmac
rules need a separate assessment. Ordinary technical/crew explanations do not
import EU case law into India or US letters. No exchange rates are used.

Sources support the implemented branches; this is not independent legal sign-off.
Personal letter fields remain local and transient. Fare facts in recent checks can
be removed with Clear saved flights. API responses never contain personal fields.
