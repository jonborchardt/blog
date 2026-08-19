# Domain brief: repos-as-experts

Authority repo: `E:\github2\blog` (this repo, investigating itself). Author material: outline for a post about how posts get made here — skills as executable editorial process, and other repositories as consulted domain experts. Evidence paths cited throughout are repo-relative unless noted.

## 1. Story & emphasis

The strongest story is the two ideas fused, not listed:

1. **Skills**: the editorial workflow is not habits or vigilance — it is seven committed procedure files (`.claude/skills/{write-post,create-series,create-hero,create-visual,review-post,publish-post,wrapup}/SKILL.md`) an agent executes. Quality is process. Every gate is written down, so any agent session produces the same pipeline.
2. **Authority**: every technical post names another repository as its domain expert (`authority` frontmatter). An agent is dispatched *into* that repo, works there as that repo's expert, and returns a **domain brief** committed at `src/content/posts/<slug>/research/brief.md`. The blog builds the post from the brief; a second expert pass validates the finished draft. Repos literally get consulted as experts on posts about themselves.

What is genuinely surprising and worth emphasizing (all repo-verified):

- The division of labor is explicit and asymmetric: **the authority repo owns domain truth and domain judgment** — "what the story actually is, what matters and what is misleading" — while **the blog owns the artifact** (structure, prose, MDX, visual design, a11y, presentation). It's in `write-post/SKILL.md` § Authority verbatim. The expert is a *co-author of meaning*, not a fact-checker.
- Expert calls are rationed by contract: **one investigation, one validation** ("maximize information per call"). Extra calls need one of four named justifications. And there's a hard don't: "Never send the expert styling, spacing, typography, responsive layout, theme usage, accessibility mechanics, or MDX/component conventions — those are blog-side."
- The one existing brief (agi-up, below) shows the expert doing real editorial work: overturning the post's own pipeline diagram, calling a claim unverifiable, declaring the ending stale, and *declining to propose any new visuals* ("None earn their place").
- The system was adopted **after** ten technical posts were already published — and the repo is honest about that: a temporary `retrofit-authority` skill with a checked-in `worklist.md` is backfilling briefs, one repo group at a time, and the skill deletes itself when done.

## 2. The skills pipeline

Per-skill one-liners plus the gates each enforces:

- **write-post** — scaffold (`npm run new-post`, which refuses reserved/duplicate slugs and unknown series/tags), settle slug/title/description/tags/series/**authority**, dispatch the expert investigation, write prose from the brief, run the mandatory visual pass, fix frontmatter, build hero, `npm run validate && npm run build`, look at it in dev, hand to review. Leaves `draft: true` — publishing is a different skill's job. Holds the shared Authority contract other skills reference rather than restate. Also the entry point for *revising* a post: skip the scaffold, the published post becomes the author material.
  - Memorable specific — the **visual candidates table**: paragraph does a data flow → Mermaid flowchart; describes states → state diagram; makes a quantitative claim → SVG chart with a `data` table; spatial idea → schematic; side-by-side → two-panel. And the enforcement line: "Typical yield for a technical post is 2–4 visuals; **zero means the pass was skipped, not that nothing qualified.**"
  - Another: "a plausible-looking wrong diagram is worse than none" — every code-describing diagram gets checked against the brief before drawing.
- **create-series** — registry entry in `src/config/series.ts` first, post second; the build fails on unknown series ids. Rule: never point a series `hero` at the grey placeholder — "a grey placeholder card is worse than the first post's real image."
- **create-hero** — hand-drawn `hero.svg` → `npm run render-hero` (resvg, no image model, no browser). The alt sentence comes *first*: "If you can't write that sentence, the idea is not concrete enough." Palette locked to `src/styles/theme.ts` hexes. "Never leave the grey placeholder." "Never a stock photo, gradient-only card, or the title repeated as art."
- **create-visual** — a medium ladder (Mermaid fence → static SVG → HTML/CSS → React island; "do not default to React"), then classify meaningful/interactive/decorative, wrap in `VizFigure` (which owns the ARIA wiring and renders `data` as a hidden table), then write name/summary with a register table ("Model C charges triumphantly across the benchmark savanna" is the canonical *never*). Hard rule: visuals scale to fit, **never scroll** — a horizontal scrollbar on a diagram is a defect you fix by redrawing, not wrapping. This skill "consumes the brief, it doesn't plan" — no brief file means planning hasn't happened.
- **review-post** — the second expert pass (validation, "not another discovery round") plus automated gates (`validate`, `build` with check-dist link/alt/SEO checks, e2e with axe WCAG 2.2 AA) plus a human-judgment read-through (frontmatter, structure, a11y, screenshots at 360/1280 in both themes, OG card). Output is a findings list, blocking/should-fix/nits with file:line — "Do not silently rewrite the post." And: "Semantic errors or stale domain facts are **blocking** even when the implementation/build is clean."
- **publish-post** — flip `draft: false`, set dates, full `validate && build && test:e2e`, conventional commit, push `main`, then **verify the live URL**: the page renders at `jonborchardt.github.io/blog/<slug>/`, the homepage/archive list it, `rss.xml` includes it, and the social card previews. Never publish a `REPLACE ME` description; never add a draft-preview-in-production path.
- **wrapup** — whole-site audit when a batch is done: gates, then grep sweeps where "each hit is a contract violation" (color literals outside two allowed files, hardcoded `/blog/`, raw `<img>` on rasters, uncleaned timers, hand-rolled `role="img"`, leftover `REPLACE ME`), then a11y/motion/contrast/width checks and docs sync.

The pipeline shape: write-post (contains create-visual + create-hero as sub-steps) → review-post → publish-post, with wrapup as a batch-level outer loop and create-series as a registry side door.

## 3. The authority contract

Source of truth: `write-post/SKILL.md` § Authority (lines 15–28); `review-post` § Authority review; referenced (not restated) by `create-visual` step 0 and `create-hero` step 1.

**Lifecycle** (exactly four steps, numbered in the skill):

1. **One substantial investigation pass** by an agent operating *inside* the authority repo — it "inspects its repo-local CLAUDE.md, source, tests, docs, data, experiments" and "makes domain decisions rather than merely returning files." Output: the **domain brief**, saved verbatim to `src/content/posts/<slug>/research/brief.md`.
2. Blog side writes prose, builds visuals and hero **from the brief — no expert calls for anything the brief covers**.
3. **One validation pass** on the substantially finished draft (review-post sends the expert the actual claims, values, and each visual's semantics, pointed at its own brief "so it can check the draft against what it previously asserted").
4. Blog side fixes findings.

Extra calls are allowed only for: expert-flagged ambiguity, data unavailable at brief time, implementation surfacing a new domain question, or a correction that materially changes a claim or visual.

**What the brief must contain** (write-post step 2): the strongest overall story and what's surprising; the important technical ideas; factual corrections to the supplied material; terminology and caveats; claims deserving evidence, *with* that evidence; and proposed visuals — quantitative ones with "all authoritative data and semantics needed to build it correctly (values, units, what each axis/series means, thresholds)," conceptual ones with states, relationships, ordering, transitions.

**Why briefs are committed**: the skill says it directly — the brief "is committed with the post (the repo is public: nothing in it you wouldn't publish) and is what visuals, hero, and review work from instead of re-asking; a later targeted expert answer gets appended there too." Committed = public, reusable across revisions, appendable. review-post even backfills: a pre-workflow post with no brief gets the expert's corrected facts "saved as the brief for future edits."

**Division of labor**, quotable: the authority repo owns "behavior, terminology, data meaning, technical claims, evidence, caveats, and the semantics of every visual"; the blog owns "structure, prose, MDX/React implementation, visual design, accessibility, and presentation." And review-post's discipline line: "Do not substitute your own interpretation for what the expert can verify."

## 4. Evidence

**Every one of the 16 posts carries an `authority`.** The map (from frontmatter grep):

| Authority repo | Posts |
|---|---|
| `F:\github\sci.js` (SCI0/AGI renderer) | agi-up-as-a-reference-renderer, omyac-upscaler-anchor-graph, sci0-pic-upscaling-native-render-oracle |
| `F:\github\retire-sim` (retirement Monte Carlo sim) | retirement-simulator-ai-lab, same-plan-broke-or-5-8-million, simulator-watches-retirement-youtube |
| `E:\github2\earth` (Android AR app) | android-development-with-claude, worldlock-ar-window, ponytail-lazy-senior-dev |
| `E:\github2\captions` | why-files-contradiction-index |
| `E:\github2\blog` (itself) | an-agent-built-this-blog, the-authoring-surface, building-blocks-of-this-blog, interactive-islands-in-mdx, primitives-fixture, **repos-as-experts** |

**Committed briefs: exactly one so far** — `src/content/posts/agi-up-as-a-reference-renderer/research/brief.md` (commit `f2a87be` "post: authority retrofit agi-up-as-a-reference-renderer"). It is an excellent exemplar of what the contract produces. Concrete observations to use in the post:

- It's headed "Domain brief: agi-up-as-a-reference-renderer (retroactive)" and organized exactly per the contract: story → technical ideas → **eight numbered factual corrections (C1–C8)** → terminology → claims-with-evidence table → audit of existing visuals → proposed visuals.
- **C1 overturned the post's own diagram**: "Pipeline order is wrong (prose + mermaid)… The repo says the opposite… The seal runs **before** gap closure." The visuals audit is blunt: "**Mermaid pipeline diagram — WRONG.**"
- **C6 caught a stale ending**: the post predicted a "dual-layer rendering split" as the next move; "No dual-layer renderer exists anywhere in the repo… What actually happened next is the full omyac anchor-graph port."
- **C7 flagged an unverifiable author claim**: "'rooms 2–6, the worst offenders in my corpus' is unverifiable… Keep only if the author vouches."
- **C5 caught the repo contradicting itself** — the expert noticed its *own* docstrings and memory files disagree about a threshold, and told the blog to disclose that instead of papering over it.
- The proposed-visuals section **declines**: "None earn their place… the one dataset that would genuinely add depth… no longer exists in the repo." An expert that says no is the strongest evidence the role is real.
- Quote-worthy domain fragment it surfaced from source: "The 10.9% metric improvement is real but produces no visible difference … The metric was the wrong target."

## 5. The retrofit (honest adoption evidence)

`.claude/skills/retrofit-authority/` is explicitly **TEMPORARY** — "Delete this directory when `worklist.md` is fully done." It backfills the authority lifecycle onto the ten published posts written before the workflow existed (posts about the blog itself are excluded: "the blog repo is its own authority and the permanent skills already govern it"). It is "pure orchestration — every rule lives in the permanent skills."

Worklist status as of 2026-08-19 (`worklist.md`): **1 of 10 done-ish** — `agi-up-as-a-reference-renderer` is `built` (brief committed, corrections applied; not yet `validated`/`shipped`); the other nine are `pending`. Statuses flow `pending → briefed → built → validated → shipped`, with a `no-change` short-circuit: if the expert pass produces no reader-visible change, commit only the brief as a plain `chore:` with no `updatedAt` bump.

Two memorable operational details:

- **One expert agent per authority repo, continued across all its posts** — "its repo context is the expensive part; don't rediscover it per post."
- The worklist contains a **flagged suspect mapping**: "⚠ `ponytail-lazy-senior-dev` → `E:\github2\earth` looks like an odd mapping… Confirm with the author before spending an expert call on it." The process even budgets skepticism about its own inputs.

## 6. The self-reference angle

`repos-as-experts` has `authority: 'E:\github2\blog'` — the blog repo is the domain expert on how the blog gets made. This document is that expert's investigation pass, and it will be committed as `src/content/posts/repos-as-experts/research/brief.md`, making the post the second post with a brief and the first whose brief was produced by the repo it lives in. Land this as a plain fact, not a flourish: the contract says "treat that repository as the domain expert" — for a post about the pipeline, the pipeline's repo is simply the correct authority, the same way `F:\github\sci.js` was for the upscaler post. The recursion is a consequence of applying the rule uniformly, and the committed brief is checkable proof the rule was applied. One honest wrinkle worth a sentence: when authority == the blog, the expert/artifact division of labor collapses into one repo, so the separation is procedural (two passes, a committed brief) rather than physical (two codebases).

**Schema nuance — flag this in the post**: in `src/content.config.ts` the field is `authority: z.string().min(1).optional()` with the comment "Path to the repo that is authoritative for this post's domain facts (contract: .claude/skills/write-post — Authority)." It is **schema-optional but skill-required** ("`authority` is required for a new technical/project post" — write-post § Inputs). The build will not fail on a missing authority; the *process* demands it. That's a deliberate seam: the Zod schema enforces what a machine can check (lengths, registries, dates), while the skills enforce what only procedure can check. In practice all 16 posts currently set it.

## 7. Caveats & honest framing

- **The expert can be wrong, and its sources can be wrong.** The agi-up brief itself documents the authority repo being internally inconsistent (C5: two measurement configs, contradictory docstrings). The contract guarantees a *process* — evidence-cited claims, one accountable investigation — not truth.
- **Briefs go stale.** C6 is live proof: the post's ending was correct when written and false months later. A brief is a snapshot; the append rule and the revise path (re-ask only what the brief doesn't cover) mitigate, not eliminate, drift.
- **Authority paths are local Windows paths.** `F:\github\retire-sim` means nothing to a reader — it identifies a repo on the author's machines, and some authorities may not be public at all. The frontmatter field is machine-address, not citation; the *brief* is the public artifact a reader can actually check. The post should say this plainly rather than pretend the paths are links.
- **Coverage is one brief out of ten owed** (plus this one). The retrofit worklist is mostly `pending` — the system is newly adopted, and the repo tracks that honestly rather than claiming retroactive rigor.
- **Nothing enforces brief quality.** A lazy expert pass would produce a thin brief and the build would still be green; the only backstop is review-post's validation pass and the fact that briefs are public.
- **One repo, one author, agent-scale evidence.** No claim should generalize beyond "this works here, and here's the committed paper trail."

## 8. Proposed visuals (2, both conceptual — no data tables; these are structural, not quantitative)

**V1 — Skills pipeline flowchart** (Mermaid `flowchart TB`, per create-visual sizing rules: short `<br/>`-broken labels, ≤ 640px). Nodes and edges:

- `write-post` (rectangle: "write-post<br/>scaffold · brief · prose") → `create-visual` ("create-visual<br/>mandatory pass") and → `create-hero` ("create-hero<br/>SVG → PNG") — both as contained/invoked steps (draw as a subgraph "write-post invokes" or two child nodes rejoining).
- Rejoin → `review-post` ("review-post<br/>gates + expert validation") — edge label from write-post: "draft: true".
- Decision from review-post: findings → back-edge to write-post labeled "fix findings"; clean → `publish-post` ("publish-post<br/>flip draft · push · verify live").
- `publish-post` terminal annotation: "verify: live URL, RSS, listings".
- Side node, dashed, not on the main chain: `wrapup` ("wrapup<br/>whole-site audit") spanning before publish for batches; `create-series` feeds write-post ("registry first"). Keep these two small or cut `create-series` if width suffers.
- The key boundary to mark (per the candidates table "type/unit boundary" rule): the `draft: true → draft: false` flip happens **only** inside publish-post — label that edge.
- accTitle: "The editorial pipeline as skills"; accDescr states the chain and the single point where draft flips false.

**V2 — Authority lifecycle** (Mermaid `stateDiagram-v2` or a two-lane flowchart; two-lane is truer). Two columns/lanes: **Authority repo** and **Blog repo**. Transitions, in order:

1. Blog → Authority: "dispatch agent + author outline" (call 1 of 2).
2. Authority internal state: "investigate<br/>source · tests · docs" → produces **"domain brief"**.
3. Authority → Blog: "brief committed to<br/>research/brief.md" — mark this artifact node distinctly (it's the only thing that crosses the boundary and persists publicly).
4. Blog internal: "write prose · build visuals · hero<br/>from the brief — no expert calls".
5. Blog → Authority: "finished draft" (call 2 of 2, validation).
6. Authority → Blog: "confirm / correct<br/>against repo evidence".
7. Blog internal terminal: "fix findings → publish".
- Dashed exception edge between lanes labeled "targeted question<br/>(only if brief doesn't cover it)" — appended to the brief.
- Caption/summary takeaway: exactly two expert calls per post; the brief is the committed interface between the two repos; domain truth flows one way, the artifact never crosses back except to be judged.
- accDescr must state the two-call budget and that the brief file is the persistent public artifact.

Skip a third visual. A worklist-status chart (1 built / 9 pending) is a sentence, not a chart (write-post's own rejection rule), and the evidence table in § 4 reads better as an actual table in prose.
