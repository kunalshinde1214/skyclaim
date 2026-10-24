"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { getAirport, searchAirports } from "../lib/airports";
import { airlines } from "../lib/airlines";
import { claimSchema, excuseOptions, todayIso, type ClaimInput } from "../lib/schema";
import type { EvaluationResponse } from "../lib/types";
import { ClaimLetter } from "../components/claim-letter";
import { HISTORY_KEY, readHistory, recordFlight, type SavedFlight } from "../lib/history";
import { requestEvaluation, EvaluationError } from "../lib/evaluate-client";
import { isRegional, jurisdictionNames, eventNames } from "../lib/regional-rules";
import { RegionalFields } from "../components/regional-fields";
import { RegionalResult } from "../components/regional-result";
import { RegionalRights } from "../components/regional-rights";
import type { Computed } from "../lib/eu261";
import { SiteHeader, SiteFooter } from "../components/site-chrome";
import { LandingHero } from "../components/landing-hero";
import { ProductStory, ProductQuestions } from "../components/product-story";
import { examples } from "../lib/examples";

const euro = (value: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
const emptyForm: ClaimInput = { flightNumber: "", airline: "", carrierLicence: "unknown", date: "", originIata: "", destIata: "", delayHours: 3, passengers: 1, excuse: "none" };

function Arrow({ className = "" }: { className?: string }) {
  return <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" /></svg>;
}
function Plane({ size = 22 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true"><path d="m21 3-7 18-3.5-7.5L3 10l18-7Z" /><path d="m10.5 13.5 5-5" /></svg>;
}

function Field({ label, id, error, hint, children, className = "" }: { label: string; id: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return <div className={`field ${className}`}><label htmlFor={id}>{label}</label>{children}{error ? <p className="field-error" id={`${id}-help`}>{error}</p> : hint ? <p className="field-hint" id={`${id}-help`}>{hint}</p> : null}</div>;
}

function AirportPicker({ id, value, onChange, error, label }: { id: string; value: string; onChange: (v: string) => void; error?: string; label: string }) {
  const display = (iata: string) => { const airport = getAirport(iata); return airport ? `${airport.city} (${airport.iata})` : ""; };
  const [query, setQuery] = useState(display(value));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const container = useRef<HTMLDivElement>(null);
  const results = searchAirports(value && query === display(value) ? value : query);
  useEffect(() => { if (value) setQuery(display(value)); }, [value]);
  function choose(iata: string) { onChange(iata); setQuery(display(iata)); setOpen(false); setActive(-1); }
  return <Field id={id} label={label} error={error}><div className="airport-picker" ref={container} onBlur={(e) => { if (!container.current?.contains(e.relatedTarget as Node)) setOpen(false); }}>
    <span className="input-icon"><Plane size={17} /></span>
    <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={open ? `${id}-list` : undefined} aria-activedescendant={open && active >= 0 && active < results.length ? `${id}-option-${active}` : undefined} aria-invalid={!!error} aria-describedby={error ? `${id}-help` : undefined} autoComplete="off" placeholder="City or airport code" value={query}
      onFocus={() => { setOpen(true); setActive(-1); }}
      onChange={(e) => { setQuery(e.target.value); onChange(""); setOpen(true); setActive(-1); }}
      onKeyDown={(e) => {
        if (e.key === "Escape") { setOpen(false); return; }
        if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((v) => Math.min(v + 1, results.length - 1)); }
        if (e.key === "ArrowUp") { e.preventDefault(); setOpen(true); setActive((v) => results.length ? (v < 0 ? results.length - 1 : Math.max(0, v - 1)) : -1); }
        if (e.key === "Enter" && open && results.length) { e.preventDefault(); choose(results[Math.max(0, active)].iata); }
      }} />
    {value && <span className="iata-tag">{value}</span>}
    {open && <ul id={`${id}-list`} role="listbox" aria-label={`${label} suggestions`} className="airport-options">{results.length ? results.map((airport, i) => <li key={airport.iata} id={`${id}-option-${i}`} role="option" aria-selected={active === i || value === airport.iata} className={active === i ? "active" : ""} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(airport.iata)}><span><strong>{airport.city}</strong><small>{airport.name}</small></span><b>{airport.iata}</b></li>) : <li className="no-airports">No match in this airport list. Try a nearby major airport only if it was your actual route.</li>}</ul>}
  </div></Field>;
}

function AnimatedAmount({ amount }: { amount: number }) {
  const [shown, setShown] = useState(amount);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(amount); return; }
    let frame = 0;
    const start = performance.now() + 100;
    function tick(now: number) { const p = Math.max(0, Math.min(1, (now - start) / 700)); setShown(Math.round(amount * (1 - (1 - p) ** 3))); if (p < 1) frame = requestAnimationFrame(tick); }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [amount]);
  return <span aria-hidden="true">{euro(shown)}</span>;
}

function Result({ result }: { result: EvaluationResponse }) {
  return isRegional(result.computed) ? <RegionalResult result={result} facts={result.computed} /> : <EuResult result={{ ...result, computed: result.computed }} />;
}
function EuResult({ result }: { result: EvaluationResponse & { computed: Computed } }) {
  const { input, computed: c, drafted } = result;
  const heading = useRef<HTMLHeadingElement>(null);
  const hasLetter = !!drafted.claimLetter;
  const conditional = c.verdict === "borderline";
  const good = c.verdict === "likely_eligible";
  const status = good ? "Eligible" : conditional ? "Borderline" : c.verdict === "outside_scope" ? "Outside scope" : "Ineligible";
  const title = good ? "A delay worth claiming for." : conditional ? "A case that needs a closer look." : c.verdict === "outside_scope" ? "This route needs a different check." : "Below the compensation threshold.";
  useEffect(() => { heading.current?.focus({ preventScroll: true }); document.getElementById("verdict")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }); }, []);
  return <section id="verdict" className="results-section" aria-labelledby="verdict-heading">
    <div className="section-label"><span>02</span> Your verdict <i /></div>
    <div className={`verdict-card ${good ? "positive" : conditional ? "conditional" : "negative"}`}>
      <div className="verdict-top"><span className="eyebrow">Case assessment · {input.flightNumber}</span><span className="mono">{input.originIata} <span aria-hidden="true">→</span> {input.destIata}</span></div>
      <div className="verdict-main"><div><p className="eyebrow">{conditional ? "Potential compensation · if conditions are met" : good ? "Your compensation · per passenger" : "EU261 arrival delay check"}</p><h2 id="verdict-heading" tabIndex={-1} ref={heading}>{title}</h2>
        {hasLetter && <div className="amount" aria-label={`${euro(c.amountPerPassengerEur)} per passenger, ${conditional ? "conditional" : "estimated"}`}><AnimatedAmount amount={c.amountPerPassengerEur} /><span>/ passenger</span></div>}
        <p className="verdict-summary">{c.reason}</p></div><span className="stamp verdict-stamp" aria-label={`Verdict: ${status}`}>{status}</span></div>
      <div className="calculation-grid"><div><span>Great-circle distance</span><strong>{c.distanceKm.toLocaleString("en-GB")} km</strong></div><div><span>Arrival delay</span><strong>{c.delayHours} hours</strong></div><div><span>{c.verdict === "outside_scope" ? "Route band (indicative)" : "Distance band"}</span><strong>Tier {c.tier}{c.intraEu ? " · intra-EU" : ""}</strong></div><div><span>{c.verdict === "outside_scope" ? "Compensation" : `${conditional ? "Potential total" : "Total"} · ${c.passengers} ${c.passengers === 1 ? "passenger" : "passengers"}`}</span><strong>{c.verdict === "outside_scope" ? "Not assessed" : euro(c.totalEur)}</strong></div></div>
      <div className="verdict-foot"><span>{c.verdict === "outside_scope" ? "Reg. (EC) No 261/2004, Art. 3 · coverage check" : c.legalBasis}</span><span>{c.verdict === "outside_scope" ? "Other passenger rights may apply" : c.reductionApplied ? "50% reduction applied · arrival under 4 hours" : "No reduction applied"}</span></div>
    </div>
    <div className="result-columns"><div className="rebuttal-card"><p className="eyebrow">On the airline's explanation</p><h3>{({ technical: "A technical fault is not the whole story.", crew: "Staffing is usually the airline's responsibility.", atc: "Ask for evidence of the restriction.", weather: "Bad weather needs a specific explanation.", overbooking: "Denied boarding needs its own assessment.", none: "The airline needs to explain the delay.", other: "Get the reason in writing." })[input.excuse]}</h3><p>{drafted.excuseRebuttal}</p><a className="source-link" href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32004R0261" target="_blank" rel="noreferrer">Read the regulation <span aria-hidden="true">↗</span></a></div>
      <div className="next-steps"><p className="eyebrow">Your next moves</p><ol>{drafted.nextSteps.map((step, i) => <li key={step}><span>0{i + 1}</span><p>{step}</p></li>)}</ol></div></div>
    {hasLetter && <ClaimLetter result={result} />}
    <p className="confidence-note">{drafted.confidenceNote}</p>
  </section>;
}

export default function Home() {
  const [form, setForm] = useState<ClaimInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkNotice, setCheckNotice] = useState("");
  const [history, setHistory] = useState<SavedFlight[]>([]);
  const [historyNotice, setHistoryNotice] = useState("");
  const [pickerKey, setPickerKey] = useState(0);
  const submitting = useRef(false);
  const requestController = useRef<AbortController | null>(null);
  const knownAirline = airlines.some((airline) => airline.name.toLowerCase() === form.airline.trim().toLowerCase());
  const regime = form.jurisdiction ?? "eu261";
  const event = form.event ?? "delay";
  const minimumDate = regime === "india" ? "2023-02-15" : regime === "us_dot" ? event === "denied_boarding" ? "2025-01-22" : "2024-05-16" : "2021-01-01";
  const showArrivalDelay = regime === "eu261" || (regime === "us_dot" && event !== "cancellation" && !(event === "denied_boarding" && form.replacementOffered === "no"));
  useEffect(() => {
    try { setHistory(readHistory(localStorage.getItem(HISTORY_KEY))); }
    catch { /* Browsing with storage disabled still supports the entire claim flow. */ }
    return () => requestController.current?.abort();
  }, []);
  function update<K extends keyof ClaimInput>(key: K, value: ClaimInput[K]) { setForm((previous) => ({ ...previous, [key]: value, ...(key === "replacementOffered" && value === "no" ? { delayHours: 0 } : {}) })); setErrors((previous) => ({ ...previous, [key]: "" })); setResult(null); setError(""); setCheckNotice(""); setHistoryNotice(""); }
  function changeCheck(jurisdiction: NonNullable<ClaimInput["jurisdiction"]>, event: NonNullable<ClaimInput["event"]> = "delay") {
    // Drop facts belonging to the previous check so hidden values never decide a new case.
    const { flightNumber, airline, carrierLicence, date, originIata, destIata, passengers, excuse } = form;
    setForm({ flightNumber, airline, carrierLicence, date, originIata, destIata, passengers, excuse, delayHours: 3, jurisdiction, event });
    setErrors({}); setResult(null); setError(""); setCheckNotice("");
  }
  function loadExample() { loadFlight(examples[regime]); }
  function loadFlight(input: ClaimInput) { requestController.current?.abort(); requestController.current = null; setCheckNotice(""); setLoading(false); submitting.current = false; setForm(input); setPickerKey((n) => n + 1); setErrors({}); setError(""); setResult(null); document.getElementById("check")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); }
  function clearHistory() { setHistory([]); try { localStorage.removeItem(HISTORY_KEY); setHistoryNotice("Saved flight details cleared from this browser."); } catch { setHistoryNotice("Browser storage is unavailable."); } }
  function cancelCheck() {
    if (!submitting.current || !requestController.current) return;
    requestController.current?.abort();
    requestController.current = null;
    submitting.current = false;
    setLoading(false);
    setError("");
    setCheckNotice("Check cancelled. Your flight details are still in the form.");
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting.current) return;
    const valid = claimSchema.safeParse(form);
    if (!valid.success) { const fields = Object.fromEntries(valid.error.issues.map((issue) => [issue.path.join("."), issue.message])); setErrors(fields); document.getElementById(Object.keys(fields)[0])?.focus(); return; }
    submitting.current = true; setLoading(true); setError(""); setCheckNotice(""); setResult(null);
    const controller = new AbortController(); requestController.current = controller;
    try {
      const payload = await requestEvaluation(valid.data, { signal: controller.signal });
      if (controller.signal.aborted || requestController.current !== controller) return;
      setResult(payload);
      const saved = recordFlight(history, valid.data);
      setHistory(saved);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(saved)); } catch { setHistoryNotice("Your check is ready. Browser storage is unavailable, so this flight was not saved."); }
    } catch (err) {
      if (!controller.signal.aborted && requestController.current === controller) {
        if (err instanceof EvaluationError) {
          setErrors(err.fields);
          setError(err.message);
          document.getElementById(Object.keys(err.fields)[0])?.focus();
        } else setError("The check could not be completed. Your flight details are still here. Please try again.");
      }
    }
    finally { if (requestController.current === controller) { setLoading(false); submitting.current = false; requestController.current = null; } }
  }
  const inputProps = (id: string) => ({ id, "aria-invalid": !!errors[id], "aria-describedby": `${id}-help` });

  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <SiteHeader />
    <main id="main">
      <LandingHero onExample={loadFlight} />
      <section id="how-it-works" className="how-section"><div className="shell how-grid"><div><span className="step-number">01</span><div><h2>Tell us what happened</h2><p>Your route, your delay, the airline’s reason.</p></div></div><div><span className="step-number">02</span><div><h2>See where you stand</h2><p>A clear verdict, with the calculation shown.</p></div></div><div><span className="step-number">03</span><div><h2>Make your case</h2><p>Copy your letter. Send it on your terms.</p></div></div></div></section>
      <ProductStory />
      <section id="check" className="check-section shell" aria-labelledby="check-heading"><div className="section-label"><span>01</span> Start your case <i /></div><div className="check-heading"><div><h2 id="check-heading">Let’s get the facts straight.</h2><p>A few details are all we need. Have your booking handy.</p></div><button type="button" className="demo-button" disabled={loading} onClick={loadExample}>Try an example <Arrow /></button></div>
        <div className="check-layout"><form className="case-form" onSubmit={submit} noValidate aria-busy={loading}><div className="case-form-head"><span className="eyebrow"><Plane size={16} /> Flight details</span><span className="mono">{jurisdictionNames[regime]} · RIGHTS CHECK</span></div><fieldset disabled={loading}><legend className="sr-only">Flight details</legend><div className="form-body"><div className="form-grid regime-fields">
          <Field id="jurisdiction" label="Which passenger rights should we check?" hint="Choose one law. Routes can overlap; amounts are not added together."><select id="jurisdiction" value={regime} onChange={(e) => changeCheck(e.target.value as NonNullable<ClaimInput["jurisdiction"]>)}><option value="eu261">European Union · EU261</option><option value="india">India · DGCA</option><option value="us_dot">United States · DOT</option></select></Field>
          <Field id="event" label="What happened?" error={errors.event} hint={regime === "eu261" ? "The EU checker currently supports arrival delays." : "Choose the disruption you want to assess."}><select {...inputProps("event")} value={event} onChange={(e) => changeCheck(regime, e.target.value as NonNullable<ClaimInput["event"]>)}><option value="delay">Flight delay</option>{regime !== "eu261" && <><option value="cancellation">Airline cancelled the flight</option><option value="denied_boarding">Denied boarding / oversales</option></>}</select></Field>
          </div><div className="form-divider" /><div className="route-fields"><AirportPicker key={`origin-${pickerKey}`} id="originIata" label="Departed from" value={form.originIata} onChange={(value) => update("originIata", value)} error={errors.originIata} /><button className="swap-button" type="button" aria-label="Swap departure and arrival airports" onClick={() => { setForm((previous) => ({ ...previous, originIata: previous.destIata, destIata: previous.originIata })); setPickerKey((n) => n + 1); setResult(null); setError(""); setCheckNotice(""); setErrors((previous) => ({ ...previous, originIata: "", destIata: "" })); }}>⇄</button><AirportPicker key={`dest-${pickerKey}`} id="destIata" label="Arrived at" value={form.destIata} onChange={(value) => update("destIata", value)} error={errors.destIata} /></div><p className="route-hint">Use your actual departure and final arrival airports. This version assesses direct flights only.</p><div className="form-divider" />
          <div className="form-grid"><Field id="airline" label="Operating airline" error={errors.airline} hint="The airline that operated the flight, including its licensed subsidiary."><input {...inputProps("airline")} list="airline-list" autoComplete="off" placeholder="e.g. Air France" value={form.airline} onChange={(e) => { update("airline", e.target.value); update("carrierLicence", "unknown"); }} /><datalist id="airline-list">{airlines.map((airline) => <option value={airline.name} key={airline.name} />)}</datalist></Field><Field id="flightNumber" label="Flight number" error={errors.flightNumber} hint="Find this on your booking or boarding pass."><input {...inputProps("flightNumber")} className="mono" autoComplete="off" placeholder="e.g. AF 008" maxLength={12} value={form.flightNumber} onChange={(e) => update("flightNumber", e.target.value.toUpperCase())} /></Field>
          <Field id="date" label="Flight date" error={errors.date} hint={`Original departure date. This rule version supports dates from ${minimumDate}.`}><input {...inputProps("date")} type="date" min={minimumDate} max={todayIso()} value={form.date} onChange={(e) => update("date", e.target.value)} /></Field>{showArrivalDelay && <Field id="delayHours" label={regime === "us_dot" ? event === "denied_boarding" ? "Offered arrival delay" : "Scheduled arrival change" : "Arrival delay"} error={errors.delayHours} hint={regime === "us_dot" ? event === "denied_boarding" ? "Planned arrival of the offered substitute versus the original schedule, even if you declined it. Half-hour steps." : "How much later the airline’s changed schedule arrived at destination. Half-hour steps; not time spent on the tarmac." : "Hours late at your final destination, in half-hour steps."}><div className="input-with-unit"><input {...inputProps("delayHours")} type="number" inputMode="decimal" min={0} max={72} step={0.5} value={Number.isNaN(form.delayHours) ? "" : form.delayHours} onChange={(e) => update("delayHours", e.target.value === "" ? NaN : Number(e.target.value))} /><span>hours</span></div></Field>}
          <Field id="passengers" label="Affected passengers" error={errors.passengers} hint="Only include passengers covered by this claim."><select {...inputProps("passengers")} value={form.passengers} onChange={(e) => update("passengers", Number(e.target.value))}>{Array.from({ length: 9 }, (_, i) => <option key={i} value={i + 1}>{i + 1} {i ? "passengers" : "passenger"}</option>)}</select></Field><Field id="excuse" label="What reason did the airline give?" error={errors.excuse} hint="Not sure? Choose “No reason given”."><select {...inputProps("excuse")} value={form.excuse} onChange={(e) => update("excuse", e.target.value as ClaimInput["excuse"])}>{excuseOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
          {regime === "eu261" && !knownAirline && form.airline.length > 1 && <Field id="carrierLicence" label="Does the operating airline hold an EU licence?" error={errors.carrierLicence} hint="Needed for flights arriving from outside the EU. If unsure, we’ll flag it for review." className="full-width"><select {...inputProps("carrierLicence")} value={form.carrierLicence} onChange={(e) => update("carrierLicence", e.target.value as ClaimInput["carrierLicence"])}><option value="unknown">I’m not sure</option><option value="eu">Yes — EU licensed</option><option value="non_eu">No — licensed outside the EU</option></select></Field>}
          {regime !== "eu261" && <RegionalFields form={form} errors={errors} update={update} />}
          </div><div className="form-note"><span aria-hidden="true">ⓘ</span><p>{regime === "eu261" ? "This checks arrival delays under EU261 for EU27 routes. Connections, cancellations and denied boarding need a separate assessment." : "Direct flights only. Refunds and cash compensation are separate. The same fare and circumstances must apply to everyone in a group check. Choose the correct currency; no exchange-rate conversion is applied."}</p></div></div></fieldset>
          <div className="form-submit"><button className="button primary" type="submit" disabled={loading}>{loading ? <><span className="spinner" /> Checking your flight…</> : <>Check my eligibility <Arrow /></>}</button>{loading && <button className="button secondary cancel-check" type="button" onClick={cancelCheck}>Cancel check</button>}<span>Free, always. No claim is sent for you.</span></div>
          <div role="status" className={loading ? "loading-note" : "sr-only"}>{loading ? "Applying the selected passenger-rights rules and preparing your result…" : ""}</div>{checkNotice && <p className="check-notice" role="status">{checkNotice}</p>}{error && <div className="error-note" role="alert">{error}</div>}
        </form>
        <aside className="rights-aside" id="rights">{regime !== "eu261" ? <RegionalRights india={regime === "india"} /> : <div className="rights-card pinstripe-dark"><span className="eyebrow">A right, not a favour.</span><h3>Long delay.<br />Clear rules.</h3><p>Compensation is set by law. Your distance and arrival delay determine the band.</p><div className="tariff"><div><span>Up to 1,500 km</span><strong>€250</strong></div><div><span>1,500–3,500 km<small>also intra-EU over 1,500 km</small></span><strong>€400</strong></div><div><span>Over 3,500 km<small>outside the intra-EU band</small></span><strong>€600</strong></div></div><p className="rights-small">Arrival delay must reach 3 hours. Long-haul flights arriving 3 to under 4 hours late fall in the €300 band. Extraordinary circumstances can affect entitlement.</p><a href="https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_en.htm" target="_blank" rel="noreferrer">Read your EU passenger rights <span aria-hidden="true">↗</span></a></div>}<div className="privacy-note"><svg width="22" height="24" viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="m12 2 9 4v7c0 6-9 11-9 11S3 19 3 13V6l9-4Z"/><path d="m8 13 3 3 5-6"/></svg><div><strong>Your details stay yours.</strong><p>No account. Recent flight facts stay in this browser. Optional personal letter details stay in this page’s memory and are never sent to the server or AI.</p></div></div></aside></div>
        {history.length > 0 && <div className="history-section"><div><p className="eyebrow">Recent checks · this browser only</p><button type="button" onClick={clearHistory} disabled={loading}>Clear saved flights</button></div><ul>{history.map((entry) => <li key={JSON.stringify(entry.input)}><button type="button" disabled={loading} onClick={() => loadFlight(entry.input)}><span className="history-route mono">{entry.input.originIata} → {entry.input.destIata}</span><span className="history-description"><span>{entry.input.flightNumber} · {entry.input.date}</span><small>{jurisdictionNames[entry.input.jurisdiction ?? "eu261"]} · {eventNames[entry.input.event ?? "delay"]} · {entry.input.passengers} {entry.input.passengers === 1 ? "passenger" : "passengers"} · {excuseOptions.find((option) => option.value === entry.input.excuse)?.label}</small></span><span aria-hidden="true">↗</span></button></li>)}</ul></div>}{historyNotice && <p className="history-notice" role="status">{historyNotice}</p>}
      </section>
      {result && <div className="shell" key={JSON.stringify(result.input)}><Result result={result} /></div>}
      <ProductQuestions />
      <section className="closing-note"><div className="shell"><div className="small-seal">SC</div><p>Less chasing. More clarity.<br /><em>Your claim stays in your hands.</em></p><span>Check the facts.<br />Know your rights.</span></div></section>
    </main>
    <SiteFooter />
  </>;
}
