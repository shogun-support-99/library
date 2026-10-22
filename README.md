# library

A vendored collection of agent skills. Each skill is checked in at its upstream payload, unmodified, with the source commit recorded so it can be audited or re-synced.

## Contents

| Skill | Folder | Upstream | Version | License | What it's for |
|---|---|---|---|---|---|
| **impeccable** | [`skills/impeccable/`](skills/impeccable/) | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | 4.7.0 | Apache-2.0 | Design direction for AI-built interfaces: 24 commands (`craft`, `critique`, `audit`, `polish`, `bolder`, `quieter`, `distill`, `animate`, …), 61 deterministic detector rules, and live browser iteration. |
| **taste-skill** (`design-taste-frontend`) | [`skills/taste-skill/`](skills/taste-skill/) | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | v2 | MIT | Anti-slop art direction for marketing pages and app screens, distilled from 247 curated gallery sites. Deals a researched direction, enforces a no-ornament house style, then inspects its own render in a real browser. |

Both are frontend/design skills and overlap in intent. Rough split: **impeccable** is the broader toolbox (auditing, polishing, harden, onboarding, native iOS/Android, design-system docs); **taste-skill** is the sharper opinionated one for taking a blank page to a designed landing page or app screen.

## Install

Link a skill into your agent's skill directory:

```bash
./install.sh                 # project-local ./.claude/skills
./install.sh --user          # ~/.claude/skills
./install.sh --all-agents    # ~/.claude/skills and ~/.codex/skills
./install.sh impeccable      # just one skill
./install.sh --list          # install names
./install.sh --uninstall     # remove the links
```

Links point back into this repo, so `git pull` updates installed skills in place. Use `--copy` if your environment has no symlinks.

Installed directories are named from each `SKILL.md` frontmatter, so taste-skill installs as `design-taste-frontend`.

## Requirements

- **impeccable**: `scripts/impeccable` is a POSIX shell launcher for a self-contained binary it downloads once on first run (no Node). The live-browser commands also need a Chromium-family browser.
- **taste-skill**: Node 22+ and an installed Chrome, Edge, or Chromium. `scripts/assets.mjs` needs network access; neither skill needs an API key.

## Layout

```
skills/
  impeccable/
    SKILL.md          entry point, modes, and command routing
    reference/        42 playbooks — one per command plus mode/craft-floor/native refs
    agents/           subagent definitions (asset producer, documenter, finish reviewer, …)
    scripts/          launcher, live-browser bundles, command metadata, font index
    LICENSE  NOTICE.md  PROVENANCE.json
  taste-skill/
    SKILL.md          entry point and the four-step run
    references/       11 topic files — colour, type, layout, motion, imagery, copy, tells, …
    library/          9 JSON libraries dealt by the draw script (directions, heroes, palettes, …)
    scripts/          draw / assets / inspect / lint / scenes
    assets/           base CSS, chart and stage primitives
    evals/            eval fixtures
    LICENSE  README.md  PROVENANCE.json
```

## Provenance

Every skill folder carries a `PROVENANCE.json` with the upstream URL, the exact commit vendored, the version, and the download date. Upstream files are otherwise untouched.

Where upstream ships multiple byte-identical copies for different agents (impeccable has ~20: `.claude/`, `.cursor/`, `.gemini/`, `plugin/`, …), only the canonical `.agents/` payload is vendored. The copies differ solely in frontmatter and fallback paths.

## Licenses

Each skill keeps its own `LICENSE` inside its folder: impeccable is Apache-2.0 (with third-party notices in `NOTICE.md`), taste-skill is MIT. Those terms govern the vendored content.
