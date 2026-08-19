# Domain brief: omyac-upscaler-anchor-graph (retroactive)

Authority repo: `F:\github\sci.js`. Post: `e:\github2\blog\src\content\posts\omyac-upscaler-anchor-graph\index.mdx`. Direct source material: `blogs/omyac-upscaler.md`. Code truth: `libs/sci0-renderer/src/pic/omyac-upscaler/render-omyac-upscaler.ts` (the algorithm), `libs/sci0-renderer/src/pic/strategies/omyac-upscaler-strategy.ts` (the strategy wrapper), `apps/workflows/src/omyac-shared.ts` (the PNG writer with the diagnostic), `libs/sci0-renderer/src/pic/strategies/snap-blend-strategy.ts` (the blend table).

## 1. The story

The reversal is the story: the sibling post concluded that agi-up's architecture couldn't transfer into the snap pipeline; this post ports the entire architecture *as its own renderer* and it wins decisively. The strongest specific beats, all repo-verified:

- **The algorithm survived the engine change intact; only the encoding didn't.** Every geometric/topological pass (anchor projection, endpoint detection, connection rules, half-A/half-B Bresenham, vote kernel) is in the port essentially as described; all five fixes sit at the data boundary (`render-omyac-upscaler.ts` steps 1–8).
- **Four visible failure classes, one root shape**: SCI0 packs two nibbles per byte, `0xff` means both "solid white" and "never painted," and SCI0 artists leave the background at its init value. AGI has none of these.
- **The hot-pink diagnostic is a genuinely good artifact**: cells the algorithm considers null render `#ff00ff` — a color outside SCI0's palette — and the diagnostic ships as the default PNG path (`writeOmyacPng` in `omyac-shared.ts`: `cmdType[i] === 0 ? HOT_PINK_RGBA : BLEND_TABLE[pixels[i]]`).
- **An honest, quantified limitation**: the 3×3 isolated-pixel splat covers 100% of a cell at 2–3× but only 25% at 6×, so single-cell highlights render as dots.

## 2. Important technical ideas (verified against `render-omyac-upscaler.ts`)

- **Pipeline**: native 320×190 pre-render with per-pixel `refPixel`/`refCmd`/`cmdType` + per-command segment lists → anchors (cell centre by default; line cells projected onto nearest owning segment, best squared distance wins) → endpoint detection (`same < 2` of 8 neighbours) → line-anchor connection (8-dir same-command; endpoints additionally one connection per foreign same-colour line command, preferring directions with an opposite-side same-command neighbour; edge fallback rays) → fill-anchor connection (same-colour non-line neighbours; diagonal blocked if both flanking cardinals are line cells) → hybrid render at 6× (half-A/half-B Bresenham, off-canvas rays, anchor dots planted last) → enhance passes → final null-pixel mode fill.
- **The five fixes in code**: (1) `refPixel[i] = result.visible.pixels[i]` full byte, lines 171–176; (2) `sameColor` disambiguating via `cmdType`, lines 364–369; (3) `new Int32Array(256)` vote buckets, line 692; (4) tie-break averaging `BLEND_TABLE` entries and searching all 256 bytes, lines 756–787; (5) the `CMD_NONE → CMD_FILL` promotion sweep at end of pre-render, lines 241–245.
- **Enhance kernel**: mode-gated eligibility (`fill`/`line`/`all`), `suppressFill` at `lineNeighbours >= 3`, default pass sequence `fill×3, line×1, fill×2, all×4` (`DEFAULT_ENHANCE_PASSES`), isolated-pixel splat pass (lines 797–841: a pixel with no same-colour eligible neighbour floods its colour into surrounding `CMD_NONE` pixels).
- **Blend table**: okLab-mixed RGB per doubled-nibble byte, built in `snap-blend-strategy.ts` (`okLab.mix(labA, labB, 0.5)`), shared by snap-blend, the omyac strategy `postProcess`, and the PNG writer.

## 3. Factual corrections and missing context

**C1 — Missing the port's two hard limitations; the retirement framing overstates (should-fix).** The post says "why the project is moving away from `snap-blend` entirely," "We're committing to it as the default," and frames the line-weight eval as the only remaining gate before "snap-blend retires." The repo records two constraints the post never mentions, and they are the actual gate: `omyac-upscaler-strategy.ts` docstring — "**Visible layer only.** … leaves `priority` / `control` at their initial empty values. Suitable for comparison views and the sweep page, NOT suitable for game runtime (which needs priority and control layers for collision and sorting)" and "**Fixed resolution.** … throws if invoked at any other resolution." Repo CLAUDE.md agrees ("standalone PIC renderer … not wired into game runtime; visible layer only") and states the shipping default for game rendering is still `snap-v5-blend`. The sibling post (agi-up-as-a-reference-renderer) now carries exactly this caveat in its closing; this post — the one actually about omyac — contradicts it by omission. Readers come away thinking snap-blend's retirement is one eyeball-eval away; the priority/control gap is the bigger blocker. Minimum fix: one sentence stating omyac is a visible-layer PIC upscaler (fixed 320×190→6×), that game runtime also needs priority/control layers snap still provides, and that "default upscaler" means the PIC visual path, not the whole renderer.

**C2 — "dual-layer compositing" is not a snap-blend feature (should-fix).** Intro: "`snap-blend` improved pixel-space scaling with leak-detection heuristics, dither-aware resolution, and dual-layer compositing." No repo source describes snap-blend as dual-layer compositing; the term appears nowhere in `snap-blend-strategy.ts` or `blogs/snap-v5-blend.md`. The repo's actual third pillar is the **dual-resolution adaptive guard** — "using the native render as a per-fill oracle to supervise the upscaled render, with automatic rollback and fallback" (`blogs/snap-v5-blend.md`). "Dual-layer" also collides confusingly with the never-built dual-layer renderer idea from the sibling post. Correct to "a dual-resolution guard."

**C3 — Frontmatter description contradicts the body (nit).** Description: "five colour-model fixes at the encoding boundary." The post itself says fix 5 "is the only one of the five that isn't about how SCI0 encodes colour — it's about what 'no command plotted here' *means*." Four are colour-model fixes; the fifth is a canvas-coverage-convention fix. "Five boundary fixes" or "four colour-model fixes and one convention fix" would match the body.

**C4 — Provenance classification is line/fill/none plus brush and cel (nit).** The pre-render classifies `PLINE → CMD_LINE`, and `FILL`, `BRUSH`, `CEL` all as `CMD_FILL` (`render-omyac-upscaler.ts` lines 211–230). The post describes provenance as "line vs fill" only; brush/cel plots are silently fill-typed. Harmless simplification, worth one parenthetical at most.

**C5 — Claims about AGI/`hybrid.h` internals are author-vouched, not repo-verifiable (caveat, no change needed).** "AGI's valid colour bytes run `0x00`–`0x0f`," "the C reference's default is `fill × 3, line × 1, fill × 2, all × 4`," "AGI's typical 2–3× upscale," and the C tie-break behaviour have no `hybrid.h` copy in the repo to check against. The port's own default sequence does match (`DEFAULT_ENHANCE_PASSES` = fill,fill,fill,line,fill,fill,all,all,all,all), and the code comments assert the same AGI facts, so they carry the author's authority consistently.

Everything else checks out: the fix code snippets match the source near-verbatim; the four first-port symptoms match the fix rationales; the hot-pink diagnostic is on by default; the final mode-fill sweep defaults to black (`fillNullPixels`, `bestColor = 0x00`); views really are animated GIFs (`view-pipeline.ts`, `view.<id>.loop.<n>_a.gif`); the pic-dev sweep page exists (`apps/pic-dev/src/components/PicSweep.tsx`); "solid-fill regions match the existing perceptual dither rendering" matches the strategy's "Always blended" contract; "0x33 + 0x55 → 0x35" cyan/magenta example matches the code comment.

## 4. Terminology and caveats

- **Doubled-nibble byte** — `(high << 4) | low`; matching nibbles = solid, differing = dither pair rendered as an alternating checkerboard at native.
- **Sentinel collision** — `0xff` is both solid white and the never-painted init value; disambiguated only by `cmdType`.
- **Anchor / anchor graph** — one anchor per native cell in upscaled coordinates, plus an 8-direction connection bitfield.
- **Wireframe** — the pre-enhance hybrid buffer: anchors + Bresenham strokes on a mostly-`CMD_NONE` field.
- **Splat** — the isolated-pixel pass's 3×3 flood (centre + 8 neighbours).
- Caveats: the enhance kernel needs `minVotes` (2, or 1 in line mode) before a colour can win — a lone neighbour usually can't propagate; the null-pixel sweep mutates in place, so later pixels can vote on values it just filled (both in code, neither needs to be in the post).

## 5. Claims deserving evidence

| Claim | Evidence |
|---|---|
| All five fixes, as quoted code | `render-omyac-upscaler.ts` lines 171–176, 364–369, 692, 756–787, 241–245 |
| Endpoint = fewer than 2 of 8 same-command neighbours | `detectLineEndings`, `same < 2` |
| Diagonal blocked when both flanking cardinals are line cells | `connectFillAnchors` DIAGONALS loop |
| Half-A/half-B stroke; anchor dots planted last | `drawHybridLine` (`step < half ? colorA : colorB`); `hybridRender` third loop |
| `suppressFill` at 3+ line neighbours; mode semantics | `enhance()` lines 705–737 |
| Hot-pink diagnostic on by default; mode-fill defaults black | `omyac-shared.ts` `writeOmyacPng`; `fillNullPixels` |
| Blend table is okLab-mixed, shared with snap-blend | `snap-blend-strategy.ts` `buildBlendTable` |
| Registered side-by-side via the same strategy interface | `strategies/index.ts`, `omyac-upscaler-strategy.ts` |
| "decisively better on every PIC we've put it against" | author claim in `blogs/omyac-upscaler.md`; correctly phrased as tested-set, keep as-is |

## 6. Audit of existing visuals

- **Mermaid pipeline — correct, one omission.** Node contents, fix attachment points, and the enhance sequence all match the code. It omits step 8 (`fillNullPixels`, the null-pixel mode fill) between Enhance and output — the very pass the "Keep the diagnostic on" Callout leans on — and labels the output "RGBA output" when the library emits doubled-nibble byte + cmdType buffers that the strategy `postProcess`/PNG writer resolve to RGBA via the blend table. Adding one node ("final null-pixel mode fill → blend-table resolve to RGBA") would make it exact. Should-fix if touched anyway; not misleading enough to block.
- **`byte-packing.svg` — correct.** AGI low-nibble-only with `0xff` out of range; SCI0 `(high << 4) | low`; `0x33` solid, `0x3b` dither pair, `0xff` white-and-sentinel; closing line matches fix 2's out-of-band separation.
- **`anchor-projection.svg` — correct.** Cell-centre anchors → staircase stroke vs projected anchors → clean diagonal is exactly `buildAnchors`.
- **`splat-coverage.svg` + data table — correct.** 3×3 = 9 px vs s² cell: 2×→100% (capped), 3×→100%, 4×→56%, 5×→36%, 6×→25%. Math checks; 6× labelled as the port's factor is right (`OMYAC_SCALE = 6`).
- **Sweep images (8) and the two PNGs** — renders from the pipeline; alts describe them plausibly; the hot-pink diagnostic PNG's premise matches `writeOmyacPng` exactly. No flags.
- **Hero — premise fine.** Stair-stepped block line vs anchors projected onto a smooth diagonal stroke is the algorithm's core move.

## 7. Proposed additional visuals

One earns its place; nothing else does.

- **Wireframe → enhanced pair (conceptual/real render).** The post describes the hybrid output as "a sparse wireframe: anchors connected by Bresenham strokes against a mostly-empty background" but never shows it — and the code has a first-class hook for producing it: `OmyacUpscalerOptions.captureWireframe` returns the pre-enhance `wireframe`/`wireframeType` buffers, renderable through the existing `writeOmyacPng`. Semantics: left = pre-enhance buffer (thin strokes and anchor dots; all `CMD_NONE` pixels shown hot pink by the writer, which incidentally demonstrates the diagnostic on legitimate in-flight state), right = the same PIC after the default `fill×3, line×1, fill×2, all×4` sequence plus the null-pixel sweep. Caveat to state: the pink in the left image is expected (gaps between anchors mid-pipeline), unlike pink in final output. This directly grounds the "iteratively expands them into solid regions" claim, currently the only pipeline stage with no visual. The existing `hybrid-render-dither-preserved.png` shows a *post-enhance* render despite sitting under the "Hybrid render" heading whose text describes the sparse wireframe — a wireframe image would resolve that mild caption/placement tension too.

No new quantitative visuals: the splat table already covers the only numeric dataset in this post, and there is no per-PIC quality metric for omyac in the repo (the flagged-fills metric belongs to the snap lineage; nothing comparable was recorded for omyac).

## Appendix: wireframe pair generation (targeted expert follow-up)

The wireframe → enhanced pair was generated from the repo's own tooling for **SQ3 PIC 2** (the same wrecked-spacecraft scene the post's other renders use). Reproduction, from the sci.js repo:

```
cd libs/sci0-renderer && npm run build   # required — see note
cd apps/workflows && npm run omyac-upscaler -- sq3 2
```

Outputs land in `games/sq3/data/pics/2/source/` as `pic.omyac-upscaler-wireframe.2.png` (pre-enhance; `captureWireframe` is always on in this script) and `pic.omyac-upscaler.2.png` (default enhance sequence + null-pixel sweep); both are 1920×1140 and were copied into the post directory as `wireframe-pre-enhance.png` / `wireframe-enhanced.png`.

Note on the build step: the first render against a stale `dist/` of `@4bitlabs/sci0-renderer` picked up experimental modules (`relax-anchors.js`, `fill-satellites.js`, `render-omyac2.js`) that do not exist in checked-in `src/` (leftovers of the spring-relax/satellite-anchors experiments) and emitted a "relax diverged" warning. Rebuilding the lib from checked-in source removed the warning; the shipped images match the algorithm this brief documents.
