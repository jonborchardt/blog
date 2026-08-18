---
name: create-hero
description: Use for every post's hero image unless the author explicitly supplied one — after scaffolding a new post, when `hero.png` is still the grey placeholder (its alt may already be rewritten; check the file, not the alt), or when asked for a bespoke, generated, or SVG hero.
---

# create-hero

The default way a post gets its hero: no hero was handed over → draw one. Author `hero.svg` next to `index.mdx`, rasterise it to `hero.png` (the contract in `CLAUDE.md`: 1200×630, meaningful alt), and keep the SVG as the editable source. No image model, no browser — `npm run render-hero` uses resvg, already a dependency.

## Steps

1. **Read the post** (title, description, first section). Pick ONE concrete visual metaphor for its main idea — a mechanism, not decoration (a post about islands → small hydrated blocks in a sea of static; a post about pipelines → stages joined by arrows). Write it down as the alt text first: one sentence describing what the picture shows. If you can't write that sentence, the idea is not concrete enough.
2. **Write `src/content/posts/<slug>/hero.svg`** by hand:
   - `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">`; add `<title>` matching the alt.
   - Palette: only the hex values in `src/styles/theme.ts` (raster twins of the site theme — a PNG cannot read CSS variables): `bg` background, `fg` ink, `primary`, `accent` fills, `border`, `highlight`. Read that file; do not invent or eyeball colours, so listings look like one site. Invert (ink background) only when the subject is literally dark (night sky, terminal); a series may pick its own highlight.
   - Shapes over text. At most a few short labels (`font-family="IBM Plex Sans"` — the only font the renderer loads; system fonts are off). No external refs, `<image>`, `<foreignObject>`, CSS classes, or scripts (resvg renders none of them).
   - Keep the important content inside the centre 1000×500 — listings crop the card at ~16:9 and PostList shows it small.
   - Keep every shape near the viewBox: a huge circle centred far off-canvas under a clipPath makes resvg panic (draw an arc with `A` instead).
   - Aim for < 8 KB; use `<use>`/`<g transform>` for repetition.
3. **Render**: `npm run render-hero -- <slug>` (fails with the reason if `hero.svg` is missing or not 1200×630). Overwrites `hero.png`.
4. **Frontmatter**: replace `hero.alt` with the sentence from step 1 (never "hero image", never the title).
5. **Look at it**: open `hero.png` (Read tool) and check the metaphor reads at thumbnail size and nothing sits on the edges. Iterate on the SVG, re-render.
6. `npm run validate && npm run build`.

## Notes

- Do not point `hero.src` at the `.svg`: search-index converts heroes to WebP and OG/listing paths assume a raster. The PNG is the hero; the SVG is source.
- A series-level image is separate (`hero` in `src/config/series.ts`, file under `src/assets/series/`); the same steps apply, render with resvg by hand or by placing a temporary post-local SVG.
- Never a stock photo, gradient-only card, or the title repeated as art — the OG card already renders the title.
