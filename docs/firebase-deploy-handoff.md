# Firebase deployment handoff — 21 November 2026

Deploy a staging preview first, then send the backend URL and Firebase project ID.
The owner requested to perform deployment. No cloud account or billing has been
created here. Do not paste service-account keys, tokens or card details into chat.

## 1. Project and billing

1. Open the [Firebase console](https://console.firebase.google.com/) and create a
   project you own. Keep Analytics off unless you actually need and review it.
2. App Hosting requires Blaze billing. Review charges and set budget alerts before
   deployment; alerts are not a spend cap. Existing apphosting.yaml limits runtime
   instances but does not cap build, logging, database or network charges.
3. Choose a supported App Hosting/Firestore location after reviewing data residency.
   Create a standard Firestore database in production mode. No Auth, Storage,
   client Firebase SDK or passenger-case database is required for this version.

## 2. Database policy

Use Node22 for the release toolchain. From this checkout, using the Firebase CLI
signed in to your own Google account:

```powershell
npx firebase-tools@latest login
npx firebase-tools@latest deploy --only firestore --project YOUR_PROJECT_ID
```

Replace YOUR_PROJECT_ID. Review the CLI's selected project before accepting changes.
firebase.json references client-deny-all rules and the expiresAt TTL field override.
Verify the TTL policy is active in the cloud console; do not infer activation from
the local JSON. Admin SDK bypasses these client rules: runtime IAM must be reviewed.
Grant the App Hosting runtime service identity only the database access needed for
aggregate counters. Do not download a long-lived key for the backend; use its
managed application-default credentials.

## 3. App Hosting

Create an App Hosting backend in the console, connect the reviewed GitHub repository
and release branch, set the application root to `/`, and use the lockfile. Deploy
the latest reviewed commit, not an earlier screenshot's commit. The repository
currently uses `codex/release-candidate`. Inspect the actual supported framework
adapter and build output; a local Next.js build is not proof of adapter support.

Keep automatic rollout controlled until staging acceptance passes. apphosting.yaml
already sets scale-to-zero, at most 2 instances, concurrency20 and AI off.

Add these values to the backend configuration/apphosting.yaml environment mapping
and redeploy. Some metadata is resolved during build, so APP_ORIGIN must be available
to BUILD as well as RUNTIME. Use the generated backend URL first; change to the
final cleared-brand domain only after that domain works with HTTPS.

```text
APP_ORIGIN=https://YOUR_EXACT_BACKEND_OR_CUSTOM_DOMAIN
SKYCLAIM_DEPLOYMENT_MODE=production
SKYCLAIM_RATE_LIMIT_BACKEND=firestore
SKYCLAIM_ENABLE_AI=false
SKYCLAIM_ALLOW_INDEXING=false
SKYCLAIM_CHECKS_ENABLED=true
SKYCLAIM_OPERATOR_NAME=YOUR_CONFIRMED_PUBLIC_OPERATOR
SKYCLAIM_OPERATOR_COUNTRY=YOUR_CONFIRMED_COUNTRY
SKYCLAIM_SUPPORT_EMAIL=kunalshinde1805@gmail.com
```

No trailing slash/path on APP_ORIGIN. The first incomplete rollout may return503
for checks; fill the exact origin then redeploy. Do not enable demo/memory mode on
the public backend to make that error disappear. No OPENAI_API_KEY is needed.

## 4. Before sharing beyond staging

- Run a real EU, India and US check in a clean browser. Confirm amounts, separate
  refund outcomes and the actual letter download; then check mobile/navigation.
- Confirm nonces/security headers, same-origin enforcement, noindex, robots and
  metadata. `/api/health` is liveness only: a successful assessment proves more.
- Confirm shared counter records contain count/expiresAt only, cross-instance
  enforcement, retryable429 and fail-closed503 when database access is unavailable.
- Rehearse rolling back to the last verified release and setting
  SKYCLAIM_CHECKS_ENABLED=false. Set uptime/error/billing alerts and monitor the
  support address. Do not put request bodies, tickets or credentials in logs.
- Inspect provider access-log retention, IAM, region and processing arrangements;
  finish the public privacy notice from what is actually deployed.
- Add edge throttling/fairness before launch traffic. The global120/minute counter
  is not a WAF, bot defense or per-traveler guarantee. Load-test only your staging
  service with a bounded plan, not an arbitrary public target.

Send only the public URL/project ID when done. After naming/legal/operator and live
gates pass, explicitly enable indexing and rebuild. Run `npm run launch:check` with
the production variables loaded; its current blocked result is intentional.

References checked 21 November: [get started](https://firebase.google.com/docs/app-hosting/get-started),
[configuration](https://firebase.google.com/docs/app-hosting/configure),
[framework support](https://firebase.google.com/docs/app-hosting/frameworks-tooling).
See firebase-setup.md for the longer operational runbook.
