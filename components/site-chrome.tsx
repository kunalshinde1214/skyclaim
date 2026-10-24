import Link from "next/link";
import { SiteNavigation } from "./site-navigation";
export function FlightMark({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true"><path d="m21 3-7 18-3.5-7.5L3 10l18-7Z" /><path d="m10.5 13.5 5-5" /></svg>;
}
export function SiteHeader() {
  return <header className="site-header"><div className="shell nav-inner"><Link href="/" className="brand" aria-label="SkyClaim home"><span className="brand-mark"><FlightMark /></span><span>SkyClaim<span className="brand-period">.</span></span></Link><SiteNavigation /><Link href="/#check" className="nav-cta">Know your rights <span aria-hidden="true">↗</span></Link></div></header>;
}
export function SiteFooter() {
  return <footer className="site-footer"><div className="shell footer-top"><Link href="/" className="brand">SkyClaim<span className="brand-period">.</span></Link><p>Information about passenger rights, not legal advice.<br />You review and send your own letter. Eligibility depends on your facts and the airline’s evidence.</p></div><div className="shell footer-bottom"><span>EU261 · India DGCA · USA DOT</span><div className="footer-links"><Link href="/privacy">Privacy &amp; limitations</Link><Link href="/roadmap">Roadmap</Link><Link href="/hackathon">Hackathon field notes</Link><a href="https://openflights.org/data.php" target="_blank" rel="noreferrer">Airport data · OpenFlights ↗</a></div></div></footer>;
}
