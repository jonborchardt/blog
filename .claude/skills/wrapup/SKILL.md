---
name: wrapup
description: Use when a batch of posts/edits is feature-complete and the whole site needs its pre-ship audit — "wrap up", "audit the site", "full pass", "ready to ship" — or when there are concerns about accessibility, reduced motion, contrast, theme drift, mobile layout, or timer leaks across more than one post.
---

# wrapup

Whole-site polish pass. `review-post` audits one post; this walks everything that changed since the last shipped commit. Output: fix what is mechanical, list the rest as findings (blocking / should-fix / nits, `file:line` + the fix). Announce: "Using wrapup to audit the site before shipping."

## 1 — Gates

```sh
npm run validate && npm run build && npm run test:e2e
```

Read failure messages verbatim — they say what to change (`CLAUDE.md` → Validation). Zero warnings is the goal. Do not proceed on red.

## 2 — Grep sweeps (each hit is a contract violation or needs a one-line justification)

```sh
# Colour literals outside the two allowed files (global.css, theme.ts); hero SVGs are exempt.
grep -rnE '#[0-9a-fA-F]{3,8}\b|oklch\(|rgb\(|hsl\(' src --include=*.astro --include=*.tsx --include=*.ts --include=*.mdx --include=*.css | grep -v 'styles/global.css\|styles/theme.ts'
# Tailwind palette names, dark: variants, arbitrary values — wrong token or missing token.
grep -rnE '\b(gray|zinc|slate|neutral|stone|red|amber|yellow|green|blue|indigo|violet|purple)-[0-9]{2,3}\b|\bdark:|\b(text|bg|border|aspect|w|h|max-w)-\[' src --include=*.astro --include=*.tsx --include=*.mdx
# Inline style colours/sizes.
grep -rnE 'style="[^"]*(color|font-size|width|height)' src --include=*.astro --include=*.mdx
# Hardcoded base path.
grep -rn '"/blog/\|'"'"'/blog/' src | grep -v 'astro.config\|url.ts'
# Raster <img> (must be <Image> or Markdown image).
grep -rnE '<img[^>]+\.(png|jpe?g|webp|avif|gif)' src
# Timers/RAF: every hit must be cleared in the effect cleanup and gated on prefers-reduced-motion if it animates.
grep -rnE 'setInterval|setTimeout|requestAnimationFrame' src --include=*.tsx --include=*.astro
# Hand-rolled chart a11y bypassing VizFigure (post SVGs/islands only).
grep -rn 'role="img"' src/content/posts
# Per-post <style> blocks and leftover placeholders.
grep -rn '<style' src/content/posts; grep -rn 'REPLACE ME\|lorem ipsum' src/content/posts
# Post-local components imported by 2+ posts → promote to src/components/blog/.
grep -rhoE 'from "\.\./[^"]+/components/[^"]+"' src/content/posts | sort | uniq -d
```

## 3 — Accessibility (what axe cannot judge)

- **Visuals**: every meaningful chart/diagram/demo is wrapped in `VizFigure` with a `name` + `summary` (and `data` when specific values are plotted); decorative visuals are `aria-hidden="true"` with no label; no `mermaid` fences remain anywhere (the build no longer renders them — redraw as a pictorial SVG per `create-visual`).
- **Motion**: islands that animate check `matchMedia("(prefers-reduced-motion: reduce)")` and skip/stop the animation; the global CSS clamp in `global.css` covers CSS-only motion.
- **Hover/touch**: nothing conveyed by hover only; draggable/hover interactions have keyboard + touch paths; touch targets ≥ 44×44 px.
- **Text floor**: nothing below `text-xs`; SVG `<text>` ≥ 11px at rendered size — give the layout room or drop the label, never shrink it.
- **Contrast**: callouts, badges, muted text, chart labels and anything on `bg-primary`/`bg-muted` read at ≥ 4.5:1 (3:1 for large/UI) in both themes — new tokens go in `global.css` with a light and dark value.
- **Structure**: headings `##`→`###` in order; no headings inside `Comparison`/`Tabs`; TOC reads on its own; link text meaningful.

## 4 — Themes and widths

`node e2e/shots.mjs <outdir> <paths…>` with `WIDTHS=360,768,1024,1280` for every changed page (default paths cover home/post/archive/404). Look at each in light and dark:

- no horizontal overflow; tables/code scroll inside their box, diagrams and figures scale to fit (no scrollbar, no `min-w-*`)
- grids collapse; wrapping flex rows keep gap between rows (use `gap-*`, not margins)
- hero/CTA readable at 360; nothing you added stays fixed when the theme flips (`document.documentElement.classList.toggle("dark")` in devtools).

## 5 — Docs sync

- `src/components/blog/README.md` row + example for any new/changed primitive.
- `.claude/skills/README.md` for any new skill; `CLAUDE.md` only for a new invariant (keep it short).
- Registries (`series.ts`, `tags.ts`) have no orphan entries; `reserved-slugs.ts` lists any new top-level route.

## 6 — Final gate and ship

Re-run step 1 after fixes. Then `publish-post` per post (drafts flip to `draft: false` individually) — this repo ships from `main`; there is no PR step.
