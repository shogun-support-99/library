# GitHub profile — the six things that need a click

Everything on this page is a field or a toggle that GitHub only exposes in the web UI (or behind a
token with `user` scope, which this repository's automation does not have). Each block is copy-paste
ready. Nothing here changes the site.

**Why it cannot be automated:** the token used in this repo can read and write repository *contents*
and open pull requests. It cannot edit a user profile, create a repository, or change repo metadata —
GitHub answers `403 Resource not accessible by integration` for all of those. So the text is prepared
here and the last step is yours. It takes about three minutes.

---

## 1. Profile README — the big one

A profile README appears on <https://github.com/shogun-support-99> above the pinned repositories. It
lives in a repository with **exactly the same name as the username**.

1. Create a new **public** repository named `shogun-support-99`. Tick *Add a README file*.
2. Replace its `README.md` with the contents of [`README.md`](README.md) in this folder.
3. Commit.

That single step does most of the makeover: a headline, a one-line positioning statement, live badges
for all three projects, a project table, and a short "how I work".

## 2. Profile fields

| Field | Value |
|---|---|
| **Name** | your real name, or `Shogun` — whichever you want on a business card. It is currently empty, so the profile shows only the handle. |
| **Bio** (160 char max) | `Static sites and offline-first web apps. Currently: AR Smart Library, a 24-hour reading room in Ranchi.` |
| **Website** | `https://arsmartlibrary-psi.vercel.app/` |
| **Location** | `Ranchi, Jharkhand, India` |
| **Social links** | add the Vercel deployment if you want a second link; there is no public email or social account connected to this account, so leave the rest empty rather than inventing them |

Set them at <https://github.com/settings/profile>.

## 3. Pin the right repositories

<https://github.com/shogun-support-99> → *Customize your pins* → pick these three, in this order:

1. `library` — AR Smart Library (the newest work, and the one with a live commercial site)
2. `Fitness-REA` — REA Fit
3. `fitness` — IronLog

Leave *Include private contributions* alone unless you want the activity graph to look busier.

## 4. Repository metadata

None of the three has a description set, which is why they read as bare names on the profile. Paste
these into each repo's **About** panel (gear icon, top right) — description first, then topics.

**`library`**

- Description: `Website for AR Smart Library, a 24-hour reading library in Namkum, Ranchi — seven pages, Tailwind v4, zero framework.`
- Website: `https://arsmartlibrary-psi.vercel.app/` *(already set)*
- Topics: `tailwindcss` `static-site` `github-pages` `vercel` `accessibility` `seo` `eleventy-alternative`

**`Fitness-REA`**

- Description: `REA Fit — a free, open-source workout tracker with a body map, offline storage and an Android build.`
- Website: `https://shogun-support-99.github.io/Fitness-REA/`
- Topics: `typescript` `workout-tracker` `fitness` `open-source` `pwa` `android` `offline-first`

**`fitness`**

- Description: `IronLog — a strength training log that keeps your data on your device and works offline.`
- Website: `https://shogun-support-99.github.io/fitness/app/`
- Topics: `javascript` `fitness` `offline-first` `local-first` `static-site`

## 5. Social preview card

The link card people see when this repo is shared. For `library`, upload
[`site/assets/og-image.png`](../../site/assets/og-image.png) — 1200 × 630, already the site's own
share image, so the card and the site match.

<https://github.com/shogun-support-99/library/settings> → *Social preview* → *Edit* → upload.

## 6. Optional polish

- **`.github` repository.** Create a public repo called `.github` with
  [`profile/README.md`](README.md) in it as well; GitHub falls back to that file for the profile if the
  same-named repo is ever missing.
- **Profile card.** If you want a generated stats card later, add it below the badges — but a profile
  with three real links reads better than one with five auto-generated widgets.

---

## What is already done

- This repository's front page ([`README.md`](../../README.md)) was rewritten: it now opens with the
  live site, the page map and the build, and keeps the vendored skills below as a second section.
  The old version still described the first single-page build, claimed "no build step, no
  dependencies, no tracking", and had no mention of Vercel — all of which stopped being true.
- The `library` Website field already points at the Vercel deployment.
- Both deploy targets are automatic: GitHub Pages on every push to `main`, Vercel on its own Git
  integration.
