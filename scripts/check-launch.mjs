import fs from "node:fs";
const record = JSON.parse(fs.readFileSync(new URL("../docs/launch-gates.json", import.meta.url), "utf8"));
const failures = [];
const required = ["brand", "legal", "operator", "cloud", "abuse", "quality", "demand", "listing"];
for (const id of required) {
  const gate = record.gates.find(gate => gate.id === id);
  if (!gate || gate.status !== "ready" || !gate.owner?.trim() || !gate.evidence?.trim() ||
    !Number.isFinite(Date.parse(gate.verifiedAt)) || Date.parse(gate.verifiedAt) > Date.now() ||
    Date.now() - Date.parse(gate.verifiedAt) > 30 * 86400000) failures.push(gate?.title || id);
}
let validOrigin = false;
try { const url = new URL(process.env.APP_ORIGIN || ""); validOrigin = url.protocol === "https:" && url.origin === process.env.APP_ORIGIN && !url.hostname.endsWith(".example") && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname); } catch {}
if (!validOrigin) failures.push("Configure the verified public HTTPS APP_ORIGIN");
for (const name of ["SKYCLAIM_OPERATOR_NAME", "SKYCLAIM_OPERATOR_COUNTRY", "SKYCLAIM_SUPPORT_EMAIL"]) if (!process.env[name]?.trim()) failures.push(`Configure ${name}`);
if (process.env.SKYCLAIM_DEPLOYMENT_MODE !== "production" || process.env.SKYCLAIM_RATE_LIMIT_BACKEND !== "firestore") failures.push("Configure production mode and the shared Firestore budget");
if (process.env.SKYCLAIM_ENABLE_AI !== "false") failures.push("Keep optional AI disabled for this release");
if (process.env.SKYCLAIM_CHECKS_ENABLED !== "true") failures.push("Confirm the assessment switch is enabled for the reviewed release");
if (failures.length) {
  console.error("NOT READY for Product Hunt/public launch:");
  for (const item of failures) console.error(`- ${item}`);
  process.exitCode = 1;
} else console.log("Recorded launch gates pass. This checks configuration/evidence records; it does not certify legal compliance or verify the cloud by itself.");
