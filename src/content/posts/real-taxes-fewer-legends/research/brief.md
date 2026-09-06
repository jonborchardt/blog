# Domain brief: "Real Taxes, Fewer Legends" (retire-sim, blog.md dated 2026-09-04)

Authority repo: `F:\github\retire-sim`. Produced by the authority agent on 2026-09-04 for the post `real-taxes-less-hearsay` (directory real-taxes-fewer-legends).

Scope note: everything below was verified against the **uncommitted working tree** of `F:\github\retire-sim` (HEAD `ec29031`, 2026-09-03; `blog.md`, `datasets/public-example.json`, `src/model/cohorts.ts`, `cache.ts` are untracked; `plan.ts`, `policies.json`, `sources.json`, `theories.md` are modified). All CLI runs used `--now 2026-09`. Nothing from `.secrets/` was opened; only rates, percentages, counts and start years are reported. Where blog.md, `policies.json` notes, `theories.md` or `CLAUDE.md` disagree with a fresh run, the run wins and the doc is marked stale.

---

## 1. The story and the findings a reader must leave with

**The story (4 sentences).** For a year the simulator answered tax questions with one flat "effective tax on withdrawals" knob, set to 5% because YouTube said a coordinated household could get there; that 5% moved the earliest safe retirement age a year earlier and earned two videos the catalog's top score. A bucket-and-tax engine that tracks nine account types, real brackets, ACA and IRMAA thresholds and RMDs, replayed over the same 98 historical start years, shows the real lifetime rate is 22% (four times the legend), and that every "convert as soon as you retire" scheme pays discretionary tax out of the portfolio in exactly the years that decide whether 1929 or 1965 survives. The only conversion rule that is free on survival waits out the first ten retirement years and fires only while the portfolio is at least 25 times spending; it keeps every cohort and cuts lifetime tax about 11%. Roth moves are a tax-and-estate lever, not a survival lever, and most tax advice describes a household with a big brokerage account, which a maxed-pre-tax saver is not.

**Findings, ranked (each verified in section 3):**

1. **Timing, not dose, is the whole conversion answer.** Day-one conversions lose cohorts in proportion to dose: IRMAA-tier ceiling −1 cohort (1965), top-of-22% −2 (1961, 1965), top-of-24% −7, and the worst ruin age falls (85 → 82 → 81 → 76). The same IRMAA ceiling gated to after-window-and-funded: 0 cohorts lost, same worst ruin age, lifetime tax −11%, heir value +5%. *Surprising because every video says the opposite.*
2. **The flat 5% was a legend; the real lifetime rate is 22%, and it is back-loaded.** Realized rate on draws by age band at retire 55: 12% (55–59), 14% (60–64), 15% (65–74), 31% (75+). The 75+ band is the surprise: RMD tax lands on a small spending base once Social Security covers most spending. And the lifetime number is the wrong *knob* setting: a flat rate front-loads it onto the early years, so the knob was calibrated to reproduce failed cohorts (15% at retire 55) rather than to the bill.
3. **Roth is a tax/estate lever, not a survival lever.** Mega-backdoor: worth two cohorts (skipping it loses 1935 and 1965, +22% tax). Roth 401k election: costs the same two cohorts while cutting tax 25% and raising heir value 5%; wrong trade for a retire-as-early-as-possible objective. Before the engine charged the working-year tax on a Roth election, it looked like free money. *Surprising: the bug flattered the election by exactly the amount that flips the verdict.*
4. **"Right mechanism, wrong household."** 0% gain harvesting is byte-identical to baseline (never a dollar of room: brokerage is gone within two retirement years, then rule-of-55 pre-tax draws fill the band). The ACA-subsidy bridge loses a cohort and adds 30% lifetime tax for a small credit. Stop-contributing-at-the-sweet-spot loses a cohort and adds 30% tax. All three assume a big taxable account and low ordinary income.
5. **Access plumbing is second-order.** The rule of 55 is why 55 is the bridge-free age; at 54 a 72(t) SEPP rescues 2 of 29 failing cohorts (1957, 1973), and the other 27 are a wealth problem. (Keep only if the post keeps retire 54 at all.)

The widow's penalty is real but smaller than the draft says (see §3): +10% survivor lifetime tax at identical cohorts, not +14%, and the after-window rule absorbs part of it rather than "doubling its edge". Demote to one sentence or cut.

---

## 2. What to cut or compress (clarity-first)

**Cut whole sections:** "What shipped in the last day", "How easy the changes were" (engineering diary; keep at most the two-bug paragraph as a sidebar), the run-cache story (one clause under "distrust a result that flatters an election", or nothing), the 35-row policy table (replace with the 8-row set below), the "Effect on the scoreboard" table (compress to two sentences: six scores moved, the two former top marks dropped to 1 because the timing was wrong, Julia's "stop contributing" went to −1; channel means optional).

**Cut from the prose:** the "three definitions gave 13%, 18%, 22%" paragraph and the "hand measurement moved the knob to 18%" history (unreproducible, and it is about the author's process, not the reader's understanding); the harvesting "probe of one representative history" (keep the one-sentence mechanism); the "roth-deferrals-convert-to-irmaa-1", "bridge-ladder", "convert-under-aca", "skip-spouse-ira", "megabackdoor-to-roth-ira", "roth-ira-before-roth-401k-draws", "roth-source-out-at-separation", "harvest-0-ltcg-from-medicare", "harvest-then-convert", both asset-location rows, "pretax-only", "proportional-draws", "bracket-fill(-22)-draws", "convert-to-12" rows (either byte-identical, duplicates, or engine controls). One line can say: "nine more rows were byte-identical to baseline or to another row; they are in the catalog."

**Glossary: keep 9, cut 6.** Keep: pre-tax vs Roth (merge the two account bullets into one contrast), brokerage + cost basis, brackets + standard deduction, MAGI with ACA cliff and IRMAA folded into one bullet ("two income-tested thresholds: the pre-65 health-insurance credit vanishes above 4× the poverty line; from 65 Medicare premiums jump above the first IRMAA tier"), RMDs, rule of 55, Roth conversion, cohort/start year, sequence-risk window, baseline policy. Cut as standalone terms: mega-backdoor (define inline in finding 3), 72(t)/SEPP (inline, only if retire 54 stays), 0% harvesting (inline in finding 4), widow's penalty (inline or cut), "filling the 12% bracket" (only the no-op needs it; inline).

**Minimal policy set (8 rows), plain English, retire 55 / SS 65, `--strategy "plan v2 (2026)"`:**

| id | one-liner | result vs baseline |
|---|---|---|
| `baseline` | Max every tax-advantaged contribution while working; never convert; spend cash and brokerage first, then pre-tax, Roth last. | fails 1928, 1929, 1936 (96.9%); worst ruin age 85 |
| `convert-to-irmaa-1` | From the first retirement year, convert pre-tax to Roth until income hits the first Medicare-surcharge tier. | −1 cohort (1965), tax −13.5%, worst ruin 82 |
| `convert-to-24` | Same, but fill to the top of the 24% bracket (the heavy dose). | −7 cohorts, tax −38%, worst ruin 76 |
| `convert-irmaa-1-after-window` | No conversions for ten retirement years; then the IRMAA ceiling, only in years wealth ≥ 25× spending. | 0 cohorts lost, same worst ruin, tax −11.2%, heir +5.4% |
| `skip-megabackdoor` | Send the after-tax 401k dollars to brokerage instead of converting them to Roth in-plan. | −2 (1935, 1965), tax +22%, median −4%, heir −5% |
| `roth-deferrals` | Elect Roth for the whole 401k deferral, paying tax in the working year. | −2 (1935, 1965), tax −25%, heir +5.5%, median +3% |
| `trad-first-draws` | Spend pre-tax first, let Roth and brokerage grow. | −2 (1935, 1965), median −8% |
| `aca-roth-bridge` | Until Medicare, spend brokerage and Roth before any pre-tax dollar to keep MAGI under the subsidy cliff. | −1 (1965), tax +30%, small credit |

Optional 9th/10th: `match-only-rest-brokerage` (−1 cohort 1965, tax +30%: the "stop contributing" claim) and `bridge-72t` at retire 54 (+2 cohorts of 29). `harvest-0-ltcg` needs no row: say "byte-identical to baseline" in prose.

---

## 3. Verification of blog.md against code and runs

**Commands run** (from `F:\github\retire-sim`; the CLI loads the newest `.secrets/<year>.json` by default; blog verdicts are read at the `plan v2 (2026)` strategy overlay, which is what reproduces the blog's tax-band table):

```
npm run plan -- --retire 55 --ss 65 --now 2026-09 --strategy "plan v2 (2026)" --json
npm run plan -- --retire 54 --ss 65 --now 2026-09 --strategy "plan v2 (2026)" --json
npm run plan -- --retire 55 --ss 65 --now 2026-09 --json            # no overlay, for contrast
npm run plan -- --retire 54 --ss 65 --now 2026-09 --json
npm run plan -- --retire 55 --ss 65 --now 2026-09 --strategy "early death" --json   # widow's penalty
npm run plan -- --retire 55 --ss 65 --now 2026-09 --strategy "plan v2 (2026)" --tax-bands
npm run plan -- --retire 54 --ss 65 --now 2026-09 --strategy "plan v2 (2026)" --tax-bands
npm run plan -- --retire 55 --ss 65 --now 2026-09 --tax-bands       # no overlay
npm run plan -- --retire 54 --ss 65 --now 2026-09 --tax-bands
npm run plan -- --retire 55 --ss 65 --now 2026-09 --config datasets/public-example.json --json
npm run plan -- --retire 54 --ss 65 --now 2026-09 --config datasets/public-example.json --json
npm run plan -- --retire 55 --ss 65 --now 2026-09 --config datasets/public-example.json --strategy "plan (public example)" --json
npm run plan -- --retire 54 --ss 65 --now 2026-09 --config datasets/public-example.json --strategy "plan (public example)" --json
npm run plan -- --retire 55 --ss 65 --now 2026-09 --config datasets/public-example.json --tax-bands
```
Plus a scratchpad `tsx` script (`sweep.ts`, imports `runExperiment` from `src/model/simulate.ts`, `loadConfig` from `scripts/experiments.ts`) for the flat-knob calibration sweep on the allocation engine, plan v2 mechanics, SS 65, rates 0/5/10/12/15/18/20/22/24%, keeping the dataset's +5-point survivor offset. Every run prints "98 sequences".

**Verbatim tax-band output** (`--tax-bands`, baseline policy, "tax caused by draws / gross draws per history, median across histories"):

| Ages | retire 55, plan v2 | retire 54, plan v2 | retire 55, no overlay | retire 54, no overlay |
|---|---|---|---|---|
| before 55 | — | 1% | — | 1% |
| 55–59 | 12% | 21% | 12% | 21% |
| 60–64 | 14% | 14% | 13% | 14% |
| 65–74 | 15% | 15% | 15% | 15% |
| 75 and on | 31% | 31% | 51% | 51% |
| lifetime | 22% | 23% | 31% | 26% |

Unrounded (JSON `drawTaxRates`): 55/v2 = 12.5, 13.6, 15.2, 30.6, 22.3; 54/v2 = 1.1, 20.8, 13.5, 15.2, 31.5, 23.3. The blog table (lines 135–142) is **verified-from-run** but only under the plan v2 overlay; without it the 75+ band is 51% and lifetime 31%. The post must say which mechanics it is reading at (the overlay is the champion allocation: gold taper, guardrail, enough-ratchet).

**Per-claim status** (v2 = `plan v2 (2026)` overlay at retire 55 / SS 65 unless stated):

| Blog claim (line) | Status | Evidence |
|---|---|---|
| 98 cohorts, 1928–2025 (25) | verified-from-run | CLI header "98 sequences"; SVG parse: 98 years 1928..2025 |
| Baseline loses 3 Depression years (36, 104) | verified-from-run | v2 baseline fails 1928 1929 1936, 96.9%, worst ruin 85 |
| skip-megabackdoor: −2 (1935, 1965), tax "up a fifth", median/heir −5% (38, 156) | verified-from-run | +lost 1935,1965; tax +22.2%; median −4.0%; heir −5.4% |
| megabackdoor-to-roth-ira identical (39, 156) | verified-from-run | 0.0% on every metric, same years |
| roth-deferrals: −2, tax "down a fifth", estate up (40, 158) | verified-from-run (rounding) | +lost 1935,1965; tax −24.5% (closer to a quarter); heir +5.5%; median +3.1%; worst ruin 84 |
| roth-deferrals-convert-to-irmaa-1 "two lost, same as separately" (41) | partly stale | −2 but a different pair: 1961, 1965 (separately: {1935,1965} and {1965}); tax −21.7% |
| match-only: −1, tax +30% (42, 114, 195) | verified-from-run | +lost 1965; tax +29.6% |
| pretax-only: −3 (43) | verified-from-run | +lost 1935,1965,1999; tax +16.9% |
| skip-spouse-ira identical (44) | verified-from-run | 0.0% everywhere |
| convert-to-12 no-op (46, 162) | verified-from-run | same years; tax −0.5% (near-identical, not byte-identical) |
| convert-to-irmaa-1: −1, tax −15%, worst ruin falls (47, 108, 163) | **stale number** | +lost 1965; tax **−13.5%**; worst ruin 82 (from 85) |
| convert-to-22: −2 (1961, 1965), tax −22% (48, 109, 163) | **stale number** | +lost 1961,1965; tax **−25.1%**; worst ruin 81 |
| convert-to-24: −7, tax −36%, worst ruin −9 years (49, 110, 163) | verified / stale number | +lost 1935,1938,1939,1961,1965,1973,1999; tax **−38.4%**; worst ruin 76 (= −9) |
| convert-under-aca identical (50) | verified-from-run | 0.0%; baseline ACA credit is 0 |
| bridge-ladder no-op at 55 (51) | verified-from-run | identical at 55 (at 54 it loses 10 cohorts: worth a warning line if 54 is kept) |
| after-window IRMAA: same cohorts and worst ruin, tax −11%, estate +5% (52, 111, 164) | verified-from-run | same; ruin 85; tax −11.2%; heir +5.4%; median −0.3% |
| after-window 22%: same survival, median −4% (53, 165) | verified-from-run | same; tax −10.3%; median −4.3% |
| harvest rows byte-identical (54–56, 112, 119) | verified-from-run | harvest-0-ltcg 0.0% vs baseline; hybrid 0.0% vs after-window row |
| trad-first: −2, median −9% (58, 169) | verified (rounding) | +lost 1935,1965; median −8.3% |
| proportional: −3, tax +a third (59, 169) | verified-from-run | +lost 1935,1961,1965; tax +38.2%; median −22.6% |
| bracket-fill-draws identical; bracket-fill-22 median −7% (61, 62) | verified-from-run | −0.0%; median −7.1% |
| aca-roth-bridge: −1, tax +28%, small credit (63, 113, 169) | verified / stale number | +lost 1965; tax **+29.5%**; ACA credit > 0 (baseline 0) |
| bridge-72t: nothing at 55; at 54 +2 of 29, tax −3% (64, 115, 182) | verified-from-run | 55: identical. 54/v2: baseline 29 fails (70.4%), bridge-72t saves **1957, 1973** → 27 (72.4%), tax −2.6%, median +5.4%, worst ruin 66 vs 65, ACA credit → 0 |
| bonds-in-trad: −1 (1965), tax −a third, median +10% (66) | verified-from-run | +lost 1965; tax −33.3%; median +10.4% |
| stocks-roth-bonds-trad-gold-taxable same as above (67) | verified-from-run | +lost 1965; tax −32.9%; median +8.8% |
| roth-source-out-at-separation: identical, worst ruin +1 (69) | verified-from-run | same years; ruin 86 vs 85 |
| Tax-band table 55 and 54 (135–142) | verified-from-run (overlay only) | table above |
| "5% off by a factor of four" (144) | arithmetic | 22/5 = 4.4 |
| "earlier hand measurement 18% ... double-counted RMDs" (144); "three definitions gave 13/18/22" (184) | not-reproducible | historical hand measurements; only 22% survives in tooling (`drawTaxRates` denominator comment, plan.ts:1866–1871 explains the double-count fix) |
| Knob sweep: 12% one too rosy, 15% one too harsh (adds 1965), 18% six too harsh, 20% frontier +1 year; 54 matches near 20% (148) | verified-from-run | sweep at retire 55: 12% → fails [1929 1936] (2); 15% → [1928 1929 1936 1965] (4); 18% → 9 fails (90.8%); 20% → 82.7% (frontier moves to 56). Retire 54: 20% → 29 fails, 70.4% = plan engine's 29 exactly |
| "setting adopted is 15%" (148) | verified-from-run | dataset `effectiveTaxOnWithdrawals` 0.15, survivor 0.20 (rates only) |
| 5% moved the frontier a year earlier (75) | verified-from-run | frontier (≥85%) = 54 at 0–10%, 55 at 12–18%, 56 at 20–24% |
| "each eight points costs about one year" (150) | verified-from-run | frontier steps sit at 10→12 and 18→20, eight points apart; 5%→20% = 15 points, 2 years |
| Widow's penalty +14%, identical cohorts, after-window edge "roughly doubles" (121, 164) | **stale / not reproduced** | `--strategy "early death"` vs v2: baseline lifetime tax **+9.9%** (SS 62: +12.2%), failed cohorts identical (1928 1929 1936). after-window IRMAA edge 11.2% → 13.2% of the survivor baseline (×1.3, not ×2); the 22%-after-window edge 10.3% → 18.8% does roughly double. `theories.md:79`, `policies.json`, `CLAUDE.md:48` all carry the 14% figure: doc staleness, code wins |
| First-death age used for the what-if | caution | the strategy label and `theories.md:10,24,79` state the age; it is a hypothetical, but the post should say "an early-first-death what-if" and omit the number |
| Six video score moves (191–198) | verified-from-committed-file (git diff) | KNlP3ET9VxA 2→1, ifBmjw4X9MA 2→1, to46haDgmOY 1→−1, M90gMQg3-KI 0→1, 0m0WOHRC_NQ 0→1, cmAn_SQVsiE 0→1 |
| "fifteen more kept their score but had tags resolved" (189) | slightly off | 14 videos with score unchanged and right/wrong tags changed; plus 1 new non-video source added (`chatgpt-plan-critique-2026-09`) |
| Channel means: Julia 1.33→0.33, Clark 1.33→1.00, Fidelity and PensionCraft rose (200) | verified | sources.json diff: Julia 1.33→0.33, Clark 1.33→1, Fidelity 0→1, PensionCraft −0.25→0 |
| Holy Schmidt stays 0 (200) | verified | HzecukpTnOo score 0 → 0 |
| "two of them earned the catalog's top mark" (75) | verified | HEAD had exactly two score-2 sources (KNlP3ET9VxA, ifBmjw4X9MA); none now. "Twenty-odd videos were scored against that result" is unverifiable (68 sources total): cut |
| Public dataset "survives at 55 (~97%), fails at 54" (123, CLAUDE.md:23) | verified-from-run | with `--strategy "plan (public example)"`: 55 → 96.9% (1928 1929 1936), 54 → 81.6% (18 fails). Without overlay: 91.8% / 76.5% |
| Public-55 caption: same three years; harvesting fires, tax −couple %, a third of the credit gone; 22%/24% lose none, 12% loses one (125) | verified-from-run (overlay) | harvest-0-ltcg: tax −2.2%, ACA −36.0%, same cohorts; convert-to-12 +1930; convert-to-22/24 same; **without the overlay this is false** (baseline 8 fails, convert-to-24 +1998, convert-to-12 +3) |
| national-average ruins at every age under real taxes (100) | verified-from-committed-doc, not re-run | CLAUDE.md:23 |
| Cohort strip image (117) | verified-from-committed-file, matches run | parsed `docs/img/cohorts-retire55-ss65.svg`: 28 rows; failed years per row identical to the v2 run (table in §6c). **`docs/` is gitignored (`.gitignore:23`)**: the post must carry its own copy |
| Engine facts: nine account types; ten-year window; 25×; RMD age 75; heir discount | verified-from-code | `BUCKETS` plan.ts:26–36 (9); `AFTER_WINDOW_YEARS = 10`, `SAFE_MULTIPLE = 25` plan.ts:722–723; `LIMITS.rmdAge: 75` limits.ts:19; `HEIR_PRETAX_RATE = 0.24` plan.ts:1833 |
| Two optimism bugs (82, 158, 183) | verified-from-code | Roth deferral now taxed: `taxableWage`/`wageTaxBase` plan.ts:1405–1425 (policy pays the marginal difference vs max-everything); RMD per account with comment "Pooling drained the owner's accounts while the spouse's sat" plan.ts:1243–1256 |
| Conservation canary test (183) | verified-from-code | `plan.test.ts:614` "CONSERVATION: with zero real growth, each year's wealth change is exactly adds minus withdrawals" |
| Harvest / SEPP tests (94) | verified-from-code | `plan.test.ts:1163–1260` |

---

## 4. Terminology and caveats the post needs

**Conventions that matter to a claim:**
- **Real dollars; nominal figures deflated.** The engine runs in today's dollars; brackets, limits and LTCG bands are CPI-indexed so they are real constants (tax.ts:1–5, limits.ts:1–3). Cost basis, Roth conversion lots, the SEPP amount, and the non-indexed NIIT/WA-$1M thresholds are nominal, so they are deflated yearly (plan.ts:36–40, tax.ts:135–138). This is why "basis-heavy brokerage draws" pay ~1% before 55 and why the 75+ band is high: nothing in the post depends on it beyond one disclosure sentence.
- **Realized rate metric** (plan.ts:1847–1887): per history, tax caused by every draw (forced RMDs and SEPP included) divided by dollars drawn *to fund spending* (gross draws minus what the year parked back into brokerage), summed over retired years in the band, then the median across the 98 histories. Ratios, not amounts.
- **Verdict reading rule:** set arithmetic on failed start years vs baseline, not the success percentage; one point of success = one cohort.
- **Strategy overlay:** plan-engine verdicts are read on the champion allocation mechanics (`plan v2 (2026)`); without it the household fails 24 cohorts at 55 and the tax bands differ. Say so once.
- **Plan tab vs Results tab:** real per-account taxes make plan-engine success rates harsher than the flat-knob engine's; never cross-compare (CLAUDE.md:23).

**Deliberate approximations (`ponytail:` comments), one sentence each, worth a footnote:**
1. Social Security is counted 85% taxable flat (plan.ts:1430).
2. Taxable-account yield is approximated as the asset's return floored at zero, with 2% of equity as qualified dividends (plan.ts:1126–1129).
3. Early-withdrawal penalty is a flat 10%, including HSA (really 20% for a pre-65 non-medical HSA draw) (plan.ts:635–637).
4. Last-resort draws are ranked at a constant 22% reference rate, not the year's bracket (plan.ts:398–401).
5. The after-window gates are fixed constants: 10 years (the plan's ret+9 hedge window) and 25× (the 4%-rule funded ratio), not swept (plan.ts:773–776).
6. Gold/silver sold from brokerage is treated as a collectible gain split by the brokerage's current metal weight, no per-asset lots (plan.ts:1446–1449).
7. Unneeded RMDs (and the SEPP) are reinvested in brokerage at full basis (plan.ts:1231–1233, 1260–1262).
8. After-tax → in-plan Roth auto-conversion folds interim earnings into basis (plan.ts:1329–1335).
9. The SEPP is sized to the bridge year's spending, capped at the IRS 5% amortization maximum, assuming the IRA is split so the SEPP account is exactly the right size; the schedule is never modified (plan.ts:1058–1064, limits.ts:31–46).
10. The bridge-ladder converts equal rungs, not the actual spend five years out (plan.ts:810–813).
11. One household ACA benchmark premium, not re-sized for a survivor (plan.ts:1470).
12. Heir value discounts inherited pre-tax and HSA dollars at a flat 24% (plan.ts:1832–1833).
13. Traditional-IRA basis absent in the dataset → assumed 0 and stamped in `assumptions` (both IRAs on the owner's dataset; none on the public one).

Statutory inputs a curious reader may want: 2026 MFJ brackets and standard deduction (tax.ts:9–33: 12% top at 100,800 taxable, 22% top at 211,400, 24% top at 403,550, deduction 32,200); 0% LTCG band top 98,900 taxable (tax.ts:37); IRMAA tier 1 MFJ 218,000 / single 109,000 (tax.ts:211–214); ACA cliff 4× FPL with the enhanced credits expired (tax.ts:163–172); RMD age 75 for those born 1960+ (limits.ts:9,19).

---

## 5. Claims deserving evidence

| Claim | Evidence |
|---|---|
| The after-window gate fires only after 10 retirement years and only while wealth ≥ 25× spending, evaluated every year (not latched) | plan.ts:722–723, 767–795 (`conversionAmount`); gate built per year at plan.ts:1528–1529 (`yearsRetired: age - retireAge`, `wealthToSpending: total()/spendingBase`) |
| Conversions never happen while working | plan.ts:735 `if (ctx.age < ctx.retireAge) return 0` |
| Day-one bracket-fill rules convert until *taxable ordinary income* reaches the bracket top; IRMAA rule until *MAGI* reaches tier 1 | plan.ts:750–763, 806 |
| Conversion tax is paid out of the portfolio inside the fixed-point loop (withdrawals, tax, ACA credit, IRMAA all depend on MAGI) | plan.ts:1450–1486 (`step`: `need = -preTaxNet + acaCost + irmaaCost + taxIn`) |
| 0% harvesting = room under the 0% band top after the year's other income, capped by unrealized gain, never beside a conversion | plan.ts:827–853 (`harvestAmount`) |
| Harvest is byte-identical on the owner's household | run: 0.0% on every metric at 55 and 54 (both overlays); `policies.json:29` FINDING note |
| SEPP rides the RMD path: forced pre-tax draw, no penalty, parked in brokerage at full basis | plan.ts:1257–1290 |
| Roth election is now charged its working-year tax | plan.ts:1405–1425 |
| RMDs per account, never pooled | plan.ts:1243–1256 |
| Brokerage basis steps up at first death (WA community property) | plan.ts:1185–1192 |
| Realized-rate denominator excludes dollars parked back into brokerage (fixes RMD double count) | plan.ts:1862–1872 |
| Widow's penalty is measured by running policies over an early-first-death strategy | CLI `--strategy "early death"`; run: baseline +9.9% lifetime tax, same failed years |
| Flat 5% → frontier one year earlier; 15% reproduces the plan engine within one cohort; 20% matches retire 54 exactly | sweep output in §6e |
| Scores moved as listed | `git diff sources.json` (six `score` changes); channel means in the `channels` block (sources.json:1201ff) |
| Public dataset is synthetic | `datasets/public-example.json` line 2 `_note` ("Round numbers, NO real person's data") |

---

## 6. Proposed visuals (4 recommended, 1 optional)

Caveat text that must accompany every chart: *"Retire 55, Social Security at 65, champion allocation mechanics, 98 historical start years 1928–2025, as of 2026-09. Percent changes are relative to the baseline policy; no dollar amounts. One cohort = one start year = one percentage point."*

### 6a. Survival vs lifetime tax (recommended, the headline chart)

Form: dot/lollipop or a two-column bar per policy: x = lifetime-tax change (%), marker labelled with cohorts lost and worst ruin age. Use the 8 retained rows (full 28 below for reference). Data: `plan v2 (2026)`, retire 55, SS 65.

| policy | success | cohorts lost vs baseline (years) | worst ruin age | median terminal | heir value | lifetime tax |
|---|---|---|---|---|---|---|
| baseline | 96.9% | 0 (fails 1928 1929 1936) | 85 | 0 | 0 | 0 |
| convert-to-12 | 96.9% | 0 | 85 | −0.0% | −0.0% | −0.5% |
| convert-to-irmaa-1 | 95.9% | 1 (1965) | 82 | −2.7% | +6.5% | −13.5% |
| convert-to-22 | 94.9% | 2 (1961 1965) | 81 | −3.7% | +7.8% | −25.1% |
| convert-to-24 | 89.8% | 7 (1935 1938 1939 1961 1965 1973 1999) | 76 | −1.0% | +10.9% | −38.4% |
| convert-irmaa-1-after-window | 96.9% | 0 | 85 | −0.3% | +5.4% | −11.2% |
| convert-to-22-after-window | 96.9% | 0 | 85 | −4.3% | +4.5% | −10.3% |
| harvest-0-ltcg | 96.9% | 0 | 85 | 0.0% | 0.0% | 0.0% |
| harvest-then-convert-irmaa-1-after-window | 96.9% | 0 | 85 | −0.3% | +5.4% | −11.2% |
| convert-under-aca | 96.9% | 0 | 85 | 0 | 0 | 0 |
| bridge-ladder | 96.9% | 0 | 85 | 0 | 0 | 0 |
| skip-megabackdoor | 94.9% | 2 (1935 1965) | 85 | −4.0% | −5.4% | +22.2% |
| megabackdoor-to-roth-ira | 96.9% | 0 | 85 | 0 | 0 | 0 |
| roth-deferrals | 94.9% | 2 (1935 1965) | 84 | +3.1% | +5.5% | −24.5% |
| roth-deferrals-convert-to-irmaa-1 | 94.9% | 2 (1961 1965) | 81 | −0.3% | +11.7% | −21.7% |
| match-only-rest-brokerage | 95.9% | 1 (1965) | 85 | −5.5% | −7.3% | +29.6% |
| pretax-only | 93.9% | 3 (1935 1965 1999) | 82 | −6.2% | −8.3% | +16.9% |
| skip-spouse-ira | 96.9% | 0 | 85 | 0 | 0 | 0 |
| trad-first-draws | 94.9% | 2 (1935 1965) | 82 | −8.3% | −8.5% | −6.3% |
| proportional-draws | 93.9% | 3 (1935 1961 1965) | 83 | −22.6% | −18.6% | +38.2% |
| roth-ira-before-roth-401k-draws | 96.9% | 0 | 85 | 0 | 0 | 0 |
| bracket-fill-draws | 96.9% | 0 | 85 | −0.0% | −0.0% | −0.0% |
| bracket-fill-22-draws | 96.9% | 0 | 84 | −7.1% | −5.9% | −2.6% |
| aca-roth-bridge | 95.9% | 1 (1965) | 85 | −5.6% | −7.5% | +29.5% |
| bridge-72t | 96.9% | 0 | 85 | 0 | 0 | 0 |
| bonds-in-trad | 95.9% | 1 (1965) | 85 | +10.4% | +9.1% | −33.3% |
| stocks-roth-bonds-trad-gold-taxable | 95.9% | 1 (1965) | 85 | +8.8% | +8.5% | −32.9% |
| roth-source-out-at-separation | 96.9% | 0 | 86 | −0.0% | 0.0% | 0.0% |

ACA credit: 0 for baseline and every row except convert-to-24, skip-megabackdoor, aca-roth-bridge, match-only, pretax-only (all > 0, small). Retire 54 companion (v2): baseline 70.4% (29 fails); bridge-72t 72.4% (saves 1957, 1973; tax −2.6%; median +5.4%; worst ruin 66 vs 65; ACA → 0); convert-to-irmaa-1 −1 (1931); convert-to-22 −2 (1931, 1933); convert-to-24 −3; bridge-ladder −10; after-window rules 0 lost, tax −15.3% / −12.4%.

Caveat: the two location rows and roth-deferrals win on median/heir while losing a cohort; label the axis "lifetime tax vs baseline (median across histories)" and keep "cohorts lost" as the primary annotation.

### 6b. Realized withdrawal-tax rate by age band, retire 55 vs 54 (recommended)

Grouped bars, y = realized rate on spending draws (%), x = age band; two series (retire 55, retire 54); reference lines at 5% (the legend), 15% (the adopted knob), 22% (lifetime). Exact values (plan v2, baseline policy, SS 65):

| band | retire 55 | retire 54 |
|---|---|---|
| before 55 | n/a (no retired years) | 1.1% |
| 55–59 | 12.5% | 20.8% |
| 60–64 | 13.6% | 13.5% |
| 65–74 | 15.2% | 15.2% |
| 75 and on | 30.6% | 31.5% |
| lifetime | 22.3% | 23.3% |

Caveat: ratios, not amounts; denominator = dollars drawn to fund spending, so forced RMD tax is spread over a small base from 75; bands split where the law steps (rule of 55, 59½, Medicare, RMD age). Public-example companion (its own plan strategy): 55 = n/a, 6.8, 10.2, 11.7, 55.7, 27.2; 54 = 1.2, 16.6, 10.2, 11.7, 47.8, 23.7 (a brokerage-heavier household pays less early and more late).

### 6c. Cohort strip (recommended; redraw, do not embed the gitignored file)

Semantics of `docs/img/cohorts-retire55-ss65.svg` (generated by `cohortStripSvg`, cohorts.ts:26–54): 1248×416, one 9px tile per start year 1928→2025 left to right (decade labels every 10 years), one 14px row per active policy in `policies.json` order (28 rows; `harvest-0-ltcg-from-medicare` is `done` and omitted), fill `#a23b3b` = ruin, `#9fb8a8` = survived, labels truncated to 40 chars. Its failed years match the v2 run tile for tile. For the post, draw only the retained rows (plus optionally the 1960s zoom):

| row | failed start years |
|---|---|
| baseline | 1928 1929 1936 |
| convert-to-irmaa-1 | 1928 1929 1936 1965 |
| convert-to-22 | 1928 1929 1936 1961 1965 |
| convert-to-24 | 1928 1929 1935 1936 1938 1939 1961 1965 1973 1999 |
| convert-irmaa-1-after-window | 1928 1929 1936 |
| harvest-0-ltcg | 1928 1929 1936 |
| skip-megabackdoor | 1928 1929 1935 1936 1965 |
| roth-deferrals | 1928 1929 1935 1936 1965 |
| trad-first-draws | 1928 1929 1935 1936 1965 |
| aca-roth-bridge | 1928 1929 1936 1965 |
| match-only-rest-brokerage | 1928 1929 1936 1965 |
| bridge-72t (at 55) | 1928 1929 1936 |

(Others: proportional 1928 1929 1935 1936 1961 1965; pretax-only 1928 1929 1935 1936 1965 1999; bonds-in-trad / stocks-roth… / roth-deferrals-convert-to-irmaa-1 add 1965 (the last adds 1961 too); every remaining row = baseline.) Caveat: "the 1960s tiles are the inflation cohorts; the 1928/1929/1936 tiles are the Depression starts every sane policy loses."

### 6d. Mechanism diagram: window, then gated conversion (recommended)

A state/timeline strip along age, with the gate logic as a small decision box:
- **Working** (age < retire age): conversions = 0 always (plan.ts:735). Contributions per the contribution rule.
- **Retirement years 1–10** (`yearsRetired = age − retireAge < 10`): conversions = 0 for the after-window rules; day-one rules convert here (this is the sequence-risk window; the plan's gold hedge also runs ret−6..ret+9).
- **Year 11 onward, gate checked every year**: if `wealth / this year's base spending ≥ 25` → convert pre-tax (401k, then own IRA, then spouse's) until MAGI reaches IRMAA tier 1 (218,000 MFJ, 109,000 single; tax.ts:211–214); else 0 that year. Not a latch: a bad year switches it off, a recovery switches it back on.
- **Every year regardless**: the conversion's tax is added to the year's need and paid from the portfolio inside the fixed-point loop (plan.ts:1450–1486); from 75, RMDs come out of each pre-tax account (limits.ts:19); the IRMAA surcharge bites two years after the MAGI year (tax.ts:199–204).
Contrast panel: `convert-to-irmaa-1` = the same ceiling with the two gates removed. Caveat: gates are fixed constants (10 years, 25×), not optimised.

### 6e. Knob calibration sweep (optional; useful if the "legend" section stays)

Flat `effectiveTaxOnWithdrawals` on the allocation engine (simulateRun), plan v2 mechanics, SS 65, survivor rate kept 5 points above the base rate, `--now 2026-09`. Horizontal reference: plan engine real-tax result (retire 55: 3 fails; retire 54: 29 fails).

| flat rate | retire 55 success | retire 55 failed years | retire 54 success (fails) | frontier (≥85%) |
|---|---|---|---|---|
| 0% | 100% | none | 99.0% (1) | 54 |
| 5% | 99.0% | 1936 | 96.9% (3) | 54 |
| 10% | 98.0% | 1929 1936 | 86.7% (13) | 54 |
| 12% | 98.0% | 1929 1936 | 80.6% (19) | 55 |
| 15% | 95.9% | 1928 1929 1936 1965 | 76.5% (23) | 55 |
| 18% | 90.8% | 1928 1929 1935 1936 1961 1964 1965 1968 1999 | 73.5% (26) | 55 |
| 20% | 82.7% | 17 fails | 70.4% (29) | 56 |
| 22% | 74.5% | 25 fails | 65.3% (34) | 56 |
| 24% | 71.4% | 28 fails | 64.3% (35) | 56 |

Reading: 12% is one cohort too rosy, 15% one too harsh (adds 1965), 18% six too harsh, 20% moves the frontier; at 54 the flat 20% reproduces the plan engine's 29 failures exactly. Frontier steps at 10→12 and 18→20: eight points apart. Caveat: this is the *old* flat-rate engine, used only to set its knob; the survivor-rate offset convention should be stated.

### 6f. Better than a scoreboard table: a before/after dumbbell of the six scores (optional, tiny)

Data: Clark "If I Had $5M at 55" 2→1; Julia "If You're 55 with $2.5M" 2→1; Julia "Stop Contributing HERE" 1→−1; Erin "The Roth Mistake" 0→1; Fidelity "Backdoor, Mega, Roth Explained" 0→1; PensionCraft "How The Wealthy Invest" 0→1. Channel means: Julia 1.33→0.33, Clark 1.33→1.00, Fidelity 0→1, PensionCraft −0.25→0. Scale −1..2. If the section is compressed to prose, drop this.

---

## 7. Screenshots

Both files live in `F:\github\retire-sim\docs\img\` (gitignored via `.gitignore:23 docs/`, so copy them into the blog repo) and were reproduced exactly by:
`npm run plan -- --retire 55 --ss 65 --now 2026-09 --config datasets/public-example.json --strategy "plan (public example)"`
(the Plan tab defaults to the dataset's winning strategy; without the overlay the numbers differ).

- **`plan-tab-public-55.png`**: 1352×1286 PNG, RGB. The Plan tab policy comparison table for the public-example household: 28 policy rows (labels, not ids), columns Success / Fails vs baseline / Worst ruin age / Median terminal / Heir value / Lifetime tax / ACA credit. Shows baseline 97% failing 1928 1929 1936, worst ruin 70; convert-to-12 +1930; convert-to-22/24 same cohorts; harvest row lifetime tax −2%, ACA credit 37k→24k. Dollar figures shown are the synthetic dataset's (round numbers, `_note` line 2: "NO real person's data"). Caption as: "Plan tab, public example household, retire 55 / SS 65, as of 2026-09."
- **`plan-tab-public-cohorts.png`**: 1248×417 PNG, RGB. The same cohort strip as 6c rendered on the Plan tab (with the Download SVG button cropped out), for the public household: baseline row fails 1928 1929 1936; convert-to-12, bonds-in-trad, bracket-fill(-22), proportional, trad-first rows add 1930; everything else matches baseline. Caption as a dated snapshot of the public dataset, not the household the findings are about.

Both are PII-free. The public dataset also fails the 85% bar at 54 (81.6%, 18 cohorts) with the same overlay, which supports the "clears 55, fails 54" caption.

---

## Validation pass (authority agent, 2026-09-04, on the finished draft)

Checked index.mdx, the four data SVGs and hero.svg against the brief and fresh plan runs. SVG geometry recomputed from each file's stated formula: every bar, dot and tile lands on the verified value. PII scan: clean. Blocking: none.

Applied from the findings: the dose result is attributed to the day-one policy rows, not the knob sweep; "ten years" is the post-retirement half of the plan's hedge window (ret-6 to ret+9); added the tax-law stress caveat (brackets 20% narrower plus rates +5 points: the gated rule still loses no cohort but no longer beats baseline on tax or median, per policies.json FINDING and theories.md); the ACA cliff is the hard 400%-of-FPL cliff back since the enhanced credits expired 2025-12-31 (tax.ts); IRMAA uses MAGI from two years earlier; RMD age 75 applies to those born after 1959; raster screenshot rendered via astro:assets Image; "twenty years" generalized to "for decades"; knob setting hedged with "for now".

Left as is: "four dimensions" (the optional fifth, separation, is an acceptable simplification); "real federal bill" (NIIT and the Washington capital-gains excise are also modelled, not load-bearing); the window-gate diagram omits the conversion source order (401k, then own IRA, then spouse's). Sibling consistency confirmed: 98 cohorts, the -1..2 score scale, verdict-as-set-arithmetic and the 85% frontier bar are told the same way as in the three earlier finance posts; post 2's "at last count, two were correct" is dated by its own hedge. blog.md's "fifteen more" is 14 videos plus one added non-video source; the post says fourteen.

---

## Update pass (authority agent, 2026-09-05): one input, three reversals

The engine file plan.ts changed after the brief's runs (engine hash now 824ef20f...), but the change is neutral: the current engine on the pre-change dataset backup reproduces every number in this brief to the cohort and the decimal. The one input that changed is the dataset's wage-growth-vs-CPI assumption, from -1%/yr (engine default, brief's runs) to +1.4%/yr. blog.md added a postscript (lines 204-228) and "revised in the postscript" markers; nothing in its original body was changed. Verdict overlay still "plan v2 (2026)", retire 55 / SS 65, --now 2026-09.

New-dataset numbers (v2, SS 65), used in the post's postscript section:
- Baseline at 55 fails only 1936 (99.0%), worst ruin age 92; every catalog policy fails only 1936 (pretax-only adds 1929). On the gold+silver split the plan engine fails none.
- Tax bands 55: 9.5 / 13.6 / 15.3 / 30.8 / lifetime 22.1. Retire 54: 0.0 / 16.9 / 13.4 / 15.2 / 33.3 / 24.2. The chart in the post stays on the earlier assumption and is captioned as such.
- Knob sweep (flat engine, v2, survivor +5 pts): 12% and 15% reproduce 55 exactly ([1936]); 18% adds 1929; 18% reproduces the plan engine's 23 failures at 54 year for year. The "eight points per year" dose claim is no longer supported and was removed from the post.
- Day-one conversions lose no cohort: IRMAA tier tax -15%, ruin 93; 22% top tax -28%, median -2%, ruin 91; 24% top tax -37%, median -6%, ruin 88. convert-to-12 is no longer a no-op (tax -10.6%). After-window IRMAA: tax -10%, heir +4%, median +1%.
- bonds-in-trad: same survival, tax -34%, median +10%, heir +11%, ruin 94. The two stacked rows (location + 22%, location + after-window) were archived in policies.json (notes lines 34-35): same tax with lower median, and higher tax respectively.
- skip-megabackdoor: 0 lost, tax +36%, median -8%, heir -12%. roth-deferrals: 0 lost, tax -22%, heir +5.5%, median +4%. trad-first: 0 lost, median -9%. aca-roth-bridge: 0 lost, tax +42%. match-only: 0 lost, tax +43%.
- Retire 54: baseline 23 failures (76.5%); bridge-72t saves 7 (83.7%); roth-source-out alone saves 3 (79.6%); the pair saves 9 (85.7%), first policy over the 85% bar at 54. On the old wage path the pair did not stack (= 72t alone).
- Allocation engine at SS 65, retire 54: 22% window 86.7%, 25% 85.7%, 30% 88.8% (peak), 35% 88.8% at 54 but drops at 55/56. blog.md's 84/85/89 were likely read at SS 62; the post says "about 89% at a 30% window".
- Widow's penalty: +10.1%, identical cohorts. Public-example dataset: unchanged. Harvesting: still 0.0%.
- Scoreboard second pass (sources.json): Erin Talks Money M90gMQg3-KI 1 -> 2 (only score-2 source), Rachael Camp i0RgEDnj6ko -1 -> 0, Cody Gunn u62OZeeHueU 0 -> 1; conversion videos stay at 1.

Post decision: option 1 from the agent's report. The frontier sections stay as measured on the earlier assumption (captions and the settings paragraph say so), the revised verdicts carry italic postscript markers, and a "Postscript: one input, three reversals" section carries the new-dataset findings. The postscript table uses the verified v2 / SS 65 ratios (median, lifetime tax) rather than blog.md's unreproduced cells. CLAUDE.md in retire-sim is stale on "SEPP ~2 cohorts at 54" and "widow ~+14%".

## Re-cut (2026-09-05)

The post was re-cut on a six-step arc at the author's direction: the flat knob as legend; the plan engine as instrument (bugs and cache as calibration); the real bill (22%, back-loaded, knob to 15%); the talking heads re-scored at 15% (the policy rows as claims); one input flipping three verdicts; what survived. The gate mechanism diagram (window-gate-viz.svg) was dropped since the gated rule is no longer the hero; the tax-band chart, the policy dot chart and the cohort strip stay as the 15%-era picture, captioned as measured with wages lagging inflation. The 5%-at-54 claim uses the flat engine's 96.9% on the earlier path versus the plan engine's 29 (earlier) and 23 (later) failures.

## Delta (2026-09-05, evening)

Engine tax-correctness round, model-risk round, and the house-cost re-verification that moved the frontier to 54: see delta-2026-09-05.md (claim-by-claim audit, current-state tables, recommendation followed: keep the dated charts, rewrite the flipped-verdicts section as two inputs, add the event-sensitivity chart).
