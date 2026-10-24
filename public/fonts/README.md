# Local fonts

Inter and Playfair Display Latin WOFF2 subsets are served locally, with font-display
swap. The respective SIL Open Font License notices are retained in this directory.
scripts/vendor-fonts.py refreshes these public assets from Google Fonts and the
official google/fonts repository. Fonts are not requested from Google by browsers.
Monospace/typewriter roles use system fallbacks when the named font is unavailable.
