# Domain brief: agi-up-as-a-reference-renderer (retroactive)

Authority repo: `F:\github\sci.js`. Post: `e:\github2\blog\src\content\posts\agi-up-as-a-reference-renderer\index.mdx`. The post's direct source material is `blogs/c-reference-renderer-retrospective.md` in the authority repo; the code-level truth lives in `libs/sci0-renderer/src/pic/strategies/` and `memory/project_pic_fill_fix.md`.

## 1. The story

The strongest story is unchanged and well told: a promising external reference (OldManYellsAtCode1's `agi-up` anchor-graph upscaler) was prototyped into an existing pipeline (`snap-v9`, `snap-v10`), produced a real but visually meaningless metric win, and was rejected — with exactly one small rule surviving the transfer. The surprising parts, all repo-verified:

- The winning variant (V10) was **rejected despite improving the metric with no per-PIC regressions** — `snap-v10-strategy.ts` docstring: "The 10.9% metric improvement is real but produces no visible difference … The metric was the wrong target."
- The one transferable idea was a **single-pixel seal** — `plantJunctionSeals` in `junction-seal.ts` plants exactly one pixel per qualifying X-junction, and only if that pixel is still unset.
- The incompatibility was **provable in advance** from the pipeline's own prior experiments: v6 (`snap-v6-strategy.ts`) had already established "Block expansion size must be ≥ scale factor … This definitively rules out ALL line-thinning approaches," which forecloses agi-up's thin anchor-to-anchor re-rasterization.
- Epilogue twist (the post's spoiler already gestures at it): the author later ported the **entire** anchor graph anyway (`libs/sci0-renderer/src/pic/omyac-upscaler/`, `blogs/omyac-upscaler.md`), and it beat snap-blend on every PIC as a visible-layer upscaler — see correction C6.

## 2. Important technical ideas (verified)

- **snap-v* lineage**: v1 (`snap-strategy.ts`) endpoint snapping + fill-seed nudging; v2/v3 adaptive per-fill leak guard with rollback; v4 (`snap-v4-strategy.ts`) native-mask fallback for zero-pixel fills; v5 (`snap-v5-strategy.ts`) diagonal-only micro-gap closure. Cardinal closure was tested and made things worse (v5 docstring: cardinal-only 199→204).
- **Flagged-fills metric** (`libs/sci0-renderer/src/pic/leak-detection.ts`): a fill is flagged when its upscaled pixel count is more than 25% off the native-derived expectation (default `threshold = 0.25`) **and** the absolute delta exceeds `minPixelDelta` (default 75 px). Overshoot = leak, negative = undershoot.
- **Provenance buffers** (`junction-seal.ts`): a native 320×190 pre-render records per-pixel `cmdType` (0 none / 1 PLINE / 2 FILL, `Uint8Array`) and `cmdId` (command index, `Int16Array`, −1 unplotted), visual-mode plots only.
- **The junction-seal rule** (code truth): for each native FILL cell, examine its four diagonals; if the diagonal cell is also FILL, both flanking cardinals are LINE cells, and the two flanking `cmdId`s **differ**, plant one pixel at the upscaled shared corner (`floor(corner × scale)`), colored from a flanking line cell, only where the layer is still unset. Applied per active layer (visual/priority/control).
- **V9 vs V10 composition**: V9 = V4 base + seal, deliberately bypassing V5's closure; V10 = V5 base + seal stacked (docstrings of both files).

## 3. Factual corrections

**C1 — Pipeline order is wrong (prose + mermaid).** Post: "a single extra pass … that runs **after gap closure** and before each flood fill," and the mermaid shows Gap closure → Junction seal → Fill. The repo says the opposite. `snap-v10-strategy.ts` docstring, "Execution order before each FILL": *1. V10 structural seal … 2. V5 pixel-pattern closure … 3. V4 adaptive fill* — and the code agrees (`SnapV10Strategy.processCommand` calls `plantJunctionSeals` and then `super.processCommand`, which is where V5's `closeGaps` runs). The seal runs **before** gap closure.

**C2 — "V10 improved the metric on every PIC in the sample" overstates.** `snap-v10-strategy.ts`: "No per-PIC regressions: V10 either improves **or ties** V5 on every PIC." Correct claim: no per-PIC regressions / improves-or-ties.

**C3 — "That one rule produced the metric improvement on the leak side" is contradicted by the post's own table.** V10 vs V5: leaks 6→5 (−1), undershoots 40→36 (−4); V9 vs V4 moved only undershoots (44→42, leaks flat at 8). The *mechanism* is leak-shaped (sealing junction gaps so fills stay contained / seeds don't wander), but the flags it cleared were mostly in the undershoot column. Rephrase around the mechanism, not the column.

**C4 — Attribution of the "two different line commands" condition.** The post credits agi-up with crystallizing "flanked by two _different_ line commands." Per `junction-seal.ts` header, the rule was "Adapted from the C reference (`hybrid.h`) — specifically the `connect_fill_anchors` diagonal-flanking suppression rule, **tightened to require two DIFFERENT line commands** flanking the diagonal (true X-junctions only, not L-bends within a single polyline)." The different-commands tightening was made in the port, on top of agi-up's rule.

**C5 — Corpus/threshold figures are mixed without saying so.** The post pairs "534→193 across 11 PICs" (from the v5 docstring: "11 PICs, 25% threshold") with v6's "92→547." But `memory/project_pic_fill_fix.md` (PICs 1–15) reports snap-v5 as **93 flagged @ 25%** ("193 (93 @25%)" in its table, "75% reduction from … 534"), and v6/v7 baselines of 92–93 belong to *that* measurement config, not the 193 one. The repo is internally inconsistent about which threshold produced 193; the post inherits the inconsistency and juxtaposes numbers from two configs as if one. Minimum fix: note that the two figures come from different measurement runs/corpora. Also the metric definition omits the `minPixelDelta = 75` floor (leak-detection.ts) — small fills below a 75-px delta are never flagged.

**C6 — The ending is stale.** "The next real move is the dual-layer rendering split. That's the structural fix V5 told me to do five experiments ago." No dual-layer renderer exists anywhere in the repo (no hits in code, memory, or BACKLOG). What actually happened next is the full omyac anchor-graph port: `blogs/omyac-upscaler.md` — "omyac was decisively better on every PIC we've put it against. The project is moving to it as the default upscaler and snap-blend is on its way out." The existing spoiler link partly covers this, but the closing prediction now reads as a path taken when it wasn't. Also nuance: "snap-v5 is still the one I ship" — the shipping default for game rendering is the **blend variant**, `snap-v5-blend` (repo CLAUDE.md); omyac remains visible-layer-only and unsuitable for game runtime (no priority/control layers), so the shipping claim survives, barely.

**C7 — "rooms 2–6, the worst offenders in my corpus" is unverifiable.** Docstrings say only "PICs 2–6"; the per-PIC results file both docstrings cite (`plans/snap-v9-validation/initial-results.md`) no longer exists in the repo. The claim originates solely in the author's own draft. Keep only if the author vouches; otherwise soften to "a 5-PIC sample (PICs 2–6)."

**C8 — Native-mask fallback trigger (minor, prose + mermaid edge label).** Post/mermaid: fallback "when a guarded fill rolls back to zero pixels." `snap-v4-strategy.ts`: fallback fires when the upscaled fill produced 0 pixels **and** the native count was non-zero — root causes include guard rollbacks but also seed-on-boundary failures and leak cascades. "Zero-pixel fills" is the accurate trigger.

## 4. Terminology and caveats

- **Flagged fill / leak / undershoot** — per-fill metric outcome, not a visual judgment (V10 proved a 10.9% metric win can be invisible).
- **Block expansion** — each native line pixel → scale×scale block; not cosmetic, it bridges Bresenham steps (v6's "Critical learning").
- **X-junction vs L-bend** — the seal fires only where two *different* line commands cross (X-junction); L-bends inside one polyline are V5-closure territory. This distinction is exactly why V9 alone lost to V5 (regressed on PICs 2, 3, 4; beat V5 only on PIC 5's one X-junction artifact — v9 docstring).
- **PLINE / FILL** — the SCI0 draw-command names in this codebase (`cmdType` classification in `buildCmdTypeMap`).
- **blend variants** — every snap strategy has a `-blend` sibling; `snap-v5-blend` is the production choice.
- Caveat: undershoots at 6× are "expected physics" — small regions lose area ≈ perimeter × 5 extra px (memory constraint 3); that is the 92%-of-remainder wall.

## 5. Claims deserving evidence (all verified)

| Post claim | Evidence |
|---|---|
| 534→193, 11 PICs, 92% undershoots, "line junction points where Bresenham lines meet at angles" | `snap-v5-strategy.ts` docstring (but see C5) |
| v6: 92→547, thin lines catastrophically leak | `snap-v6-strategy.ts` (leaks 12→306, undershoots 81→241) |
| v7: added pixels inflate subsequent fill counts | `snap-v7-strategy.ts` "Post-fill repair breaks per-fill accounting" |
| Table: v5 6/40/46, v9 8/42/50 (+8.7%), v10 5/36/41 (−10.9%); ~650 fills in sample | `snap-v9-strategy.ts`, `snap-v10-strategy.ts` docstrings |
| V5/V10 visually indistinguishable; fixes are localized boundary patches | `snap-v10-strategy.ts` "Why it was rejected anyway" |
| "a couple of strategy classes' worth of code" | v10 docstring: "~250 lines … doubles the prepare-time native pre-render cost" (the cost line is unused supporting detail) |
| V9/V10 archived, junction-seal.ts + buffers kept | `@deprecated REJECTED` tags; `junction-seal.ts` present and shared by V9+V10 |
| Spoiler: full anchor-graph port later | `libs/sci0-renderer/src/pic/omyac-upscaler/render-omyac-upscaler.ts`, `blogs/omyac-upscaler.md` |

## 6. Audit of existing visuals

- **Mermaid pipeline diagram — WRONG.** Junction seal is drawn after gap closure; actual order is seal → closure → fill (C1). Correct semantics: Block expansion (line-draw time) → per-FILL: junction seal (v9/v10, fed by cmdType/cmdId buffers) → diagonal gap closure (v5) → seed nudge + guarded flood fill (v1–v3) → native-mask fallback on zero-pixel fills (v4). The accDescr repeats the wrong order and must change too; the fallback edge label "rolls back to zero pixels" should be "produces zero pixels" (C8).
- **`line-thickness.svg` — one wrong label.** "flagged fills 92 → 547 (leaks)" — 547 is *total flagged*; leaks were 12→306 and undershoots 81→241. Drop "(leaks)" or split the numbers. Everything else (staircase gaps, seed escape, 6-px band containment, hatched stolen area = undershoot) matches repo semantics.
- **`junction-seal.svg` — correct.** Fill–fill diagonal, two flanking cardinals owned by different line commands (A ≠ B), one seal pixel at the upscaled shared corner, planted pre-fill: exactly `plantJunctionSeals`. The "a few dozen pixels per PIC, all told" caption is an author assertion with no surviving repo count — tolerable, but it is unverifiable.
- **Results table — correct** (matches docstrings digit for digit, including the ~650-fill denominator in surrounding prose).
- **Hero — premise is factually fine.** Two staircase lines from different commands, single seal pixel at the junction, 6×6 grid: consistent with the code. No flag.

## 7. Proposed additional visuals

None earn their place. The post's story is qualitative (constraint mismatch), its three visuals already carry the mechanism, and the one dataset that would genuinely add depth — per-PIC v5/v9/v10 breakdowns — no longer exists in the repo (the cited `plans/snap-v9-validation/initial-results.md` is gone; only aggregate docstring numbers survive). A lineage-progression chart (534→232→207→199→193) is possible from `memory/project_pic_fill_fix.md` but would propagate the C5 threshold inconsistency and duplicates ground the linked native-oracle post owns; skip it.
