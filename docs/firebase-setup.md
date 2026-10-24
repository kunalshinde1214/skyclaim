# Firebase setup and release runbook

Prepared 19 October 2026. The user selected **prepare a new Firebase project**.
No project, billing account or public deployment has been created by this task.

## What is implemented

Next.js remains the application framework. Firebase Admin is used only by the
server for an atomic, shared evaluation budget. The browser has no Firebase SDK,
login or database access. Public client reads/writes are denied by firestore.rules.
Counter documents contain only count and expiresAt; no IP, flight or letter data.
The global ceiling is 120 evaluations/minute; it protects cost across instances,
but is not a per-user fairness system or a substitute for edge abuse protection.

apphosting.yaml caps the backend at two instances and concurrency twenty, uses
scale-to-zero, disables optional AI and requires the Firestore budget in live mode.
Production requests fail closed if the origin/backend configuration is missing,
an emulator is configured, or the budget is unavailable. The budget lookup has a
2.5-second response deadline; an already-started provider transaction may finish
later, but no evaluation/AI work is started after rejection.

## Account setup you complete

1. Create a Firebase project in your Google account. Choose the final project ID
   and primary region; review residency requirements and available App Hosting
   regions before provisioning. Do not paste service-account keys into chat.
2. App Hosting requires the pay-as-you-go Blaze plan. Review billing and configure
   project budget alerts. Alerts are notifications, not hard spend caps.
3. Create a Firestore database in production mode. Deploy firestore.rules and the
   requestBudgets expiresAt TTL configuration using firestore.indexes.json. TTL
   cleanup is asynchronous; it does not enforce the request window.
4. Create an App Hosting backend for the reviewed source repository/root. Use Node22
   and the lockfile. Verify the supported Next.js adapter version in a staging
   rollout rather than assuming a local build proves provider compatibility.
5. Grant the backend runtime identity only the database permissions it needs.
   Admin SDK access is governed by IAM and bypasses Firestore client rules; deny-all
   rules do not protect against an overly privileged server service account.
6. Set APP_ORIGIN to the exact public HTTPS origin, with no trailing slash. Keep
   SKYCLAIM_DEPLOYMENT_MODE=production and SKYCLAIM_RATE_LIMIT_BACKEND=firestore.
   The Firebase runtime supplies its project identity through application-default
   credentials. For local emulator work, keep the mode at demo and use a disposable
   test project; an emulator is rejected in live mode.
7. Leave SKYCLAIM_ENABLE_AI=false for the first release. If enabling it later,
   store OPENAI_API_KEY in Secret Manager, grant backend access, set an explicit
   provider spend limit, and verify provider behaviour. It is not required for demo.

Official setup: [App Hosting](https://firebase.google.com/docs/app-hosting/get-started),
[configuration](https://firebase.google.com/docs/app-hosting/configure),
[framework support](https://firebase.google.com/docs/app-hosting/frameworks-tooling),
[Firestore transactions](https://firebase.google.com/docs/firestore/manage-data/transactions),
[TTL](https://firebase.google.com/docs/firestore/ttl),
[Firebase privacy](https://firebase.google.com/support/privacy).

## Configuration, not credentials

For local evaluation, no Firebase account is needed:

```powershell
npm ci
npm run verify
npm run dev -- --port 3107
```

For a local production-mode build in demo configuration:

```powershell
npm run build
npm run start -- --hostname 127.0.0.1 --port 3107
npm run smoke
```

The start command defaults to the host/port behaviour expected by the deployment
adapter. Explicitly bind to 127.0.0.1 when previewing locally.

## Live acceptance and rollback

- Confirm HTTPS and the exact APP_ORIGIN. /api/health is a liveness endpoint; it
  deliberately does not claim database readiness.
- Run the core EU, India and US checks in the deployed browser and inspect a nonce
  CSP with no script violations. Verify letters contain only the selected law.
- Run the HTTP smoke suite using SMOKE_BASE_URL set to your own staging URL.
  The stalled-upload probe should run only against a deployment you own.
- Verify Firestore counters are shared across instances, transaction/IAM failures
  return503, the configured ceiling returns429 with Retry-After, and counter TTL
  cleanup occurs. Use a separate staging backend for load/limit tests.
- Confirm provider logs exclude request bodies; review infrastructure log retention,
  operator contact details, privacy notices and incident response responsibilities.
- Complete legal, accessibility and normal-browser print review before presenting
  the service as suitable for unsupervised public claims use.
- Release one known commit/revision. If errors rise, disable AI, stop new rollouts
  and roll back to the last verified App Hosting rollout. Rerun health and the three
  core cases. Do not loosen deny-all database rules to repair a failed rollout.

## Costs and limitations

Costs depend on Cloud Run instances/CPU, build minutes, egress, Firestore reads and
writes, Secret Manager and optional AI. There is no substantiated monthly-price
estimate without traffic data. Max instances and a request ceiling reduce exposure
but do not cap every provider charge. Add edge protection and observe usage before
opening broad traffic. The current database is not a case vault; adding one needs
Firebase Auth, ownership rules, user export/deletion and a defined retention policy.
