"use client";

import { useState } from "react";
import { createLetter } from "../lib/letter-template";
import { emptyLetterDetails, resolveLetterDetails, type LetterDetails } from "../lib/letter-details";
import { todayIso } from "../lib/schema";
import type { EvaluationResponse } from "../lib/types";

export function ClaimLetter({ result }: { result: EvaluationResponse }) {
  const [details, setDetails] = useState(() => emptyLetterDetails(todayIso()));
  const [status, setStatus] = useState("");
  const { input, computed, mode } = result;
  const conditional = computed.verdict === "borderline";
  const letter = createLetter(input, computed, details);
  const missing = resolveLetterDetails(details, input.passengers).missingFields;
  const hasPersonalDetails = Object.entries(details).some(([key, value]) => key !== "letterDate" && !!value);

  function update<K extends keyof LetterDetails>(key: K, value: LetterDetails[K]) {
    setDetails((previous) => ({ ...previous, [key]: value }));
    setStatus("");
  }

  async function copyLetter() {
    try {
      await navigator.clipboard.writeText(letter);
      setStatus(missing.length ? `Draft copied. Complete the remaining fields before sending: ${missing.join(", ")}.` : "Letter copied. Review the facts and claims address before sending it to the airline.");
    } catch {
      setStatus("Clipboard access is unavailable. Select the letter text and copy it manually.");
    }
  }

  function printLetter() {
    setStatus("If no print dialog appears, open this page in your web browser and try again.");
    window.print();
  }

  function downloadLetter() {
    let url: string | undefined;
    try {
      url = URL.createObjectURL(new Blob([letter], { type: "text/plain;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `skyclaim-${input.flightNumber.replace(/[^a-z0-9]/gi, "")}-${input.date}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setStatus("Text download requested. The file includes any details you added. Review and complete it before sending.");
    } catch {
      setStatus("The download could not start. Copy the letter or select its text instead.");
    } finally {
      if (url) { const createdUrl = url; window.setTimeout(() => URL.revokeObjectURL(createdUrl), 1000); }
    }
  }

  function clearDetails() {
    setDetails(emptyLetterDetails(todayIso()));
    setStatus("Personal details cleared from this page.");
  }

  return <section className="letter-section" aria-labelledby="letter-heading">
    <div className="section-label"><span>03</span> Your claim letter <i /></div>
    <div className="letter-heading"><div><h2 id="letter-heading">Put it in writing.</h2><p>{conditional ? "An evidence request, with a conditional assessment." : "Your facts, the legal basis, and a clear request."} Add your details, then review before sending.</p></div><span className="small-seal">SC</span></div>
    {mode === "template" && <div className="template-note"><span className="status-dot" /><span><strong>Template mode.</strong> Flight facts and compensation are calculated by the rules engine.</span></div>}

    <details className="letter-details">
      <summary><span>Add your details <small>Optional · private to this page</small></span><span className="details-chevron" aria-hidden="true">+</span></summary>
      <div className="letter-details-body">
        <p className="letter-privacy" id="letter-privacy">These details stay in this page’s memory. They are not saved, sent to the server or shared with AI. Reloading the page or editing flight details clears them.</p>
        <div className="personal-fields" role="group" aria-label="Private letter details" aria-describedby="letter-privacy">
          <div className="field"><label htmlFor="letter-name">Your full name</label><input id="letter-name" autoComplete="off" maxLength={120} value={details.name} onChange={(event) => update("name", event.target.value)} placeholder="As shown on your booking" /></div>
          <div className="field"><label htmlFor="letter-booking">Booking reference</label><input id="letter-booking" autoComplete="off" maxLength={40} value={details.bookingReference} onChange={(event) => update("bookingReference", event.target.value)} placeholder="Your reservation reference" /></div>
          <div className="field"><label htmlFor="letter-contact">Your contact details</label><input id="letter-contact" autoComplete="off" maxLength={240} value={details.contactDetails} onChange={(event) => update("contactDetails", event.target.value)} placeholder="Email or phone for the airline’s reply" /></div>
          <div className="field"><label htmlFor="letter-date">Letter date</label><input id="letter-date" type="date" value={details.letterDate} onChange={(event) => update("letterDate", event.target.value)} /></div>
          <div className="field"><label htmlFor="letter-postal">Your postal address</label><textarea id="letter-postal" autoComplete="off" rows={3} maxLength={600} value={details.postalAddress} onChange={(event) => update("postalAddress", event.target.value)} placeholder="Street, city, postal code and country" /></div>
          <div className="field"><label htmlFor="letter-airline-address">Airline’s official claims address</label><textarea id="letter-airline-address" autoComplete="off" rows={3} maxLength={600} value={details.airlineAddress} onChange={(event) => update("airlineAddress", event.target.value)} placeholder="Verify this on the airline’s official website" /></div>
          {input.passengers > 1 && <div className="field full-width"><label htmlFor="letter-other-passengers">Other passengers / authority to claim</label><textarea id="letter-other-passengers" autoComplete="off" rows={2} maxLength={600} value={details.otherPassengers} onChange={(event) => update("otherPassengers", event.target.value)} placeholder="Names and authority where required by the airline" /></div>}
        </div>
        <label className="care-option"><input type="checkbox" checked={details.includeCareExpenses} onChange={(event) => update("includeCareExpenses", event.target.checked)} /><span>Include a request for necessary care expenses<small>Use this only if you will attach itemised receipts.</small></span></label>
        <button className="clear-details" type="button" disabled={!hasPersonalDetails} onClick={clearDetails}>Clear personal details</button>
      </div>
    </details>

    <p className={`letter-review ${missing.length ? "incomplete" : "complete"}`} role="status">{missing.length ? `${missing.length} ${missing.length === 1 ? "field" : "fields"} to complete before sending. You can also copy the draft and fill it in yourself.` : "Your details are filled in. Review the letter, flight facts and claims address before sending."}</p>
    <div className="letter-frame">
      <div className="letter-toolbar"><span className="eyebrow">{conditional ? "Evidence request" : "Passenger rights request"} · draft</span><span className="letter-mode">{mode === "ai" ? "AI-assisted explanation" : "Prepared from your facts"}</span></div>
      <pre className="print-letter" tabIndex={0} aria-label="Your claim letter">{letter}</pre>
      <div className="letter-actions"><button className="button primary" type="button" onClick={copyLetter}><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1" /><path d="M12 7V3H3v9h4" /></svg> Copy letter</button><button className="button secondary" type="button" onClick={downloadLetter}>Download .txt <span aria-hidden="true">↓</span></button><button className="button secondary" type="button" onClick={printLetter}>Print letter <span aria-hidden="true">↗</span></button><span>Review. Complete. Send when you’re ready.</span></div>
    </div>
    <p className="copy-status" role="status">{status}</p>
  </section>;
}
