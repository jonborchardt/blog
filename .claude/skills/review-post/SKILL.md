---
name: review-post
description: Review a post before publishing — contracts, accessibility, links, SEO, both themes and three widths — and produce a findings list. Use after write-post or when asked to review/check a post.
---

# review-post

Output: a short findings list (blocking / should-fix / nits), each with file:line and the fix. Do not silently rewrite the post; fix only what the author asked for.

## Authority review

If the post frontmatter has `authority`, delegate factual/domain review to an agent operating in that repository before judging the post's technical correctness. That agent should inspect its repo-local `CLAUDE.md`, relevant code, docs, tests, data, and memory/context as available, and make the domain judgments rather than merely returning files. Treat that repo as authoritative for technical facts, terminology, behavior, data meaning, caveats, and whether a visualization creates a misleading mental model. The blog repo remains authoritative for presentation, MDX/React implementation, accessibility, styling, and editorial structure.

Ask the authority agent to review the post's factual claims and every meaningful visualization, identify concrete corrections and important omissions, and cite the repo evidence it used. Do not substitute your own interpretation when the authority agent can investigate it.

## Automated (run these; they catch most contract issues)

1. `npm run validate` — types, lint, format, unit tests.
2. `npm run build` — frontmatter schema (title ≤ 60, description 40–160, registry ids, series order), then `check-dist`: broken links/fragments, base path, image alt/size, SEO essentials. Read its messages verbatim; they say what to change.
3. `npm run test:e2e` when the post adds a primitive, an island, or anything layout-affecting (axe on every sitemap URL, 360px overflow, JS-budget checks).

## Read-through (the machine can't judge these)

- **Frontmatter**: slug is what the URL should be forever; description reads as a search snippet; tags are the right ones (registry list in `src/config/tags.ts`); series/`seriesOrder` sensible; `publishedAt` is the intended date; hero has meaningful `alt`; `authority` points at the repo that owns the post's domain facts.
- **Structure**: one idea per post; headings `##` → `###` in order; TOC (≥3 headings) makes sense on its own; no heading inside `Comparison`/`Tabs`.
- **Primitives**: used per `src/components/blog/README.md` "when to use which"; Tabs only for equivalents; Details for optional depth; nothing styled ad hoc.
- **Accessibility**: images/SVG/diagrams have real alt/description; links have meaningful text; code samples are explained; colour is never the only signal; islands work by keyboard.
- **Visual pass**: `node e2e/shots.mjs <outdir> <slug>/` against a preview (or the dev server) → look at 360 and 1280 in light and dark; check tables/code scroll rather than overflow, and diagrams/figures fit without any scrollbar (a scrolling visual is a finding: redraw it, don't wrap it); check the OG card `dist/og/<slug>.png` after a build.
- **Reading flow**: opening says why it matters; ending closes; no placeholder text (`REPLACE ME`, lorem).
- **Domain correctness**: incorporate the authority agent's findings. Semantic errors or stale domain facts are blocking even when the implementation/build is clean.

## Hand-off

If everything is green: `publish-post`. Otherwise return the findings list.
