---
name: write-post
description: Use when asked to write, draft, or add a post/article, or to revise/improve/expand an existing one. Produces the complete draft — prose, its own diagrams/charts/schematics, hero, validated build — with no further prompting.
---

# write-post

Invariants are in `CLAUDE.md`; component API is in `src/components/blog/README.md`. This skill is the procedure.

## Inputs to settle first

- **slug** (kebab-case; becomes `/<slug>/`), **title**, **description** (40–160 chars: a good search snippet), **tags** (ids from `src/config/tags.ts`), optional **series** (id from `src/config/series.ts`; the scaffold assigns `seriesOrder = max(existing published) + 1`), and **authority** (path to the repository that is authoritative for this post's domain facts). Need a new tag/series? Add it to the registry first (`create-series` for a series).
- `authority` is required for a new technical/project post. Put it in `index.mdx` frontmatter. Example: `authority: 'F:\github\retire-sim'`.

## Authority

This section is the shared contract; `create-visual`, `create-hero`, and `review-post` reference it rather than restating it.

When `authority` is present, treat that repository as the **domain expert**, not merely a fact-checking source. It owns domain truth and domain judgment: what the story actually is, what matters and what is misleading, behavior, terminology, data meaning, technical claims, evidence, caveats, and the semantics of every visual. The blog repo owns the artifact: structure, prose, MDX/React implementation, visual design, accessibility, and presentation. The expert agent operates inside the authority repo — it inspects its repo-local `CLAUDE.md`, source, tests, docs, data, experiments, and instructions as relevant, and makes domain decisions rather than merely returning files. When the repo's own docs and its code disagree, **code wins**: verify claims against code (or by running it) and note the doc staleness in the brief. Do not independently reinterpret implementation details it can inspect.

Expert-call lifecycle for a normal post — maximize information per call:

1. **One substantial investigation pass** (step 2 below) producing a **domain brief**, saved to `src/content/posts/<slug>/research/brief.md`, that everything downstream works from.
2. Blog side writes prose, builds visuals and hero from the brief — no expert calls for anything the brief covers.
3. **One validation pass** on the substantially finished draft (`review-post`).
4. Blog side fixes findings.

An additional call is justified only when genuinely needed: the expert flagged an ambiguity, authoritative data wasn't available at brief time, implementation surfaces a new domain question, or a correction materially changes a claim or visual. The expert may satisfy a data or asset need by running the authority repo's own tooling (renders, pinned metric/simulation runs) rather than only reading files — record the reproduction commands in the brief. Never send the expert styling, spacing, typography, responsive layout, theme usage, accessibility mechanics, or MDX/component conventions — those are blog-side.

## Steps

1. Scaffold: `npm run new-post -- <slug> --title "…" [--series <id>] [--tags a,b]`. It refuses reserved/duplicate slugs and unknown series/tags with a fix message. The post starts as `draft: true`; leave it that way. Add the required `authority` field to the post frontmatter.
   **Revising an existing post:** skip this step; add `authority` to its frontmatter if missing, and the published post is the author material for step 2 — everything else (brief, visual pass, review) is the same. If `research/brief.md` already exists, work from it and re-ask the expert only for what it doesn't cover.
2. If `authority` is set (any technical/project post), delegate one substantial investigation to the authority agent before writing (see Authority). Give it the author's material (outline, notes, or draft) and ask for a **domain brief**: the strongest overall story and what is surprising or worth emphasizing; the important technical ideas; factual corrections and missing context in the supplied material; key terminology and caveats; which claims deserve evidence, with that evidence; and its proposed visuals — for each quantitative one, all authoritative data and semantics needed to build it correctly (values, units, what each axis/series means, thresholds); for each conceptual one, the states, relationships, ordering, transitions, and caveats. Save the brief verbatim to `src/content/posts/<slug>/research/brief.md` — it is committed with the post (the repo is public: nothing in it you wouldn't publish) and is what visuals, hero, and review work from instead of re-asking; a later targeted expert answer gets appended there too. Then write `src/content/posts/<slug>/index.mdx`:
   - Real prose for a technical reader; open with why it matters; body headings start at `##` and never skip levels.
   - The authority repo keeps moving after publication. Avoid phrasing that a routine repo change falsifies: exact counts of growing things, "the most recent X", predictions of the repo's next step. Hedge ("at last count", "one of the later") or state the target/mechanism instead of the tally; caption screenshots of a living app as dated snapshots.
   - Use primitives from `src/components/blog/README.md` (import at the top) only where the writing calls for them; no per-post styling.
   - Images: put files in the post directory, use `![meaningful alt](./file.png)` (raster) or `<img>` with width/height/alt for SVG; `Figure` for captions/wide.
     Large rasters and sweep/side-by-side comparisons go in `<Figure zoom>` with a direct `<img>` child so readers can open them full-size; never `zoom` around `VizFigure` or islands.
   - Internal links are root-relative (`/other-post/`, `/series/`); the build prefixes the base and fails on broken links.
   - Diagrams: hand-drawn pictorial SVGs in the post directory, wrapped in `VizFigure` (design language and verification in `create-visual` — never a `mermaid` fence, the build doesn't render them); math: `$…$`.
3. **Visual pass — mandatory, no sign-off needed.** Re-read the finished prose and add every visual that earns its place; build each with `create-visual` (its ladder picks the medium — pictorial SVG → SVG chart → HTML/CSS → island; do not default to React). Do this even when the author only asked for text.
   - Candidates, by what the prose is doing:
     | The paragraph…                                                                                                 | Visual                                                                |
     | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
     | walks a data flow, pipeline, or type/unit boundary (A → B → C, "only here does X become Y")                    | pictorial SVG with the boundary marked (rail line, funnel, gates…)    |
     | describes states/modes and what moves between them (first fix, retries, gates, pause/resume)                   | pictorial SVG of the states as stations/scenes with labeled moves     |
     | makes a quantitative claim ("grows with", "~7 digits", "jitters by metres", numbers a reader must reconstruct) | static SVG chart of the real function/values, `VizFigure` with `data` |
     | explains a spatial or geometric idea (mesh vs ray-cast, coordinate frames, layouts)                            | bespoke schematic SVG, no data table                                  |
     | compares two approaches side by side                                                                           | two-panel SVG or `Comparison`                                         |
   - Reject candidates that restate an adjacent screenshot, list, or stat line ("8 files, 1 dep" is a sentence, not a chart).
   - Start from the brief's proposed visuals, then add any the table above surfaces. When the post describes code, check every diagram against the domain brief (or the source) before drawing it — a plausible-looking wrong diagram is worse than none; ask the expert only about a candidate the brief doesn't cover.
   - Placement: after the paragraph it illustrates; never inside a list item (put it after the list). Every visual scales to fit — no `overflow-x-auto` wrapper, no `min-w-*`, no horizontal scrollbar at 360px (redraw narrower/taller instead). Fix overlapping labels before moving on (view at 1280 and 360, both themes).
   - Typical yield for a technical post is 2–4 visuals; zero means the pass was skipped, not that nothing qualified.
4. Fix the frontmatter description placeholder; `title` ≤ 60 chars (it is the post's entire `<title>` — no site-name suffix on articles).
   Hero: unless the author handed you an image, use `create-hero` (draw `hero.svg`, `npm run render-hero -- <slug>`, real alt). Never leave the grey placeholder.
5. `npm run validate && npm run build` — the build tells you exactly what to fix (schema, unknown tag/series, duplicate order, broken link, missing alt, description length).
6. Look at it: `npm run dev` → `http://localhost:4321/blog/<slug>/` (drafts show only in dev), or `node e2e/shots.mjs <outdir> <slug>/` against a preview for 360/1280 × light/dark screenshots.
7. Hand off to `review-post`. Publishing (`draft: false`, dates, push) is `publish-post`.

## Don'ts

- Don't set `draft: false` here. Don't hardcode `/blog/`. Don't add dependencies for one post. Don't invent tags outside the registry.
