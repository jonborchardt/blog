# Skills

Procedural workflows for agents live here, one directory per skill (`<name>/SKILL.md`).

Planned skills (not yet written):

- `write-post` — create `src/content/posts/<slug>/index.mdx` with valid frontmatter; when in a series without an explicit order, assign `seriesOrder = max(existing) + 1`
- `create-visual` — author an SVG or React island colocated with a post
- `create-series` — add an entry to `src/config/series.ts`
- `review-post` — check content contracts, accessibility, links, SEO metadata
- `publish-post` — set `draft: false`, run `npm run validate` and `npm run build`

Repository invariants live in `CLAUDE.md`; keep skills procedural.
