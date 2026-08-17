# Always Shippable — Implementation Program

> **For agentic workers:** each numbered plan below is a self-contained unit of work. Execute one plan per session ("Implement Plan N"). REQUIRED SUB-SKILL: use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans for the plan you are given. Do not start the next plan. Commit at the end of every plan; the site must build and pass `npm run validate` + `npm run test:e2e` after every plan.
>
> **Subagent briefing:** subagents see only the task text they are given. When dispatching, paste into each subagent prompt: (a) the "Global constraints" and "Execution notes" sections, (b) the "Product spec (condensed)" section, (c) the full text of the plan being implemented, and (d) the path of this file. Every subagent must read `CLAUDE.md` first. Do not summarize the plan for a subagent — quote it.

**Goal:** Take the existing Astro 7 scaffold to the finished _Always Shippable_ site (static blog at `https://jonborchardt.github.io/blog/`) in an order that keeps the repository shippable after every plan.

**Architecture (fixed):** Astro owns routing/content/layouts/metadata/static output; React only for genuinely interactive islands (archive explorer, post-local demos, dev-only admin); MDX posts in `src/content/posts/<dir>/index.mdx` with colocated assets; shared static primitives in `src/components/blog/*.astro`; typed registries in `src/config/`; build fails on invalid content.

**Tech stack:** Astro 7.2, React 19 (islands only), MDX, Tailwind 4 + shadcn/ui (Radix), Vitest, Playwright + axe, GitHub Actions → GitHub Pages. npm only. Node 24 (`.nvmrc`), engine floor `>=22.12`.

**Spec:** the "Product spec (condensed)" section below is the authoritative restatement of the product brief (2026-08-17); the original brief is not available in later sessions. Repository state at planning time is described in "Repository audit".

## Product spec (condensed)

**Identity.** Site name **Always Shippable**. Description: _Thoughts on engineering systems, product design, AI tooling, and keeping things always shippable._ Author **Jonathan Borchardt**, tagline **Always shippable, always improving**. Links: `https://github.com/jonborchardt`, `https://www.linkedin.com/in/borchardt/`. Serious technical publication / personal engineering blog with a developer-oriented visual identity: carefully designed, fast, readable, accessible, technically credible; may take cues from Medium/Hashnode clarity but has its own restrained identity; must not look like a SaaS dashboard. The user supplies the real logo and favicon separately (leave drop-in slots). The About bio text already lives in `src/pages/about/index.mdx`; short author metadata in `src/config/author.ts`.

**Hosting.** Static, GitHub Pages project site at `https://jonborchardt.github.io/blog/` (`site` + `base: "/blog"`). All absolute/canonical URLs must include the base.

**Routes.** `/` home · `/archive/` search/filter · `/<post-slug>/` article (flat, no `/posts/`) · `/series/` directory · `/series/<series-slug>/` landing · `/about/` · `/rss.xml` · `/robots.txt` · `/sitemap-index.xml` · custom 404 · `/admin/` dev-only, never in production output.

**Homepage.** Branding + logo, primary nav, one featured article (config may name one; otherwise newest published), recent articles, footer. Editorial and restrained.

**Archive.** All published posts; local client-side full-text search over title, description, body, tags, series, headings; tag and series filtering; sorting; result summaries; empty states; responsive; state representable in URL query params. No external service; no over-engineered fuzzy search.

**Posts.** MDX in colocated directories with images/SVG/data/post-specific React components. Must support prose, headings, links, images, responsive figures, code with syntax highlighting, tables, quotes, callouts, asides, steps, tabs, expandable details, Mermaid, math, video embeds, SVG, bespoke DOM visualizations, selectively hydrated React. No charting library until a real post needs one. Post-specific components need not enter the shared library (promote only when reused by 2+ posts).

**Shared primitives (direction, not a checklist):** Callout, Figure, Image, CodeBlock, Tabs, Steps, Quote, Aside, Comparison, Mermaid, Math, Video, Details — coherent, both themes, responsive, accessible, composable, no per-post styling.

**Series.** A post belongs to zero or one series. Series = id, title, description (registry `src/config/series.ts`). Posts carry `series` + explicit `seriesOrder`; when authoring in a series without an order: `max(existing published seriesOrder) + 1`. Series page = title, description, ordered list. Article shows "Part 3 of 7 · Series Name" and prev/next series navigation near the end. **Not supported:** planned future articles, series lifecycle status, multi-series posts.

**Tags.** Central registry (`src/config/tags.ts`); prevents vocabulary fragmentation (`AI`/`ai`/`artificial-intelligence`…). Used for metadata, archive filtering, discovery, SEO. Skills may add tags deliberately.

**Drafts.** Visible and visually marked locally; never produce production pages, archive data, search index, RSS, sitemap, or structured data. No production draft flag.

**Theme.** System / explicit light / explicit dark, persisted, no flash of wrong theme; every primitive works in both.

**Accessibility.** WCAG 2.2 AA: semantic HTML, keyboard nav, visible focus, labels, heading hierarchy, alt text, reduced motion, contrast, accessible interactive components and code/figure treatment. Automated axe is necessary, not sufficient.

**Responsive.** Intentional layouts for small mobile, large mobile, tablet, laptop, wide desktop; article typography and visualizations usable on narrow screens.

**SEO.** Unique titles, meta descriptions, canonical URLs, OpenGraph, social metadata, article + Person structured data (JSON-LD), sitemap, robots.txt, RSS (one primary feed only; no per-tag/series feeds), semantic structure, internal linking, published/updated dates, tags, series metadata. Base path correct in every absolute URL.

**Social images.** Bespoke `ogImage` per post if provided; otherwise a build-time generated card with title, series (if any), date, and Always Shippable branding. No runtime service.

**Images.** Authored next to the post; build handles resizing, modern formats, responsive sources, dimensions, lazy loading, alt-text requirements. Authoring must stay easy.

**404.** Custom, consistent, with recovery navigation and recent content/search.

**Local admin.** Development-only `/admin/`, not in production output. Edits source configuration directly and immediately (no undo): site identity, author profile, navigation, theme settings (only if such config exists), series, tags, featured article, SEO defaults, personal links. **Must not edit posts.** Minimal dev-only Node/Vite write mechanism is acceptable. A convenience over configuration, not a CMS.

**Validation.** Production build fails on: invalid frontmatter, duplicate/reserved slugs, unknown series, duplicate series order, unknown tags, broken internal links, missing required alt text, required SEO metadata problems, TypeScript errors. Fail early; messages tell an agent exactly how to fix.

**Agent-authored repository.** Claude will create/maintain most content: make correct behaviour easier than incorrect via explicit contracts, schemas, conventions, reusable components, validation, documentation, predictable locations, good error messages, low ambiguity. No reliance on unwritten human knowledge.

**Skills (planned, Plan 10):** `write-post`, `create-visual`, `create-series`, `review-post`, `publish-post`. Docs split: README (human/operational), CLAUDE.md (invariants), `.claude/skills/*` (procedures) — no duplication.

**Performance.** Representative Lighthouse ≈95+ (Performance, Accessibility, Best Practices, SEO). Above all: do not ship unnecessary JavaScript; interactive posts may carry more, the rest stays lightweight.

**Hard non-goals.** No backend, database, live CMS, analytics, comments, newsletter, external search service, production admin, runtime secrets, SPA/React Router, whole-page hydration, `/posts/` prefix, or hardcoded `/blog/`.

## Global constraints (apply to every plan)

- Never hardcode `/blog/`. Use `href()` / `absoluteUrl()` from `src/lib/url.ts`. In client code receive base-prefixed URLs as props from Astro rather than computing them.
- Post URLs are flat `/<slug>/`. No `/posts/`. No `src/pages/blog/`.
- Reserved route names live in `RESERVED_SLUGS` (`src/lib/posts.ts`); add to it whenever a new top-level route is created.
- Drafts (`draft: true`) are dev-only. `getPosts()` in `src/lib/posts.ts` is the single gate; every listing/feed/index must go through it. No production draft-preview mechanism.
- `/admin/` never appears in `dist/`.
- React only where interactivity requires it; never hydrate site chrome; a prose/code/SVG post ships zero island JS.
- Prefer Astro built-ins → existing deps → nothing. Each new dependency must be named in the plan that adds it, with the reason.
- System font stack stays. `eslint-plugin-jsx-a11y` stays absent (ESLint 10 incompatibility).
- TypeScript strict; `npm run validate` and `npm run build` must pass before a plan is "done"; run `npm run test:e2e` when touching layout, routing, hydration.
- Documentation split: `README.md` = human/operational, `CLAUDE.md` = invariants (keep short), `.claude/skills/*` = procedures. Do not duplicate long instructions across them.
- Prettier checks the whole repo (`prettier --check .`), including Markdown under `docs/`. Format any doc you write.

## Execution notes (from the author, 2026-08-17)

- The program is the default sequence, not a script. If the repo reveals a better _small_ adjustment while implementing a plan, take it and note it in the commit message; do not redesign.
- Keep each plan independently shippable. Do not pull substantial work forward from later plans because it is nearby.
- Fix regressions and foundational issues immediately when discovered; avoid opportunistic refactors unrelated to the current plan.
- Preserve the static-first Astro architecture; every byte of client JavaScript must be narrowly justified.
- `/blog/` base-path correctness is an invariant — especially in client-side code and generated metadata (OG URLs, JSON-LD, RSS, sitemap, search index URLs).
- Validation failures must be actionable for future coding agents (say what is wrong _and_ what to change), not merely technically correct.
- Before finishing a plan, run validation/build/e2e against a **known production preview** (the dedicated e2e port from Plan 1), never an ambiguous already-running dev server.
- Commit each completed plan separately with a clear message. Stop after the assigned plan; summarize what changed and any implications for the remaining plans.
- Reference/meta posts (Plan 4) may be published, but they must be genuinely useful articles, not obvious test fixtures. If making a post both useful and a complete fixture becomes awkward, keep dedicated fixtures separate from real content instead.
- Mermaid (Plan 5) is build-time only. Do **not** add a client-side fallback preemptively; add one only if build-time rendering proves materially unreliable or constraining, and record why.

---

## Repository audit (what exists as of 2026-08-17)

**Exists and works** (verified with `npm run validate`, `npm run build`, and a production `astro preview`):

- Astro 7.2.2 static build; `site` + `base: "/blog"` + `trailingSlash: "always"`; every emitted link is under `/blog/`.
- Content collection `posts` (`src/content.config.ts`): glob loader `*/index.mdx`, id = directory; Zod schema with `title`, `slug?`, `description(≤200)`, `publishedAt`, `updatedAt?`, `series?` (enum of registry), `seriesOrder?`, `tags` (enum of registry), `draft`, `hero?{src,alt}`, `ogImage?`; refinements for `seriesOrder`⇒`series` and `updatedAt ≥ publishedAt`.
- `src/lib/posts.ts`: `getPosts()` (dev-only drafts, newest first, runs `validatePosts`), `getFeaturedPost()`, `getSeriesPosts()`, `validatePosts()` (reserved/duplicate slugs, unknown series, duplicate seriesOrder; aggregates all errors), `RESERVED_SLUGS`, `postSlug/postPath/seriesPath`.
- `src/lib/url.ts` (`href`, `absoluteUrl`), `src/lib/seo.ts` (`PageMeta`, `personJsonLd`, `articleJsonLd`), `src/lib/utils.ts` (`cn`).
- Registries: `src/config/site.ts` (name, description, url, locale, `featuredPost: null`, nav), `author.ts`, `series.ts` (`example-series`), `tags.ts` (4 tags).
- Layouts: `BaseLayout.astro` (head/meta/OG/JSON-LD/no-flash theme script/skip link/header/footer, `max-w-3xl` main), `PageLayout.astro` (MDX pages, `prose`).
- Pages: `/`, `/archive/` (static list only), `/[slug]/`, `/series/`, `/series/[slug]/`, `/about/` (MDX with the real bio and links), `/admin/[...path]` (dev-only placeholder), `rss.xml.ts`, `robots.txt.ts`; sitemap via integration.
- Components: `SiteHeader`, `SiteFooter`, `ThemeToggle` (plain script, system→light→dark, localStorage), `PostList`, `blog/Callout.astro`, `ui/button.tsx` (shadcn).
- One example post with a colocated SVG, a React island (`client:visible`) and an RTL unit test. Unit tests for `url`, `validatePosts`, the island. e2e smoke: axe on 6 pages, base-path links, island hydration, admin 404, feeds.
- CI: `.github/workflows/deploy.yml` runs typecheck/lint/format/unit/build/e2e and deploys `dist/` on `main`.

**Broken or placeholder (must be fixed before layering features):**

1. `@tailwindcss/typography` is installed but never registered (`global.css` has no `@plugin "@tailwindcss/typography";`). Built CSS contains **zero** `.prose` rules → article bodies and the About page are unstyled.
2. Shiki is configured with dual themes but no CSS switches to the `--shiki-dark*` variables under `.dark` → code blocks are always light.
3. Dates: frontmatter `2026-08-17` becomes UTC midnight; `toLocaleDateString` without `timeZone: "UTC"` prints **Aug 16, 2026** on the homepage.
4. Playwright `reuseExistingServer: true` + fixed port 4321 → if an `astro dev` is running (it was during this audit), e2e runs against the dev server: the admin-404 and sitemap tests fail spuriously and axe hits the dev toolbar. CI does a double build (build step, then e2e webServer builds again).
5. `/admin/` is a text placeholder; `/archive/` is a plain list; homepage is a heading + two lists; no 404 page; `hero` frontmatter is never rendered; no series prev/next; no OG image anywhere; `.claude/skills/` has only a README.
6. `e2e/smoke.spec.ts` hardcodes `example-post/` and `series/example-series/`, which will break when the example content is removed.
7. Repo has no commits.

**Architecturally sound — keep:** the content contract, `getPosts` as the single draft gate, `href()` discipline, `PageMeta`→`BaseLayout` shape, `.dark` class theming with pre-paint script, dev-only admin via empty `getStaticPaths`, e2e against the production build, `astro check` typecheck.

---

## Cross-cutting risks (from inspection)

1. **Silent styling gaps.** The `.prose` and Shiki-dark omissions shipped without any test noticing. Plans 1–3 add e2e assertions on computed styles/CSS presence so design regressions fail CI.
2. **e2e can test the wrong server.** Fixed in Plan 1 by moving preview to a dedicated port; without it every later "admin not in prod" and "zero JS" assertion is untrustworthy.
3. **Base path in client code.** The archive island (Plan 8) and admin (Plan 9) fetch URLs from the browser. `import.meta.env.BASE_URL` exists client-side, but the rule is: Astro computes URLs with `href()` and passes them as props. The Plan 7 dist checker also flags any `href="/…"` not under the base.
4. **Build-time rendering that needs a browser (Mermaid) or fonts (OG cards).** Adds fragility for fresh clones. Plans 5 and 6 name the chosen approach and the new deps; README must state prerequisites; CI installs the browser before building.
5. **Single content width.** `BaseLayout` forces `max-w-3xl` on `<main>`. Wide figures, tables, comparisons and the archive explorer need breakout widths; Plan 2 must introduce container tokens before Plans 3–4 build on them.
6. **Search index growth / hydration weight.** Full-text bodies must not be inlined as island props. Plan 8 keeps metadata in props and lazy-loads the body index JSON.
7. **Admin round-tripping TS config files.** Writing `src/config/*.ts` from JSON loses comments and must preserve the `as const` key inference that `SERIES_IDS`/`TAG_IDS`/`z.enum` depend on. Plan 9 moves types/comments to `src/config/types.ts` and regenerates files from a fixed template.
8. **Test fixtures = content.** The example post/series are the only e2e fixtures. Plan 4 replaces them with real published "meta" posts that exercise every primitive so fixtures never diverge from real content.

---

## Execution order and dependency map

```
1 Foundations ──► 2 Design system + chrome + home + 404 ──► 3 Article page + images + series
                                                                 │
                                          ┌──────────────────────┴───────────────┐
                                          ▼                                      ▼
                          4 Static MDX primitives + reference posts    6 SEO / OG cards / feeds
                                          │                                      │
                                          ▼                                      ▼
                          5 Mermaid + Math pipeline                    7 Build-output validation
                                          │                                      │
                                          └──────────────► 8 Archive explorer ◄──┘
                                                                 │
                                                                 ▼
                                                           9 Dev-only admin
                                                                 │
                                                                 ▼
                                                     10 Skills + documentation sync
                                                                 │
                                                                 ▼
                                                        11 Launch QA / performance
```

Plans 4→5 and 6→7 are independent chains after Plan 3; run them in numeric order unless parallelising sessions.

---

## Plan 1 — Foundation fixes and trustworthy tests

### Goal

The scaffold's latent defects are fixed, the test harness cannot be fooled by a stray dev server, and the repository has its first commit. Everything later builds on correct typography, correct dark code, correct dates, and reliable e2e.

### Why this comes now

Every later plan styles prose, renders dates, and relies on e2e proving production behaviour. Fixing these first prevents re-doing work and prevents false green/red CI.

### Scope

1. `src/styles/global.css`: add `@plugin "@tailwindcss/typography";` (Tailwind 4 syntax) directly after the imports. Confirm `.prose` rules appear in the built CSS.
2. Shiki dark mode: add to `global.css` the class-based dual-theme rules (Shiki docs, "class-based dark mode"):
   `.dark .astro-code, .dark .astro-code span { color: var(--shiki-dark) !important; background-color: var(--shiki-dark-bg) !important; font-style: var(--shiki-dark-font-style) !important; font-weight: var(--shiki-dark-font-weight) !important; text-decoration: var(--shiki-dark-text-decoration) !important; }`.
3. Dates: create `src/lib/dates.ts` exporting `formatDate(date: Date, style: "medium" | "long" = "medium"): string` using `Intl.DateTimeFormat("en-US", { dateStyle: style, timeZone: "UTC" })`, and `isoDate(date: Date): string` (`YYYY-MM-DD`) for `datetime` attributes. Replace every `toLocaleDateString` call (`PostList.astro`, `[slug].astro`) with these. Unit test: `formatDate(new Date("2026-08-17"))` → `"Aug 17, 2026"`; `formatDate(new Date("2026-08-17"), "long")` → `"August 17, 2026"`; `isoDate` → `"2026-08-17"`.
4. Playwright: use a dedicated preview port so a running dev server is never reused. `playwright.config.ts`: `baseURL: "http://localhost:4322/blog/"`, `webServer.command: "npm run build && npm run preview -- --port 4322"`, `webServer.url` to match. Keep `reuseExistingServer: !process.env.CI`. In CI, avoid the double build by setting `webServer.command` to `npm run preview -- --port 4322` when `process.env.CI` is set (dist already exists from the build step).
5. e2e robustness: replace the hardcoded `PAGES` list with a test that reads `sitemap-0.xml` via `request.get("sitemap-0.xml")`, extracts `<loc>` URLs, and runs axe on each (single test looping all URLs, failing with the offending URL in the message). Keep the dedicated tests (base-path links, island hydration, admin 404, feeds). The island test may keep referencing `example-post/` until Plan 4 replaces the fixture.
6. `eslint.config.js`: `tseslint.config(...)` is deprecated (astro check hint) — switch to `defineConfig` from `eslint/config` with the same entries. Behaviour unchanged.
7. `rss.xml.ts`: drop the redundant `.filter((p) => !p.data.draft)` (already gated by `getPosts`) and add a one-line comment saying so.
8. `CLAUDE.md`: add one bullet under Content contract: "Frontmatter dates are calendar dates in UTC; render them only via `formatDate`/`isoDate` in `src/lib/dates.ts`." Add under Quality gates: "e2e serves the production build on port 4322; dev stays on 4321."
9. Initial commit on `main` (all files currently untracked). Then a second commit with the fixes above, or one commit total — either is fine, but the repo must end with history.

### Key files/areas

`src/styles/global.css`, `src/lib/dates.ts` (+ test), `src/components/PostList.astro`, `src/pages/[slug].astro`, `playwright.config.ts`, `e2e/smoke.spec.ts`, `eslint.config.js`, `src/pages/rss.xml.ts`, `CLAUDE.md`, `README.md` (port note).

### Important implementation constraints

- No visual redesign here; only make existing styles actually apply.
- No new dependencies.
- Do not change the content schema.

### Acceptance criteria

- `dist/_astro/*.css` contains `.prose` rules; the About page and the example post body render with typography styles.
- In the built example post, toggling `.dark` on `<html>` (e2e: `page.emulateMedia({ colorScheme: "dark" })` after clearing localStorage) gives `pre.astro-code` a dark background (`getComputedStyle` background-color ≠ `rgb(255, 255, 255)`).
- Homepage and post page show `Aug 17, 2026` / `August 17, 2026` for `publishedAt: 2026-08-17` regardless of machine timezone (run e2e with `TZ=America/Los_Angeles` and `TZ=Asia/Tokyo` locally once).
- `npm run test:e2e` passes while an `astro dev` is running on 4321.
- `git log` shows at least one commit on `main`.

### Validation

`npm run validate`, `npm run build`, `npm run test:e2e` (with a dev server running on 4321 to prove isolation), `TZ=Asia/Tokyo npm run test:e2e` once.

### Explicitly out of scope

Design tokens, layout changes, 404 page, new components, SEO additions.

---

## Plan 2 — Design system, site chrome, homepage, 404

### Goal

The site has its own restrained developer-publication identity: tokens (color, type scale, widths, radii, focus, motion), a real header with logo slot and mobile-safe nav, polished theme toggle, footer, an editorial homepage, styled series/listing pages, and a custom 404. Later plans consume these tokens instead of inventing per-page styles.

### Why this comes now

Article layout (3), primitives (4), OG cards (6) and the archive explorer (8) all need the container widths, palette and typography decided once. The homepage/404 are cheap once the tokens exist.

### Scope

1. **Tokens** in `src/styles/global.css` (keep the shadcn variable names so `ui/` components keep working; change values):
   - Light and dark palettes with a single brand accent hue (choose one restrained accent, e.g. a teal/blue in OKLCH) applied to `--primary`, `--ring`, link color; neutral greys warm/cool consistently; ensure ≥4.5:1 for body/muted text in both themes (verify with a contrast check; note the results in the PR/commit message).
   - `--radius` reduced to `0.375rem` (developer feel, not SaaS-card feel).
   - Width tokens exposed to Tailwind via `@theme`: `--container-prose: 42rem` (~68ch body measure), `--container-wide: 56rem`, `--container-page: 72rem`. Remove `max-w-3xl` from `BaseLayout` `<main>`; pages/layouts choose `max-w-prose|wide|page` (Tailwind 4 auto-generates `max-w-<name>` from `--container-*`).
   - Type scale: base 1rem/1.6 on mobile, `1.0625rem` at `md`; heading scale h1 `2.25rem`→`2.75rem` at `md`; `--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.
   - `html { color-scheme: light }`, `.dark { color-scheme: dark }` (native controls/scrollbars match); global `:focus-visible` ring using `--ring`; `@media (prefers-reduced-motion: reduce)` disables transitions/animations globally; link underline style (`text-underline-offset`, `text-decoration-thickness`).
   - Delete unused `--sidebar-*` and `--chart-*` variables (no consumers).
2. **Header** `SiteHeader.astro`: logo (add `src/assets/logo.svg` as a simple placeholder wordmark/mark to be replaced by the user's file; import and render via `<Image>` or inline `<img>` with width/height) + site name linking home; nav from `site.nav`; `aria-current="page"` on the active item (compare `Astro.url.pathname` to `href(item.href)`); layout wraps cleanly at 360px without a JS menu (three links + toggle fit; if not, allow the nav to wrap to a second row). No hamburger/JS.
3. **ThemeToggle.astro**: icon button (inline SVG sun/moon/monitor, `aria-hidden`), `aria-label` reflecting the current mode ("Theme: system, switch to light"), keeps the existing cycle and storage; icon updated by the same script. Add `<meta name="color-scheme" content="light dark">` in `BaseLayout`.
4. **Favicon/app icons**: `public/favicon.svg` placeholder (same mark), `<link rel="icon" href={href("/favicon.svg")} type="image/svg+xml">`; document in README that the user replaces `src/assets/logo.svg` and `public/favicon.svg`. Add `public/` note: files there are served under the base.
5. **Footer**: name, tagline, GitHub/LinkedIn (`rel="me"`), RSS, © year; muted, single row wrapping on mobile.
6. **Listing primitives**: rewrite `PostList.astro` into rows with title, date (`formatDate`), reading-time placeholder omitted (comes in Plan 3), description, series eyebrow ("Series name · Part n") when present, tags as plain text chips; `draft` badge in dev. Add `PostCard.astro` for the featured post (title, description, date, series/tags, hero `<Image>` when `hero` exists, `loading="eager"`).
7. **Homepage** `index.astro`: masthead (site name, description, author tagline — restrained, no dashboard blocks), featured post card, "Recent" list (up to 6), link to `/archive/`. Featured logic unchanged (`getFeaturedPost`).
8. **Series pages** and **About** use the same containers/typography; About body via `PageLayout` `prose`.
9. **404** `src/pages/404.astro`: page title "Page not found", explanation, links home/archive/series/about, "Recent posts" (5) via `PostList`. `noindex`. Reserved slug `404` added to `RESERVED_SLUGS`.
10. e2e: 404 test (`page.goto("does-not-exist/")` → status 404, h1 visible, axe clean); header nav visible at 360×740 viewport with no horizontal overflow (`document.documentElement.scrollWidth <= 360`); theme toggle cycles and persists across reload; sitemap axe loop still green.

### Key files/areas

`src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/{SiteHeader,SiteFooter,ThemeToggle,PostList,PostCard}.astro`, `src/assets/logo.svg`, `public/favicon.svg`, `src/pages/{index,404}.astro`, `src/pages/series/*.astro`, `src/lib/posts.ts` (reserved slug), `e2e/`, `README.md`.

### Important implementation constraints

- Zero React; header/footer/toggle stay Astro + inline script.
- No fonts, no icon library usage in chrome (inline SVG only; `lucide-react` is for React islands).
- Keep shadcn variable names; `src/components/ui/*` untouched.
- All colors via tokens; no raw hex in components.

### Acceptance criteria

- Home, archive, series, about, post, 404 render with the new tokens in both themes; axe passes on all sitemap pages and 404.
- No horizontal scroll at 360px on any page.
- Focus ring visible on every link/button via keyboard.
- Placeholder logo and favicon show; replacing the two files requires no code change.
- Homepage shows one featured post and recent posts excluding it.

### Validation

`npm run validate`, `npm run build`, `npm run test:e2e`; manual: view every page at 360, 768, 1280 wide in both themes; keyboard tab through header.

### Explicitly out of scope

Article-page layout (Plan 3), MDX primitives (Plan 4), OG images (Plan 6), archive search (Plan 8).

---

## Plan 3 — Article page, images, series navigation

### Goal

A post reads like a serious technical publication: article header with series eyebrow, hero image, meta line (dates, reading time), tags, table of contents for long posts, heading anchors, tuned long-form typography, code block presentation, responsive optimised images from colocated files, and series prev/next navigation.

### Why this comes now

It fixes the "shape" of a post that primitives (4), rich content (5), OG cards (6) and search (8, headings/body) depend on.

### Scope

1. **Helpers in `src/lib/posts.ts`**: `getSeriesContext(post)` → `{ index: number; total: number; prev?: Post; next?: Post; series: {id,title,description} } | undefined` using positional index in `getSeriesPosts` order (so "Part 3 of 7" is always consistent even if `seriesOrder` has gaps). `readingTime(body: string): number` (minutes, words/230, min 1) in `src/lib/reading-time.ts` with a unit test.
2. **`[slug].astro` layout** (article container `max-w-prose`, header/footer may use `max-w-wide`):
   - `<header>`: series eyebrow link "Series title · Part n of m"; `<h1>`; lede = description; meta line: published (`<time>`), "Updated" when present, reading time; tags (chips; link to `/archive/?tag=<id>` — the archive ignores unknown params until Plan 8, harmless now); draft banner in dev.
   - Hero: when `hero` present render `<Image src alt widths=[640,960,1280] sizes="(min-width: 56rem) 56rem, 100vw" loading="eager" fetchpriority="high">` inside a `<figure>` at wide width.
   - Table of contents: when `headings` (from `render(post)`) has ≥3 entries of depth 2–3, render a static `<nav aria-label="On this page">` inside a `<details open>` above the body on all sizes (no sticky sidebar in this plan; keep it simple).
   - Body: `<div class="prose ...">` with `<Content components={{ table: TableWrapper }} />` where `src/components/blog/TableWrapper.astro` wraps tables in an `overflow-x-auto` block for narrow screens.
   - Footer: series prev/next `<nav aria-label="Series navigation">` (previous/next titles with part numbers) and "All posts in series" link; "← Archive" link.
3. **Heading anchors**: add dev dependency `rehype-autolink-headings` (Astro already runs `rehype-slug` ids). Configure in `astro.config.mjs` `markdown.rehypePlugins` with `behavior: "append"`, a link containing an inline `#` and `aria-label: "Link to section: <heading text>"`, class `heading-anchor`; CSS shows it on hover/focus, always visible on touch (`@media (hover: none)`).
4. **Prose tuning** in `global.css` (`.prose` overrides via CSS, not per-post classes): measure via container, heading spacing/scale, link style with tokens, inline `code` styling, `blockquote` style, `hr`, images (`figure`, `img { border-radius }`), lists, tables (zebra-free, borders via tokens), `pre.astro-code` (border, radius, padding, `overflow-x:auto`, `font-size: .9em`, `tab-size: 2`, respects `--shiki-dark` from Plan 1), remove `max-width` from `.prose` (container controls it).
5. **Images pipeline**: `astro.config.mjs` `image: { layout: "constrained", responsiveStyles: true }` so `<Image>` and Markdown `![alt](./x.png)` (Astro's MDX image handling) get `srcset/sizes`, intrinsic dimensions, `loading="lazy"`, `decoding="async"`, WebP output. Add a real raster image to the example post (a small PNG/JPG under its directory) and confirm output. Document authoring rules in `CLAUDE.md` (one bullet: "Colocated images: use Markdown `![alt](./file.png)` or `<Image>`; never `<img>` for raster; SVG may use `<img>` with width/height/alt").
6. **Series landing page** `/series/[slug]/`: numbered ordered list "Part n" with title, date, description; description paragraph; count.
7. Article JSON-LD: pass `hero`/`ogImage` as `image` when present (full absolute URL). Full OG work is Plan 6.
8. e2e (`e2e/article.spec.ts`): post page has exactly one `h1`, `article` landmark, `nav[aria-label="Series navigation"]` when in a series, TOC when ≥3 headings (use the reference fixture; if the example post lacks enough headings add them), heading anchors present with `aria-label`, `img` (non-hero) has `loading="lazy"` and `width`/`height`, tables inside `.overflow-x-auto`, axe clean; no horizontal overflow at 360px including a wide table and a code block.

### Key files/areas

`src/pages/[slug].astro`, `src/lib/{posts,reading-time}.ts` (+tests), `src/components/blog/TableWrapper.astro`, `src/styles/global.css`, `astro.config.mjs`, `src/pages/series/[slug].astro`, `src/content/posts/example-post/*` (fixture edits), `src/lib/seo.ts`, `e2e/article.spec.ts`, `CLAUDE.md`.

### Important implementation constraints

- Article page ships no island JS unless the post embeds one; TOC/anchors are static HTML.
- New dependency allowed: `rehype-autolink-headings` only. Do not add Expressive Code or other highlighters; keep Shiki.
- Positional part numbers (index+1), not raw `seriesOrder`, for "Part n of m".
- Keep `PageMeta` shape; extend rather than replace.

### Acceptance criteria

- Example post shows series eyebrow "Example Series · Part 1 of 1", hero (if configured), meta with reading time, TOC, anchored headings, styled code in both themes, responsive `srcset` images, prev/next nav (rendered as disabled/omitted at ends).
- `npm run build` outputs WebP variants for a raster image placed in the post directory.
- No `astro-island` in the built HTML of a post without React components (assert on About page for now; Plan 4 adds a text-only post fixture).
- e2e article spec + axe pass.

### Validation

`npm run validate`, `npm run build`, `npm run test:e2e`; manual read of the example post at 360/768/1280 in both themes.

### Explicitly out of scope

New MDX primitives besides `TableWrapper` (Plan 4), Mermaid/Math (5), OG generation (6), search (8).

---

## Plan 4 — Shared MDX primitives and reference posts

### Goal

Agents can author rich, consistent posts from a small documented vocabulary of static `.astro` primitives; two real published posts exercise every primitive and replace the throwaway example content, serving as living documentation and permanent e2e fixtures.

### Why this comes now

Needs the article layout and prose tokens from Plans 2–3. Must precede skills (10) and search (8, which indexes real content) and gives Plan 5/6 real fixtures.

### Scope

1. **Primitives** in `src/components/blog/` (all `.astro`, static, tokens only, both themes, responsive, axe-clean; each has a JSDoc block with props and an MDX usage example):
   - `Callout.astro` (extend existing): `variant: "note" | "tip" | "warning" | "danger" | "info" = "note"`, `title?`; inline SVG icon; `<aside role="note" aria-label={title ?? variant}>`.
   - `Figure.astro`: slot for `<Image>`/SVG/anything + `caption?` (rendered `<figcaption>`), `width: "prose" | "wide" | "full" = "prose"` (breakout via negative margins/`grid` at ≥`lg`, no breakout on narrow).
   - `Quote.astro`: `<figure><blockquote>slot</blockquote><figcaption>— cite</figcaption></figure>` with `cite?`, `href?`.
   - `Aside.astro`: side note; margin note at ≥`xl` (absolute/grid column), inline muted block otherwise.
   - `Comparison.astro`: two (or three) labelled columns via named slots (`<Fragment slot="a">`), props `labels: string[]`, stacks below `md`; useful for before/after and pros/cons.
   - `Steps.astro`: wraps an ordered list (`<ol>` slot content) with CSS counters and connector line; author writes plain `1.` Markdown list inside.
   - `Details.astro`: `<details><summary>{summary}</summary>slot</details>`, `open?`.
   - `Tabs.astro` + `Tab.astro`: ARIA tabs pattern (tablist/tab/tabpanel, roving tabindex, arrow keys, `aria-selected`) implemented with a small inline `<script>` in `Tabs.astro` (delegated, idempotent — multiple Tabs per page). Without JS the panels render stacked with their labels as headings (progressive enhancement). No React, no Radix.
   - `Video.astro`: `src` (local file → `<video controls preload="metadata" playsinline>` with `poster?`, `caption?`) or `youtube: string` id → 16:9 `<iframe loading="lazy" title={title} allowfullscreen>` (title required); no autoplay; `<figure>` + caption.
   - `CodeBlock.astro`: optional wrapper around a fenced block giving `title?` (filename) header and a copy button; copy button is a `<button>` with `aria-label="Copy code"` wired by one delegated inline `<script>` (defined once in `CodeBlock.astro`, uses `navigator.clipboard`, announces "Copied" via `aria-live`). Bare fenced code without the wrapper remains valid.
   - `TableWrapper.astro` (from Plan 3) documented alongside.
   - Do **not** create `Image`, `Math`, `Mermaid` here: images use `astro:assets` `Image` directly (documented), Math/Mermaid come in Plan 5.
2. **Catalog doc** `src/components/blog/README.md`: table of primitives, props, one MDX example each, guidance "when to use which", and rules (relative image imports, `client:visible` for post-local islands, no per-post styling). `CLAUDE.md` gets a single pointer line to it; skills (Plan 10) link to it.
3. **Reference content** (replace `example-post` and `example-series`):
   - Series `building-always-shippable` in `src/config/series.ts` ("How this blog is built…"), remove `example-series`.
   - Post `building-blocks-of-this-blog` (published, `tags: [meta, engineering]`, seriesOrder 1): honest article about the authoring primitives, using every static primitive above, a Markdown image with a colocated raster (move the one added to the example post in Plan 3), a table, code fences, ≥3 headings — **no React islands** (this is the zero-JS fixture).
   - Post `interactive-islands-in-mdx` (published, seriesOrder 2): explains selective hydration; contains one post-local React island (move/adapt `ExampleInteractive.tsx` + its RTL test) and an inline SVG figure. Delete `src/content/posts/example-post/`.
   - Both posts have `hero` optional (leave unset unless a tasteful image exists), descriptions ≤160 chars.
   - **Content vs. fixture rule:** these must read as genuinely useful articles for a reader of an engineering blog (the "how this blog is built" angle is real content), not as component galleries. Use a primitive only where the writing calls for it. If exercising _every_ primitive makes a post feel like a test page, do not force it: keep the published post natural and put the exhaustive coverage in a separate **draft** post `src/content/posts/primitives-fixture/` (`draft: true`, dev-only) plus e2e assertions on the published posts for the primitives they naturally use (a draft fixture is absent from the production build, so anything covered only there gets a dev-time manual/axe check instead of e2e). Decide this while writing; record the choice in the commit message.
4. e2e (`e2e/primitives.spec.ts`): on `building-blocks-of-this-blog/`: no `astro-island` element and no `<script src>` other than the theme/toggle inline scripts (assert `document.querySelectorAll('script[src]').length === 0`); Tabs keyboard operation (ArrowRight moves selection, panel visibility); Details toggles; copy button copies (`page.evaluate(navigator.clipboard.readText)` with clipboard permission) ; axe clean in light and dark (`emulateMedia`). Update island hydration test to `interactive-islands-in-mdx/`.
5. Unit tests: none needed for `.astro` primitives beyond e2e; keep the island RTL test.

### Key files/areas

`src/components/blog/*.astro`, `src/components/blog/README.md`, `src/config/series.ts`, `src/content/posts/{building-blocks-of-this-blog,interactive-islands-in-mdx}/`, delete `src/content/posts/example-post/`, `e2e/primitives.spec.ts`, `e2e/smoke.spec.ts` (fixture slugs), `CLAUDE.md` (pointer).

### Important implementation constraints

- Every primitive is `.astro` and static; the only client scripts are the tiny inline ones in `Tabs` and `CodeBlock` (no framework, delegated, no per-instance JS).
- Use tokens/prose styles; no ad-hoc colors; `not-prose` where the primitive manages its own typography.
- Reference posts are real, publishable writing (they are content), not lorem ipsum.
- Do not add tags outside the registry; add to `tags.ts` first if a new tag is genuinely needed.

### Acceptance criteria

- Catalog README lists every primitive with a working MDX example that compiles.
- `building-blocks-of-this-blog/` builds with zero island JS and passes axe in both themes; all primitives visible and usable at 360px.
- `interactive-islands-in-mdx/` hydrates its island (e2e).
- `series/building-always-shippable/` lists Part 1 and Part 2; homepage features the newest.
- No references to `example-post`/`example-series` remain (`grep`).

### Validation

`npm run validate`, `npm run build`, `npm run test:e2e`; manual review of both posts in both themes at three widths.

### Explicitly out of scope

Mermaid/Math (5), OG (6), archive island (8), skills (10). Do not add a charting library.

---

## Plan 5 — Diagrams and math pipeline

### Goal

Posts can include Mermaid diagrams and LaTeX math that render to static HTML/SVG at build time with zero client JavaScript.

### Why this comes now

Depends on the article/prose system (3) and the reference post (4) as fixture; independent of SEO/search.

### Scope

1. **Math**: add deps `remark-math`, `rehype-katex`, `katex`. `astro.config.mjs`: `markdown.remarkPlugins: [remarkMath]`, `rehypePlugins: [..., rehypeKatex]` (Astro's default `excludeLangs: ["math"]` already keeps Shiki off math fences). Import `katex/dist/katex.min.css` **only** in `src/pages/[slug].astro` (article pages), not in `BaseLayout`. Verify KaTeX fonts are emitted under `/blog/_astro/` and load (font files fetch only when glyphs are used).
2. **Mermaid** (build-time):
   - Preferred: add dev dep `rehype-mermaid` (renders at build via Playwright, which is already a devDependency and installed in CI). Config: `markdown.syntaxHighlight: { type: "shiki", excludeLangs: ["mermaid", "math"] }`, `rehypePlugins: [[rehypeMermaid, { strategy: "inline-svg", mermaidConfig: { theme: "neutral", fontFamily: "inherit" } }]]`. Dark mode: apply CSS `.dark svg[id^="mermaid"] { filter: invert(0.88) hue-rotate(180deg); }` with a `ponytail:` comment ("single neutral render + invert filter; upgrade to per-theme dual render if colours matter"). Move `npx playwright install --with-deps chromium` in `.github/workflows/deploy.yml` **before** `npm run build`. README: "Build prerequisite: `npx playwright install chromium` (used by e2e and Mermaid rendering)".
   - **No client-side fallback is to be built preemptively.** Build-time rendering is the direction. Only if `rehype-mermaid` proves materially unreliable or constraining (e.g. repeated CI failures that cannot be fixed by ordering/caching the browser install) may a client-side `Mermaid.astro` (lazy `import("mermaid")` on pages that need it) be considered — and then only after stopping to report the problem and getting agreement; record the reason in `CLAUDE.md` if it happens.
3. Add a "Diagrams and math" section to `building-blocks-of-this-blog` (a small flowchart, an inline `$…$` and a display `$$…$$` formula) and to the primitives README (fence syntax, not components).
4. e2e: on the reference post, `svg[id^="mermaid"]` exists; `.katex` exists; `script[src]` count is still 0.
5. `README.md` prerequisites updated; `CLAUDE.md` one bullet: "Diagrams: `mermaid` fences; math: `$`/`$$` (remark-math). Both render at build."

### Key files/areas

`astro.config.mjs`, `package.json`, `src/pages/[slug].astro` (KaTeX CSS), `src/styles/global.css` (mermaid dark filter, `.katex-display` overflow-x), `.github/workflows/deploy.yml`, reference post MDX, `src/components/blog/README.md`, `README.md`, `CLAUDE.md`, e2e.

### Important implementation constraints

- Build-time rendering only; no client JS for diagrams or math.
- Display math and diagrams must scroll horizontally on narrow screens instead of overflowing the page.
- Diagrams need a text alternative: instruct authors (README catalog) to precede/follow a diagram with a sentence describing it; `rehype-mermaid` supports an accessible title/description via Mermaid `accTitle`/`accDescr` — document that.

### Acceptance criteria

- Reference post shows a rendered diagram and formulas in both themes; page ships zero `script[src]`.
- Fresh CI run passes with the browser installed before build.
- Axe passes; no horizontal overflow at 360px.

### Validation

`npm run validate`, `npm run build` (on a machine with Chromium installed), `npm run test:e2e`, push a branch to see CI green.

### Explicitly out of scope

Charting libraries, interactive diagrams, per-theme dual Mermaid rendering.

---

## Plan 6 — SEO, social cards, feeds

### Goal

Every page has complete, correct static SEO/social metadata; every post has an OG image (bespoke `ogImage` or a generated fallback card with title, series, date and branding); RSS is polished; structured data is complete.

### Why this comes now

Needs the design tokens/logo (2) and article/series context (3). Independent of primitives; can run in parallel with 4–5.

### Scope

1. **OG fallback generation** (build-time, static endpoint): add deps `satori` and `@resvg/resvg-js`. Add one font file for card rendering only (e.g. Inter or IBM Plex Sans, regular + bold `.ttf`, placed in `src/assets/fonts/og/` with its license file) — this does not change the site's system font stack. Create `src/lib/og.ts` with `renderOgCard({ title, eyebrow?, date, siteName }): Promise<Buffer>` (1200×630 PNG, uses tokens' colours as literals in one place, logo SVG inlined) and `src/pages/og/[slug].png.ts` (`getStaticPaths` over `getPosts()`; drafts excluded automatically) plus `src/pages/og/site.png.ts` (default card for non-post pages). Add `og` to `RESERVED_SLUGS`. Wire `PageMeta.image` to fall back: posts → `ogImage?.src ?? /og/<slug>.png`; other pages → `/og/site.png`. Skip generation for posts with a bespoke `ogImage`.
2. **Head** in `BaseLayout.astro`: `og:image:width/height` (1200/630 for generated), `og:image:alt`, `twitter:card` `summary_large_image` always (image now always exists), `twitter:title`, `twitter:description`, `twitter:image`; article pages: `article:tag` per tag label, `article:section` = series title when present, `article:author` = about URL. Keep `noindex` behaviour.
3. **JSON-LD** (`src/lib/seo.ts`): `BlogPosting` adds `image`, `url`, `author.url` (about page), `articleSection` (series title), `wordCount` (from reading-time helper); homepage adds a `WebSite` object (name, url, description, `publisher` Person); Person JSON-LD includes `jobTitle`? — no (not in config); keep to what config has.
4. **RSS** (`rss.xml.ts`): `<language>` from `site.locale`, item `author` (name), `categories` as tag labels, `customData` for `atom:link rel="self"` (via `xmlns:atom`), keep description-only items (no full content). Confirm feed validates (W3C feed validator, manual).
5. **Schema tightening for SEO** in `src/content.config.ts`: `title` max 90 chars, `description` 40–160 chars, with custom Zod messages that state the fix ("description must be 40–160 characters for search/social previews (got 187)"). Update the two reference posts if needed.
6. `robots.txt` unchanged; sitemap unchanged (no `lastmod` — not worth a content-aware serializer now).
7. e2e (`e2e/seo.spec.ts`): for every sitemap URL: exactly one `<title>`, `meta[name=description]` non-empty, canonical `https://jonborchardt.github.io/blog/...` equals the sitemap URL, `og:image` absolute and returns 200 with `image/png` or the bespoke type, `og:url` = canonical, one `ld+json` script at least; titles unique across the sitemap. `/og/<slug>.png` for a reference post returns a 1200×630 PNG (check dimensions via `sharp`? — no new dep: check PNG header bytes for width/height).
8. README: mention generated OG cards and where the font lives; `CLAUDE.md`: "Every page has an OG image; posts may set `ogImage` (1200×630) else a card is generated at `/og/<slug>.png`."

### Key files/areas

`src/lib/{og,seo}.ts`, `src/pages/og/`, `src/assets/fonts/og/`, `src/layouts/BaseLayout.astro`, `src/pages/[slug].astro`, `src/pages/rss.xml.ts`, `src/content.config.ts`, `src/lib/posts.ts` (reserved), `e2e/seo.spec.ts`, `README.md`, `CLAUDE.md`, `package.json`.

### Important implementation constraints

- Generation is fully static (endpoints in `src/pages/og/`), no runtime service.
- Absolute URLs always via `absoluteUrl()`; never string-concatenate the base.
- The OG font is a card asset only; do not load it on pages.
- Drafts never get an OG file in production (endpoints iterate `getPosts()`).

### Acceptance criteria

- `dist/og/<slug>.png` exists for each published post without `ogImage`; `dist/og/site.png` exists; a draft (in a local dev-only check) gets none in `dist/`.
- Every built page's `og:image` resolves 200; e2e SEO spec passes.
- Card shows title (wrapped, ≤3 lines, ellipsis), "Series · Part n of m" eyebrow when applicable, date, site name/logo, in brand colours.
- RSS validates.

### Validation

`npm run validate`, `npm run build`, `npm run test:e2e`; open a generated PNG; paste a post URL into an OG preview tool after deploy (manual, post-merge).

### Explicitly out of scope

Sitemap `lastmod`, per-tag/series feeds, full-content RSS, analytics.

---

## Plan 7 — Build-output validation

### Goal

`astro build` fails with actionable messages for broken internal links (including `#fragments`), images without alt, pages missing SEO essentials, hardcoded non-base links, and any `admin` output — closing the "planned, not implemented" gaps in `CLAUDE.md`.

### Why this comes now

Needs OG (6) so "every page has og:image" is checkable, and reference content (4) as fixtures. Must precede skills (10) so `review-post`/`publish-post` can rely on it, and search (8) benefits from link checks.

### Scope

1. **Integration** `src/integrations/check-dist.ts` exporting `checkDist(): AstroIntegration` hooked on `astro:build:done` (`dir`, `pages`). Pure checker functions in `src/lib/dist-checks.ts` (unit-testable, string-in/errors-out) using `jsdom` (existing devDependency) to parse HTML:
   - Collect all `.html` files under `dist/`; map URL path → file (`/blog/x/` → `x/index.html`, `/blog/404.html` special).
   - `checkInternalLinks(pages)`: every `a[href]` starting with `/` must start with the base (`/blog/`) — else "hardcoded root link; use href()"; every base-relative link must resolve to an existing page or asset in `dist/` (strip query; `.xml/.txt/.png` files count); fragments must match an element `id` on the target page.
   - `checkImages(page)`: every `img` has an `alt` attribute; empty alt allowed only with `role="presentation"` or `aria-hidden="true"`; every `img` has `width` and `height`.
   - `checkSeo(page)`: `<title>` non-empty, `meta[name=description]`, `link[rel=canonical]` under `site+base`, `meta[property=og:image]`; skip for `404.html` canonical rule.
   - `checkNoAdmin(files)`: no path containing `admin/`.
   - Output: aggregate all errors as `"<file>: <problem> → <how to fix>"` lines, then throw once (build fails). Log a one-line success count otherwise.
2. Register the integration in `astro.config.mjs` (`integrations: [react(), mdx(), sitemap(), checkDist()]`). It runs only during `astro build`.
3. Unit tests `src/lib/dist-checks.test.ts` with small HTML strings: passing case; each failure case yields a message containing the file and the fix.
4. Intentionally verify it works: temporarily add a broken link to a reference post, run `npm run build`, observe failure, revert (do not commit the breakage).
5. `validatePosts` additions: reserved slug list now includes `og`, `404`, `search-index.json` (the latter for Plan 8; harmless now); error messages end with a fix hint (e.g. `→ rename the post directory or set a different "slug"`).
6. `CLAUDE.md`: replace the "Planned, not implemented" paragraph with the implemented list and "add new checks to `src/lib/dist-checks.ts` (post-build) or `validatePosts` (frontmatter)".

### Key files/areas

`src/integrations/check-dist.ts`, `src/lib/dist-checks.ts` (+ test), `astro.config.mjs`, `src/lib/posts.ts`, `CLAUDE.md`, `README.md` (validation section).

### Important implementation constraints

- No new runtime deps; `jsdom` is already present (devDependency; CI runs `npm ci` with dev deps).
- Checks run only in `astro build`; `astro dev` unaffected.
- Do not check external links (network in CI is a flake source).
- Messages must tell an agent exactly what to change.

### Acceptance criteria

- `npm run build` fails on: a link to `/blog/nope/`, a `#missing` fragment, an `<img>` without alt, a page without description, an `href="/archive/"` not under base; passes on the clean repo.
- Unit tests cover each rule.
- Build log prints e.g. `check-dist: 9 pages, 143 links, 12 images OK`.

### Validation

`npm run validate`, `npm run build` (clean and with each deliberate breakage), `npm run test:e2e`.

### Explicitly out of scope

MDX-source linting, external link checking, Lighthouse in CI.

---

## Plan 8 — Archive explorer: search, filters, sorting, URL state

### Goal

`/archive/` becomes the discovery hub: all published posts, instant local full-text search (title, description, body, tags, series, headings), tag and series filters, sorting, result summaries, empty states, linkable URL state — as one React island, with a fully usable static fallback.

### Why this comes now

Needs stable post shape/headings (3), real content (4–5), and validation (7) to catch links it emits. It is the only React island in site chrome, so it comes after the static site is complete.

### Scope

1. **Index builder** `src/lib/search-index.ts`:
   - `SearchDoc = { slug, url, title, description, publishedAt: string(ISO), updatedAt?: string, series?: { id, title, part: number, total: number }, tags: { id, label }[], readingTime: number, headings: string[], body: string }`.
   - `buildSearchIndex(posts): Promise<SearchDoc[]>` using `render(post)` for `headings` and `stripMdx(post.body)` for `body`: remove `import`/`export` lines, JSX tags (`<Foo …>` / `</Foo>`), MDX expressions `{…}`, frontmatter, code-fence markers (keep code text), Markdown syntax characters; collapse whitespace; cap body at ~20k chars. Unit tests for `stripMdx`.
   - Static endpoint `src/pages/search-index.json.ts` → `/search-index.json` (published posts only via `getPosts`), reserved slug already added in Plan 7.
2. **Search core** `src/lib/search.ts` (pure, no React, unit-tested): `tokenize(s)`, `search(docs, query, { tags, series, sort })` → ranked results with `score` and a `snippet` (≈160 chars around first body hit). Scoring: AND over query tokens; each token matches by prefix against field tokens; weights title 6, tags 3, series 3, headings 2, description 2, body 1; ties by date. `ponytail:` comment: "hand-rolled prefix search; swap for MiniSearch if quality/size demands". Sorts: `newest` (default), `oldest`, `title`, `relevance` (auto when query non-empty).
3. **Island** `src/components/archive/ArchiveExplorer.tsx` (`client:load` — the search box must respond immediately; the bundle is React + this component only):
   - Props from Astro: `docs` (metadata only — no `body`, no `headings`), `tags` registry, `series` registry, `indexUrl` (`href("/search-index.json")`), `initial` state parsed server-side from `Astro.url.searchParams`.
   - SSR renders the full list so the page works without JS; on hydrate it takes over.
   - Body/headings loaded lazily: `fetch(indexUrl)` on first focus/keystroke in the search box; until loaded, search matches title/description/tags/series only and shows "loading full-text index…" unobtrusively.
   - UI: `<form role="search">` with labelled `<input type="search">`, tag chips (`<button aria-pressed>`), series `<select>`, sort `<select>`, "Clear filters"; results `<ul>` reusing the PostList row markup (a small React `PostRow` mirroring `PostList.astro` styling — accept this one duplication, note it in a comment); count summary in an `aria-live="polite"` region ("12 of 40 posts · matching “astro”"); empty state with suggestions and a clear button; responsive: filters collapse into a `<details>` under `md`.
   - URL state: `?q=&tag=a,b&series=&sort=` written with `history.replaceState` (debounced), read on load and on `popstate`; unknown values ignored.
   - shadcn: add `input`, `select`, `badge` (or `toggle`) via `npx shadcn add …` as needed; do not hand-edit them.
4. `src/pages/archive/index.astro`: heading, count, `<ArchiveExplorer client:load … />`. Tags on post pages/PostList link to `/archive/?tag=<id>`; series pages link "Filter archive by this series".
5. Tests: Vitest for `search.ts` and `stripMdx`; RTL test for `ArchiveExplorer` (typing filters list; chip toggles; clear resets). e2e (`e2e/archive.spec.ts`): SSR list has all published posts before JS; typing a word from a reference post body narrows results (proves lazy index); URL updates; reload with `?tag=meta` pre-filters; empty query state message; axe; keyboard-only operation of chips/select; only the archive page requests React chunks (About page: `script[src]` count 0).

### Key files/areas

`src/lib/{search-index,search}.ts` (+tests), `src/pages/search-index.json.ts`, `src/components/archive/ArchiveExplorer.tsx` (+test), `src/pages/archive/index.astro`, `src/components/ui/*` (added via shadcn), `src/pages/[slug].astro` and `PostList.astro` (tag links), `e2e/archive.spec.ts`.

### Important implementation constraints

- One island; no React elsewhere in chrome. No external search service, no new search dependency (hand-rolled first).
- Base path: `indexUrl` and all links come from Astro via `href()`; the island never builds `/blog/` itself.
- Drafts never in the index in production (endpoint uses `getPosts`).
- Progressive enhancement: list visible with JS disabled.

### Acceptance criteria

- `/archive/?q=hydration&tag=meta&sort=oldest` opens pre-filtered; changing controls updates the URL; back button restores.
- Body-text search finds a phrase that appears only in a post body.
- Empty results show a helpful state; count region updates for screen readers.
- Archive page usable at 360px; axe clean; unit + RTL + e2e pass.
- `search-index.json` absent of drafts in `dist/`.

### Validation

`npm run validate`, `npm run build`, `npm run test:e2e`; manual keyboard pass.

### Explicitly out of scope

Fuzzy/typo-tolerant search, search on other pages, pagination (not needed at this scale; add if >100 posts), per-tag pages.

---

## Plan 9 — Development-only admin

### Goal

`npm run dev` exposes `/admin/` (never built) where the author edits typed configuration — site identity, nav, author profile and links, series, tags, featured post, SEO defaults — with changes written immediately to `src/config/*.ts`.

### Why this comes now

It only edits registries that are now stable; it is a convenience, so it comes after the public product. Needs the shadcn form components (some added in Plan 8).

### Scope

1. **Config shape for round-tripping**: create `src/config/types.ts` with `SiteConfig`, `AuthorConfig`, `SeriesRegistry`, `TagRegistry` (and their Zod schemas `siteSchema` etc. — used by the writer and reusable by future checks). Existing files keep their exports but become `export const site = { … } satisfies SiteConfig;` (drop `as const` only where it fights the type; keep `as const` for `series`/`tags` so `SERIES_IDS`/`TAG_IDS` remain literal unions — verify `astro check` after). Move explanatory comments from the config files into `types.ts` (files will be regenerated).
2. **Writer** `src/dev/config-writer.ts` (Node only): `serializeConfig(name: "site" | "author" | "series" | "tags", data): string` producing the exact file text from a per-file template (imports, `export const … = <JSON> as const satisfies …;`, the derived `SERIES_IDS`/`TAG_IDS`/type lines), then `prettier.format(text, { filepath })` (Prettier is a devDependency), then write. Unit test: serialize current config → equals the committed file text (after formatting) — this locks the template.
3. **Dev API** as a Vite plugin `src/dev/admin-plugin.ts` (`apply: "serve"`) registered in `astro.config.mjs` `vite.plugins`. `configureServer` adds middleware for `POST /__admin/config/<name>` (JSON body → validate with the Zod schema → refuse deleting a series/tag still used by posts (read `src/content/posts/*/index.mdx` frontmatter with a simple regex/YAML scan, or accept the risk and let the build fail — choose the scan; message lists the posts) → `serializeConfig` → write). Only allowlisted names; only in dev; JSON errors returned as 400 with the Zod message.
4. **UI**: `src/pages/admin/index.astro` (rename from `[...path].astro`; keep the `getStaticPaths` dev-only guard) loads current config server-side and renders `src/components/admin/AdminApp.tsx` (`client:load`, dev-only so bundle size is irrelevant) with sections: Site (name, description, url, locale, nav list add/remove/reorder, featured post `<select>` of published+draft posts or "newest"), Author (name, tagline, links), Series (list, add, edit title/description; id immutable once created; delete guarded), Tags (same), with per-section Save writing immediately and showing "Saved · dev server will reload" or the error. Uses shadcn `input`, `textarea`, `label`, `select`, `button`, `card`.
5. No post editing, no theme editing (no such config exists — leave out), no auth, no undo.
6. e2e keeps "admin is 404 in production build" and adds a dist check (Plan 7 already fails on `admin/`). Manual dev test: edit site name in `/admin/`, see `src/config/site.ts` change and HMR reload.

### Key files/areas

`src/config/{types,site,author,series,tags}.ts`, `src/dev/{config-writer,admin-plugin}.ts` (+ writer test), `astro.config.mjs`, `src/pages/admin/index.astro`, `src/components/admin/AdminApp.tsx`, `src/components/ui/*` (via shadcn), `README.md` (admin section), `CLAUDE.md` (one line: config files are generated by the admin writer — edit values, not structure).

### Important implementation constraints

- Nothing under `src/dev/` may be imported by production pages; the Vite plugin uses `apply: "serve"`.
- `dist/` never contains `admin/` or `__admin` (build check + e2e).
- Registry key inference (`SERIES_IDS`, `TAG_IDS`) must remain literal after regeneration; `astro check` proves it.
- Keep it small: forms + write; no drafts, no history, no post editing.

### Acceptance criteria

- In dev, saving each section rewrites the corresponding `src/config/*.ts` byte-identically to what Prettier/`npm run format` would produce; `npm run validate` passes after edits.
- Deleting a used series/tag is refused with the list of posts.
- Production build has no admin route; e2e green.

### Validation

`npm run validate`, `npm run build`, `npm run test:e2e`; manual dev session exercising every form.

### Explicitly out of scope

Post creation/editing, image uploads, deployment triggers, authentication.

---

## Plan 10 — Agent skills and documentation sync

### Goal

Claude can create series, write and review posts, add visuals, and publish, following procedural skills that invoke the repo's real validators — with `README.md`, `CLAUDE.md` and skills each holding only their own kind of information.

### Why this comes now

Skills must reference the final primitives (4–5), validation (7), archive behaviour (8) and admin (9). Writing them earlier would encode moving targets.

### Scope

1. **Scaffold script** `scripts/new-post.mjs` (Node, no deps) exposed as `npm run new-post -- <slug> [--title "…"] [--series <id>] [--tags a,b] [--draft]`: validates kebab-case and reserved/duplicate slug, validates series/tags against the registries (Node 24 runs `.ts` files natively with type stripping, so the script can `import()` `src/config/series.ts`/`tags.ts` directly — verify this works with the `satisfies`/`as const` syntax; if not, fall back to reading the keys with a regex), computes `seriesOrder = max(existing published posts' seriesOrder in that series) + 1` by scanning frontmatter, creates `src/content/posts/<slug>/index.mdx` with valid frontmatter (`publishedAt` today, `draft: true` by default), a `components/` note, and prints next steps. Unit test in Vitest for the seriesOrder computation (pure function extracted to `scripts/lib/next-series-order.mjs`).
2. **Skills** in `.claude/skills/<name>/SKILL.md` (frontmatter `name`, `description`; concise, procedural, link to catalog/README rather than restating):
   - `write-post` (first): inputs → run `npm run new-post`; write in MDX using `src/components/blog/README.md` primitives; images colocated; alt text; headings hierarchy; description 40–160; series rules; run `npm run validate && npm run build`; leave `draft: true`; hand off to `review-post`.
   - `create-series`: add entry to `src/config/series.ts` (or via `/admin/`), naming/description guidance, optionally scaffold first post; validate.
   - `create-visual`: decision tree SVG (static, in post dir, `role="img"`+`<title>`) → DOM/CSS → React island (`./components/*.tsx`, `client:visible`, RTL test, reduced-motion, keyboard); no charting libs; when to promote to `src/components/blog/` (2+ posts).
   - `review-post`: checklist: frontmatter/schema, slug, tags/series registry, headings h2→h3 order, alt text, links resolve (`npm run build` runs check-dist), primitives usage, both themes and 360/768/1280 screenshots via Playwright (`npx playwright test --grep <slug>` or the MCP browser if available), axe on the page, reading flow, SEO title/description; output a findings list.
   - `publish-post`: set `draft: false`, set `publishedAt` (today) and `updatedAt` rules, run `npm run validate && npm run build && npm run test:e2e`, commit with conventional message, push `main` (CI deploys), verify the live URL after the Pages deploy.
   - `.claude/skills/README.md`: index of skills, one line each; remove "planned".
3. **Docs sync**: `README.md` — commands (`new-post`), prerequisites (Chromium for build if Plan 5 preferred path), replacing logo/favicon, admin usage, validation summary, deployment; `CLAUDE.md` — verify every bullet is still true, add pointers (catalog README, dates helper, reserved slugs, OG behaviour, dist checks, config generated by admin), remove anything now covered by a skill; keep it under ~120 lines.
4. Dry-run: execute `write-post` end-to-end for a small real draft (e.g. a short "why this blog is always shippable" post) in a draft state to prove the workflow; keep or delete the draft per author preference (delete before commit if it is not real content).

### Key files/areas

`scripts/new-post.mjs`, `scripts/lib/next-series-order.mjs` (+ test), `package.json` (script), `.claude/skills/{write-post,create-series,create-visual,review-post,publish-post}/SKILL.md`, `.claude/skills/README.md`, `README.md`, `CLAUDE.md`.

### Important implementation constraints

- Skills are procedures; invariants stay in `CLAUDE.md`; component API stays in `src/components/blog/README.md`. No copy-paste of large blocks across the three.
- Skills call existing commands (`new-post`, `validate`, `build`, `test:e2e`); they do not re-implement validation.
- The scaffold never sets `draft: false`.

### Acceptance criteria

- `npm run new-post -- my-post --series building-always-shippable` creates a valid draft with `seriesOrder: 3`; `npm run build` passes; the draft is absent from `dist/`.
- Each skill file passes a read-through by a fresh agent (dry-run of `write-post` succeeded).
- README/CLAUDE.md/skills contain no contradictions with the code (spot-check reserved slugs, ports, commands).

### Validation

`npm run validate`, `npm run build`, `npm run test:e2e`; run the scaffold with bad inputs (reserved slug, unknown tag) and see clear errors.

### Explicitly out of scope

New site features; changes to primitives; content beyond the dry-run draft.

---

## Plan 11 — Launch QA and performance

### Goal

The site meets its quality bar before real content: Lighthouse ≈95+ (Performance, Accessibility, Best Practices, SEO) on home, a prose post, the interactive post and the archive; responsive and keyboard/a11y manual passes are done and fixed; JS budget is enforced by tests; user-supplied logo/favicon integrated.

### Why this comes now

Everything is built; this is verification and polish across the whole surface.

### Scope

1. Lighthouse (ad hoc `npx lighthouse http://localhost:4322/blog/... --preset=desktop` and mobile) on the four page types; record scores in the commit message; fix findings (image sizes, `fetchpriority`, unused CSS, contrast, tap targets).
2. JS budget e2e (`e2e/budget.spec.ts`): About, home, prose reference post, series pages: `script[src]` count 0; archive: ≤ 3 script chunks and total JS < 120 KB gzipped (measure via `page.on("response")` sizes); interactive post: React chunks only.
3. Manual passes: keyboard-only tour of every route (skip link, header, toggle, tabs, details, copy button, archive controls); screen-reader spot check (NVDA/VoiceOver) of article header and archive live region; reduced-motion; both themes; viewports 360/414/768/1024/1440 with screenshots; contrast re-check after any palette tweak.
4. Integrate the user's real logo/favicon files (drop-in per Plan 2), add `apple-touch-icon.png` (180×180) if supplied.
5. Final `README.md` pass; remove any leftover `ponytail:` notes that were resolved; confirm `.github/workflows/deploy.yml` order (browser install → build → e2e) and that a Pages deploy from `main` serves `/blog/`.

### Key files/areas

`e2e/budget.spec.ts`, whatever the audits touch (`global.css`, layouts, images), `public/`, `src/assets/logo.svg`, `README.md`, `.github/workflows/deploy.yml`.

### Important implementation constraints

- Fixes must not add JS to static pages or new dependencies.
- Do not "fix" Lighthouse by removing features; adjust implementation.

### Acceptance criteria

- Recorded Lighthouse ≥95 in all four categories on the four page types (mobile preset).
- Budget e2e passes; all e2e/axe green; `npm run validate` green.
- Real logo/favicon live; deployed site verified at `https://jonborchardt.github.io/blog/`.

### Validation

`npm run validate`, `npm run build`, `npm run test:e2e`, Lighthouse runs, manual checklists above.

### Explicitly out of scope

New features, content writing (use the skills afterwards).

---

## Skills ownership summary (for Plan 10)

| Concern                                              | Lives in                                                    |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| Invariants (URLs, drafts, registries, deps, gates)   | `CLAUDE.md`                                                 |
| Commands, setup, deployment, replacing logo/favicon  | `README.md`                                                 |
| Primitive API and MDX examples                       | `src/components/blog/README.md`                             |
| Frontmatter rules and cross-post checks              | code: `src/content.config.ts`, `validatePosts`, dist checks |
| Post scaffolding + `seriesOrder = max + 1`           | `scripts/new-post.mjs` (called by `write-post`)             |
| Step-by-step authoring / review / publish procedures | `.claude/skills/*`                                          |

## New dependencies introduced by this program (complete list)

| Plan | Package(s)                                          | Reason                                                      |
| ---- | --------------------------------------------------- | ----------------------------------------------------------- |
| 3    | `rehype-autolink-headings`                          | heading anchor links (Astro already provides `rehype-slug`) |
| 5    | `remark-math`, `rehype-katex`, `katex`              | build-time math                                             |
| 5    | `rehype-mermaid` (dev)                              | build-time diagrams via existing Playwright                 |
| 6    | `satori`, `@resvg/resvg-js` (+ one OG font file)    | build-time social cards without a browser                   |
| 8    | shadcn components (copied source, not npm packages) | archive/admin form controls                                 |

Everything else uses Astro built-ins or existing dependencies.
