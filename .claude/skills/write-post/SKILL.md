---
name: write-post
description: Create a new blog post as a draft — scaffold with `npm run new-post`, write MDX using the shared primitives, colocate images/components, then validate and build. Use when asked to write, draft, or add a post/article.
---

# write-post

Invariants are in `CLAUDE.md`; component API is in `src/components/blog/README.md`. This skill is the procedure.

## Inputs to settle first

- **slug** (kebab-case; becomes `/<slug>/`), **title**, **description** (40–160 chars: a good search snippet), **tags** (ids from `src/config/tags.ts`), optional **series** (id from `src/config/series.ts`; the scaffold assigns `seriesOrder = max(existing published) + 1`). Need a new tag/series? Add it to the registry first (`create-series` for a series).

## Steps

1. Scaffold: `npm run new-post -- <slug> --title "…" [--series <id>] [--tags a,b]`. It refuses reserved/duplicate slugs and unknown series/tags with a fix message. The post starts as `draft: true`; leave it that way.
2. Write `src/content/posts/<slug>/index.mdx`:
   - Real prose for a technical reader; open with why it matters; body headings start at `##` and never skip levels.
   - Use primitives from `src/components/blog/README.md` (import at the top) only where the writing calls for them; no per-post styling.
   - Images: put files in the post directory, use `![meaningful alt](./file.png)` (raster) or `<img>` with width/height/alt for SVG; `Figure` for captions/wide.
   - Internal links are root-relative (`/other-post/`, `/about/`); the build prefixes the base and fails on broken links.
   - Diagrams: `mermaid` fences with `accTitle`/`accDescr`; math: `$…$` / `$$…$$`.
   - Interactive bits: `create-visual` (SVG first; a React island only when it must respond to the reader).
3. Fix the frontmatter description placeholder; `title` ≤ 90 chars.
4. `npm run validate && npm run build` — the build tells you exactly what to fix (schema, unknown tag/series, duplicate order, broken link, missing alt, description length).
5. Look at it: `npm run dev` → `http://localhost:4321/blog/<slug>/` (drafts show only in dev), or `node e2e/shots.mjs <outdir> <slug>/` against a preview for 360/1280 × light/dark screenshots.
6. Hand off to `review-post`. Publishing (`draft: false`, dates, push) is `publish-post`.

## Don'ts

- Don't set `draft: false` here. Don't hardcode `/blog/`. Don't add dependencies for one post. Don't invent tags outside the registry.
