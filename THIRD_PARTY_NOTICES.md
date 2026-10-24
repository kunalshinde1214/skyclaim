# Third-party materials

The root MIT license covers original SkyClaim code and documentation. It does
not replace the separate terms below or license third-party trademarks.

- **Airport database:** `data/airports.json` is a curated derivative of
  [OpenFlights](https://openflights.org/data.php), under
  [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/), with individual
  contents under [DbCL 1.0](https://opendatacommons.org/licenses/dbcl/1-0/).
  The derivative database remains available under those terms. See `data/README.md`
  and the source URLs in `scripts/import-airports.py`. The BER supplement uses
  public-domain OurAirports coordinates.
- **Fonts:** Inter and Playfair Display are under the SIL Open Font License 1.1.
  Their copyright and full license notices accompany the files in `public/fonts/`.
- **Dependencies:** installed packages retain their respective licenses. They
  are resolved through `package-lock.json`, not vendored into this source release.
- **Devpost learning pack:** the upstream curriculum is linked, not redistributed
  as SkyClaim-authored material. The local inspection copy is excluded from Git.
- **Original prompt/design references:** user-supplied input files in `reference/`
  and `design/` are retained locally and excluded from this public source package.

Official legal texts and passenger-rights pages are cited from the implemented
rules and documentation. SkyClaim is not affiliated with those authorities,
Devpost, airlines, OpenFlights, Google or Firebase.
