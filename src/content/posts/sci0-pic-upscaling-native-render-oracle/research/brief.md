# Domain brief: sci0-pic-upscaling-native-render-oracle (retroactive)

Authority repo: `F:\github\sci.js`. Post: `e:\github2\blog\src\content\posts\sci0-pic-upscaling-native-render-oracle\index.mdx`. Direct source material: `blogs/snap-v5-blend.md`. Code truth: `libs/sci0-renderer/src/pic/strategies/snap-strategy.ts` (v1: snapping + seed nudging), `snap-v2-strategy.ts` / `snap-v3-strategy.ts` (guards), `snap-v4-strategy.ts` (native-mask fallback), `snap-v5-strategy.ts` (gap closure), `snap-blend-strategy.ts` (blend table), `libs/sci0-renderer/src/pic/leak-detection.ts` (metric), `libs/engine/src/collision/ControlMap.ts` (control semantics), `memory/project_pic_fill_fix.md`.

## 1. The story

The core story is sound and repo-verified: SCI0 PICs are programs, not images; scaling breaks the fills' watertight assumption; and the fix that finally worked was *supervision* — render once at native resolution and let that render act as ground truth for every scaled fill. The surprising beats:

- The oracle idea is genuinely the pivot of the lineage: v3's docstring introduces per-fill limits "based on native-resolution pixel counts," and v4's native-mask fallback completes the recover-from-failure loop. `memory/project_pic_fill_fix.md` distills it: "Guard + mask > algorithmic cleverness — catching and recovering from failures is more robust than trying to prevent them."
- The closing line ("do it twice and compare") is the honest summary of what beat five generations of prediction heuristics.
- The AI-upscaling section's argument (deterministic base + enhanced overlay) is consistent with the engine's real constraints: priority/control layers drive collision and triggers (`ControlMap.ts`, CLAUDE.md's trigger evaluator).

## 2. Important technical ideas (verified)

- **v1 snapping** (`snap-strategy.ts`): endpoints snap to nearby *already-drawn* pixels — `findSnapTarget` scans a radius for non-`0xff` pixels under a distance budget (`snapDistMultiplier`) and directional cone (`coneBase`/`coneAxis`, `maxPerpDrift`). Plus **fill-seed nudging** away from upscaled boundaries (`fillNudgeMultiplier`) — the fix for the dominant "-100% undershoot: seed lands on a thick boundary → 0 pixels" failure.
- **v2 guard**: fixed rollback when a fill writes >40% of screen area (caught a 1M+ px catastrophic leak on PIC 4).
- **v3 adaptive guard**: per-fill limit = `nativePixels × scale² × maxOvershoot` (maxOvershoot default 5.0); fills exceeding it are rolled back mid-fill via `createGuardedFloodFill`.
- **v4 fallback**: when an upscaled fill produces 0 pixels and its native count is non-zero, the native fill mask is nearest-neighbour scaled and blitted in.
- **v5 gap closure**: diagonal-only two-corner test (TL+BR or TR+BL), before each fill.
- **Blend**: `snap-blend-strategy.ts` converts the whole visible layer per-pixel through `BLEND_TABLE` — a precomputed okLab-mixed RGB per doubled-nibble byte. No pattern detection is needed because each SCI0 byte already encodes the dither pair.

## 3. Factual corrections and missing context

**C1 — Wrong GitHub link: the post attributes the project to someone else's repository (blocking).** "It's the production strategy for [SCI.js](https://github.com/32bitkid/sci.js), a TypeScript reimplementation of the SCI0 engine focused on making Space Quest 3 playable in the browser." The project described (and where snap-blend lives) is *this* repo — remote `git@github.com:jonborchardt/sci.git`. `github.com/32bitkid/sci.js` is a different, real project by a different developer (32bitkid, author of the `@4bitlabs/*` packages this repo depends on); snap-blend does not exist there. Fix: link the author's own repo (or drop the link), optionally crediting 32bitkid's `@4bitlabs` libraries as the decoding foundation — which would be both accurate and gracious.

**C2 — The oracle check as described (±15% keep/restore band, symmetric undershoot handling) does not match the implementation (blocking for the mermaid + pseudocode).** The post's pseudocode and mermaid say: keep a fill only within 0.85–1.15× of expected×N²; otherwise (over *or* under) restore the snapshot and blit the native mask. The code does something different:
- The overshoot limit is `native × scale² × maxOvershoot` with **maxOvershoot = 5.0**, enforced mid-fill by the guarded flood fill with rollback (`snap-v3-strategy.ts`), on top of v2's 40%-of-screen catastrophic guard. There is no 1.15× runtime band.
- **There is no undershoot restore path.** Undershot fills are kept as-is — which is exactly why the sibling post reports "92% of the remaining flagged fills are undershoots" as the unsolved wall (`snap-v5-strategy.ts` docstring). If the renderer really restored every fill <0.85× expected, that wall could not exist.
- The native-mask blit fires only when a fill produced **zero pixels** with a non-zero native count (`snap-v4-strategy.ts`).
- The 15% figure is a *measurement* threshold from the earliest experiment report (`snap-strategy.ts`: "PICs 1-4, 6× scale, 15% threshold"), later standardized to 25% for the flagged-fills metric (`leak-detection.ts`, default 0.25) — it was never a runtime keep/restore band.
Correct semantics for the diagram/pseudocode: guarded fill rolls back if it exceeds ~5× its native-predicted area (or 40% of screen); a rolled-back or otherwise zero-pixel fill is recovered by blitting the scaled native mask; undershoots pass through untouched.

**C3 — "The road here" contradicts the omyac post and the repo (should-fix, consistency).** "v6 through v10 explored alternatives but didn't improve on v5's approach. Two of those detours have their own write-ups: [agi-up] and [the anchor-graph upscaler]." Two problems: (a) v10 *did* improve the metric (46→41, −10.9%, `snap-v10-strategy.ts`) — it was rejected because the win was invisible, not absent; "didn't earn a switch" is the accurate phrasing. (b) The anchor-graph upscaler (omyac) is **not** one of the v6–v10 detours — it's a separate paradigm (`omyac-upscaler-strategy.ts`: "NOT a snap-v* variant"), and per the sibling post and repo it decisively won the PIC visual path and is becoming its default, while snap-v5-blend stays the game-runtime strategy because omyac renders no priority/control layers. Calling it a detour that didn't improve on v5 is now wrong and contradicts series post 3.

**C4 — "Across tested rooms, snap-blend produced zero leaked fills while preserving native region boundaries at 3x scale" (should-fix).** Two issues: (a) The repo's corpus results are at **6×** (1920×1140) — every measurement in the strategy docstrings and every sweep image in this very post is 6×; no 3× results exist anywhere. (b) "Zero leaked fills" overstates: at the 25% threshold the corpus still flags ~12 leaks (plus ~81 undershoots) for v5 (`memory/project_pic_fill_fix.md`) — the guard catches and rolls back escapes so the *output* shows no catastrophic floods, but the metric is not zero. Supportable claim: "no catastrophic fill floods across the test corpus at 6×; escapes are caught, rolled back, and recovered from the native mask; the remaining flagged fills are small boundary-thickness deviations."

**C5 — Endpoint-snapping pseudocode mischaracterizes the mechanism, and seed nudging is missing (should-fix).** `snapEndpoint = round(x*scale)/scale` describes rounding to a fixed grid; the actual v1 snaps endpoints to nearby **already-drawn boundary pixels** within a distance/cone budget (`findSnapTarget`) — "aligns line endpoints to existing drawn pixels" (`memory/project_pic_fill_fix.md`). And v1's second half, **fill-seed nudging** off thick boundaries, is absent from the post entirely, despite being the fix for the single biggest native-oracle failure class ("seed on boundary → 0 pixels", `snap-strategy.ts` docstring). One sentence each would fix both.

**C6 — Control-map sentence is wrong about triggers (should-fix).** "Non white areas are walkable by the avatar, while non black areas will trigger event when walked over." First half correct: `isWalkable` = pixel is not white (`ControlMap.ts`). Second half wrong: trigger colors are **non-black AND non-white** — `getControlColor` "Returns hex color string if the pixel is a 'priority color' (non-black, non-white). Returns null for black or white." As written, white would trigger events. Correct: white blocks; black is walkable with no trigger; any other colour is walkable and triggers.

**C7 — Dither-blend pseudocode describes detection that doesn't exist (nit).** The post shows a 2×2 checkerboard detector with `isDitherPattern` + RGB averaging. The implementation needs no detection: each SCI0 byte already names its two-colour pair, and `snap-blend-strategy.ts` resolves every pixel through the precomputed **okLab-mixed** `BLEND_TABLE` (perceptual mix, not raw RGB average). The visual outcome shown is right; the mechanism isn't. A one-line reframe ("SCI0 stores the pair in the byte, so the blend is a per-pixel table lookup, okLab-mixed") fixes it.

**C8 — Naming (nit).** The production registered strategy is `snap-v5-blend`; plain `snap-blend` is the v1 blend variant in the registry (`strategies/index.ts` roster in repo CLAUDE.md). Using "snap-blend" as the family shorthand is fine, but the post should name `snap-v5-blend` once — it also keeps this post consistent with the other two, which both name it.

## 4. Terminology and caveats

- **Oracle** — the native 320×190 render used as per-fill ground truth (expected pixel counts + fill masks).
- **Guard / rollback** — the guarded flood fill that aborts and unwinds a fill exceeding its limit; distinct from the **metric** (flagged fills at 25% + 75-px floor, `leak-detection.ts`).
- **Native-mask fallback** — recovery blit for zero-pixel fills, not a general repair.
- **Seed nudging** — moving a fill seed off a thickened boundary; the other half of v1.
- **Doubled-nibble byte** — `(high<<4)|low`; the reason blend is a table lookup.
- Caveat: undershoots at scale are "expected physics" (thicker lines eat area proportional to perimeter, memory constraint 3) — the pipeline tolerates rather than fixes them.

## 5. Claims deserving evidence

| Claim | Evidence |
|---|---|
| Diagonal micro-gaps are the common leak source; two-corner test | `snap-v5-strategy.ts` ("Diagonal only: 199→193 BEST"; TL+BR / TR+BL) |
| Cardinal closure would merge legitimate regions (why only diagonal) | same docstring, "Why cardinal closure hurts" |
| Fallback "fires rarely" | `snap-v4-strategy.ts`: 5 fills recovered across 11 PICs (187→182) |
| Guard caught a catastrophic leak | `snap-v2-strategy.ts`: PIC 4 cmd 50, 1M+ px, ~49% of screen |
| "v5 out of ten attempts"; v1–v4 partial, v6–v10 no switch | strategy roster + docstrings (with C3's rephrasing for v10/omyac) |
| Priority = depth bands; control = walkability + triggers | `ControlMap.ts`, engine trigger evaluator (CLAUDE.md) |
| Blend is cosmetic, regions untouched | `snap-blend-strategy.ts` postProcess (visible-layer colour transform only) |

## 6. Audit of existing visuals

- **Pipeline mermaid — WRONG in the oracle branch (C2).** "within 0.85 to 1.15 of expected × N²" → keep, "outside → restore snapshot, blit native mask": replace with guard semantics (rollback beyond native×N²×5 or >40% screen; zero-pixel fills → native-mask blit; undershoots kept). The accDescr repeats the 15% claim and must change too. The phase-1/phase-2 shape, gap closure before each fill, and the final whole-canvas blend are all correct.
- **Oracle pseudocode block — same fix as C2.** The snapshot/restore framing is an acceptable simplification of rollback, but the thresholds and the undershoot branch are wrong.
- **`gap-closure.svg` — correct.** One empty cell between two diagonal boundary pixels; filled → fill contained. Matches v5.
- **`dither-blend.svg` — correct as outcome** (checkerboard → solid average, footprint unchanged); the *pseudocode* above it is what needs the C7 reframe, not the figure.
- **Deterministic-base/overlay mermaid — correct.** Matches the engine reality: priority/control masks are deterministic inputs to game logic; only sprites are enhanced.
- **Sweep images (14) — consistent.** All snap-blend renders at 6× (1920×1140), matching the pipeline's actual scale; alts describe the rooms plausibly.
- **`priority-map.png` / `control-map.png` — images fine; the *prose* between them carries the C6 error.** The control-map alt text itself ("black bands marking the walkable floor and green patches marking areas that trigger events") is correct per `ControlMap.ts`.
- **Diamond example (command stream + `diamond-gap-native-vs-3x.png`) — correct.** The bisecting line's endpoints (120,68)→(200,123) really do lie on the diamond's edges after rounding (slope −0.6875 from both corners), so the "independently rounded midpoints miss at scale" premise is sound.
- **Hero — premise fine.** 3× diamond with a junction gap and an "area ×9" oracle question is internally consistent (3² = 9).

## 7. Proposed additional visuals

None. The post already carries fourteen renders and three concept figures; the only quantitative dataset that could be added (the strategy-progression table 534→232→207→199→193 from `memory/project_pic_fill_fix.md`) carries the known threshold ambiguity flagged in the agi-up brief (193 vs 93 @25%) and belongs, if anywhere, in that post's lineage discussion rather than here. The fixes this post needs are corrections to existing visuals (C2), not additions.
