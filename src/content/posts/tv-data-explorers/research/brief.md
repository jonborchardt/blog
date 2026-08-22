# Domain brief — `tv-data-explorers`

Authority repo: `E:\github2\Labs`. Sources, in precedence order: `_agent/INTERVIEW.md` (Jon's own
answers, 2026-08-20, Q17), then the four project `CLAUDE.md` files (`adsplore`, `packageCompare`,
`personReporting`, `reporting`), then the root Labs `CLAUDE.md`.

## The story

Four unrelated internal tools, one thread: none of them were requested or shipped to a customer.
Per Jon (INTERVIEW.md Q17): *"they were all demos and internal tools to understnad the data we
had."* Grouped here because they share that purpose, not because they were built together or in
sequence.

## Per-tool facts

- **Adsplore** (`adsplore/CLAUDE.md`): a wizard (Home → Brands → Targets → TV Ads) that pulls every
  TV ad run by selected brands and scores each −1…+1 for how well it targeted each selected
  population, with breakdowns by daypart, network, market, program, genre, and pod position.
  `adsplore1.PNG` shows a run of 10,739 ads (500 sampled on screen). Crossfilter-style charts.
- **Package Compare** (`packageCompare/CLAUDE.md`): media-package comparison tool. Two annotated
  screenshots exist; `comparer_WithCallouts.png` used here shows an inventory-search panel, two
  editable packages (cost/impressions/notes per line item), and eight shared comparison charts
  (impressions over time, targetedness, spend, impressions by channel/daypart/CPM/eCPM/GRPs).
- **Population Reporting** (`personReporting/CLAUDE.md`, entry point `personReporting.html`):
  six screenshots; `7.PNG` used here compares "Total People" vs "Total Buyers" across age (2-year
  increments), education level, household income, and home market value. Field names
  (`Income-EstimatedHouseh…`, `HomeMarketValue`) match licensed consumer data — an Acxiom database
  is named in `../Web.CustomerProfileLegos.Server/Web.config`, same data lineage.
- **Campaign Reporting** (`reporting/CLAUDE.md`): `proposal.gif` is a May 2017 campaign-pacing
  chart — weekly impressions as confirmed/preliminary/projected bars against an "expected" line —
  delivery tracking against plan in the ONE TV era. Screenshot dated 5/5/2017, weeks run into late
  July 2017.

## Facts confirmed by Jon (override any inference)

- All four: demos/internal tools built to understand the data PD/AOL had (INTERVIEW.md Q17).
- All campaign/targeting data shown is fake/demo data (Labs root `CLAUDE.md` "Author's answers") —
  publish as-is, no blurring; say it's demo data where natural. No GivingCharts assets used in this
  post, so the coworker-name anonymization exception does not apply here.

## UNKNOWNs — not used in this post

Global series UNKNOWNs (tRatio's origin, a crisp "what was ONE TV" summary, Soda War hackathon
outcome, best scatter/drive-download video) do not intersect this post's four tools; none invoked.

Update 2026-08-21: the Soda War section (video + poster, `./soda-war.webm` / `./soda-war.png`) was
moved into this post from `one-tv-upfront-scatter`. Its hackathon outcome stays UNKNOWN ("i dont
recall" — the prose hedges accordingly); the domain facts for it live in the
`one-tv-upfront-scatter` brief.

## Assets used by this post

- `E:\github2\Labs\adsplore\adsplore1.PNG` (932x820) → `./adsplore1.png`
- `E:\github2\Labs\packageCompare\comparer_WithCallouts.png` (1746x854) → `./comparer_WithCallouts.png`
- `E:\github2\Labs\personReporting\7.PNG` (962x677) → `./personReporting7.png`
- `E:\github2\Labs\reporting\proposal.gif` (518x276) → `./proposal.gif`
- Hero: 2x2 composite of all four (`fit: cover`, top-aligned, 750x300 per cell) via a scratchpad
  `sharp` script, cropped to 1500x600 total.

## Proposed visuals

One figure per section, the four screenshots above — no additional charts needed; each screenshot
already is the data.
