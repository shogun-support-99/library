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

## The motion layer

The page's idea is that its numbers are physical: they roll into place, and the clock in the
headline keeps rolling all night. Everything else is quiet so that lands.

| Where | What moves |
|---|---|
| On load | Headline rises line by line from its own baseline; the clock plate scales in; lede and actions rise 100 ms apart |
| Quick facts | Figures roll digit by digit into place when the row arrives, staggered left to right |
| Band | A marquee of the four facts, paused on hover and whenever it is off screen |
| Section headings | Resolve line by line, not as one block |
| Lists and copy | Staggered children, 70 ms apart |
| The map | The route from the chowk to the door draws itself, then the marker pulses once |
| Reviews | Scores roll into place |
| Buttons | Press feedback (scale 0.975) and a colour change on hover, colour only, never movement |
| FAQ | Answers expand; the +/− indicator rotates into a minus |
| Header | Turns solid on scroll, and inverts while the dark closing section sits under it |

**Gating.** Every hidden state lives behind `html.anim`, a class that `main.js` adds only after its
observers exist, and the hero's load sequence is additionally behind `html.fonts` so the lines rise in
the real typeface rather than mid-font-swap. With no script, a slow script or a broken one, the page is
a complete static page. A 3-second watchdog drops the gate if nothing has revealed itself.

**Reduced motion** is not zero motion: travel and blur go, while colour, the −/+ state and the
figures' final values stay. Every recipe keeps the finished state as the reduced state.

No animation library, no smooth-scroll hijack, no scroll listener per element. 13 distinct targets
animate, one rAF-throttled scroll handler drives the header, and the clock ticks on the minute boundary
rather than every second.

## Bugs found and fixed

Found by measuring the rendered page, not by reading the code.

- **Rating values were hidden from assistive technology.** Both scores carried `aria-hidden="true"`, so a screen reader heard "out of 5 on Google" with no number. Removed.
- **Every hero line was invisible under `prefers-reduced-motion`.** The reduced-motion override used a weaker selector (`.js`) than the rule that hides the lines (`.js.fonts`), so the hidden state won and the headline never appeared for exactly the users the rule exists to protect. Selectors now match.
- **The stacked digits leaked into `innerText`.** A rolling figure is ten stacked digits; as text nodes they polluted the accessible name, copy-paste and any crawler reading the page. Glyphs are now drawn by CSS `content: attr(data-d)` and the headline carries its own stable sentence.
- **The FAQ indicator disappeared.** Replacing a gradient-built `+` with a flat colour made the `background` shorthand invalid (a colour is not an image layer), so the icon vanished. Rebuilt as two elements.
- **The masthead could stay dark on a pale section.** Its inverted state came from an IntersectionObserver, which only fires when a relationship *changes*; scrolling back up left it stale. Now computed from scroll position each frame.
- **Anchors landed under the sticky header.** `scroll-margin-top` was 0; now set from the header height.
- **`twitter:card` promised `summary_large_image` with no image**, and `apple-touch-icon` pointed at an SVG, which iOS ignores. Both assets now exist: a 1200x630 share card and a real 180x180 PNG.
- **`overflow-x: hidden` would have broken the sticky header**, because it makes the root a scroll container. Changed to `overflow-x: clip`.
- **The clock rolled on first paint**, so the headline showed tumbling digits before it was readable. The plate now lands already correct.
- **A review score measured 6 lines** because a grid row stretched the heading box; `align-items: start` fixed the layout and the measurement.

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
