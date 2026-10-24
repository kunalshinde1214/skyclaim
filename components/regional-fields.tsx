"use client";

import type { ReactNode } from "react";
import type { ClaimInput } from "../lib/schema";

export function RegionalFields({ form, errors, update }: { form: ClaimInput; errors: Record<string, string>; update: <K extends keyof ClaimInput>(key: K, value: ClaimInput[K]) => void }) {
  const india = form.jurisdiction === "india";
  const event = form.event ?? "delay";
  function field(key: keyof ClaimInput, label: string, hint: string, child: ReactNode) {
    return <div className="field" key={key}><label htmlFor={key}>{label}</label>{child}<p id={`${key}-help`} className={errors[key] ? "field-error" : "field-hint"}>{errors[key] || hint}</p></div>;
  }
  const props = (key: keyof ClaimInput) => ({ id: key, "aria-invalid": !!errors[key], "aria-describedby": `${key}-help` });
  function number(key: "blockMinutes" | "departureDelayHours" | "basicFareInr" | "oneWayFareUsd" | "cancellationNoticeHours" | "alternateDepartureHours", label: string, hint: string, step: number, max: number) {
    const value = form[key];
    return field(key, label, hint, <input {...props(key)} type="number" inputMode="decimal" min={key === "blockMinutes" ? 1 : 0} max={max} step={step} value={value === undefined || Number.isNaN(value) ? "" : value} onChange={(e) => update(key, e.target.value === "" ? undefined : Number(e.target.value))} />);
  }
  function choice<K extends keyof ClaimInput>(key: K, label: string, hint: string, options: [string, string][]) {
    return field(key, label, hint, <select {...props(key)} value={String(form[key] ?? "")} onChange={(e) => update(key, (e.target.value || undefined) as ClaimInput[K])}><option value="">Choose an answer</option>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>);
  }
  const yesNo: [string, string][] = [["yes", "Yes"], ["no", "No"]];
  return <>
    {india && choice("indianCarrier", "Is the operating airline licensed in India?", "Foreign-carrier compensation needs a review under CAR para 3.6.1.", [...yesNo, ["unknown", "I’m not sure"]])}
    {india && event !== "denied_boarding" && number("blockMinutes", "Scheduled block time (minutes)", "Gate-to-gate duration on the original schedule, not the delay.", 1, 1440)}
    {india && event === "delay" && <>
      {number("departureDelayHours", "Expected departure delay (hours)", "Measured from the original schedule, or qualifying revised schedule. Half-hour steps.", 0.5, 168)}
      {choice("checkedInOnTime", "Did you check in on time?", "Required for the delay meals entitlement.", yesNo)}
      {choice("nightDeparture", "Was departure scheduled between 20:00 and 03:00?", "Use local time at departure. This affects the hotel threshold.", yesNo)}
    </>}
    {india && event !== "denied_boarding" && event === "cancellation" && <>
      {number("cancellationNoticeHours", "Cancellation notice (hours)", "Hours before scheduled departure when informed. Enter 0 for no notice.", 0.5, 87600)}
      {choice("contactProvided", "Were contact details provided when booking?", "An email address or phone number supplied to the airline/agent.", yesNo)}
    </>}
    {india && event !== "delay" && number("basicFareInr", "One-way basic fare + fuel charge (₹)", "Per passenger. Exclude taxes and other fees. Use the same fare only for passengers with identical fares.", 0.01, 10000000)}
    {(india || event !== "denied_boarding") && choice("travelDecision", india ? "Did you accept alternate travel?" : "Did you accept travel or a voucher instead of a refund?", india ? "Refund and alternate travel are choices. A refund is not added to travel already accepted." : "Include the changed flight, rebooking, travel credit or other compensation accepted instead of a refund.", india && event !== "delay" ? [["yes", "Yes — alternate travel"], ["no", "No — I chose a refund"]] : [["no", "No — I declined"], ["yes", "Yes — I accepted"], ["undecided", "I haven’t decided yet"]])}
    {india && event === "denied_boarding" && choice("replacementOffered", "Did the airline arrange an alternate flight?", "Include an arranged flight you declined. The one-hour departure exception is checked first.", yesNo)}
    {india && event === "denied_boarding" && form.replacementOffered === "yes" && number("alternateDepartureHours", "Alternate departure delay (hours)", "When the arranged alternate flight was scheduled to depart after the original departure. Not arrival delay.", 0.5, 168)}
    {event === "denied_boarding" && choice("boardingEligibility", "What happened at boarding?", india ? "Eligible means confirmed booking, on-time presentation and involuntary oversales; no health, safety, security or document refusal." : "Eligible means involuntary oversales, confirmed booking, on-time check-in and gate arrival on a scheduled aircraft with 30+ seats; no aircraft substitution, qualifying weight restriction or safety/document exception.", [["eligible", "Involuntary oversales — all eligibility conditions met"], ["voluntary", "I volunteered to give up my seat"], ["excluded", "An exception applies"], ["unknown", "I need to confirm the circumstances"]])}
    {!india && event === "denied_boarding" && <>
      {number("oneWayFareUsd", "One-way fare including taxes ($)", "Per passenger to the destination/first stopover, including mandatory taxes. Award tickets: lowest same-class cash fare. Identical fares only for a group.", 0.01, 1000000)}
      {choice("replacementOffered", "Did the airline offer substitute transportation?", "Use what was offered, even if you declined it. No offer uses the higher compensation band.", yesNo)}
    </>}
  </>;
}
