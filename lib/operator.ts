export function operatorDetails() {
  const name = process.env.SKYCLAIM_OPERATOR_NAME?.trim();
  const country = process.env.SKYCLAIM_OPERATOR_COUNTRY?.trim();
  // Public contact supplied by the owner on 21 November 2026; not a credential.
  const email = process.env.SKYCLAIM_SUPPORT_EMAIL?.trim() || "kunalshinde1805@gmail.com";
  const validEmail = email && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) &&
    !/@(?:example\.(?:com|org|net|invalid)|localhost)$/i.test(email);
  return { name, country, email: validEmail ? email : undefined, complete: !!(name && country && validEmail) };
}
