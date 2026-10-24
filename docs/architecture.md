# Architecture

```text
Browser flight form
  -> POST /api/evaluate
     -> bounded JSON stream (8 KiB, five-second upload deadline)
     -> Zod input validation
     -> pure EU261 engine + sourced airport lookup
     -> code-assembled claim/evidence-request letter
     -> optional bounded OpenAI explanation rewording
        -> schema/word/number validation, or deterministic fallback
  <- uncached {input, computed, drafted, mode}
  -> schema check + submitted-flight / calculated-fact / letter verification
  -> qualified verdict, ledger, explanation, letter
  -> optional personal details in component memory -> code-assembled letter preview
  -> browser-only history, copy or print
```

`lib/eu261.ts` owns all eligibility, compensation, totals and display distances.
It uses the unrounded great-circle distance for tier decisions. EU27 country
membership and a common-carrier mapping determine coverage; an unknown licence on
an inbound route is flagged. The API validates all inputs independently of the UI
and ignores caller-supplied computed values.

`lib/letter-template.ts` interpolates only validated inputs and engine facts.
It does not invent personal details or carrier contact information. Borderline
cases receive an evidence request with conditional amounts; unsupported or
under-threshold cases receive no compensation letter.

`components/claim-letter.tsx` owns optional personal fields in local React state.
It uses the same pure letter template with immutable evaluated flight facts.
Personal values are interpolated at explicit locations rather than using global
placeholder replacement, so text resembling a placeholder cannot rewrite a flight
fact. Copy and print use the personalised preview. There are no network or storage
calls for personal details. Editing flight facts unmounts the result and clears them.

`lib/llm.ts` uses the OpenAI Responses REST API, strict JSON schema, temperature
0.2, `store:false`, and two 1.1-second attempt limits. Only the generic fixed
explanation and verdict stance are sent. The response cannot contain numeric or
monetary wording or additional fields. It can replace the explanation shown in the
UI, never the money-bearing letter. All provider exceptions fall back silently.
Secrets exist only in server environment variables; no client component imports
the adapter at runtime.

The server returns `Cache-Control: no-store`. It has no database, account state or
flight-data logs. Browser history contains at most five input objects and timestamps,
not personal placeholders or generated letters. CSP, public-endpoint abuse controls,
and deployment-specific observability remain production-hardening work.

`lib/history.ts` validates restored flight records, strips unknown fields, normalises
timestamps, removes duplicate inputs and caps history at five entries. Corrupt browser
data degrades to an empty history without affecting the checker.

`lib/read-json-request.ts` enforces the JSON media type, declared and actual byte
limits, strict UTF-8 decoding and an upload deadline. Cancellation or timeout cancels
the stream, releases its lock, clears timers and removes the abort listener.

`lib/evaluate-client.ts` owns a fifteen-second deadline and a caller cancellation
signal. It normalises flight-only input before sending it, validates error responses,
and distinguishes cancellation, timeout, network and response errors. Completed
requests release their timer and cancellation listener. `lib/evaluation-contract.ts`
rejects malformed successful responses, another flight's response, or any mismatch
with the engine's computed facts and unpersonalised letter. Cancelled/older requests
cannot update the UI. The caller signal reaches optional drafting and stops retries
after cancellation.

## Assumptions & Deviations

A server deployment is required for `/api/evaluate`; a pure Next.js static export
cannot retain that route. No public hosting was requested for this development
start. The full letter is deterministic to make the "LLM never decides money"
constraint enforceable. The original pack's full-LLM-letter suggestion is not used.

## Production and companion-page revision

The current architecture extends the EU engine through lib/assess.ts to India
and US modules. Three companion pages provide roadmap, event and privacy content.
Per-request nonce CSP requires dynamic rendering via connection(); fonts are
self-hosted. A same-site admission guard runs before body consumption, then a
shared Firestore transaction enforces the live aggregate request ceiling. Database
records contain only count/expiry. Earlier statements about no database and future
CSP/abuse work above describe the pre-hardening version. Cloud operation remains
unverified until the staging/live runbook is executed.
