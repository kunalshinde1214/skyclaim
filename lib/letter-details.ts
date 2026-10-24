export type LetterDetails = {
  name: string;
  postalAddress: string;
  contactDetails: string;
  bookingReference: string;
  airlineAddress: string;
  letterDate: string;
  otherPassengers: string;
  includeCareExpenses: boolean;
};

export function emptyLetterDetails(letterDate = ""): LetterDetails {
  return { name: "", postalAddress: "", contactDetails: "", bookingReference: "", airlineAddress: "", letterDate, otherPassengers: "", includeCareExpenses: false };
}

function formatDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const date = new Date(`${iso}T12:00:00Z`);
  if (isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== iso) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

// This module is pure. Personal details are held in component state only.
// Each value is interpolated at its own template location, never by global replacement.
export function resolveLetterDetails(details: LetterDetails | undefined, passengers: number) {
  const missingFields: string[] = [];
  function field(value: string | undefined, label: string, placeholder: string) {
    if (value?.trim()) return value.trim();
    missingFields.push(label);
    return placeholder;
  }
  const date = formatDate(details?.letterDate ?? "");
  const resolved = {
    name: field(details?.name, "Your name", "[Your name]"),
    postalAddress: field(details?.postalAddress, "Your postal address", "[Your postal address]"),
    contactDetails: field(details?.contactDetails, "Your contact details", "[Your contact details]"),
    bookingReference: field(details?.bookingReference, "Booking reference", "[Your booking reference]"),
    airlineAddress: field(details?.airlineAddress, "Airline claims address", "[Airline's official claims address — verify before sending]"),
    date: date || "[Date of this letter]",
    otherPassengers: passengers > 1 ? field(details?.otherPassengers, "Other passengers / authority", "[Other passengers' names / authority, if applicable]") : "",
    careParagraph: !details
      ? "[Optional: I also request reimbursement of necessary, reasonable care expenses under Art. 9. Itemised receipts are attached. Delete this paragraph if it does not apply.]"
      : details.includeCareExpenses
        ? "I also request reimbursement of necessary, reasonable care expenses under Art. 9. Itemised receipts are attached."
        : "",
  };
  if (!date) missingFields.push("Letter date");
  return { ...resolved, missingFields };
}
