# Skills

Procedural workflows for agents, one directory per skill (`<name>/SKILL.md`). Invariants live in `CLAUDE.md`, commands and setup in `README.md`, the primitive API in `src/components/blog/README.md` — skills link to those rather than restating them.

- `write-post` — scaffold with `npm run new-post`, write MDX with the shared primitives, validate/build; leaves `draft: true`.
- `create-series` — add an entry to `src/config/series.ts` (or via `/admin/`), optionally scaffold part 1.
- `create-visual` — SVG → HTML/CSS → post-local React island decision tree, with the accessibility checklist.
- `review-post` — automated gates + read-through + visual pass; outputs a findings list.
- `publish-post` — `draft: false`, dates, full checks, commit, push `main`, verify live.
