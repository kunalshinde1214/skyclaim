"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="shell recovery-page"><p className="eyebrow">A pause in the journey</p><h1>This page couldn’t load.</h1><p>Please try again. No claim has been sent.</p><button className="button primary" onClick={reset}>Try again</button><a href="/">Return to SkyClaim →</a></main>;
}
