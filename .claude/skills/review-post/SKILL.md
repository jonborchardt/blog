---
name: review-post
description: Review a post before publishing — contracts, accessibility, links, SEO, both themes and three widths — and produce a findings list. Use after write-post or when asked to review/check a post.
---

# review-post

Output: a short findings list (blocking / should-fix / nits), each with file:line and the fix. Do not silently rewrite the post; fix only what the author asked for.

## Automated (run these; they catch most contract issues)

1. `npm run validate` — types, lint, format, unit tests.
2. `npm run build` — frontmatter schema (title ≤ 90, description 40–160, registry ids, series order), then `check-dist`: broken links/fragments, base path, image alt/size, SEO essentials. Read its messages verbatim; they say what to change.
3. `npm run test:e2e` when the post adds a primitive, an island, or anything layout-affecting (axe on every sitemap URL, 360px overflow, JS-budget checks).

## Read-through (the machine can't judge these)

- **Frontmatter**: slug is what the URL should be forever; description reads as a search snippet; tags are the right ones (registry list in `src/config/tags.ts`); series/`seriesOrder` sensible; `publishedAt` is the intended date; hero has meaningful `alt`.
- **Structure**: one idea per post; headings `##` → `###` in order; TOC (≥3 headings) makes sense on its own; no heading inside `Comparison`/`Tabs`.
- **Primitives**: used per `src/components/blog/README.md` "when to use which"; Tabs only for equivalents; Details for optional depth; nothing styled ad hoc.
- **Accessibility**: images/SVG/diagrams have real alt/description; links have meaningful text; code samples are explained; colour is never the only signal; islands work by keyboard.
- **Visual pass**: `node e2e/shots.mjs <outdir> <slug>/` against a preview (or the dev server) → look at 360 and 1280 in light and dark; check tables/code scroll rather than overflow, and diagrams/figures fit without any scrollbar (a scrolling visual is a finding: redraw it, don't wrap it); check the OG card `dist/og/<slug>.png` after a build.
- **Reading flow**: opening says why it matters; ending closes; no placeholder text (`REPLACE ME`, lorem).

## Hand-off

If everything is green: `publish-post`. Otherwise return the findings list.
