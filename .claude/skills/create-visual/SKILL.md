---
name: create-visual
description: Add a diagram, illustration or interactive demo to a post — decide between static SVG, DOM/CSS, or a post-local React island, then build it accessibly. Use when a post needs a figure, chart, animation, or widget.
---

# create-visual

Ladder — stop at the first rung that holds (`CLAUDE.md`: static first, no charting library until a real post needs one):

1. **Mermaid fence** for flow/sequence/state diagrams (build-time SVG; add `accTitle`/`accDescr` and a describing sentence).
2. **Static SVG file** in the post directory for bespoke illustrations and fixed-data charts: `role="img"`, `<title>`/`<desc>` with `aria-labelledby`, `currentColor` so it follows the theme, `viewBox` + width/height, render with `<img src={svg.src} width height alt="…">` (or inline via `Figure` when it must inherit CSS).
3. **HTML + CSS** (inside a `Figure`) when the visual is really a table, a set of bars, or a layout — no script.
4. **React island** only when the reader manipulates it or it must compute on demand:
   - `src/content/posts/<slug>/components/<Name>.tsx`; render with `<Name client:visible />` (`client:load` only if it must respond immediately, e.g. above the fold).
   - Use tokens/utility classes (no raw colours), `not-prose` wrapper, keyboard operable, visible focus, `prefers-reduced-motion` respected for any animation, live region for dynamic text.
   - Add `<Name>.test.tsx` next to it (React Testing Library; see `interactive-islands-in-mdx/components/Counter.test.tsx`).
   - Keep props serialisable and small — never pass whole post bodies as props.
   - Promote to `src/components/blog/` only once a second post needs it.

## Check

- `npm run validate && npm run build` (alt/width/height are enforced on every `<img>`; check-dist reports the file and fix).
- View at 360 and 1280 in both themes (`node e2e/shots.mjs <outdir> <slug>/`); a prose post must still ship zero `script[src]`.
