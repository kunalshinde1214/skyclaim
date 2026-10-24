"use client";
import { useState } from "react";
import { assessClaim } from "../lib/assess";
import { examples } from "../lib/examples";
import { formatMoney, isRegional } from "../lib/regional-rules";
import type { ClaimInput } from "../lib/schema";
import { FlightMark } from "./site-chrome";

const regions = [{ id: "eu261", name: "European Union", short: "EU261", route: "Paris → New York", event: "Arrival delay · 5.5 hours", refund: "Separate from compensation", label: "EU261 delay assessment" }, { id: "india", name: "India", short: "DGCA", route: "Delhi → Mumbai", event: "Cancellation · 2 hours’ notice", refund: "Refund assessed separately", label: "DGCA cancellation assessment" }, { id: "us_dot", name: "United States", short: "DOT", route: "San Francisco → New York", event: "Involuntary oversales · 3 hours", refund: "Unused ticket needs review", label: "DOT oversales assessment" }] as const;
export function LandingHero({ onExample }: { onExample: (input: ClaimInput) => void }) {
  const [selected, setSelected] = useState<keyof typeof examples>("eu261");
  const region = regions.find((r) => r.id === selected)!;
  const input = examples[selected], facts = assessClaim(input);
  const amount = isRegional(facts) ? formatMoney(facts.compensationPerPassenger, facts.currency) : formatMoney(facts.amountPerPassengerEur, "EUR");
  return <section className="departure-hero" aria-labelledby="hero-heading"><div className="hero-gridline" aria-hidden="true" /><div className="shell departure-grid">
    <div className="departure-copy"><p className="eyebrow"><span className="live-dot" /> Passenger rights, made clear</p><h1 id="hero-heading">Flight disrupted?<br />Start with<br /><em>your rights.</em></h1><p className="departure-description">From “what am I owed?” to a letter you can send. Understand compensation, refunds and care under European, Indian and US rules.</p><div className="departure-actions"><a href="#check" className="button brass-button">Check my flight <span aria-hidden="true">↗</span></a><a href="#how-it-works" className="quiet-link">How it works <span aria-hidden="true">↓</span></a></div><p className="departure-promise">Free to use <span>·</span> No account needed <span>·</span> You keep control</p></div>
    <div className="case-preview"><div className="preview-caption"><span className="mono">A CASE IN POINT</span><span>Try a different rulebook ↴</span></div><div className="region-switcher" role="group" aria-label="Illustrative case jurisdiction">{regions.map((r) => <button type="button" aria-pressed={selected === r.id} key={r.id} onClick={() => setSelected(r.id)}>{r.name}<small>{r.short}</small></button>)}</div>
      <div className="boarding-case" aria-live="polite" aria-atomic="true"><div className="boarding-top"><span className="eyebrow">SkyClaim · case file</span><FlightMark size={22} /></div><div className="boarding-route"><strong>{input.originIata}</strong><span className="boarding-route-line"><i /><FlightMark size={23} /><i /></span><strong>{input.destIata}</strong></div><p className="boarding-cities">{region.route}</p><div className="boarding-disruption"><span className="mini-label">What happened</span><strong>{region.event}</strong></div><div className="boarding-perforation" /><div className="boarding-outcome"><div><span className="mini-label">Estimated compensation</span><p>{amount}<small>/ passenger</small></p></div><span className="case-seal">SC<br /><small>ASSESSED</small></span></div><div className="boarding-refund"><span className="status-dot" />{region.refund}</div><button type="button" className="boarding-open" onClick={() => onExample(input)}>Explore this example <span aria-hidden="true">↗</span></button><p className="preview-disclaimer">Illustrative facts, calculated by our rules engine. Not a verified flight record or a guaranteed award.</p></div>
      <span className="preview-coordinate mono">{region.label} · direct flight</span>
    </div>
  </div><div className="departure-proof shell"><span><b>01</b> Choose the rulebook</span><span><b>02</b> See the reasoning</span><span><b>03</b> Leave with a letter</span><span className="proof-note">Your claim. In your hands.</span></div></section>;
}
