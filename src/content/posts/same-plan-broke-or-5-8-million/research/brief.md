# Domain brief: same-plan-broke-or-5-8-million

Authority repo: `F:\github\retire-sim`. Post: `e:\github2\blog\src\content\posts\same-plan-broke-or-5-8-million\index.mdx`. The post is a near-verbatim publish of the repo's own draft `blog-3.md`. Its data source is the **committed, synthetic** `datasets/textbook-4pct.json` (its `_note`: "Synthetic textbook 4%-rule household… Built for the blog's fan chart… NO real person's data"). **The title's $5.8M is from that synthetic dataset — publishable, not blocking.** I re-ran the engine (`runExperiment`, retire 65, claim 62, pinned `--now 2026-08`) and reproduced essentially every number in the post; details below.

## 1. The strongest story

One plan, 98 exhaustive historical replays, outcomes spanning $0 to $5.8M with zero behavioral difference — sequence risk as an *order* problem, not a volatility problem. The two most surprising, fully verified beats:

- **The 1929 retiree is fine and the 1966 retiree goes broke.** The worst crash in history plus deflation is survivable ($690k terminal, exact engine match); an undramatic 14-year inflation grind is not (ruin in plan-year 30). The killer is inflation-era ordering, not crashes.
- **The failure family is a property of the plan, and it's enumerable.** The engine literally lists `failedStartYears` per run (`src/model/simulate.ts`). Baseline fails exactly 1964–68; I verified the post's variant claims by running them: bond-heavier 40/60 fails 1961–68 (same family, widened), and the same plan at 5% spending fails a wide band around the same years (1956–73) *plus* 1928/1929/1936 and 1999/2000 — precisely "a wider band around the same years plus a few others."

## 2. Important technical ideas (verified)

- Plan encoding: `datasets/textbook-4pct.json` — $1M (all IRA), $40k/yr real spending, 60/40, retire 65 (born 1962-01 → retirement 2027, death 2057 = 30-year horizon), zero wage/SS/taxes/fees/events/guardrail. Matches every clause of the post's opening paragraph.
- Exhaustive replay: 98 start years (1928–2025, `src/model/history.ts`), one run each; ruin absorbing; results in today's dollars; runs outliving the dataset continue on the component-wise geometric-mean year (README "no wraparound splices") — the post's footer states this correctly.
- Annual rebalancing to target weights is embedded in the engine (owner journal: "the engine rebalances to target weights yearly") — the post's "rebalances annually" is literal engine behavior.
- Resolution: 1 percentage point = 1 cohort of 98 (`.claude/skills/experiment-round/SKILL.md`); the post's "94.6% vs 95.1% is noise" corollary matches the repo's standing resolution discipline.
- Narrative convention: the sim actually runs calendar 2026→2057 replaying the start-year's sequence; the post labels run-year *k* of the 1966 run as calendar 1966+*k*. Legitimate device; the footer's synthetic disclaimer covers it.

## 3. Factual corrections and missing context

**Verified correct first** (engine rerun, pinned 2026-08): median terminal $1.68M ("$1.7M" ✓), p10 $346k ("≈$350k" ✓), p90 $3.69M ("$3.7M" ✓), 1929 terminal $690k (exact), 1982 terminal $5.78M ("$5.8M" ✓), 1966 ruin at plan-year 30 at age 94 ✓, all five failures in plan-years 26–30 ("the last five years of the thirty" ✓), every checkpoint in the four-lives table within rounding (1929: 804/910/524k; 1966: 875/612/319/291/156k exact; 1982: 1579/2171/3516k; 2000: 815/688/742/869k), and — notably — **"the 1943 retiree — the median line" is literally true**: 1943 is the middle cohort of the sorted terminal distribution and its terminal ($1.677M) *is* the reported median.

Corrections:

1. **SHOULD-FIX (contradicts the repo record and the sibling post): "It didn't raise the median. It cut off the zero tail."** (in "What you can actually do about a lottery", about the owner's gold-window fix). The repo record says the opposite: owner journal `_learnings` — "90/10 stock/gold DOMINATES baseline … higher medians everywhere"; `README.md` findings — "better survival *and* better medians." The ai-lab post correctly says "Better survival _and_ better medians." The honest version of this post's point: the median gain wasn't the goal and isn't the trade you're signing up for — e.g. "It happened to raise the median too, but that's not why it won: it cut off the zero tail. That's the trade you want, even when it isn't free."
2. **SHOULD-FIX: "The 7%-real-per-year projection every planner uses is the mean across exactly this fan."** 7% real is the S&P's long-run real return (the repo's own theory-test skill: "8% real vs the S&P's ~7% long-run real"), i.e. a stocks-only number. The mean across *this 60/40 fan* is roughly 5% real. Fix by dropping the number ("The average-return projection every planner uses is the mean across exactly this fan") or using the 60/40 figure.
3. **Nit: "The 1929 retiree — who ate a 90% stock crash in year one."** The ~85–89% drawdown unfolded over 1929–32 (history.ts 1929 stock factor is 0.917, a −8% year); the post's own earlier paragraph says it correctly ("loses most of its value in the first three years"). Suggest "in the first three years."
4. **Nit (accept or align): the 2000 retiree's ending "≈$740k".** My pinned rerun gives $729k; the "≈" and the documented 1–2% asOf jitter cover it. No change needed unless retaking numbers.
5. **Missing context worth one line: reproducibility.** The dataset is committed — anyone can rerun this exact fan (`npm run experiments -- --config datasets/textbook-4pct.json`, or the UI with `?dataset=textbook-4pct`). The post links the simulator post but never says this experiment itself ships with the repo.

Consistency with the established ai-lab facts: frontier convention respected (no owner ages/dollars anywhere — the "my plan" paragraphs stay qualitative ✓), guardrail value "rescues a cohort or two" matches the +2-pts/2-cohort record ✓, "window around the retirement date" matches the ret−6..+9 champion ✓, plateau/one-more-year matches the crossover verdict in `theories.md` ✓, "Cash buckets and bond tents insure against 1929" matches the bucket/tent verdicts ✓.

## 4. Terminology and caveats

- **Real / today's dollars**: every reported figure is CPI-deflated to the run's start month; the engine brings all inputs forward via actual CPI plus `assumedInflation` beyond the dataset.
- **Cohort / failure family**: one start year / the contiguous set of failing start years; the textbook plan's family is 1964–68 (verified).
- **Fan**: one line per start year; the 10th–90th band and median are percentiles across start years per calendar year.
- **Caveats**: recent cohorts are partly projection (geometric-mean tail — the 2000 run's last few years are projected); success = wealth > 0 at deathAge, ruin absorbing, no recovery; success rate resolution is 1 cohort ≈ 1 pt; the narrative calendar labels are start-year + offset, not simulated calendar years.

## 5. Claims deserving evidence (with evidence)

| Claim | Evidence |
|---|---|
| Plan parameters as stated | `datasets/textbook-4pct.json` (all fields match) |
| 98 start years, exhaustive, geometric-mean tail | `src/model/history.ts` (98 rows 1928–2025); `runExperiment` in `src/model/simulate.ts`; README |
| Five failures = 1964–68, all in last five years | engine rerun: `failedStartYears [1964..1968]`, ruin plan-years 29/26/30/30/28 |
| Median $1.7M / p10 $350k / p90 $3.7M / $5.8M / $690k / $0 | engine rerun, pinned 2026-08: 1.677M / 346k / 3.689M / 5.776M / 690k / ruin 2056 |
| 1943 = the median retiree | engine rerun: middle cohort of sorted terminals, terminal = reported median |
| Bond-heavier fails same years harder | engine rerun, 40/60: fails 1961–68 (8 of 98, 91.8%) |
| Aggressive spending widens band + adds others | engine rerun, $50k spending: fails 1956–73 band + 1928/29/36 + 1999/2000 (78.6%) |
| Guardrail rescues "a cohort or two" | pieces-ladder record: +2 pts = 2 cohorts (owner journal, dashboard finalization) |
| Simulator lists failing start years | `--json` → `failedStartYears` (`scripts/experiments.ts`) |
| One more year worth ~20 pts below plateau | `theories.md` crossover verdict ("success climbs roughly 20 points per working year around the frontier") |

## 6. Audit of existing visuals

- **Hero** — fan from one starting amount, warm line to zero, blue line to top: matches the verified distribution. Not flagged.
- **Mermaid (one plan → 98 lives)** — semantically correct, including "2025 → history, then long-run average."
- **`fan-chart-baseline.png`** — alt matches the verified run (2026–2057, median $1M → ~$1.7M, lines zero to ~$6M; max terminal is $5.8M). Correct.
- **`four-lives.svg`** — endpoint labels 1982·$5.8M / 2000·$740k / 1929·$690k / 1966·$0 and the $0–$6M scale all verified; the caption honestly discloses dots-plus-straight-lines rather than actual paths. Correct. (Its 2000 endpoint inherits the ≈$740k-vs-$729k nit.)
- **`ending-balances.svg`** — positions check out on its own scale ($350k / $1.7M / $3.7M / $5.8M / $0 markers; "one of five start years (1964–68) that run out"). Correct.
- **Data tables in both VizFigures** — match the engine within stated rounding. Correct.

## 7. Proposed additional visual (one, earns its place)

**Failure-band strip: "which years ruin *you* is a property of your plan."** The post's most original corollary currently has no visual, and I verified all its data directly from the committed dataset + engine (retire 65, claim 62, pinned `--now 2026-08`):

- Row 1 — textbook plan (60/40, $40k = 4%): failing start years **1964, 1965, 1966, 1967, 1968** (5 of 98, 94.9%).
- Row 2 — bond-heavier, same spending (40/60): **1961–1968** (8 of 98, 91.8%).
- Row 3 — same 60/40, higher spending ($50k = 5%): **1928, 1929, 1936, 1956, 1959–1973, 1999, 2000** (21 of 98, 78.6%).

Semantics: x-axis = start year 1928–2025; one horizontal row per plan variant; mark failing start years as filled ticks/blocks. The message the data supports: the failure family stays anchored on the inflation cohorts in every variant; making the plan bond-heavier *widens that same band* (it never adds a crash-era failure), while overspending both widens it and admits new families (Depression-era, dot-com). Annotate each row with its count ("5 of 98 · 94.9%", etc.). Caveat to carry: cohort lists are exact at the pinned as-of month; success-rate deltas smaller than ~2 pts between variants would be noise, but these gaps (3 and 16 cohorts) are far above the floor. Reproduction: `runExperiment` over `datasets/textbook-4pct.json` with `allocation {stock:0.4,bond:0.6}` and `baseSpending 50000` overrides respectively.

No other additions — the post is visual-dense already and everything else is well covered.
