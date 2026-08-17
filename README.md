# Always Shippable

Thoughts on engineering systems, product design, AI tooling, and keeping things always shippable.

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
| `npm run validate`  | typecheck + lint + format:check + unit tests                                                      |

## Branding

- Logo: replace `src/assets/logo.svg` (rendered in the header; keep a square-ish mark with `width`/`height` attributes).
- Favicon: replace `public/favicon.svg`. Files in `public/` are served as-is under the `/blog/` base.
- No code change is needed for either.

## Social cards

Every post without a bespoke `ogImage` gets a generated 1200×630 card at `/og/<slug>.png` (built by `src/lib/og.ts` with satori + resvg — no browser). Non-post pages use `/og/site.png`. The card font (IBM Plex Sans, OFL) lives in `src/assets/fonts/og/` and is used only for cards; pages keep the system font stack.

## Architecture

- **Astro 7** (static output) owns routing, layouts, content collections, metadata, RSS, sitemap.
- **React 19** is used only for interactive islands (`client:*` directives), including components embedded in MDX.
- **MDX** for posts and the about page. **Tailwind 4 + shadcn/ui (Radix)** for styling; light/dark/system theme with a persisted override.
- **Content**: `src/content/posts/<slug>/index.mdx` with colocated assets and components. Frontmatter is validated by the schema in `src/content.config.ts` against typed registries in `src/config/series.ts` and `src/config/tags.ts`. Cross-post checks (duplicate/reserved slugs, duplicate series order) fail the build.
- **Drafts** (`draft: true`) render only in `npm run dev`.
- **Routes**: `/`, `/archive/`, `/<slug>/`, `/series/`, `/series/<id>/`, `/about/`, `/rss.xml`, `/robots.txt`, `/sitemap-index.xml`; `/admin/` exists in dev only.
- **Base path**: `astro.config.mjs` sets `site` and `base: "/blog"`; links are built with `href()` from `src/lib/url.ts` so nothing hardcodes `/blog/`.

```
src/
  config/        site, author, series, tags (typed registries)
  content/posts/ one directory per post
  components/    blog/ (shared MDX primitives), ui/ (shadcn), site chrome
  layouts/       BaseLayout (head/meta/JSON-LD/theme), PageLayout (MDX pages)
  lib/           posts (loading + validation), url, seo
  pages/         routes
  styles/        global.css (Tailwind + design tokens)
e2e/             Playwright + axe smoke tests (+ shots.mjs: ad-hoc screenshots of a preview)
.claude/skills/  agent workflows (planned)
```

## Deployment

`.github/workflows/deploy.yml` runs typecheck, lint, format check, unit tests, build, and e2e on every push/PR, then deploys `dist/` to GitHub Pages on `main`. In the repository settings set **Pages → Source → GitHub Actions**. No secrets required.

## Agents

See `CLAUDE.md` for repository invariants and `.claude/skills/` for workflows.
