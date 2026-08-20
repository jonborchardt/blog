---
name: create-hero
description: Use for every post's hero image unless the author explicitly supplied one — after scaffolding a new post, when `hero.png` is still the grey placeholder (its alt may already be rewritten; check the file, not the alt), or when asked for a bespoke, generated, or SVG hero — and for every series' image (each series needs its own fresh hero, never a post's).
---

# create-hero

The default way a post gets its hero: no hero was handed over → draw one. Author `hero.svg` next to `index.mdx`, rasterise it to `hero.png` (the contract in `CLAUDE.md`: 1500×600 — 2.5:1 — meaningful alt), and keep the SVG as the editable source. No image model, no browser — `npm run render-hero` uses resvg, already a dependency.

**One image, two crops.** The post page shows the full 1500×600; every listing (PostList, series pages, archive, featured card) crops to the centre 60% — exactly the centre 900×600, a 3:2 card. Compose for both: the centre 900 must read as a complete card on its own; the outer flanks (x < 300 and x > 1200) extend the scene — background texture, secondary echoes, continuation of the field — never anything essential, and never dead empty margins.

## Steps

1. **Read the post** (title, description, first section). Pick ONE concrete visual metaphor for its main idea — a mechanism, not decoration (a post about islands → small hydrated blocks in a sea of static; a post about pipelines → stages joined by arrows). Write it down as the alt text first: one sentence describing what the picture shows. If you can't write that sentence, the idea is not concrete enough.
   - If the post has an `authority` repo and the hero encodes domain-specific facts, labels, data, behavior, or conclusions rather than being purely metaphorical, take those semantics from the domain brief (`./research/brief.md`; contract in `write-post` → Authority); ask the expert only if the brief doesn't cover them.
2. **Write `src/content/posts/<slug>/hero.svg`** by hand:
   - `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 600" width="1500" height="600">`; add `<title>` matching the alt.
   - Palette: only the hex values in `src/styles/theme.ts` (raster twins of the site theme — a PNG cannot read CSS variables): `bg` background, `fg` ink, `primary`, `accent` fills, `border`, `highlight`. Read that file; do not invent or eyeball colours, so listings look like one site. Invert (ink background) only when the subject is literally dark (night sky, terminal); a series may pick its own highlight.
   - Shapes over text. At most a few short labels (`font-family="IBM Plex Sans"` — the only font the renderer loads; system fonts are off). No external refs, `<image>`, `<foreignObject>`, CSS classes, or scripts (resvg renders none of them).
   - Keep every critical shape and label inside the centre ~860×540 (listings crop to the centre 900 and show it small); fill the flanks with non-essential continuation.
   - Keep every shape near the viewBox: a huge circle centred far off-canvas under a clipPath makes resvg panic (draw an arc with `A` instead).
   - Aim for < 8 KB; use `<use>`/`<g transform>` for repetition.
3. **Render**: `npm run render-hero -- <slug>` (fails with the reason if `hero.svg` is missing or not 1500×600). Overwrites `hero.png`.
4. **Frontmatter**: replace `hero.alt` with the sentence from step 1 (never "hero image", never the title).
5. **Look at it**: open `hero.png` (Read tool) and check it twice — the full width as it appears on the post, and the centre 60% as listings will crop it (does the metaphor still read as a card, at thumbnail size?). Iterate on the SVG, re-render.
6. `npm run validate && npm run build`.

## Series heroes

Every series gets its own fresh image — never a post's hero; series pages fail the build without one. Same contract and steps, different paths:

- Draw from the series as a whole (title + description in `src/config/series.ts`, skim its posts), not from any single post.
- Source: `src/assets/series/<id>.svg`. Render: `npm run render-hero -- series/<id>` → `src/assets/series/<id>.png`.
- Register it: `hero: { src: "series/<id>.png", alt: "…" }` on the series entry in `src/config/series.ts`.

## Notes

- Do not point `hero.src` at the `.svg`: search-index converts heroes to WebP and OG/listing paths assume a raster. The PNG is the hero; the SVG is source.
- Never a stock photo, gradient-only card, or the title repeated as art — the OG card already renders the title.
