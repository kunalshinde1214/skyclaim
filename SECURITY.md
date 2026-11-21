# Security reports

Report suspected security issues privately to **kunalshinde1805@gmail.com**.
Use a subject such as “SkyClaim security report” and include the affected version,
path, impact and a minimal reproduction using synthetic data. Do not include
credentials, identity documents, booking references or other people's data in an
initial message. Do not publish sensitive reports in public GitHub issues.

The owner supplied this contact; response coverage and incident handling still
need operational verification before public launch. No bounty, response-time SLA
or authorization to test third-party systems is offered. Avoid disruptive testing
and use a local copy or an explicitly authorized staging environment.

Deployment owners should disable assessments with SKYCLAIM_CHECKS_ENABLED=false
when an incident makes results unsafe, preserve privacy-safe evidence, investigate,
patch and verify before re-enabling. See docs/firebase-deploy-handoff.md and the
release gates. A passing audit/test suite is not a penetration-test certificate.
