# Verification record — 21 November 2026

Release candidate, not public-launch approval. Local runtime has changed since
October to Node24.22.1; the configured Firebase/CI runtime remains Node22. The local
checks below are Node24 evidence. Check the new hosted Node22 run before rollout.

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| Next production build | Passed, Next16.4.6; trust/terms routes included |
| Tests | 246 passed across11files |
| npm audit after compatible updates | Zero vulnerabilities; initially8 advisory packages |
| Production HTTP smoke | Passed all checks including three rulebooks, CSP, origin rejection, invalid/oversized bodies and real stalled-upload408 |
| Public-release checker | Correctly returns NOT READY for unresolved evidence and absent live configuration |
| EU exact delay in browser |3.75hours → EUR300/person, EUR600 for two; estimate label and evidence checklist visible |
| History off by default | No recent-history list before opt-in; legacy-storage notice visible |
| History opt-in/reload | Up to5 recent records shown and restored after reload |
| History opt-out | Saved list removed, remembering disabled |
| Mobile India journey | INR6,500/person, INR13,000 total; refund shown separately |
| Mobile trust/checker |390×844; no document horizontal overflow in inspected views |
| Support contact | Owner's email visible on trust/privacy pages |
| Use notice | Loads with the intended limitations heading |
| Console | No unexpected errors/warnings during final browser journeys |

Screenshots: artifacts/launch-review/exact-delay.jpg, trust-desktop.jpg and
trust-mobile.jpg. These are real local production captures. Browser viewport reset
and owned tab closed after inspection. No cloud data, emails, paid services or
Product Hunt submissions were created by these checks.

Independent reviewers used source and historical screenshots due subagent browser
attachment limits. Parent browser verification above was fresh after the fixes.
Impeccable CLI detector failed to load its missing engine/cache and produced no
counts. UI/UX guidance search ran; the existing visual identity was retained.

Not measured: live Firebase IAM/TTL/limits/rollback, public uptime or load envelope,
field Core Web Vitals, comprehensive assistive technology or native print output,
independent penetration test, trademark clearance, independent legal approval and
outside-user success. No numerical “security score” or compliance certification is claimed.
