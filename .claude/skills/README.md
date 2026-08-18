# Skills

Procedural workflows for agents, one directory per skill (`<name>/SKILL.md`). Invariants live in `CLAUDE.md`, commands and setup in `README.md`, the primitive API in `src/components/blog/README.md` — skills link to those rather than restating them.

- `write-post` — scaffold with `npm run new-post`, write MDX with the shared primitives, validate/build; leaves `draft: true`.
- `create-series` — add an entry to `src/config/series.ts` (or via `/admin/`), optionally scaffold part 1.
- `create-hero` — hand-write `hero.svg`, rasterise with `npm run render-hero`, set a real alt.
- `create-visual` — Mermaid → SVG → HTML/CSS → post-local React island decision tree; VizFigure classify/wrap/name-and-summary rules and the visual a11y mistakes table.
- `review-post` — automated gates + read-through + visual pass; outputs a findings list.
- `publish-post` — `draft: false`, dates, full checks, commit, push `main`, verify live.
- `wrapup` — whole-site audit before shipping: gates, grep sweeps for contract drift, a11y/motion/theme/responsive checklist, docs sync.
