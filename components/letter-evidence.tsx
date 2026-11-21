import Link from "next/link";
import type { ClaimInput } from "../lib/schema";

export function LetterEvidence({ input }: { input: ClaimInput }) {
  return <div className="evidence-note"><h3>Before you use this draft</h3><ul>
    <li>Check your confirmed booking, exact operating carrier, check-in requirements and actual travel records. This app does not verify them.</li>
    <li>Keep the original schedule, disruption notice, airline explanation, receipts and any rebooking or voucher offer.</li>
    <li>Check prior settlements, duplicate recovery and local claim deadlines. A request for a response within 14 days does not extend a legal deadline.</li>
    {(input.jurisdiction ?? "eu261") === "eu261" && <li>For an arrival from outside the EU, confirm the licensed carrier and any benefits, compensation and assistance already received there. Promotional/non-public fares and travel conditions can affect coverage.</li>}
    <li>Verify the recipient on the airline’s official website. Send sensitive booking documents only through its verified channel.</li>
  </ul><p>Estimates and sources need independent review. <Link href="/trust">Read coverage and review limits</Link>.</p></div>;
}
