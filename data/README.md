# Airport data

The static airport subset is imported by `scripts/import-airports.py` from the
[OpenFlights airport database](https://openflights.org/data.php), licensed under
the Open Database License (ODbL 1.0), with individual contents under DbCL 1.0.
The curated derivative database is available under the same terms.

Berlin Brandenburg supplements the older OpenFlights snapshot using the
[OurAirports BER record](https://ourairports.com/airports/EDDB/changes.html),
whose airport data is public domain. The importer cites the exact coordinates.

These coordinates support great-circle calculations, not flight schedules or
proof of a flight's operation. The app does not verify flight numbers or delays.

## Assumptions & Deviations

The subset is curated for common European routes and worldwide gateways. It is
not a complete or real-time airport catalogue. Dates are restricted to 2021 onward;
historical jurisdiction changes and connecting itineraries need separate review.

The 18 October 2026 India/US expansion increases the subset to 218 airports, including
additional Indian cities, US hubs and US territories. Supported legal version dates
differ by selected check; see ../docs/regional-rules.md.
