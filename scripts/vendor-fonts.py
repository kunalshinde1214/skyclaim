"""Download the site's Latin font subsets from Google Fonts; retain OFL notices."""
from pathlib import Path
from urllib.request import Request, urlopen
import re

ROOT = Path(__file__).resolve().parents[1] / "public" / "fonts"

def fetch(url):
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"})
    with urlopen(request, timeout=30) as response:
        return response.read()

def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    css = fetch("https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=Playfair+Display:ital,wght@0,400..800;1,400..700&display=swap").decode()
    blocks = re.findall(r"/\* latin \*/\s*(@font-face\s*\{[^}]+\})", css)
    if len(blocks) != 3:
        raise ValueError(f"Expected three Latin font faces, received {len(blocks)}")
    faces = []
    for index, block in enumerate(blocks):
        url = re.search(r"url\((https://fonts\.gstatic\.com/[^)]+)\)", block).group(1)
        name = f"latin-{index}.woff2"
        (ROOT / name).write_bytes(fetch(url))
        faces.append(block.replace(url, f"/fonts/{name}"))
    (ROOT / "fonts.css").write_text("\n".join(faces)+"\n", encoding="utf-8")
    for family in ["inter", "playfairdisplay"]:
        (ROOT / f"{family}-OFL.txt").write_bytes(fetch(f"https://raw.githubusercontent.com/google/fonts/main/ofl/{family}/OFL.txt"))
    print("Vendored three Latin WOFF2 font faces and their OFL licenses.")

if __name__ == "__main__":
    main()
