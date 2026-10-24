"""Refresh the curated airport subset from OpenFlights (ODbL / DbCL).

Source: https://openflights.org/data.php
Raw: https://github.com/jpatokal/openflights/blob/master/data/airports.dat
Run with Python 3; no third-party packages. Downloads public data only.
"""
import csv
import io
import json
from pathlib import Path
from urllib.request import urlopen

CODES = """AMS CDG ORY FRA MUC BER HAM DUS CGN STR NUE LEJ DRS HAJ BRE DTM
MAD BCN AGP ALC VLC SVQ BIO PMI IBZ TFS TFN LPA ACE FUE SCQ
FCO MXP LIN BGY VCE BLQ NAP CTA PMO PSA FLR TRN CAG BRI
DUB SNN ORK LIS OPO FAO FNC PDL VIE SZG INN BRU CRL
CPH BLL ARN GOT MMX HEL RVN OUL WAW KRK GDN KTW WRO POZ
PRG BRQ BUD DEB ATH SKG HER CHQ RHO KGS CFU JTR JMK
OTP CLJ SOF VAR BOJ ZAG DBV SPU PUY LJU BTS KSC LUX MLA
RIX VNO TLL LCA PFO LHR LGW STN LTN MAN EDI BHX BRS GLA
ZRH GVA BSL OSL BGO KEF JFK EWR BOS IAD ATL ORD DFW MIA
LAX SFO SEA YYZ YUL YVR MEX GRU EZE DXB DOH AUH SIN HKG
NRT HND ICN PEK PVG DEL BOM BLR MAA HYD CCU AMD COK GOI PNQ JAI LKO GAU PAT IXC VNS TRV IXB IXR BBI NAG IDR SXR IXZ BKK KUL JNB CPT SYD MEL
DEN LAS PHX IAH DCA BWI PHL DTW MSP CLT SAN SJC OAK SLC AUS BNA MCO TPA FLL HNL PDX STL PIT RDU SMF SAT ANC ABQ CLE MCI SJU GUM STT
IST SAW TLV CAI CMN TUN NBO MRU SEZ""".split()

ROOT = Path(__file__).resolve().parents[1]

def main():
    with urlopen("https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat", timeout=45) as response:
        rows = csv.reader(io.StringIO(response.read().decode("utf-8")))
        found = {r[4]: {"iata": r[4], "name": r[1], "city": r[2], "country": r[3], "lat": float(r[6]), "lon": float(r[7])} for r in rows if len(r) > 7 and r[4] in CODES}
    # OpenFlights predates BER's opening. Supplement with the airport's OurAirports record.
    # https://ourairports.com/airports/EDDB/changes.html (public-domain data)
    found["BER"] = {"iata": "BER", "name": "Berlin Brandenburg Airport", "city": "Berlin", "country": "Germany", "lat": 52.3617, "lon": 13.5023}
    missing = set(CODES) - found.keys()
    if missing:
        raise ValueError(f"Missing airports: {sorted(missing)}")
    output = {"source": "OpenFlights airport database; ODbL 1.0 / DbCL 1.0; https://openflights.org/data.php", "airports": sorted(found.values(), key=lambda a: a["city"])}
    (ROOT / "data" / "airports.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Imported {len(found)} airports from OpenFlights.")

if __name__ == "__main__":
    main()
