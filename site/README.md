# AR Smart Library — website

The site for **AR Smart Library**, a 24-hour reading library at Sadabahar Chowk, Namkum, Ranchi.

**Live: https://shogun-support-99.github.io/library/**
**Also live: https://arsmartlibrary-psi.vercel.app/** (Vercel, base path `/`)

The same `src/` is built twice: once for the `/library/` prefix on GitHub Pages, once at `/` for Vercel.
Only two environment variables differ — `SITE_URL` and `BASE_PATH`. See [Deploying](#deploying).

## What this is

Seven pages, one shared design system, built with Tailwind CSS v4 and a small Node build script.
No framework, no client-side router, no tracking.

| Page | Job |
|---|---|
| `index` | The clock, the four facts, the ratings, and the way into the rest |
| `about` | The story, who the room is for, and the rules this site writes by |
| `facilities` | What is confirmed, what is not, and six questions to ask before travelling |
| `membership` | Why no prices are printed, and how the call goes |
| `location` | The address, a drawn schematic of the chowk, hours, and what to tell an auto driver |
| `faq` | Seven short answers |
| `contact` | The one published route in |

```
site/
  src/
    input.css        Tailwind entry: @theme tokens, keyframes, components, motion states
    pages/*.html     one file per page, each with a small front-matter comment
    partials/        head, header, footer, band, closing section
  build.mjs          front matter + includes + JSON-LD + Tailwind -> dist/
  app.js             clock, rolling figures, reveals, header state, menu
  assets/            fonts, icons, share image
  robots.txt, sitemap.xml, site.webmanifest
```

`dist/` is generated and git-ignored; Actions builds it on every push to `main`.
The old single page (`index.html`, `styles.css`, `main.js` at the site root) is gone.

## Editing

Content lives in `site/src/pages/*.html`. Each page opens with a comment block:

```
<!--@
title=Facilities | AR Smart Library, Namkum, Ranchi
desc=What is confirmed … and the six questions to ask before your first visit.
close=Ask first,<br>then travel.
close_lede=One phone call answers more than any page can.
@-->
```

`title`, `desc` and `slug` (the filename) feed the `<title>`, description, canonical URL, Open Graph
tags and JSON-LD. `close` and `close_lede` are the words in the dark closing section. Any front-matter
key becomes an `{{UPPERCASE}}` token in the page. An unfilled token fails the build rather than shipping.

Shared chrome comes from `partials/`, included with `<!-- include: header.html -->`. Nested includes are
resolved in two passes. Navigation marks itself: any link with `data-nav="<slug>"` gets `.is-current`
and `aria-current="page"` on the page it points to, so the nav, the compact menu and the footer never
disagree.

Local preview:

```bash
cd site
npm install
npm run dev      # builds, then rebuilds on src/ changes
# in another shell
npm run serve    # http://localhost:8080
```

## Styling

Tailwind v4 — configuration lives in CSS, not in a `tailwind.config.js`:

- **`@theme`** holds the palette (`--color-sand`, `--color-moss`, `--color-field` …), the five type
  steps, the gutter unit and the easing curves. Those become utilities: `bg-moss`, `text-lead`,
  `gap-x-gutter`, `ease-expo`.
- **`@layer components`** holds the shapes that are not utilities: the masthead, buttons, the clock
  plate, the rolling-digit columns, the marquee band, the schematic map, the FAQ indicator.
- **Utilities** do the layout in the markup: the 12-column grids, spans, spacing, and breakpoints.

Tailwind is a utility CSS framework, not an animation library. Here it owns the motion *definitions*
(`@keyframes`, the duration/easing tokens, the `animate-*` names) while `app.js` decides *when* —
adding `is-in` on intersection, ticking the clock, setting `--d` on a digit. That split is deliberate:
no animation runtime ships, and every state has a static finish.

## The idea

The site is built on one sentence — *“AR Smart Library is open at ⟨time⟩”* — and the time inside it is
live, ticked to Asia/Kolkata. The thing the business actually promises is shown rather than claimed.
Every page keeps the same voice: a heading with a point of view, then the plain fact underneath it.

There are no photographs of the library, because none were supplied; an interior shot of some other
reading room would be a lie. The picture slot holds the live clock and a drawn schematic of the junction.

Everything factual comes from the business data sheet: address, hours, phone, ratings, establishment
year. **Nothing is invented** — no prices, no facility list, no reviews. Facilities that were not
confirmed (AC, Wi-Fi, lockers, CCTV, parking, power backup, washrooms, cabins, seat booking) are named
as unconfirmed rather than omitted or claimed. Messaging is absent because no WhatsApp route is
confirmed. Membership pricing sends visitors to the phone.

## The motion layer

| Where | What moves |
|---|---|
| On load | Headline rises line by line from its own baseline; the clock plate scales in; lede and actions rise 100 ms apart |
| Every page head | Eyebrow, headline, lede and rule arrive in sequence |
| Quick facts | Figures roll digit by digit when the row arrives, staggered left to right |
| Band | A marquee, paused on hover and whenever it is off screen |
| Section headings | Resolve line by line, not as one block |
| Lists and copy | Staggered children, 70 ms apart |
| The map | The route from the chowk to the door draws itself, then the marker pulses once |
| Index cards | Arrow lifts on hover; colour shifts, the card never moves |
| FAQ | Answers expand; the +/− indicator rotates into a minus |
| Header | Turns solid on scroll, and inverts while the dark closing section sits under it |
| Between pages | `@view-transition` where the browser supports it |

**Gating.** Every hidden state lives behind `html.anim`, a class `app.js` adds only after its observers
exist, and the hero's load sequence sits behind `html.fonts` so lines rise in the real typeface rather
than mid-font-swap. With no script, a slow script or a broken one, every page is complete and readable.
A 3-second watchdog drops the gate if nothing has revealed itself.

**Reduced motion** is not zero motion: travel goes, while colour, the −/+ state and the figures' final
values stay. Verified: 0 running animations, nothing left hidden.

No animation library, no scroll hijack, one rAF-throttled scroll handler, and the clock ticks on the
minute boundary rather than every second.

## Bugs found and fixed

First pass (single page):

- **Rating values were hidden from assistive technology** — both scores carried `aria-hidden="true"`, so a screen reader heard "out of 5 on Google" with no number.
- **Every hero line was invisible under `prefers-reduced-motion`** — the override was weaker than the rule that hid it. Selectors now match.
- **Stacked digits leaked into `innerText`** — glyphs are drawn by CSS `content: attr(data-d)`; the headline carries its own stable sentence.
- **The FAQ indicator disappeared** — a colour is not a valid `background` image layer. Rebuilt as two elements.
- **The masthead could stay dark on a pale section** — an IntersectionObserver only fires on change; now computed per frame from scroll position.
- **Anchors landed under the sticky header** — `scroll-margin-top` was 0.
- **`overflow-x: hidden` would have broken the sticky header** — it makes the root a scroll container; `clip` does not.
- **The clock tumbled from `00:00` on first paint** — the plate now lands already correct.
- **A review score measured 6 lines** — a grid row stretched the heading box; `align-items: start` fixed both.

Second pass (multi-page rebuild):

- **The clock vanished on the home page.** `animation: var(--animate-clock-land) 640ms … forwards` repeated the duration and easing that the variable already contained, so the shorthand was invalid and the plate stayed at `opacity: 0`. Same mistake in the map halo. Both now set only the delay on top of the token.
- **Ascenders were shaved off every display heading.** Leading is tighter than the glyph height (0.9), and the line masks clipped at the box edge, so `AR Smart Library` lost its tops. The masks now carry `padding-block` with matching negative margins, which grows the clip area without moving the layout.
- **The page's arrow was a missing glyph.** `↗` is not in the Latin subset of the font and rendered as a fallback dash. Replaced with a drawn SVG.
- **Two regions shared one accessible name** on the location page — the page head and the closing section were both labelled "Find the stairs beside the sweets", so axe's `landmark-unique` failed. The closing section now says something else.
- **The membership card's eyebrow measured 3.92:1** on moss. Raised to `text-bone/90`; axe now passes at 1440/768/390.
- **The no-JS headline read "is open at any hour any hour of the night or day"** — the visually hidden extension of the sentence now starts with a comma, so the accessible name is "AR Smart Library is open at any hour of the night or day".
- **The compact menu's panel started behind the header** (68 px against a 66 px header) — offset corrected; Escape and outside clicks close it.
- **A card at `bg-sand-deep` on a `bg-sand-deep` section was invisible** — cards sit one step lighter than the section they're on.

## Verification

Measured in headless Chromium against the built `dist/`, at 1440, 768 and 390:

- axe-core, `wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa`/`best-practice`: **0 violations on all seven pages at all three widths**
- 0 console errors, 0 failed requests, 0 horizontal overflow
- every heading renders exactly two lines, one `<h1>` per page
- every internal link resolves under the real `/library/` prefix; canonical, description and two JSON-LD blocks per page
- scrolling reveals all 20 targets on the home page; the header inverts over the closing field
- **no JavaScript**: clock reads "any hour", hero untransformed, nothing hidden
- **reduced motion**: 0 running animations, nothing hidden, band static
- `/library/404.html` served from the production prefix resolves every asset
- the Vercel copy serves all seven pages, `styles.css`, `sitemap.xml` and a custom 404 at the site root, with canonical URLs and sitemap entries pointing at `https://arsmartlibrary-psi.vercel.app/`

Not done, and not claimed: no real photographs; the skills' `inspect.mjs` needs a full interactive
Chrome, which this environment does not have; and page transitions only exist in browsers that
implement `@view-transition`.

## Deploying

The site is published to two hosts from the same sources. Neither needs a local rebuild.

### GitHub Pages — automatic

Push to `main`. `.github/workflows/pages.yml` installs the two dev dependencies, runs the build,
checks that the output contains the pages and no unfilled `{{tokens}}`, and publishes `site/dist` to
GitHub Pages. No manual step, no redeploy to remember.

The workflow lives at the repository root because Actions only reads `.github/workflows/` there.
Build defaults are the Pages ones: `SITE_URL=https://shogun-support-99.github.io/library/`,
`BASE_PATH=/library/`.

### Vercel — https://arsmartlibrary-psi.vercel.app/

**Automatic.** The project `arsmartlibrary` (team *Eagle*) is connected to
`shogun-support-99/library` through the Vercel GitHub App, with the production branch `main` and the
root directory `site`. A push to `main` deploys both hosts: Pages from the Actions workflow, Vercel
from its own Git integration.

Settings, which are also what `site/vercel.json` asks for:

| Setting | Value | Why |
|---|---|---|
| Root Directory | `site` | the site has its own `package.json` and build script |
| Install Command | `npm ci` | Tailwind is a dev dependency of `site/` |
| Build Command | `npm run build` | `node build.mjs` |
| Output Directory | `dist` | generated, git-ignored |
| Framework | Vite | keeps Vercel from guessing; the build command is ours |
| `SITE_URL` | `https://arsmartlibrary-psi.vercel.app/` | canonical URLs, Open Graph, sitemap |
| `BASE_PATH` | `/` | links resolve from the domain root, not `/library/` |

`arsmartlibrary.vercel.app` — the name without the suffix — belongs to another Vercel account, so
this project got `-psi`. A shorter address needs a custom domain pointed at the project.

**Analytics.** Vercel Web Analytics is switched on for the project. `build.mjs` injects
`/_vercel/insights/script.js` only when it is running on Vercel (`process.env.VERCEL`), because that
path does not exist on GitHub Pages and a 404 on every page is worse than no analytics. The Pages
build stays script-free.

**Short URLs.** Vercel redirects extensionless paths (`/about`, `/location`, …) to the real pages
with a permanent redirect, so a typed or shared link still lands. Canonical URLs stay on `.html`,
which is the only shape GitHub Pages can serve.
