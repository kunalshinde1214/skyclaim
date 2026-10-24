export type CarrierLicence = "eu" | "non_eu" | "unknown";
export const airlines: { name: string; licence: CarrierLicence }[] = [
  ...["Air France", "Lufthansa", "KLM", "Iberia", "Aer Lingus", "Austrian Airlines", "Brussels Airlines", "Finnair", "TAP Air Portugal", "LOT Polish Airlines", "Aegean Airlines", "ITA Airways", "Ryanair", "Vueling", "Wizz Air Hungary", "SAS"].map((name) => ({ name, licence: "eu" as const })),
  ...["British Airways", "Virgin Atlantic", "American Airlines", "Delta Air Lines", "United Airlines", "Air Canada", "Emirates", "Qatar Airways", "Air India", "Singapore Airlines", "Turkish Airlines", "easyJet UK"].map((name) => ({ name, licence: "non_eu" as const })),
];

export function carrierLicence(airline: string, declared: CarrierLicence): CarrierLicence {
  // The operating airline matters. A brand with several licensed subsidiaries needs the user's declaration.
  return airlines.find((a) => a.name.toLowerCase() === airline.trim().toLowerCase())?.licence ?? declared;
}
