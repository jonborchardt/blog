# Domain brief: "A language on top of Strudel" (strudel-bench, series opener rewrite)

Repo: `E:\github2\strudle` (strudel-bench, published as `github.com/jonborchardt/strudel-bench`, live at `https://jonborchardt.github.io/strudel-bench/`). Everything below was verified on 2026-09-19 against HEAD `828c550` (2026-09-19 00:16) by reading source or running Node-only commands (`node v24.19.0`, `@strudel/core ^1.2.6`, `@strudel/web ^1.3.0`). Code wins over docs; where a doc in the repo is itself stale it is flagged. Section 7 has the reproduction command for every number.

The previous brief (2026-09-13) is superseded. What survives from it unchanged: the Strudel primer (pattern = pure function of a time span, mini-notation operator table, one cycle is one bar as a convention made structural by `parseMeter`, `arrange` is Strudel's own), the four "where it stops helping" complaints, the `ctl` no-op primitive, the seven phases, the dump mechanism including the operator probe, the bass weight/brightness numbers, and the euclid/demo/ping example songs. What is now wrong is listed claim by claim in section 1.

---

## 1. Claim-by-claim audit of the current post

Line numbers refer to `src/content/posts/a-language-on-top-of-strudel/index.mdx` as of 2026-09-13 21:55.

| # | Post line(s) | Claim | Status | Corrected fact and proof |
|---|---|---|---|---|
| 1 | 2-6, 59-61 | `seriesOrder: 2`; "[The previous post] was about how the surrounding system got built" | stale by design | The post becomes the series opener; the "how it was built" narrative is being removed. Drop the back-link to `/never-read-the-code/`. |
| 2 | 31, 53-55 | "a complete piece of music, in eight lines", "325 bytes, comment included", "written by a generator script ... and never touched again" | mostly true, one caveat | `songs/euclid.strudel` is now 9 lines / 334 bytes because commit `7d93908` (2026-09-13) prepended a `// @blog` flag line; the other 8 lines / 325 bytes are byte-identical to the file at creation (`9f843fe`, 2026-09-10; `git show 9f843fe:songs/euclid.strudel | wc -c` = 325). Say "eight lines of Strudel" and, if the byte count stays, "325 bytes" for those eight lines. Also the file's comment has two spaces before `(128 bpm` and the post's code block has one; harmless. `// @blog` means "the blog links to this song, never delete or rename it" (`CLAUDE.md` line 8). |
| 3 | 55 | "in the fourth minute of this project" | remove | Build-narrative detail; no longer the story. `gen/euclid.mjs --seed=3` is still the generator and still exists. |
| 4 | 122-140 | The four faces (no baseline, later calls replace, nothing named, one idea is N edits); "eight separate filter cutoff values" for the bowed strings | true | `.lpf(x).lpf(y)` still replaces (that is why `mulBy` exists, `lib/layers.mjs:18`). `psaltery_bow` (`strings`) is still spread into 8 parts across the 8 sections of `arrival` (void pad2, signal pad2, approach pad, contact pad, will pad2, plea pad, threshold pad, after pad) plus one more `pad4` in threshold that overrides `sound` to `vibraphone_bowed`. |
| 5 | 148-155 | The `contact` section code sample (`drums: { ...pulse, density: .5, weight: .8 }` etc.) | stale | Current `songs/arrival.strudel` contact is 11 parts (drums, bass, melody, melody2, melody3, melody4, melody5, pad, pad2, pad3, fx). The four lines shown still exist with small changes: `melody: { ...theme, density: .55, brightness: .65, width: .6, level: 1.1 }` (width was .7), `pad: { ...strings, density: .8, brightness: .5, weight: .7, width: .75 }` (width was .9). The song header now reads `song({ bpm: 64, key: 'D:minor', seed: 41, kit: 'RolandTR808', packs: ['rooms'], room: { ir: 'hall', size: 3.2, damping: 4500 } }, [` and the `theme` spec carries `position`, `velocity` and `humanize` material. Re-copy from the file. |
| 6 | 158-164 | The five strudel.cc links embed a dump of `contact` | stale, still playable | The embedded code is the 2026-09-13 dump. The current dump of the same part differs: it appends `.orbit(1)`, a `position` `withValue` pan shift, `.velocity(...)`, two `humanize` closures, and `.ir("hall").roomsize(3.2).roomlp(4500)` (see the `contact_melody` chain in section 7). The old links still play on strudel.cc (they are self-contained), but no longer show "what this section compiles to" today. Regenerate from `npm run dump -- songs/arrival.strudel` or drop the per-part links. |
| 7 | 166-169 | "Each part is an instance of one of five kinds: drums, bass, melody, pad, fx" | **false** | Eight kinds: `drums, bass, melody, pad, fx, sample, perc, raw`. Proof: `Object.keys(strudelLib.cells)` at runtime prints exactly those eight; `lib/layers.mjs` `registerLayer(...)` calls at lines 248, 302, 384, 439, 472, 562, 596, 603; `README.md:88`, `CLAUDE.md:74`, `examples.html:19`, `SKILL.md:8` all say eight. (`about.html:23` in the repo still says "five layers": that page is stale, do not quote it.) |
| 8 | 168-169 | "runs a melody through `melody6` and a pad through `pad4`. The whole piece is 62 parts across 8 sections" | true | Threshold has melody..melody6 and pad..pad4. Parts per section now: void 2, signal 4, approach 9, contact 11, will 7, plea 10, threshold 13, after 6 = 62. Bars 1+8+8+8+8+8+12+6 = 59. |
| 9 | 174-177 | "`sound`, `notes` and `level` are material ... Level is a plain gain multiplier applied after every axis" | true, incomplete | Still true (`withLevel`, `lib/layers.mjs:34`). The material list is now much longer (section 3); the melody's refusal message lists `sound, notes, follow, phrase, seed, patch, level, position, duck, duckDepth, duckAttack, velocity, humanize, compressor`. |
| 10 | 179-199 | "Twelve axes"; figure: "sixty layer and axis combinations", "Forty-six of sixty cells are implemented and fourteen are deliberately empty", per-layer 11/11/10/10/4, "Counted 2026-09-13" | **false counts** | Twelve axes still (`AXES` in `lib/axes.mjs`, unchanged). Grid is now 8 x 12 = **96 cells, 64 implemented, 32 empty (67%)**. Per layer: drums 11, bass 11, melody 10, pad 10, perc 10, fx 4, sample 4, raw 4. Full grid in section 5. `cells-viz.svg` must be redrawn. |
| 11 | 184 | "The fx layer accounts for eight of the holes" | true, incomplete | fx still has 8 holes; sample and raw have 8 each too (both implement only brightness, weight, space, width); perc has 2 (variation, register). 8+8+8+2+ drums 1 (register) + bass 1 (width) + melody 2 (drive, weight) + pad 2 (groove, variation) = 32. |
| 12 | 204-208 | "four are direct ... six are proxies ... two can only be checked by reading the event stream" | true | `AXES` verify classes unchanged: direct = density, brightness, weight, width; proxy = space, articulation, aggression, groove, variation, organicness; code = drive, register. |
| 13 | 210-212 | "Continuous axes take a number, a Strudel signal, or a ramp across the section" | true, incomplete | Now also the named movements `wobble(a, b, bars)`, `drift(a, b)`, `pulse(a, b, per)`, `swell(a, b)` (`lib/axes.mjs` `MOTIONS = { ramp, wobble, drift, pulse, swell }`). Structural axes still throw on a non-number (`num()`). |
| 14 | 214-216 | "fourteen empty cells. Drums have no register ... Bass has no width ... A sustained pad has no groove" | count false, examples true | Thirty-two empty cells. The three named holes are still holes (grid, section 5). |
| 15 | 218-222 | "an unimplemented axis is accepted and does nothing, visibly. Set `register: .9` on drums and it is not an error ... the checker prints it back" | true | Verified: a song with `drums: { register: .9 }` checks clean (exit 0 when no other problem) and the table prints `drums 14/cyc register=0.9`. Examples page still has the card "Register on the drums: no cell" (`web/examples.mjs`). |
| 16 | 229-234 | The `noopBelow` code quote | true, verbatim | `lib/axes.mjs` `ctl()` still reads exactly: `if (typeof value === 'number') { if (value === 0.5 \|\| (noopBelow && value <= 0.5)) return pat; return pat[name](fn(value)); }`. Its twin `mulBy` (`lib/layers.mjs:18`) has the same contract but returns `pat.mul(S[name](fn(value)))`. |
| 17 | 244-247 | "enforced, over the whole grid at once, by a test that builds each layer twice ... For all forty-six cells. Its complement asserts that every cell does move something at 0 or at 1" | **coverage claim false** | The tests exist and pass (`node --test test/layers.test.mjs` etc.: 68 pass, 0 fail across layers/axes/dump/sample). But "over the whole grid" is not true: `test/layers.test.mjs:16` ("adapter at exactly 0.5 equals no adapter, for every cell") and `:25` ("every cell moves something at 0 or at 1") iterate `LAYERS = ['drums', 'bass', 'melody', 'pad']` (42 cells). fx has its own pair at `test/layers.test.mjs:227` ("fx cells: 0.5 is a no-op and the ends move something, over a riser", 4 cells). sample has its own at `test/sample.test.mjs:56` (4 cells). **perc (10 cells) and raw (4 cells) have no 0.5 no-op test of their own.** Mitigation you can state honestly: perc's brightness/weight/space/aggression cells are the *same objects* as drums' (`lib/layers.mjs:586`, verified `cells.perc[a] === cells.drums[a]` true), its articulation reuses the drums articulation function, and raw's four cells are the same objects as sample's (`:602`, verified). perc's own density/drive/groove/organicness/width cells use the shared helpers (`defineSwing`, `defineOrganic`, `defineSweep`) that drums/bass/melody exercise. So 60 of 64 cells are covered by a 0.5 test either directly or by object identity; perc.density and perc.drive are covered only by `test/layers.test.mjs` "perc: ... density thins or adds hits" (density .5 equals the written rhythm) and by no explicit 0.5 test for drive. Phrase it as "for the four core layers, plus fx and sample, each cell is built twice ..." not "the whole grid". |
| 18 | 251-267, 268-284 | The bass brightness/weight bug and the cutoff table: 400 / 1050.61 / 340 / 893.02 / 1050.61 | true, recomputed | `bass baseline cutoff 400; brightness .8 alone 1050.6111217615069; weight .8 alone 340; both (declared order) 893.0194534972808; reversed (weight then brightness) 1050.6111217615069`. Old-bug pair today: `{brightness .9, weight .9}` = 1159.65, `{brightness .5, weight .9}` = 320 (the commit says both were 317.77 before the fix; today's 320 = 400 x 0.8, since `piece(1, 1, 0.75)(.9)` = 0.8). Commit `4aa036c` (2026-09-10) message verbatim in section 7. `test/layers.test.mjs` "brightness and weight both act on the bass filter, neither overwrites the other" pins it. |
| 19 | 286-297 | "Seven phases, in this order: structural, timing, pitch, articulation, spectral, spatial, level"; "declaring a phase that does not exist is an error" | true | `PHASES` in `lib/axes.mjs` unchanged; `defineCell` throws `cell ${layer}.${axisName}: unknown phase "${k}"`. |
| 20 | 288-290 | "one line in the README: Adapters run in fixed phases, because transformations do not commute." | true | `README.md:115`, rule 7, verbatim. All eight rules unchanged (`README.md:109-116`). |
| 21 | 301-312 | The dump: instruments every core function and Pattern method for one evaluation, restores; "probing the closure with 7 and 3 and looking the answer up in a table. If it comes back 10 it was addition, 21 multiplication, 4 subtraction" | true | `lib/dump.mjs:25-26`: `OPS = { add: 10, sub: 4, mul: 21, div: 7 / 3, mod: 1, pow: 343, set: 3, keep: 7 }` and `opName = (fn) => fn(7)(3)` lookup. `install()` returns an undo closure, run in `finally`. `test/dump.test.mjs` "dump leaves strudel untouched afterwards" pins the restore. Numbers still print at 6 significant figures (`num = (n) => String(Number(n.toPrecision(6)))`, line 12). Last change to `lib/dump.mjs`: `2486d2b` 2026-09-13. |
| 22 | 314-315 | "Four lines of declarative source become thirty-three lines of plain Strudel" | **off by two** | The intro of `songs/demo.strudel` is still the same 4 source lines (unchanged since 2026-09-12; `7d93908` only added `// @blog`). The dump of that section is now **35 code lines** (comments and blanks stripped): the two `const` chains gained `.orbit(1)` and `.orbit(2)` (every part now plays on its own superdough orbit, `lib/song.mjs:153-166`). Command in section 7. |
| 23 | 317-329 | "the two files produce identical event streams, 36 events each, matching on every onset, duration, sound and note ... moves a filter cutoff by about one part in ten million" | true with a new caveat | `songs/demo-intro-raw.strudel` still yields 36 events, and the first 4 cycles of `demo.strudel` still yield 36. All 36 match on every field to 6 significant figures **if the `orbit` field is ignored** (raw has none; demo has orbit 1 for drums, 2 for pad). Worst numeric difference is `cutoff 701.0288172814385 vs 701.029`, relative 2.6e-7 ("one part in four million"; the post's "one part in ten million" was for arrival's 3.6e-7 and is loose either way; say "a few parts in ten million"). The orbit difference is audible in principle: the two parts now have separate reverbs in the declarative build and a shared one in the raw file. **`demo-intro-raw.strudel` should be regenerated from the current dump (adding the two `.orbit()` lines) before the A/B clips are re-rendered**, otherwise the "identical audio" claim is not strictly true anymore. |
| 24 | 331-333 | "you see `.lpf(2000)` followed by `.lpf(3031.43)`" | true | Still in the `contact_melody` chain (section 7). |
| 25 | 339-348 | "Alongside the sections there are about a dozen hand-written plain-Strudel textures ... stacked in with Strudel's own `arrange`"; "The tooling only sees the declarative half" | true, with a new nuance | `arrival.strudel` still has 11 named textures (`roll, boom, gong, gong2, swell, heart, drone, wind, deep, glass, shimmer`) in an `arrange` of 8 spans, then `stack(score, textures.size(.9))` with `out.strudel = score.strudel`. New: the check table now *counts* the outside material (`~7 voices at once (4 outside the parts)` on each section header), so "the tooling only sees the declarative half" is now "the mixer, solo/mute, pin and the dump see only the parts; the checker's load count sees everything". Also new: a `raw` part (`raw: { pattern: s("...")... }`) puts a plain Strudel pattern *inside* a section so mute/solo/check/dump do see it (`songs/cutwork.strudel` uses it; `SKILL.md` recommends it over the outer `stack()` for anything that belongs to one section). |
| 26 | 352-353 | "Edit a file, and the page notices and re-evaluates in place" | true (local only) | `fs.watch` on `songs/` over SSE, `server.mjs`; on GitHub Pages there is no server, so no file watching (edits happen in the page). |
| 27 | 355-368 | The check excerpt (ping's two sections) and "It runs in Node, with no audio, in a bit over a second" | **format stale; timing false for big songs** | Section header lines now carry a voices count: `[0-4) call (establish)  ~2 voices at once`. The arc line carries form letters: `arc: call 14 ▄ A · answer 29.3 █ B`. Timing measured today (`Measure-Command`, warm): ping 1.2 s, demo 2.1 s, **arrival 16.9 s** (the voices count queries every part over the whole section). Say "a second or two for a small song, a quarter of a minute for the 59-bar one". Fresh demo excerpt in section 7. |
| 28 | 370-372 | "A typo in an axis name is ... a build error that names both lists" | true | Verified today: `unknown key "arpp" on melody in section "a" (axes: ...; material: sound, notes, follow, phrase, seed, patch, level, position, duck, duckDepth, duckAttack, velocity, humanize, compressor)`, exit 1. Unknown sound: `unknown sound "kazoo"`, exit 1 (the table still prints first). |
| 29 | 376-399 | `arc: void 1.7 \| signal 5.6 \| approach 25.2 \| contact 49.4 \| will 13.7 \| plea 36.6 \| threshold 65.3 \| after 9.7` and the ArcViz table | **false** | arrival was rewritten twice since (threshold widths `4b97ac9` 2026-09-18; the "mixed twin" promoted over the original in `3517d4d` 2026-09-19, 59 insertions / 46 deletions vs 09-13). Current line: `arc: void 1.1 ▁ A · signal 4.1 ▁ B · approach 21.6 ▃ C · contact 57.6 ▇ D · will 14.4 ▂ E · plea 37 ▅ F · threshold 67.3 █ G · after 7.4 ▂ H`. Event count 2434 (was 2751), 29 distinct sound:index entries in the `sounds` block (was 28), 62 parts, 59 cycles, cps 0.26666666666666666. The `arc-viz.svg` energies and the `data` rows must be updated. |
| 30 | 382 | "Energy climbs to 49.4 at the first climax, drops to 13.7, then peaks at 65.3" | false | 57.6, 14.4, 67.3. |
| 31 | 404-411 | SoundBite "One bar of void, then four bars of threshold. Two parts against thirteen" | parts true; audio stale | 2 and 13 parts still. The clips were rendered 2026-09-13 11:57 from the pre-mix arrival; the song has since gained a hall impulse (`room: { ir: 'hall' ... }`, `packs: ['rooms']`), positions, velocity, humanize, a compressor on the bells, level changes. Re-render (section 6). |
| 32 | 419-433 | `follow: true` piano vs `follow: false` handchimes | true | `theme.follow: true`, `signal.follow: false` unchanged. New option worth a clause: `follow: 'tones'` maps written degrees onto each bar's chord tones (`b832f91`, README "Harmony"). The link to `/arrival/` ("the last post in this series") depends on the series plan. |
| 33 | 435-441 | `StrudelEmbed song="demo.strudel" section="drop"` "The pane on the right is the expanded Strudel, and it updates as you type" | true | `?play=1&section=<name>#<song>` embedding contract unchanged (`README.md` "Embedding this page"). The expanded pane re-expands 300 ms after each edit (`CLAUDE.md`). |
| 34 | 443-444 | "The next post is about the layer above this one: ... say darker instead of 0.2" | series plan | Keep only if the series order keeps a vocabulary post next. |
| 35 | 181 | Figure caption "Counted 2026-09-13" | update | Recount date 2026-09-19; 96 cells. |
| 36 | throughout | "five kinds", "sixty", "forty-six", "fourteen", "thirty-three", "2,751" etc. | see above | Every count in the post that derives from the layer count or from arrival is stale. |

Two smaller things the post does not say but a reviewer would catch: (a) the check's own output contains U+2014 em dashes (`  — dreamy, dark`) and a U+2192 arrow (`i VI → Cm Ab`) and the arc glyphs `▁▂▃▄▅▆▇█` plus `·`; the post already rewrites the arc line with `|` and strips the words, so keep doing that deliberately; (b) `about.html` in the repo still says "five layers" and "the author's blog", so do not cite it for counts.

---

## 2. Product overview (what a reader can actually use)

**What it is.** A static web page plus a set of Node scripts. No bundler, no framework, no build step beyond copying files (`scripts/pages.mjs`). Dependencies: the `@strudel/*` packages, `acorn` (for the resolver's literal edits), `@breezystack/lamejs` (MP3 in the browser and in Node), CodeMirror 6 packages (the source editors), `playwright-core` as a dev dependency for headless renders. Songs are `songs/*.strudel`; 23 files, of which 11 are listed on the song dropdown (the rest carry `// @hidden`: experiment pairs like `darker0/1/2`, `knobs0/1`, `punchier0/1`, `machine-v1`, `rooms`, `hunted` (needs a non-shipping voice pack), and `demo-intro-raw`). Listed: `arc, arrival, breakwater, chop, cutwork, demo, euclid, foundry, glassworks, machine, ping`.

**Pages** (`scripts/pages.mjs` `PAGES = ['index.html', 'examples.html', 'about.html', 'legal.html']`, plus `404.html`):

- **Compose** (`index.html`): pick a song, play/pause/stop with a scope showing peak dBFS, the editable source (CodeMirror) beside the expanded plain Strudel (regenerated by `lib/dump.mjs` in the browser 300 ms after each edit; changed lines flash), and the **Mix** card: song pane (tempo, key, seed, kit as inline controls), the arrangement strip (a block per section with per-part density shading, scrub, pin-to-loop, reorder, duplicate, rename, remove, an arrangement-verb pick `breakdown / lift / strip / halftime`, dropout/sweep bar pickers, riser/hit transition picks), a section pane, the harmony strip (key and one chord per bar, each a pick), the axes grid (a slider per axis the part adapts, with mute/solo/remove and an event strip per part; a shape pick on every continuous axis writes `constant / ramp up / ramp down / wobble / drift / pulse / swell`), materials (drum template or step-grid editor, per-voice sounds, notes with a piano-roll, arp, follow, level, patch, and for sample parts a waveform with region/slice editing), and the phrase row (vocabulary words as pills; Apply rewrites the numbers, Verify renders before/after and shows metric deltas). Every Mix control is a source edit: unsaved until Save, undoable, re-evaluated in place while playing. A **measure** button renders the shown section and each part alone and writes a dB readout per level slider; A/B plays the song as it was before the last change. Keys: space play/pause, ctrl+s save, ctrl+enter update.
- **Examples** (`examples.html`): 16 groups, 134 playable cards, 0 stubs today (`web/examples.mjs` `GROUPS`; counted by importing the module). Groups: Song and section (5), Axes (12), Axes across layers (9), Trajectories (7), Descriptors (17), Overlays (8), Modifiers (3), Harmony (6), Progression syntax (8), Material (11), Drums and written rhythm (12), Samples (10), Mix routing (8), Section-level edits (6), Transitions (5), Full songs (7). Each card has A/B variants that load and play, an editable HLL pane that re-expands, and a test that every variant evaluates and that variants differ (`test/examples.test.mjs`).
- **Samples** (`samples.html`): local-only workshop for sample packs and named sample definitions (waveform, tempo guess, drag breaks, snap to grid). Not in `PAGES`, carries `noindex`, and its nav link is `hidden` until the Compose page's SSE connection opens, i.e. only when a local server is behind the page.
- **About** and **Legal**: static prose.

**GitHub Pages vs local** (`README.md` "Setup", `CLAUDE.md`): the same page deploys on every push to main via `.github/workflows/pages.yml` (`npm run pages` builds `dist/`). On Pages there is no server: **Save and New song write to the browser's localStorage** under a `strudel:` prefix and the song list merges those drafts; sample packs **stream from the Strudel CDN** (the same seven packs `scripts/samples.mjs` downloads locally: uzu-drumkit, tidal-drum-machines, piano, Dirt-Samples, mridangam, vcsl, uzu-wavetables, per `lib/packs.json`); the request/notes cards are hidden; file watching and `renders/` do not exist. Locally, `npm start` serves everything from the folder on `:3000`, `fs.watch` on `songs/` reloads the page (and re-evaluates in place if playing), and exports also land in `renders/`.

**Export and share.** **Export MP3** stops playback, renders the source offline in the browser (`renderOffline`, one cycle at a time on an `OfflineAudioContext`), encodes with lamejs in the browser, downloads `<song>.mp3`; a pinned section exports alone as `<song>.<section>.mp3`. **Export Strudel** downloads the expanded pane as `<song>.strudel.txt`; **Open** opens it on strudel.cc. Every dump starts with a prebake header (`await samples(...)` for the seven packs plus `aliasBank`, and the deployed `samples/user/` map when the song declares a local pack) because strudel.cc prebakes a different set. **Link** copies `<page>#s=<base64url(deflate-raw("name\nsource"))>` (`shareEncode` in `web/compose.mjs`, native `CompressionStream`); anyone opening it gets the song in the editor, unsaved. Embedding: `?play=1&section=<name>#<song>.strudel` lands an iframe on a pinned section (the blog's `StrudelEmbed` uses this). All of this works identically on localhost and Pages.

**The npm scripts a user actually runs** (`package.json`):

    npm install
    npm run samples                    # one-time ~300 MB pack download (resumable); `-- <pack>` for one
    npm start                          # http://localhost:3000
    npm run check -- songs/x.strudel   # headless: events, sounds block, per-section table, arc line; exit 1 on errors
    npm run lint -- songs/x.strudel    # musical rules over that table (and --measure for mix lint)
    npm run dump -- songs/x.strudel    # the plain Strudel the file reduces to
    npm run resolve -- songs/x.strudel <section|*> <layer|*> "phrase" [--write]   # words -> axis edits
    npm run form -- --mood=ominous --bars=64 --seed=5 > songs/new.strudel         # a song skeleton
    npm run headless -- songs/x.strudel   # page in headless Chromium so render/verify/measure/snippets work
    npm run render / mp3 / verify / measure / snippets / note / vocab / pages / test

**Sample packs and deploy policy** (brief): built-in packs are the Strudel CDN's, local under `samples/packs/` (maps committed, audio gitignored), streamed on Pages. Local packs are folders under `samples/user/<pack>/` (`<sound>/*.wav` = a sound with variants, a loose file = one sound). A song declares them with `packs: ['<pack>']`; `npm run check` refuses an undeclared pack sound, a declared pack that is missing, and any sound in no pack. Deploying a local pack is opt-in per pack via `pack.json` `{ deploy: true | [sounds] | false, license, source }`; `npm run pages` ships only what deploys, refuses a pack with no `license`, leaves songs that need a non-shipping pack off the deployed list, and re-checks every deployed song against exactly the shipped sounds. `pack.json` may also define named samples (`samples: { loop: { bars: 2, slices: 8 }, 'loop-kick': { sound: 'loop', end: .0625, bars: .125 } }`). Today's user packs: `demo-pack` (CC0, deployed, the worked example with `ping.strudel` and `chop.strudel`), `rooms` (generated impulse responses: `room`, `plate`, `hall`, used by `arrival`), `voice` (local-only by licence; `hunted` needs it and is hidden).

---

## 3. The language today: layers, materials, grammar

### Layers (eight)

| Layer | Builds | Materials (from `registerLayer(..., { materials })` and the section keys) |
|---|---|---|
| drums | a kit on a step grid, five density-gated voices `bd sd hh oh cp` (thresholds .1 .3 .5 .7 .85), or any written voice | `template` (`house` default, `breaks`, `minimal`, `halftime`, `heartbeat`, or `{ voice: grid }`), `sounds` (`{ sd: 'rim' }`, a list, weights or `"<a b>"` per voice), `fill` (`true`/`false`/`n`) |
| bass | a seeded or written line on a density grid, transposed by the chord root | `sound`, `notes`, `rhythm` (a written grid), `patch` |
| melody | a seeded or written line | `sound`, `notes`, `follow` (`true` = move with the chord root, `'tones'` = degrees onto chord tones), `phrase` (bars), `seed`, `patch` |
| pad | the chord, voiced by density (1..4 tones) | `sound`, `chord` (pin a degree), `arp` (`up`/`down`/`updown`/`"0 2 1 2"`), `patch` |
| fx | transition material only: silent by default | `sound` (white noise default), `riser` (`true` = 4 bars, or bars), `impact` (`true` = `bd`, or a sound) |
| sample | a trimmed region of any loaded sample, sliced and re-sequenced | `sound` (a sample, a pack definition, or a list of takes), `begin`, `end` (fractions), `bars`, `slices` (count or break points), `pattern` (slice indices), `stretch`, `transpose` (semitones) |
| perc | one bare sound (no kit) on a written rhythm | `sound`, `rhythm` (default a hit per beat) |
| raw | a plain Strudel pattern inside a section | `pattern` |

Materials on **any layer** (`MIX_KEYS` in `lib/song.mjs:15`, applied after the layer builds; they appear at the end of every refusal message): `level` (0..2 gain, applied after every axis), `duck` (another part's name: a real superdough sidechain via `duckorbit`), `duckDepth`, `duckAttack`, `position` (-1..1, shifts every hap's pan by `position/2`; `width` moves around it), `velocity` (a mini string of per-step multipliers), `humanize` (`{ timingMs, velocity, length, correlation }`: a seeded, correlated played feel, late-only timing), `compressor` (`{ threshold, ratio, knee, attack, release }`, one DynamicsCompressorNode per hit).

**Section keys**: `role`, `key`, `progression`, `kit`, `meter`, `bpm`/`cps`, `room`, `dropout: n` (silence every part but fx for the last n bars), `sweep: n` (over the last n bars open the filter to 8 kHz then close to 150 Hz). **Song keys** (`META_KEYS`): `cps, bpm, meter, key, seed, kit, packs, room`. `room` = `{ size, fade, damping, dimension, ir, irbegin }`, one reverb character for every part; each part's `space` becomes its send.

**Orbits** (`lib/song.mjs` `orbitKey`): every part plays on a superdough orbit (`.orbit(n)`), where reverb and delay live; parts whose reverb would be identical share one (so a 13-part section is not 13 convolvers); numbered in order of first appearance. This is why every dumped part now ends with `.orbit(n)`.

### The twelve axes (unchanged)

density, drive, brightness, weight, space, articulation, aggression, groove, variation, organicness, width, register. Structural (number only, decide the grid before any pattern exists): density, drive, variation, register. Continuous (number, Strudel signal, `ramp`, or a movement): the other eight. Verification: direct = density (onsetsPerSec), brightness (centroidHz), weight (lowRatio), width (width); proxy = space (tail), articulation (crest), aggression (flatness), groove (swing), variation (novelty), organicness (jitter); code = drive, register. What each cell does per layer at .2/.8 is the generated table in `.claude/skills/strudel/reference/vocab.md` ("Adapter cells"); quote from there rather than re-deriving.

### Written rhythm grammar (`lib/grid.mjs` `parseGrid`)

One grammar everywhere a rhythm is written (drum `template: { voice: grid }`, `bass.rhythm`, `perc.rhythm`): `x` hit, `X` accent (gain x1.25), `o` ghost (gain x0.4), `.`/`-`/`~` rest, spaces ignored, `|` between bars; or `p/s` for p euclidean hits (Bjorklund) over s slots of the bar, `p/s+r` rotated left by r. Shorter than a bar tiles; longer must be whole bars; any other character throws `rhythm "...": unknown character "q" (x X o . - ~ | or p/s)`. Meter is parametric (`4/4` = 16 steps, `3/4`, `6/8`, `7/8`, `5/4`; one bar is still one cycle). Example from `test/layers.test.mjs`: `{ bd: 'x...x...x...x...', sd: '3/8', rd: 'x.x.x.x.x.x.x.x.|X.x.x.x.X.x.x.x.', cb: 'o.......' }`; the five kit voices stay density-gated, any extra written voice always plays.

### Movements (`lib/axes.mjs` `MOTIONS`, resolver words in `lib/motion.json`)

- `ramp(a, b)`: a saw over exactly the section (`S.saw.range(a, b).slow(ctx.cycles)`).
- `wobble(a, b, bars = 1)`: sine, one wobble per `bars`.
- `drift(a, b)`: perlin wander.
- `pulse(a, b, per = 4)`: square dipping `per` times a bar.
- `swell(a, b)`: sine timed to the section, peaking a quarter of the way in.
- Motion words: wobbling/wobble/wobbly, drifting/drift, pulsing/pulse/pumping, swelling/swell/breathing, rising/rise/opening, falling/fall/closing. `"wobbling brightness"` writes `wobble(v-.2, v+.2)` around the current value; `rising`/`falling` write `ramp(v, v+.3)` / `ramp(v, v-.3)` (`lib/resolve.mjs:183`). Structural axes and existing signals refuse.

### Patches (`lib/patches.json`, material on bass/melody/pad)

`pluck` `{ lpq .35, lpenv 3, lpdecay .12, vib 0, vibmod 0 }`, `reese` `{ unison 3, detune .3, lpq .2 }`, `hollow` `{ fmi 1.5, fmh 2, lpq .1 }`, `glass` `{ fmi 3, fmh 3.5, pdecay .08, penv 6 }`, `breath` `{ noise .3, lpattack .25, lpenv 2 }`, `wide` `{ unison 5, detune .18 }`, `sub` `{ lpq 0, vib 0, vibmod 0 }`. An inline object of the same controls is accepted; an unknown key throws (`patch: unknown key "lpf"`). Applied under the axes (`withPatch`, `lib/layers.mjs:32`).

### Arrangement verbs (`lib/verbs.json`, on the strip's lightning pick and `npm run resolve ... --verb`)

`breakdown` (phrase "sparser, more spacious, darker", drops fx), `lift` ("busier, brighter, more driving"), `strip` (keep drums, bass, sample, perc, raw), `halftime` (drums `template: 'halftime'` plus "slightly sparser").

### Harmony (rule 4: material, not an axis)

`key` and `progression` per section; roman numerals diatonic to the section key, one chord per bar, `[..]` for several in a bar, `b`/`#`, `m`/`M`/`dim`, `7`/`M7`, `@n` holds a chord n bars (1..64), `/1`/`/2` inverts (`VI/1` prints `Ab/C`). Pad voices the chord, bass transposes by the root, melody stays in key unless `follow`. Words: `static, resolved, unresolved, tense, pop, epic, circular`, modes, `relative`. Not modeled: voice leading, chord symbols.

---

## 4. The story for a product-review reader

**Lead with the product, not the process.** The reader can open `https://jonborchardt.github.io/strudel-bench/`, pick `demo.strudel`, press play, drag a slider in the Mix card, and watch the plain Strudel on the right change. That is the demo; everything else is explanation of what they just saw.

**The one-sentence pitch that holds up:** Strudel is an instrument (a loop you edit while it plays) and strudel-bench is a score on top of it (named sections, parts with baselines, twelve 0..1 knobs per part, and a compiler you can read the output of). The framing "fine instrument, poor score" from the old post is still accurate and still the best line.

**What is genuinely surprising, in order of strength:**

1. **The layer decompiles, and you can check it.** `song()`/`section()` build Strudel patterns at runtime; there is no template. `lib/dump.mjs` instruments Strudel for one evaluation and prints the call chain per part, then restores everything (pinned by test). The demo intro's 4 declarative lines become 35 lines of plain Strudel that produce the same 36 events to six significant figures (orbit field aside). The export button ships this. Most DSLs cannot show you what they became.
2. **0.5 is literally nothing.** `ctl` returns the same object at 0.5, so an unmentioned axis and an axis at 0.5 are indistinguishable, and the declarative file is a description, not a transformation. Enforced by test on the four core layers, fx and sample (see the audit for the honest scope).
3. **Empty cells are asserted, not hidden.** 32 of 96 cells are deliberately empty, they are accepted and printed back inert, and the fx ones are pinned absent by test (`test/layers.test.mjs`: `for (const a of ['density', 'drive', 'variation', 'register']) assert.equal(g.strudelLib.cells.fx[a], undefined)`).
4. **The check is how you "hear" a song without hearing it.** One command prints every event, the file behind every sound name (`didgeridoo:8 Didgeridoo1_Sus2_Main.wav`), a per-section table with each part's axis values read back as words (`very dreamy, wide, very mechanical`), the chords actually resolved (`i VI III VII → Dm Bb F C`), a voices-at-once load figure per section, and an `arc:` line of energies with form letters. `npm run lint` then applies musical rules to that table (a climax exists and is the peak, no identical consecutive sections, no two raw saws, melody and bass write their notes, axes in 0..1, level in 0..2, load under ~40 voices). Refusals are hard errors that name both legal lists.
5. **Raw Strudel is welcome alongside.** A `raw` part inside a section, or a `stack()` of textures around the whole song (`arrival`, `machine`). The language does not replace Strudel; it sits next to it, and the check counts the outside material in its load figure.
6. **The bug that justified the phase rule** (bass weight silently erasing brightness) is real, dated, and reproducible with numbers. Keep it; it is the best two paragraphs in the current post.

**Key terminology** (define in this order): live coding; Strudel / TidalCycles (a JavaScript port, not a wrapper); cycle (Strudel's unit; here one cycle = one bar, 16 sixteenth steps in 4/4, `bpm` becomes `cps = bpm/60/beats`); mini-notation; pattern (a pure function from a time span to events); event / hap; section (named, with a role, key, progression); part (an instance of one of eight layers; `melody2` builds the melody layer again); axis (0..1, 0.5 = baseline); cell (one layer's implementation of one axis); phase (structural, timing, pitch, articulation, spectral, spatial, level); material (literal values, never a knob); movement (`ramp`, `wobble`, `drift`, `pulse`, `swell`); orbit (superdough's bus; reverb lives there); dump / expanded Strudel; check / lint.

**Caveats to state plainly:** not a synthesizer (samples and simple synth voices from superdough; ~300 MB of packs locally, streamed on Pages); harmony is material and does not model voice leading; `level` is material; "verified directionally" is the strongest verification claim the project itself makes; the twelve axes are one person's carve-up, not discovered structure; the check output contains em dashes, arrows and block glyphs, so quoting it verbatim collides with the blog's no-em-dash rule (rewrite the arc line with `|` and drop the trailing word list, as the current post does).

**Phrasing to avoid because a routine commit would falsify it:**

- Any absolute count that derives from the layer list ("eight kinds", "96 cells", "64 implemented", "32 holes"). If used, date it in the caption and add "from the code, so it moves when a layer is added"; better, phrase as "twelve axes times eight layers, two thirds of the cells implemented" only in a dated figure.
- Any number from `arrival` (events, energies, voices, sound count, part count). The song moved twice in the last week (`4b97ac9`, `3517d4d`). Prefer `demo.strudel` (unchanged since 2026-09-12 apart from a flag comment; 756 events / 20 cycles / 3 sections / arc `intro 9, verse 29.5, drop 59`) for anything quantitative in prose, and treat arrival numbers as figure data with a date.
- "The dump is N lines" for any part: `.orbit()`, `position`, `velocity`, `humanize` and `room` all add lines and the set of appended calls changes with the mix material. Say "a few dozen calls per part".
- "The tests cover every cell" (they do not: perc and raw have no direct 0.5 test).
- "Runs in about a second" (arrival takes ~17 s because of the voices count).
- "Five" anything. "Fourteen holes". "Sixty cells". "2,751 events".
- Describing `about.html` or the README's older "Five layers" wording.
- "the page has two views" (README wording): there are two deployed views plus a local-only Samples page plus About/Legal.

---

## 5. Proposed visuals (with authoritative data)

### V1: the 8 x 12 cell grid (replace `cells-viz.svg`)

Rows = axes in `AXES` order; columns = layers in registration order. Each cell is the phase(s) the cell participates in, computed from `strudelLib.cells` on 2026-09-19 (script in section 7). `(describe only)` = a registered cell with no phase function, because drums width is applied per voice inside `buildDrums` (comment at `lib/layers.mjs:195`): draw it as implemented, with a footnote.

| axis | drums | bass | melody | pad | fx | sample | perc | raw |
|---|---|---|---|---|---|---|---|---|
| density | structural | structural | structural | structural | . | . | structural | . |
| drive | structural | structural | . | structural | . | . | structural | . |
| brightness | spectral | spectral | spectral | spectral | spectral | spectral | spectral | spectral |
| weight | spectral+level | pitch+spectral+level | . | pitch+level | level | level | spectral+level | level |
| space | spatial | spatial | spatial | spatial | spatial | spatial | spatial | spatial |
| articulation | articulation | articulation | articulation | articulation | . | . | articulation | . |
| aggression | spectral | spectral | spectral | spectral | . | . | spectral | . |
| groove | timing | timing | timing | . | . | . | timing | . |
| variation | structural | structural | structural | . | . | . | . | . |
| organicness | timing+level | timing+level | timing+level | level | . | . | timing+level | . |
| width | (describe only) | . | spatial | spatial | spatial | spatial | spatial | spatial |
| register | . | structural | structural | structural | . | . | . | . |

Totals: **96 cells, 64 implemented, 32 empty (67% implemented)**. Per layer: drums 11, bass 11, melody 10, pad 10, perc 10, fx 4, sample 4, raw 4. Per class of axis: 4 direct, 6 proxy, 2 code; 4 structural, 8 continuous. Two rows are full (brightness, space); two rows have five holes each (variation: pad, fx, sample, perc, raw; register: drums, fx, sample, perc, raw).

The 32 empty cells and why each is honest:
- fx (8): density, drive, articulation, aggression, groove, variation, organicness, register. A riser or an impact has no grid to thin, swing or vary.
- sample (8): same eight. A sliced sample's rhythm is its `pattern`; density and drive would mean re-slicing, which is material.
- raw (8): same eight. The pattern's own controls are its material; only the four pattern-agnostic cells apply (brightness, weight, space, width, shared with sample by object identity).
- perc (2): variation, register. One bare sound has no pitch and no loop to vary.
- drums (1): register. A kit has no pitch. (Examples card "Register on the drums: no cell".)
- bass (1): width. Mono low end on purpose.
- melody (2): drive, weight. Rhythm-section ideas.
- pad (2): groove, variation. A sustained chord has no offbeat and no loop.

Shared-implementation note for the caption: perc's brightness, weight, space and aggression cells are the same objects as drums'; raw's four cells are the same objects as sample's. If the figure wants to show it, hatch those eight cells.

### V2: the phase pipeline with the bass collision (update `phases-viz.svg`)

Top: `structural -> timing -> pitch -> articulation -> spectral -> spatial -> level`, with the note that structural runs over a plain plan object before any pattern exists (`applyPlanPhase`) and the other six run in `PHASES` order and, within a phase, in `AXIS_NAMES` order (`applyPatternPhases`). Bottom, measured 2026-09-19 with `bass({...}, { cps: .5, key: 'C:minor', seed: 3, kit: 'RolandTR909', cycles: 4 })`, first event's `cutoff`:

| Path | Cutoff (Hz) |
|---|---|
| baseline | 400 |
| brightness .8 alone | 1050.6111217615069 |
| weight .8 alone | 340 |
| declared order, brightness then weight | 893.0194534972808 (= 1050.61 x 0.85) |
| reversed, weight then brightness | 1050.6111217615069 (weight's multiply erased) |

Historical note from commit `4aa036c` (2026-09-10): before the fix `{brightness .9, weight .9}` and `{brightness .5, weight .9}` both resolved to 317.77. Today they are 1159.65 and 320. The rule: brightness *sets* (`ctl(p, 'lpf', ...)`), weight *multiplies* (`mulBy(p, 'lpf', v, piece(1, 1, 0.75), { noopBelow: true })`), and brightness (index 2 in `AXIS_NAMES`) runs before weight (index 3). The unchanged figure semantics from the old post are still right; only the date needs updating.

### V3: the arrival arc (update `arc-viz.svg`)

Eight blocks at true widths 1, 8, 8, 8, 8, 8, 12, 6 bars, height = energy (onsets per cycle summed over the section's parts, each scaled by its `level`; `scripts/check.mjs:140`). Data from `npm run check -- songs/arrival.strudel` on 2026-09-19:

| Section | Bars | Role | Parts | Energy | Voices at once (outside) | Form |
|---|---|---|---|---|---|---|
| void | 1 | establish | 2 | 1.1 | 7 (4) | A |
| signal | 8 | establish | 4 | 4.1 | 12 (4) | B |
| approach | 8 | develop | 9 | 21.6 | 22 (4) | C |
| contact | 8 | climax | 11 | 57.6 | 31 (2) | D |
| will | 8 | develop | 7 | 14.4 | 14 (4) | E |
| plea | 8 | develop | 10 | 37 | 26 (3) | F |
| threshold | 12 | climax | 13 | 67.3 | 37 (3) | G |
| after | 6 | release | 6 | 7.4 | 18 (4) | H |

Arc line verbatim: `arc: void 1.1 ▁ A · signal 4.1 ▁ B · approach 21.6 ▃ C · contact 57.6 ▇ D · will 14.4 ▂ E · plea 37 ▅ F · threshold 67.3 █ G · after 7.4 ▂ H`. Form letters: same set of sounding parts shares a letter, a prime marks energy far off that letter's first section (`formLetters`, `scripts/check.mjs:159`); arrival is through-composed, hence A..H. The lint's load threshold is 40 voices (`scripts/lint.mjs:22`); threshold sits at 37 after `4b97ac9` pulled two pad widths under .8 (jux doubles every voice).

If a second, stabler arc is wanted for prose: `demo.strudel` gives `arc: intro 9 ▂ A · verse 29.5 ▅ B · drop 59 █ C` (bars 4, 8, 8; voices 6, 6, 12).

### V4 (optional): the "four lines become 35" side-by-side

Left: `songs/demo.strudel:5-8` verbatim (the `intro` section, 4 lines). Right: the two `const` chains from the current dump (35 code lines; section 7 has the command). Annotate the mapping: `density: .3` -> only `bd` and `sd` survive (`struct` lines); `space: .6` -> `.room(0.08).size(0.4)`; `space: .8` on the pad -> `.room(0.66).size(0.81)`; `articulation: .2` -> `.clip(1.12).attack(0.42).release(1.44)`; `brightness: .35` -> `.lpf(701.029)` after the baseline `.lpf(1200)`; and the two `.orbit(n)` lines that no axis wrote (the song's bus allocation). Caption: same 36 events to six significant figures.

---

## 6. Audio clips

Manifest format (`scripts/snippets.mjs`, unchanged since `7d93908`): `npm run snippets -- clips.json --out-dir <dir> [--force]`, entries `{ out, song, section?, layer?, cycles?, kbps?, mono? }`, defaults 64 kbps mono, existing files skipped. The page must be open (`npm run headless -- songs/x.strudel` first; another agent owns the browser today, so hand this manifest over rather than running it). Semantics: no `section` = whole song from cycle 0 (`cycles` defaults to the song's total); `section` = from that section's offset, `cycles` in bars of the section; `layer` needs `section` and renders that part alone.

**Existing clips in `src/content/posts/a-language-on-top-of-strudel/audio/` (all rendered 2026-09-13 11:19-11:57):**

| File | Song since 09-13 | Verdict |
|---|---|---|
| `euclid-day-one.mp3` | `euclid.strudel`: only `// @blog` added (`7d93908`, 14:13, after the render); plain Strudel, no lib involved | **still valid** |
| `intro-declarative.mp3` | `demo.strudel`: only `// @blog` added; but `lib/` changed (per-part orbits `ab957dc`/`4d95feb`, humanize/room/compressor as control calls `1d64579`, and more) and the intro now builds with two orbits | **re-render** to be safe (the file text is unchanged, the build is not) |
| `intro-raw-strudel.mp3` | `demo-intro-raw.strudel` unchanged, but it is the 09-13 dump without `.orbit()`; the current dump adds two lines | **regenerate the song file from `npm run dump -- songs/demo.strudel` (add `.orbit(1)`/`.orbit(2)`), then re-render**, so the A/B is again the same build |
| `arrival-void.mp3`, `arrival-threshold.mp3`, `threshold-melody-alone.mp3`, `threshold-melody2-alone.mp3` | `arrival.strudel` rewritten (`4b97ac9` 09-18, `3517d4d` 09-19: hall impulse, positions, velocity, humanize, compressor, levels, widths) | **re-render** |

Proposed manifest (same clip set; `euclid-loop` only if the post stops importing the shared `euclid-day-one` file):

```json
[
  { "out": "a-language-on-top-of-strudel/intro-declarative", "song": "demo.strudel", "section": "intro", "cycles": 4 },
  { "out": "a-language-on-top-of-strudel/intro-raw-strudel", "song": "demo-intro-raw.strudel", "cycles": 4 },
  { "out": "a-language-on-top-of-strudel/euclid-loop", "song": "euclid.strudel", "cycles": 4 },
  { "out": "a-language-on-top-of-strudel/arrival-void", "song": "arrival.strudel", "section": "void", "cycles": 1 },
  { "out": "a-language-on-top-of-strudel/arrival-threshold", "song": "arrival.strudel", "section": "threshold", "cycles": 4 },
  { "out": "a-language-on-top-of-strudel/threshold-melody-alone", "song": "arrival.strudel", "section": "threshold", "layer": "melody", "cycles": 4 },
  { "out": "a-language-on-top-of-strudel/threshold-melody2-alone", "song": "arrival.strudel", "section": "threshold", "layer": "melody2", "cycles": 4 }
]
```

Durations: demo at cps 0.5, 4 bars = 8 s; euclid at cps 0.533, 4 bars = 7.5 s; arrival at cps 0.2667, 4 bars = 15 s, 1 bar = 3.75 s. Run with `--force` for the six that must change. Note `threshold` melody is now the `answer` spec (`notes: '0 ~ 2 4@2 ~ 5 4@2 7 6 5 4@2 ~ 2 0@2'`, level 1.2, register .65), still `follow: true`; melody2 is still `signal` (`follow: false`).

---

## 7. Reproduction commands (every number above)

All from `E:\github2\strudle`. `npm run check` and `npm run dump` are read-only; nothing here opens a browser.

```
# repo state
git log -1 --format='%H %ad %s' --date=iso            # 828c550 2026-09-19 00:16:45 -0700
git log --format='%h %ad %s' --date=short -- songs/demo.strudel songs/demo-intro-raw.strudel songs/euclid.strudel
#   7d93908 2026-09-13 blog updates  (adds "// @blog" to demo and euclid, creates demo-intro-raw)
git show 7d93908 -- songs/demo.strudel songs/euclid.strudel   # one-line diffs each
git show 9f843fe:songs/euclid.strudel | wc -c        # 325 (creation); wc -c songs/euclid.strudel -> 334 today
git log --format='%h %ad %s' --date=short -- songs/arrival.strudel | head -3
#   3517d4d 2026-09-19 promoted mixed versions; 4b97ac9 2026-09-18 ...; 7d93908 2026-09-13
git diff 7d93908 HEAD --stat -- songs/arrival.strudel # 59 insertions, 46 deletions
git show 4aa036c --format='%h %ad %s%n%b' --date=short --stat   # the bass weight/brightness fix, 2026-09-10

# layers, cells, phases
grep -n "registerLayer(" lib/layers.mjs               # 8 hits: drums bass melody pad fx sample perc raw
sed -n 1,20p lib/axes.mjs                             # PHASES and AXES
grep -n "defineCell('drums', 'width'" lib/layers.mjs  # describe-only cell, line 196
grep -n "cells.drums\[a\]\|cells.sample\[a\]" lib/layers.mjs   # perc/raw share cells, lines 586 and 602

# the grid, the bass cutoffs (script in this session's scratchpad; recreate as needed)
# import { ensureScope } from 'file:///E:/github2/strudle/scripts/check.mjs'; await ensureScope();
# then iterate AXIS_NAMES x ['drums','bass','melody','pad','fx','sample','perc','raw'] over globalThis.strudelLib.cells,
# printing PHASES.filter((p) => cell[p]); and for the cutoffs:
#   onsets(bass({ brightness: .8 }, ctx))[0].value.cutoff  etc., ctx = { cps: .5, key: 'C:minor', seed: 3, kit: 'RolandTR909', cycles: 4 }
#   reversed order by hand: ctl(bass({}, ctx).mul(lpf(piece(1, 1, 0.75)(.8))), 'lpf', .8, piece(80, 400, 2000, { log: true }))
# Output 2026-09-19: total 96 implemented 64 empty 32 {"drums":11,"bass":11,"melody":10,"pad":10,"perc":10,"fx":4,"sample":4,"raw":4}
#   400 / 1050.6111217615069 / 340 / 893.0194534972808 / 1050.6111217615069; {b.9,w.9} 1159.6474618843129, {b.5,w.9} 320

# tests that pin the claims
node --test test/layers.test.mjs test/axes.test.mjs test/dump.test.mjs test/sample.test.mjs   # 68 pass, 0 fail (13.7 s)
grep -n "LAYERS = \|at exactly 0.5\|moves something\|fx cells\|has no fx cell" test/layers.test.mjs
grep -n "no-op" test/sample.test.mjs                  # line 56

# songs
npm run check -- songs/demo.strudel                   # 756 events in 20 cycles; arc: intro 9 / verse 29.5 / drop 59
npm run check -- songs/demo-intro-raw.strudel | grep -c "^[0-9]"   # 36 events
npm run check -- songs/arrival.strudel | grep -v "^[0-9]"          # 2434 events in 59 cycles; sounds block (29 entries); tables; arc line
npm run lint -- songs/arrival.strudel                 # "== songs\arrival.strudel: clean"
npm run check -- songs/ping.strudel | grep -v "^[0-9]"             # arc: call 14 / answer 29.3
npm run dump -- songs/demo.strudel > demo-dump.txt
awk '/^\/\/ intro \[0-4\)/{f=1} /^\/\/ verse/{f=0} f' demo-dump.txt | grep -v "^//" | grep -v "^$" | wc -l   # 35
npm run dump -- songs/arrival.strudel > arrival-dump.txt
grep -c "^const" arrival-dump.txt                     # 66 (62 parts + piece, ARP_ORDERS, arpIndices, and `const layers = arrange(` because the song is stacked with textures)
grep -c "^  \." arrival-dump.txt                      # 1433 lines starting with a dot
wc -l arrival-dump.txt                                # 1751

# event equivalence demo intro vs raw (script: parse check output lines, drop `orbit`, round numbers to 6 sig figs)
#   36/36 identical at 6, 5 and 3 sig figs with orbit ignored; 0/36 byte-identical; worst relative diff 2.6e-7 (cutoff 701.0288172814385 vs 701.029)
#   raw orbit values [undefined]; demo intro orbit values [1, 2]

# timing (PowerShell): foreach ($s in 'ping','demo','arrival') { Measure-Command { node scripts/check.mjs "songs/$s.strudel" } }
#   ping 1.2 s, demo 2.1 s, arrival 16.9 s (warm)

# refusals (two-line song files with the typo / the unknown sound; exit codes)
#   unknown key "arpp" on melody in section "a" (axes: density, drive, brightness, weight, space, articulation, aggression,
#     groove, variation, organicness, width, register; material: sound, notes, follow, phrase, seed, patch, level, position,
#     duck, duckDepth, duckAttack, velocity, humanize, compressor)                        exit 1
#   unknown sound "kazoo"                                                                 exit 1
#   drums: { register: .9 } accepted, table prints "drums 14/cyc register=0.9"

# product facts
grep -n "^const PAGES" scripts/pages.mjs              # index, examples, about, legal
grep -n "localStorage\|#s=" index.html | head          # Pages saves, share link
grep -L "@hidden" songs/*.strudel | wc -l              # 11 listed songs (of 23)
node --input-type=module -e "import('./scripts/esm-fix.mjs').then(()=>import('./web/examples.mjs')).then(m=>console.log(m.GROUPS.length, m.GROUPS.reduce((n,g)=>n+g.examples.length,0)))"   # 16 134
cat lib/patches.json lib/motion.json lib/verbs.json lib/packs.json
sed -n 60,90p lib/grid.mjs                            # parseGrid grammar
grep -n "META_KEYS\|dropout\|sweep" lib/song.mjs      # song keys, section keys
grep -n "VOICES = " scripts/lint.mjs                  # 40
```

### Fresh check excerpt from `demo.strudel` (2026-09-19, short form for the post)

Event lines (the first five of 756; `t +dur {controls}`):

```
== songs\demo.strudel (756 events in 20 cycles)
0.000 +0.063 {"s":"bd","bank":"RolandTR909","pan":0.5,"room":0.07999999999999999,"roomsize":0.39999999999999997,"orbit":1}
0.000 +1.000 {"note":60,"s":"sawtooth","cutoff":701.0288172814385,"attack":0.41999999999999993,"release":1.44,"room":0.6600000000000001,"roomsize":0.81,"gain":0.45,"pan":0.5,"vib":0.4,"vibmod":0.15,"clip":1.1199999999999999,"orbit":2}
0.000 +1.000 {"note":63,"s":"sawtooth", ...same controls...}
0.000 +1.000 {"note":67,"s":"sawtooth", ...same controls...}
0.250 +0.063 {"s":"bd","bank":"RolandTR909","pan":0.5,"room":0.07999999999999999,"roomsize":0.39999999999999997,"orbit":1}
```

Table (verbatim apart from nothing; note the em dashes and arrows are the tool's own output):

```
  sounds
    RolandTR909_bd:0         Bassdrum-01.wav (4 variants)
    RolandTR909_sd:0         naredrum.wav (16 variants)
    RolandTR909_hh:0         hh01.wav (4 variants)
    piano:0                  pitched, 29 samples A0..C8
    RolandTR909_oh:0         Hat Open.wav (5 variants)
    glockenspiel:0           pitched, 7 samples C5..G6
    RolandTR909_cp:0         Clap.wav (5 variants)
  [0-4) intro (establish)  ~6 voices at once
    harmony C:minor  i VI → Cm Ab
    drums       6/cyc  density=0.3 space=0.6  — sparse
    pad         3/cyc  space=0.8 articulation=0.2 brightness=0.35  — dreamy, dark
  [4-12) verse (develop)  ~6 voices at once
    harmony C:minor  i VI → Cm Ab
    drums      15/cyc  density=0.6 groove=0.6
    bass        4/cyc  weight=0.7 register=0.3  — massive
    melody    5.5/cyc  density=0.5 brightness=signal sound=piano follow=true phrase=2 notes=0 2 3@2 ~ 4 3 2 0 2 3@2 ~ 5@2 4
    pad         3/cyc  space=0.6
    fx          2/cyc  riser=2
  [12-20) drop (climax)  ~12 voices at once
    harmony C:minor  i VI III VII → Cm Ab Eb Bb
    drums      28/cyc  density=0.9 drive=0.8 articulation=0.7  — very busy, frantic, punchy
    bass        4/cyc  weight=0.9 aggression=0.6 density=0.75 notes=0 7 0 4  — very massive, busy
    melody    9.5/cyc  density=0.7 width=0.8 brightness=0.7 sound=piano follow=true phrase=2 notes=0 2 4 7@2 6 4 2 0 2 4 7@2 5 4@2  — busy, wide, bright
    melody2     3/cyc  notes=~ 7 ~ ~ 5 ~ 4 ~ sound=glockenspiel register=0.8 level=0.5 follow=true space=0.7 width=0.7  — dreamy, wide
    pad        16/cyc  space=0.5 brightness=0.7 width=0.8 arp=up  — bright, wide
  arc: intro 9 ▂ A · verse 29.5 ▅ B · drop 59 █ C
```

Reading it: `0.250 +0.063` is "at cycle 0.25, lasting a sixteenth"; `6/cyc` is onsets per cycle for that part; `~6 voices at once` is the load figure (hits sounding at once, length plus release, one more per worklet effect); `brightness=signal` is a Strudel signal the resolver will refuse to rewrite; the words after the dash are `describeAxes` (the vocabulary run backwards); the arc's letters are the form.

### Arrival section header lines (verbatim, for the voices/form figure)

```
  [0-1) void (establish)  ~7 voices at once (4 outside the parts)
  [1-9) signal (establish)  ~12 voices at once (4 outside the parts)
  [9-17) approach (develop)  ~22 voices at once (4 outside the parts)
  [17-25) contact (climax)  ~31 voices at once (2 outside the parts)
  [25-33) will (develop)  ~14 voices at once (4 outside the parts)
  [33-41) plea (develop)  ~26 voices at once (3 outside the parts)
  [41-53) threshold (climax)  ~37 voices at once (3 outside the parts)
  [53-59) after (release)  ~18 voices at once (4 outside the parts)
  arc: void 1.1 ▁ A · signal 4.1 ▁ B · approach 21.6 ▃ C · contact 57.6 ▇ D · will 14.4 ▂ E · plea 37 ▅ F · threshold 67.3 █ G · after 7.4 ▂ H
```

Arrival `sounds` block (29 entries, verbatim order as printed):

```
    pipeorgan_quiet:0        pitched, 21 samples A1..F#5
    hall:0                   hall.wav (1 variant)
    psaltery_bow:0           pitched, 11 samples A#3..G#4
    wind:0                   000_wind1.wav (10 variants)
    didgeridoo:8             Didgeridoo1_Sus2_Main.wav (12 variants)
    super64_vib:0            pitched, 13 samples C2..G5
    wind:1                   001_wind10.wav (10 variants)
    handchimes:0             pitched, 19 samples A#3..G#5
    wineglass_slow:0         pitched, 4 samples D#4..D5
    wind:2                   002_wind2.wav (10 variants)
    pipeorgan_loud_pedal:0   pitched, 11 samples A1..F#3
    timpani:0                Timpani1_Hit_v2_rr1_Sum.wav (30 variants)
    piano:0                  pitched, 29 samples A0..C8
    recorder_alto_sus:0      pitched, 12 samples A#3..G#4
    timpani_roll:0           Timpani1_Roll_v3_rr1_Sum.wav (10 variants)
    sus_cymbal:0             susCymb1_bow_13.wav (25 variants)
    snare_low:0              RopeSnare_low_ns_Main_vl1_rr2.wav (20 variants)
    tubularbells:0           pitched, 9 samples A#3..G#3
    harp:0                   pitched, 23 samples A2..G5
    bd:0                     10_bd_switchangel.wav (8 variants)
    triangles:0              Triangle1_HitFM_v1_rr1_Mid.wav (37 variants)
    bassdrum2:0              bassdrum_cresc_med.wav (30 variants)
    gong:0                   gong_2_f.wav (7 variants)
    belltree:0               pitched, 6 samples A#5..G#5
    gong2:0                  hit_full1.mp3 (6 variants)
    framedrum:0              HDrumL_Hand_rr1_Sum.wav (18 variants)
    pipeorgan_loud:0         pitched, 21 samples A1..F#5
    vibraphone_bowed:0       pitched, 6 samples A2..G3
    vibraphone:0             pitched, 11 samples A2..G3
```

### The current `contact_melody` dump chain (for the "one line, N calls" figure; 30 chained calls today)

```js
const contact_melody = n("0 ~ 2 4@2 ~ 5 4@2 0 ~ 2 4@2 ~ 7 6@2")
  .slow(2)
  .add(n("<0 5 2 6>"))
  .scale("D4:minor")
  .add(note(0))
  .add(note("<0 0 0 0>"))
  .s("piano")
  .lpf(2000)
  .clip(0.8)
  .release(0.1)
  .room(0.2)
  .gain(0.6)
  .mul(gain("1 0.8 0.8 0.8 1 0.8 0.8 0.8 1 0.8 0.8 0.8 1 0.8 0.8 0.8"))
  .sometimesBy(0.1, (x) => x.ply(2))
  .clip(1.07)
  .attack(0.0455)
  .release(0.28)
  .lpf(3031.43)
  .room(0.128)
  .pan(sine.slow(4).range(-1, 1).mul(pure(0.1)).add(0.5))
  .mul(gain(1.1))
  .orbit(1)
  .withValue((v) => ({ ...v, pan: Math.min(1, Math.max(0, (v.pan ?? 0.5) + 0.05)) }))
  .velocity(".85 1 .9 1 .8 1 .9 .95")
  .withHap((h) => { const d = ((t) => 0.0016 * (0.5 * Math.sin(2 * Math.PI * t / 4 + 2.133) + 0.3 * Math.sin(2 * Math.PI * (t % 1) * 4 + 2.133) + 0.2 * ((Math.sin(t * 127.1 + 2.133) * 43758.5453) % 1)))((h.whole ?? h.part).begin.valueOf()) + 0.0016; return h.withSpan((s) => s.withTime((t) => t.add(d))); })
  .mul(gain(signal((t) => 0.1 * (0.5 * Math.sin(2 * Math.PI * t / 4 + 2.133) + 0.3 * Math.sin(2 * Math.PI * (t % 1) * 4 + 2.133) + 0.2 * ((Math.sin(t * 127.1 + 2.133) * 43758.5453) % 1))).add(1)))
  .ir("hall")
  .roomsize(3.2)
  .roomlp(4500)
```

Source side, `songs/arrival.strudel`: `const theme = { sound: 'piano', follow: true, phrase: 2, notes: '0 ~ 2 4@2 ~ 5 4@2 0 ~ 2 4@2 ~ 7 6@2', register: .55, articulation: .05, brightness: .6, space: .32, weight: .58, width: .5, position: .1, velocity: '.85 1 .9 1 .8 1 .9 .95', humanize: { timingMs: 12, velocity: .1, correlation: 'phrase' } };` and in contact `melody: { ...theme, density: .55, brightness: .65, width: .6, level: 1.1 },`. Mapping notes: the two `nudge`/`rand` organicness lines of the old dump are gone (theme dropped `organicness` for `humanize`), the `humanize` closures are the `withHap` (timing) and `mul(gain(signal(...)))` (velocity) lines, `position: .1` is the `withValue` pan shift of +0.05, `space: .32` is `.room(0.128)`, and `.ir("hall").roomsize(3.2).roomlp(4500)` is the song's `room`.

### Commit message of the bug that justified the phase rule (`4aa036c`, 2026-09-10, verbatim)

> bass.weight set an absolute lpf and ran after bass.brightness in the spectral phase, so brightness was discarded whenever weight was set: {brightness .9, weight .9} and {brightness .5, weight .9} both resolved to cutoff 317.77.
>
> Generalise the gain-only multiply helper to any control (gainBy -> mulBy with a control name) and have bass.weight multiply the cutoff by a factor that is 1 at 0.5 and 0.75 at 1, instead of setting it. Absolute values at the default brightness are unchanged (400 x 0.75 = 300 at weight 1).
>
> Audited the other layers for cells writing the same control in the same phase: bass was the only collision. The two gain writers on drums and pad (weight and organicness) already multiply and compose correctly.
