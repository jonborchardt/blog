# Domain brief — Audience Planner (PrecisionDemand, 2010–2014)

Authority repo: `E:\github2\Labs`. Compiled 2026-08-20 from the authority chain, in precedence
order: `_agent/INTERVIEW.md` (Jon's own answers) → `CLAUDE.md` (root) → `PivotViewer/CLAUDE.md` and
`Web.CustomerProfileLegos.Server/CLAUDE.md` → `E:\github2\resume\linkedin\` → the artifacts
themselves (the five screenshots).

## The story

A 20%-time idea that became PrecisionDemand's flagship product, built entirely by the company's
sole UI developer. It is the strongest single artifact in the portfolio, and the one Jon names
first when asked what he is proudest of.

The surprising part is not the technology (Silverlight, now extinct) but the shape of the
interaction: an ad buyer explores thousands of TV programs as a single visual collection, narrows
it with facets, hands the survivors to an optimizer, and walks out with a spreadsheet. Four moves.
The whole product is those four moves.

## Company and role

- PrecisionDemand, Greater Seattle. Jon: Senior Software Engineer, **sole User Interface
  developer**, March 2010 – May 2014 (4 yr 3 mo). Every screen customers and internal teams touched
  was his, design and code. [resume/experience/precisiondemand.txt; INTERVIEW.md "Answered from the
  resume"; Labs/CLAUDE.md timeline item 3]
- Elevator pitch, Jon's words: "tv television ad spend optimization. we could tell you [what]
  market your ad dollars would convert into real sales." [INTERVIEW.md Q7]
- "The platform I built was a key factor in AOL's decision to acquire the company in 2014."
  [resume/experience/precisiondemand.txt]; "The platform's quality was a key factor in the
  acquisition." [Labs/CLAUDE.md]
- Acquired by AOL May 2014; Jon then led the Silverlight→AngularJS migration that retired this app.
  [Labs/CLAUDE.md timeline item 4; PivotViewer/CLAUDE.md; Web.CustomerProfileLegos.Server/CLAUDE.md]
- Origin: "every one of these tools was drempt up by me and done in my 20% time. many of them
  becaise the flagship product for the company. specifically, audience planner, docmapper, sell
  side targeting, and using crossfilter and dc.js…" [INTERVIEW.md Q21]
- Proudest-of list: "audience planner, docmapper, sellside targeting" [INTERVIEW.md Q1]

## Why Silverlight, and why it went

- "the comapn started at the dawn of silverlight, and we eventaully pivoted away from silverlight
  as other web tech beceom emore doninant." [INTERVIEW.md Q8]
- No "moment I knew" story exists — Jon did not give one. Do not invent a decision moment.

## The app itself (from PivotViewer/CLAUDE.md and the screenshots)

Branded "PrecisionDemand", `File | Settings | Help` menu bar, "Jon Borchardt" in the top right.
Directory is named `PivotViewer`; the tagline on the portfolio card was "explore the TV landscape".

**`audience-planner.PNG` — histogram view.** Toolbar: `Sort: tRatio`, `Color: tRatio`, a zoom
slider, six view-mode buttons. Filter breadcrumb `tRatio: Over -0.4`. Left facet panel: Search box,
a **tRatio** facet with a two-handle range slider (axis −1 to 0.5) over a mini distribution, then
`tRatio Cluster 1`, `tRatio Cluster 2`, `tRatio Cluster 3`, `Imps per Air`, `tImps per Air`,
`Cost per Air`, `CPM`, `tCPM` (list continues below the fold). Main pane: nine stacked-tile bars on
an x-axis from −0.4 to 0.5, each bar a stack of individual program cards, coloured on a red→green
ramp. Status bar: **Program Count: 2473**, Average Impressions: 241772, Average Cost: $1,022.77,
Average CPM: $4.23, Average tCPM: $112.12.

**`treeMap.PNG` — treemap view.** Filter breadcrumb `Genre: INSTRUCTIONS, ADVICE`. Toolbar
`Sort: Imps per Air`, `Color: tRatio`. Facets visible: `tImps per Air`, `Cost per Air`, `CPM`,
`tCPM`, `Media Market`, `Network`, `Genre`, `Conversions`, `CPA`, `Primary Daypart`,
`Primary Day Of Week`. Genre facet (sorted by quantity): DOCUMENTARY, GEN 762 · INSTRUCTIONS, ADV
**191 (checked)** · GENERAL DRAMA 149 · FEATURE FILM 95 · NEWS 62 · POPULAR MUSIC-CON 55 ·
SITUATION COMEDY 45 · SPORTS EVENT 31. Tiles are program cards sized by impressions per airing and
coloured by tRatio, each showing its network logo (Food Network, HGTV, TLC, Travel Channel, OWN,
DIY, BBC) and the label "National Cable". Status bar: **Program Count: 191**, Average Impressions:
294,988, Average Cost: $1,632.80, Average CPM: $5.54, Average tCPM: $96.92.

**`targeting.PNG` — a single card, zoomed, with its detail panel.** Card: network `DSCH`, program
`CONFESSIONS:…`, CPM $3.93, tCPM $48.02, Imps 50,882, tRatio 0.06, each with a small in-context
bar showing where that value sits in the distribution. Right-hand panel repeats those four metrics,
then **Airings**: `Max Weekly 167`, `Chevy Equinox 0`, `Jeep Grand Cherokee 0`, `Ford Edge 0`,
`Honda Pilot 0`, `PrecisionDemand Optimal 0`. Then **Demographics** — `HomeYearBuilt-Ranges…` (two
rows), `Gender-InputIndividual…`, `Golf - True`, `Income-…`, `MaritalStatusintheHousehold…` — each
with a small diverging bar (index above/below baseline). Status bar Program Count: 2328.

**`excel.PNG` — the optimizer grid.** Columns: `Lock` (checkbox), `Optimal Airings` (numeric
spinner + bar), `Program Airings`, `Program Duration`, `Program Name`, `Network`, `Cost per Air`
(value + red/green bar), `Optimal Spend`, `Imps per Air` (value + bar), then a clipped column.
Buttons bottom-left `Re-calculate Optimal Plan`, bottom-right `Export to Excel`, pager `Page 1 of
12`. **Exactly 28 rows are visible and exactly 6 have a non-zero Optimal Airings** (recounted
2026-08-20 — an earlier "~25 rows / 7 non-zero" reading was wrong). The 22 zero rows are Property
Virgins, NY Ink, How I Met Your Mother, Mutant Planet, My First Place, SyFy Movie, The Great Food
Truck Race, House Hunters International, Mysteries at the Museum, House Hunters, Planet Earth,
Toddlers and Tiaras, Tyler Perry's House of Payne, NHL Hockey, WILD WEEKEND, Diners Drive-Ins and
Dives, Making Monsters, Big Rich Texas, Flipping Out, Curb Appeal: The Block, Swamp Wars, Friends.

The six non-zero rows (arithmetic re-checked 2026-08-20). `Optimal Spend ≈ Optimal Airings ×
Cost per Air`, but **not exactly** — every row is off by up to 15 cents, consistent with the
displayed `Cost per Air` being rounded to the penny while the stored value is not. Do not state the
product as equal to the cell:

| Program                        | Network | Program airings | Duration | Cost per air | Optimal airings | Optimal spend (cell) | airings × cost | delta  |
| ------------------------------ | ------- | --------------- | -------- | ------------ | --------------- | -------------------- | -------------- | ------ |
| The Tonight Show With Jay Leno | NBC     | 367             | 48       | $19,893.62   | 50              | $994,681.10          | $994,681.00    | +$0.10 |
| House                          | FOX     | 18              | 60       | $129,962.90  | 18              | $2,339,332.13        | $2,339,332.20  | −$0.07 |
| Cubs Baseball                  | WGNA    | 41              | 190      | $2,670.62    | 41              | $109,495.34          | $109,495.42    | −$0.08 |
| Say Yes to the Dress           | TLC     | 444             | 31       | $2,734.69    | 50              | $136,734.35          | $136,734.50    | −$0.15 |
| So You Think You Can Dance     | FOX     | 21              | 105      | $149,909.14  | 18              | $2,698,364.60        | $2,698,364.52  | +$0.08 |
| 60 Minutes                     | CBS     | 26              | 60       | $102,988.30  | 26              | $2,677,695.77        | $2,677,695.80  | −$0.03 |

**`charts.PNG` — plan comparison charts.** Seven cards: `Airing Count` ("Airings will be 417 % more
than Client"), `Targeted CPM` ("Targeted CPM will be 99 % less than Client"), `Targeted
Impressions` ("Targeted impression will be 6,966 % more than Client"), `Impressions by Day of Week`
(Monday–Sunday), `Broadcast Impressions`, `Impressions by Daypart`, `Cable Impressions`. Every
grouped bar chart has five series with no visible legend. **`Cable Impressions` renders empty** —
axis labels and gridlines, zero bars. Cause unknown (most likely an empty bucket in the demo data);
do not explain it as anything more definite than that.

## Backing stack (`Web.CustomerProfileLegos.Server/CLAUDE.md`)

- Silverlight client `ClientBin/MarketScale.Web.CustomerProfileLegos.Client.xap` plus Silverlight
  Toolkit assemblies; host pages `Web.CustomerProfileLegos.ClientTestPage.html` / `.aspx`.
- WCF backend `Services/DalService.svc`. `Web.config` hardcodes Entity Framework connection strings
  to server **`baker`**, databases **`Demographics`** and **`Acxiom`**.
- MarketScale-branded; four dated `backup_*` copies date the directory to Dec 2011 – Feb 2012.
  `MarketScale` appears in no other directory of the Labs archive (verified by grep, 2026-08-20).
- Unrunnable today: no browser ships Silverlight, and the SQL server is long gone. Not linked from
  the portfolio's landing page.
- **Verified from source** (`backup_2_8_12/Services/IDalService.cs`, `DalService.svc.cs`,
  `Web.config`, 2026-08-20): the `[ServiceContract]` has exactly three `[OperationContract]`
  methods — `GetClusters(int sourceKey)`, `GetRelevantDemographicsOfCluster(int sourceKey, int
  clusterId, int clusterSize, ChartableDemographics chartType)`, `GetClusterSources()`. Namespaces
  are `MarketScale.Web.CustomerProfileLegos.Server.*`; the DAL is `MarketScale.Core.ProfileDal`.
  Connection strings: `DemographicsEntities` → `data source=baker;initial catalog=Demographics`,
  `AcxiomEntities` → `data source=baker;initial catalog=Acxiom`, both `integrated security=True`,
  EF/`System.Data.EntityClient`. `GetClusters` also stamps each cluster with a round-robin
  `PersonaId` and the display name `"Natural Cluster " + id`.
- **Caveat:** this is a sibling Silverlight-era project, not proven to be the Audience Planner's own
  backend. `PivotViewer/CLAUDE.md` calls it "related Silverlight-era code". The post must present it
  as a survivor from the same period and the same hands, not as the Planner's stack. The "cluster"
  vocabulary shared with the `tRatio Cluster 1/2/3` facets is a strong link, but a link, not proof.

## tRatio

- Targeting ratio. Jon's lay definition: "A ratio is a way to compare two or more numbers or
  amounts. It shows how much of one thing exists compared to another. its how we campare things in
  a consistent way." [INTERVIEW.md Q5]
- Who invented it, and why it survived every rewrite 2011→2018: **UNKNOWN, do not invent.**
  [INTERVIEW.md Q6: "idk, ignorer this"]
- It appears in every generation of the product from this 2011 Silverlight app to the 2018 ONE TV
  UI. [Labs/CLAUDE.md]
- The `t` prefix means "targeted": the app shows `CPM`/`tCPM` and `Imps per Air`/`tImps per Air` as
  pairs, and `charts.PNG` spells the pair out as "Targeted CPM" and "Targeted Impressions".
  (Evidence-backed reading, not a quoted source.)

## Data

All campaign data in every screenshot is **fake/demo data** — publish as-is, no blurring.
[INTERVIEW.md Q4 "its all fake"; Labs/CLAUDE.md]

## Honesty notes — write around these, do not fill them in

1. **No "moment I knew Silverlight had to go".** Jon answered only the "why Silverlight" half of
   the question. State the trend, not a decision moment.
2. **tRatio's origin is unknown.** Never attribute it.
3. **Which chrome was Microsoft's PivotViewer control and which was hand-written is not
   recoverable** from the archive — the directory holds only media, no Silverlight control, and the
   `.xap` in the sibling directory is a different (MarketScale-branded) client. Say so.
4. **The five unlabelled series in `charts.PNG`** are not identified anywhere. The card detail panel
   lists exactly five airing rows (four vehicle names plus "PrecisionDemand Optimal"), which is
   suggestive, but the mapping is a guess — mark it as one.
5. **The three screenshots are three different filter states**, not one session: `audience-planner`
   = 2,473 with `tRatio: Over -0.4` applied; `treeMap` = 191 with one genre ticked; `targeting` =
   2,328, and back on the card grid rather than the treemap. Do not present 191 as a filtering of
   2,473, and do not let a reader try to reconcile the 2,328 with either.
6. **The `Lock` column's exact semantics** are a reading of the UI, not a documented fact.
7. `d3PivotViewerBorchardt.mp4` exists in the archive but **must not be embedded** — this blog is
   static-first, stills only.

## Proposed visuals

1. **Explore → filter → optimize → export** (required by the task): pictorial funnel, four bands
   narrowing top to bottom. Real numbers where honest: ~2,473 cards in the histogram view; one
   genre checkbox leaves 191 (different screenshot — say so in the summary). Bottom band is a
   spreadsheet.
2. **The dead stack**: browser plug-in (`.xap`) → `DalService.svc` (WCF) → two SQL databases
   (`Demographics`, `Acxiom`) on server `baker`, with a single annotation that none of it runs in
   2026. Every label is quoted from `Web.CustomerProfileLegos.Server/CLAUDE.md` and its `Web.config`.
   Name it "the surviving Silverlight-era stack", not "the Audience Planner's stack" (see caveat).

No synthetic chart of the demo numbers: the values are fabricated demo data and a chart of them
would lend them a precision they never had. The screenshots carry the quantitative load.
