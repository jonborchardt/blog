# Domain brief: A contradiction-aware index of The Why Files (retroactive)

Authority repo: `E:\github2\captions` (deployed as the "WFD" GitHub Pages site). All numbers below were verified against the repo on 2026-08-19 by running `node dist/metrics/cli.js` and inspecting committed data under `data/`. Last repo commit: 2026-04-24 — the working tree and committed data are in sync, so these are the numbers behind the published site the post describes.

## 1. The strongest story

The post's core story is right and verified: 218 transcripts (`data/catalog/catalog.json`, 218 rows; 218 tracked transcript files) become a claim graph with typed contradictions and a transcript span on every edge, and the split of labor is the interesting part — neural sidecars for extraction, AI sessions for claim writing and contradiction verdicts, **pure code** for truth propagation, and a 49-signal regression gate over the whole corpus.

Two things the post under-plays that the repo makes vivid:

- **The verification funnel is brutal, and that's the point.** Of 141 AI-verdicted cross-video candidate pairs, only **1** is a strict logical contradiction; 7 debunks, 18 undercuts, 8 alternative — versus 63 SAME-CLAIM (agreement!), 34 complementary, 10 irrelevant (metrics `[contradictions]` section). Embedding similarity finds *topical overlap*; most overlap is agreement or noise. The final public surface is tiny and precise: **35 contradictions total** (17 pair, 17 cross-video, 1 broken-presupposition) out of 3,090 claims. The show agrees with itself (50 consonance entries) more than it contradicts itself. That asymmetry is the most surprising verified fact in the corpus.
- **Precision knobs exist that the post never mentions:** `debunks` pair-contradictions require both sides ≥ 0.7 directTruth (stricter than the 0.5 floor for `logical`) (`src/truth/claim-contradictions.ts:149-154`); SAME-CLAIM promotion rejects stance-opposed pairs and caps any one video at 4 consonance pairs (`src/truth/claim-indexes.ts:26-30, 419-433, 472-480` — 63 verdicts → 50 surfaced).

## 2. Important technical ideas (verified)

- Undercuts post-cap formula `1 - 0.2 × sourceTruth × sourceConfidence`, alternative at half weight, logical/debunks at full weight — exactly as coded (`src/truth/claim-propagation.ts:15-23, 119-133, 157-166`).
- Byte-for-byte evidence validation: `quote` must equal `flattenedText.slice(charStart, charEnd)` (`src/claims/validate.ts:168-171`).
- `promptVersion: "v2"` gate: `claims.promptVersionV2Pct = 100%` enforced (metrics output).
- 29 predicates confirmed (`config/relation-labels.json`); 49 metrics in 5 sections confirmed (live run: "total: 49 metrics · regressions: 0"); direction-aware gate confirmed (`HIGHER_IS_BETTER`, `src/metrics/index.ts:102`).
- Subkind travels in-string as a `[logical]`/`[debunks]`/`[alternative]`/`[undercuts]` rationale prefix, parsed at read time; schema stays v1 (`src/truth/contradicts-subkind.ts`).
- `verified: null` candidates filtered from public view (`web/src/components/facets/claims-duck.ts:67-75`).

## 3. Factual corrections

1. **Entity labels — wrong list and wrong count.** Post: "Fourteen typed labels — … `quantity`, `creature`, `group_or_movement`." Reality: **13** labels; `creature` has never existed in the config; `nationality_or_ethnicity` is in the config but missing from the post's list; `quantity` was removed on 2026-04-24 (commit 92d1600 "removed tags"), months before the post published. Current set: person, organization, group_or_movement, location, facility, event, date_time, role, technology, work_of_media, law_or_policy, ideology, nationality_or_ethnicity (`config/entity-labels.json`).
2. **Host stance enum is wrong.** Post (twice): "`asserts` / `denies` / `entertains`". Actual: `"asserts" | "denies" | "uncertain" | "steelman"` (`src/claims/types.ts:22`; enforced in `src/claims/validate.ts:40`). Corpus distribution: asserts 2,609 / denies 234 / uncertain 91 / steelman 73 / unset 83. There is no `entertains` value anywhere.
3. **`debunks` is not a relation predicate.** Post: "Twenty-nine typed predicates: located_in, founded, member_of, authored, debunks, and more." 29 is correct, but `debunks` is a *contradicts subkind*, not a predicate. Real predicates to cite instead: `denies`, `accused_of`, `funded_by` (`config/relation-labels.json`).
4. **"each with its own confidence threshold tuned against the corpus" — overstated.** All 29 predicates currently share threshold 0.3 (`config/relation-labels.json`); the global GLiREL `minScore` is 0.25 (`config/models.json`). The mechanism supports per-predicate tuning; the values are uniform.
5. **`role` and `law` entities are not in the database.** The post's "What it is" bullet lists "role … law" among indexed entity kinds, but `DELETE_LABELS` wholesale drops `role:*`, `law_or_policy:*` (and `quantity:*`) from the graph on every indexes rebuild (`src/ai/curate/delete-always.ts:31-35`). They're extracted, then deleted; they never appear in the public index.
6. **"The repo doesn't carry the corpus content" is false.** `git ls-files` shows `data/transcripts/` (218 files), `data/entities/`, `data/relations/`, `data/claims/`, and `data/aliases.json` all tracked since 2026-04-12, and the Pages workflow copies them from the checkout into `dist/data/` (`.github/workflows/deploy-pages.yml:68-84`). The repo's own CLAUDE.md "gitignored / don't commit corpus" invariant is stale. This also interacts with the post's "transcripts belong to The Why Files" note — the repo does publicly carry them.
7. **Manual contradictions: there are none.** Post: "A handful of `manual` contradictions (operator-authored) don't have evidence pointers." Current data: `aliases.json.customContradictions` = 0; `contradictions.json` has zero `kind: "manual"` entries (kinds: pair 17, cross-video 17, broken-presupposition 1). Either they were removed since writing or this is author-vouched about a past state — flag to author.
8. **"8–15 claims per video" is the prompt target, not the corpus.** Actual range across 215 claim files: **8–24**, avg 14.37. Fine to keep if phrased as target.
9. **Broken-presupposition semantics garbled.** Post: "claim B presupposes something claim A denies. Requires truth-asymmetry (A high, B low)." Actual detector: claim A (directTruth ≥ 0.5) *presupposes* claim B whose directTruth < 0.3 — a high-truth claim standing on a low-truth foundation. No "denies" edge is involved (`src/truth/claim-contradictions.ts:167-185`).
10. **delete-always.ts conflation.** The post describes it as holding "things that should never be in the graph … famous-name short forms like `person:tesla` → `person:nikola tesla`." Short-form promotion is `ALWAYS_PROMOTE` — a *merge*, not a deletion; the file holds three distinct lists (DELETE_ALWAYS / ALWAYS_PROMOTE / DELETE_LABELS).
11. **There is no "novel links" page, admin or otherwise.** Post: "gated behind admin while I figure out how to surface them." The `novel` pipeline stage writes `data/reports/novel.json` (`src/pipeline/stages.ts:907-911`); zero matches for "novel" in `web/src/` or `src/ui/`. Correction: detection runs; no UI exists yet.
12. **Entity-graph truth overlay colors edges only, not nodes.** Post: "nodes and edges shaded red→green." The overlay colors *edges* by averaged derived truth; nodes stay entity-type-colored (`web/src/lib/graph-render.ts:27-29, 99-113, 42-44`). (Argument-map nodes *are* truth-colored — different view; the post's argument-map caption is fine.)
13. **"Operator corrections… over a few hundred corrections" — partially unverifiable.** Claim-level operator corrections are all zero (truth overrides 0, deletions 0, field overrides 0, dismissals 0, custom 0 — metrics `[operator-corrections]`). Entity-level signal is real and large (1,209 notSame pairs, 51 dismissed clusters, 10 display overrides, 1 deleted relation, 923 merges — many auto-applied). The "improves new extractions" effect is author-vouched.
14. **Skeptic scoring description is thin but directionally off.** The scorer is primarily lexical — hedges, evasions, absolutes — plus contradiction-against-own-claims/graph signals (`src/skeptic/scorer.ts` header). "Tracks how their claims have held up" describes only one signal class. The post already flags it as rough; a one-word softening would fix it.
15. **Source/live links — verify, likely fine.** Local remote is `captions.git`; the deploy config targets `https://jonborchardt.github.io/WFD` (`.github/workflows/deploy-pages.yml:89`) and suggest-an-edit issues open at `github.com/jonborchardt/captions` (`web/src/lib/issues.ts:20`). The GitHub repo was presumably renamed captions→WFD (renames redirect). Author-vouched that `github.com/jonborchardt/wfd` resolves.
16. Minor: "seven kinds of overrides" in aliases.json — the v2 schema has 12 sections plus auditLog (`src/graph/aliases-schema.ts`; CLAUDE.md schema block); the post's grouping omits the curation-memory sections (`notSame`, `dismissed`).

Verified-correct claims the post can keep with confidence: 218 episodes; 49 signals / 5 sections; 29 predicates; never-refetch transcript rule; no regex in extraction (`src/nlp/` deleted — absent from `src/`); undercuts cap formula; pair-contradiction surfacing rule; verdict routing; consonance page; counterfactual UI is public (`web/src/lib/counterfactual.ts`, ClaimsPanel); VITE_ADMIN tree-shaking; :4173 dev API; ~1.5 MB code-split graph view; suggest-an-edit → prefilled issue with localhost apply link; base `/WFD/`.

## 4. Key terminology and caveats

- **Claim** = thesis-level, Wikipedia-section-worthy, debatable; **fact atoms** live in relations files. `directTruth` (anchor, never overwritten) vs `derivedTruth`; `truthSource` ∈ direct / derived / override / uncalibrated (corpus: 2,330 / 572 / 0 / 188).
- **hostStance** ∈ asserts / denies / uncertain / steelman.
- **Contradicts subkinds** [logical] / [debunks] / [alternative] / [undercuts] — in-string rationale tags.
- **Contradiction kinds** pair / broken-presupposition / cross-video / manual; **consonance** = cross-video agreements (SAME-CLAIM verdicts, gated).
- Caveats worth a line in the post: dependency coverage is 42.43% against a ≥55% aspirational target (flagged in the live gate); intra-video alternative/undercuts edges surface as per-claim "counterEvidence," not contradictions.

## 5. Claims deserving evidence (with the evidence)

- "35 contradictions" (screenshot alt) — exact: contradictions.json total 35.
- Denies-stance push worked: deniesPct 7.57% vs ≥5% target.
- Evidence-tightness lesson: p50 93 chars, p90 180, max 451 vs the 60–150 target.
- Verification-pass lesson ("mostly noise → low single digits"): 141 verdicts, only 34 contradiction-class (1 logical + 7 debunks + 18 undercuts + 8 alternative); 44 dropped as complementary/irrelevant; 63 were actually the *same claim*.
- 3,090 claims, 215 claim files over 218 videos (3 videos captionless/unclaimed), avg 14.37 claims/video.

## 6. Existing visuals audit

- **Pipeline mermaid** — semantically sound as a simplification. Nit: "8-15 claims per video" is the target (actual max 24).
- **Coupling-weights SVG + VizFigure table** — exactly matches `claim-propagation.ts` (1.0 / 1.0 / 0.5 / 0 + cap). Correct.
- **Verdict-routing mermaid** — correct. Optional enrichment: SAME-CLAIM→agreements passes two gates (stance-opposition reject, per-video cap 4).
- **Screenshots** — alts consistent with live data (35 contradictions ✓, 218 episodes ✓, DENIES/ASSERTS banners ✓). No corrections.
- **Hero** — premise (reels → claim graph → contradiction edge → transcript tether) is factually right. Keep.

## 7. Proposed additional visuals (grounded, all data included)

1. **Verdict-distribution bar chart** ("what 141 candidate pairs actually turned out to be"): SAME-CLAIM 63, COMPLEMENTARY 34, UNDERCUTS 18, IRRELEVANT 10, ALTERNATIVE 8, DEBUNKS 7, LOGICAL-CONTRADICTION 1. Semantics: only the last four classes (34 total) are contradiction-class; the largest bucket is *agreement*. This is the single best unpublished fact in the repo — it visually proves the "embeddings find topics, not disagreement" lesson.
2. **Stance-distribution table/bar** (supports the "stance matters" section): asserts 2,609 / denies 234 / uncertain 91 / steelman 73 / unset 83 of 3,090 claims — and doubles as the fix for the wrong `entertains` enum.
3. Optional: **evidence-length stat row** — target 60–150 chars; achieved p50 93 / p90 180 / max 451 — small, but it turns the "single-sentence evidence" lesson into a measured result.
