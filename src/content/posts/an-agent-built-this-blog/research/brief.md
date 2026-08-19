# Domain brief: `an-agent-built-this-blog`

## Story & emphasis

The headline fact is better than the outline's claim: the outline says "~7 hours"; the git history says the **entire 11-plan implementation program ran in 79 minutes** (first plan commit 12:45, Plan 11 commit 14:04 on 2026-08-17). The rest of the afternoon (~6.5 more hours, ending 20:49) was branding iteration, content, CI polish, and skills — the *site* was feature-complete before 2:05 PM. Lead with the 89 minutes from initial scaffold commit to "launch QA passed," then use the full-day arc as the honest "~8-hour afternoon" frame.

The mechanism to emphasize: this speed was not model magic, it was **repo design for amnesiac workers**. Every agent session starts with zero memory, so the repository itself carries the spec (the plan doc literally says "the original brief is not available in later sessions" and restates it), the contracts (CLAUDE.md invariants), and a six-layer validation gauntlet that converts "agent made a mistake" into "build fails with a message telling the agent what to change." The post's thesis — *an agent literally cannot publish a broken page* — is defensible and concretely demonstrable with real error-message strings (below).

Two secondary angles worth a paragraph each:

- **Trustworthy tests before features.** Plan 1 wasn't a feature; it fixed four latent scaffold defects (missing `.prose` CSS, Shiki dark mode never switching, a UTC date-off-by-one, and Playwright reusing a stray dev server so e2e could test the *wrong site*). The program's stated reason: "without it every later 'admin not in prod' and 'zero JS' assertion is untrustworthy." Validation you can fool is worse than none.
- **Fixtures are content.** The e2e fixtures are real published posts (`building-blocks-of-this-blog`, `interactive-islands-in-mdx`) — the plan explicitly banned "component gallery" test pages, so the tests and the content can never diverge.

## Timeline facts (exact, citable)

All times local, from `git log`, date 2026-08-17 unless noted. Single git author throughout: jonathan m borchardt.

| Time | Commit | What |
|---|---|---|
| 12:35 | `8d116af` | Initial commit: Astro 7 scaffold + the 751-line implementation program doc. **55 files, 18,486 insertions.** |
| 12:45 | `a5acdcb` | Plan 1 — foundation fixes and trustworthy tests |
| 12:53 | `2e3f74f` | Plan 2 — design tokens, site chrome, homepage, 404 |
| 12:58 | `0aa8086` | Plan 3 — article page, images pipeline, series navigation |
| 13:11 | `f55afe3` | Plan 4 — shared MDX primitives and reference posts |
| 13:16 | `ed13419` | Plan 5 — build-time diagrams and math |
| 13:24 | `f2d6ad1` | Plan 6 — SEO, generated social cards, feed polish |
| 13:30 | `e5020d5` | Plan 7 — build-output validation |
| 13:41 | `beb1a28` | Plan 8 — archive explorer (search, filters, sorting, URL state) |
| 13:52 | `689317d` | Plan 9 — dev-only admin for the config registries |
| 13:57 | `11fe63b` | Plan 10 — agent skills, post scaffold, documentation sync |
| 14:04 | `6b9c453` | Plan 11 — launch QA and performance |
| 14:22–15:00 | 5 commits | Logo/favicon/OG-card iteration (four redesigns) |
| 15:29–20:49 | remainder | Fixes, first posts, CI (Playwright cache), a publish + revert, wrapup |

Citable numbers:

- **Plan 1 → Plan 11: 79 minutes.** Scaffold commit → Plan 11: **89 minutes.**
- Per-plan gaps (minutes): P1 10, P2 8, P3 5, P4 13, P5 5, P6 8, P7 6, P8 11, P9 11, P10 5, P11 7. Longest: Plan 4 (MDX primitives + two real posts, 13 min). Median ~8 min.
- **Day one: 34 commits, 12:35 → 20:49 (8h 14m).** Day two (08-18): 4 commits including publishing 10 posts at once. Total commits to date: 40.
- Repo had **zero commits before 12:35** — the plan doc's audit even lists "Repo has no commits" as defect #7.

## The 11 plans (one line each)

Source: `docs/superpowers/plans/2026-08-17-implementation-program.md` — present in commit `8d116af`, **deleted from the tree at 14:54 (`40154a8`)**; cite it from git history, not the working tree.

1. **Foundation fixes and trustworthy tests** — fix 4 latent scaffold bugs; move e2e to a dedicated port so a stray dev server can never be tested by mistake; first commit.
2. **Design system, chrome, homepage, 404** — all colors/type/widths as tokens in one file; header/footer/theme toggle in plain Astro, zero React.
3. **Article page, images, series nav** — hero, TOC, heading anchors, reading time, responsive image pipeline, "Part n of m" from positional index.
4. **Shared MDX primitives + reference posts** — Callout/Figure/Tabs/Steps/etc. as static `.astro`; two real published posts double as permanent e2e fixtures.
5. **Diagrams and math** — Mermaid and KaTeX rendered at build time (Mermaid via headless Chromium); zero client JS for either.
6. **SEO, social cards, feeds** — build-time OG card generation (satori + resvg) for every post; JSON-LD; RSS polish.
7. **Build-output validation** — `check-dist` integration: parse every built HTML page, fail the build on broken links, missing alt, missing SEO, base-path violations, admin leaks.
8. **Archive explorer** — the one React island in site chrome: hand-rolled full-text search, filters, URL state, lazy-loaded body index, static SSR fallback.
9. **Dev-only admin** — forms that rewrite `src/config/*.ts` through a typed serializer + Prettier; never in the production build.
10. **Agent skills + docs sync** — `npm run new-post` scaffold; `.claude/skills/` procedures (write-post, review-post, publish-post…); CLAUDE.md kept to invariants.
11. **Launch QA and performance** — Lighthouse ≈95+ targets, JS-budget e2e, keyboard/screen-reader passes.

**Ordering philosophy** (say this explicitly): make the tests unfoolable (1) → decide tokens once (2) → shape the post (3) → vocabulary and real fixtures (4–5) → metadata (6) → *then* the enforcement layer (7) → the only chrome island (8) → conveniences (9) → only after everything is stable, teach agents the procedures (10) → verify (11). Validation and fixtures come before the machinery that depends on them; skills come last because "writing them earlier would encode moving targets." The doc's own rule: the repo must build and pass `npm run validate` + `npm run test:e2e` **after every plan** — always shippable is the execution discipline, not just the product name.

## Validation stack (six layers, in pipeline order)

| # | Stage | Mechanism | Catches |
|---|---|---|---|
| 1 | Authoring | `npm run new-post` scaffold + typed registries | bad/reserved/duplicate slug, unknown series/tag, wrong `seriesOrder` — refused before a file exists; always scaffolds `draft: true` |
| 2 | Type level | `SERIES_IDS`/`TAG_IDS` literal unions (`as const satisfies`) feed `z.enum`; TS strict via `astro check` | an unknown tag/series is *unrepresentable* — a type error in any code touching it |
| 3 | Content load | Zod schema in `src/content.config.ts`, runs on every build/dev | title >60 chars, description outside 40–160, missing hero, `seriesOrder` without `series`, `updatedAt` before `publishedAt` |
| 4 | Cross-post | `validatePosts()` in `src/lib/posts.ts` — runs on **every page that lists posts**, aggregates all errors before throwing | duplicate/reserved slugs, unknown series, duplicate `seriesOrder` within a series, series description length |
| 5 | Post-build | `check-dist` integration (`astro:build:done`) parses every emitted HTML file with jsdom | broken internal links **including `#fragments`**, root-relative links outside `/blog/`, `<img>` without alt or width/height, missing title/description/canonical/og:image, noindex+canonical contradiction, any `admin/` output |
| 6 | e2e | Playwright against the **production build on port 4322** (dev port 4321 can never be reused) | axe WCAG 2.2 AA on *every sitemap URL* (tags wcag2a/aa, 21a/aa, 22aa); JS budget (`script[src]` count **0** on prose pages, archive island <120 KB gzipped); keyboard operation; unique titles; every og:image returns 200 |

Gold-standard error messages to quote verbatim (each names the problem *and* the fix — CLAUDE.md mandates this):

- Schema: `"description must be 40-160 characters for search/social previews (got 187)"` and `"title must be at most 60 characters — it is the post's entire <title> and search results cut off past ~60 (got N)"`
- Schema (hero): `"hero is required (1200x630 image next to index.mdx + meaningful alt); copy src/assets/hero-placeholder.png until you have one"`
- validatePosts: `'slug "og" is a reserved route name → rename the post directory or set a different "slug" in frontmatter'` and `'duplicate seriesOrder 2 in "agent-built" (also <post>) → give one of them the next free order (max existing + 1)'`
- dist-checks: `'link "/archive/" is a root-relative URL outside the base → build it with href() from src/lib/url.ts'`, `'link "…" points to #setup which does not exist on x/index.html → use a heading's generated id (kebab-case of its text) or remove the fragment'`, `'dev-only admin output found in dist/ → src/pages/admin must return no static paths in production'`
- Success line: `check-dist` logs `"N pages, N links, N images OK"` on every green build.

Fun aside if wanted: `playwright.config.ts` carries a comment that `astro preview` *daemonizes when it detects an AI-agent environment*, so the config forces it into the foreground — the tooling itself has agent-awareness quirks.

## Registries & admin

- `src/config/series.ts` and `tags.ts` are `as const satisfies SeriesRegistry/TagRegistry` objects whose keys become **literal union types** (`SeriesId`, `TagId`) and Zod enums. A post naming a tag not in the registry fails typecheck *and* content load — invalid vocabulary is unrepresentable, which is what kills the `AI`/`ai`/`artificial-intelligence` fragmentation problem across many agent sessions. Currently 26 tags, 4 series.
- The files are **generated, not hand-shaped**: header comment "Generated by the dev admin (src/dev/config-writer.ts). Edit values, not structure." Schemas/comments live in `src/config/types.ts`; the writer serializes from a fixed template and runs Prettier, with a unit test locking that a round-trip reproduces the committed file byte-identically.
- `/admin/` is a dev-only React app (`getStaticPaths` returns `[]` unless `import.meta.env.DEV`); the write API is a Vite plugin with `apply: "serve"` so it cannot exist in a build. Its absence from `dist/` is asserted **twice** — dist-check layer 5 and e2e. Deleting a series/tag still used by posts is refused with the list of posts.

## Caveats & honest framing

- **"Fully agentic" means: the agent wrote all the code and prose; a human directed it.** One git author (the human) on all 40 commits; the agent commits under the human's identity. The plan doc contains an "Execution notes (from the author, 2026-08-17)" section — the human supplied the product brief and constraints; the agent (via the superpowers writing-plans workflow) turned it into the 751-line program. Frame as: human = product owner/editor, agent = entire engineering and writing staff.
- **At least one asset is explicitly hand-made:** commit `8ea5a73` (14:29) says "hand-made public/og/site.jpg (1200x630) replaces the generated site.png." Don't claim every pixel is agent-generated.
- **Human taste loops are visible:** four logo redesign commits in 38 minutes (14:22–15:00) — that's a human saying "no, try again," which is worth admitting because it's the honest shape of agent work.
- **Human-typed commit messages appear:** "gitignor", "more initial updaes", "fixes" — small tells that a person was at the keyboard between agent sessions.
- **The "~7 hours" number needs care.** Defensible framings: 11-plan program = **79 minutes**; scaffold → launch-QA = **89 minutes**; full day one (scaffold → last commit) = **8h 14m** across 34 commits. The initial 12:35 commit already contained the scaffold *and* the plan doc, so planning/scaffolding time before 12:35 is not in git — say "the recorded history starts at 12:35" rather than claiming the whole effort fits in the log.
- The plan doc was **deleted from the tree at 14:54**; it exists only in git history (`git show 8d116af:docs/...`). The repo is public so citing it is fine, but don't link a dead path.
- There was one same-day **publish + revert** (18:56 publish, 19:11 revert) — evidence the process isn't infallible, only that failures are cheap and visible. Good honesty beat.
- Don't overstate axe: the plan itself says "Automated axe is necessary, not sufficient" — manual keyboard/screen-reader passes were a Plan 11 step.

## Proposed visuals (2)

### 1. Day-one commit timeline ("An afternoon, to the minute")

Horizontal time axis 12:00 → 21:00 on 2026-08-17. Two visual bands: the dense 11-plan sprint, then the long tail. Every data point:

- 12:35 Scaffold + 751-line program (55 files, 18,486 lines)
- 12:45 P1 Trustworthy tests · 12:53 P2 Design system · 12:58 P3 Article page · 13:11 P4 MDX primitives · 13:16 P5 Diagrams+math · 13:24 P6 SEO/OG cards · 13:30 P7 Build validation · 13:41 P8 Archive search · 13:52 P9 Dev admin · 13:57 P10 Agent skills · 14:04 P11 Launch QA
- Bracket/annotation over 12:45–14:04: **"11 plans, 79 minutes"**
- Sparse markers after: 14:22–15:00 "logo ×4", 17:04 "first content", 18:56/19:11 "publish → revert", 20:49 last commit. Caption: 34 commits, 8h 14m.

Semantics to get right: plan markers evenly labeled but positioned by *real* time (gaps of 5–13 min are the point); the post-14:04 region must look sparse by contrast.

### 2. The validation gauntlet ("Six gates between an agent and a published page")

Vertical flow, a post travels top to bottom; each gate shows stage + what bounces:

1. **Scaffold** (`npm run new-post`) → rejects bad/reserved/duplicate slug, unknown series/tag
2. **Type system** (literal unions + `astro check`) → unknown vocabulary won't compile
3. **Content load** (Zod, every build) → title >60, description ∉40–160, missing hero, date logic
4. **Cross-post** (`validatePosts`, every listing page) → duplicate slugs, duplicate seriesOrder
5. **Built HTML** (`check-dist`, post-build) → broken links/#fragments, missing alt, missing SEO, admin leaks
6. **e2e on the production build** (port 4322) → axe WCAG 2.2 AA on every page, 0-JS budget on prose pages

Each gate's reject arrow carries a real error-message snippet (use the quotes above, e.g. gate 5: `→ build it with href() from src/lib/url.ts`). Bottom: "deployed" only exists below gate 6. Optional footer note on the diagram: green build logs `N pages, N links, N images OK`.

(A third visual — plan dependency graph — exists in the source doc, but the timeline already tells the ordering story; skip it.)

## Key file paths

- Plan doc (history only): `git show 8d116af:docs/superpowers/plans/2026-08-17-implementation-program.md`
- Contracts: `E:\github2\blog\CLAUDE.md`
- Schema: `E:\github2\blog\src\content.config.ts` · cross-post: `E:\github2\blog\src\lib\posts.ts` · post-build: `E:\github2\blog\src\lib\dist-checks.ts`, `E:\github2\blog\src\integrations\check-dist.ts`
- e2e: `E:\github2\blog\playwright.config.ts`, `E:\github2\blog\e2e\{smoke,budget,seo,keyboard}.spec.ts`
- Registries/admin: `E:\github2\blog\src\config\{series,tags,types}.ts`, `E:\github2\blog\src\dev\{config-writer,admin-plugin}.ts`, `E:\github2\blog\src\pages\admin\[...path].astro`
