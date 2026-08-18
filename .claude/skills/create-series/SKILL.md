---
name: create-series
description: Add a new series to the registry (`src/config/series.ts`) and optionally scaffold its first post. Use when a set of posts should be read in order under one title.
---

# create-series

A series is `id → { title, description }` in `src/config/series.ts` (generated file — edit values only). Posts join it with `series: <id>` + `seriesOrder`. Not supported by design: planned/future parts, lifecycle status, a post in two series.

## Steps

1. Choose an **id** (kebab-case, permanent — it is the URL `/series/<id>/`), a **title** (short, Title Case) and a one-sentence **description** (what the reader will learn, in order).
2. Add it either
   - in `npm run dev` at `http://localhost:4321/blog/admin/` → Series → new id → fill title/description → Save (rewrites the file, formatted), or
   - by hand: add the entry to the object in `src/config/series.ts`, then `npm run format`.
3. **Do not set `hero`.** Leave it unset so the series shows its first post's hero (the fallback in `getSeriesHero`). Never point `hero` at a copy of `hero-placeholder.png` — a grey placeholder card is worse than the first post's real image. Set `hero` only when a bespoke series image already exists under `src/assets/series/`.
4. `npm run validate` (types: `SERIES_IDS` must stay a literal union — it does if you only added a key).
5. Optionally scaffold part 1: `npm run new-post -- <slug> --series <id> …` (order is computed), then continue with `write-post`.
6. The series page `/series/<id>/` appears automatically; the article header shows "Title · Part n of m" positionally, and prev/next navigation is generated.

## Deleting

Only via `/admin/` (it refuses while any post still references the id) or by hand after removing the reference from every post; the build fails on unknown series.
