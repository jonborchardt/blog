# Domain brief: `never-read-the-code` (strudel-bench, post 1 of 6)

Repo: `E:\github2\strudle` → `github.com/jonborchardt/strudel-bench` (public, created 2026-09-11), live at `https://jonborchardt.github.io/strudel-bench/`.
All numbers below were measured on **2026-09-13** against commit `7a4d1b0` unless stated. Staleness flagged per number.

---

## 1. The strongest story

**The repo contains a visible before-and-after of two ways to build software with an agent, and the author only remembers the second one.**

The first ~14 hours of strudel-bench were built with the full ceremony: a brainstormed design spec, an 876-line implementation plan, 20 numbered task briefs that each contained the *test source written before the implementation*, a per-task code-review round, and a written ledger of every ruling. The evidence is still on disk in `E:\github2\strudle\.superpowers\sdd\` (gitignored, so it never left the machine) — two runs, `2026-09-11-musical-axes` and `2026-09-11-material-and-form`, **6,739 lines of briefs, reports and ledgers plus 12,498 lines of captured review diffs**.

Then he stopped doing that, and the second half of the repo — the whole compose UI, the mixer, the CodeMirror inline-control editor, the kit browser, the examples page, the sample-pack deploy policy, `arrival` itself — was built with no plan documents at all. What replaced them was one file that grew from 5.2 KB to 31.8 KB in 48 hours.

The surprise for a technical reader is not "an agent wrote a lot of code fast." It is **which artifact turned out to be load-bearing**. The plan and spec that governed phase one are *gone* — deleted from git at `56db237` ("drop tracked docs") and no longer on disk; `docs/superpowers/plans/` and `docs/superpowers/specs/` are empty directories, and CLAUDE.md and README both still point readers at them. The thing that survived, and that the author actually maintained, is `CLAUDE.md`: 77 lines, 31,781 bytes, of which **one single bullet on line 53 is 13,224 characters / 2,058 words — 42% of the entire file in one paragraph.**

The second-strongest beat, and the one that makes the post land: **the author's own claim that every step was shippable checks out, and I verified it mechanically rather than taking his word for it** (see §2). The interesting failure mode isn't broken commits — there are none. It's that the *taste* checks, the ones that encode judgment rather than correctness, were written last and have never been satisfied (see §5).

---

## 2. Evidence from the git history

### Shape of the history

- **124 commits** on the working branch `material-and-form`; **134 on `main`** including 10 PR merge commits. *(Will go stale.)*
- **Linear. Zero merge conflicts, zero code reverts.** The only commit with "revert" in it is `e5c5e80 song revert` — 4 lines, and it reverts a *song*, not code.
- Span: `02d19e4` 2026-09-10 19:35 PDT → `7a4d1b0` 2026-09-13 00:52 PDT = **53h17m elapsed**. Summing only the gaps under 60 minutes: **~20.8 active hours**.
- Commits by day (PDT): 09-10 → 40, 09-11 → 38, 09-12 → 43, 09-13 → 3.
- **Single author** (`jonathan m borchardt`). **97 of 124 commits carry a `Co-Authored-By: Claude` trailer** (95 Fable 5.1, 1 Haiku 4.5, 1 Opus 5). The 27 without a trailer are the ones Jon typed himself, and they read like it: `more`, `updates`, `fixes`, `cleanup`, `generalk fixes`, `fiz viuz layout`, `addedd more examples`, `watn this is for desktop`, `lots of production features and added uer soud packs`. Every single untrailered commit is in the second half of the history.

### The phase boundary, with numbers

`.superpowers/sdd/` pins the SDD runs to exact commit ranges. Phase A = `02d19e4` → `8c0c32e` (09-10 19:35 → 09-11 09:44). Phase B = `903db8c` → `7a4d1b0` (09-11 16:55 → 09-13 00:52).

| | **Phase A** (spec → plan → TDD briefs → per-task review) | **Phase B** (spec + done criteria, no planning docs) |
|---|---|---|
| commits | 63 | 61 |
| active hours (gaps <60 min) | 7.1 | 13.7 |
| planning artifacts written | 1,027 lines (spec + plan, since deleted) + 6,739 lines SDD + 12,498 lines review diffs | **0** |
| source `.mjs` lines added | 1,859 | 1,651 |
| HTML lines added | 239 | 1,282 |
| CSS lines added | 0 | 384 |
| **total new source** | **2,098** | **3,317** |
| test lines added | 1,148 | 730 |
| tests added | 92 | 48 |
| **tests per 100 new source lines** | **4.4** | **1.4** |
| CLAUDE.md size at end of phase | 9,344 bytes | 31,705 bytes |
| commits Claude authored | 62 of 63 | 35 of 61 |

*(Measured by `git ls-tree` + `git show | wc -l` at `1b399cb`, `8c0c32e`, `7a4d1b0`. Will go stale.)*

The commit-message register flips at the same seam. Phase A alternates a feature and its review fix, in conventional-commit form, because that is what the SDD loop emits:

> `65af568 feat(lib): drums, bass, melody, pad with all adapter cells and invariants`
> `4aa036c fix(lib): compose bass weight/brightness on the filter instead of overwriting`
> `b849bf7 fix(lib): drum stereo baseline, hats-only choke, snare keeps the backbeat`

Phase B keeps the *good* messages when Claude writes them, but they change genre — they describe a **behaviour a user can see**, not a diff:

> `f1277ae kit menu: a play button per kit, the same two bars through each`
> `a381e89 mix card: a knob drag is a flag, not focus, so the pane and knobs rebuild when it ends`
> `4c0c306 check: name the file behind every sound:index; arrival: strings and pads restored, will bass on the sustained didgeridoo`
> `7a4d1b0 dump: closures print self-contained, so a pasted dump actually plays`

Those are acceptance criteria written in the past tense. That is the tell for how the work was actually specified.

### Was every step genuinely shippable? I checked all 124.

I walked every commit into a clean detached worktree and ran the repo's own two gates.

**Gate 1 — `node scripts/check.mjs` (evaluates every song in `songs/`, fails on syntax errors, unknown sounds, unknown axis/material keys):**
- **121 commits: pass.**
- 3 commits: the checker did not exist yet — `02d19e4`, `60fb27f`, `05a60f0`, i.e. 19:35 to 19:38 on the first evening. Three minutes.
- **0 failures.**

**Gate 2 — `node scripts/pages.mjs` (the actual GitHub Pages build that CI deploys):**
- **81 commits: pass**, producing a complete `dist/` (27 files at `89b344d`, 181 files at HEAD).
- 43 commits: `scripts/pages.mjs` did not exist yet (everything before `89b344d`, 09-11 07:27).
- **0 failures.**

So the claim holds at the commit level, verified independently of the author. **Caveat on scope:** I did not sweep `npm test` across history (old commits would need era-matching `node_modules`), and the checker needs the sample-pack `.json` maps, which I supplied from the current repo — before `89b344d` they weren't committed, so a fresh 2026-09-10 clone would have needed `npm run samples` first.

**And here is what complicates the story, from CI, which is the honest arbiter.** `.github/workflows/pages.yml` runs `npm test` on every PR and every push to main, and only deploys if it passes.

| | |
|---|---|
| CI runs total | 21 |
| success | 16 |
| **failure** | **3** |
| cancelled | 2 |

*(from `gh run list`; will go stale.)*

**Two of those three failures were on `main`, after a merge.**

1. **Run `34738360606`, push to main, merge of PR #6, 2026-09-12 21:38 PDT.** `test/golden.test.mjs` failed: `arrival.strudel` expected `d8c451b9…`, got `150d6ea2…`. The golden fingerprint of a fixture song had drifted and `test/golden.json` was stale.
2. **Run `34745045802`, push to main, merge of PR #8, 2026-09-13 00:21 PDT.** `test/pages.test.mjs` failed: `ENOENT: no such file or directory, scandir '.../samples/user/_t_pack/kick'` — a stale temp fixture from a test that ran in parallel with another that scans the same shared directory.

In both cases `deploy` was `skipped` (it `needs: test`), so **nothing broken ever reached the live site.** Both were fixed within 13 and 16 minutes. That is the precise, defensible version of "every step was shippable": *the working tree was not always green, but the gate held and the deploy never went out broken.*

And the fix for the second one is the single best commit in the repo for this post's thesis. `1099c9c "fix tests"` — 3 files, +7/−2:

- `package.json`: `"test": "node --test"` → `"node --test --test-concurrency=1"`
- `CLAUDE.md`: two new paragraphs, including the bolded rule now on line 35
- `.claude/skills/strudel/SKILL.md`: three new lines about never blind-regenerating the golden file

**When the tests broke, most of the diff went into the instructions, not the code.** That is the whole method in one commit.

### Long gaps (>60 min) between commits

`7.0h` before `89b344d`; `7.2h` before `903db8c`; `7.6h` before `866cc97` — those three are sleep. The rest are short: `1.5h`, `1.0h`, `4.2h`, `2.2h`, `1.7h`.

### The pull requests

This is the numeric spine of "I never read the code."

| PR | title | +/− | files | comments | reviews | open → merge |
|---|---|---|---|---|---|---|
| 1 | Material and form | +905/−356 | 36 | 0 | 0 | **1m38s** |
| 2 | Material and form | **+2678/−420** | **127** | 0 | 0 | **3m08s** |
| 3 | added mixer | +1051/−306 | 20 | 0 | 0 | **1m31s** |
| 4 | review fixes: dedupe helpers, native datalist for pills | +135/−196 | 13 | 0 | 0 | 25m11s |
| 5 | Material and form | +1336/−138 | 28 | 0 | 0 | 2m01s |
| 6 | Material and form | +638/−66 | 20 | 0 | 0 | 2m56s |
| 7 | Material and form: lint pass, headless render, form-generator fix | +926/−149 | 36 | 0 | 0 | 7m11s |
| 8 | make files playable on stridle | +26/−3 | 5 | 0 | 0 | 1m55s |
| 9 | fix tests | +7/−2 | 3 | 0 | 0 | **11s** |
| 10 | dump: closures print self-contained… | +32/−3 | 2 | 0 | 0 | 5m05s |

**10 pull requests. 7,734 lines added, 1,638 removed. Zero review comments. Zero reviews. Median time to merge: about two minutes — which is roughly how long CI takes.** The two outliers (PR 7 at 7m, PR 10 at 5m) are the ones where CI failed first and had to be re-run; PR 4's 25 minutes is the author being away. The gate on merging was never a human reading the diff; it was a green check. *(Will go stale.)*

---

## 3. The testing claim, examined honestly

### What exists

**20 test files, 142 tests, 1,892 lines.** `node:test` only — no Jest, no Vitest, no assertion library, no mocks, no fixtures framework. One dev dependency in the whole repo (`playwright-core`), and it is not a test runner — it is the headless-browser driver for `npm run render`.

Measured on this machine (`npm test`, `--test-concurrency=1`):

```
142 tests, 0 failures, duration_ms 67044   →  67 seconds wall clock
```

Per-file wall clock (each includes ~0.55 s of node start + Strudel scope boot; scope boot alone is 184 ms):

| file | ms | tests | | file | ms | tests |
|---|---|---|---|---|---|---|
| examples | 15851 | 3 | | server | 979 | 9 |
| dump | 8226 | 6 | | song | 964 | 11 |
| check | 8010 | 13 | | harmony | 804 | 7 |
| gen | 7062 | 2 | | analyze | 789 | 10 |
| golden | 6106 | 1 | | axes | 748 | 4 |
| layers | 3522 | 25 | | vocab | 698 | 8 |
| pages | 2149 | 1 | | cm | 532 | 11 |
| resolve | 1780 | 14 | | compose | 443 | 8 |
| lint | 1390 | 2 | | grid | 339 | 3 |
| mp3 | 1013 | 2 | | samples | 327 | 1 |

**Twelve of twenty files finish in under 1.1 seconds.** The five slow ones (examples, dump, check, gen, golden) are slow for one reason: they boot Strudel in Node and *query actual event streams over many cycles*. They are slow because they make music, not because they are badly written.

### Ratios

| | lines |
|---|---|
| `lib/*.mjs` | 1,416 |
| `web/*.mjs` | 1,059 |
| `scripts/*.mjs` | 820 |
| `gen/*.mjs` | 97 |
| `server.mjs` | 174 |
| **source `.mjs` subtotal** | **3,566** |
| all `*.html` (incl. **index.html 1,242**) | 1,542 |
| `web/strudel.css` | 384 |
| **source total** | **5,492** |
| **`test/*.mjs`** | **1,892** |

**Test : source = 1,892 : 5,492 = 0.34.** Counting `.mjs` only it flatters to 0.53. *(Working-tree numbers; 6 files are uncommitted. Will go stale.)*

### Is "I invested way less in testing" accurate?

**Yes, and it is measurable.** On new code written:

- Phase A: 1,148 test lines against 2,098 source lines → **ratio 0.55**, **4.4 tests per 100 source lines**
- Phase B: 730 test lines against 3,317 source lines → **ratio 0.22**, **1.4 tests per 100 source lines**

**A 2.5× drop in test-to-source ratio and a 3× drop in tests per line, across the seam where the planning ceremony stopped.**

### The precise, defensible version of the claim

> *Phase one wrote the test before the implementation, for every task. Phase two wrote one invariant that covers everything the tests would have covered individually, plus a golden fingerprint, plus a gate on the thing that actually ships — and skipped the rest.*

**What was built, four classes:**

1. **Invariants over the whole registry.** `test/layers.test.mjs` has three tests that loop over every adapter cell the system defines — there are **46 of them** (drums 11, bass 11, melody 10, pad 10, fx 4, out of 5 layers × 12 axes = 60 possible; 14 are deliberately empty):
   - `adapter at exactly 0.5 equals no adapter, for every cell`
   - `every cell moves something at 0 or at 1`
   - `fx cells: 0.5 is a no-op and the ends move something, over a riser`

   Three tests, 46 cells, and they close the language's single biggest failure mode — an axis that *looks* implemented and silently does nothing. This is the whole "less testing" thesis in one file: don't write 46 unit tests, write the property the 46 cells all have to satisfy.

2. **A golden fingerprint.** `test/golden.test.mjs` — **one test, 37 lines**. It runs `checkFile` over the four songs in `test/fixtures/`, extracts `(begin, dur, s, bank, note, gain)` per event plus `cps=… total=…`, and sha256s the lot. `test/golden.json` is four hashes. Its own comment states the promise:

   > *"Fingerprints (begin, dur, s, bank, note, gain) so value-shape changes (extra fields) don't trip it but any moved, added, removed or retuned event does."*

   This is one test standing in for a regression suite over the entire arrangement engine. It is also the test that went red on `main` (§2).

3. **"Still works" smoke over real content.** `check.test.mjs`: `every song in songs/ checks clean`. `examples.test.mjs`: `every variant evaluates with known sounds, and an A/B actually differs`. `gen.test.mjs`: `a skeleton per mood, deterministic per seed, that checks clean and has a climax`. These say *this must keep working*, not *this exact output must not drift* — and CLAUDE.md line 41 states that distinction explicitly.

4. **The ship gate.** `test/pages.test.mjs` is **one test, 68 lines**, that builds the entire static site into a temp directory and asserts 33 files exist, that no root-absolute URL appears in any shipped page, that the local-pack deploy policy applied, and — with `assert.throws` — that the build *refuses* when a deployable pack has no `license` or when a song uses a sound outside its deployed subset.

**What was skipped, and it is a lot:**

- **Zero browser tests. Zero DOM tests.** Not one file under `test/` references `document`, `window`, `jsdom`, or `playwright`. `index.html` carries **1,126 lines / 88 KB of inline JavaScript** — the transport, the offline renderer, the mixer, the arrangement strip, the undo stack, the CodeMirror host, the audition engine — and the only automated thing that ever touches it is a regex in `pages.test.mjs` checking for `'/`-prefixed URLs. It is the largest and most intricate file in the repo and the least covered.
- **Zero audio assertions in CI.** `npm run verify` (render → resolve → check → render → analyze → report) exists and works, but it needs a live browser and is never run automatically.
- **No code linter, no formatter, no typechecker.** There is no ESLint, no Prettier, no `tsconfig`, no `.editorconfig`. The only thing called "lint" in this repo lints *songs*.
- **The musical lint is not in CI** (see §5 for what that costs).
- **No CI matrix, no coverage tool, no performance test.**

### The role of speed — this is the part worth getting right

`npm test` at 67 seconds is *not* fast, and the post should not claim it is. **The fast loop is a different command.** SKILL.md line 79 is explicit:

> *"A song edit needs `npm run check` only. The moment the fix reaches `lib/`, `scripts/` or `web/`, run `npm test`…"*

Measured:

| command | time | when it runs |
|---|---|---|
| `npm run check -- songs/demo.strudel` | **1.26 s / 1.28 s** (two runs) | every song edit |
| `npm run check -- songs/arrival.strudel` (59 bars, 2,751 events) | **3.11 s** | every song edit |
| `npm run check` (all 6 songs) | 6.22 s | before a commit |
| `npm run lint` (all 6 songs) | 6.22 s | rarely |
| `npm test` (20 files, 142 tests) | **67 s** | only when `lib/ scripts/ web/ gen/ server.mjs` move |
| `npm run verify` | browser + two offline renders, minutes | by hand, never in CI |

So the defensible speed claim is: **the inner loop is a 1.3-second command that prints the entire musical state of the song, and the 67-second suite is deliberately kept off that loop.** The tiering is written down as a rule, not left to habit.

---

## 4. What "done criteria" looked like in practice

Three layers, in increasing order of how hard they are to ignore.

### Layer 1 — `CLAUDE.md`, the prose contract (31,781 bytes, 77 lines)

Not enforced by anything mechanical. There is **no `.claude/settings.json` and no hooks in this repo** — `.claude/` contains nothing but `skills/strudel/`. These are instructions that are trusted to be followed.

The two that do the most work:

> **Line 35:** *"**Any change under `lib/`, `scripts/`, `web/`, `gen/` or `server.mjs` ends with `npm test`, and a failure is fixed in the same turn** — not reported back as a question. Read the failing assertion first and decide which side is wrong: a test pinning behaviour that deliberately changed gets updated (say so in the report), a test catching a real break gets the code fixed. `test/golden.test.mjs` is the exception: never regenerate it to make it pass; a moved fixture means lib changed how songs build, so confirm only the expected fixtures moved before `UPDATE_GOLDEN=1`."*

> **Line 39:** *"Claude can't hear audio. `npm run check` is the primary verification… For measurable axes… `npm run verify` renders before/after and reports metric deltas; 'verified directionally' is the strongest claim to make."*

Note what line 35 actually forbids: *reporting the failure back as a question*. The done criterion isn't "tests pass," it's "you don't get to hand me a red build and ask what I want."

### Layer 2 — the `strudel` skill (`.claude/skills/strudel/SKILL.md`, 93 lines)

The only versioned path under `.claude/`. It is a workflow with an exit condition: **baseline → translate → resolve → check → verify → report → record why → commit**. Step 6 dictates the shape of the report (Requested / Source / Render / Result / Harmony) so that a report cannot be vague. Its Rules section is where the epistemics live:

> *"Never invent sound names; the checker fails on unknown sounds."*
> *"'Verified directionally' is the strongest claim. Never say it sounds better."*
> *"If a word is unknown to the vocabulary, pick the closest descriptors and say which you chose."*
> *"The user hears the page; you read the checker and the analyzer. Keep it that way."*

That last line is the entire division of labour in fourteen words, and it is the best single quote in the repo for this post.

Its reference file, `.claude/skills/strudel/reference/vocab.md`, is **generated from the code** by `npm run vocab` (`"vocab": "node scripts/vocab.mjs > .claude/skills/strudel/reference/vocab.md"`). The skill's own documentation cannot drift from the implementation, because it *is* the implementation printed out.

### Layer 3 — the code refuses invalid states and names both lists

This is the substitute for a human reading the diff: you cannot land a plausible-looking wrong key, because the constructor throws and tells you exactly what it would have accepted.

**`lib/song.mjs:58`** — the exact example asked for:

```js
if (!L.keys.has(k)) throw new Error(`unknown key "${k}" on ${layer} in section "${name}" (axes: ${AXIS_NAMES.join(', ')}; material: ${L.material.join(', ') || 'none'})`);
```

Run for real, with `brightnes` misspelled on a drums layer:

```
_t_bad.strudel: unknown key "brightnes" on drums in section "a" (axes: density, drive,
brightness, weight, space, articulation, aggression, groove, variation, organicness,
width, register; material: template, sounds, fill, level)
```

Both lists, in the message, at the point of failure.

Siblings, same file: `lib/song.mjs:33` (`unknown song key "${k}" (known: …)`), `:56` (`unknown layer "${layer}" in section "${name}" (known: …)`), `:7` (`meter must look like 4/4, 3/4, 6/8 or 7/8, got …`), `:36` (`give bpm or cps, not both`), `:60` — a seed that isn't a number throws with the reason in a trailing comment: *"a function would seed the PRNG with NaN, silently."*

And **three tests exist purely to pin the error messages**: `unknown layer name throws with a useful message`, `an unknown key on a layer throws, naming the layer and the section`, `a bad numeral names the section`. The repo tests its own legibility.

Other refusals:
- **`lib/resolve.mjs`** edits only numeric literals that are direct values of axis keys. Signals and hand-written Strudel expressions are **refused, never rewritten** (README Rule 8). A layer built with a spread is refused rather than silently baselined — there is a test called exactly that.
- **`scripts/pages.mjs`** refuses to deploy a sample pack with no `license`, drops any song declaring a non-shipping pack, and **re-checks every deployed song against exactly the shipped sound index, so the build fails rather than the site playing silence.**
- **README Rule 6**, the anti-bluffing rule: *"Adapter(0.5) is a no-op — literally the material's baseline, verified by test; a direction with no honest implementation is a documented no-op, not a guess."* 14 of the 60 possible cells are deliberately blank and say so.

### The observable output the criteria are read off

`npm run check` on a `song()` file prints a per-section, per-layer table with (a) onsets/cycle, (b) every axis value, (c) **those values read back as English by `describeAxes`**, the exact inverse of the words that would have set them, (d) key and chord names per section, (e) an `arc:` line of section energies with bar glyphs:

```
  [24-32) drop (climax)
    harmony Eb:major  I V7 vi IV → Eb Bb7 Cm Ab
    drums      28/cyc  density=0.9 drive=0.95 articulation=0.8 brightness=0.7
                       — very busy, very frantic, punchy, bright
  arc: intro 9 ▂ · verse 26 ▅ · lift 33.4 ▆ · drop 49 █ · outro 39.5 ▇
```

That round trip — *numbers in, English out* — is the acceptance criterion made readable. "Does the climax peak?" is answered by the last line, not by listening.

### The best worked example of a criterion being *born*, dated to the minute

```
09-12 21:05  33eb354  arrival: sustained didgeridoo and a brown rumble in place of a bark and blips
09-12 21:07  e5c5e80  song revert
09-12 21:09  4c0c306  check: name the file behind every sound:index; arrival: strings and pads restored…
```

`didgeridoo:0` is a bark; `didgeridoo:8` is a sustained note. The name says nothing about the variant, an agent that can't hear guessed wrong, the change got reverted four minutes later — and the fix was not "be more careful," it was **a new gate**: `soundFile()` in `scripts/check.mjs`, so every check now prints the actual `.wav` behind every `sound:index`:

```
  sounds
    didgeridoo:8             Didgeridoo1_Sus2_Main.wav (12 variants)
    timpani:0                Timpani1_Hit_v2_rr1_Sum.wav (30 variants)
    piano:0                  pitched, 29 samples A0..C8
    sus_cymbal:0             susCymb1_bow_13.wav (25 variants)
```

Four minutes from a mistake to a permanent check for its entire class. The test is named `the check names the file behind each sound:index, so a bark is not mistaken for a drone`.

---

## 5. The cost of never reading the code

I went looking for this deliberately. Some of it is smaller than expected and one piece of it is worse.

### `CLAUDE.md` is enormous, and its size is the finding

- **31,781 bytes in 77 lines.** Grew from 5,207 bytes (`56db237`, 09-11 00:23) across **37 commits**, and **never once shrank** except an 11-byte correction at `e7de3fd`.
- Source grew from 103 KB to 430 KB over the same window. **CLAUDE.md grew 6.1×, the code grew 4.2×.** The document outpaced the thing it documents.
- **Line 53 is 13,224 characters — 2,058 words — 42% of the file in a single bullet.** It describes the Compose page in one unbroken paragraph: the mix card, the arrangement strip, the CodeMirror panes, the inline-control schema, the materials panel, the audition path, the preview-level slider, the undo stack, solo/mute/AB, the harmony row, the share link, the transitions. Lines 47, 48, 50 and 52 are 2,427 / 1,390 / 1,255 / 1,014 characters.

What its existence and size tell us: **CLAUDE.md is the code review.** It is the only artifact where the author's understanding of the system lives, and it grew every time a feature landed because that is *where the reading happened*. Nobody writes a 2,058-word sentence for a human. It exists to be loaded into a context window.

### `ponytail:` markers — five of them, all naming a real ceiling

```
index.html:258       // ponytail: set membership, not a diff; a moved line does not flash…
index.html:1162      // ponytail: global WeakRef patch; drop it when superdough keys its pools by context.
lib/layers.mjs:360   // ponytail: the duck is sampled once per chord hap (continuous signals collapse per hap)…
lib/layers.mjs:364   // ponytail: a slow +/-15 cent drift is the chorus a lone saw lacks without adding voices…
lib/packs.mjs:13     // ponytail: hardcoded synth list; registerSynthSounds needs a browser AudioContext…
web/mp3.mjs:16       // ponytail: whole file in memory; fine for song-length renders
```

Plus one commit named for it: `2fa7a2b section pane: ponytail cuts, and the pick menu's preview level only where rows can be heard`. There are **zero** `TODO`, `FIXME`, `HACK` or `XXX` comments in the entire repo.

### Three monkey-patches of other people's code, and the author knows about none of them

1. **`index.html:1163` replaces a JavaScript builtin globally:**
   ```js
   globalThis.WeakRef = class extends WeakRef { deref() { const n = super.deref(); return n instanceof AudioNode && n.context !== strudel.getAudioContext() ? undefined : n; } };
   ```
   Because superdough pools audio nodes across contexts by `WeakRef`, and the offline renderer would otherwise be handed live-context nodes. The line after it installs a `window.onerror` handler that **swallows a specific cross-context exception** rather than fixing it — with three lines of comment explaining why that is safe.
2. **`lib/dump.mjs`** wraps *every* Strudel core function and every `Pattern` prototype method for the duration of one evaluation, records the call chain behind each pattern, and restores the originals afterwards. It contains this, to recover which arithmetic operator an anonymous closure is:
   ```js
   const OPS = { add: 10, sub: 4, mul: 21, div: 7 / 3, mod: 1, pow: 343, set: 3, keep: 7 };
   const opName = (fn) => { try { const r = fn(7)(3); return Object.keys(OPS).find((k) => OPS[k] === r); } catch { return undefined; } };
   ```
   It probes the closure with 7 and 3 and looks the answer up in a table. It works, and there is a test for it (`assert.match(out, /\.add\(note\(0\)\)/); // non-configurable operator getter, recovered by probing`).
3. **`scripts/esm-fix.mjs`** installs a `node:module` `registerHooks` resolve hook to redirect `@kabelsalat/web` to its ESM build, because it ships no `exports` map.

A code review would have had a conversation about each of these. None happened. All three are correct, documented, and tested — but the author does not know they are there.

### The over-built bit

**The kit browser.** `lib/kits.json` is **15.5 KB describing 58 vintage drum machines**, each with a `label`, a `kind` and an `about` paragraph:

```json
{"label":"Crunchy 12-bit Linn punch, dry and tight","kind":"Akai-era Linn samples (12-bit, late 80s)",
 "about":"Punchy, dry, slightly crunchy 12-bit Linn drums. Mid-forward snare, tight kick…"}
```

`scripts/kiticons.mjs` (103 lines) then reads those descriptions and generates **58 SVG glyphs** plus a **16-file legend** by picking texture, weight, colour and accent from words in the prose. All of it feeds one dropdown, in a project whose entire published catalogue is six songs — and the legend explaining the 16 legend glyphs is documented in `docs/superpowers/kits.md`, **which does not exist** (see below). Landed in one commit: `0b7dbc7 added comments and kits`, 84 files.

For contrast: the *actual language* is tiny. `lib/descriptors.json` is **25 words**, `lib/overlays.json` is **8**, `lib/harmony.json` is 2 groups — 2.3 KB of JSON for the entire vocabulary the system exists to serve.

### Stale documentation that a reader of the code would have caught

- **`docs/superpowers/plans/` and `docs/superpowers/specs/` are empty directories.** The 876-line plan and 151-line spec that governed phase one were committed in `02d19e4`, untracked in `56db237` ("drop tracked docs"), and subsequently deleted from disk. Yet **CLAUDE.md line 76** still says *"Design spec and plan: `docs/superpowers/`"* and **README line 176** says *"The full design spec and plan live in `docs/superpowers/`."* Both point at nothing, and on a fresh clone they point at nothing that could ever exist.
- **CLAUDE.md line 47 references `docs/superpowers/kits.md` twice** (as the kit-icon legend and the long-form kit descriptions). It does not exist.

### Things that leaked in and were caught later, not sooner

- **`songs/machine-bak.strudel`** — a 95-line hand-backup file — was committed at `7e6a95a "more"` (09-11 00:25) and lived in the repo for **16½ hours** before `66f09ff "code review"` deleted it along with 196 lines of other cruft across 23 files. A human reading that diff would have caught it in seconds.
- **`songs/nocturne.strudel`** — a song that got six commits of work across two days (`2a2ad98`, `569c481`, `ae1352e`, `fe37c10`, `b2a5aca`) — was deleted at `03a4107 "general additions"`, a human commit that removed 173 lines. In the same commit, `test/golden.json` was hand-edited to drop nocturne's line and **left a trailing comma**, making it invalid JSON, fixed five minutes later by `ebb95d7 "test fix"` — a one-character change.
- **Nine exported symbols are referenced in no other file**: `ACTIVE_FRAME_DB` (lib/analyze), `fromPositions` (lib/grid), `fmtNum` (web/cm-controls), `labelsOf` (web/cm-widgets), `lbh` / `said` / `deltasOf` (web/examples), `soundFile` (scripts/check — used in-file), `tagsOf` (scripts/kiticons). Exported for testability, then not tested. That is nine out of ~150 exports, which is *remarkably little* dead code.

### The worst finding: the taste linter has never passed

`scripts/lint.mjs` is the repo's most interesting artifact conceptually — it turns judgment calls into static analysis over the check table: *no climax*, *the climax isn't the peak*, *two consecutive sections are identical*, *raw saws sharing a section*, *a melody or bass with no written notes*, *axes outside 0..1*. It was added **last** (`0b7dbc7`, 09-11 20:01) and hardened at `f21b34d` (09-12 23:24).

**It is not in CI.** `pages.yml` runs `npm test` and `npm run pages`, nothing else. `test/lint.test.mjs` feeds it hand-built results, not real songs. Run it against the actual catalogue today:

| song | errors | warnings |
|---|---|---|
| arc | 0 | **7** |
| arrival | 0 | **0 — clean** |
| demo | 0 | **3** |
| euclid | 0 | 0 (plain Strudel, no sections: vacuously clean) |
| machine | 0 | **15** |
| ping | 0 | **4** |

**29 outstanding warnings across four songs.** Repeatedly: `bass plays the seeded line: write its notes (the hook) in mini-notation` and `bass, pad: raw saws in one section are mud, give all but one a pack instrument` — both of which are rules the skill's own "material first" section spends five paragraphs on. `ping` has `no section has role climax: the arc has no peak`.

The only song that passes its own taste linter is `arrival`, which was written *after* the linter existed. **That is the real cost of never reading the code: the correctness gates are airtight and mechanically enforced, and the judgment gates were written down, then never run.**

### What did *not* go wrong, which is worth saying

- **No duplication.** A scan for repeated top-level identifiers across `lib/`, `web/`, `scripts/`, `server.mjs` and `index.html` found only trivial per-file helpers (`num`, `opt`, `json`, `fmt`) — no copy-pasted logic.
- **No dependency sprawl.** 12 runtime dependencies, 1 dev dependency, **29 packages total in `node_modules`, 35 MB**. No bundler, no framework, no build step, no test framework, no linter. For a web app with a CodeMirror 6 editor, a live-coding audio engine, an offline renderer and an MP3 encoder, that is extraordinarily lean — and it is lean because CLAUDE.md line 5 says *"Node stdlib only (plus `acorn`… `@breezystack/lamejs`… and `playwright-core` as a dev dependency), no build step, no bundler"* and nothing ever argued with it.
- **The code reads like nothing a human writes.** Average line length across `lib/`, `web/`, `scripts/`: **60–90 characters** with maxima of 951 (`index.html`), 666 (`web/examples.mjs`), 348 (`lib/analyze.mjs`). **17% of non-blank lines are comments** (430 whole-line, 117 trailing, in 3,506 source lines). Extremely dense, semicolon-chained, heavily annotated. This is code optimised for being *loaded*, not for being *skimmed* — which is itself evidence for the thesis.

---

## 6. Factual corrections to the author's framing

**"i didnt use superpowers" — not true for the first half of the repo, and the evidence is still on his disk.**

`E:\github2\strudle\.superpowers\sdd\` holds two complete subagent-driven-development runs:

- `2026-09-11-musical-axes` — 9 tasks, covering commits `1b399cb..b964f7f` (09-10 20:27 → 22:37)
- `2026-09-11-material-and-form` — 11 tasks, covering commits `89b344d..8c0c32e` (09-11 07:43 → 09:44)

Between them: 4,026 + 2,713 = **6,739 lines of briefs, reports, ledgers and final-findings**, plus **12,498 lines of captured review diffs** (35 `review-<a>..<b>.diff` files). The `progress.md` ledgers contain a preflight conflict-scan table, explicit "Ruling:" lines with cost-if-wrong analysis, and per-task fix rounds ("fix round 1/5 (3 addressed, 0 open)"). And the very first commit of the whole project, `02d19e4 "chore: scaffold strudel harness with demo song"`, contained **almost no code** — 1,854 insertions of which 876 were `docs/superpowers/plans/2026-09-10-strudel-harness.md`, 151 were the design spec, and 798 were `package-lock.json`.

Two further corrections in the same area:

**"i didnt use... TDD ritual" — phase one was TDD, literally, with the test source pre-written in the brief.** `task-5-brief.md` reads:

> `- [ ] **Step 1: Write the failing tests**` … *(28 lines of verbatim test source)* …
> `- [ ] **Step 2: Run to verify they fail**` — *"Run: `node --test test/layers.test.mjs` — FAIL (3 pad onsets, identical cycles)."*
> `- [ ] **Step 3: Implement**`

The branch he is still working on — `material-and-form` — is *named after* the second SDD run.

**Suggested reframe for the post, which is truer and better:** *he did the full ceremony first, and then stopped* — and the repo lets you measure exactly what that cost and what it bought. The claim "I didn't use superpowers" is accurate about the second half and about how he now remembers the project, which is itself interesting.

---

**"i never looked at any code" — literally unverifiable, but every mechanical proxy supports it, and one thing needs qualifying.**

Supporting: 10 PRs, **0 review comments, 0 reviews**, median merge time ~2 minutes including one PR of +2,678/−420 across 127 files merged in 3m08s.

Qualifying: he *commissioned* reviews, he just wasn't the reviewer. Four commits are named for it — `66f09ff "code review"` (23 files, −196 lines, deleted the stray `machine-bak.strudel`), `8eab386 "pr review fixes"`, `866cc97 "review fixes"`, `f21b34d "review: form skeleton at the length asked…"` — and phase one captured 35 review diffs. The accurate sentence is **"I never read the diffs,"** not "nothing was reviewed."

---

**"i gave it descriptions of what i wanted done and criteria for what done looks like" — correct, and the durable form of it is `CLAUDE.md` + `SKILL.md`, not any per-task document.** No spec files survive from phase two; the specs were conversation turns. What persisted are the two instruction files, which is why they grew 6× while the code grew 4×.

---

**"every step was shippable" — verified true at the commit level, with two qualifications.** (a) The gates didn't exist for the first three minutes (`check`) and the first 12 hours (`pages`) — GitHub Pages deployment only arrived at `89b344d`, 09-11 07:27 PDT, and the repo itself was only created on GitHub nine minutes before that. (b) `main` went red in CI twice after a merge (§2). Nothing broken ever deployed, because `deploy: needs: test`.

---

**"i invested way less on testing" — true and quantified (§3).** But the natural reading — "so the code is less tested" — needs the caveat that *the coverage moved*, it didn't just shrink: 3 invariants over 46 cells, 1 fingerprint over 4 songs, and 1 test over the entire deployable site.

---

**"faster tests is true though" — true, but not about `npm test`,** which takes 67 seconds. The fast thing is `npm run check` at 1.3 seconds, and the speed comes from the loop being *tiered by rule* (SKILL.md: "A song edit needs `npm run check` only").

---

**One small factual note on the hook:** `?play=1&section=<name>` embedding and `npm run snippets` **exist on disk but are not committed and not deployed** — they are part of the current uncommitted working tree (`README.md`, `index.html`, `package.json`, `scripts/mp3.mjs`, `web/mp3.mjs`, `test/mp3.test.mjs` modified; `scripts/snippets.mjs` untracked), added for this blog series. The live site does not have them yet.

---

## 7. Key terminology and caveats — post 1 only

Keep the language minimal; posts 2 and 3 own the vocabulary.

- **Strudel** — a live-coding music language that runs in the browser. One sentence in post 1: *you write code, it makes sound.* Posts 2 and 3 own the rest.
- **strudel-bench** — the harness in this repo: a local server, a compose page, a headless checker, and a small declarative language on top of Strudel. Not a benchmark suite, despite the name.
- **A song file** (`songs/*.strudel`) — either plain Strudel or a `song({ … }, [ section(…), … ])` call. Post 1 only needs: *songs are source files in the repo, and the build checks them.*
- **`npm run check`** — the headless checker. Evaluates a song in Node, prints its event stream and a per-section state table, fails on unknown sounds and unknown keys. **This is the thing that replaced the author reading code.** Central to post 1.
- **Cycle / bar** — one cycle = one bar in this repo. `arrival` is 59 bars at 64 BPM. Needed only to say how long a clip is.
- **The golden file** — `test/golden.json`, four sha256 hashes of four songs' complete event streams.
- **SDD** — superpowers' subagent-driven development: spec → plan → numbered task briefs → implement → review → ledger. Name it once when introducing phase one.

Caveats to carry:

1. **Time-bounded.** The whole project is 2026-09-10 to 2026-09-13. Every count in this brief will drift.
2. **`.superpowers/` and `docs/` are gitignored.** The phase-one evidence exists on the author's machine and **nowhere in the public repo**. If the post quotes the SDD ledgers, say where they live; a reader cloning the repo will not find them.
3. **The design spec and plan are gone entirely** — not just untracked, deleted. Anything quoted from them must come from the surviving ledgers.
4. **Claude wrote `blog-ideas/ideas.md`.** The 16 blog pitches in that file are the agent's framings of its own work, not independently-checked claims. Useful as a map of the surface area; not a source.
5. **`nocturne` no longer exists** as a song, despite appearing in commit messages the post may quote.
6. **Correlation, not controlled experiment.** Phase B built more surface per hour than phase A — but phase B also started from a finished engine, and a lot of it is UI rather than a semantics layer. The honest claim is *he changed method and shipped more, with fewer tests, and the ship gates held*, not *the ceremony was worthless*.

---

## 8. Proposed visuals (pick 3 of 4)

### V1 — **Two ways to build the same repo** (quantitative; the headline)

Grouped comparison, phase A vs phase B. All figures measured; units given.

| metric | unit | Phase A `02d19e4`→`8c0c32e` | Phase B `903db8c`→`7a4d1b0` |
|---|---|---|---|
| wall-clock span | h | 14.1 | 31.9 |
| active hours (inter-commit gaps < 60 min, summed) | h | **7.1** | **13.7** |
| commits | count | 63 | 61 |
| commits with a `Co-Authored-By: Claude` trailer | count | 62 | 35 |
| planning documents written | lines | **20,264** (1,027 spec+plan, 6,739 SDD briefs/reports/ledgers, 12,498 review diffs) | **0** |
| source `.mjs` added | lines | 1,859 | 1,651 |
| HTML added | lines | 239 | 1,282 |
| CSS added | lines | 0 | 384 |
| **total source added** | lines | **2,098** | **3,317** |
| test lines added | lines | 1,148 | 730 |
| tests added | count | 92 | 48 |
| **test lines per source line** | ratio | **0.55** | **0.22** |
| **tests per 100 source lines** | ratio | **4.4** | **1.4** |
| CLAUDE.md at end of phase | bytes | 9,344 | 31,705 |

Design note: the two bars that matter are *planning lines written* (20,264 vs 0) and *tests per 100 source lines* (4.4 vs 1.4). Everything else is context. Don't normalise per hour — phase B started from a finished engine and that would overclaim.

### V2 — **The feedback loop is tiered, and the tiers are 50× apart** (quantitative)

Horizontal log-scale bars, seconds, all measured on this machine:

| command | seconds | how often it runs | what it promises |
|---|---|---|---|
| `npm run check -- songs/demo.strudel` | **1.27** (1.26, 1.28) | every song edit | evaluates, no unknown sounds/keys, prints full musical state |
| `npm run check -- songs/arrival.strudel` | **3.11** | every song edit | same, 59 bars / 2,751 events |
| `npm run check` (6 songs) | **6.22** | before a commit | all songs |
| `npm run lint` (6 songs) | **6.22** | rarely; **never in CI** | taste rules over the check table |
| `npm test` (20 files, 142 tests) | **67.0** | only when `lib/ scripts/ web/ gen/ server.mjs` change | the rule is written in CLAUDE.md line 35 |
| `npm run verify` | needs a browser + 2 offline renders; minutes | by hand; **never in CI** | measured before/after audio deltas |
| a human presses Play | — | the only thing that hears it | — |

Optional inset: the per-file suite breakdown showing **12 of 20 files under 1.1 s**, and the 5 slow ones (examples 15.85 s / dump 8.23 / check 8.01 / gen 7.06 / golden 6.11) being exactly the files that evaluate real music. Full per-file data is in §3.

### V3 — **Every step shippable: 124 commits, two gates, verified** (quantitative timeline)

A commit timeline, 2026-09-10 19:35 → 2026-09-13 00:52 PDT, one tick per commit, with four overlaid tracks:

- **Track 1, checker:** `node scripts/check.mjs` exit status at each commit. **121 pass / 3 n-a (the checker did not exist for the first 3 minutes) / 0 fail.**
- **Track 2, deploy build:** `node scripts/pages.mjs` exit status. **81 pass / 43 n-a (before `89b344d`, 09-11 07:27) / 0 fail.** Dist file count rises 27 → 181.
- **Track 3, merges to main:** 10 PR merge markers at (PDT) 09-11 17:40, 09-11 22:35, 09-12 00:04, 09-12 08:06, 09-12 18:54, 09-12 21:38, 09-12 23:39, 09-13 00:21, 09-13 00:35, 09-13 00:58.
- **Track 4, CI:** 21 runs, **16 pass / 2 cancelled / 3 fail**. Mark the two red-on-main moments: **09-12 21:38** (golden fingerprint drift on `arrival`, deploy skipped, fixed by 23:14) and **09-13 00:21** (`pages.test.mjs` ENOENT on a leaked `_t_pack` fixture, deploy skipped, fixed 00:34 by `1099c9c`).

Also worth marking: the phase boundary at 09-11 09:44/16:55, the three sleep gaps (7.0 h, 7.2 h, 7.6 h), and the single `song revert` at 09-12 21:07.

The caption writes itself: *two gates, 124 commits, zero failures — and CI still caught main twice.*

### V4 — **What replaced reading the diff** (conceptual; cycle diagram)

Two concentric loops with one gap, drawn as a cycle.

**Inner loop (seconds, runs constantly):**
`ask, in English, with a done criterion` → `agent edits` → `npm run check` prints the state table → either the code **throws and names both accepted lists** (`unknown key "brightnes" on drums in section "a" (axes: …; material: …)`) or the table reads back in words (`density=0.9 drive=0.95 — very busy, very frantic, punchy`) → `agent reports, in the shape SKILL.md dictates` → back to the ask.

**Outer loop (minutes, runs on structural change):**
`npm test` (142 tests: 3 invariants over 46 cells, 1 golden fingerprint over 4 songs, 1 whole-site build gate) → `commit` (the musical change as the message) → `PR` → `CI: npm test → npm run pages` → **deploy to GitHub Pages**.

**Two arrows to draw explicitly, because they are the point:**

- A dotted arrow labelled **"the human reads the diff"** crossing from the outer loop to the person — **drawn cut, with an X**. Annotate: *10 PRs, 0 review comments, median 2 minutes to merge.*
- A solid arrow the machine cannot draw: **"the human presses Play."** Annotate with SKILL.md's line: *"The user hears the page; you read the checker and the analyzer. Keep it that way."*

*(Alternative if a fourth quantitative visual is wanted instead: CLAUDE.md's byte size against total source bytes over 37 commits — 5,207 → 31,705 bytes vs 103,137 → 430,167 bytes; the full 37-point series is in my working notes and can be regenerated with `git show <hash>:CLAUDE.md | wc -c`. The single number that carries it: **line 53 is 13,224 characters, 42% of the file, in one bullet.**)*

---

## 9. Proposed audio clips

`arrival` runs at **64 BPM in 4/4 → cps 0.2667 → 3.75 seconds per bar**, so `cycles: 2` = 7.5 s and `cycles: 4` = 15 s. Sections: `void` 1 bar, `signal` 8, `approach` 8, `contact` 8 (climax), `will` 8, `plea` 8, `threshold` 12 (climax), `after` 6 — 59 bars total.

Run with `npm run headless` up first (the page must be open for `/render`), then `npm run snippets -- clips.json`. Defaults are 64 kbps mono.

```json
[
  { "out": "never-read-the-code/hook-arrival-contact",  "song": "arrival.strudel", "section": "contact", "cycles": 4 },
  { "out": "never-read-the-code/arrival-contact-drums", "song": "arrival.strudel", "section": "contact", "layer": "drums", "cycles": 2 },
  { "out": "never-read-the-code/euclid-day-one",        "song": "euclid.strudel",  "cycles": 4 },
  { "out": "never-read-the-code/demo-drop",             "song": "demo.strudel",    "section": "drop", "cycles": 4 }
]
```

**1. `hook-arrival-contact` — the opener. 4 bars, 15 s.**
`contact` is arrival's first climax (bars 17–25): 11 parts sounding at once — timpani, organ pedal, bowed psaltery strings, piano, handchimes, tubular bells, harp, recorder, choir, and an `fx.impact` on the downbeat. It is the loudest, densest thing the system makes and it grabs immediately. Use this as the thing playing when the reader lands. *(If you want atmosphere over impact, `{"section": "void", "cycles": 1}` is a single 3.75-second bar of organ and bowed strings — but for a hook, take `contact`.)*

**2. `arrival-contact-drums` — one part, alone. 2 bars, 7.5 s.**
The same eight bars with only the drums part: timpani as kick, a low rope snare, triangles as hats, a bowed suspended cymbal. This is not a musical point, it is a **systems** point, and it belongs in post 1: *the addressable unit in this harness is not "the song", it is `<song> × <section> × <part>`.* That is exactly what `npm run render`, `npm run verify`, the golden fingerprint and the mixer's solo all operate on, and it is why a 1.3-second check can say something useful. Play it right after the full climax so the reader hears the surface being sliced.

**3. `euclid-day-one` — 4 cycles at cps 0.533, 7.5 s. The best single piece of evidence in the post.**
`songs/euclid.strudel` was written by `gen/euclid.mjs --seed=3` and committed at **`9f843fe`, 2026-09-10 19:39 PDT — four minutes into the project.** It has **never been touched since**: one commit in its entire history. In the 123 commits that followed, the declarative language was invented, rewritten twice, given harmony, meter, materials and an fx layer, and the whole compose UI was built on top — and this file still checks clean (72 events in 4 cycles) and still plays. Put it under the "every step was shippable" section: *this is what the fourth minute of the project sounds like, and it still runs.* Three bars of 808 through a Euclidean `bd(3,8)` / `sd(2,8,1)` / `hh(5,8)` with a sawtooth line in E phrygian — deliberately crude next to `arrival`, which is the point.

**4. `demo-drop` — 4 bars, 8 s (cps 0.5 → 2 s/bar). Optional fourth.**
`demo.strudel` is the scaffold song, present since commit 1, and it was *rewritten* into the `song()` language rather than preserved — so it's the counterpart to euclid: the file that survived by changing. Its `drop` section is the climax the lint rules were written about, and it is the file every `npm run check` example in the post will show. Use it if you quote the check table; skip it if the post is already long.

**Also tell the reader (or use instead of clip 1):** once the current working tree is committed, the compose page supports `?play=1&section=<name>` as query parameters, so the post can embed the live editor pinned to a section and already playing — `index.html?play=1&section=contact#arrival.strudel` — behind a click-to-load teaser. That turns the hook from a recording into the actual instrument. **Caveat: `?play=1&section=` and `npm run snippets` are uncommitted and not yet deployed; the live site does not have them today.**
