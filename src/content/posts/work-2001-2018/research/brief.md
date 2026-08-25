# Domain brief — `labs-2018-snapshot`

Authority repo: `E:\github2\Labs` (the 2018 portfolio snapshot itself). Sources, in precedence
order: `_agent/INTERVIEW.md` (Jon's own answers, 2026-08-20), `CLAUDE.md` at the Labs root,
per-project `CLAUDE.md` files, `E:\github2\resume\linkedin\`, and the artifacts in the repo.

## The story

`E:\github2\Labs` is a static site Jon bulk-copied together in **Feb–Mar 2018** as a job-hunt
portfolio, in the gap between leaving **Oath (Mar 2018)** and joining **Ai2 (May 2018)**. Landing
page `default.htm` is a card grid of Products, Demos and Patents. It is not a git repo; it is a
frozen directory.

The thesis for the whole series, in Jon's words: *"every one of these tools was drempt up by me
and done in my 20% time. many of them becaise the flagship product for the company. specifically,
audience planner, docmapper, sell side targeting, and using crossfilter and dc.js for highly
interactinve charitng."* (INTERVIEW.md Q21, folded into Labs `CLAUDE.md` → "Author's answers").

Because everything is static HTML/CSS/JS, the whole site came back in 2026 with one command:
`npx http-server E:\github2\Labs -p 8123 -c-1`, then `http://localhost:8123/default.htm`. Every
internal link is root-absolute, so the directory must be the web root — `file://` breaks it.

## Timeline (Labs `CLAUDE.md` "Product timeline", confirmed against `resume/linkedin/`)

| Years | Employer | Role | Portfolio items |
|---|---|---|---|
| Aug 2001 – Oct 2007 | Attenex | founding engineer → senior SWE, straight from UW CS | Document Mapper 3D visualization engine (OpenGL → DirectX); 5+ visualization patents |
| Mar 2008 – Mar 2010 | Microsoft Bing | SDE2, Bing UX team | hover preview panel, quick-answer module, core results list; mentored 3 juniors |
| Mar 2010 – May 2014 | PrecisionDemand | **sole UI developer** (every screen in the product) | Silverlight Audience Planner, "Media Foundry" verification tool, 2012–13 Balsamiq wireframes, Flash → D3 rewrite, IndustryRankings, sellSide |
| May 2014 – Mar 2018 | AOL (acquired PD May 2014) → Oath (rebrand Jun 2017); Principal from Jun 2016, led a UI team of 3 | Silverlight → AngularJS migration; ONE TV upfront + scatter; MCN Australia (`oz`); Adap.tv-era hackathon/rewards dashboards |

Sell-side patent granted as **US10567820B2** (Feb 2020). Full patent list (6 granted, 5 filed):
`E:\github2\resume\linkedin\patents.txt`.

## Facts confirmed by Jon (override any inference)

- PrecisionDemand pitch: TV ad-spend optimization — *"we could tell you what market your ad
  dollars would convert into real sales."*
- IndustryRankings / sellSide dashboards served **real customers**, not just demos.
- Media Foundry was the real product name; aired-spot detection used **ad watermarks**, with paid
  spotters across the country.
- MCN Australia **did launch**; differences vs the US system were currency, time zones, and
  rating numbers (OzTAM/TARPs vs Nielsen).
- ONE TV was **shuttered** after Jon left.
- Adsplore / packageCompare / personReporting / reporting were demos and internal
  data-understanding tools.
- BunnyPuddle games all shipped, around 2010; the water simulation existed "because it was fun".
- FatalEncounters was a personal project on real data, never public.
- The demos overview video was recorded in **2018 for the job hunt** — same purpose as the
  snapshot itself.
- **All campaign data in the screenshots is fake/demo data** (Verizon, YSL, Carfax, the
  Nielsen/OzTAM numbers). Publish as-is. Exception: anonymize GivingCharts coworker names.
- Collaborators may be named (Sawin Lee, Dyng Au, Brendan Kitts, "Steph", Sara/Olga).

## tRatio

The through-line metric: **tRatio** (targeting ratio) appears in every generation from the 2011
Silverlight app through the 2018 ONE TV UI. Jon's lay definition (INTERVIEW.md Q5): *"A ratio is a
way to compare two or more numbers or amounts. It shows how much of one thing exists compared to
another. its how we campare things in a consistent way."*

**UNKNOWN — do not invent:** who coined tRatio and why it survived every rewrite. Jon: *"idk,
ignore this."* Write around it or state the uncertainty in prose.

## Other UNKNOWNs (must not be fabricated)

- A crisp "what was ONE TV" paragraph, and how upfront vs scatter split the product — Jon does not
  recall (Q14).
- Whether Soda War won the Aug 2014 hackathon (Q12).
- Which `scatter/drive-download-*` demo video is the best one (Q20).

## Known hazards in the snapshot (Labs `CLAUDE.md`)

- Two things do not run today: `Web.CustomerProfileLegos.Server` (Silverlight + WCF + SQL Server —
  no browser has Silverlight) and `WebSpikeExplorer` (ASP.NET MVC against an API that is gone; its
  static equivalent is `demos/d3Demo/webSpike.html`).
- `http://`-only CDN script tags (d3js.org, code.jquery.com, google.com/jsapi, bootstrapcdn) —
  fine over local http, mixed content on any https rehost. Google's `jsapi annotatedtimeline` is
  retired, which kills `fordsuvindustry.htm` and `jonbtest.htm` outright.
- Pervasive filename case mismatches (`.PNG` vs `.png`, `Libs` vs `libs`) — fine on Windows/IIS,
  404 on case-sensitive hosts.

## Interactivity worth showcasing later

The chart demos are crossfilter-style interactive dashboards: clicking a bar or row refilters every
other chart, and most pages have a timeline **brush/sweep**. The sweep is the signature interaction.
Verified before/after captures live in `_agent/screenshots/industry-rankings-{before,swept}.png`.

## Assets used by this post

- `E:\github2\Labs\_agent\screenshots\00-landing.png` (1440×900) — the portfolio landing page.
  Cropped to `hero.png` (1500×600) and copied whole as `labs-landing.png`.

## Proposed visuals

1. The landing-page screenshot, full width, zoomable — it is the subject of the post.
2. A career-arc timeline (2001–2018) marking the four employers, what each contributed to the
   portfolio, and the stretch (2011–2018) over which tRatio persists.

## The other eleven posts in the series, in order

attenex-docmapper, bing-hover-preview, bunnypuddle-games, precisiondemand-audience-planner,
media-foundry-watermarks, drag-the-timeline-refilter-the-page, sell-side-targeting, tv-data-explorers,
one-codebase-two-datasets, one-tv-upfront-scatter, one-tv-australia.
