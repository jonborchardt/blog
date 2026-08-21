# Domain brief — ONE TV (upfront + scatter)

Authority: `E:\github2\Labs` (root `CLAUDE.md`, `upfront/CLAUDE.md`, `scatter/CLAUDE.md`,
`_agent/INTERVIEW.md`), plus `E:\github2\resume\linkedin\experience\aol.txt` for job history.
Every claim in the post traces to one of those or to a Labs screenshot read directly.

## Role and timeline

- PrecisionDemand acquired by AOL May 2014. Senior Software Engineer May 2014 – Jun 2016, leading
  the Silverlight → AngularJS migration. Principal Jun 2016 – Mar 2018, leading a UI team of three
  and owning everything users saw on the Linear TV advertising platform. AOL renamed the division
  Oath Jun 2017. Left Mar 2018. (`experience/aol.txt`)
- Balsamiq design-then-build was the standard process at PrecisionDemand and at AOL.
  (`upfront/CLAUDE.md`, Labs root `CLAUDE.md`)
- ONE TV was **shuttered** after Jon left. (`INTERVIEW.md` Q16)

## Open question, deliberately left open

`INTERVIEW.md` Q14 ("ONE TV in one paragraph — and how did upfront vs scatter split the product?")
is answered "i dont recal". The post therefore describes the screens and does **not** assert a
product-split narrative. Same for the Soda War hackathon outcome (Q12: "i dont recall") and for what
MVS/MQS/SMC stand for (undocumented anywhere in the authority chain).

## What the screenshots show

- `upfront/report1.PNG` — shipped ONE TV upfront optimizer, Jon logged in. Campaign "Verizon Q2
  2018", dates 3/26/2018–6/25/2018, network group "Univision Upfront" (networks GALA, UMA, UNI),
  demographic A18-49, total spend $2,651,066. Scenario grid columns: Objective, Budget, Spend, Avg
  Demo CPM, Total Demo Imps, MVS tRatio, MQS tRatio, SMC tRatio. Scenario names include "Sara 1",
  "Olga- shift regress", "Test 363", "Decrease Prod Redo"; objectives Shift / Decrease.
- `upfront/scenario editor.PNG` — NBCU network list: BRAV, CNBC, E!, MSNB, NBC, SYFY, USA.
- `upfront/Upfront1_WithCallouts.png` — hand-annotated Balsamiq wireframe. Q3 Verizon Campaign,
  10/1/2017–1/1/2018, FOX Networks Group, $1,250,000 (21% of total campaign). Mock address bar reads
  `http://onetv.aol.com/upfront/Q3_Verizon…`. Callouts include "Creating a scenario automatically
  adds a new column to the grid below (and a new series in all charting)", "All charts show ALL
  scenarios AND all update on every change", "Ready to print for sending to network". Contains the
  Scenario Editor dialog and a printable Scenario Order Report with Buy/Sell actions.
- `scatter/def.png` — shipped ONE TV scatter UI, 2018. Campaign "Black Opium Valentine's Day 2018",
  tactic group "NBCU $390K", budget $390,000, forecast spend $387,003, Target Impact Score 1.26
  TRATIO, inventory source NBCUniversal National Networks, Nielsen C3. Per-network tRatio: USA 1.13,
  OXYG 1.86, E! 1.38, BRAV 1.21, CNBC 0.58, NBC 0.58.
- `scatter/campaign.png` — three Balsamiq wireframes (Edit Campaign / Edit Cell / Edit Cell Week),
  PrecisionDemand campaign planner. All internal dates are January 2012; milestone rows
  "1/3/12 JonB Campaign Started" and "1/13/12 Steph Buy Complete".
- `scatter/constraints.png` — shipped Silverlight dialog "Edit Campaign Constraints (Campaign #1)
  Last Edit: 1/29/2013".
- `_agent/screenshots/maphack-sodawar.png` — "Hackathon Aug 2014 Adap.TV", project "Dynamic spend
  map"; credits "Front End: Jon Borchardt", "Data: Sawin Lee, Dyng Au, Brendan Kitts". D3 choropleth
  of Coke (red) vs Pepsi (blue) TV ad spend by market over 24 hours, with a play button and a time
  slider.

## The constraints lineage (the post's spine and its one diagram)

Read field-for-field off the three images. Identical vocabulary, identical order; `program` becomes
`airing` in 2017; the 2013 build shipped looser defaults than the 2012 drawing specified.

| Field                | 2012 wireframe (`campaign.png`) | 2013 Silverlight (`constraints.png`) | 2017 wireframe (`Upfront1_WithCallouts.png`) |
| -------------------- | ------------------------------- | ------------------------------------ | -------------------------------------------- |
| Min cluster tRatio   | 0.30                            | 0.50                                 | 0.30                                         |
| Min blended tRatio   | 0.20                            | 0.50                                 | 0.20                                         |
| Max single buy %     | 0.05                            | 40.00 %                              | 0.05                                         |
| Max single count     | 50                              | 45                                   | 50                                           |
| Min CPM              | 3.00                            | $1.00                                | 3.00                                         |

Fields present in 2012 and 2017 but not 2013: Min/Max Imps per airing. Present in 2013 only:
Min/Max Gross Rating Points. Present in 2017 only: Max network %. "Max single cable %" / "Max single
broadcast %" appear in all three (2013 spells them "…buy %").

## Data and naming permissions

All campaign data in the screenshots is fake/demo data — publish as-is, no blurring
(`INTERVIEW.md` Q4: "its all fake"). Sawin Lee, Dyng Au, Brendan Kitts, Steph, Sara and Olga are
cleared to name (Q3).
