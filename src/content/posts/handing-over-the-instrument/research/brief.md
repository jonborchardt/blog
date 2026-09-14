# Domain brief: post 4, `handing-over-the-instrument`

Repo: `E:\github2\strudle` (project name `strudel-bench`; the folder name is a typo, never write "strudle" in the post). All numbers below were produced by running the tools, not read off docs. Where docs and code disagreed, I say so.

Note: `songs/machine-v1.strudel` is a file created during this investigation (first-pass machine, reconstructed from git). Keep it if you want the clips; it is untracked.

---

## 1. The strongest story for post 4

**The outline's frame is "an agent uses an instrument built for a human". The evidence says something sharper: the human is the only sensor in the system, and every interesting failure is a sensor-reading problem, not a generation problem.**

Three findings carry the post:

**(a) The first pass was not the problem. Reading the first pass was.** `arrival` took eight rounds of feedback over two hours. Its energy arc after eight rounds is *identical* to the first pass:

```
first pass (f88eca0):  void 1.7 · signal 5.6 · approach 25.2 · contact 49.4 · will 13.7 · plea 36.6 · threshold 65.3 · after 10
final     (HEAD):      void 1.7 · signal 5.6 · approach 25.2 · contact 49.4 · will 13.7 · plea 36.6 · threshold 65.3 · after 9.7
```

Eight sections, same eight sections. 132 lines to 133 lines. Every one of the eight rounds was about *sound*: which sample index a name resolves to, whether one reverb size is shared, whether vibrato is applied to sampled instruments, whether a `space` value above .5 silently routes to a delay line. The agent got the architecture right on the first try and the timbre wrong for two hours, because architecture is something it can read and timbre is not.

**(b) The single most consequential piece of feedback in the whole repo is five words.** `"the music sounds flat and simplistic"` appears verbatim as the `ask` in **four** notes files (`arc`, `demo`, `machine`, and the now-deleted `nocturne`). It produced commit `b2a5aca`, which touched `lib/layers.mjs`, four songs, four notes files and the golden fixtures, and then propagated upward into the agent's own instructions: `.claude/skills/strudel/SKILL.md` grew a section titled **"Flat, thin, simplistic, boring, aimless: material first, not axes"**, and six hours later `scripts/lint.mjs` turned those words into static checks. One human sentence became a rule the machine now enforces on itself. That arc, ear to prose rule to linter, is the post's best single beat.

**(c) The instrument that stands in for ears is honest to the point of being unflattering.** Seven `npm run verify` runs produced 15 axis verdicts: **7 verified, 5 NOT verified, 2 code-checked, 1 not applicable**. The failures are not bugs; the tool is refusing to claim a move it cannot see.

**Claims in the outline that are weak:**

- *"The first pass is always competent and generic. Everything good came from round two onward."* Half wrong, and the interesting half. See section 4: it's true of the *hooks* and false of the *form*, and the two songs split in opposite directions.
- *"The agent cannot hear. What stands in for ears: the render/analyze/verify chain."* Incomplete and misleading: the render half of that chain **requires a browser page to be open**. Without it the agent has no ears *and* no instrument; it falls back to `npm run check` alone.
- *"Verified directionally is the strongest claim it will make."* True, but the post should say what it means operationally: it is a sign test with a 2% relative-change floor on one metric of one layer of one section rendered in isolation. It says nothing about the mix.
- *"Provenance: the original prompt plus, per request, section / layer / axis / from-to / why."* That is the schema. The actual data: across all four notes files, **43 changes, of which 3 carry from/to, 23 carry a layer, and exactly 1 carries an axis**.

---

## 2. The no-ears substitute, precisely

### What actually stands in for ears (four things, in order of how often they are used)

1. **`npm run check <file>`, the event dump.** Runs Strudel in Node, evaluates the file, calls `pattern.queryArc(0, cycles)`. For a `song()` file `cycles` is the **whole song**: `demo` = 756 events over 20 cycles, `machine` = 2573 over 68, `arrival` = **2751 events over 59 cycles**. Fails the build on any sound name not in the loaded packs.
2. **The `sounds` block.** Added *because of* a listening round (see section 3, arrival round 8): the check now prints the file behind every `sound:index` it heard.
   ```
     sounds
       RolandTR909_bd:0         Bassdrum-01.wav (4 variants)
       piano:0                  pitched, 29 samples A0..C8
       glockenspiel:0           pitched, 7 samples C5..G6
   ```
   `didgeridoo:0` is a 0.7 s bark; `didgeridoo:8` is a sustained note. Nothing in the name says so.
3. **The section table and the arc line.** Per section: harmony, then per layer `onsetsPerCycle`, the literal attrs, and `describeAxes` words. Then one line of form. **Energy is not loudness.** Energy = sum over parts of `onsetsPerCycle x level`. A quiet dense section scores high.
4. **`describeAxes`, values read back as words.** **Threshold: `min = 0.15`.** An axis within 0.15 of baseline produces *no word at all*; 0.35 or more gets "very". So a nudge from .5 to .6 is invisible in the word layer: the read-back has a deadband.

### `npm run verify`, end to end

`scripts/verify.mjs songs/x.strudel <section> <layer> "<phrase>"`. Refuses `*` for either selector. Steps:

1. `ensureScope()`.
2. `planEdits(before, section, layer, phrase)`: acorn parse, vocabulary lookup, deltas. If the plan is empty, exit 2.
3. **Render "before"**: POST to the local server, which pushes an SSE job, and the open page evaluates the source, renders that one section/layer **offline, one cycle at a time**, on an `OfflineAudioContext`, and PUTs back `renders/verify.before.wav`. 44.1 kHz, stereo, 16-bit. Length = the section's own bar count. 60 s timeout. **No page means the whole chain is unavailable.**
4. Read `onsetsPerCycle` for that section/layer from `checkFile` on the unedited file (this is `drive`'s only evidence).
5. `applyEdits`, write the song, `checkFile` again. **If check fails, restore the file and exit 1.**
6. Render "after". From here any failure restores the file.
7. `analyze()` on both wavs (`lib/analyze.mjs`, no dependencies): mono sum; RMS/peak/crest; FFT 2048 with hop 1024, Hann window, frames below peak minus 40 dB skipped; spectral centroid, high ratio (4 kHz and up), low ratio (under 150 Hz), spectral flatness; mid/side width; onsets as peaks in the positive difference of a 10 ms energy envelope, threshold 25% of max flux, 30 ms minimum gap; `tail` = last-10%-of-cycle energy vs first-10%; `swing` = mean lateness of onsets nearest an off-beat eighth; `jitter` = std dev in ms of distance to the nearest sixteenth; `novelty` = 1 minus mean correlation of consecutive cycles' envelopes.
8. Verdict per requested axis.

### What "verified directionally" means operationally

```js
const m = ax.verify.metric, moved = (B[m] - A[m]) * Math.sign(d) * ax.verify.sign;
const rel = Math.abs(B[m] - A[m]) / (Math.abs(A[m]) || 1);
return `${a} ${moved > 0 && rel > 0.02 ? 'verified' : 'NOT verified'} (${m} ${A[m]} -> ${B[m]})`;
```

A **sign test with a 2% relative-magnitude floor**, on **one** scalar, over **one layer of one section rendered alone**. It is ordinal, not calibrated. Proof: `demo/drop/drums` has `onsetsPerCycle = 28` at cps .5, i.e. 14 onsets per second by construction; the analyzer measures **3.94/s**. It under-counts by 72% and still gets the direction right every time.

### Where it would be wrong

- **Compound words confound the metric.** `punchier` moves four axes at once (`articulation +.40, weight +.15, drive +.20, space -.15`). `drive` re-places the onsets, which changes the crest factor that `articulation` is judged by, so articulation reads as a *fall*.
- **A saturating axis can produce no audible change and still count.** `much brighter` on a piano layer raised the lpf from 3482 Hz to 8000 Hz, above anything the sample contains; centroid went *down* 6 Hz.
- **It measures a soloed layer.** Masking, headroom, the reverb bus: invisible. The `arrival` reverb-size bug is precisely a whole-mix artifact that *no soloed part reproduces*, and verify is structurally incapable of catching it.
- **The printed `Render:` line shows only six metrics**, but verdicts can cite `swing` and `flatness`, which never appear on that line.

### Which axes can be verified (canonical: `lib/axes.mjs`)

| Class | Axes | Metric |
|---|---|---|
| **direct** (4) | density / brightness / weight / width | onsetsPerSec / centroidHz / lowRatio / width |
| **proxy** (6) | space / articulation / aggression / groove / variation / organicness | tail / crest / flatness / swing / novelty / jitter |
| **code** (2) | drive / register | drive: onset count unchanged ("positions not measured"); register: "applied (pitch not measured in v1)" |

**Doc/code discrepancy, code wins:** both `CLAUDE.md` and `SKILL.md` say "for measurable axes (brightness, weight, width, density, space, articulation)". That is six. The code computes a verdict for all **ten** axes that carry a metric, confirmed by verifying `groove` and `aggression`, which the docs omit. The docs are behind.

### Real verbatim output (seven runs, on `songs/demo.strudel`, file restored after each)

A pass:
```
Requested:  brightness -0.60, register -0.20
Source:     drums.brightness 0.5 -> 0   lpf 800 Hz   (saturated)
Render:     crest 4.69 -> 5.19   lowRatio 0.432 -> 0.544   centroidHz 1792 -> 157   tail 0.048 -> 0.001   width 0.006 -> 0.001   onsetsPerSec 3.94 -> 1.94
Result:     brightness verified (centroidHz 1792 -> 157), register not applicable to drums (no adapter on this layer)
```

The failure the post should print (`verify -- songs/demo.strudel verse drums "punchier"`):
```
Requested:  articulation +0.40, weight +0.15, drive +0.20, space -0.15
Source:     drums.articulation 0.5 -> 0.9   clip 0.36, release 0.04 s, hats choke
            drums.weight 0.5 -> 0.65   gain x1.06
            drums.drive 0.5 -> 0.7   kick onto the pulse, snare onto the backbeat, hats accent on-beat
            drums.space 0.5 -> 0.35   room 0.00
Render:     crest 5.11 -> 4.27   lowRatio 0.518 -> 0.482   centroidHz 573 -> 449   tail 0.022 -> 0.016   width 0.002 -> 0.001   onsetsPerSec 4.06 -> 2.25
Result:     articulation NOT verified (crest 5.11 -> 4.27), weight NOT verified (lowRatio 0.518 -> 0.482), drive code-checked: onset count unchanged (15/cyc), positions not measured, space verified (tail 0.022 -> 0.016)
```

The saturation failure:
```
Requested:  brightness +0.60, register +0.10
Source:     melody.brightness 0.7 -> 1   lpf 3482 Hz -> 8000 Hz   (saturated)
            melody.register 0.5 -> 0.6   octave 4
Render:     crest 4.96 -> 5   lowRatio 0.003 -> 0.003   centroidHz 591 -> 585   tail 0.331 -> 0.33   width 0.297 -> 0.299   onsetsPerSec 3.19 -> 3.56
Result:     brightness NOT verified (centroidHz 591 -> 585), register code-checked: applied (pitch not measured in v1)
```

The two proxy axes the docs forget:
```
Requested:  groove +0.70, aggression +0.40, articulation +0.10
Source:     drums.groove 0.6 -> 1   swing 0.06 -> 0.30   (saturated)
            drums.aggression 0.5 -> 0.9   distort 0.48
            drums.articulation 0.5 -> 0.6   clip 0.84, release 0.08 s, hats choke
Result:     groove verified (swing 0.04 -> 0.28), aggression verified (flatness 0.3092 -> 0.3589), articulation NOT verified (crest 5.11 -> 4.29)
```

Single-axis controls (both clean):
```
much sparser:  density verified (onsetsPerSec 3.94 -> 1.94)
much wider:    width verified (width 0.006 -> 0.139)
```

**Tally across the seven runs: 15 verdicts, 7 verified, 5 NOT verified, 2 code-checked, 1 not applicable.** Every single-axis phrase verified. Every miss came from a compound word where one axis moved the metric another axis is judged by. That is the honest headline, and it is the post's best number.

### The refusal path

```
  verse.melody.drive: skipped (no adapter on this layer)
  verse.melody.brightness: refused, brightness is a signal here; change its range by hand
  will.melody.-: refused, uses spread (...theme); resolve edits literal values only - set the axis by hand
```

---

## 3. The evidence for the feedback loop

`songs/*.notes.json` is the record but **not the whole record**. Git is the corroborating and in places the *primary* one.

| song | notes requests | changes | commits touching the song file | session span (local) |
|---|---|---|---|---|
| `arrival` | 8 | 31 | 11 | 09-12 19:01 to 21:09 (core), tail to 23:14 |
| `machine` | 1 | 1 | 8 | 09-10 23:20 to 23:36 (shaping), plus 09-12 08:10 |
| `demo` | 3 | 7 | 6 | 09-10 to 09-12 |
| `arc` | 1 | 4 | 5 | 09-11 to 09-12 |

**Dates in the notes files are UTC**; commits are local PDT. The arrival session that ran 09-12 19:01 to 21:09 is dated `2026-09-13` in the notes. Do not present notes dates as session dates.

### `machine`: five rounds in sixteen minutes

```
23:20  machine: filthy industrial rock at 90 BPM, E minor on one chord, mechanical groove that corrodes into burnout
23:31  machine: arrive bass darker/longer, breath swells removed, breakdown2 cut, chaos replaced by a louder chorus3
23:33  machine: drop the melody from both verses (the horn); breath swells restored
23:34  machine: verses get choked bit-crushed stabs and a low feedback whistle in place of the melody
23:35  machine: verses a bit fuller (stabs louder and unbroken, whistle up, doubled scrapes in verse2)
23:36  machine: verses get a grinding 16th riff that gates open and filter-sweeps up over the section
```

Gaps: **11, 2, 1, 1, 1 minutes.** The song is 68 cycles at cps .5 = **2 min 16 s**. So the 11-minute gap is one full listen plus writing the notes; the one-minute gaps are the human re-listening to *one section* and saying one sentence. The shape of the log is the shape of the advice.

**The wrong-guess correction is visible in a diff.** The human said "I don't like the horn". Round 1 (23:31) removed `breaths`, the brown-noise swell. The human said the horn was still there. Round 2 (23:33), two minutes later, the diff does exactly two things: it deletes the `melody` layer from both verses and restores `breaths` to the texture stack. One commit that undoes the wrong guess and applies the right one.

**Caveat on the machine quotes.** `blog-ideas/making-machine-with-claude.md` quotes the human's actual sentences ("arrive is a bit too nintendo", "build is excellent", "breakdown2 isn't needed but I love the whistle"). That file is a write-up *after the fact*, not a captured transcript. The commit messages are the primary record.

### `arrival`: eight rounds, and five of them chasing one whistle

The `ask` fields in order, verbatim:

1. *"add a new song: an epic motion picture score, very large and orchestral, aliens coming to earth, not a battle but an emotional battle of will, lots of instruments, designed not chaotic, fear and hope at once"* (8 changes)
2. *"do what is right: put the orchestral percussion under the axes"* (2)
3. *"listening notes: whistle too loud in void and signal; piano not real in approach and after; too much reverb in will; end too long"* (6)
4. *"listening notes: whistle still too loud in void, intro too long, piano pops behind presses in approach, contact and threshold, piano lost sustain in will, piano should be consistent through the song"* (5)
5. *"the whistle you removed was wrong; trace what makes a sound at the void to signal edge that no single part has; piano still pops on key strike; will piano still has no sustain"* (3)
6. *"right when the song starts it whistles; only with pad and pad2 both on; is this an odd effect"* (2)
7. *"still whistles at the start; gone when a section is pinned or a pad is muted; different pad sounds still whistle"* (2)
8. *"the bark was the issue; undo the other whistle attempts; keep it from happening again"* (3)

Requests 3 to 8 are one bug report, restated six times. Read them as a debugging transcript where the human is the oscilloscope and every reading is ambiguous.

Real `why` entries worth quoting, in order of quality:

> **round 3, on the piano:** "vibrato removed for sampled sounds in `lib/layers.mjs`: the layer put a 4 Hz wobble on every melody, which is what made the steinway sound fake; only raw synths get it now"

> **round 4, on the pop:** "theme.space .75>.5: the melody layer sends anything above .5 to a delay line, and that quarter-second repeat was the pop behind each piano note"

> **round 5, the real diagnosis, and the only one that required rendering:** "reverb size .9 on every event: superdough keeps one reverb per orbit and rebuilds its impulse response whenever an event arrives with a different size, and the pads and beds carried four sizes; the rebuild swapped the reverb buffer under every piano strike and at the section edge, **which no soloed part reproduces because alone each part has one size**"

> **round 6, a wrong answer arrived at by measurement:** "strings sound psaltery_bow>dantranh_tremolo: **rendered and measured**, the void pair produced one naked 440 Hz line that each pad alone left faint and both doubled in phase. It is the sixth harmonic of the shared D2, the one partial surviving the 300 Hz lowpass. The psaltery sample map is an octave off and its strong third harmonic lands exactly there"

> **round 7, the human's own bisect pointing the wrong way:** "drone `didgeridoo:0` with note d1 to `didgeridoo:8` at its own pitch: index 0 is a 0.7 s bark, and pitched down it is a descending whoop once a bar; **pin and mute rebuild the song from the sections' layer patterns and drop the textures, which is why either hid it**"

> **round 8, the fix that outlived the bug:** "check: the single-song check now prints a sounds block naming the file behind every sound:index heard, so a bark, a bowed cymbal or a blip is visible before it is called a drone"

That sequence is the post's best narrative. The human's diagnostic hints in round 7 ("gone when a section is pinned or a pad is muted") were *actively misleading*: pin and mute are implemented by rebuilding the song from layer patterns, which drops the textures where the real culprit lived. The tool's own affordances corrupted the evidence. And round 6 shows the agent using render and analyze not to *verify* a change but to *diagnose* one, which is a use the verify script does not cover.

The round-8 fix is the pattern the post should name: **the artifact was cured by making the checker print something it had not printed before.** The bug ended as a permanent widening of what the agent can see.

**How many rounds?** `machine`: 5 feedback rounds on top of the first pass. `arrival`: 7 feedback rounds on top of the first pass (request 1 is the brief).

---

## 4. First pass versus final: test the claim, do not accept it

| | first pass `7be1f6b` | final `HEAD` |
|---|---|---|
| lines | 101 | 95 |
| sections | 12 | 11 |
| tempo | cps .375 (90 BPM) | cps .5 (120 BPM) |
| events / cycles | 2728 / 72 | 2573 / 68 |
| `npm run lint` | 0 errors, **24 warnings** | 0 errors, **15 warnings** |
| written hooks (`notes:`) | **none** | one riff, shared by 4 sections |
| arc peak | `chaos` 72 (67% above the next) | plateau: `chorus2` 44, `chorus3` 45.8 |

First-pass arc:
```
intro 2 · arrive 18 · verse 20.6 · build 28.5 · chorus 42.3 · breakdown 4 · rebuild 19 · verse2 23.5 · chorus2 43 · breakdown2 8 · chaos 72 · burnout 3
```
Final arc:
```
intro 2 · arrive 18 · verse 18 · build 28.5 · chorus 42.1 · breakdown 4 · rebuild 19 · verse2 20 · chorus2 44 · chorus3 45.8 · burnout 3
```

**Was the first pass "competent and generic"?** Split the claim:

- **Generic in material: yes, and it is measurable.** 24 lint warnings, of which 13 are `"<layer> plays the seeded line: write its notes (the hook) in mini-notation"`, i.e. every melody and bass in the song was a seeded dice roll, and 9 are `"raw saws in one section are mud"`. Every pitched layer was `sawtooth`. That is exactly the failure mode the human later named as "flat and simplistic", and the linter that counts it was written *after* the human said it.
- **Generic in form: no, not remotely.** Twelve sections with roles, a named arc in the header comment, twelve bespoke `arrange` slots of hand-written texture patterns, a burnout ending that fades a saw-swept degrade rather than resolving. The first pass is *ambitious* and *unspecific*.

What actually changed round to round:
- `melody` deleted from `verse` and `verse2` (the "horn").
- Two new plain-Strudel textures added: `stabs` (bit-crushed choked sawtooth) and `grind` (a 16th sawtooth riff gated by a descending saw and swept by a rising lpf), the three "a bit more" rounds, each adding one idea.
- `breakdown2` and `chaos` deleted; `chorus3` added in their place. The arc went from a **spike** to a **plateau**.
- One riff written into four sections, and that came from the *later* "flat and simplistic" round, not from the 16-minute session.
- Tempo 90 to 120 BPM, changed in an unrelated infrastructure commit, recorded nowhere in the notes.

**And then the counter-example.** Run the same test on `arrival` and the claim inverts: the form was final at round one and every round after was timbre. The honest version of the outline's bullet is:

> The first pass gets the shape right and the sound wrong. What rounds two onward buy you is not better ideas; it is the removal of the things that only a listener can detect.

---

## 5. The change-comments mechanism

**What the user does:**
1. Press play. The transport slider follows the clock, so its value *is* where the ear is.
2. When something bothers them, type a comment and press **Add comment here**. The comment is pinned at the exact cycle, to one decimal, and tagged with the section.
3. Each comment becomes a coloured dot on its own slider lane. A still press on a dot edits its text; a **drag re-pins it** in 0.1-cycle steps, so "actually it was a beat earlier" is a drag, not a retype.
4. **Copy request** puts one block of text on the clipboard. The card hides itself entirely when the events endpoint 404s (on GitHub Pages), because there is no agent there.

**What gets assembled:** the song path; the full section map with bar counts and cycle offsets; a fixed paragraph of instructions; the numbered notes each rendered as `cycle N.N (section, bar B of C): text`; and then, in a fenced block, the song header plus the **full source of every section anyone pinned**. Sections nobody pinned are left out.

The one non-obvious rule, and it is the good one:

```js
// A note in a section's first bar also quotes the section before it: the ear often reacts a moment late.
if (s && n.cycle - s.offset < 1 && i > 0) quoted.add(sections[i - 1].name);
```

**Real generated output** (against `songs/arrival.strudel` with two plausible notes):

```
Song: songs/arrival.strudel
Sections: void (1 bars from cycle 0), signal (4 bars from cycle 1), approach (8 bars from cycle 5), contact (8 bars from cycle 13), will (8 bars from cycle 21), plea (8 bars from cycle 29), threshold (12 bars from cycle 37), after (6 bars from cycle 49)

I listened and pinned each note at the cycle the playhead was on. A note is about what I heard there: that exact
spot, the section it is in, or what led into it just before. Please make these changes and keep everything else as it is:
1. cycle 22.4 (will, bar 2 of 8): the piano has no sustain here, every note dies at the slot end
2. cycle 37.2 (threshold, bar 1 of 12): love this, but the glockenspiel doubling sits on top of the piano

Current source of the parts around those spots:
```

Note `plea` appears in that output even though nobody pinned it. It is there because note 2 landed in `threshold`'s first bar, and the ear reacts late.

---

## 6. The provenance file

**Schema** (`songs/<name>.notes.json`):

```json
{
  "prompt": "one-line summary of the original request",
  "requests": [
    { "date": "YYYY-MM-DD",
      "ask": "the user's words",
      "changes": [
        { "section": "drop", "layer": "melody", "axis": "brightness",
          "from": 0.5, "to": 0.7, "why": "in musical terms" }
      ] }
  ]
}
```

**Two write paths.** `scripts/note.mjs` is the agent's: `parseChange` splits on whitespace, first token is `section[.layer[.axis]]`, an optional `a>b` is from/to, the rest is why. **It does not validate the section name against the song.** The page's Save is the other: mixer edits accumulate in `pending` and are appended as one request with `ask: "edits made in the mixer"`.

**Worked example** (real, `songs/demo.notes.json`):

```json
{ "date": "2026-09-12", "ask": "the music sounds flat and simplistic",
  "changes": [
    { "section": "verse", "layer": "melody", "why": "piano, follow, phrase 2, hand-written two-bar line: a contour with held notes instead of a seeded dice roll" },
    { "section": "drop",  "layer": "melody", "why": "piano hook rising to the octave; drop.melody2 glockenspiel answers on the off-beats an octave up" },
    { "section": "drop",  "layer": "bass",   "why": "notes 0 7 0 4: octave pop under the hook" } ] }
```

**What it answers six weeks later that nothing else does.** Git tells you *what* changed and *when*. The notes file tells you **which sentence the human said**, keyed to the place in the song rather than to a commit. Open `arrival` cold and the card tells you why every event carries one reverb size, and that is a landmine you would otherwise re-step on.

**But be honest about the record.** Measured across all four notes files:

- **43 changes total. 3 carry `from`/`to`. 23 carry a `layer`. Exactly 1 carries an `axis`.**
- Six of `arrival`'s `section` values do not name a real section, and two are **parser artifacts**: `"void,"` and `"approach,"`, where the agent wrote `--change "void, signal textures wind .25>.1 ..."` and the whitespace split took `void,` as the section. Those render in the page's card as phantom section headings.
- `machine` has 8 commits and **1** notes request. `arrival` has 11 commits and 8.

The structured schema degraded into a changelog because most real changes were *material*: a sample index, a sound name, a texture. Material has no from/to and often no layer. That is a genuine design finding, not a sloppiness story: the provenance schema was built for the axis system, and the axis system turned out not to be where the work was.

---

## 7. The skill

`.claude/skills/strudel/SKILL.md`, plus its generated `reference/vocab.md`.

**The seven-step workflow:** baseline (`check`), translate the request into a descriptor phrase scoped to section and layer, `resolve` dry then `--write`, `check` again (must pass), `verify` when the axes touched have a metric, report in a fixed six-line shape, `npm run note`, commit with the musical change as the message.

**The epistemic rules, and what each prevents:**

> **"Verified directionally" is the strongest claim. Never say it sounds better.**

Prevents the most likely failure: a model that cannot hear reporting an aesthetic judgement because the request was aesthetic.

> **"The user hears the page; you read the checker and the analyzer. Keep it that way."**

The last line of the file. Prevents role drift: the agent proposing to *evaluate* rather than *execute*, and the human deferring to it.

> **"A name says nothing about what its variants are.** `didgeridoo` is a bark at index 0 and a sustained note at `:8`; `sus_cymbal:0` is bowed; the Dirt `space` samples are sub-second blips. Read it before calling anything a drone, bed, pad or bass"

This rule is a scar. It exists because of arrival rounds 6 to 8, where a bark called a drone cost five rounds. It prevents naming-as-knowing.

> **"Flat, thin, simplistic, boring, aimless: material first, not axes.** Those words mean the notes and the sounds, and no axis fixes them. **Adding more layers at once adds mass, not interest.**"

Prevents the characteristic agent response to "make it better": turn every dial up.

> **"If a word is unknown to the vocabulary, pick the closest descriptors and say which you chose. If it recurs, propose adding it to `lib/descriptors.json` with explicit deltas."**

Prevents silent improvisation on vocabulary. The escalation clause is how the vocabulary grows without the agent inventing it mid-task.

> **"A song edit needs `npm run check` only. The moment the fix reaches `lib/`, `scripts/` or `web/`, run `npm test` ... including the golden fixtures, which are read (did only the fixtures you expected move?) and never blind-regenerated."**

Prevents a layer-baseline change quietly re-tuning every song in the repo, laundered through a regenerated golden file.

> **"Never invent sound names; the checker fails on unknown sounds."**

The one rule with a hard enforcement mechanism behind it, which is why it is one line.

---

## 8. Factual corrections to the outline

1. **"The agent cannot hear."** Precise version: the agent cannot hear *and cannot render*. Verify, render and snippets all require a browser page open on the local server. Node never makes a sound.
2. **"the per-section energy arc"**: it is onsets per cycle summed over parts, scaled by `level`. Not loudness.
3. **"the axis values read back as vocabulary words"**: only when a value is 0.15 or more from baseline; "very" at 0.35. The read-back has a deadband.
4. **"four direct, six proxy, two code-only"**: correct. But the docs claim only six axes are verifiable; the code verifies ten.
5. **"turns 'brighter' into a measured spectral-centroid delta"**: true, and it also turns "punchier" into four deltas of which one is confounded by another. Print the failing run; it is more interesting than the passing one.
6. **"The first pass is always competent and generic."** Replace with the split in section 4.
7. **"Everything good came from round two onward."** False on the evidence. What rounds two onward bought was correctness, not quality.
8. **"Editing by comment: pause where it bothers you"**: no pause required. Dots can also be *dragged* to re-pin. And the request quotes the previous section too when a note lands in the first bar.
9. **"Provenance: section / layer / axis / from-to / why"**: that is the schema; the data is 43 changes with 3 from/to and 1 axis.
10. **The machine post is stale on one number.** It says 90 BPM; the song is now 120 BPM, changed in an unrelated commit and recorded in no notes file.
11. **`nocturne` no longer exists.** Four songs have notes: `arc`, `arrival`, `demo`, `machine`.
12. **"one line per section, plain language, all in one message"**: supported, and the supporting number is the 11-minute gap in the machine log against a 2:16 song.

---

## 9. Terminology and caveats

Use the repo's words: **axis**, **layer**, **part**, **section**, **material**, **descriptor**, **overlay**, **modifier**, **the check table**, **the arc**, **energy**, **the dump**, **the page**, **the mixer**, **verified directionally**, **code-checked**, **not applicable**. Say **Strudel** (the language) and **strudel-bench** (this project). Never "strudle".

**Caveats:**
- Do not call the analyzer's numbers absolute. `onsetsPerSec` under-counts by 28 to 54% against the check's onsets per cycle on the same material. It is ordinal.
- Do not say verify measures "the song". It measures one layer of one section, rendered alone.
- Notes-file dates are UTC; commit times are local. They disagree by one day for evening sessions.
- `blog-ideas/making-machine-with-claude.md` is a retrospective write-up, not a transcript.

**What will go stale:**
- `scripts/snippets.mjs` is untracked and several files are uncommitted. `npm run snippets` does not exist for anyone cloning main right now.
- The six-measurable-axes claim in the docs will presumably be corrected to ten.
- `register` is "code-checked: applied (pitch not measured in v1)": the "in v1" is an explicit promise to change.
- `lib/descriptors.json` is data and grows; do not state the count.

---

## 10. Proposed visuals

**V1 — The verify chain, with two real traces through it.**
A left-to-right pipeline: song file, planEdits (acorn), render before (page, OfflineAudioContext, 44.1k stereo), write and check, render after, analyze (FFT 2048, hop 1024, -40 dB gate), verdict. Mark clearly which two stages **require a browser**. Then two labelled traces along the bottom:
- pass: `much darker` on `demo/drop/drums`, brightness, `centroidHz 1792 -> 157 Hz`, **verified**
- fail: `punchier` on `demo/verse/drums`, articulation, `crest 5.11 -> 4.27`, **NOT verified** (note: `drive` moved the onsets that crest measures)

The point of the figure is the *pair*, not the pipeline.

**V2 — First pass vs final, two energy arcs (`machine`).**
Two horizontal bar rows aligned by section, y = energy (unit: onsets per cycle summed over parts, scaled by level). Real data in section 4. Two sections vanish, one appears, and the spike at 72 becomes a plateau at 44/45.8. Annotate with the human's instruction: *"chaos is too much, make it a louder chorus2 instead."*

**V3 — The loop, with the ear boundary drawn.**
A cycle in two halves separated by a labelled line. Left (**can hear**): play the song, pin comments at the playhead, Copy request. Right (**cannot hear**): check, resolve/edit, check, verify (marked: *needs the page open*), note, commit. Two facts printed on the diagram: `machine`, 5 rounds in 16 minutes; `arrival`, 7 rounds in 2 h 08. The arrow crossing rightward carries *cycle number + section + plain sentence*; the arrow crossing leftward carries *audio*.

**V4 (optional) — The provenance gap.**
Two paired bars per song: commits touching the song file vs notes requests recorded. `arrival` 11 / 8, `machine` 8 / 1, `demo` 6 / 3, `arc` 5 / 1. Plus a stat line: *43 changes recorded, 3 with from and to, 1 with an axis.*

Skip a visual of the verdict tally: it is a sentence, not a picture.

---

## 11. Proposed audio clips

**The key clip is achievable.** Reconstruct a historical song file from git into `songs/`, start the headless page, run `npm run snippets`.

**The one gotcha:** commits before `f7f9f94` use the metadata key `out.strudle`. Without the rename the checker and renderer treat the file as plain Strudel: no sections, no `--section` support. `machine`'s first pass (`7be1f6b`) is before the rename; `arrival`'s (`f88eca0`) is after and needs nothing.

**Exact commands:**

```bash
cd E:/github2/strudle
git show 7be1f6b:songs/machine.strudel | sed 's/\.strudle/.strudel/g' > songs/machine-v1.strudel
node scripts/check.mjs songs/machine-v1.strudel

cp songs/demo.strudel songs/punchier0.strudel
cp songs/demo.strudel songs/punchier1.strudel
node scripts/resolve.mjs songs/punchier1.strudel verse drums "punchier" --write
```

**Manifest, six clips:**

```json
[
  { "out": "handing-over-the-instrument/machine-v1-verse",    "song": "machine-v1.strudel", "section": "verse",   "cycles": 2 },
  { "out": "handing-over-the-instrument/machine-final-verse", "song": "machine.strudel",    "section": "verse",   "cycles": 2 },
  { "out": "handing-over-the-instrument/machine-v1-chaos",    "song": "machine-v1.strudel", "section": "chaos",   "cycles": 2 },
  { "out": "handing-over-the-instrument/machine-final-chorus3","song": "machine.strudel",   "section": "chorus3", "cycles": 2 },
  { "out": "handing-over-the-instrument/punchier-before",     "song": "punchier0.strudel",  "section": "verse", "layer": "drums", "cycles": 2 },
  { "out": "handing-over-the-instrument/punchier-after",      "song": "punchier1.strudel",  "section": "verse", "layer": "drums", "cycles": 2 }
]
```

**Why these six:**

- **1 and 2, the headline A/B.** `verse` is where the human's feedback landed hardest: the first pass has the "horn" over the loop; the final has that layer deleted and two new hand-written textures in its place. Three separate "a bit more" rounds are audible in one comparison. **Caveat:** the first pass is 90 BPM and the final 120, so the same 2 bars are 5.3 s and 4.0 s. The tempo change happened outside the feedback rounds; say so in one sentence.
- **3 and 4, the arc edit you can hear.** `chaos` (energy 72, the spike) against `chorus3` (45.8, the plateau), i.e. exactly what "chaos is too much, make it a louder chorus2 instead" produced. Pairs directly with V2.
- **5 and 6, the verify failure.** The tool says `articulation NOT verified (crest 5.11 -> 4.27)`. Let the reader hear that it *is* punchier while the number says the opposite. This is the most valuable clip in the post and the only one that makes the epistemics land rather than be asserted.

All six are 2 bars, 4.0 to 5.3 s.
