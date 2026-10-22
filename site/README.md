# AR Smart Library — website

The official site for **AR Smart Library**, a 24-hour reading library at Sadabahar Chowk, Namkum, Ranchi.

**Live: https://shogun-support-99.github.io/library/**

## What this is

A single static page, no build step, no dependencies, no tracking. Open `index.html` and it runs.

- `index.html` — the page, with schema.org `Library` structured data, Open Graph tags and FAQ content
- `styles.css` — all styling; the typeface is self-hosted from `assets/fonts/` (no Google Fonts request)
- `main.js` — three behaviours: the live clock in the headline, the heading reveal, and nothing else
- `404.html`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, `assets/favicon.svg`

## The idea

The page is built on one sentence — *“AR Smart Library is open at ⟨time⟩”* — and the time inside it is live, ticked to Asia/Kolkata. The thing the business actually promises is shown rather than claimed.

There are no photographs of the library on the page. None were supplied, and an interior shot of some other reading room would be a lie, so the picture slots hold the live clock and a drawn schematic of the junction instead. If the library supplies its own photographs, they can replace the schematic directly.

Everything factual comes from the business data sheet: address, hours, phone, ratings, establishment year. **Nothing is invented** — no prices, no facility list, no reviews. Facilities that were not confirmed (AC, Wi-Fi, lockers, parking) are named as unconfirmed rather than omitted or claimed, and membership pricing sends visitors to the phone.

## How it was designed

Built with the skills vendored in this repo, chiefly **taste-skill**'s run, with **impeccable**'s craft floor as the quality gate.

1. **Direction drawn, not invented.** `draw.mjs --sector education --tone quiet` dealt three directions; `sentence-as-layout` was chosen because it can carry the one thing only this library has: the hour. The sheet then dealt Schibsted Grotesk and the sand-and-moss palette (`--seed 60`), both re-dealt from the same direction's slots rather than picked by hand.
2. **The idea:** "On this page, the library's 24-hour promise becomes a live clock inside the sentence."
3. **Fabrication refused.** The sheet's photography slots assume photographs exist. None of the library does, and a stock interior would misrepresent it, so those slots hold the live clock and a drawn schematic of the junction. This is the deviation from the sheet, and the reason for it.
4. **Gated, not assumed.** `lint.mjs` (0 banned patterns) and a headless-Chromium pass over 1440/768/390 measured what the skills say to measure. `inspect.mjs` was not used: it needs a real Chrome install, which this build environment does not have.

Two things the gate caught that would otherwise have shipped broken:

- A `clip-path` reveal clipped each heading's own intersection box to zero, so `IntersectionObserver` could never fire and **every section heading would have stayed invisible**. Replaced with a blur-and-rise reveal, with the class added by JS so the no-JS path is unaffected.
- Star glyphs stood in for a rating icon, and the em-dash habit ran to five on the page. Both flagged by `lint.mjs` and removed.


## Editing

Content is plain HTML. The facts that appear more than once (address, phone, hours) are written out in each place on purpose so the page stays readable and searchable; if you change one, change all of them:

- phone `+91 70705 49845` — `tel:+917070549845` in 6 links
- address — hero, location section, footer
- hours — hero, quick facts, location, FAQ, footer
- ratings — quick facts and the reviews section (with the "as of" date)

## Deploying

Pushing to `main` deploys via GitHub Actions (`.github/workflows/pages.yml`), which publishes this
`site/` folder to GitHub Pages. No manual step, no build, no redeploy to remember. To preview locally:

```bash
cd site && python3 -m http.server 8080
```

The workflow lives at the repository root because Actions only reads `.github/workflows/` there.
