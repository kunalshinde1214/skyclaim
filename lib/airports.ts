import data from "../data/airports.json";

// Coordinates: OpenFlights, ODbL 1.0 / DbCL 1.0. See data/README.md.
export type Airport = { iata: string; name: string; city: string; country: string; lat: number; lon: number };
export const airports: Airport[] = data.airports;
const byIata = new Map(airports.map((airport) => [airport.iata, airport]));
export const getAirport = (iata: string) => byIata.get(iata.toUpperCase());

export const EU_COUNTRIES = new Set([
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark",
  "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy",
  "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal",
  "Romania", "Slovakia", "Slovenia", "Spain", "Sweden",
]);

export function searchAirports(query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return airports.filter((a) => ["CDG", "JFK", "AMS", "FRA", "LHR", "BCN"].includes(a.iata));
  return airports.filter((a) => `${a.iata} ${a.city} ${a.name} ${a.country}`.toLowerCase().includes(needle))
    .sort((a, b) => Number(b.iata.toLowerCase() === needle) - Number(a.iata.toLowerCase() === needle)).slice(0, 7);
}
