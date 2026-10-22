# library

**Live site:** [AR Smart Library — 24-hour reading library in Namkum, Ranchi](https://shogun-support-99.github.io/library/) · [skills](#contents)

Agent **skills for AI coding agents** (design and frontend), vendored at their upstream payload, unmodified, with the source commit recorded so they can be audited or re-synced. The website for AR Smart Library lives in [`site/`](site/) and deploys from this repository.

**9 skills from 3 upstream repos.** All are frontend/design oriented; they overlap in intent and are meant to be mixed, not installed as one system.

## The site

[![AR Smart Library — open 24 hours, Sadabahar Chowk, Namkum](https://img.shields.io/badge/live-AR%20Smart%20Library-4f6238?style=for-the-badge)](https://shogun-support-99.github.io/library/)

A single static page for a 24-hour reading library at Sadabahar Chowk, Namkum, Ranchi, built on the sentence *"AR Smart Library is open at ⟨time⟩"* with the time **live in the headline**. No build step, no dependencies, no tracking, self-hosted typeface.

Every push to `main` redeploys it automatically via [`.github/workflows/pages.yml`](.github/workflows/pages.yml), so there is no manual deploy step to remember. What the page says and how to edit it: [`site/README.md`](site/README.md).

## Contents

### impeccable — [pbakaus/impeccable](https://github.com/pbakaus/impeccable) · v4.7.0 · Apache-2.0

[`skills/impeccable/`](skills/impeccable/) · commit `8644175`

Design direction for AI-built interfaces. 24 commands (`craft`, `critique`, `audit`, `polish`, `bolder`, `quieter`, `distill`, `animate`, `harden`, `onboard`, …), 42 reference playbooks, 61 deterministic detector rules, and live browser iteration. The broadest toolbox here: auditing, polishing, edge cases, design-system docs, native iOS/Android. Runs from a shell launcher that fetches a self-contained binary — no Node.

### taste-skill — [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) · v2 · MIT

[`skills/taste-skill/`](skills/taste-skill/) · installs as **`design-taste-frontend`** · commit `6010f91`

Anti-slop art direction distilled from 247 curated gallery sites. Deals one of 20 researched directions (idea, composition, type, palette, photographs, section blueprints), enforces a no-ornament house style, then inspects its own render in a real browser at 1440/768/390. The sharpest opinionated option for blank page → designed landing page or app screen. Needs Node 22+ and Chrome/Edge/Chromium.

### UI/UX Pro Max bundle — [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) · v2.15.0 · MIT

commit `623a9a9` · one upstream repo shipping seven skills, vendored flat so each installs on its own:

| Skill | Folder | What it's for |
|---|---|---|
| **ui-ux-pro-max** | [`skills/ui-ux-pro-max/`](skills/ui-ux-pro-max/) | The core: a searchable local database of 79 styles, 192 product palettes with reasoning profiles, 74 font pairings, 119 UX guidelines, 105 icons, 17 GSAP presets, 25 chart types and 22 tech stacks. Python search CLI over CSV. |
| **design** | [`skills/design/`](skills/design/) | The umbrella: brand identity, tokens, UI styling, logo generation (55 styles), corporate identity programs, HTML presentations, banners, icons. Largely subsumes `banner-design` and overlaps `design-system`. |
| **design-system** | [`skills/design-system/`](skills/design-system/) | Three-layer token architecture (primitive → semantic → component), component specs, CSS variables, spacing/typography scales, strategic decks. |
| **ui-styling** | [`skills/ui-styling/`](skills/ui-styling/) | shadcn/ui + Radix + Tailwind implementation, plus canvas-based visual design. Ships 54 OFL fonts with their license files under `canvas-fonts/`. |
| **brand** | [`skills/brand/`](skills/brand/) | Brand voice, visual identity, messaging frameworks, asset management, consistency checks. |
| **banner-design** | [`skills/banner-design/`](skills/banner-design/) | Banners for social, ads, heroes and print; 22 styles across platform-specific sizes. |
| **slides** | [`skills/slides/`](skills/slides/) | HTML presentations with Chart.js, design tokens and responsive layouts. |

## Install

Link a skill into your agent's skill directory:

```bash
./install.sh                 # project-local ./.claude/skills
./install.sh --user          # ~/.claude/skills
./install.sh --all-agents    # ~/.claude/skills and ~/.codex/skills
./install.sh impeccable      # just one skill
./install.sh ui-ux-pro-max brand   # or several
./install.sh --list          # install names
./install.sh --uninstall     # remove the links
```

Links point back into this repo, so `git pull` updates installed skills in place. Use `--copy` if your environment has no symlinks.

Installed directories are named from each `SKILL.md` frontmatter, so taste-skill installs as `design-taste-frontend`. Folder names match upstream otherwise.

## Requirements

- **impeccable**: no runtime needed; the launcher downloads its binary once. Live-browser commands need a Chromium-family browser.
- **taste-skill**: Node 22+, Chrome/Edge/Chromium, network for `assets.mjs`. No API keys.
- **ui-ux-pro-max**: Python 3 for `scripts/search.py` and the data validators; no extra packages for search. `ui-styling` has a `requirements.txt` for its canvas work, and the `.cjs`/`.py` token and slide scripts want Node.
- **brand / design-system**: Node for the `.cjs` token scripts, Python for the slide and validation scripts.

## Layout

```
skills/
  impeccable/        SKILL.md, reference/ (42), agents/ (4), scripts/, LICENSE, NOTICE.md
  taste-skill/       SKILL.md, references/ (11), library/ (9 JSON), scripts/, assets/, evals/
  ui-ux-pro-max/     SKILL.md, data/ (12 domain CSVs + 22 stack CSVs), references/, scripts/ (Python)
  design/            SKILL.md, data/, references/, scripts/ (cip, icon, logo)
  design-system/     SKILL.md, data/, references/, scripts/, templates/
  ui-styling/        SKILL.md, references/, scripts/, canvas-fonts/ (54 TTF + OFL)
  brand/             SKILL.md, references/, scripts/, templates/
  banner-design/     SKILL.md, references/
  slides/            SKILL.md, references/
```

Each folder is self-contained and portable: `SKILL.md` plus whatever it needs, its upstream `LICENSE`, and a `PROVENANCE.json`.

## Provenance

Every skill folder carries a `PROVENANCE.json` with the upstream URL, the exact commit vendored, the version, and the download date. Upstream files are otherwise untouched.

Two sizing decisions were made while vendoring:

- **impeccable** ships ~20 byte-identical copies for different agents (`.claude/`, `.cursor/`, `.gemini/`, `plugin/`, …) differing only in frontmatter and fallback paths. Only the canonical `.agents/` payload is vendored; keeping the rest would have added ~45 MB of duplication.
- **UI/UX Pro Max** also ships a subset copy under `cli/assets/skills` for its npm installer, missing `ui-styling/canvas-fonts` and all of `ui-ux-pro-max`. The `.claude/skills` payload is canonical and is what is vendored. One upstream test artifact (`ui-styling/scripts/.coverage`) was dropped.

## Licenses

Each skill keeps its own `LICENSE` inside its folder: impeccable is Apache-2.0 (third-party notices in `NOTICE.md`), taste-skill and the UI/UX Pro Max bundle are MIT. The 54 fonts in `ui-styling/canvas-fonts/` are OFL, each with its license file alongside. Those terms govern the vendored content.
