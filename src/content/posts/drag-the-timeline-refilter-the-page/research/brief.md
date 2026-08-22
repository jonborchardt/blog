# Domain brief — `drag-the-timeline-refilter-the-page` (formerly `google-charts-to-d3`)

Authority repo: `E:\github2\Labs` (Jon Borchardt's 2018 portfolio snapshot). Investigated
2026-08-20 by reading the repo's `CLAUDE.md` files and its source, and by serving the site locally
(`npx http-server . -p 8123 -c-1`) and driving it with Playwright.

## The story

2013, PrecisionDemand, where Jon was the **sole UI developer**. The product's charts were
off-the-shelf Google Charts. In 20% time he replaced them with hand-built D3 equivalents. The
folder of demos that came out of it (`demos/d3Demo`) is the core "replace the off-the-shelf chart"
artifact, and its signature feature — drag a brush across a timeline strip and every chart on the
page refilters live — is the technique Jon names as one of the things that became flagship.

## Authority chain used

| Claim in the post                                                       | Source                                                                    |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 2013, PrecisionDemand, sole UI developer                                | `Labs/CLAUDE.md` timeline §3; `demos/CLAUDE.md` "Era [resume]"            |
| Replacing standard Google Charts with our own D3 equivalents            | `_agent/INTERVIEW.md` Q9 (Jon's answer)                                   |
| Google's annotated timeline was itself Flash; hence the page headline    | `demos/CLAUDE.md` "Blog angles"                                           |
| `fordsuvindustry.htm` / `jonbtest.htm` are the "before" artifacts        | `demos/CLAUDE.md`; verified by reading both files                          |
| The demo set: industryTracker, rotations, programs, explorer, webSpike   | `demos/CLAUDE.md`; `ls demos/d3Demo`                                       |
| crossfilter / dc.js / NVD3; click filters everything, brush refilters    | `demos/CLAUDE.md`; `Labs/CLAUDE.md` "Interactivity"                        |
| The sweep is the signature interaction                                  | `Labs/CLAUDE.md` "Interactivity"; `INTERVIEW.md` Q21                       |
| Crossfilter/dc.js charting itself became flagship technique              | `INTERVIEW.md` Q21; `Labs/CLAUDE.md` "Series thesis"                       |
| IndustryRankings / sellSide served real customers                       | `INTERVIEW.md` Q11                                                        |
| All campaign data is fake/demo data                                     | `INTERVIEW.md` Q4                                                         |
| AOL acquisition May 2014; Jon led the Silverlight→AngularJS migration    | `Labs/CLAUDE.md` timeline §4                                              |
| Earlier orphaned tracker + dated GM/Cadillac build                      | `industryTracker/CLAUDE.md`, `industryTracker2/CLAUDE.md`                 |

## Verified from source (2026-08-20)

- `demos/d3Demo/industryTracker.html` `<h1>` is literally **"Replacement for existing Flash based
  Industry Tracker"**. Its `<title>` is "PrecisionDemand Industry Tracker".
- `nvd3Ex/PdLineWithFocusChart.js` is **795 lines**, defining `nv.models.PdLineWithFocusChart` in
  NVD3's model namespace. Siblings: `PdBubbleMap.js` (72), `PdHeatMap.js` (91).
- Data files (`data/GM_SUVs_vs_NonGM_SUVs_7_15_13.txt`) carry per-point `label` / `description` /
  `notes` — the same shape as the Google chart's spare annotation string columns — and pin the two
  series to `#4684EE` and `#DC3912`.
- Per-page libraries: `industryTracker` = NVD3 + PdLineWithFocusChart only; `rotationExample` and
  `programExample` add crossfilter + topojson; `explorerExample` is the only page loading
  `libs/dc/dc.js`; `webSpike` is NVD3 + topojson. D3 v3 and topojson come from `http://d3js.org`.
- `nvd3Ex/crossfilterChart.js` opens with `// A direct copy from the crossfilter example:` and the
  upstream GitHub URL.
- `demos/d3Demo/index.html` ("Front-end data visualization examples") is a references page linking
  d3js.org, nvd3.org, crossfilter, four NYT interactives and Bostock's Wealth & Health of Nations.
  `demos.html` is six escalating micro-demos (hover → thousands of animated points).

## Correction to the authority repo

`Labs/CLAUDE.md` "Known hazards" says Google's `jsapi` `annotatedtimeline` is "retired entirely —
those two pages are dead". **This is wrong as of 2026-08-20.** Both `fordsuvindustry.htm` and
`jonbtest.htm` render. `google.load('visualization','1',{packages:['annotatedtimeline']})` forwards
to `https://www.gstatic.com/charts/51/loader.js`, which draws the modern SVG **`annotationchart`**:
the loaded page has 12 `<svg>` elements and zero `<object>`/`<embed>`/`<iframe>`/`<canvas>`. Google
swapped the Flash implementation for an SVG one behind the same API. The post says this explicitly
rather than repeating the "dead" claim. `Labs/CLAUDE.md` should be amended.

## Sweep capture (reproduction)

Server: `npx http-server E:\github2\Labs -p 8123 -c-1`. Playwright imported from
`E:/github2/blog/node_modules`. For each page: `scrollIntoViewIfNeeded()` on the chart's own `svg`,
take the y/height of `.nv-context .nv-brushBackground rect` (its width is 0 when the brush is
empty — take x/width from `.nv-context .nv-x.nv-axis` instead), then `mouse.move` to 8% across the
strip, `mouse.down`, and `mouse.move` in four increments out to 62%, screenshotting after each with
the button still down.

Pages driven: `demos/d3Demo/rotationExample.html` (1440×1050, dsf 2) and
`demos/d3Demo/industryTracker.html` (1440×800, dsf 2). Baselines for comparison:
`_agent/screenshots/d3demo-rotations.png`, `d3demo-industrytracker.png`.

Readings taken from the captured frames (top of the "Top Networks" list):

| Window                     | Leader                | Runner-up             |
| -------------------------- | --------------------- | --------------------- |
| all (2010–2013)            | HIST 7,494,926.60     | FNEW 6,601,245.00     |
| ~Nov 2010 – Mar 2011       | GALA 359,290.00       | FNEW 209,600.00       |
| ~Nov 2010 – Oct 2011       | FNEW 714,225.00       | AMC 606,120.00        |
| ~Nov 2010 – Jun 2012       | FNEW 2,881,495.00     | HIST 1,846,784.60     |

## Honesty notes

- INTERVIEW Q9 asked "did the demo set win the argument?" — Jon answered only the first half of the
  question. The post says he doesn't remember an argument rather than inventing an outcome.
- tRatio's origin is a documented UNKNOWN (Q6: "idk, ignore this") — the post uses the metric but
  makes no origin claim.
- `Labs/CLAUDE.md` records that some demo interactions are buggy today and accepted as-is. The
  sweep itself works; the post says so and leaves the rest alone.
