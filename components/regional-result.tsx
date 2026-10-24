"use client";

import { useEffect, useRef } from "react";
import { ClaimLetter } from "./claim-letter";
import { eventNames, formatMoney, jurisdictionNames, type RegionalComputed } from "../lib/regional-rules";
import type { EvaluationResponse } from "../lib/types";

export function RegionalResult({ result, facts: c }: { result: EvaluationResponse; facts: RegionalComputed }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    document.getElementById("verdict")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }, []);
  const conditional = c.verdict === "borderline", outside = c.verdict === "outside_scope", good = c.verdict === "likely_eligible";
  const refund = outside ? "Not assessed" : ({ due: "Refund due", option: "Refund / travel choice", not_due: "Not established here", review: "Needs separate review" })[c.refund];
  return <section id="verdict" className="results-section" aria-labelledby="verdict-heading">
    <div className="section-label"><span>02</span> Your rights assessment <i /></div>
    <div className={`verdict-card ${good ? "positive" : conditional ? "conditional" : "negative"}`}>
      <div className="verdict-top"><span className="eyebrow">{jurisdictionNames[c.jurisdiction]} · {eventNames[result.input.event ?? "delay"]}</span><span className="mono">{result.input.originIata} → {result.input.destIata}</span></div>
      <div className="verdict-main"><div><p className="eyebrow">{c.compensationPerPassenger > 0 ? `${conditional ? "Conditional" : "Estimated"} cash compensation` : "Refunds and assistance assessed separately"}</p><h2 id="verdict-heading" ref={heading} tabIndex={-1}>{outside ? "This case needs another check." : conditional ? "Confirm the conditions first." : good ? "Your rights, on the record." : "No payment established here."}</h2>
        {c.compensationPerPassenger > 0 && <div className="amount"><span>{formatMoney(c.compensationPerPassenger, c.currency)}</span><span>/ passenger</span></div>}
        <p className="verdict-summary">{c.reason}</p></div><span className="stamp verdict-stamp">{outside ? "Not assessed" : conditional ? "Conditional" : good ? "Rights found" : "Check rights"}</span></div>
      <div className="calculation-grid"><div><span>Cash compensation / passenger</span><strong>{outside ? "Not assessed" : formatMoney(c.compensationPerPassenger, c.currency)}</strong></div><div><span>{conditional ? "Conditional cash total" : "Cash total"} · {c.passengers} passenger(s)</span><strong>{outside ? "Not assessed" : formatMoney(c.totalCompensation, c.currency)}</strong></div><div><span>Ticket refund · separate</span><strong>{refund}</strong></div><div><span>Refund amount</span><strong>Not estimated</strong></div></div>
      <div className="verdict-foot"><span>{c.legalBasis}</span><span>Selected law only · no combined awards</span></div>
    </div>
    <div className="result-columns"><div className="rebuttal-card"><p className="eyebrow">How the rule applies</p><h3>{c.compensationPerPassenger > 0 ? "The fare sets the calculation." : "A refund is a separate right."}</h3><p>{c.formula}</p><a className="source-link" href={c.sourceUrl} target="_blank" rel="noreferrer">Read the official rule ↗</a>{c.jurisdiction === "us_dot" && <a className="source-link" href="https://www.transportation.gov/airconsumer/airline-customer-service-dashboard" target="_blank" rel="noreferrer">Check airline care commitments ↗</a>}</div>
      <div className="next-steps"><p className="eyebrow">Your next moves</p><ol>{result.drafted.nextSteps.map((step, i) => <li key={step}><span>0{i + 1}</span><p>{step}</p></li>)}</ol></div></div>
    {!outside && <div className="rights-explanation">{c.care.length > 0 && <><h3>{c.jurisdiction === "us_dot" ? "Airline commitments" : "Assistance to check"}</h3><ul>{c.care.map((s) => <li key={s}>{s}</li>)}</ul></>}{c.notes.length > 0 && <><h3>Conditions and limits</h3><ul>{c.notes.map((s) => <li key={s}>{s}</li>)}</ul></>}</div>}
    {!!result.drafted.claimLetter && <ClaimLetter result={result} />}
    <p className="confidence-note">{result.drafted.confidenceNote}</p>
  </section>;
}
