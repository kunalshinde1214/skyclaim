"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/#check", path: "/", label: "Check a flight" },
  { href: "/roadmap", path: "/roadmap", label: "What’s next" },
  { href: "/hackathon", path: "/hackathon", label: "The build" },
];

export function SiteNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Main navigation">{links.map(({ href, path, label }) =>
    <Link key={href} href={href} aria-current={pathname === path ? "page" : undefined}>{label}</Link>
  )}</nav>;
}
