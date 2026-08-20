# Domain brief: simulator-watches-retirement-youtube

Authority repo: `F:\github\retire-sim`. Post: `e:\github2\blog\src\content\posts\simulator-watches-retirement-youtube\index.mdx`. Verified against `.claude/skills/theory-queue/SKILL.md`, `.claude/skills/theory-test/SKILL.md`, `scripts/transcript.ts`, `scripts/sources-rollup.ts`, `sources.json`, `theories.md`, `docs/superpowers/videos.md`, `src/App.tsx`/`src/ui/SourcesView.tsx`, and a fresh engine run of the committed textbook dataset (for the screenshot values). Hygiene note as before: no owner ages/dollars/dates may appear; the post currently complies — all quantitative content is aggregate scores or the synthetic textbook dataset.

## 1. The strongest story

The pipeline is real and the post describes it accurately: a one-URL-per-line text file → innertube caption fetch → claim triage → three experiment rows → set-arithmetic verdict → two committed scoreboard files → an in-app tab — with the loop closed by the channel-skip rule reading the same file the pipeline writes. The two genuinely surprising, repo-backed beats:

- **The system adjudicates its own convergence**: later videos increasingly resolve from rows already run (verifiably true in `theories.md` — most rows after the mid-teens are marked catalog-only/no-new-rows), so "the queue stopped being a discovery engine and became a filter."
- **The verdict is a list of years, not an opinion**: `failedStartYears` set arithmetic against the video's own protection story ("failed on its own terms, and you can point at the years") — the cash-bucket verdict in `theories.md` row 1 is exactly this shape.

## 2. Important technical ideas (all verified)

- **Queue mechanics** (`.claude/skills/theory-queue/SKILL.md`): `docs/superpowers/videos.md`, one URL per line; ` DONE` appended per-video the moment its theories.md row is written (step 5, "not in a batch at the end"); dedupe on the 11-char video id (step 1); channel check by fetching only the transcript header (step 2, first 3 lines) against `sources.json`; skip at **≥2 videos scored −1** ("One bad video is never enough to skip — the second one earns it," near-verbatim in the skill); ` NO-CAPTIONS` on exit code 2 with manual-paste fallback.
- **Captions, not pixels**: `scripts/transcript.ts` uses YouTube's innertube API with the Android app client (embedded-TV fallback for age-gates) — the post's "the way the YouTube app itself does" is literal.
- **Triage and honesty rules** (`theory-test` skill): three piles (mechanism / assumption / framing), nearest-primitive approximation with a written caveat, "never silently add engine features to test a video," open-question instead of fake verdict. All in the skill verbatim.
- **Three rows** (faithful / milder dose / hybrid-on-champion), hybrid as the load-bearing row — verbatim skill structure.
- **Scoreboard**: `theories.md` (one row per source), `sources.json` (id/channel/host/score −1..2/right/wrong tags with shared wording, `npm run sources` rollup via `scripts/sources-rollup.ts`), and the app tab — which really is labeled **"Vetted Videos"** (`src/App.tsx` line 85; the repo's CLAUDE.md still calls it the "Sources tab" — the post is right, the repo doc is stale). The insights block is hand-curated in `sources.json.insights` with exactly the categories the post lists (right-but-uncommon, wrong-but-believed, most-talked-about, channels-worth-more-of, engine gaps, convergence).
- **Score scale**: the post's four-row table matches the skill's definitions word-for-sense (−1 faithful-lost-to-baseline … 2 beat-champion/confirmed).

## 3. Factual corrections and missing context

Verified correct first: "which so far has been never" (zero `NO-CAPTIONS` markers in `videos.md`); the Berger verdict paragraph is a faithful compression of `theories.md` row 37 and his `sources.json` entry (score 1; `wrong: ["withdrawal policy matters more than allocation for sequence risk"]` — exactly the post's "tags on both sides"); the options-overlay "honestly untestable" story matches row 38 (listed options begin 1973, Cboe indices 1986 — after every failure cohort); "tax coordination in the pre-RMD window" is precisely the two score-2 entries; guardrails as the most-repeated real mechanism matches the tag counts (11 mentions) and the +2-pts record; "which asset fills the retirement window is said by essentially nobody" is the first item of the hand-curated insights block; and the strategy-comparison screenshot's numbers reproduce exactly from the committed textbook dataset at retire 65 / claim 62 (baseline 94.9%; "plan (2026)" 100%, median $2.8M; bucket faithful/mild/hybrid 100% with minima $0.32M/$0.29M/$0.59M vs the plan's $0.87M; cash-bridge rows 100%, median $3.6M).

Corrections:

1. **Stale counts (should-fix, same class as the earlier posts' fixes): "two were _correct_ …, fifteen _useful_, eight _mixed_, six _harmful_."** `sources.json` as of 2026-08-19: **2 correct, 19 useful, 10 mixed, 6 harmful — 37 videos across 25 channels** (harmful and correct counts unchanged; useful/mixed grew). The screenshot alt's "31 videos across 23 channels" is genuine-but-stale the same way. Either update the numbers with an "at last count" hedge, or timestamp them — they drift with every queue run.
2. **Stale superlative (should-fix): "The most recent video through the pipeline was Rob Berger's…"** Roughly eight sources have landed after it (`theories.md` rows: options correspondence, Harvey/Kitco, Holy Schmidt, Brandon Clark ×2, Benjamin Brandt, Nick Davis, Fidelity). Reword to "One of the later videos through the pipeline…" — everything else in that section stays accurate.
3. **Nit: "the harmful ones were the polished ones recommending a big bond or cash sleeve."** Four of the six harmful entries fit (Erin Talks Money, PensionCraft, Rachael Camp, Kitco/Harvey); the other two are deterministic-growth-projection kills (Retire Early with Mark; Retire With Harshita, which also has a bucket). "Mostly the polished ones…" fixes it.
4. **Missing context worth one caption sentence (should-fix): the strategy-comparison screenshot shows bucket rows at 100% success while the surrounding prose says buckets lost.** Both are true: the verdicts come from tighter runs where bucket rows failed real cohorts; on this well-funded synthetic dataset at 65 everything clears the bar and the difference shows up in worst-case/median wealth (bucket minima $0.29–0.59M vs the plan's $0.87M). This is the repo's own recorded dataset-transfer lesson (`datasets/national-average.json` `_learnings`: "strategies tuned on a well-funded dataset do not transfer"). Without a line saying so, the image quietly contradicts the text.
5. **One-word semantic error in `verdict-set-arithmetic.svg`** — see §6.

Consistency with the fixed siblings: "the asset filling the retirement window moved the earliest safe retirement age two years" ✓; guardrail "worth about a couple of points" / "moved it a couple of points" ✓; set-arithmetic vocabulary (rescue / keep / re-break) matches `theories.md` usage ✓; no median claim here to conflict with the corrected one ✓.

## 4. Terminology and caveats

- **Score scale** (theory-test skill): −1 harmful / 0 mixed-or-untestable / 1 useful / 2 correct — keyed to what the faithful and hybrid rows did, not to production quality.
- **Set-arithmetic vocabulary**: *rescued* = failed under the reference, survives under the row; *kept* = fails under both; *added/new* = survives under the reference, fails under the row; *re-broken* = a family a previous fix had rescued that a modification breaks again. The distinction between *added* and *re-broken* matters (see §6).
- **Caveats the post already carries correctly**: captions-only blindness to undescribed charts; engine expressiveness limits (flat withdrawal tax, no account location, no convex payoffs); scores are household-specific ("The scores are mine, not universal").
- Non-video sources (two private-correspondence threads) get theories.md rows but the score distribution counts videos; the counts in §3.1 are video entries.

## 5. Claims deserving evidence (with evidence)

| Claim | Evidence |
|---|---|
| Queue/DONE/skip/NO-CAPTIONS mechanics | `.claude/skills/theory-queue/SKILL.md` steps 1–5 |
| Channel-skip threshold: two harmful | skill step 2 (≥2 score −1) |
| Captions via the app's own API | `scripts/transcript.ts` (innertube Android client) |
| Triage piles, faithful-translation rule, open-question path | `.claude/skills/theory-test/SKILL.md` steps 1–2 |
| Three rows incl. hybrid-on-champion | same skill, step 2 |
| Score scale table | same skill, step 3 |
| Scoreboard files and rollup | `theories.md`; `sources.json`; `scripts/sources-rollup.ts` (`npm run sources`) |
| "Vetted Videos" tab + hand-curated insights | `src/App.tsx` (tab label), `src/ui/SourcesView.tsx`, `sources.json.insights` |
| Cash-bucket verdict wording | `theories.md` row 1 (kept inflation failures, added insufficient-growth) |
| Berger verdict and score | `theories.md` row 37; `sources.json` entry `gVYThVn5gQA` |
| Options overlay honestly untestable | `theories.md` row 38 |
| Screenshot table values | engine rerun of `datasets/textbook-4pct.json`, retire 65 / claim 62, pinned 2026-08 |

## 6. Audit of existing visuals

- **Hero** — queue → funnel → three rows → scoreboard: matches the pipeline. Not flagged.
- **`vetted-videos-insights.png`** — genuine screenshot of the Vetted Videos insights panel; its "most often right" (spending guardrails, tax coordination pre-RMD) and "most often wrong" (bonds as the sequence-risk hedge, cash buckets) match the tag frequency data. Counts (31/23) are stale vs today's 37/25 — same class as §3.1; retake or accept as dated.
- **Pipeline mermaid** — semantically correct against the theory-queue skill, including the no-captions loop-back and the dotted "past verdicts" edge into the dedupe/skip decision. (The skill checks channel calibre via a header-only transcript fetch before the full fetch; the diagram folds that into the decision node — acceptable compression.)
- **Triage mermaid** — matches the theory-test skill exactly (yes / nearest-primitive-with-caveat / gap-decisive → open question; assumptions fact-checked; framing mapped to mechanism).
- **`strategy-comparison-rows.png`** — all stated values reproduce from the committed textbook dataset (see §3, item 4 for the one caption sentence it needs).
- **`verdict-set-arithmetic.svg`** — structure is right (three cohort-family columns; baseline fails only extended-inflation; bucket keeps those, adds slow-growth; crash column already survived = "the video's story"; "(none rescued)" annotation correct; schematic counts disclosed in the caption). **One wrong word: the slow-growth annotation "re-broken: cash was the casualty" contradicts both the SVG's own legend ("failed start year, new") and `theories.md` ("added new insufficient-growth failures").** The baseline never failed those cohorts, so nothing was *re*-broken — they are *added*. Fix to "added: cash was the casualty" (or "new failures: …"). Small, but this figure exists to teach exactly that vocabulary.

## 7. Proposed additional visuals

None. The post already carries four visuals covering the pipeline, the triage, the results table, and the verdict semantics; the score distribution and tag rankings are covered by the insights screenshot. The only candidate I considered — a "rows added per video" convergence chart — has no authoritative per-video data in the repo (round journals don't consistently record rows-added counts), so it fails the evidence bar. The fixes this post needs are caption- and wording-level, not new figures.
