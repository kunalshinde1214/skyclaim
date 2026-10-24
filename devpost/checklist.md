---
doc: checklist
status: draft
---
# SkyClaim — continuation checklist

This is a technical continuation record, not a completed learner-led build.
The user's implementation/publication authorization does not establish course completion.

## Slices

- [ ] **1. Finish a readable check-to-letter frontend**
  - Becomes usable: active navigation, readable mobile form, copy and local text download.
  - Why now: improve the existing kernel before public demonstration.
  - PRD ref: `prd.md > Private letter actions`, `Screens and Layout`.
  - Spec ref: `spec.md > Navigation and examples`, `Letter editor and export`.
  - Build: active navigation, 16px mobile fields, 44px controls, UTF-8 letter download,
    corrected official hackathon criteria. Implementation is present.
  - Verify (mechanical): typecheck, 231 tests, build, audit and HTTP smoke passed
    23 October. EU browser result/private details/exact clipboard matching passed.
    Download and revised mobile review remain to verify.
  - Learner check: load an example, inspect the result/letter, and report confusing behavior.
  - Commit: `feat: prepare SkyClaim release candidate and frontend completion`.

## Hands-on Checkpoints

- [ ] Learner tries the checker and provides actual feedback; agent tests are not learner review.

## Final Review

- [ ] Learner reviews working UI and confirms readiness after any fixes.
- [ ] Required-pack chronology and eligibility resolved with the organiser.

## Code Tour and App Map

- [x] Offline reference map prepared from actual source: `app-map.html`.
- [ ] Learner walkthrough or evidence-based recap completed. Map creation alone
  does not establish participation, understanding or a learning reflection.

## Revisions

- 23 October: used the existing build and known user choices. Preserved draft status;
  no fabricated pre-build interviews, approvals or backdated commits.
- 24 October: resumed after interruption. Original reference/design inputs and
  learner profile are ignored by Git; reviewed public release package prepared.
