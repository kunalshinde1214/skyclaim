# Technical stack

| Layer | Choice | Purpose |
| --- | --- | --- |
| Framework | Next.js 16, App Router | One UI page and one POST route |
| UI | React 19 + TypeScript | Typed client state and component rendering |
| Styling | Tailwind CSS 4 + CSS | Supplied tokens, responsive layout, motion and print |
| Validation | Zod 4 | Input schema and optional prose validation |
| Tests | Vitest 3 | Rules, letter facts, API failures and model fallback |
| Data tooling | Python standard library | Reproducible public airport subset import |
| AI | Native fetch to Responses API | Optional generic explanation rewording |

There are four direct runtime dependencies: next, react, react-dom and zod.
Exact resolved versions are pinned in package-lock.json. No SDK, database,
authentication, PDF, flight-status or email-sending dependency is installed.

## Assumptions & Deviations

Tailwind uses its v4 CSS theme configuration instead of a v3 JavaScript config.
The importer needs Python only to refresh committed airport data; Python is not
required to run the app. A Node-compatible server is required for the API route.
