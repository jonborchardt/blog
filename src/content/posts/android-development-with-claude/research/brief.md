# Domain brief: android-development-with-claude (retroactive)

Authority repo: `E:\github2\earth` (WorldLock — native Android AR app, Kotlin + ARCore + GLES3). Post: `e:\github2\blog\src\content\posts\android-development-with-claude\index.mdx`.

## 1. The strongest story

Android development, minus the IDE, collapses into a text pipeline an agent can drive end to end: `gradlew assembleDebug` → `gradlew installDebug` → `adb logcat -s Earth`, with screenshots closing the visual loop. The repo genuinely embodies this — `E:\github2\earth\CLAUDE.md` opens with "**no IDE** — the whole point is CLI-only" and lists exactly the three commands the post quotes. The surprising parts worth emphasizing:

- **The toolchain is scavenged, not installed.** The JDK 17 and Android SDK are Unity 6000.3.5f2's bundled copies (`gradle.properties` → `org.gradle.java.home=C:/Program Files/Unity/Hub/Editor/6000.3.5f2/...OpenJDK`; `adb.cmd` → the Unity SDK's `platform-tools\adb.exe`; `local.properties` holds `sdk.dir`, gitignored).
- **The guardrail is a naming trick.** `adb.cmd` is a one-line passthrough (`@"...adb.exe" %*`); its whole value is that Claude Code permission rules key off the wrapper name, and plain `adb` isn't on PATH. The actual policy lives in `.claude/settings.json` — and it is *three*-tier (allow / prompt / deny), which is stronger and more interesting than the post's two-tier telling (see §3/§6).
- **Wireless adb is the enabler**, because an AR geospatial app must be tested outdoors; a cabled phone can't do its job. (This part is generic Android 11+ fact plus author workflow — the repo itself only documents USB; see §3.)

## 2. Important technical ideas

- **Build errors and logcat as agent-legible text.** Everything interesting is under one tag: `TAG = "Earth"` (`MainActivity.kt:865`). Logged: geospatial pose + accuracy ~once/second (`logGeospatialPose`, frame counter `% 60`), anchor state ("Reference anchor planted — georegistration now survives pause/resume", `MainActivity.kt:545`), and a periodic cross-check.
- **The on-device cross-check** (`crossCheck()`, `MainActivity.kt:783–801`): every 300 frames (~5 s) it runs the app's own double-precision WGS84→ECEF→ENU chain for the Seattle base point, transforms through the render matrix, creates a throwaway ARCore geospatial anchor at the same lat/lon, and logs the disagreement as `Cross-check Seattle base: math=(…) anchor=(…) delta=%.1fm`. This is what makes "debug georegistration from a log line" real: it separates our-math bugs from ARCore accuracy problems.
- **Permission boundary as three tiers** in `.claude/settings.json`: pre-allowed (gradlew; `adb.cmd devices / logcat / install -r app… / uninstall com.bunnypuddlegames.worldlock / shell am start|force-stop` for the package), everything unlisted prompts a human, and a hard **deny** list that never runs at all: `reboot`, `root`, `sideload`, `push`, `shell rm`, `shell pm uninstall/disable`, `shell settings put`, `shell wm` — plus *reading `local.properties`*, which protects the `ARCORE_API_KEY`.
- **Wireless debugging pairing vs connecting**: pair once with a 6-digit code on a pairing port; thereafter `adb connect` on a separate port that changes on reboot/wifi drop. Correct as generic Android behavior; not documented in the repo.

## 3. Factual corrections and missing context

1. **"the project's permission rules pre-approve only app-scoped operations — install, launch, stop, and logcat for this one package"** — overstated in two directions. (a) The logcat allow rule is `"Bash(./adb.cmd logcat:*)"` — *any* logcat, not scoped to the package; the `-s Earth` tag filter is convention, not enforcement (logcat can't be package-scoped by rule). (b) The pre-approved set is larger than listed: `devices` and `uninstall com.bunnypuddlegames.worldlock` are also allowed. Evidence: `E:\github2\earth\.claude\settings.json`. Suggested fix: "install, launch, stop, uninstall of this one package, plus device listing and logcat."
2. **The second diagram's two-tier model omits the deny list** (see §6) — the strongest part of the guardrail. Some operations don't "wait for a human"; they are refused outright (`reboot`, `root`, `sideload`, `push`, `shell rm`, `pm uninstall/disable`, `settings put`, `wm`), and Claude is denied *reading* `local.properties` where the API key lives. Missing context that materially improves the story.
3. **"No toolchain install, even … Zero downloads"** — slightly overstated: the Gradle wrapper (`gradle/wrapper` in the repo) downloads the Gradle distribution itself on first run. Accurate form: no JDK or Android SDK download — both borrowed from Unity. Evidence: `gradle.properties`, `adb.cmd`, `CLAUDE.md:13`.
4. **Missing context on the wireless loop**: `adb pair` and `adb connect` are *not* in the pre-approved list, so re-establishing the connection after a reboot/wifi drop is a human step (or a permission prompt). The human's job is therefore three things, not two: point the phone, judge the result, and occasionally re-run `adb connect`. The post's own "you re-run `adb connect`" phrasing quietly implies this; worth making explicit given the "only two arrows a human touches" framing.
5. **Repo-doc gap, not a post error**: the authority repo's README describes only USB ("install on the USB-connected phone", "Phone needs USB debugging enabled" — `README.md:35,38`); the wireless workflow exists only in the post. Repo evidence neither confirms nor contradicts it; the claims are standard Android 11+ behavior.
6. **Screenshot path**: "Phone screenshots land in a temp folder" — `temp/` exists and is gitignored (`.gitignore`), but no pre-approved rule covers pulling screenshots off the phone (`pull` is unlisted → prompts; `push` is denied). Consistent with the post's own second diagram, but the capture mechanism isn't repo-evidenced.
7. **Repo-internal staleness (relevant only if the post ever cites numbers)**: `CLAUDE.md`/`README.md` say the accuracy gate is <10 m / <10°, but the code uses `GATE_POS_M = 15.0`, `GATE_YAW_DEG = 15.0`, `RENDER_YAW_DEG = 25.0` with 2× hysteresis (`MainActivity.kt:527–530, 870–875`). The post wisely doesn't quote numbers; don't add the 10s.

## 4. Terminology and caveats

- **WorldLock** = app label; package `com.bunnypuddlegames.worldlock`. Logcat tag is **"Earth"** (historical — original package was `…/earth`, renamed in commit f663bc4).
- **Pairing port vs connect port**: distinct; pairing is one-time per PC (caveat: revoking debugging authorizations or resetting wireless debugging forces re-pairing — "once, ever" is the happy path).
- **Georegistration / geospatial accuracy**: ARCore Geospatial API pose with horizontal/vertical/yaw accuracy; rendering is gated on it with hysteresis.
- **Cross-check delta**: metres of disagreement between the app's double-precision coordinate chain and an ARCore anchor at the same point; `delta=0.4m` in the post matches the real log format `delta=%.1fm`.
- "**heading accuracy insufficient**" is a verbatim log string (`MainActivity.kt:826`).

## 5. Claims → evidence

| Claim | Evidence |
|---|---|
| The three commands are the whole loop | `CLAUDE.md:7–11` — identical commands, including `.\adb.cmd logcat -s Earth` |
| Everything logged under one tag | `MainActivity.kt:865` `TAG = "Earth"`; all `Log.*` calls use it |
| Periodic cross-check vs ARCore anchors | `crossCheck()` `MainActivity.kt:783–801`, every 300 frames ≈ 5 s |
| `heading accuracy insufficient` / accuracy logging | `MainActivity.kt:812–831` |
| Toolchain borrowed from Unity, two paths | `gradle.properties` (java home), `local.properties` (sdk.dir, gitignored per `.gitignore` + `CLAUDE.md:13`), `adb.cmd` |
| Wrapper-only phone access | `adb.cmd` (one-line passthrough); `CLAUDE.md:15` "plain `adb` is not on PATH, and permission rules key off the wrapper" |
| Pre-approved / prompted / denied operations | `.claude/settings.json` allow + deny lists |
| Ember particles judged by eye | `TowerRenderer.kt` "Ember column" style (mode 11, `particles` = rising ember streaks, lines 14, 31, 218, 354, 397) |
| README gallery screenshots placed | `docs/screenshots/{globe-night,shrine-beam,ember-column,data-pillar}.jpg`, referenced with captions in `README.md:7–14` (added in commit f663bc4). That *Claude* cropped/placed them is author testimony, not repo-verifiable |
| Series context | Post 1 exists at `e:\github2\blog\src\content\posts\worldlock-ar-window` |

## 6. Audit of existing visuals

1. **Mermaid: "The WorldLock development loop"** — semantically correct. Edit-compile-fix cycle, APK over wifi, logcat + screenshots back, human points and judges. Matches repo commands and log surface. Keep.
2. **Mermaid: "The adb wrapper as a permission boundary"** — *misleading as drawn*. Two problems: (a) the "runs unattended" label "install / launch / stop / logcat for this one package" misstates the rules — logcat is unscoped, and `devices` + package-scoped `uninstall` are also pre-allowed; (b) the two-outcome model (unattended vs waits-for-human) hides the third tier: a hard deny list (`reboot`, `root`, `sideload`, `push`, `shell rm`, `pm uninstall/disable`, `settings put`, `wm`, and reading `local.properties`) that never runs even with a human present. Correct semantics: Claude → `adb.cmd` wrapper → **allow** (gradlew; devices; logcat; install/uninstall/start/stop of this package) runs unattended; **unlisted** (e.g. `shell`, `pull`, other packages, `pair`/`connect`) waits for approval; **deny** (destructive device ops + API-key file read) refused outright. Evidence: `.claude/settings.json`.
3. **Mermaid: wireless adb state diagram** — semantically correct generic Android behavior (Unpaired → Paired once → Connected; reboot/wifi drop returns to Paired with a new port; pairing not repeated). Acceptable caveat unstated: revoking debugging authorizations does force re-pairing. Not worth changing.
4. **Hero image** — premise (terminal builds over wifi to a phone showing an AR tower, logcat flowing back) is factually consistent with the repo. Not wrong; do not flag.

## 7. Proposed additional visuals

No new visual earns a place; the fix is to **repair mermaid #2** into the three-tier model above (all data in §6.2). If a small evidence table is wanted instead of/alongside it, the authoritative rows are, verbatim from `.claude/settings.json`:

- Allowed unattended: `./gradlew *`; `./adb.cmd devices`, `logcat`, `install -r app…`, `uninstall com.bunnypuddlegames.worldlock`, `shell am start -n com.bunnypuddlegames.worldlock…`, `shell am force-stop com.bunnypuddlegames.worldlock` (plus PowerShell mirrors).
- Denied outright: `reboot`, `root`, `sideload`, `push`, `shell rm`, `shell pm uninstall`, `shell pm disable`, `shell settings put`, `shell wm`; reading `local.properties` (holds `ARCORE_API_KEY`).
- Everything else: permission prompt.
