# Domain brief: worldlock-ar-window (retroactive)

Authority repo: `E:\github2\earth` (public at github.com/jonborchardt/worldlock — verified against `git remote`). Post: `e:\github2\blog\src\content\posts\worldlock-ar-window\index.mdx`, series worldlock #1 of 3 (posts 2 and 3 exist: android-development-with-claude, ponytail-lazy-senior-dev — so "the next two posts" is accurate).

## 1. The strongest story

"Everything interesting in this app is a coordinate-precision problem wearing a trench coat" — and the repo backs it hard. Authoritative positions are ECEF doubles, converted to camera-relative ENU, floats only at the last GL step (`CLAUDE.md` "Hard rules", `Geo.kt:8`). Surprising, emphasizable points with evidence:

- **The stats claim is exact, not rounded-friendly**: 8 Kotlin files, **1,895** lines total (`wc -l` over `app/src/main/java/com/bunnypuddlegames/worldlock/*.kt`).
- **The math checks itself at startup**: `Geo.kt` has an `init`-block self-check against exact WGS84 reference points (e.g. pole Z = 6,356,752.314245 m) that *crashes the app at launch* if the geodetic math breaks (`Geo.kt:78–84`). Not in the post; strengthens the "one hard rule" story.
- **Pragmatism over purity**: the globe is deliberately a *sphere through local sea level*, not the true ellipsoid, with the upgrade path documented in a `ponytail:` comment (`GlobeRenderer.kt:17–18`). The post currently claims the purer thing (see §3.1).

## 2. Important technical ideas

- **Render origin near the camera; ECEF doubles → ENU doubles → GL floats** (`CLAUDE.md` hard rules; `Geo.kt`). Float32 ULP at Earth-radius magnitude is 0.5 m — the post's table is numerically correct (verified: ULP(6.371e6) = 2^-1 m).
- **Analytic globe**: fullscreen pass, per-fragment ray–sphere quadratic, constant term precomputed in doubles on the CPU "to dodge float32 cancellation"; Blue Marble day + night textures (`assets/earth.jpg`, `earth_night.jpg`); terminator from `Geo.sunDirEcef()` — real sun position from the system clock, ~0.5° accuracy (`Geo.kt:60–75`; `GlobeRenderer.kt:12–18, 30–33`).
- **Two-stage georegistration**: render gate `GATE_POS_M = 15.0` (horizontal *and* vertical) + `RENDER_YAW_DEG = 25.0`, with 2× hysteresis (`MainActivity.kt:527–531, 870–875`); reference anchor planted the first time yaw also beats `GATE_YAW_DEG = 15.0` (`MainActivity.kt:539–545`, log: "Reference anchor planted — georegistration now survives pause/resume"). The post cites the code's real numbers (15/15/25, 2×) — correctly ignoring the stale <10 m/<10° in the repo's own README/CLAUDE.md.
- **Towers**: exactly 7 styles in `TowerRenderer.STYLES` — Tron shell, Triple helix, Double helix, Quad pulse helix, Shrine beam, Ember column, Data pillar (`TowerRenderer.kt:343–357`), one shader driven by a mode/style table; terrain anchors for bases (README, `MainActivity.kt:687–705`).
- **ISS**: fetched from `api.wheretheiss.at/v1/satellites/25544` on a background thread every 3 s (`Thread.sleep(3000)`, `MainActivity.kt:104,119`), linear ECEF extrapolation between fixes (`:636`), drawn as a radial dash plus a stylized truss-and-wings model that grows with distance to hold a ~3.5° minimum angular span, proportions preserved (`:656–670`).

## 3. Factual corrections and missing context

1. **"it's a per-fragment ray-cast against the WGS84 ellipsoid"** (prose, line 53; repeated in the figure caption "analytic ellipsoid", the VizFigure summary, and the SVG labels) — **wrong surface**. The ray-cast is against a **sphere through local sea level**, not the WGS84 ellipsoid. Evidence: `GlobeRenderer.kt:17–18` — "ponytail: sphere through local sea level, not the true ellipsoid… Upgrade to an ellipsoid ray cast if either ever matters." The sphere passes through `Geo.geodeticToEcef(lat, lon, SEA_LEVEL_ALT_M)` with `SEA_LEVEL_ALT_M = -22.6` (EGM96 geoid offset at Seattle, `Geo.kt:13–15`), so the drawn horizon meets local sea level. The mesh-vs-analytic argument survives fully; the surface name doesn't. (The WGS84 *ellipsoid* is genuinely used in `Geo.kt` for geodetic↔ECEF — the error is only about what the globe shader intersects.)
2. **"exactly one dependency (`com.google.ar:core`)"** — **there are two**: `com.google.ar:core:1.54.0` *and* `com.google.android.gms:play-services-location:21.3.0`, the latter required by Geospatial mode ("GooglePlayServicesLocationLibraryNotLinkedException without it") — `app/build.gradle.kts:47–51`, present since commit f663bc4 (2026-07-26, pre-publication). The repo's own README/CLAUDE.md ("only dependency") are stale the same way. Honest form: "one AR dependency, plus the Play Services location library ARCore's Geospatial mode requires."
3. **"a ray that solves the quadratic in the fragment shader is exact at every distance"** (and SVG "exact at any distance") — overstated. Same ponytail comment: "float32 discriminant may shimmer at the exact horizon"; exactness is rescued near the camera by precomputing the quadratic's constant term in doubles on the CPU (`GlobeRenderer.kt:15–18`). Suggested: "analytic at every distance" or add the horizon caveat.
4. **"drawn as one fullscreen quad"** (prose + caption + SVG "fullscreen quad") — it's one fullscreen **triangle** (`GlobeRenderer.kt:25`, `// fullscreen triangle`). Low severity, but the repo is explicit.
5. **"the app plants a SLAM anchor"** — loose terminology: it plants an ARCore **geospatial anchor** at the current pose (`earth.createAnchor(refLat, refLon, alt, …)`, `MainActivity.kt:544`), which ARCore then maintains via its on-device tracking. "Reference anchor" (the code's own name) is safer; the behavioral claims (survives pause/resume, indoor use after first fix) match `MainActivity.kt:545` and the `:874` comment.
6. Missing context worth adding: the **startup self-check** (§1, `Geo.kt:78–84`) — one sentence would land well in "The one hard rule."

## 4. Terminology and caveats

- **ECEF / ENU / geodetic**: `Geo.kt` owns the conversions; doubles until the last GL step.
- **Render gate vs reference anchor**: gate = 15 m pos (h and v) + 25° yaw, 2× hysteresis; anchor = 15 m + 15° yaw, planted once (`refAnchor` re-plants if ARCore reports it STOPPED, `MainActivity.kt:507`).
- **Sea level**: `SEA_LEVEL_ALT_M = -22.6` m is Seattle's EGM96 geoid offset — "sea level" here is local MSL, hardcoded for Seattle.
- **Sun direction**: from system clock, ~0.5° accuracy (`Geo.kt:60`).
- Caveat: tower bases use terrain anchors *or a fixed altitude where given* (README "Features").

## 5. Claims → evidence

| Claim | Evidence |
|---|---|
| 8 files / ~1,900 lines | 8 `.kt` files, 1,895 lines total |
| 7 tower styles, one shader + style table | `TowerRenderer.kt:343–357` (`STYLES`), single fragment shader with `u_Mode` |
| Default cities incl. Seattle/Tacoma/Spokane/Missoula/NYC/Tokyo | README "Features" (also Langley — covered by the post's "…") |
| Add-city geocoding | `MainActivity.kt:273` (platform `Geocoder`) |
| ISS every 3 s, extrapolated, wheretheiss.at | `MainActivity.kt:104, 119, 636` |
| ISS model scales with distance | `MainActivity.kt:656–660` (~3.5° min angular span) |
| Gate numbers 15/15/25, 2× hysteresis | `MainActivity.kt:527–531, 870–875` |
| Anchor at pos<15, yaw<15; survives pause/resume | `MainActivity.kt:539–545` |
| Float32 table values | ULP math, all 8 rows verified exact |
| Blue Marble day/night + real-sun terminator | `GlobeRenderer.kt:14, 31–33`; `Geo.sunDirEcef()` |
| Source link | `git remote`: github.com/jonborchardt/worldlock |
| "NYC 3,815 km", "Tacoma 42.4 km" | repo screenshots `docs/screenshots/globe-night.jpg` caption in README; post screenshots are the same session |

## 6. Audit of existing visuals

1. **Three-screenshot gallery** — matches the repo's own `docs/screenshots` set and README captions. Correct.
2. **GlobeRaycast SVG + its caption/summary** — the conceptual contrast (tessellated sphere with far-origin float jitter vs analytic per-pixel ray) is correct and is the repo's actual rationale (`CLAUDE.md` hard rules). Three label-level errors: "Ellipsoid as a ray-cast" / "ray–ellipsoid quadratic" should be sphere (§3.1); "exact at any distance" needs the horizon-shimmer caveat (§3.3); "fullscreen quad" is a fullscreen triangle (§3.4). Also left panel "vertices land on a metre-wide float grid" — the true step at 6.4e6 m is 0.5 m; "half-metre grid" would match the post's own table.
3. **Coordinate-pipeline mermaid** — correct; matches `Geo.kt` + `CLAUDE.md` exactly (one cast, at the GL boundary).
4. **FloatUlp SVG + data table** — numerically correct at every point (endpoints 0.1 µm @ 1 m, 0.5 m @ 6,371 km).
5. **Georegistration state mermaid** — gate/anchor numbers and hysteresis correct. Two semantic nits: (a) "plant SLAM anchor" → it's an ARCore geospatial anchor (§3.5); (b) "Anchored → Hidden: anchor STOPPED" — on STOPPED the code nulls the anchor and falls back to the *accuracy gate*, so the next state is Hidden **or** CameraOrigin (and the anchor re-plants when the tight gate is met again) — `MainActivity.kt:507, 539`. If redrawn, STOPPED should return to the gate, not force Hidden.
6. **Hero** — premise (Tacoma tower labeled 42.4 km, night Earth, ISS across the sky) is consistent with repo screenshots and features. Not wrong.

## 7. Proposed additional visuals

None earn a place. The post already carries the two visuals that matter (ULP curve, mesh-vs-raycast), both data-verified; the fixes needed are relabels of existing assets (§6.2, §6.5), not new figures. If the sphere-vs-ellipsoid correction is made in prose, the honest one-liner is: sphere through local sea level (−22.6 m EGM96 at Seattle), ellipsoid ray-cast documented in-code as the upgrade path if horizon fit ever matters.
