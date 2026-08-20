# Domain brief: ponytail-lazy-senior-dev (retroactive)

Authority repo: `E:\github2\earth` for everything the post claims about the WorldLock codebase. The ponytail skill itself is **not** in the earth repo (`E:\github2\earth\.claude\` contains only `settings.json`); the skill definition lives in the blog workspace's ponytail plugin, and the post's paraphrase was checked against that. The PR-replay experiment left **no artifacts in the earth repo** (no `plans/`, no `.superpowers/`, no review records) — those claims are author-vouched, marked below.

## 1. The strongest story

The post's core move is sound and repo-verifiable: a constrained "lazy" mode left literal fingerprints in a real codebase, and the fingerprints are checkable — file count, dependency list, the style table, the UI-in-code choice, and a greppable `ponytail:` debt ledger. The under-sold surprise: **the repo's ledger is richer than the post says.** `grep -rn "ponytail:"` over `app/src/main/java` returns exactly **four** comments, and the post quotes only two — omitting the single biggest deliberate corner (the globe is a sphere, not the WGS84 ellipsoid, `GlobeRenderer.kt:17–18`), which sibling post #1 now features prominently. The honest list is *better* evidence for the post's own thesis than the abridged one.

## 2. Important technical ideas

- **Rung-3/4 answers where Android reaches for libraries** — all verified: ISS fetcher is a plain `Thread` (`MainActivity.kt:100 private val issFetcher = Thread {`) + `java.net.URL` (`:104`); geocoding is a background `Thread` + platform `Geocoder` (`:259, :273`); persistence is activity `SharedPreferences` (CLAUDE.md conventions; code). No androidx dependencies, no coroutines, no DI, no ViewModel (`app/build.gradle.kts:47–51` has exactly two `implementation` lines, neither androidx).
- **UI in code**: there is no `res/layout/` directory at all; the splash and the settings sheet are `LinearLayout`s built in code and `setContentView(rootLayout)` takes a programmatic view (`MainActivity.kt:160–188, 281+`).
- **Style table over class-per-style**: `TowerRenderer.Style` (`TowerRenderer.kt:18–35`) carries `strands`, `twist`, `blend`/`additive`, `mode` (fragment-shader switch), and `profile: (Float) -> Float` — the post's "radius-profile lambda" is literal. Seven entries in `STYLES` (`:343–357`); adding a style is adding a row.
- **The four-entry `ponytail:` ledger** (see §7 for full data).
- **The "until it hurts" bet** is a direct quote of repo policy: `CLAUDE.md:28` "Single module, single activity. Keep it that way until it hurts."
- **The protected floor**: the coordinate rules the post says a naive lazy pass would flatten are indeed codified as non-negotiables — `CLAUDE.md` "Hard rules — coordinate systems" (ECEF in doubles, never floats; render origin near the camera).

## 3. Factual corrections and missing context

1. **"8 files, ~1,900 lines, 1 dependency."** — the dependency count is wrong and now inconsistent with both sibling posts as fixed. `app/build.gradle.kts:47–51`: `com.google.ar:core:1.54.0` **plus** `com.google.android.gms:play-services-location:21.3.0` (required by ARCore Geospatial mode — the in-code comment names the exception thrown without it). Honest form matching post #1: "one AR dependency plus the Play Services location library Geospatial mode requires." The 8 files / ~1,900 lines part is exact (8 `.kt` files, 1,895 lines).
2. **"Search the repo for `ponytail:` and you get the honest list: the tower-width clamp heuristic, the accuracy-gate constants marked as tuning knobs."** — the grep returns **four** comments, not two. Missing: (a) `GlobeRenderer.kt:17–18` — sphere through local sea level instead of the true ellipsoid, with the ellipsoid ray-cast named as the upgrade path (the largest deferred corner in the app, and the one post #1 now discusses); (b) `Geo.kt:14` — `SEA_LEVEL_ALT_M = -22.6` flagged as a field-calibration knob ("nudge if the horizon still reads high or low in the field"). The two the post does name are real: `MainActivity.kt:730–732` (perspective-true slider width, ~0.06° angular floor so Tokyo at ~7,200 km stays a visible tick, 25%-of-distance cap) and `MainActivity.kt:869` ("knob — tighten if towers look mis-aimed in the first seconds", on `GATE_POS_M`/`GATE_YAW_DEG`).
3. **Author-vouched, not repo-verifiable** (should stay framed as the author's own experiment, which the post mostly already does): the entire PR-replay section — the react-dropzone drag-state hook, the first-render-null Map bug, the drag-enter rejection bug, the "three of four lenses" count — belongs to a different (unnamed) project and left no artifacts in the earth repo. Same for the "what should be more modular here" answer (ISS as the one seam, matrix-math extraction declined): a conversation, not a repo record. Nothing in the repo contradicts any of it; nothing confirms it either.
4. Consistency with siblings as fixed — otherwise clean: "a single 900-line activity" ✓ (`MainActivity.kt` = 907 lines); no gate numbers cited; no ellipsoid claim made; the ledger fix in (2) actually *adds* the cross-reference to post #1's sphere correction.

## 4. Terminology and caveats

- **`ponytail:` comment** = deliberate simplification with a named ceiling and upgrade path — the repo's four instances follow the format.
- **The ladder / standing rules / exceptions** as presented (7 rungs; no one-implementation interfaces, no config for constants, no "for later" scaffolding, deletion over addition; carve-outs for trust boundaries, data-loss-preventing error handling, hardware calibration knobs) are a faithful paraphrase of the ponytail skill text — verified against the plugin skill in the blog workspace, **not** against the earth repo, which doesn't carry it.
- Caveat worth keeping exactly as written: the coordinate floor holds *because* it's in `CLAUDE.md` hard rules, i.e. stated somewhere the mode can't argue with.
- "1,900 lines _is_ the documentation" — rhetorical, fine; the repo also has real docs (README, CLAUDE.md).

## 5. Claims → evidence

| Claim | Evidence |
|---|---|
| 8 files / ~1,900 lines | 8 `.kt` files, 1,895 lines (`app/src/main/java/com/bunnypuddlegames/worldlock/`) |
| Dependencies | `app/build.gradle.kts:47–51` — **two** (see §3.1) |
| Plain `Thread` + `java.net.URL` ISS fetcher | `MainActivity.kt:100, 104, 119` |
| Platform `Geocoder` | `MainActivity.kt:259–274` |
| `SharedPreferences` persistence | `CLAUDE.md` Conventions; activity prefs in code |
| UI in code, no XML layouts | no `app/src/main/res/layout/` dir; `MainActivity.kt:160–188` (splash), `:281+` (settings sheet), `setContentView(rootLayout)` |
| 7 styles, one shader, table row per style | `TowerRenderer.kt:343–357` (`STYLES`), `Style` class `:18–35` incl. `profile` lambda and `mode` |
| `ponytail:` ledger | the four comments in §7 |
| "until it hurts" | `CLAUDE.md:28` |
| Coordinate hard rules as stated floor | `CLAUDE.md` "Hard rules — coordinate systems" |
| 900-line activity | `MainActivity.kt` = 907 lines |
| PR replay, modularity conversation | **author-vouched; no repo artifacts** |

## 6. Audit of existing visuals

1. **Ladder mermaid** — semantically correct and faithful to the ponytail skill definition (order, early-exit semantics, `ponytail:` comment on a cut corner). Verified against the plugin skill text, not the earth repo. Keep.
2. **PR-replay methodology mermaid** — internally consistent with the prose (checkout at commit c−1, cold lenses, same model, compare with the recorded AI and human findings). Not verifiable from the earth repo; nothing contradicts it. Acceptable as the author's account.
3. **LensReach SVG** — labels match the prose narrative exactly (generic review "looks sensible" inside the diff; ponytail rung-5 arrow to installed react-dropzone, "delete the hook"; Superpowers following the import to the unchanged hook, "Map is null on first render"). Same author-vouched status. Semantically coherent.
4. **Hero** — seven-rung ladder, top six rungs exiting to stops, only the last producing code: matches the ladder's semantics. Not wrong.

## 7. Proposed additional visuals

One small addition genuinely earns a place: the **complete `ponytail:` ledger as a 4-row table** — it turns the post's "greppable ledger" claim into displayed evidence and fixes §3.2 in the same stroke. Authoritative data (all of it):

| Location | What was deferred | Ceiling / upgrade path (from the comment) |
|---|---|---|
| `GlobeRenderer.kt:17–18` | Globe ray-cast hits a sphere through local sea level, not the true WGS84 ellipsoid; float32 discriminant may shimmer at the exact horizon | "Upgrade to an ellipsoid ray cast if either ever matters" |
| `Geo.kt:14` | `SEA_LEVEL_ALT_M = -22.6` (EGM96 geoid offset at Seattle) as a hand-set constant | "calibration knob — nudge if the horizon still reads high or low in the field" |
| `MainActivity.kt:730–732` | Tower width: perspective-true slider width with a ~0.06° angular floor (Tokyo at ~7,200 km stays a visible tick) and a 25%-of-distance cap (a tower you stand in thins to a pole) | heuristic, tune in the field |
| `MainActivity.kt:869` | First-fix accuracy gate constants (`GATE_POS_M = 15.0`, `GATE_YAW_DEG = 15.0`) | "knob — tighten if towers look mis-aimed in the first seconds" |

If a table feels heavy, the minimal fix is the prose list in §3.2 naming all four. No other new visuals are warranted — the two mermaids and the SVG already cover the post's structure, and the PR-replay material has no repo data to draw from.
