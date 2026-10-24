# Legal rules and deliberate scope choices

Reviewed on 18 October 2026 against these primary sources:

- [Regulation (EC) No 261/2004](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32004R0261): territorial scope, distance bands, care and extraordinary-circumstances provisions.
- [European Commission — Your Europe, air passenger rights](https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_en.htm): current passenger guidance, including the arrival-delay compensation table.
- [Court judgment, van der Lans, C-257/14](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=ecli:ECLI:EU:C:2015:618): routine technical failures and the extraordinary-circumstances analysis.
- [European Commission — air transport internal market](https://transport.ec.europa.eu/transport-modes/air/internal-market_en): operating-licence context and member-state carrier lists.
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses): optional adapter response contract; not a source of legal decisions.

The code applies the supplied three-hour trigger and statutory distance bands.
The intra-EU band takes precedence over the long-haul band. For an otherwise covered
Tier 3 arrival delay of at least three but less than four hours, the displayed
amount is EUR300; exactly four hours enters the EUR600 band. Tests exercise these
boundaries without rounding the distance before selection.

The initial jurisdiction model deliberately contains only the EU27. Coverage
extensions involving Norway, Iceland and Switzerland, UK261, historical transitions,
connections, cancellations and denied boarding are not assessed. An outside-scope
label expressly leaves other rights open. The original SFO–LHR British Airways
example cannot be used as an EU261-only eligible demo in this scope.

Extraordinary circumstances require an evidence-dependent assessment. Weather,
ATC and unspecified causes produce conditional outcomes, not guaranteed awards.
Routine operational reasons remain qualified, subject to contrary evidence.
Overbooking is flagged for a separate denied-boarding assessment instead of
reusing delay logic. No limitation-period calculation is attempted.

## Assumptions & Deviations

This is a scoped implementation review, not professional legal sign-off. The app
does not verify flights, national procedures, documents, prior compensation or
historic operating licences. Carrier-brand shortcuts are curated convenience
data; the passenger must identify the actual licensed operating entity. The
request to respond within fourteen days is correspondence wording, not a claim
that a universal fourteen-day legal deadline applies.

## India / US expansion — 18 October 2026

The user explicitly expanded jurisdiction scope. The original EU-only restrictions
above now describe the EU engine only. See [regional-rules.md](regional-rules.md)
for the verified DGCA CAR Rev. 4, DOT refund law, Part 250, effective dates and
branch-by-branch limits. Regional letters do not reuse EU case law or care citations.
