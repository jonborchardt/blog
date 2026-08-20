# Domain brief: retirement-simulator-ai-lab

Authority repo: `F:\github\retire-sim`. Post: `e:\github2\blog\src\content\posts\retirement-simulator-ai-lab\index.mdx`. Written retroactively against repo state as of 2026-08-19; the post was verified claim-by-claim against `README.md`, `CLAUDE.md`, `src/model/history.ts`, `experiments.json`, `theories.md`, the datasets' experiment journals, and `.claude/skills/{experiment-round,theory-test}/SKILL.md`.

Publication hygiene note (binding on any edit): the owner's candidate retirement ages, dollar amounts, and dates are personal data that must never appear in the post or this brief. The repo's own convention (`theories.md`, `README.md` findings) is mechanism + relative outcome only — "frontier age", "two years earlier", multiples of spending ("40x"), percentages. The post currently obeys this; keep it that way.

## 1. The strongest story

The post's framing is correct and well-chosen: a deterministic historical-replay simulator became a *lab* — committed experiment definitions, a dataset-local journal, two skills that encode the protocol — and the AI runs the protocol rather than giving opinions. The two most surprising, fully repo-backed beats:

- **Every de-risking strategy lost, and the winning hedge was gold** — because the failing start years were extended-inflation cohorts (the 1966–79 family in the original baseline diagnosis), and nominal bonds die in exactly those years (`_learnings` in `.secrets/2026.json`; `README.md` "Findings from the 2026 experiment season").
- **The method beat the folklore**: cohort-matching over diversification, dose-response over yes/no, a declared noise floor (1 pt = 1 flipped cohort of 98), and journaling before anything changes (`.claude/skills/experiment-round/SKILL.md`).

Under-told in the current post (see §3/§7): the repo later *stress-tested its own flattering assumptions* and priced every caveat in working years, and it ran a **silver control** proving the window mechanic is not a gold-peg artifact. Those two facts are the strongest available answers to the obvious reader objection ("gold's backtest is a 1971 artifact"), and they exist in the repo but not in the post.

## 2. Important technical ideas (all verified)

- **Exhaustive historical replay, not Monte Carlo sampling**: `runExperiment` in `src/model/simulate.ts` enumerates every start year in `HISTORY` (1928–2025, exactly 98 years, verified by counting `src/model/history.ts`); success = wealth still positive at `deathAge`; ruin is absorbing. Runs that outlive the dataset continue on the component-wise geometric-mean year, no wraparound.
- **Objective**: minimize retirement age subject to success ≥ ~85%; terminal wealth explicitly sacrificial; the `enough` ratchet is a one-way latch to a de-risked mix once wealth reaches a multiple of annual spending (`CLAUDE.md`, `README.md`).
- **Experiments as committed JSON**: `experiments.json` (62 rows currently), stable ids, mechanics only, no personal numbers; per-dataset verdicts in `experimentState`; `parseExperiments` (`src/model/experiments.ts`) *enforces* the standing constraints: no `smallCap` in mechanics, `guardrailCutFactor >= 0.85`, `guardrailYearsOfSpending <= 12`, no dollar `threshold`.
- **The champion** (`the-plan-v2` in `experiments.json`): gold taper 22% from ret−6 through ret+9, then permanent 10%, + guardrail 12y/15% + enough 40x landing 50/40/10. The window anchors moved from −5..+10 to −6..+9 in round 22 ("the window wanted to shift, not stretch") and round 23's full interaction cube confirmed the cell is a true local max.
- **Two skills**: `experiment-round` (preflight → pinned-`--now` run → resolution discipline → journal-before-change → design → one-round-then-pause; convergence = two consecutive rounds with no row beating the champion beyond the noise floor) and `theory-test` (URL required, `npm run transcript` for captions; sort claims into mechanisms / assumptions / framing; three rows: faithful, milder dose, hybrid-on-champion; verdict → `theories.md` row + journal + `sources.json` score −1..2).

## 3. Factual corrections and material staleness

1. **"| … | 31 more |" (theories table stub) — stale.** `theories.md` has **39** rows as of 2026-08-19 (post shows 2 + "31 more" = 33). Correction: "37 more", or better, a non-brittle phrasing ("dozens more") since this count grows continuously.
2. **Fan chart alt "from 2026 to 2071" — stale vs current repo.** The screenshot is genuine, but it predates commit `c10e00a` (2026-08-13), which changed `datasets/national-average.json` `deathAge` 92→88 (born 1979-01, so the horizon is now 2067) and introduced the two-person survivor model. A reader re-running today gets a chart ending 2067 with survivor effects. Either retake the screenshot or leave it — but know it is no longer reproducible.
3. **Strategy-grid screenshot shows rows that no longer exist.** "deep guardrail 10y/25%", the smallCap tilt row, and the golden-butterfly rows were all deleted from `experiments.json` on 2026-08-11 by owner decision (livability constraints and the smallCap ban are now validator-enforced). A reader who clones and runs `npm run experiments -- --config datasets/national-average.json` cannot reproduce this grid. Worse, the visible "deep guardrail 10y/25%" outscoring the honest guardrail (98.0% vs 88.8% at retire 67) is *exactly* the dishonest-guardrail trap the post warns about, uncaptioned. Retake with the current catalog, or add a caption noting the deep-guardrail row is the trap the text describes (that would actually strengthen the post).
4. **Mermaid 1 validate label, minor**: "no personal numbers" applies to the *committed* experiments/datasets side (`parseExperiments`), not to the gitignored personal config — a personal config legitimately contains personal numbers. The diagram routes both E and C through that label. Low priority; "no micro-caps, livable guardrails" is correct for the experiments path.
5. **Not a post error, but guard against a wrong "fix"**: the post says "twenty-seven rounds"; the repo's `README.md` says "Twenty-six rounds". The *post* is right — the owner journal runs through round 27 (2026-08-11, the friend's-email theory test) plus unnumbered silver rounds the same day. The stale file is the authority repo's README.

Everything else checked out, including: 98 start years (98 rows, 1928–2025, no duplicates); the eight columns (Damodaran's seven + silver from macrotrends, `src/model/history.ts` header); the geometric-mean continuation; "two years earlier" (baseline 85%-frontier moved two years by the plan; independently stated in `theories.md` row for the Rob Berger bucket video: "moved the earliest safe retirement age two years"); the 22%/−6..+9/10% window; the dose peak between a fifth and a quarter (in-window dose map 20/22/25/30 → 86.7/89.8/91.8/90.8 at the frontier age, 30% past the peak everywhere); "gold in accumulation is dead weight" (round 6, glide-in failure); "ending the hedge at zero re-broke the inflation cohorts" (round 17, land-at-100%-stock verdict); the enough-ratchet buffer requirement (`enough-32-6x` note: "threshold too low — paths ratcheted into a mix that could not carry remaining spending"); the micro-cap discount (README: "unbuyable spreads and vanished-after-publication premia"; journal: 5–20% spreads, no float, missing delisting returns); the noise floor and one-round-then-pause (both verbatim in the skill); both theory-table rows (near-verbatim from `theories.md` rows 1–2); the tax-video verdicts ("first theory whose mechanism beats the champion — as a sensitivity bound", 2027 top priority); Golden Butterfly ("wins historic crises while failing the expected future"); VPW ("spending collapse relabeled"); Harvey ("mean-reversion warning survives as the standing caveat").

## 4. Terminology and caveats

- **Cohort** = one historical start year's complete sequence. **Frontier** = earliest retire age clearing the 85% bar. **Noise floor**: 1 pt = 1 flipped cohort of 98; asOf re-stamping jitters 1–2 pts; <2 pts = tie.
- **Guardrail** = spending cut (`guardrailCutFactor`, floor 0.85) triggered when wealth < `guardrailYearsOfSpending` × spending (cap 12y). **Enough ratchet** = one-way permanent de-risk latch at a wealth multiple of spending. **Free** = success identical to the base row (the FULL-PLAN certification check).
- **Honest-names caveat** (history.ts header): `gold` is pegged $35/oz pre-1971 (no meaningful gold history before then); `smallCap` is bottom-decile stocks, not a fund; `realEstate` is price-only Case-Shiller; `silver` has pre-1963 Treasury price-support distortion and the 1979–80 Hunt spike.
- Inflation-cohort ranges vary by strategy and tax assumption (1966–79 for the original baseline diagnosis; 1959–72 / 1955–73 in later verdicts). The post's "1966–79" is correct for the diagnosis it describes.
- Gold = bullion-backed ETF, not physical, not miners (journal buying-mechanics entry) — the post already says this correctly.

## 5. Claims that deserve evidence (with the evidence)

| Post claim | Repo evidence |
|---|---|
| "98 start years, 98 runs, exhaustively" | `src/model/history.ts` (98 rows, 1928–2025); `runExperiment` in `src/model/simulate.ts` |
| "never appears in the build / anyone can run it" | `vite.config.ts` secrets middleware; `npm run build` succeeds with zero secrets (`CLAUDE.md`); `datasets/national-average.json` |
| "de-risking lost; inflation cohorts; gold rescues" | `_learnings` 2026-08 entries; `README.md` findings |
| "22% window −6..+9, then 10%" | `experiments.json` `the-plan-v2`; rounds 22–23 journal |
| "dose peaks fifth-to-quarter" | journal FINAL dose map 20/22/25/30 → 86.7/89.8/91.8/90.8 |
| "guardrail trap" | round 5 journal; validator constraint in `src/model/experiments.ts` |
| "ratchet free only when buffered" | `enough-41-9x` vs `enough-32-6x` notes |
| "micro-cap backtest unbuyable" | README findings; decision-rationale journal entry |
| "noise floor / one round / convergence" | `.claude/skills/experiment-round/SKILL.md` steps 2, 3, 6 and Convergence section |
| "theory-test pipeline and verdicts" | `.claude/skills/theory-test/SKILL.md`; `theories.md`; `sources.json` |

## 6. Audit of existing visuals

- **Hero (`hero.png`)** — premise fine: overlaid per-start-year wealth lines with a couple hitting zero matches the Results-chart semantics and a ~98% cell (2 of 98 cohorts fail). Not flagged.
- **`strategy-grid.png`** — semantics correct (survival % · median / worst-case terminal wealth, bold ≥85%, retire ages 62/65/67/70 columns, national-average dataset), but stale vs the current catalog and contains the uncaptioned dishonest-guardrail trap (§3.3).
- **Mermaid 1 (JSON row → scored cell)** — correct except the validate-label nit (§3.4).
- **`wealth-fan-chart.png`** — semantics correct (98 faint paths, 10th–90th band, median); horizon stale (§3.2).
- **Mermaid 2 (theory-test flow)** — semantically correct against the skill: URL required, captions via `npm run transcript`, three claim piles, three rows, run vs baseline and champion, cohort diagnosis, fan-out to theories.md/journal/sources.json. No changes.
- **`gold-window.svg`** — exactly right: 0% accumulation, step to 22% at −6, hold through +9, step down to permanent 10%; axes labeled years-from-retirement / share of portfolio. Matches `the-plan-v2`. No changes.
- **Mermaid 3 (experiment-round state diagram)** — correct, including check-fails-stop, journal-before-change, mandatory pause, and convergence ("no row beats the champion twice running" is a fair compression of the two-consecutive-rounds rule).
- **`config-tab.png`** — alt matches `datasets/national-average.json` exactly (wealthParts 401k/IRA/brokerage/cash; wage; base spending; three insurance fields; death age; per-field help from `src/ui/fieldHelp.ts`). No changes.

## 7. Proposed additions

**Visual (earns a place): the pieces ladder.** A small bar/step chart quantifying what each decision piece buys — it is the repo's own final dashboard form and directly proves the post's thesis that the gold *window* is the load-bearing piece. Authoritative semantics (2026-08-11 "dashboard finalization" journal entry; owner dataset, pinned as-of 2026-08, 5% withdrawal-tax base case, SS claim 62, success % across 98 start years at the frontier retirement age — the age itself must not be printed):

- baseline (100% stock) ≈ **76.5%** → + guardrail 12y/15% ≈ **78.6%** (**+2 pts**, "spending rule") → + gold as a static asset (80/20 + guardrail) (**+12 pts**, "gold as the asset") → + window timing (taper 22% ret−6..+9) ≈ **99.0%** (**+8 pts**, "the window") → + enough ratchet 40x = **identical** (**+0, free**).
- Draw the 85% bar; annotate the noise floor (±1–2 pts, 1 pt = 1 cohort). Deltas are the authoritative payload (journal: "spending rule +2, gold-as-asset +12, window timing +8, ratchet free"); if absolute intermediate bars are wanted, re-read them from a pinned `npm run experiments -- --now 2026-08` run rather than reconstructing.
- Supporting caveat worth its own annotation: "the taper alone still clears the bar (94.9% at the frontier) — no piece is load-bearing for the frontier except the gold window itself" (same journal entry).

**Prose additions (no new visual needed), both materially strengthen the gold claim against the obvious objection:**

1. **The silver control** (silver-rounds journal entry): mirroring the plan with silver — which had a real market price pre-1971 where gold was pegged — reproduces and face-value beats the gold plan, proving the window mechanic is not a gold-peg artifact; but silver's frontier is fragile under a −2%/yr drag while gold's survives its own, so asymmetry-of-error keeps gold. One or two sentences where the post currently mentions the silver column in passing.
2. **The caveat ledger** (rounds 26–27): the flattering assumptions were made runnable as permanent return-drag stresses; each caveat priced in working years (tax neglect ~2, equity valuations ~1, gold reversion ~0–1, joint ~1–2), the plan's edge over baseline *widens* under identical pessimism, and a fully-degrading gold hedge is a no-op, not a liability, at the decision ages — "the honest insurance against unmodeled tails is one more working year, not a different portfolio." Fits naturally in the Takeaway; keep it to a sentence or two since the companion post owns the theory verdicts in depth.

No other visuals proposed — the post already carries seven, and nothing else in the repo would add semantics the existing ones don't.
