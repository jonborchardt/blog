# Domain brief — `the-authoring-surface`

Repo: `E:\github2\blog` (Astro 7 + React islands + MDX + Tailwind/shadcn, GitHub Pages project site at base `/blog/`). The post is already scaffolded at `src/content/posts/the-authoring-surface/index.mdx` (`series: agent-built`, `seriesOrder: 2`, `draft: true`, placeholder hero/description). It sits between "An Agent Built This Blog" (order 1) and "Repos as Experts" (order 3).

## Story & emphasis

"What this site can do" — the complete authoring vocabulary an agent writes posts with, and why it is shaped the way it is. The frame: this blog is written mostly by coding agents, so "easy to author" means a **small, explicit, validated vocabulary** — every primitive is typed, catalogued in one README, styled by one token file, and the build fails loudly on anything invalid. The post walks the vocabulary in the order an author reaches for it (prose → images → emphasis → procedures → code → diagrams/math → tables), then climbs the ladder to the one place JavaScript earns its way in: a React island the reader can manipulate, with a live Counter demo, and the honest accounting of what actually ships on the wire.

Two spines to keep:

1. **The ladder** (from the old islands post, now also codified in `.claude/skills/create-visual/SKILL.md` step 1): Mermaid fence → static SVG → HTML+CSS → React island. Stop at the first rung that holds.
2. **Static first with receipts**: a prose post ships zero external scripts and zero framework JS; the only client code is a few small inline scripts (see Technical facts — be precise, the old "zero client JavaScript" claim needs qualification).

Do **not** link to `/building-blocks-of-this-blog/`, `/interactive-islands-in-mdx/`, or `/primitives-fixture/` (the first two are being deleted; the third is `draft: true`, dev-only, never in production).

## What survives from each old post

### From `building-blocks-of-this-blog/index.mdx`

Carry over (mostly verbatim-worthy):

- The opening framing: "written mostly by coding agents… the easiest thing for an agent is a small, explicit vocabulary with a validator that says exactly what went wrong." This IS the new post's thesis — promote it from intro to organizing idea.
- "Why static first" section and the `Comparison` demo (Static primitive vs Hydrated island) — it now doubles as a live demo of the `Comparison` component and a setup for the islands half.
- The live-demo-of-each-primitive structure: Callout (tip + warning variants shown), Quote (Fred Brooks), Aside, Steps (the 4-step publish procedure), Tabs (Markdown image vs Figure), Details, CodeBlock (`src/lib/url.ts` snippet), the Markdown table of build checks, Figure with `width="wide"` around an `astro:assets` `<Image>`, the `pipeline.png` plain-Markdown image. The "show the component by using it" trick is the post's best feature — keep it. `pipeline.png` lives at `src/content/posts/building-blocks-of-this-blog/pipeline.png`; copy it into the new post's directory (or draw a better one).
- The Mermaid demo (source→build→deploy flowchart with `accTitle`/`accDescr`) and the KaTeX reading-time example — but **fix the math** (see Corrections).
- "Emphasis without shouting" rubric: Callout interrupts (don't miss), Aside steps out (optional), five variants and "no post is allowed to invent a sixth colour."
- "What is not here" closing idea (no chart lib, no carousel; each would be a dependency and a maintenance promise) — fold it into the ladder discussion instead of a standalone teaser for "Part 2".

Drop:

- The `<Details summary="The full frontmatter contract">` content as written — its numbers drifted (see Corrections). Either fix the numbers or drop the frontmatter deep-dive; the frontmatter contract belongs more to "An Agent Built This Blog"/"Repos as Experts" territory anyway.
- The closing "Part 2 of this series is about that last case" — there is no Part 2 anymore; the islands material is now in-post.
- Any mention of the `blog-features` series (it no longer exists in `src/config/series.ts`).

### From `interactive-islands-in-mdx/index.mdx`

Carry over:

- "Islands, not apps": Astro renders every page static; a `client:*` component renders to HTML at build and only its own JS loads and takes over its own DOM. Accurate and central.
- The `island.svg` schematic + its `VizFigure` wrapper (name/summary intact) — reuse as-is (see Proposed visuals).
- The live Counter demo, its `VizFigure interactive` wrapper, and the 3-line "entire authoring surface" MDX snippet (`import Counter from "./components/Counter"; <Counter client:visible />`). This is the payoff demo. **The component must move** (see Proposed visuals).
- "When an island is worth it" — the Callout ("The ladder") and both the good-reasons and bad-reasons lists. The bad-reasons list ("Nothing else on the site is React" — still true of pages/chrome except the archive explorer) is the voice of the post; keep it.
- "Where islands live": post-local `./components/*.tsx` with tests; promoted to shared only when a second post needs it; chrome is never an island except one.
- The archive-explorer mention — but rewrite the last sentence: "it gets its own post later in this series" is a dead promise. State the fact instead: the one chrome island is the archive explorer at `/all-posts/` (`src/components/archive/ArchiveExplorer`, hydrated `client:load`, receives post metadata as props and lazily fetches `/search-index.json` for full-text search).
- The inline-SVG observation ("scales, respects the theme via `currentColor`, costs nothing at runtime").

Drop:

- The link to Part 1 (deleted) and the two-post series scaffolding ("Part 1 made the case…"). The merged post makes the case itself.

## Corrections & drift (wrong or imprecise in the old posts)

1. **"ships zero client JavaScript" — imprecise.** A built prose post (verified in `dist/ponytail-lazy-senior-dev/index.html`) carries: one inline pre-paint theme script (in `<head>`, `src/layouts/BaseLayout.astro` lines 94–105), two tiny inline `<script type="module">` blocks (theme-toggle wiring; the left-rail TOC scrollspy from `src/components/PostToc.astro`), and 2 JSON-LD blocks. Posts using Tabs or CodeBlock add one inline module script each (page-wide, deduped — not per instance). What is genuinely zero: **external scripts (`script[src]`), React, any framework runtime**. The skills' own check is phrased "a prose post must still ship zero `script[src]`" — use that formulation. Only a page with an island loads `script src` (`astro-island` with `component-url` + `renderer-url`, confirmed in `dist/interactive-islands-in-mdx/index.html`).
2. **Reading-time math is wrong.** Old post shows $\lceil w/230\rceil$ and $\max(1,\lceil w/230\rceil)$. Actual code (`src/lib/reading-time.ts`): `Math.max(1, Math.round(wordCount(body) / 230))` — **round, not ceiling**. If the KaTeX demo survives, the formula must use round (or the code must be quoted honestly).
3. **Frontmatter contract drifted.** Old Details block says "description (≤200 chars)". Actual (`src/content.config.ts`): description **40–160** chars, title **≤ 60** chars (it's the whole `<title>`). The old post's checks table ("Frontmatter schema — content loader — yes") is still right.
4. **Series is gone.** Both old posts declare `series: blog-features`, which no longer exists in `src/config/series.ts` (registry now: agent-built, finances, worldlock, sierra-games) — the old posts are broken against the current registry and must be deleted, not just unlinked. New post is already in `agent-built` / order 2.
5. **Tabs keyboard claim, minor:** old post says "arrow keys move between them"; the implementation (`src/components/blog/Tabs.astro`) also supports **Home/End**. The no-JS claim is right: without the script, panels render stacked with their labels as headings (`[data-tab]`/`[data-tab-label]` CSS fallback); the script builds the ARIA tablist (roving tabindex) at runtime.
6. **"Diagrams… respect the theme" nuance:** Mermaid renders once with the `neutral` theme; **dark mode is a CSS invert filter** (`.dark svg[id^="mermaid"] { filter: invert(0.88) hue-rotate(180deg); }` in `src/styles/global.css`, marked as a deliberate ponytail shortcut). Don't overclaim token-native theming for Mermaid; inline SVGs via `currentColor` do theme natively.
7. **Not in the old posts but now part of the vocabulary:** `VizFigure` (the building-blocks post predates it — its catalogue omits it), `Video` (local `<video>` or `youtube-nocookie` iframe, required `title`, no autoplay), and `TableWrapper` (applied automatically to every Markdown table by `[slug].astro` — this is *how* the old post's "tables scroll sideways" claim is true; never imported directly). The new post's catalogue should match the current 12-primitive table in `src/components/blog/README.md`.
8. Old islands post inline `island.svg` carries its own `role="img"` + `aria-labelledby` **inside** a non-interactive VizFigure that already hides children behind `aria-hidden`. Harmless but redundant; per create-visual rules, an inline SVG inside a non-interactive VizFigure should be `aria-hidden="true"`. Fine to keep the SVG as-is (its internal title/desc are inert), or tidy it when moving.

## Technical facts

**Build pipeline** (`astro.config.mjs`):

- Custom unified processor: `remarkMath` → rehype chain: `rehypeHeadingIds` (run before user plugins so anchors work), a local `rehypeBaseLinks` plugin (prefixes root-relative hrefs/srcs with `/blog` so authors write `/some-post/`), `rehypeKatex`, `rehypeMermaid` (`strategy: "inline-svg"`, neutral theme, compacted: 14px text, nodeSpacing 24 / rankSpacing 28 — Mermaid needs Chromium at build via Playwright), `rehypeAutolinkHeadings` (appended `#` anchor with aria-label).
- Syntax highlighting: Shiki dual themes `github-light-high-contrast` / `github-dark-high-contrast` (chosen because default github-light's orange fails WCAG AA on white); `mermaid` and `math` languages excluded from Shiki so the plugins own them.
- Images: `astro:assets` with `image: { layout: "constrained", responsiveStyles: true }` — resized variants, srcset, intrinsic dimensions, lazy loading from one Markdown line.
- Post-build gate: `checkDist` integration (`src/lib/dist-checks.ts`) fails the build on broken internal links/fragments, alt-less or unsized images, missing title/description/canonical/og:image.

**Islands mechanics:** `@astrojs/react` integration; `client:visible` = renders static HTML at build, emits an `<astro-island>` element whose `component-url` (the compiled component chunk) and `renderer-url` (React client renderer) load when the element scrolls into view — a reader who never scrolls there never downloads React. `client:load` for must-respond-immediately (the archive explorer uses it). The Counter island's built page confirms: `component-url="/blog/_astro/Counter.*.js"`, `renderer-url="/blog/_astro/client.*.js"`, `client="visible"`.

**Counter API** (`components/Counter.tsx`, 15 lines): default-export React component, no props, `useState` count, renders the shadcn `Button` ("Clicked N time(s)") in a `not-prose` bordered flex row with the caption "Hydrated React island", `data-testid="island"`. Unit test (`Counter.test.tsx`): RTL + vitest — renders, asserts "Clicked 0 times", fires a click, asserts "Clicked 1 time" (also demonstrates the singular/plural label).

**VizFigure contract** (`src/components/blog/VizFigure.astro` + create-visual skill): `name` (concise accessible name — what it shows; must be page-unique, ids derive from it), `summary?` (the at-a-glance takeaway, units/caveats preserved), `interactive?` (children stay in the a11y tree inside `role="group"` instead of being hidden behind `role="img"` + `aria-hidden` wrapper), `data?` `{caption, columns, rows}` rendered as an sr-only table when exact values matter (never on schematic/illustrative visuals — a table would invent precision). Decorative visuals skip it entirely (`aria-hidden="true"`/`alt=""`). Never hand-roll `role="img"` + `aria-label`. Visible captions go in `Figure`'s `caption` or a sibling — non-interactive VizFigure hides all children. Visuals must scale, never scroll (`overflow-x-auto` is for tables and code only).

**Token discipline:** all colours/type/radii/widths live in `src/styles/global.css` (`@theme` tokens + `@utility` classes); components — including post-local islands — use only token-backed Tailwind classes. No hex literals, no `text-[…]` arbitrary values, no inline styles, no per-post `<style>` blocks. The only other colour-literal file is `src/styles/theme.ts` (for renderers that can't read CSS vars: OG card, hero SVGs). Consequence worth stating: an island can't invent its own look — the Counter uses the same `Button` and tokens as site chrome, so demos age with the theme instead of against it. A class combo repeated in 2+ files becomes a token/utility, not a copy.

**Primitive catalogue** (all in `src/components/blog/`, all static `.astro`): Callout (5 variants, `role="note"`), Figure (`caption?`, `width: prose|wide|full`), VizFigure, Quote (`cite?`, `href?`), Aside (floats into the right margin ≥80rem, inline muted block below), Comparison (2–3 labelled columns, stack below `md`, labelled `<section>`s), Steps (CSS-counter numbers + connector line over a **plain Markdown `1.` list** — degrades to exactly that ordered list anywhere else), Details (native `<details>`, no JS), Tabs+Tab (see above), Video, CodeBlock (title header + delegated copy button, `aria-live` "Copied" announcement, one page-wide script), TableWrapper (automatic). Only Tabs and CodeBlock ship script.

## Terminology & caveats

- "Islands" / "selective hydration" — Astro's term is partial hydration; islands metaphor credit: Jason Miller (the old Aside example, worth keeping).
- Say "zero **framework** JavaScript" / "zero external scripts" for prose posts, not "zero client JavaScript" — the theme init, theme toggle, and TOC scrollspy inline scripts exist by design (site chrome is "plain Astro + a tiny inline script", per CLAUDE.md, deliberately not React-ified).
- Internal MDX links are root-relative (`/slug/`); the build prefixes `/blog` — never hardcode it.
- Reserved slugs, kebab-case slugs, `draft: true` = dev-only (never built/listed/fed/indexed) — fine to mention, don't deep-dive.
- The validation stack: Zod frontmatter → `validatePosts` cross-post → `check-dist` post-build → axe WCAG 2.2 AA e2e on every page. Error messages must say what's wrong *and* what to change — the "validator that says exactly what went wrong" line has real machinery behind it.
- Don't promise future posts (the two dead promises in the old posts are a cautionary tale).

## Proposed visuals

1. **Hero** — new, via `create-hero` (current `hero.png` is the placeholder). Natural concept: merge the two old heroes — labelled static blocks (Callout/Figure/Tabs/code) stacked in a page outline with one small highlighted island widget marked by a lightning bolt. Both old heroes (`building-blocks-of-this-blog/hero.png`, `interactive-islands-in-mdx/hero.{svg,png}`) die with their posts; the islands one has an SVG source worth cribbing from.
2. **`island.svg` — move, reuse as-is.** From `src/content/posts/interactive-islands-in-mdx/island.svg` to `src/content/posts/the-authoring-surface/island.svg`. 560×200 inline SVG: grey page outline, three text-bar rows, one highlighted box "island (hydrated)" vs "everything else: static HTML"; `currentColor` throughout except the island accent `#006a90`. Keep its VizFigure wrapper: name "A page outline with one hydrated island", summary "Most of the page is plain text blocks; a single small block near the bottom is highlighted as the island, so client JavaScript is a small fraction of the document." (Optionally add `aria-hidden="true"` when inlining per rule 8 above.)
3. **Counter — move, reuse as-is.** `interactive-islands-in-mdx/components/Counter.tsx` and `Counter.test.tsx` → `the-authoring-surface/components/`. Rendered `<Counter client:visible />` inside `<VizFigure interactive name="Counter demo" summary="A button that counts its own clicks; the count updates without a page reload.">`. Note: `create-visual/SKILL.md` line 47 references `interactive-islands-in-mdx/components/Counter.test.tsx` as the canonical RTL example — that path must be updated when the old post is deleted.
4. **In-post live demos of the primitives themselves** (Comparison, Callouts, Quote, Steps, Tabs, Details, CodeBlock, a Markdown table, a wide Figure, the Mermaid flowchart, the KaTeX formula) — carried from the building-blocks post; they are the visuals for the static half. The Mermaid flowchart keeps its `accTitle`/`accDescr`; the KaTeX formula switches to round: t_read = max(1, round(w/230)).
5. **One new visual that earns a place: "the ladder" as a small diagram** — the four rungs (Mermaid fence → static SVG → HTML+CSS → React island) with the stop-at-first-rung rule, annotated with what each costs at runtime (0 bytes / 0 bytes / 0 bytes / React + component, loaded on scroll). Semantics come straight from create-visual step 1; it's schematic, so `VizFigure name summary` with **no data table**. A `flowchart TB` Mermaid fence or a small static SVG both fit; keep rendered width ≤ 640px. This replaces the old posts' cross-referencing ("Part 2 is about that last case") with one picture.
