# Domain brief: `arrival` (strudel-bench), for blog post part 6

Repo: `E:\github2\strudle`. Song: `songs/arrival.strudel` (133 lines), provenance: `songs/arrival.notes.json` (8 requests, 31 change entries). Every number below is from the code or from `node scripts/check.mjs songs/arrival.strudel` (2751 events over 59 cycles), not from the docs.

---

## 1. The strongest story

Your outline has two candidate "debugging" beats. **The piano pop is the weaker one.** The stronger one is the **whistle**, and the strongest thing in the whole artefact is a third thing your outline does not have at all.

**A. The whistle: four commits, two confident wrong answers, one tooling change.**
Over four requests the human kept reporting a whistle at the start of the piece. The agent:

1. Blamed the wind bed and the bowed wineglass, turned both down (`c3a8550`). Wrong.
2. Removed the wind and space beds from `void` entirely (`128626f`). Wrong: the human came back with *"the whistle you removed was wrong"*.
3. Restored them and blamed the reverb impulse-response rebuild (`45e8f03`). That fix was correct about a *different* artefact, and the whistle survived.
4. Rendered audio, ran an FFT, and produced a beautiful, specific, physically literate diagnosis (`f3f8bb3`): a naked 440 Hz line, the sixth harmonic of the shared D2, the one partial surviving the 300 Hz lowpass, the psaltery sample map "an octave off", both pads doubling it in phase. It swapped the string sound and rebuilt the void pad as a triad. **Also wrong.**
5. The human gave the decisive clue: *"gone when a section is pinned or a pad is muted"*. That is an architectural fact, not an acoustic one: pinning and muting rebuild the song from the section layers and drop the raw `textures` stack entirely. The whistle had to be a texture. It was `didgeridoo:0`, which is a 0.7 s **bark**, pitched down to `d1` and repeated once a bar: a descending whoop (`33eb354`).
6. Then the honest part: `e5c5e80 "song revert"` undid the FFT theory in full, and `4c0c306` added a permanent fix to the *tooling*, not the song: `npm run check` now prints a `sounds` block naming the actual `.wav` behind every `sound:index`, so "a bark, a bowed cymbal or a blip is visible before it is called a drone."

That is the story. The agent's failure mode was not being vague; it was being *precise about the wrong thing*. It measured, it reasoned from harmonics, it was internally coherent, and it was wrong for four rounds because it never asked what a sample index actually was. The human's contribution was not a better ear: it was one structural observation the agent could not have had by listening.

**B. The undocumented revert that contradicts the file's own comment.** This is the best "and then reality" beat, and nobody has noticed it.

Commit `128626f` did a careful consolidation: one piano setting for the whole song, `space: .5` so the melody layer stops sending to a delay line, and a comment at the top of the file explaining exactly that. Commit `45e8f03` gave the `will` piano held notes so it stopped dying at short slots. Then commit **`4accadc "fixes"`**, one file, ten lines, no notes entry, no message, **put all of it back**: the per-section overrides on the piano in five sections, the short `will` melody, and the glockenspiel's `space: .95`.

The comment that documents the removal is still at the top of the file (lines 7 to 8). The code now disagrees with it. In the shipped HEAD, **18 piano events and 42 glockenspiel events carry a `delay` control**, the exact thing the comment says was taken out. `will.melody` has `space: .9` giving `delay: 0.32`; `after.melody` has `space: .95` giving `delay: 0.36`.

So: the agent's fix was real, the comment is real, and a later hand-edit quietly reverted two-thirds of it and left the comment standing. That is a much more interesting ending than "one value, and the comment is still there."

**C. What makes it interesting as music, honestly.** The two-wills idea *is* implemented, literally and measurably. The low/high split *is* in the numbers with a clean gap. What it is not is counterpoint. It is one 16-step degree string transposed by chord root, one 3-note ostinato that refuses to transpose, and a gain balance that the piece wins or loses on. The development is knob moves. Say that plainly and the achievement reads larger, not smaller.

**Your outline's claims, scored:**

| Claim | Verdict |
|---|---|
| 64 BPM, D minor, eight sections, 59 bars | True. 3 min 41 s. |
| Two wills, side by side | **True and verifiable to the note.** Stronger than you think. |
| Alien "never follows the chords" | True everywhere. `follow: false`. |
| Alien "never changes its intervals" | **False in one section.** In `plea` (F major) the intervals change from two perfect fourths to a fourth plus a tritone. |
| "At the climaxes neither wins" | Defensible but close. Human side is 17% louder in `contact`, 12% in `threshold`, by summed event gain. |
| Fear low, hope high | **True, with a clean register gap and one deliberate straddler.** Not a story told after the fact. |
| "a heartbeat drum" in the low half | True, and it starts one bar late. |
| "the pop behind every piano note, one value" | **Two bugs, two mechanisms, and the fix is partly undone.** |
| "a revert in the log" | True, and there are *two*, one labelled and one not. |
| "the git log as a session diary" | True for 9 of 11 commits. The last two break the discipline, which is a better point than the diary itself. |

---

## 2. The piece, structurally and exactly

Song header: `song({ bpm: 64, key: 'D:minor', seed: 41, kit: 'RolandTR808' }, ...)`.
4/4, so cps = 64/60/4 = 0.2667, one cycle = one bar = **3.75 s**. 59 bars = **221.25 s (3:41)**.

`kit: 'RolandTR808'` is **vestigial**: all five drum voices are overridden with orchestral samples, and `fx.impact` calls `s('bd')` with no bank, so it resolves to the Dirt kick, not an 808 one.

| # | Section | Bars | Range | Role | Key | Progression | Chords | Parts | Energy |
|---|---|---|---|---|---|---|---|---|---|
| 1 | void | 1 | 0 | establish | D minor | `i` | Dm | 2 | 1.7 |
| 2 | signal | 8 | 1-8 | establish | D minor | `i VI` | Dm Bb | 4 | 5.6 |
| 3 | approach | 8 | 9-16 | develop | D minor | `i VI VII` | Dm Bb C | 9 | 25.2 |
| 4 | contact | 8 | 17-24 | **climax** | D minor | `i VI III VII` | Dm Bb F C | 11 | 49.4 |
| 5 | will | 8 | 25-32 | develop | **D phrygian** | `i II i II` | Dm Eb Dm Eb | 7 | 13.7 |
| 6 | plea | 8 | 33-40 | develop | **F major** | `I V vi IV` | F C Dm Bb | 10 | 36.6 |
| 7 | threshold | 12 | 41-52 | **climax** | D minor | `i VI III VII` | Dm Bb F C | 13 | 65.3 |
| 8 | after | 6 | 53-58 | release | D minor | `i VI` | Dm Bb | 6 | 9.7 |

**Energy units:** a section's energy is the sum over parts of (onsets per cycle x level). Level-weighted onsets per bar. Not loudness. `threshold` is the peak, which is what `npm run lint` requires of a `climax`.

Events per bar, all 59 bars (for the arc visual):
`6,11,13,14,15,12,14,13,15,26,28,30,31,37,35,37,46,69,68,64,64,66,69,64,64,19,24,24,25,22,22,23,25,49,48,49,49,56,57,55,65,97,97,90,91,92,98,91,94,88,94,93,92,16,19,22,20,17,17`

**Counts:**
- **62 part instances** across 8 sections (2/4/9/11/7/10/13/6).
- **28 distinct sound sources** heard: 26 named samples plus brown and white noise synths.
- **25 `const` declarations**: 11 material constants, 11 raw-Strudel texture constants, plus `score`, `textures`, `out`.

**Declarative vs raw.** The split is clean and load-bearing:
- **Declarative** (lines 9-100, ~80 lines): everything inside `song()`/`section()`. This is what the resolver, the mixer knobs and the vocabulary can edit.
- **Raw Strudel** (lines 102-125, ~24 lines): eleven texture patterns and their `arrange()`. Hand-written chains. The resolver refuses to touch them, and the page's pin/mute drops them entirely.
- **The seam** (lines 127-133): `stack(score, textures).size(.9)`, then `out.strudel = score.strudel` to put back the metadata `stack()` throws away.

Signals used as axis values: six `saw.range(a, b).slow(n)` brightness ramps, in `approach`, `plea` and `after`.

---

## 3. The two-wills idea, verified against the source

**It is real, implemented in four independent ways, and it has one hole.**

### `follow` on every melodic part

| Constant | Sound | `follow` | Line |
|---|---|---|---|
| `theme` / `answer` | `piano` | **`true`** | `'0 ~ 2 4@2 ~ 5 4@2 0 ~ 2 4@2 ~ 7 6@2'` |
| `harp` | `harp` | **`true`** | `'0 2 4 7 2 4 7 2 4 7 2 4 7 4 2 0'` |
| `winds` | `recorder_alto_sus` | **`true`** | `'~ ~ ~ ~ 4@4 ~ ~ ~ ~ 2@4'` |
| `signal` | `handchimes` | **`false`** | `'0 ~ ~ 6 ~ ~ 3 ~ ~ 0 ~ ~ 6 3 ~ ~'` |
| `bells` | `tubularbells` | **`false`** | `'0 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ 6 ~ ~ ~'` |

No exceptions: every human voice follows, every alien voice does not. The mechanism is one branch in `buildMelody`:

```js
let line = S.n(plan.line).slow(plan.phrase);
if (plan.follow) line = line.add(S.n(ctx.chords));      // add the chord root degree
let p = midi(line.scale(keyAt(ctx.key, plan.octave)));
if (plan.follow) p = p.add(S.note(ctx.chordAcc));
```

### The real note strings, from the rendered events

**`contact`, bars 17-24, chords Dm Bb F C Dm Bb F C.**

Piano (human, `follow: true`), the same scale degrees, a new pitch level every bar:

```
bar 17 (Dm):  62 D4 · 65 F4 · 69 A4 · 70 A#4 · 69 A4
bar 18 (Bb):  70 A#4 · 74 D5 · 77 F5 · 82 A#5 · 81 A5
bar 19 (F):   65 F4 · 69 A4 · 72 C5 · 74 D5 · 72 C5
bar 20 (C):   72 C5 · 76 E5 · 79 G5 · 84 C6 · 82 A#5
bars 21-24:   identical repeat
```

Handchimes (alien, `follow: false`), **byte-identical in all eight bars, and in all 43 bars they play in a D-minor/phrygian section**:

```
every bar:    74 D5 @0.000 · 84 C6 @0.188 · 79 G5 @0.375 · 74 D5 @0.563 · 84 C6 @0.750 · 79 G5 @0.813
```

Tubular bells: `50 D3 @0.000 · 60 C4 @0.750`, every bar, everywhere. Interval fixed at 10 semitones.

So the alien intervals in D minor are **D5 to G5 to C6: two stacked perfect fourths**. *Honest caveat: a stack of fourths on D-G-C is consonant against most of `i VI III VII`. It reads as immovable, not as dissonant.*

**`threshold`, bars 41-52.** Same chord loop, but the piano plays `answer`: the second half of the phrase is inverted and comes home.

```
bar 41 (Dm):  62 · 65 · 69 · 70 · 69              degrees 0 2 4 5 4   (rise, same as theme)
bar 42 (Bb):  82 · 81 · 79 · 77 · 74 · 70         degrees 7 6 5 4 2 0 (descend to the root)
```

The `theme`'s second half ends on degree 6 and hangs; the `answer`'s descends and lands on 0. That is the one genuine motivic development in the piece, and it is exactly one string edit apart:

```js
const theme  = { ..., notes: '0 ~ 2 4@2 ~ 5 4@2 0 ~ 2 4@2 ~ 7 6@2', ... };
const answer = { ...theme, notes: '0 ~ 2 4@2 ~ 5 4@2 7 6 5 4@2 ~ 2 0@2' };
```

### Three more implementations of the same idea

1. **Phrase length.** `theme` sets `phrase: 2`, so its 16-step line is slowed over two bars. The alien lines are one bar. The human breathes slower.
2. **Timing.** `theme` has `organicness: .6` giving jitter. `signal` and `bells` have `organicness: 0`, dead on the grid. *Caveat, and a good one: the cell is one-sided, so `organicness: 0` is **identical in sound to omitting it**. The check still prints "very mechanical" from the vocabulary table. The word describes an intention the engine has no way to act on.*
3. **The `will` section.** The human theme shrinks in D phrygian, and because `follow: true` its interval *changes with the chord*: on the `i` bars D4 to E flat 4 (a half step, the phrygian sigh), on the `II` bars E flat 4 to F4 (a whole step). The chimes are unmoved. The two wills are literally distinguished by whether the interval bends.

### The hole: `plea`

In `plea` the key is F major. The chimes' degrees map to **F5 (77), B flat 5 (82), E6 (88)**: a perfect fourth then a **tritone**. Verified in the events.

`follow: false` means "do not track the chords *within* a section". It does not mean "do not transpose with the section key": `buildMelody` always runs the degrees through the section key. So in the one section that modulates, the immovable signal moves, and the interval that was supposed to be a signature changes. Nothing in the code prevents this; nothing in the notes mentions it.

This is not a bug to apologise for. It is the exact place where a declarative system's semantics ("degrees in the section key") and the composer's intent ("these three absolute pitches, always") come apart, and the piece never noticed because nobody soloed the chimes in `plea`. It is also arguably the most alien-sounding moment in the piece, by accident.

### "Neither wins", the numbers

Summed event gain per section (gain is the only per-event level control; this is not perceived loudness):

| Section | Human | Alien | H : A |
|---|---:|---:|---:|
| signal | 0.0 | 8.4 | **alien alone** |
| approach | 22.1 | 8.4 | 2.6 : 1 |
| **contact** | 66.9 | 22.3 | **3.0 : 1** |
| will | 7.3 | 20.2 | **0.36 : 1 (alien wins)** |
| plea | 63.2 | 5.1 | **12.3 : 1 (human wins)** |
| **threshold** | 129.2 | 53.0 | **2.4 : 1** |
| after | 3.3 | 6.8 | 0.48 : 1 (alien has the last word) |

Per-part it is closer than the totals suggest: in `contact`, piano 26.15 vs chimes 17.47 plus bells 4.80 = 22.27 (human +17%). In `threshold`, piano 49.62 plus glockenspiel 9.98 = 59.60 vs chimes 39.55 plus bells 13.44 = 52.99 (human +12%). That is genuinely "neither wins". The human side wins on headcount, not on level.

The dramatic arc is measurable: alien alone, human arrives, near-parity at contact, **alien wins `will`**, **human wins `plea`**, near-parity at threshold, **alien has the last word in `after`**. That is a better structure than "neither wins", and it is in the data.

---

## 4. Fear low, hope high

**Borne out, with a clean gap at middle C and one deliberate straddler.** Median MIDI over all 2220 pitched events:

| Sound | Events | Min | Median | Max | Median Hz |
|---|---:|---|---|---|---:|
| didgeridoo | 8 | D0 (14) | **D#0 (15)** | D#0 (15) | 19.4 |
| pipeorgan_loud_pedal | 112 | D0 (14) | **C1 (24)** | A2 (45) | 32.7 |
| pipeorgan_quiet | 101 | D2 (38) | **A#2 (46)** | A3 (57) | 116.5 |
| pipeorgan_loud | 48 | D2 (38) | **C3 (48)** | A#3 (58) | 130.8 |
| tubularbells | 72 | D3 (50) | **C4 (60)** | C4 (60) | 261.6 |
| *middle C, 60* | | | | | |
| psaltery_bow | 346 | D2 (38) | **F4 (65)** | A#5 (82) | 349.2 |
| super64_vib | 264 | D4 (62) | **C5 (72)** | A#5 (82) | 523.3 |
| piano | 217 | D4 (62) | **C5 (72)** | C6 (84) | 523.3 |
| recorder_alto_sus | 92 | F4 (65) | **F5 (77)** | D6 (86) | 698.5 |
| handchimes | 278 | D5 (74) | **G5 (79)** | E6 (88) | 784.0 |
| vibraphone_bowed | 192 | D5 (74) | **C6 (84)** | G6 (91) | 1046.5 |
| glockenspiel | 42 | D5 (74) | **C6 (84)** | C7 (96) | 1046.5 |
| harp | 448 | D5 (74) | **D6 (86)** | D7 (98) | 1174.7 |

There is a **two-semitone gap** between the top of the low group (C4 = 60) and the bottom of every high-group voice (D4 = 62). Nothing lives in between. Not a coincidence: `register` quantises to octaves, so the axis itself enforces the separation.

**The straddler is the string pad**, and it is the piece's best structural detail. `psaltery_bow` spans D2 to A#5 and moves section by section:

| Section | Strings register | MIDI range |
|---|---|---|
| void | `.2` | 38 (D2 only) |
| signal | `.3` | 50-65 |
| approach | `.4` | 62-79 |
| contact | default | 62-82 |
| **will** | `.2` | **50-58 (back down)** |
| plea | `.5` | 65-81 |
| **threshold** | default, `weight: .8` | **50-70 (octave down)** |
| after | default | 62-77 |

The strings start in the fear half, climb into the hope half as the piece opens up, drop back for the `will` standoff, and drop again at the finale, because `pad.weight > 0.7` triggers a low voicing. One voice crossing the line eight times is the whole "both at once" idea in a single part.

**Two corrections to the header comment's own grouping:**
- It calls the tubular bells part of the *alien signal*, and part of the *hope-high* group. By register they are the **lowest** "high" voice, at or below middle C.
- The pedal organ plays **D0 = 18.35 Hz**. Its sample map bottoms out at A1 (55 Hz), so every note is pitch-shifted down as much as 19 semitones. It is inaudible as a fundamental on any laptop speaker and reads as "huge" only through the stretched harmonics and the unnaturally slow attack. Fear in the low half is partly fear below the speaker.

---

## 5. The full commit history

Eleven commits, all on 2026-09-12, from **19:01:06 to 23:14:56, 4 hours 14 minutes**. Eight requests are recorded in the notes; the last two commits are not.

| # | Hash | Time | Message | What changed |
|---|---|---|---|---|
| 1 | `f88eca0` | 19:01 | `arrival: orchestral score in D minor, an alien arrival as a battle of wills` | The whole file: 132 lines, 8 sections, the two-wills design, the textures block. From one prompt. |
| 2 | `bd1930f` | 19:10 | `arrival: timpani, low snare, triangle, cymbal and bass drum as the drum voices in place of the 808 kit` | One line of drum voice overrides. Deleted three now-redundant textures. |
| 3 | `c3a8550` | 19:37 | `arrival: listening notes; melody vibrato only on synths` | Seven `space` values cut in `will`; `after` 8 to 6 bars; wind and wineglass down. Also a **library** change: vibrato gated to synths only. |
| 4 | `128626f` | 20:33 | `arrival: one piano setting with no delay send, intro two bars, wind out of the opening` | **Piano pop, fix 1.** `theme.space .75 to .5`, per-section piano overrides stripped from six sections. The two-line comment is added here. |
| 5 | `45e8f03` | 20:47 | `arrival: one reverb size for every event, wind back in the opening, held piano notes in will` | **Piano pop, fix 2.** `stack(score, textures).size(.9)`. `will.melody` held notes, density .3 to .5. |
| 6 | `f3f8bb3` | 20:58 | `arrival: tremolo strings in place of the bowed psaltery; void and signal strings as a triad` | **The wrong answer.** Backed by the most detailed reasoning in the whole notes file. |
| 7 | `33eb354` | 21:05 | `arrival: sustained didgeridoo and a brown rumble in place of a bark and blips` | **The right answer.** `// :8 is a sustained note; :0 is a bark`. |
| 8 | **`e5c5e80`** | 21:07 | **`song revert`** | **The revert.** Exactly undoes #6. Two minutes after #7 confirmed the real cause. |
| 9 | `4c0c306` | 21:09 | `check: name the file behind every sound:index; arrival: strings and pads restored, will bass on the sustained didgeridoo` | The real payload is in the checker: the `sounds` block. |
| 10 | **`4accadc`** | 21:32 | **`fixes`** | **The undocumented revert.** No notes entry. `steinway` to `piano`; `void` 2 to 1 bar; and **the piano consolidation from #4 and the held `will` notes from #5 are put back**. |
| 11 | `bc61b6e` | 23:14 | `update examples and add to skills` | One character of the song: the header comment `60 cycles` to `59 cycles`. Nobody caught the rest. |

**The revert to quote: `e5c5e80`.** Two minutes after the real bug was found, reversing the single most confidently argued change in the file. Its `why` is exemplary:

> "strings back to psaltery_bow, void and signal pad2 back to their single low note: those were not the whistle"

**The second revert, `4accadc`, is the post's ending.** The notes file stops at request 8. The last two commits have no provenance entry, and one contradicts a comment still in the file. The session diary works right up until the moment a human opens the file and just fixes it.

---

## 6. The piano pop

There were **two** pops with **two** mechanisms. Both comments are still in the source. One fix is intact; the other is partly undone.

### Pop 1: the melody layer's delay send

The human's report (request 4, verbatim): *"piano pops behind presses in approach, contact and threshold"*

The source comment added by the fix, lines 7-8, still present:

```js
// Axis values are 0..1 with 0.5 = the layer's baseline. The piano keeps one setting for the whole song: space .5 (room only;
// anything above sends it to a delay line, which reads as a pop behind each note) and articulation .05 so every note rings out.
```

**The mechanism, exactly** (`lib/layers.mjs:284`):

```js
defineCell('melody', 'space', {
  spatial: (p, v) => ctl(ctl(p, 'room', v, piece(0, 0.2, 0.9)), 'delay', v, (x) => Math.max(0, x - 0.5) * 0.8, { noopBelow: true }),
});
```

`noopBelow: true` returns the pattern **untouched** at `v <= 0.5`. So:
- `space: .5` emits no `delay` control at all.
- `space: .75` (the original) gives `delay = 0.20` wet.
- `space: .9` gives `delay = 0.32`. `space: .95` gives `delay = 0.36`.

`delay` is a **wet send into an orbit-level feedback delay**, not a per-note effect. Its time comes from `delaysync: 3/16` cycles and the song's cps: `(3/16) / 0.2667 =` **0.703 s**, with feedback 0.5.

**Correct the notes file here: it is not a quarter-second repeat.** At 64 BPM one beat is 0.9375 s, so the echo lands **three-quarters of a beat** after each strike, a dotted eighth, at 20% wet. It falls between the theme's own notes, so it reads as an extra attack that is not in the score. That is the pop.

**Three things make this "only a human catches this":**
1. The word is `space`. Nothing in the documentation says there is a **discrete behavioural change at 0.5**, or that a delay line is involved at all.
2. `space` means something different on every layer. **Only the melody layer routes to a delay.** So the pop was piano-shaped by construction.
3. The verification proxy for `space` is `tail`. A delay send **raises** `tail`. The measurement said the axis moved the right way. The metric agreed with the bug.

**And the fix is partly undone in HEAD.** `delay` is present on: harp 448 events (by design), handchimes 278 (by design), recorder 92 (by design), tubular bells 72 (by design), **glockenspiel 42** (removed in `128626f`, restored in `4accadc`), **piano 18** (`will.melody` 12 events at 0.32, `after.melody` 6 at 0.36, both removed in `128626f`, both restored in `4accadc`).

The comment says "The piano keeps one setting for the whole song." In two of the six sections it does not.

### Pop 2: the reverb impulse-response rebuild, the better bug

After fix 1 the human came back (request 5): **"piano still pops on key strike"**, with the clue *"trace what makes a sound at the void to signal edge that no single part has."*

The comment that went in, lines 127-130, still present:

```js
// One reverb size for everything: superdough keeps one reverb per orbit and rebuilds its impulse response whenever an
// event arrives with a different size, swapping the buffer under whatever is sounding. The pads and beds here carried
// four sizes, so the rebuild ran many times a bar and popped under every piano strike and at the void to signal edge.
```

**This is correct, and superdough's own source says so:** one reverb node per orbit, regenerated whenever the size changes, with a comment saying "only regenerate when something has changed". The fix is one method call: `stack(score, textures).size(.9)`. Verified: **every one of the 2751 events now carries `roomsize: 0.9`**.

**This is the bug worth the section heading**, because of the property the human named: it is emergent. Solo any part and it vanishes, because alone each part has exactly one size. No per-part render reproduces it. No axis value is wrong. It exists only in the sum, and the only way to find it is to know how the audio backend allocates its nodes. That is genuinely outside what a system of 0..1 axes can reason about.

---

## 7. The notes file, verbatim

8 requests, 31 change entries, all dated `2026-09-13` (the commits are `2026-09-12`; quote one).

### The prompt

> Epic orchestral score at 64 BPM in D minor: aliens arriving, a battle of wills rather than arms; fear in the low half, hope in the high half, both at once in the climaxes

### The eight asks, verbatim

1. > add a new song: an epic motion picture score, very large and orchestral, aliens coming to earth, not a battle but an emotional battle of will, lots of instruments, designed not chaotic, fear and hope at once
2. > do what is right: put the orchestral percussion under the axes
3. > listening notes: whistle too loud in void and signal; piano not real in approach and after; too much reverb in will; end too long
4. > listening notes: whistle still too loud in void, intro too long, piano pops behind presses in approach, contact and threshold, piano lost sustain in will, piano should be consistent through the song
5. > the whistle you removed was wrong; trace what makes a sound at the void to signal edge that no single part has; piano still pops on key strike; will piano still has no sustain
6. > right when the song starts it whistles; only with pad and pad2 both on; is this an odd effect
7. > still whistles at the start; gone when a section is pinned or a pad is muted; different pad sounds still whistle
8. > the bark was the issue; undo the other whistle attempts; keep it from happening again

### Selected `why` entries, verbatim

**Request 1:**
- *signal.melody*: "handchimes with follow off and a fixed 0 6 3 line: the alien signal never moves with the harmony"
- *will*: "D phrygian i II: didgeridoo bass, theme shrunk to a half-step sigh, chimes and bells louder: the alien will against the human one"
- *threshold.melody*: "the answered theme ending on the root at level 1.2 over a low loud organ and a full bass: hope over fear on the same chords"

**Request 3:**
- *melody*: "vibrato removed for sampled sounds in lib/layers.mjs: the layer put a 4 Hz wobble on every melody, which is what made the steinway sound fake; only raw synths get it now"

**Request 4:**
- *theme.space*: ".75>.5: the melody layer sends anything above .5 to a delay line, and that quarter-second repeat was the pop behind each piano note"
- *approach, contact, will, plea, threshold, after melody*: "the per-section brightness, register, width and space overrides on the piano are gone, so it is one instrument through the song; only density and level differ"

**Request 5:**
- *song*: "reverb size .9 on every event: superdough keeps one reverb per orbit and rebuilds its impulse response whenever an event arrives with a different size, and the pads and beds carried four sizes; the rebuild swapped the reverb buffer under every piano strike and at the section edge, which no soloed part reproduces because alone each part has one size"

**Request 6, the wrong answer, quoted in full because it is the best paragraph in the file:**
- *song*: "strings sound psaltery_bow>dantranh_tremolo: rendered and measured, the void pair produced one naked 440 Hz line that each pad alone left faint and both doubled in phase. It is the sixth harmonic of the shared D2, the one partial surviving the 300 Hz lowpass. The psaltery sample map is an octave off and its strong third harmonic lands exactly there; the saxophone was worse; a tremolo zither triad has no line at all"

**Request 7, the right answer:**
- *textures*: "drone didgeridoo:0 with note d1 > didgeridoo:8 at its own pitch: index 0 is a 0.7 s bark, and pitched down it is a descending whoop once a bar; pin and mute rebuild the song from the sections' layer patterns and drop the textures, which is why either hid it"

**Request 8:**
- *check:*: "the single-song check now prints a sounds block naming the file behind every sound:index heard, so a bark, a bowed cymbal or a blip is visible before it is called a drone"

**Notes on the 440 Hz theory:** partly checkable. D2 = 73.42 Hz, sixth harmonic = 440.5 Hz, the arithmetic is right. The void pad lowpass really is around there. The "doubled in phase" part is real and visible: `pad.width: .85` triggers a hard-panned duplicate. "The psaltery sample map is an octave off" is not checkable from the code. It was reverted, so treat it as unverified.

---

## 8. What it cannot do

1. **There is no counterpoint, and no voice leading.** The pads stack scale-degree triads on the chord root, every voice moves in parallel, every time. A trained ear hears parallel fifths and octaves across the whole piece. The `will` section is parallel motion as the entire dramatic device.
2. **The "development" is one line, transposed, forever.** One 16-step degree string, transposed by chord root, played 22 times. The only variant is `answer`. No augmentation, diminution, fragmentation or inversion.
3. **The rhythm cannot change.** `density` is the only rhythmic control on a melody, and it is a dice roll: below .5 a random note dropper, above .5 a random note doubler. At `will` (`density: .3`) the dropper **deletes the human theme entirely in 2 of the section's 8 bars**: piano onsets per bar are `0, 1, 3, 2, 1, 0, 3, 2`. The section named for the human will asserting itself has two bars with no human voice at all, and that is `4accadc` undoing the fix that had raised it.
4. **No tempo flexibility.** 64 BPM exactly for 221 seconds. Film scores live on rubato; this has none.
5. **No dynamics inside a note and no crescendo except six brightness ramps.**
6. **No mix bus, no compression, no levelling.** And the loudest single voice in the finale, by summed gain, is **the triangle**: 96 events x mean gain 1.16 = 111.36, ahead of the strings (60.18), the harp (58.75), the pedal organ (52.80) and the piano (49.62). `drums.weight: .9` multiplies every drum voice's gain, including the hi-hat slot, which fires 8 times a bar. The word "weight" made the triangle the loudest thing in the climax.
7. **Sample realism is stretched past its limits.** The tubular bells come from a 9-sample map spanning one octave and play D3 and C4, so every bell note is a resample.
8. **The 808 is still in there.** Request 2 says "the only non-orchestral sound is gone." It is not: `fx.impact` resolves to a Dirt kick, plus white noise for both risers and brown noise for the bed.
9. **The two-wills idea has no mechanism to enforce it.** When `plea` changed key, the chimes moved, and nothing reported it.
10. **`organicness: 0` and `variation: 0` do nothing.** Both cells return the pattern unchanged for any value at or below 0.5. The vocabulary still describes the chimes as "very mechanical". The language can say more than the engine can do.
11. **The whole texture layer is one bar out of step with the score.**

**What a listener with a trained ear would say**, in one paragraph: it is a well-voiced, convincingly orchestrated three-and-a-half minutes with a real dramatic shape and a genuinely good idea about two incompatible musics coexisting; and it is built from one melodic cell repeated without development over four chords repeated without variation, at one unwavering tempo, with a percussion balance that puts a triangle on top of the climax. It sounds like a very good sketch for a cue, played by a very good sample library, by someone who has not yet learned to write a second phrase.

---

## 9. Factual corrections to the outline

1. **"59 bars"**: correct for the score. The **textures arrange totals 60 bars**. Commit `4accadc` cut `void` from 2 bars to 1 and did not update the textures. Consequence, verified in the events: **every texture block starts exactly one bar after the section it was written for.** The gong that announces `contact` (bar 17) fires at bar **18**. The heartbeat frame drum for `will` runs bars **26-33**, bleeding into `plea`. And because 59 is not 60, the score and the textures drift by a further bar on every loop.
2. **"A pop behind every piano note, which turned out to be the space axis above 0.5"**: that was pop #1. Pop #2 was the reverb rebuild, and it is the more interesting one. Also: the fix for #1 is **partly undone in the shipped file**, while the comment documenting it is still in place.
3. **"One value, and the comment explaining it is still in the source"**: there are **two** such comments, and the first one is now inaccurate.
4. **"The alien signal never changes its intervals"**: true in all six D-minor/phrygian sections, **false in `plea`**.
5. **"Hope in the high half (bells, harp, a rising line)"**: the **tubular bells sit at D3/C4**, at or below middle C, the lowest of the "high" group.
6. **"Eight sections"**: correct, but `void` is **one bar / 3.75 s**.
7. **"Timpani" in the fear list**: correct, but the timpani is a *drums voice*, not a texture.
8. **"The compositional idea that survived everything"**: it survived because nothing ever challenged it. Every one of the eight requests was about sound quality. **Not one listening note was about the music.** The human never asked for a different melody, a different harmony, or a different form. The structure the agent produced in the first commit is still the structure.
9. **"A revert in the log"**: there are two, and they are different species.
10. **The piano is `piano`, not `steinway`.** `4accadc` swapped it. The notes and the first six commits all say "steinway"; the shipped file says `piano`.

---

## 10. Terminology and caveats

- **bar = cycle.** The piece is written at one cycle per bar.
- **part**: a key in a `section()` object. 62 of them. **layer**: the kind of part.
- **axis**: one of twelve 0..1 dimensions. 0.5 is the baseline no-op.
- **level** is *not* an axis: a plain gain multiplier.
- **energy**: sum of (onsets per cycle x level) per section. Say the unit.

**Caveats:**
- Summed event gain is **not loudness**. The chimes sit an octave above the piano, where the ear is more sensitive, so a 12% gain lead for the piano may not be a perceptual one.
- `npm run check` runs in Node with no sound map, so drum-voice resolution can differ from the browser.
- Dates: the commits are 2026-09-12, the notes say 2026-09-13.

**What will go stale:** any energy figure or gain sum if `lib/layers.mjs` changes; the delay time if superdough's default moves; the off-by-one between the 59-bar score and the 60-bar textures (a live bug, and if fixed the "every gong lands a bar late" beat stops being true); the undocumented revert (if cleaned up, the "comment and code disagree" beat evaporates). Pin claims to the hash.

---

## 11. Proposed visuals

### V1 — Two wills (the centrepiece)
Two pitch-contour lines over a chord track, 4 bars, y = MIDI note.
**Data (`contact`, bars 17-20, chords Dm | Bb | F | C):**
- Human (piano, `follow: true`): bar 17 62, 65, 69, 70, 69 / bar 18 70, 74, 77, 82, 81 / bar 19 65, 69, 72, 74, 72 / bar 20 72, 76, 79, 84, 82
- Alien (handchimes, `follow: false`), identical in all four bars: 74, 84, 79, 74, 84, 79
- Optional third line (tubular bells): 50, 60, every bar.

The human line is a staircase climbing as the chord track moves; the alien line is four identical copies.

**Optional companion panel, the hole:** the same chimes in `plea` bar 35, F major: **77, 82, 88**. Mark the interval brackets: 5, 5 semitones in D minor vs 5, 6 in F major.

### V2 — The 59-bar arrangement grid
Heat map, one row per sound, 59 columns, cell shaded by onsets in that bar. Section boundaries as vertical rules at bars 1, 9, 17, 25, 33, 41, 53; a second offset set for the **texture block boundaries at bars 2, 10, 18, 26, 34, 42, 54**, so the one-bar drift becomes visible. Units: onsets per bar.

### V3 — Who is winning (the balance arc)
Diverging bars, one per section, human above the axis, alien below, plus the energy line overlaid. Data in section 3. Units: summed per-event gain (dimensionless, not dB); energy = level-weighted onsets per bar. **Say both.**

### V4 — Fear low, hope high
Horizontal range plot, one row per instrument, sorted by median MIDI; a rule at middle C. Data: the 13-row table in section 4. Annotate the empty band between 60 and 62, and the string pad's bar spanning D2 to A#5.

### V5 (optional) — The whistle hunt as a timeline
Eleven ticks, 19:01 to 23:14, each labelled with hash, message and outcome (fixed / wrong / reverted / undocumented). The visual payload is the shape: four consecutive attempts at one bug, one revert two minutes after the truth, two commits at the end with no notes entry.

*Skip* a waveform or spectrogram: the artefact is emergent in the browser's audio graph and there is no render of it in the repo.

---

## 12. Proposed audio clips

**Two constraints:** a `layer` clip renders exactly one part, so "both at once" has to be a whole-section clip. A `section` clip renders the full mix in that bar window, textures and one-bar drift included.

**Already rendered, reuse:** `arrival-void.mp3`, `arrival-threshold.mp3`, `threshold-melody-alone.mp3`, `threshold-melody2-alone.mp3` (post 2), `hook-arrival-contact.mp3`, `arrival-contact-drums.mp3`, `arrival-full.mp3` (post 1).

### The section walk (8 clips)

```json
[
  { "out": "arrival/walk-1-void",      "song": "arrival.strudel", "section": "void",      "cycles": 1 },
  { "out": "arrival/walk-2-signal",    "song": "arrival.strudel", "section": "signal",    "cycles": 2 },
  { "out": "arrival/walk-3-approach",  "song": "arrival.strudel", "section": "approach",  "cycles": 2 },
  { "out": "arrival/walk-4-contact",   "song": "arrival.strudel", "section": "contact",   "cycles": 2 },
  { "out": "arrival/walk-5-will",      "song": "arrival.strudel", "section": "will",      "cycles": 2 },
  { "out": "arrival/walk-6-plea",      "song": "arrival.strudel", "section": "plea",      "cycles": 2 },
  { "out": "arrival/walk-7-threshold", "song": "arrival.strudel", "section": "threshold", "cycles": 2 },
  { "out": "arrival/walk-8-after",     "song": "arrival.strudel", "section": "after",     "cycles": 2 }
]
```

**will = the alien wins (0.36 : 1) and you can hear the human theme drop out in two bars.** plea = the human wins (12.3 : 1) and this is the modulation where the chimes change interval.

### The two wills (4 clips)

```json
[
  { "out": "arrival/human-contact",  "song": "arrival.strudel", "section": "contact",   "layer": "melody",  "cycles": 4 },
  { "out": "arrival/alien-contact",  "song": "arrival.strudel", "section": "contact",   "layer": "melody2", "cycles": 4 },
  { "out": "arrival/human-answer",   "song": "arrival.strudel", "section": "threshold", "layer": "melody",  "cycles": 4 },
  { "out": "arrival/alien-plea",     "song": "arrival.strudel", "section": "plea",      "layer": "melody4", "cycles": 4 }
]
```

**`alien-plea` is the clip the post is really for**: the only clip that proves a negative claim, the immovable signal moving. Play it back to back with `alien-contact`.

### The bugs (4 clips)

```json
[
  { "out": "arrival/pop-will-piano",  "song": "arrival.strudel", "section": "will",      "layer": "melody",  "cycles": 4 },
  { "out": "arrival/pop-glock",       "song": "arrival.strudel", "section": "threshold", "layer": "melody6", "cycles": 4 },
  { "out": "arrival/dry-piano",       "song": "arrival.strudel", "section": "contact",   "layer": "melody",  "cycles": 4 },
  { "out": "arrival/drone-now",       "song": "arrival.strudel", "section": "will",      "layer": "bass",    "cycles": 4 }
]
```

**`pop-will-piano`**: this is the pop, still in the shipped file, audible in isolation. It also demonstrates the density dropper deleting whole bars. **`dry-piano`**: the same instrument in `contact`, no delay at all. Play the two back to back; the difference is one character in the source.

For the bark itself, a one-line edited copy (`arrival-bark.strudel` with `drone = note("d1").s("didgeridoo")`) rendered as `{ "section": "void", "cycles": 4 }` reproduces the original opening: "this is what four rounds of debugging were chasing."

### Optional

```json
[
  { "out": "arrival/triangle-climax", "song": "arrival.strudel", "section": "threshold", "layer": "drums", "cycles": 2 }
]
```

Proves the triangle is the loudest single voice in the finale.

At 64 BPM, 4 bars = **15 seconds**, which is at the long end for a blog page. Use 2 bars for the walk clips and keep 4 bars only where the claim needs a full chord cycle (the two-wills clips, where the point *is* four different chords).
