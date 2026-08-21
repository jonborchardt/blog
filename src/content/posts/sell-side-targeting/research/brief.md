# Domain brief — sell-side targeting (`E:\github2\Labs`)

Compiled 2026-08-20 from the authority chain: `_agent/INTERVIEW.md` (Jon's own answers),
`Labs/CLAUDE.md`, `Labs/sellSide/CLAUDE.md`, `Labs/IndustryRankings/CLAUDE.md`,
`E:\github2\resume\linkedin\patents.txt`, and the two source pages themselves
(`sellSide/Views/SellSide.html`, `IndustryRankings/Views/IndustryRating.html`).

## The story

Two sibling dashboards, built from the same `pd*` chart scripts (`pd` = PrecisionDemand), asking
the same question from opposite sides of a TV ad transaction:

- **IndustryRankings** ("PD Industry Ratings") — the buy side. Page headline in the shipped HTML:
  _"How well do the top agencies reach their target audience?"_ One score per industry, industries
  ranked against each other.
- **sellSide** ("PD Sell Side") — the sell side. One row per airing; for that one slot, all 23
  industries ranked by fit. Blog-angle phrasing from `IndustryRankings/CLAUDE.md`: "which
  industries target their media spend well" vs "which industries should a network target".

Per Jon (INTERVIEW Q11 + the co-headliner note folded into `IndustryRankings/CLAUDE.md`): both
served **real customers**, not just sales demos, and **Industry Ratings was also important and
highly interactive** — a co-headliner, not a sidekick.

Per Jon (INTERVIEW Q21): every tool in the portfolio was dreamt up in his 20% time; Audience
Planner, DocMapper, sell-side targeting, and "using crossfilter and dc.js for highly interactive
charting" all became flagship products. Q1: sell-side targeting is one of his three proudest.

## The patent

- Filed: **US 14/817,990**, "Systems and Methods for Sell-Side TV Ad Optimization", **Aug 4, 2015**.
- Granted: **US10567820B2**, "Systems and methods for sell-side TV ad-optimization",
  **issued Feb 18, 2020** — Jon co-inventor.
- Both lines from `resume/linkedin/patents.txt` (Granted Patents list + Filed Patents list).
- Jon had left Oath (Mar 2018) nearly two years before the grant issued.

## sellSide UI (from `sellSide/Views/SellSide.html` + `_agent/screenshots/sell-side.png`)

- Header reads `15,502 selected out of 15,502 records | Reset All` — a crossfilter row count.
- Left column histograms/row charts: **Station**, **Day**, **Hour**.
- Right column: a **Sort Cards by** toggle (`Alpha` / `tRatio`), then filter charts for
  **Industry**, **tRatio**, **tRatio Delta**, **tCPM**, **Optimal CPM**, **CPM Delta**,
  **CPM Delta %**, **Impressions**.
- Centre grid columns: Station, Day, Hour, Program, Current Brand, Cur Indy, Cur CPM, Optim,
  ΔCPM, ΔRev, ΔtRatio, then **1st … 23rd**, then Imps, ΔtImps.
- The 1st–23rd columns are the per-slot **industry-fit icon cards**: a pictogram for the industry,
  a fit number above it, background heat from yellow to green.
- The Industry filter list in the screenshot has exactly **23** entries, matching the 23 ranked
  columns: Charity, Cosmetics, Dental Insuranc, Diet, Diy Investment, Education Online, Exercise
  Equipement, Fitness Program/Club, Highincomecreditcard, Home Furnishings, Interior Decoration,
  Investment Services, Jewery, Life Insurance, Life Insurance Investm, Luxury Auto, Music, Power
  Tools, Senior Life Insurance, Suvs, Technical Colleges, Term, Truck Pickup (truncated labels and
  misspellings as shipped).
- The `Cur Indy` column is a heat cell holding the *current* brand's industry fit for that slot —
  e.g. -0.03 (lipstick pictogram) on the MTV / Monday 7AM / Ridiculousness row.
- Sample row visible in the screenshot: `MTV / Monday / 7AM-8AM / Ridiculousness /
  Cover Girl Lashblast Length Mascara / $6.8 cur CPM / $7.6 optimal / ΔCPM $0.8 / ΔRev $111.6 /
  ΔtRatio 0.41`, with 1st 0.39, 2nd 0.39, 3rd 0.07, 4th 0.07.
- Another visible row: `ANPL / Monday / 6AM-7AM / The Most Extreme / Ashley Furniture Homestore` —
  cur CPM $2.4, optimal $2.6, ΔRev $19.2.
- Stack: dc.js, crossfilter, NVD3, D3 v3, Bootstrap. Purely static — no project file at all.

## IndustryRankings UI (from `IndustryRankings/Views/IndustryRating.html` + before/after shots)

- Sections in the navbar: Rankings, Targeting, Spending, History, When; plus a **Dataset** menu
  with `Tv_Overall` and 20 industry datasets (Charity, Cosmetics, Diet, Diy Investment,
  Exercise Equipement, Fitness Program Club, Highincomecreditcard, Home Furnishings, Interior
  Decoration, Investment Services, Jewery, Life Insurance Investment, Luxury Auto, Music,
  Power Tools, Senior Life Insurance, Suvs, Technical Colleges, Term, Truck Pickup) — the
  misspellings are the shipped ones.
- Row 0: three paired **ranking bar charts** — tRatio, tCPM, CPM — one row per industry, sharing a
  label column on the right.
- Row 1: two **bubble charts** — "tImps vs Spend (radius: HhImps)" and
  "tRatio vs tCPM (radius: Spend)".
- Row 2: two pie charts (spend, tImps). Row 3: tRatio / tCPM / CPM line charts with upper and
  lower bands. Row 4: Day of Week and Daypart row charts.
- Left rail histograms: tRatio, tCPM, CPM, Spend, Impressions, tImps.
- Footer: **`#dateImpsChart`**, "Time Period showing Impressions" — the brush.

### The sweep (verified 2026-08-20, `_agent/screenshots/industry-rankings-{before,swept}.png`)

Brush dragged to **01/19/2011 -> 11/10/2011**; header shows that range with a `reset` link. Effects
in the captured pair:

The three bar charts share one label column, and the **row order is the tCPM ranking, ascending**
(cheapest targeted impressions first) — not the tRatio order.

| | before (full range, May 2010 – Feb 2013) | after (Jan–Nov 2011) |
|---|---|---|
| Top row | Senior Life Insurance — tRatio 0.37, tCPM $8.06 | Senior Life Insurance — tRatio 0.37, tCPM $7.40 |
| 3rd row | Life Insurance Investment (tCPM $14.70) | **Term** (tCPM $20.46) |
| Term | 9th, tRatio 0.21, tCPM $25.25 | **3rd**, tRatio 0.25, tCPM $20.46 |
| Life Insurance Investment | 3rd | drops to 19th with **no bars at all** |
| Exercise Equipement | 20th, tRatio 0.08, tCPM $62.69 | 20th, **no bars at all** |
| Music | 4th, tRatio 0.35 | 5th, tRatio 0.29 |
| tCPM range | $8.06 – $62.69 | $7.40 – $38.74 |
| Spend axis (tImps vs Spend) | $0 – $250MM | $0 – $70MM |
| CPM axis (tRatio vs tCPM) | $3.00 – $7.00 | $0.00 – $6.00+ |
| Bubbles | spread across the plot | re-laid out and rescaled |

Rankings reorder, bubbles rescale, histograms redraw, every chart on the page refilters at once.
Two industries — Life Insurance Investment and Exercise Equipement — keep their labels but lose
their bars entirely: no qualifying airings inside the swept window.

### Full "before" reading (full range), in the shipped row order

| # | Industry | tRatio | tCPM | CPM |
|---|---|---|---|---|
| 1 | Senior Life Insurance | 0.37 | $8.06 | $3.02 |
| 2 | Fitness Program/Club | 0.21 | $13.58 | $2.91 |
| 3 | Life Insurance Investment | 0.26 | $14.70 | $3.87 |
| 4 | Music | 0.35 | $17.97 | $6.27 |
| 5 | Power Tools | 0.26 | $21.05 | $5.50 |
| 6 | Technical Colleges | 0.21 | $23.56 | $5.04 |
| 7 | Charity | 0.14 | $24.04 | $3.48 |
| 8 | Investment Services | 0.22 | $24.18 | $5.35 |
| 9 | Term | 0.21 | $25.25 | $5.35 |
| 10 | Jewery | 0.21 | $25.58 | $5.34 |
| 11 | Truck Pickup | 0.23 | $25.66 | $5.91 |
| 12 | Luxury Auto | 0.24 | $28.78 | $6.87 |
| 13 | Diy Investment | 0.19 | $31.58 | $5.94 |
| 14 | Diet | 0.14 | $32.48 | $4.57 |
| 15 | Cosmetics | 0.13 | $33.61 | $4.48 |
| 16 | Suvs | 0.17 | $33.75 | $5.82 |
| 17 | Highincomecreditcard | 0.14 | $36.19 | $5.17 |
| 18 | Interior Decoration | 0.14 | $37.76 | $5.44 |
| 19 | Home Furnishings | 0.11 | $37.86 | $4.23 |
| 20 | Exercise Equipement | 0.08 | $62.69 | $5.18 |

## tRatio and tCPM (the product's own info-box copy, `IndustryRating.html`)

- tRatio is a correlation coefficient between the target vector and the media vector: "how many
  sums of squares in the shape of the target vector are matched by the media vector". Normalized
  to **-1..1**. +1 = perfect match; 0 = effectively random (a match for the average US
  population); -1 = the opposite of what should be bought (their own example: senior life
  insurance advertised on Cartoon Network or MTV).
- Its stated virtue is being "UNIVERSAL, GLOBAL, and COMPARABLE between advertisers, industries,
  and other factors" — +0.5 means the same quality of match in any industry.
- CPM = cost per thousand impressions. CPM30 = CPM / (medialength/30), standardizing on 30-second
  ads because cost scales roughly linearly with ad seconds. tCPM30 = CPM30 / tRatio.
- Cost estimates come from **SQAD** clearing-price rates; impressions from Nielsen.
- Upper/lower bands on the history charts are the 20th and 80th percentiles of a centered
  90-day-either-side moving average.
- Jon's own lay definition (INTERVIEW Q5): "A ratio is a way to compare two or more numbers or
  amounts... it's how we compare things in a consistent way."

## Interaction model

dc.js + crossfilter: "data driven and reactive… instant feedback to user interaction". The
canonical demo is the dc.js homepage, <https://dc-js.github.io/dc.js/> — click or sweep any chart.
Per `Labs/CLAUDE.md`, the timeline sweep is the signature interaction across the whole portfolio,
and static screenshots undersell it. Some interactions are buggy today; accepted as-is.

## Caveats and honesty notes

- **All data shown is fake/demo data** (INTERVIEW Q4: "its all fake"). Advertiser and brand names
  in the screenshots are demo values.
- **UNKNOWN — do not invent:** who coined tRatio or why it survived every rewrite (INTERVIEW Q6:
  "idk, ignore this"). No crisp "what was ONE TV" summary exists (Q14: "i dont recal").
- The exact commercial outcome of either dashboard beyond "real customers" is not documented.
- Both pages load jQuery over `http://code.jquery.com/jquery-latest.min.js` and reference
  `../libs/` / `../scripts/` / `../content/` in lowercase against real `Libs` / `Scripts` /
  `Content` folders — Windows/IIS only, and broken as mixed content on any https rehost.
- IndustryRankings ships a `.csproj`, `Web.config` and a `bin/` of .NET 4.5 DLLs, but the page is
  plain static HTML and runs off any static server.
- PrecisionDemand era: Jon was **sole UI developer**, Mar 2010 – May 2014 (`Labs/CLAUDE.md`,
  confirmed in INTERVIEW). AOL acquired PrecisionDemand May 2014.

## Reproduction

```sh
npx http-server E:\github2\Labs -p 8123 -c-1
# http://localhost:8123/sellSide/Views/SellSide.html
# http://localhost:8123/IndustryRankings/Views/IndustryRating.html
```

Sweep capture technique: Playwright `mouse.down` / `mouse.move` across `#dateImpsChart svg`.

## Proposed visuals

1. **Buy-side → sell-side inversion** (pictorial SVG). Panel A: nine airings converge to one
   industry score, which is then ranked against the other industries. Panel B: one airing fans out
   to 23 ranked industry cards. Same data, same tRatio, inverted question.
2. **The sweep pair** (`Figure zoom`, before/after screenshots) — the centerpiece.
3. **The sell-side grid** (`Figure zoom`, screenshot) — the 15,502-row crossfilter table.
