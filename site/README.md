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
