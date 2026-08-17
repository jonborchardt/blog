# Always Shippable

Thoughts on building always shippable systems, moving fast without breaking things, and making complex work simple and enjoyable.

Personal technical blog by Jonathan Borchardt. Static site built with Astro, published to GitHub Pages at <https://jonborchardt.github.io/blog/>.

## Requirements

- Node 22.12+ (`.nvmrc` pins 24; `nvm use`)
- npm 9.6+
- Chromium for Playwright: `npx playwright install chromium` — used by e2e **and by `npm run build`** (Mermaid diagrams render at build time)

## Commands

| Command             | What it does                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| `npm install`       | install dependencies                                                                              |
| `npm run dev`       | dev server at <http://localhost:4321/blog/> (drafts and `/admin/` on)                             |
| `npm run build`     | production build to `dist/`                                                                       |
| `npm run preview`   | serve `dist/` locally                                                                             |
| `npm run typecheck` | `astro check` (strict TypeScript across `.astro`/`.ts`/`.tsx`)                                    |
| `npm run lint`      | ESLint                                                                                            |
| `npm run format`    | Prettier (write) — `format:check` to verify                                                       |
| `npm test`          | Vitest unit tests                                                                                 |
| `npm run test:e2e`  | Playwright + axe against a production build on port 4322 (`npx playwright install chromium` once) |
| `npm run new-post`  | scaffold a draft post: `npm run new-post -- <slug> [--title "…"] [--series <id>] [--tags a,b]`    |
| `npm run validate`  | typecheck + lint + format:check + unit tests                                                      |

## Branding

- Logo: replace `src/assets/logo.svg` (rendered in the header; keep a square-ish mark with `width`/`height` attributes).
- Favicon: replace `public/favicon.svg`. Files in `public/` are served as-is under the `/blog/` base.
- No code change is needed for either. Placeholders are in place until the real files are dropped in. Optionally add `public/apple-touch-icon.png` (180×180) and link it in `src/layouts/BaseLayout.astro`.

## Social cards

Every post without a bespoke `ogImage` gets a generated 1200×630 card at `/og/<slug>.png` (built by `src/lib/og.ts` with satori + resvg — no browser). Non-post pages use the hand-made `public/og/site.jpg` (1200×630, replace the file to change it). The card font (IBM Plex Sans, OFL) lives in `src/assets/fonts/og/` and is used only for cards; pages keep the system font stack.

## Architecture

- **Astro 7** (static output) owns routing, layouts, content collections, metadata, RSS, sitemap.
- **React 19** is used only for interactive islands (`client:*` directives), including components embedded in MDX.
- **MDX** for posts and the about page. **Tailwind 4 + shadcn/ui (Radix)** for styling; light/dark/system theme with a persisted override.
- **Content**: `src/content/posts/<slug>/index.mdx` with colocated assets and components. Frontmatter is validated by the schema in `src/content.config.ts` against typed registries in `src/config/series.ts` and `src/config/tags.ts`. Cross-post checks (duplicate/reserved slugs, duplicate series order) fail the build.
- **Drafts** (`draft: true`) render only in `npm run dev`.
- **Routes**: `/`, `/archive/`, `/<slug>/`, `/series/`, `/series/<id>/`, `/about/`, `/rss.xml`, `/robots.txt`, `/sitemap-index.xml`, `/search-index.json`, `/og/<slug>.png`, custom 404; `/admin/` exists in dev only.
- **Base path**: `astro.config.mjs` sets `site` and `base: "/blog"`; links are built with `href()` from `src/lib/url.ts` so nothing hardcodes `/blog/`.

```
src/
  config/        site, author, series, tags (typed registries)
  content/posts/ one directory per post
  components/    blog/ (shared MDX primitives), ui/ (shadcn), site chrome
  layouts/       BaseLayout (head/meta/JSON-LD/theme), PageLayout (MDX pages)
  lib/           posts (loading + validation), url, seo, og cards, search core, dist checks
  pages/         routes
  styles/        global.css (Tailwind + design tokens)
e2e/             Playwright specs: smoke, article, primitives, seo, archive, budget, keyboard
                 (+ shots.mjs: screenshots of a preview; WIDTHS=360,768 env selects viewports)
.claude/skills/  agent workflows: write-post, create-series, create-visual, review-post, publish-post
scripts/         new-post scaffold, config regeneration
```

## Validation

`npm run build` fails on invalid content, and says how to fix it: frontmatter schema violations, unknown series/tags, duplicate or reserved slugs, duplicate series order, and — after the HTML is emitted (`check-dist`) — broken internal links or `#fragments`, links not under the base, images without alt/width/height, pages missing title/description/canonical/og:image, and any admin output. `npm run validate` covers types, lint, formatting and unit tests; `npm run test:e2e` runs axe and behaviour tests against a production preview.

## Local admin (dev only)

`npm run dev` serves `/blog/admin/`: forms for site identity, navigation, featured post, author profile and links, series and tags. Each Save validates against `src/config/types.ts` and rewrites the matching `src/config/*.ts` immediately (Prettier-formatted, byte-identical to `npm run format`); the dev server hot-reloads. Deleting a series or tag still used by a post is refused with the list of posts. Posts are not editable here; there is no undo (use git). The route is never built (`npm run build` and e2e assert `dist/` has no `admin/`). `node scripts/regen-config.mts` rewrites all four files through the same template.

## Performance

Lighthouse (mobile preset, production preview, 2026-08-17): home, prose post, interactive post and archive all score 100 for Performance, Accessibility, Best Practices and SEO. `e2e/budget.spec.ts` enforces the JS budget: static pages load zero JavaScript files; the archive loads only the React island bundle (< 120 KB gzipped). `e2e/keyboard.spec.ts` covers the keyboard tour (skip link, header, toggle, tabs, details, copy button, anchors) and reduced motion.

## Deployment

`.github/workflows/deploy.yml` runs typecheck, lint, format check, unit tests, build, and e2e on every push/PR, then deploys `dist/` to GitHub Pages on `main`. In the repository settings set **Pages → Source → GitHub Actions**. No secrets required.

## Agents

Most content here is written by coding agents. `CLAUDE.md` holds the invariants, `.claude/skills/` the procedures (write → review → publish), `src/components/blog/README.md` the authoring vocabulary. The build is the reviewer of last resort: it fails with a message that says what to change.
