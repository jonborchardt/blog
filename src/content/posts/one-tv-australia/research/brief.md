# Domain brief — `one-tv-australia`

Authority repo: `E:\github2\Labs` (specifically `oz/`, the MCN Demand Platform gallery). Sources, in
precedence order: `_agent/INTERVIEW.md` Q15 (Jon's own answer, 2026-08-20), `oz/CLAUDE.md`,
`CLAUDE.md` at the Labs root, `E:\github2\resume\linkedin\`.

## The story

`oz/` is a small static gallery — `oz.html`, a video (`MVP.mp4`) and two screenshots
(`screena.png`, `screenb.png`) — for the version of the ONE TV platform Jon's team deployed for
**MCN (Multi Channel Network), the Australian TV ad-sales house**. Same UI skin as the US
`scatter` platform (`oz/CLAUDE.md`: "Same UI skin as `../scatter/def.png`").

Era: Jon's Principal period at AOL/Oath (Jun 2016 – Mar 2018), leading the platform's UI team
(Labs root `CLAUDE.md`, "Product timeline" #4). This is the last project in the portfolio
chronologically before the Feb–Mar 2018 snapshot itself — the natural closer for the series.

## Facts confirmed by Jon (INTERVIEW.md Q15, folded into `oz/CLAUDE.md`)

> "it did. our system wors similalry. but they had different currency, time zones, and rating
> numbers." (Jon's answer to "MCN Australia (`oz`): did it launch? What was hard about
> OzTAM/TARPs vs Nielsen?")

- MCN Australia **did launch**.
- The system worked **similarly** to the US platform.
- What was hard: **different currency** (OzTAM demo TARPs vs Nielsen impressions), **time
  zones**, and **rating numbers**.

`oz/CLAUDE.md` frames the blog angle explicitly: "internationalizing a US TV-buying platform
(Nielsen→OzTAM, imps→TARPs)."

## UI evidence in the two screenshots (both 2026-08-20-dated `screena.png`/`screenb.png`)

`screena.png` — a campaign/tactic-group builder ("TV TEST" under "All Campaigns > TEST"):

- **Inventory Source**: "MCN National Subscription TV UAT" (dropdown field)
- **Flight Dates**: 30/07/17, 06/08/17, 13/08/17, 20/08/17 — **DD/MM/YY** format, four weekly
  flights spanning late July into August 2017
- **Target**: "P18-54 CONFECTIONERY (M/H)"
- **Demo**: "OzTAM" / "PEOPLE 25-54"
- **Forecasted Plan** cards: SPEND $49,974; TARGET IMPS 2,070,372; OZTAM DEMO IMPS 2,613,322;
  **OZTAM DEMO TARPS** (shown as "--", not populated in this demo state); OZTAM TOTAL PEOPLE IMPS
  5,631,565; **OZTAM TOTAL PEOPLE TARPS** ("--")
- **Impression Distribution** by **community group**: Factual 39.8%, Music 28.6%, General 26.9%,
  Movies 3.2%, Lifestyle 1.1%, Sport 0.4% — the six community-group taxonomy used instead of the
  US system's categories
- Weekly trend chart x-axis labeled in DD/MM: 30/07/17, 06/08/17, 13/08/17, 20/08/17

`screenb.png` — a pacing report ("All Campaigns > Campaign > Pacing Report"):

- **Campaign dates**: 29/03/17 – 18/04/17 (DD/MM/YY again)
- **Updated**: 23/07/17
- **Target**: PEOPLE 25-54; **OzTAM Demo**: Total People
- Pacing table rows dated 26/03/17, 02/04/17, 09/04/17, 16/04/17 — weekly cadence, DD/MM
- Delivered-vs-expected percentages per week (target imps, target CPM, OzTAM total people imps,
  OzTAM total people CPM) — same pacing-report shape as the US platform, just re-plumbed for
  Australian currency and demo definitions

Both screenshots carry the same visual language (card layout, blue accent numbers, sidebar
filters) as the US scatter/upfront platform, supporting "same system, different currency."

## Series-closing facts (Labs root `CLAUDE.md`)

- This is the twelfth and last post in `past-work`.
- The whole `E:\github2\Labs` snapshot was frozen Feb–Mar 2018, the job-hunt gap between Oath and
  Ai2 (May 2018) — covered in post 1, `labs-2018-snapshot` (published, live at `/labs-2018-snapshot/`).
- That post's thesis: in 2026 the entire static snapshot came back to life with one command
  (`npx http-server`), because static files don't rot. This post's coda should hand off to that
  same fact: the whole portfolio, including this last MCN project, still runs, and this series is
  what came out of reopening it.

## Data status

All campaign data in the screenshots is fake/demo data (`CLAUDE.md` root: "All campaign data in
the screenshots is fake/demo data ... publish as-is, no blurring"). No GivingCharts-style
anonymization needed here — no coworker names appear in `oz/`.

## UNKNOWNs — do not fabricate

- No crisp "what was ONE TV" paragraph exists (INTERVIEW.md Q14: "i dont recal") — this post
  should describe only what the `oz` screenshots show, not reconstruct the whole ONE TV product.
- Whether upfront vs scatter is the same codebase MCN ran on is not stated anywhere in the
  authority chain — don't assert it; `oz/CLAUDE.md` only says "same UI skin."
- No war story or specific rollout detail beyond "it did launch... different currency, time
  zones, and rating numbers" — don't invent more texture than that one sentence supports.

## Assets used by this post

- `E:\github2\Labs\oz\screena.png` (1278×780) — cropped to `hero.png` (1500×600, top band, full
  width) and copied whole as `screena.png`.
- `E:\github2\Labs\oz\screenb.png` (1311×1029) — copied whole as `screenb.png`.
- `MVP.mp4` not used — the two screenshots carry every fact the brief needs; no still needed.

## Proposed visuals

1. `screena.png` full, zoomable `Figure` — the campaign builder, showing inventory source, DD/MM
   flight dates, Confectionery target, and the OZTAM TARPS/community-group breakdown together.
2. `screenb.png` full, zoomable `Figure` — the pacing report, showing the same DD/MM convention
   and OzTAM figures in a different screen.
3. A `Comparison` of the US Nielsen-based system vs the Australian OzTAM-based system: currency
   (impressions/CPM vs TARPs/CPT), rating body (Nielsen vs OzTAM), category taxonomy (US verticals
   vs AU community groups Factual/Music/General/Movies/Lifestyle/Sport), date format (MM/DD vs
   DD/MM).

## Coda (series close)

One paragraph handing off to the present: in 2026 the whole portfolio — including this last MCN
project — came back with one command, because it's static files. Link to `/labs-2018-snapshot/`
(published, live). Do not link any of the other ten series posts — not confirmed to exist yet.
