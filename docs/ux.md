# UX and design contract

The original source is `design/skyclaim-design-system.html`. Its palette and font
roles are ported to Tailwind v4 `@theme` values in `app/globals.css`.

| Role | Value |
| --- | --- |
| Paper / parchment / ink | #FBFAF7 / #F4F1EA / #16233C |
| Navy 50 / 100 / 200 / 300 | #EEF2F8 / #DCE3EE / #C3D0E2 / #A9B8D0 |
| Navy 500 / 700 / 900 | #2E4A7D / #1C3055 / #101D33 |
| Brass light / default / dark | #C9B37E / #A98B4F / #8A6F3B |
| Verdict green / red / amber | #1F6B47 / #A63226 / #9A6B1F |
| Soft green / red / amber | #EAF3EE / #F8ECEA / #F7F1E4 |
| Display / UI / data / letter | Playfair Display / Inter / IBM Plex Mono / Courier Prime |

The page leads with a plain-language promise and a labelled illustrative case
document. A three-part explanation connects flight input, verdict and letter.
The working form sits beside a navy rights ledger. Results appear beneath the form,
with the computed figures grouped together and the applicable legal reference shown.

The verdict fades up over 300ms. Its amount counts for 700ms after a 100ms delay;
the double-border stamp lands after 850ms over 450ms. Reduced motion shows everything
immediately. Scrolling controls and field focus should preserve context.

Airport suggestions have combobox/listbox semantics, active-descendant navigation,
Arrow Up/Down selection, Enter acceptance and Escape dismissal. Labels remain
associated with inputs; validation errors are connected through aria-describedby.
Submission disables editable controls and announces progress; the result heading
receives focus. Clipboard feedback is a live status message.
The loading state offers a Cancel check button outside the disabled form fields.
Cancellation preserves the entered flight and announces the result near the form.
Timeout, connection and unexpected-response errors provide a retry path. Validation
messages describe empty or non-half-hour delays in plain English.

An optional disclosure above the letter contains private sender, booking and claims-
address fields. The preview updates immediately, with a concise missing-fields status.
Care-expense wording is explicitly opt-in. A clear control erases the fields; changing
the flight removes its old verdict and private fields. Recent checks show delay,
passenger count and reason to distinguish checks with the same flight number and date.

At small widths the hero, form and rights panel stack. The result ledger becomes
two columns. Print CSS displays the complete letter without navigation, controls,
or a scroll container. Print output retains bracketed fields for the passenger.

## Assumptions & Deviations

The page uses one continuous flow rather than a four-screen wizard. The hero document
is CSS/HTML rather than a raster asset. Fonts load from Google Fonts with usable local
fallbacks. Browser checks cover representative viewport widths; no full WCAG audit
or printed-page sign-off is implied.
