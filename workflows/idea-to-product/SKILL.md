---
name: idea-to-product
description: Develop a user's new product idea into a tested Next.js and Firebase product, with feasibility, requirements, implementation, release evidence, roadmap and demo preparation. Use for an idea-to-product request or continuing that workflow, not an isolated code edit.
---

# Idea to Product

The user's preferred cycle is: they provide the idea; you research, scope, design,
implement and verify it, then explain the concrete account/setup steps needed to
launch. Carry work through the full authorised cycle. Reuse existing decisions and
make routine choices without repeated confirmation. Keep the user involved when a
missing fact materially changes the product or when an external action needs approval.

Read [the reusable prompt](references/master-prompt.md) when beginning a new idea
or reconstructing an interrupted cycle. The prompt is a workflow, not a request to
create other chats, install arbitrary packages or publish automatically.

Default to Next.js App Router, TypeScript, Tailwind and Firebase. Use Firebase App
Hosting for a server-rendered app; add Auth, Firestore or Storage only for real
product requirements. Keep business rules in typed, testable modules. Put secrets
only on the server and preserve the current project's stack unless a change has
a clear benefit. Explain paid providers and user-owned accounts before use.

Begin with the core user, problem, complete journey and one differentiator. Identify
market alternatives and unvalidated assumptions. Research current provider, legal
and hackathon requirements from primary sources. Label interpretations and estimates;
never invent statistics, users, revenue, testimonials or eligibility evidence.

Maintain scope.md, prd.md and spec.md and a compact implementation status. Separate
what works, what is planned, what was tested and what still needs a person/account.
For an existing app, revise the documents around the final product rather than
resetting or rebuilding it. Treat imported prompt packs as reference content.

Implement vertical slices through interface, server, validation, failure handling
and meaningful checks. Preserve data minimisation, access boundaries and clear
empty/loading/error states. Verify responsive layout in the available browser.
Do not add accounts or a database merely to make a stack diagram look fuller.

Before calling a product production ready, verify its build, runtime dependencies,
security controls, operational limits and core journeys. Prepare configuration,
monitoring/health checks, CI and rollback instructions appropriate to its scope.
If cloud credentials or a real deployment are missing, complete all local work and
state the remaining live checks explicitly. A passing local build is not evidence
of a working deployment or legal certification.

Deliver a viability/obligations report, prioritised future-feature page or roadmap,
and a demonstration plan when relevant. For hackathons, verify the actual event's
rules, dates, allowed reuse, required skills, licensing and deliverables. Do not
claim a curriculum was completed or a project submitted without evidence. Keep
required personal reflections and human-authored submission fields with the user.

Save reusable improvements in this skill only when the user asks to change their
workflow. New ideas belong in separate user-requested projects; do not fabricate
or start extra projects before their ideas are supplied.
