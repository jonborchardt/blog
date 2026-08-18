---
name: write-post
description: Use when asked to write, draft, or add a post/article. Produces the complete draft — prose, its own diagrams/charts/schematics, hero, validated build — with no further prompting.
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
   - Internal links are root-relative (`/other-post/`, `/series/`); the build prefixes the base and fails on broken links.
   - Diagrams: `mermaid` fences with `accTitle`/`accDescr`; math: `$…$` / `$$…$$`.
3. **Visual pass — mandatory, no sign-off needed.** Re-read the finished prose and add every visual that earns its place; build each with `create-visual` (its ladder picks the medium — Mermaid → SVG → HTML/CSS → island; do not default to React). Do this even when the author only asked for text.
   - Candidates, by what the prose is doing:
     | The paragraph…                                                                                                 | Visual                                                                |
     | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
     | walks a data flow, pipeline, or type/unit boundary (A → B → C, "only here does X become Y")                    | Mermaid `flowchart` with the boundary marked                          |
     | describes states/modes and what moves between them (first fix, retries, gates, pause/resume)                   | Mermaid `stateDiagram-v2`                                             |
     | makes a quantitative claim ("grows with", "~7 digits", "jitters by metres", numbers a reader must reconstruct) | static SVG chart of the real function/values, `VizFigure` with `data` |
     | explains a spatial or geometric idea (mesh vs ray-cast, coordinate frames, layouts)                            | bespoke schematic SVG, no data table                                  |
     | compares two approaches side by side                                                                           | two-panel SVG or `Comparison`                                         |
   - Reject candidates that restate an adjacent screenshot, list, or stat line ("8 files, 1 dep" is a sentence, not a chart).
   - When the post describes code, check every diagram against the source (states, thresholds, order of operations) before drawing it — a plausible-looking wrong diagram is worse than none.
   - Placement: after the paragraph it illustrates; never inside a list item (put it after the list). Fix overlapping labels before moving on (view at 1280 and 360, both themes).
   - Typical yield for a technical post is 2–4 visuals; zero means the pass was skipped, not that nothing qualified.
4. Fix the frontmatter description placeholder; `title` ≤ 90 chars.
   Hero: unless the author handed you an image, use `create-hero` (draw `hero.svg`, `npm run render-hero -- <slug>`, real alt). Never leave the grey placeholder.
5. `npm run validate && npm run build` — the build tells you exactly what to fix (schema, unknown tag/series, duplicate order, broken link, missing alt, description length).
6. Look at it: `npm run dev` → `http://localhost:4321/blog/<slug>/` (drafts show only in dev), or `node e2e/shots.mjs <outdir> <slug>/` against a preview for 360/1280 × light/dark screenshots.
7. Hand off to `review-post`. Publishing (`draft: false`, dates, push) is `publish-post`.

## Don'ts

- Don't set `draft: false` here. Don't hardcode `/blog/`. Don't add dependencies for one post. Don't invent tags outside the registry.
