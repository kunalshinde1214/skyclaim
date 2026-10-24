# Applying the reusable product workflow to SkyClaim

The user requested this recurring working pattern on 19 October 2026: provide an
idea, then have the agent develop it into a full product with a consistent stack,
candid viability assessment and launch/presentation preparation.

The maintained source is workflows/idea-to-product/SKILL.md, with its reusable
prompt in references/master-prompt.md. It defaults to Next.js, TypeScript, Tailwind
and Firebase while keeping extra services conditional on actual needs.

Applied decisions in this continuation:

| Phase | Concrete result |
| --- | --- |
| Discover | Read the original planning pack and existing app; verify the actual event and Firebase requirements |
| Decide | Retain the direct-flight kernel; distinguish commercial hypotheses from demonstrated behaviour |
| Design | Replace the illustrative hero with interactive jurisdiction examples; add roadmap, hackathon and privacy pages |
| Build | Reuse the existing engines; share example fixtures; add server-side Firebase budget support and deployment configuration |
| Harden | Nonce CSP, local fonts, same-site admission, live-mode fail-closed checks, bounded budget lookups, CI and a health endpoint |
| Explain | Product-viability report, practical obligations, future-feature dependencies and Firebase release runbook |
| Present | Verified event information and a timed shot list; personal narration and entry answers remain with the user |
| Verify | Automated tests, production build/audit, HTTP smoke and browser evidence recorded in qa-strategy.md after execution |

The workflow does not create new projects until the user supplies later ideas.
It does not imply permission to create paid accounts, publish private material,
send claims or submit entries. Public-launch readiness still needs the live checks
and operator/professional decisions in firebase-setup.md. The custom workflow is
not a substitute for the event's required Devpost Learn skills.
