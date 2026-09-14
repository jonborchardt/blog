# Domain brief: post 3, `say-darker` — the vocabulary layer

Repo: `E:\github2\strudle` (strudel-bench). Everything below was verified by reading source and running it on 2026-09-13. Verbatim command output is marked as such.

Key files:

- `E:\github2\strudle\lib\descriptors.json` — 25 control words
- `E:\github2\strudle\lib\overlays.json` — 8 emotion/genre words
- `E:\github2\strudle\lib\harmony.json` — 7 progressions, 6 modes
- `E:\github2\strudle\lib\vocab.mjs` — `MODIFIERS`, `parsePhrase`, `applyDeltas`, `describeAxes`
- `E:\github2\strudle\lib\resolve.mjs` — acorn-based `locate` / `planEdits` / `applyEdits` / `setAxis`
- `E:\github2\strudle\lib\harmony.mjs` — roman numerals, `chordSpec`, `chordName`, `applyHarmonyWords`
- `E:\github2\strudle\scripts\resolve.mjs` — CLI and report printing
- `E:\github2\strudle\scripts\lint.mjs` — the taste rules
- `E:\github2\strudle\scripts\vocab.mjs` → `E:\github2\strudle\.claude\skills\strudel\reference\vocab.md` (generated)
- Tests: `test\vocab.test.mjs`, `test\resolve.test.mjs`, `test\harmony.test.mjs`, `test\lint.test.mjs`

---

## 1. The strongest story for post 3

The post is about a **lossy, deliberately tiny natural-language surface over numeric state**, and the three design decisions that make it work. For a reader who does not care about music, this is a case study in interface design for imprecise input.

**The genuinely interesting claims, in descending order of strength:**

**(a) The vocabulary is 25 words and 61 numbers, and it has never been edited.** `git log --all -- lib/descriptors.json` returns exactly one commit (`f18809b feat(lib): descriptor vocabulary with modifiers, collisions and saturation`). Same for `lib/overlays.json`. The whole control vocabulary is 61 non-zero cells in a 25 × 12 matrix (300 possible); the overlays are 30 of 96. The system has been used to build four full songs since and the table has not needed a single tuning pass. That is the strongest evidence that "small, sparse, and shipped as data" beat "comprehensive". It is also the honest caveat: it has never been edited partly because the author is the only user and learned the 25 words.

**(b) Deltas, not states, is the load-bearing decision — and the boundary behaviour is what makes it feel like a conversation instead of a form.** Saying "much darker" twice is not the same as saying it once, and it is not the same as saying "extremely dark". The second application does almost nothing, because the values have already hit 0. The system *tells you* that (`applied +0 of requested -0.60   saturated`), which is the interesting part: a delta interface has to report the delta it actually managed, not the one you asked for, or you lose trust in the second turn. Real measured numbers below (centroid 1406 Hz → 149 Hz → 141 Hz) make this concrete and audible.

**(c) The resolver's refusal is the best-judged thing in the repo.** It is a real parser (acorn) editing byte ranges of numeric literals, and it has a hard, stated line: it edits *declarative state* and never *hand-written expressions*. When it cannot see a baseline it refuses the whole layer with a message that names the offending construct and tells you what to do instead. This is the opposite of the usual LLM-adjacent failure mode (guess, rewrite, hope). Rule 8 in the README is a one-line statement of it. Worth being specific that the interesting engineering is not "parse English", it is "know exactly which bytes you own".

**(d) The language reads back, but the inverse is lossy, and the lossiness is the good bit.** `describeAxes` is the declared inverse of `parsePhrase`. Measured: **19 of 25 descriptor words survive a word → numbers → word round trip; 0 of 8 overlays do; `hypnotic` round-trips to literally nothing.** Five of the twenty-four axis directions have no word at all. This is more interesting than a clean claim because it is a real property of any lossy projection between a discrete vocabulary and a continuous state, and the system is honest enough to be measured.

**What is merely convenient, and should be labelled as such:**

- `MODIFIERS` as a multiplier table. It is 10 entries and a `scale *=` loop. `more` is ×1, i.e. a no-op that exists purely so "more punchy" reads naturally. Fine, but it is not a design insight.
- Comparative stripping (`darker` → `dark`) via three regexes. Convenient, and it has a real hole (see §9: `sadder` does not resolve, even though `sad` is a word).
- Overlays being "the same mechanism with a different table". They are tagged `overlay: true` in the contributions and documented as "low confidence", but the resolver treats them identically at apply time. The tag is currently decorative.
- The linter's `level` check and the axis-range check. They are schema validation wearing a taste costume.

---

## 2. The vocabulary, complete and exact

### Counts

| table | count | source |
|---|---|---|
| axes | 12 | `lib/axes.mjs` `AXES` |
| descriptors (control words) | 25 | `lib/descriptors.json` |
| overlays (emotion/genre) | 8 | `lib/overlays.json` |
| modifiers | 10 entries (7 distinct multipliers) | `lib/vocab.mjs` `MODIFIERS` |
| progression words | 7 | `lib/harmony.json` |
| mode words | 6 | `lib/harmony.json` |
| extra harmony keyword | 1 (`relative`) | `lib/vocab.mjs` / `lib/harmony.mjs` |
| non-zero descriptor cells | 61 of 300 | computed |
| non-zero overlay cells | 30 of 96 | computed |
| implemented layer × axis adapter cells | 46 of 60 | computed from `cells` |

### The twelve axes (`lib/axes.mjs`)

`density`, `drive`, `brightness`, `weight`, `space`, `articulation`, `aggression`, `groove`, `variation`, `organicness`, `width`, `register`. All 0..1, 0.5 is the layer's baseline no-op.

### All 25 descriptors, with exact deltas

Verbatim from `lib/descriptors.json`:

```
dreamy       space +0.35, articulation -0.20, drive -0.15, brightness -0.05, variation +0.10
punchy       articulation +0.40, weight +0.15, drive +0.20, space -0.15
massive      density +0.30, weight +0.35, width +0.30, space +0.10
frantic      density +0.35, drive +0.40, variation +0.25, articulation +0.15
delicate     density -0.20, weight -0.25, aggression -0.30, articulation -0.10
heavy        weight +0.35, aggression +0.15, register -0.15
light        weight -0.30, density -0.10, register +0.10
dark         brightness -0.30, register -0.10
bright       brightness +0.30, register +0.05
spacious     space +0.35, width +0.20
dry          space -0.35, width -0.10
human        organicness +0.35, groove +0.10
mechanical   organicness -0.35, groove -0.15, variation -0.10
tight        articulation +0.25, groove -0.15, organicness -0.10
loose        articulation -0.15, groove +0.25, organicness +0.15
busy         density +0.35, variation +0.10
sparse       density -0.35
wide         width +0.35
narrow       width -0.35
driving      drive +0.35, articulation +0.10
floating     drive -0.35, space +0.15
swung        groove +0.35
straight     groove -0.35
aggressive   aggression +0.40, articulation +0.10
smooth       aggression -0.35, articulation -0.15
```

Five words are single-axis (`sparse`, `wide`, `narrow`, `swung`, `straight`); one word touches five axes (`dreamy`). Largest single delta is 0.40 (`punchy.articulation`, `frantic.drive`, `aggressive.aggression`). No delta exceeds 0.40 in the whole table.

### All 8 overlays, with exact vectors

Verbatim from `lib/overlays.json`:

```
sad          brightness -0.20, drive -0.20, space +0.15, register -0.10, articulation -0.15
happy        brightness +0.20, drive +0.15, articulation +0.10
ominous      brightness -0.30, register -0.20, space +0.20, density -0.15
euphoric     brightness +0.25, density +0.20, width +0.25, space +0.15
hypnotic     variation -0.30, drive +0.10, density -0.05
chaotic      variation +0.40, density +0.25, aggression +0.15
playful      variation +0.20, groove +0.20, brightness +0.10, register +0.10
cinematic    space +0.30, width +0.30, weight +0.15, articulation -0.15
```

### All modifiers (`lib/vocab.mjs`, line 11)

```js
export const MODIFIERS = { slightly: 0.5, 'a little': 0.5, 'a bit': 0.5, somewhat: 0.75,
                           more: 1, much: 2, way: 2, 'a lot': 2, extremely: 3, very: 1.5 };
```

Ten entries, seven distinct values: 0.5, 0.75, 1, 1.5, 2, 2, 3. `less` is **not** in this table: it is a separate branch that sets `negate = true` and flips the sign of the whole vector.

Modifiers **multiply** (`scale *= MODIFIERS[t]`), so `much much darker` = ×4. Measured:

```
"much darker"       -> {"brightness":-0.6,"register":-0.2}
"much much darker"  -> {"brightness":-1.2,"register":-0.4}
"extremely dark"    -> {"brightness":-0.8999999999999999,"register":-0.30000000000000004}
"very darker"       -> {"brightness":-0.44999999999999996,"register":-0.15000000000000002}
"somewhat dark"     -> {"brightness":-0.22499999999999998,"register":-0.07500000000000001}
"less dark"         -> {"brightness":0.3,"register":0.1}
"less bright"       -> {"brightness":-0.3,"register":-0.05}
```

Note `less bright` ≠ `dark`: the register component differs (−0.05 vs −0.10), because negation flips `bright`'s vector, not `dark`'s.

Scale and negation reset (`flush()`) at `,`, `and`, `but`. Ignored filler tokens: `and`, `but`, `also`, `make`, `it`, `the`, and `,` `.` `;`. Everything is lowercased first, so `MUCH DARKER` works.

### Coverage: how many words touch each axis

| axis | descriptors | overlays |
|---|---|---|
| articulation | 9 | 3 |
| density | 6 | 4 |
| space | 6 | 4 |
| groove | 6 | 1 |
| drive | 5 | 3 |
| weight | 5 | 1 |
| width | 5 | 2 |
| aggression | 4 | 1 |
| variation | 4 | 3 |
| organicness | 4 | 0 |
| register | 4 | 3 |
| brightness | 3 | 5 |

`articulation` is the most contested axis (9 of 25 words touch it) and — see §4 — has no word for its negative direction at all. That asymmetry is a good paragraph.

### Harmony words (`lib/harmony.json`)

7 progression words:

```
static      i
resolved    I IV V I
unresolved  i VI VII
tense       i VII VI VII
pop         I V vi IV
epic        vi IV I V
circular    i VI III VII
```

6 mode words: `major`, `minor`, `dorian`, `lydian`, `mixolydian`, `phrygian`.
Plus the keyword `relative` (relative major/minor of the current key). Default progression when a section names none: `i VI` (`DEFAULT_PROGRESSION`).

---

## 3. Deltas vs states, precisely

### How a delta is applied

`parsePhrase(text)` returns `{ deltas, contributions, unknown, harmony }`. `deltas[axis]` is the plain sum of every contribution on that axis. Then, `lib/vocab.mjs`:

```js
export function applyDeltas(current, deltas) {
  const out = {};
  for (const [axis, requestedDelta] of Object.entries(deltas)) {
    const from = current[axis] ?? 0.5;
    const to = +clamp01(from + requestedDelta).toFixed(4);
    const appliedDelta = +(to - from).toFixed(4);
    out[axis] = { from, requestedDelta, appliedDelta, to, saturated: Math.abs(appliedDelta - requestedDelta) > 1e-6 };
  }
  return out;
}
```

Three things worth naming in prose:

1. **A missing axis defaults to 0.5.** A layer that never mentioned `brightness` is treated as being at baseline, so "darker" can *insert* a key that was not there. This is why a one-word phrase can add five properties to a layer object.
2. **`clamp01` is the whole boundary policy** (`lib/strudel.mjs:6`: `Math.min(1, Math.max(0, x))`). No soft knee, no warning at the parse stage: the clamp happens at apply time and is reported.
3. **`saturated` is derived, not asserted.** It is `appliedDelta !== requestedDelta`, which means it is true whenever the clamp bit, and only then.

Verbatim `applyDeltas` at both boundaries:

```
applyDeltas({brightness:.7, register:.5}, parsePhrase('much darker').deltas)
{ "brightness": { "from": 0.7, "requestedDelta": -0.6, "appliedDelta": -0.6, "to": 0.1, "saturated": false },
  "register":   { "from": 0.5, "requestedDelta": -0.2, "appliedDelta": -0.2, "to": 0.3, "saturated": false } }

applyDeltas({brightness:0, register:.1}, parsePhrase('much darker').deltas)
{ "brightness": { "from": 0,   "requestedDelta": -0.6, "appliedDelta": 0,    "to": 0, "saturated": true },
  "register":   { "from": 0.1, "requestedDelta": -0.2, "appliedDelta": -0.1, "to": 0, "saturated": true } }
```

### Collisions

`contributions[axis]` is an array, one entry per word that touched the axis: `{ word, key, overlay, modifier, delta }`. `deltas[axis]` is the sum. The CLI reports the breakdown only when an axis has 2+ contributions, and appends `(contradictory)` when the signs differ (`scripts/resolve.mjs`, `printReport`). The system **never refuses a contradiction**; it sums and tells you.

Verbatim, `npm run resolve -- songs/demo.strudel drop pad "dreamier and punchier"`:

```
space: dreamier +0.35   punchier -0.15   net +0.20  (contradictory)
articulation: dreamier -0.20   punchier +0.40   net +0.20  (contradictory)
drive: dreamier -0.15   punchier +0.20   net +0.05  (contradictory)
  drop.pad.space .5 -> .7   room 0.54, size 0.74
  drop.pad.articulation .5 -> .7   clip 0.72, attack 0.09 s, release 0.38 s
  drop.pad.drive .5 -> .55   pulse duck depth 0.06
  drop.pad.brightness .7 -> .65   lpf 2284 Hz -> 1945 Hz
  drop.pad.variation: skipped (no adapter on this layer)
  drop.pad.weight .5 -> .65   gain x1.13
```

The pure-cancellation case, `"brighter and darker"`:

```
brightness: brighter +0.30   darker -0.30   net +0.00  (contradictory)
register: brighter +0.05   darker -0.10   net -0.05  (contradictory)
  drop.pad.brightness .7 -> .7   lpf 2284 Hz -> 2284 Hz
  drop.pad.register .5 -> .45   octave 4
```

`brightness` nets exactly 0, `planEdits` hits `if (r.appliedDelta === 0) continue;` and emits no edit for it — but it still *reports* the no-op line. The register asymmetry (−0.05) leaks through, which is a nice illustration that these vectors are not orthogonal and cancellation is per-axis, not per-word.

### Real before/after from a real command

`songs/demo.strudel`, section `drop`, all layers, `"much darker"` (= `brightness −0.60`, `register −0.20`). Verbatim:

```
$ npm run resolve -- songs/darker1.strudel drop '*' "much darker" --write

  drop.drums.brightness .5 -> 0   lpf 800 Hz   applied -0.5 of requested -0.60   saturated
  drop.drums.register: skipped (no adapter on this layer)
  drop.bass.brightness .5 -> 0   lpf 400 Hz -> 80 Hz   applied -0.5 of requested -0.60   saturated
  drop.bass.register .5 -> .3   octave 1
  drop.melody.brightness .7 -> .1   lpf 3482 Hz -> 438 Hz
  drop.melody.register .5 -> .3   octave 3
  drop.melody2.brightness .5 -> 0   lpf 2000 Hz -> 300 Hz   applied -0.5 of requested -0.60   saturated
  drop.melody2.register .8 -> .6   octave 4
  drop.pad.brightness .7 -> .1   lpf 2284 Hz -> 286 Hz
  drop.pad.register .5 -> .3   octave 3
wrote songs/darker1.strudel
```

The source diff (`diff songs/darker0.strudel songs/darker1.strudel`), verbatim:

```
<     drums:  { density: .9, drive: .8, articulation: .7 },
>     drums:  { density: .9, drive: .8, articulation: .7, brightness: 0 },
<     bass:   { weight: .9, aggression: .6, density: .75, notes: '0 7 0 4' },
>     bass:   { weight: .9, aggression: .6, density: .75, notes: '0 7 0 4', brightness: 0, register: .3 },
<     melody: { density: .7, width: .8, brightness: .7, sound: 'piano', ... },
>     melody: { density: .7, width: .8, brightness: .1, sound: 'piano', ..., register: .3 },
<     melody2: { notes: '~ 7 ~ ~ 5 ~ 4 ~', sound: 'glockenspiel', register: .8, ... },
>     melody2: { notes: '~ 7 ~ ~ 5 ~ 4 ~', sound: 'glockenspiel', register: .6, ..., brightness: 0 },
<     pad:    { space: .5, brightness: .7, width: .8, arp: 'up' },
>     pad:    { space: .5, brightness: .1, width: .8, arp: 'up', register: .3 },
```

Two edit modes are visible in one diff: **rewrite in place** (`brightness: .7` → `brightness: .1`, `register: .8` → `.6`) and **append a new key** (`brightness: 0` and `register: .3` added to layers that never had them). Formatting, comments and ordering are untouched because edits are byte-range splices applied back-to-front (`applyEdits` sorts descending by `start`).

The second `"much darker"` on the result:

```
  drop.drums.brightness 0 -> 0   lpf 800 Hz   applied +0 of requested -0.60   saturated
  drop.drums.register: skipped (no adapter on this layer)
  drop.bass.brightness 0 -> 0   lpf 80 Hz -> 80 Hz   applied +0 of requested -0.60   saturated
  drop.bass.register .3 -> .1   octave 1
  drop.melody.brightness .1 -> 0   lpf 438 Hz -> 300 Hz   applied -0.1 of requested -0.60   saturated
  drop.melody.register .3 -> .1   octave 3
  drop.melody2.brightness 0 -> 0   lpf 300 Hz -> 300 Hz   applied +0 of requested -0.60   saturated
  drop.melody2.register .6 -> .4   octave 4
  drop.pad.brightness .1 -> 0   lpf 286 Hz -> 200 Hz   applied -0.1 of requested -0.60   saturated
  drop.pad.register .3 -> .1   octave 3
```

Every brightness line is now saturated; only `register` still has room. **Measured audio consequence** (offline render of 2 bars of `drop`, `scripts/analyze.mjs` on the wavs):

| | base → 1× darker | 1× → 2× darker |
|---|---|---|
| centroidHz | 1406 → 149 (−89%) | 149 → 141 (−5%) |
| highRatio | 0.134 → 0 (−100%) | 0 → 0 (0%) |
| lowRatio | 0.466 → 0.582 (+25%) | 0.582 → 0.604 (+4%) |
| flatness | 0.3327 → 0.0114 (−97%) | 0.0114 → 0.0123 (+8%) |
| rms | 0.2477 → 0.2306 (−7%) | 0.2306 → 0.2274 (−1%) |
| width | 0.062 → 0.048 (−23%) | 0.048 → 0.032 (−33%) |

The same phrase, run twice. First run removes 89% of the spectral centroid. Second run removes 5%. That is saturation, measured, not asserted. (`width` keeps moving because `register` keeps moving and the pad's voicing changes with it; `onsetsPerSec` also drops, 5.25 → 3.25 → 2.75, but that is the amplitude-based onset detector missing quieter, lower notes, **not** a change in the number of notes — the check table's `arc:` energy line is identical across all three files. Do not let a reader infer the delta removed notes.)

---

## 4. The round trip, and exactly how lossy it is

`describeAxes(attrs, min = 0.15)` is declared as the inverse of `parsePhrase`. It is called by `scripts/check.mjs` so every `npm run check` on a `song()` file prints each layer's numbers as words. The algorithm, in full:

For each axis whose value is a number and at least `min` (0.15) away from 0.5: find the descriptor word whose delta on that axis has the same sign **and** for which that axis is the word's strongest axis (`Math.abs(x) <= Math.abs(d)` for every other axis in the vector), taking the largest such delta. Prefix `very ` when `|v − 0.5| >= 0.35`.

### Where it is lossy — four distinct leaks

**Leak 1: five of twenty-four axis directions have no word at all.** Computed exhaustively:

| axis | word when the value rises | word when it falls |
|---|---|---|
| density | busy | sparse |
| drive | frantic | floating |
| brightness | bright | dark |
| weight | massive | light |
| space | dreamy | dry |
| articulation | punchy | **(none)** |
| aggression | aggressive | smooth |
| groove | swung | straight |
| variation | **(none)** | **(none)** |
| organicness | human | mechanical |
| width | wide | narrow |
| register | **(none)** | **(none)** |

`articulation` falling has four candidate words (`dreamy −0.20`, `loose −0.15`, `smooth −0.15`, `delicate −0.10`) and none of them owns the axis — every one of them has a bigger delta elsewhere. `variation` and `register` are never any word's strongest axis in either direction. So **`register` is completely mute in the read-back**, which is why the second "much darker" reads back identically to the first even though register moved on four layers (see the check-table excerpt below).

**Leak 2: six of twenty-five words can never be produced.** `delicate`, `driving`, `heavy`, `loose`, `spacious`, `tight`. Four of them lose a tie by insertion order (the comparison is strict `>`, so `dreamy` shadows `spacious` on `space +0.35`, `massive` shadows `heavy` on `weight +0.35`, `frantic` shadows `driving` on `drive`, `swung` shadows `loose` on `groove`); two are never any axis's owner.

**Leak 3: overlays never come back.** `describeAxes` only searches `DESCRIPTORS`. None of the 8 overlay words can ever be produced.

**Leak 4: sub-threshold moves are silent.** Anything within 0.15 of baseline reads back as nothing, so a deliberate small nudge is invisible in the table.

### Worked example (the one to put in the post)

Round trip from an all-baseline layer, `word → numbers → words`:

```
"dreamy, dark"
   numbers:   space=0.85 articulation=0.3 drive=0.35 brightness=0.15 variation=0.6 register=0.4
   read back: very dreamy, floating, very dark
   moved past the threshold with no word: articulation

"spacious"
   numbers:   space=0.85 width=0.7
   read back: very dreamy, wide

"tight"
   numbers:   articulation=0.75 groove=0.35 organicness=0.4
   read back: punchy, straight

"driving"
   numbers:   drive=0.85 articulation=0.6
   read back: very frantic

"hypnotic"
   numbers:   variation=0.2 drive=0.6 density=0.45
   read back: (nothing)

"much darker"
   numbers:   brightness=0 register=0.3
   read back: very dark
   moved past the threshold with no word: register
```

`hypnotic` is the headline: a word in the vocabulary, applied successfully, producing a state that the read-back cannot describe at all.

### Aggregate fidelity

**19 of 25 descriptors survive `word → numbers → word` (the read-back contains the word you said, possibly with a `very` prefix). 0 of 8 overlays do.** The 19 survivors are exactly the 19 producible words — the two sets coincide, which is a clean, checkable claim.

Notable: some survivors gain companions. `punchy` → `very punchy, massive, frantic, dry`: one word in, four words out, because `punchy`'s side-effects on `weight`, `drive` and `space` each cross the 0.15 threshold and get named.

### The read-back in situ

Verbatim from `npm run check -- songs/darker1.strudel` (words after the em dash):

```
  [12-20) drop (climax)
    harmony C:minor  i VI III VII -> Cm Ab Eb Bb
    drums      28/cyc  density=0.9 drive=0.8 articulation=0.7 brightness=0  — very busy, frantic, punchy, very dark
    bass        4/cyc  weight=0.9 aggression=0.6 density=0.75 notes=0 7 0 4 brightness=0 register=0.3  — very massive, busy, very dark
    melody    9.5/cyc  density=0.7 width=0.8 brightness=0.1 ... register=0.3  — busy, wide, very dark
    melody2     3/cyc  ... register=0.6 level=0.5 follow=true space=0.7 width=0.7 brightness=0  — dreamy, wide, very dark
    pad        16/cyc  space=0.5 brightness=0.1 width=0.8 arp=up register=0.3  — very dark, wide
  arc: intro 9 ▂ · verse 29.5 ▅ · drop 59 █
```

And `darker2.strudel` — after the *second* "much darker" — has **word-for-word identical** read-back lines for all five layers, despite `register` having moved on four of them and `brightness` having moved on two. Same words, different song. That is the cleanest possible demonstration of leak 1 and leak 4 together, and it is real output you can diff.

---

## 5. The resolver's refusals

`lib/resolve.mjs`, ~250 lines, one dependency (`acorn`).

### How it works

`locate(src)` calls `acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', allowAwaitOutsideFunction: true })` and walks the AST generically (`for (const k of Object.keys(node))`, recursing into arrays and anything with a `.type`). It recognises exactly two shapes by callee identifier name:

- `song({ ... }, [...])` — records the header object node and `key`
- `section(name, cycles, { ... })` — records name, cycles, `role`, `key`, `progression`, and each layer object

Inside a layer object each property is classified:

```js
if (ap.type === 'SpreadElement') { spread ??= src.slice(ap.start, ap.end); continue; }
const a = keyName(ap);
if (AXIS_NAMES.includes(a)) axes[a] = { node: ap.value, value: isNumLit(ap.value) ? numOf(ap.value) : 'expr' };
else mats[a] = { node: ap.value, prop: ap, value: litValue(ap.value) };
```

`isNumLit` accepts a `Literal` with a number value, or a `UnaryExpression` with operator `-` over a literal. Anything else on an axis key is `'expr'` and is off-limits. `applyEdits` splices `{ start, end, text }` ranges back-to-front, so the AST is only ever used for *locating*, never for regenerating source — no printer, no formatting loss.

### The five outcomes, exactly

| situation | outcome | message |
|---|---|---|
| axis key present, numeric literal | **rewrite** the literal in place | `drop.pad.brightness .7 -> .1   lpf 2284 Hz -> 286 Hz` |
| axis key absent, layer has no spread | **insert** `axis: value` after the last property | (appears in the same report line style) |
| axis value is an expression (`saw.range(...)`, `ramp(...)`) | **refuse that axis** | `verse.melody.brightness: refused, brightness is a signal here; change its range by hand` |
| layer object contains a `...spread` (CLI only) | **refuse the whole layer**, emit no edits at all | `chorus.drums.-: refused, uses spread (...M); resolve edits literal values only — set the axis by hand` |
| the layer has no adapter for that axis | **skip**, report it | `drop.pad.variation: skipped (no adapter on this layer)` |
| `key` / `progression` is not a string literal | refuse the harmony half | `key is an expression here; change it by hand` |
| file has no `section()` calls | throw before doing anything | `not a song() file: no section() calls found` |

Real refusals, verbatim:

```
$ npm run resolve -- songs/demo.strudel verse melody "brighter"
  verse.melody.register .5 -> .55   octave 4
  verse.melody.brightness: refused, brightness is a signal here; change its range by hand

$ npm run resolve -- songs/machine.strudel chorus '*' "darker"
  chorus.pad.brightness .35 -> .05   lpf 701 Hz -> 239 Hz
  chorus.pad.register .1 -> 0   octave 3
  chorus.drums.-: refused, uses spread (...M); resolve edits literal values only — set the axis by hand
  chorus.bass.-: refused, uses spread (...M); resolve edits literal values only — set the axis by hand
  chorus.melody.-: refused, uses spread (...M); resolve edits literal values only — set the axis by hand

$ npm run resolve -- songs/euclid.strudel '*' '*' "darker"
not a song() file: no section() calls found
```

Note the shape of the spread case: **the resolver does partial work.** `chorus.pad` has no spread, so it is edited; the three layers that do are refused and left alone. It does not abort the whole command.

### Why refusing beats guessing — the specific argument

The spread refusal is the interesting one, because the resolver is not refusing something it *cannot parse*. It parses `{ ...M, density: .55, brightness: .3 }` perfectly well. It refuses because **a delta needs a baseline, and the baseline is hidden behind a value it would have to evaluate to see**. Guessing 0.5 would silently discard everything `M` contributed; guessing "just edit the literals I can see" would apply the delta to the wrong starting point. The comment in the code says exactly this: `a spread hides values we cannot see; planEdits refuses the whole layer`.

The escape hatch is worth mentioning because it validates the design: `planEdits` takes an optional fifth argument, `effective`, the evaluated song's resolved attrs. The browser Mix card has those (it evaluated the song to play it) and passes them, so in the page a spread layer *is* editable; the delta is computed from the evaluated value and an override is appended after the spread. The CLI does not have them and therefore refuses. Same function, two honesty levels, determined by whether the caller can actually see the baseline. `test/resolve.test.mjs` pins the refusal (`'a layer built with spread is refused, not silently baselined'`, asserting `plan.edits` and `plan.report` are both empty).

There is a quiet irony worth a sentence: `songs/arrival.strudel` — the most elaborate song in the repo, 10 KB, 13 named instruments — is written almost entirely with spread (`{ ...theme, density: .4 }`). The CLI resolver can barely touch it.

---

## 6. Harmony as a separate subsystem

### Why not an axis (README rule 4)

Rule 1 in the README: *"A primitive axis exists only if it has a deterministic, layer-aware implementation; everything else is a descriptor or an overlay."* Rule 4 then states harmony is a separate subsystem. The concrete argument: an axis is a scalar in 0..1 with a baseline no-op at 0.5, applied independently per layer through an adapter. Harmony is none of those things. There is no "0.5 of a chord progression". A progression is shared state across layers — the pad voices it, the bass transposes to its root, the melody stays in key — so it cannot be a per-layer cell. And it is discrete: `I IV V I` does not interpolate toward `i VII VI VII`.

The proof that the separation is real is in `parsePhrase`: harmony words are handled *before* the descriptor lookup and are explicitly exempted from the delta machinery.

```js
// Harmony words are states: no modifiers, no negation, no comparatives.
if (t === 'relative') { pendingRelative = true; flush(); continue; }
if (HARMONY.modes.includes(t)) { harmony.push({ word: t, kind: 'mode', value: t, relative: pendingRelative }); ... }
if (HARMONY.progressions[t]) { harmony.push({ word: t, kind: 'progression', value: HARMONY.progressions[t] }); ... }
```

`test/vocab.test.mjs` pins it: `parsePhrase('much dorian').harmony` is `[{ word: 'dorian', kind: 'mode', value: 'dorian', relative: false }]` — the modifier is discarded, not applied. And in one phrase both systems run: `'happy, relative major, pop'` produces axis deltas **and** two harmony state changes. They coexist in the same sentence and never interact.

Second structural difference: harmony words are **idempotent**. `test/resolve.test.mjs` asserts that running `'relative major, pop'` twice produces `harmonyReport: []` and `edits.length === 0` the second time. Deltas are not idempotent (that is the entire point of §3). Same phrase box, two different repeat semantics, both correct for their subsystem. That is a genuinely nice design detail.

### What roman numerals over a section key buy you

`lib/harmony.mjs` computes chord tones from the *key's own scale* via Strudel's `scale()`, memoised. `chordSpec(key, c)` takes scale steps at degrees `[0, 2, 4, 6]` above the chord root and derives the actual intervals. So the same numeral string produces different chords in different keys, and correct spelling comes from `scale()` rather than from hand-rolled note naming.

The concrete example the outline asks for, verified:

```
  C:minor            i iv v i       -> Cm Fm Gm Cm
  C:minor            i iv V i       -> Cm Fm Gm Cm      <- case does NOT help
  C:harmonic minor   i iv v i       -> Cm Fm G  Cm      <- the real V, for free
  C:harmonic minor   i iv V7 i      -> Cm Fm G7 Cm
```

This is the payoff and the trap in one table. The README says `key` accepts "any Strudel scale name, so `C:harmonic minor` gives a real V in minor" — and it does, but **not** because you wrote `V` in uppercase. Uppercase never changes a plain diatonic triad's quality (`lowerDiatonic` guard in `chordSpec`). `V` in `C:minor` is `Gm`; it becomes `G` only when the scale itself has a raised seventh. The dominant you get is a property of the key you chose, not of how you typed the numeral. Writing `V7` *does* force it (`G7` in `C:minor`), because case sets the triad under a seventh. That distinction is the single best "what the model shouldn't try to model" beat in this section: the system refuses to infer that you meant harmonic minor, and makes you say so.

More of the grammar, verified:

```
  C:minor    V7                 -> G7
  C:minor    v7                 -> Gm7
  C:minor    VM7                -> Gmaj7
  C:major    vii7               -> Bm7b5
  C:minor    i bVI [III VII] V7 -> Cm G [Eb Bb] G7
  C:minor    IV                 -> Fm     (case is inert on plain diatonic triads)
  C:minor    IVm                -> Fm
```

Errors are real errors, not silent defaults:

```
  C:minor i ii dim  -> ERROR bad numeral "dim" in progression "i ii dim" (I..VII with optional b/#, m/M/dim, 7, and [..] groups)
  C:minor i VIII    -> ERROR bad numeral "VIII" ...
  C:minor i [VI     -> ERROR unclosed [ in progression "i [VI"
```

### The harmony words, and what each resolves to

Over `C:minor` (the default key of `demo.strudel`) and over `Eb:major`, verified:

| word | numerals | in C:minor | in Eb:major |
|---|---|---|---|
| static | `i` | Cm | Eb |
| resolved | `I IV V I` | Cm Fm Gm Cm | Eb Ab Bb Eb |
| unresolved | `i VI VII` | Cm Ab Bb | Eb Cm Ddim |
| tense | `i VII VI VII` | Cm Bb Ab Bb | Eb Ddim Cm Ddim |
| pop | `I V vi IV` | Cm Gm Ab Fm | Eb Bb Cm Ab |
| epic | `vi IV I V` | Ab Fm Cm Gm | Cm Ab Eb Bb |
| circular | `i VI III VII` | Cm Ab Eb Bb | Eb Cm Gm Ddim |

**This table is itself an argument.** The words are named for how they sound *in a minor key* and several of them are wrong in major: `unresolved` and `tense` in `Eb:major` contain a diminished triad on the second degree (`Ddim`), which is a harsh accident rather than the intended colour, and `resolved` in `C:minor` gives `Cm Fm Gm Cm` — an all-minor "resolution" with no dominant. The vocabulary is honest about being a shortcut: the words select a numeral string, and the numeral string is interpreted diatonically by whatever key you are in. Nobody is checking that the word still describes the result.

`relative` and the modes, verified:

```
  relative of C:minor  = Eb:major
  relative of C:major  = A:minor
  relative of Eb:major = C:minor
  relative of A:minor  = C:major
  relative of C:dorian -> relative key is only defined from major or minor, not "dorian"   (throws)
```

`relative` is a *prefix* keyword: `relative major` means "go to the relative key, then set that mode" — and `sameMode()` makes it a no-op when you are already in that mode family (`relative minor` from `C:minor` stays `C:minor`). Applied together:

```
  "relative major, pop"  from {key:'C:minor', progression:'i VI'}  ->  {key:'Eb:major', progression:'I V vi IV'}
  "epic, lydian"         from {key:'C:minor', progression:'i VI'}  ->  {key:'C:lydian',  progression:'vi IV I V'}
```

And through the resolver on a real file:

```
$ npm run resolve -- songs/demo.strudel drop '*' "relative major, pop"
  drop.key C:minor -> Eb:major
  drop.progression i VI III VII -> I V vi IV   Eb Bb Cm Ab
```

The `Eb Bb Cm Ab` suffix is `chordNames` — the resolver tells you the chords you are actually going to get, not just the numerals you asked for. Same instinct as `describeAxes`: every write is echoed back in human terms.

### What is deliberately not modelled, and the cost

Stated in the README and in `CLAUDE.md` under "Deliberate deferrals": **inversions, voice leading, chords longer than a bar.**

- **No inversions.** `TONE_IDX` picks tones from `[root, third, fifth, seventh]` by index; there is no way to put the third or fifth in the bass. Cost: every chord change moves the bass by the root interval, so a progression with a large root leap (`epic` = `vi IV I V`) jumps the bass around instead of walking it.
- **No voice leading.** Each chord's tones are computed independently from its own root. Cost: consecutive chords do not share held notes; the pad restates the whole stack every bar. This is why `arp` and long `space` values are load-bearing in the songs — they paper over the lack of common-tone connection.
- **No chords longer than a bar.** `parseProgression` yields one inner array per cycle, and a cycle is a bar. You can put *several* chords in one bar (`[III VII]`) but you cannot hold one across two; you repeat it (`i i VI VI`). Cost: pure bookkeeping noise in slow sections, and a progression string whose length has to match the section's bar count to loop the way you expect.

All three omissions share a shape worth naming in the post: each one is about *connections between chords*, and the model is deliberately per-chord and stateless. Adding any of them would require the harmony subsystem to remember what came before, which is exactly the kind of hidden state the rest of the system refuses to have.

---

## 7. The linter as encoded taste

`scripts/lint.mjs` is 40 lines. `lint(checkResult)` takes the output of `checkFile` (sections with `role`, `energy`, and `layers[name].attrs`) and returns `[{ level, section?, text }]`.

### Every rule, verbatim from the source

| # | rule | level | condition |
|---|---|---|---|
| 0 | check problems passed through (syntax error, unknown sound, undeclared pack) | **error** | any entry in `problems` |
| 1 | no section has `role: 'climax'` | warn | `climax.length === 0` |
| 2 | the most energetic section is not the climax | warn | no climax section ties `max(energy)` |
| 3 | a section is identical to the one before it | warn | `JSON.stringify(prev.layers) === JSON.stringify(s.layers)` |
| 4 | two or more raw saws in one section | warn | 2+ layers whose effective sound is in `{sawtooth, saw, supersaw}` |
| 5 | melody or bass has no written `notes` | warn | `layerBase(l)` is melody/bass and `attrs.notes === undefined` |
| 6 | an axis value outside 0..1 | **error** | numeric axis attr `< 0` or `> 1` |
| 7 | `level` outside 0..2 | warn | numeric `level` attr `< 0` or `> 2` |

CLI: `npm run lint` with no args lints every file in `songs/`, prints a cross for errors and a bang for warnings, and `process.exit(1)` if any song has errors.

### Why the split is where it is

The honest reading of the code: **errors are things that cannot be true, warnings are things that are usually not what you meant.** An axis outside 0..1 is not a taste call — `ctl()` and the `piece()` mappers are defined on 0..1 and an out-of-range value produces an undefined mapping, so it is a type error in a system with no types. A syntax error or an unknown sound name is silence at play time. Everything else is a judgement about a *song*, and the linter's whole design premise is that judgements about songs do not get to fail a build.

The one wobble: rule 7 (`level` outside 0..2) is described in the README as if it belonged with the range checks but is implemented as a **warning**. That is defensible (a level of 3 is loud, not impossible; the code comment says "0..2 is the useful range") but it means the README's clean line — *"Warnings for taste, errors for the impossible"* — is not quite the rule the code follows. Worth naming as a small honest crack rather than glossing.

Rule 3 is only about **consecutive** sections, which is a deliberate narrowing: a song that repeats `chorus` verbatim three times with other sections in between is fine (that is a song), while two identical sections back to back is a copy-paste you forgot to edit. Rule 2's comment records a similar judgement: *"a climax that ties the peak is the peak"* — an exact tie passes.

### The gate, precisely

`npm run lint` is **not in CI.** `.github/workflows/pages.yml` runs `npm ci && npm test`, then `npm run pages`. No lint step. But `test/lint.test.mjs` *is* in CI, and it has two tests: one feeds hand-built section tables and asserts every rule fires, and one runs the real linter over `songs/demo.strudel` and asserts `out.every(x => x.level === 'warn')`. So the linter's *code* is covered on every push; its *findings on real songs* gate nothing. The distinction to make in the post: the rules are tested, the songs are not held to them. Post 1 said "not in CI and most songs have outstanding warnings" — that is right, and this is the sharper version of it.

### Every finding, today, across `songs/` — verbatim

```
== songs\arc.strudel: 0 errors, 7 warnings
  ! verse: bass, pad: raw saws in one section are mud, give all but one a pack instrument
  ! verse: bass plays the seeded line: write its notes (the hook) in mini-notation
  ! lift: bass, pad: raw saws in one section are mud, give all but one a pack instrument
  ! lift: bass plays the seeded line: write its notes (the hook) in mini-notation
  ! drop: bass, pad: raw saws in one section are mud, give all but one a pack instrument
  ! outro: bass, pad: raw saws in one section are mud, give all but one a pack instrument
  ! outro: bass plays the seeded line: write its notes (the hook) in mini-notation
== songs\arrival.strudel: clean
== songs\demo.strudel: 0 errors, 3 warnings
  ! verse: bass, pad: raw saws in one section are mud, give all but one a pack instrument
  ! verse: bass plays the seeded line: write its notes (the hook) in mini-notation
  ! drop: bass, pad: raw saws in one section are mud, give all but one a pack instrument
== songs\euclid.strudel: clean
== songs\machine.strudel: 0 errors, 15 warnings
  ! arrive: bass plays the seeded line: write its notes (the hook) in mini-notation
  ! verse: bass plays the seeded line: write its notes (the hook) in mini-notation
  ! build: bass, melody, pad: raw saws in one section are mud, give all but one a pack instrument
  ! build: bass plays the seeded line: write its notes (the hook) in mini-notation
  ! chorus: bass, melody, pad: raw saws in one section are mud, give all but one a pack instrument
  ! chorus: bass plays the seeded line: write its notes (the hook) in mini-notation
  ! breakdown: bass plays the seeded line: write its notes (the hook) in mini-notation
  ! rebuild: bass, pad: raw saws in one section are mud, give all but one a pack instrument
  ! rebuild: bass plays the seeded line: write its notes (the hook) in mini-notation
  ! verse2: bass, pad: raw saws in one section are mud, give all but one a pack instrument
  ! verse2: bass plays the seeded line: write its notes (the hook) in mini-notation
  ! chorus2: bass, melody, pad: raw saws in one section are mud, give all but one a pack instrument
  ! chorus2: bass plays the seeded line: write its notes (the hook) in mini-notation
  ! chorus3: bass, melody, pad: raw saws in one section are mud, give all but one a pack instrument
  ! chorus3: bass plays the seeded line: write its notes (the hook) in mini-notation
== songs\ping.strudel: 0 errors, 4 warnings
  ! no section has role climax: the arc has no peak
  ! call: melody plays the seeded line: write its notes (the hook) in mini-notation
  ! answer: bass plays the seeded line: write its notes (the hook) in mini-notation
  ! answer: melody plays the seeded line: write its notes (the hook) in mini-notation
```

**Totals: 29 warnings, 0 errors, across 6 files. 2 files clean.**

### Are the warnings right? Song by song, honestly

- **`arrival.strudel` — clean, and that means something.** It is the largest song in the repo (10 KB, 8 sections, 13 named instruments) and the one the author iterated on hardest (the git log has ~8 consecutive `arrival:` commits). Every part names a real sound, every melodic part writes its notes, and it has a climax that peaks. The linter is not *failing* to find problems here; the song genuinely satisfies every rule, which is evidence the rules describe real craft rather than arbitrary style.
- **`euclid.strudel` — clean by exemption.** It is a plain Strudel file with no `section()` calls, so `if (!sections?.length) return out;` returns immediately. "Clean" here means "the linter has no opinion", not "this passed". Worth saying, because it is the difference between a check and a silence.
- **`machine.strudel` — 15 warnings, and roughly all of them are wrong.** Every warning is one of two rules. The raw-saw rule fires 5 times because `machine.strudel` names **zero** `sound:` keys — every pitched part is a bare sawtooth. That is not an oversight; the file's header comment reads *"filthy mechanical industrial rock… The groove is a physical loop; everything around it corrodes."* Colliding saws are the genre. The seeded-line rule fires 7 times on `bass`, which also has no `notes` anywhere, and again that is the point: a machine's bass is a loop, not a hook. **Roughly half of all warnings in the repo come from one song deliberately violating two rules.** That is the most useful honest finding in this section: a taste linter with no suppression mechanism produces warnings that a knowledgeable author correctly ignores, forever, and that is why it is not in CI.
- **`arc.strudel` and `demo.strudel` — 10 warnings, mostly right.** Both use a saw pad next to a saw bass. That genuinely is muddy and both songs do name `sound: 'piano'` / `'vibraphone'` on their melodies, which suggests the author agrees with the rule and just did not finish applying it. The `bass plays the seeded line` warnings are also fair: `demo`'s drop bass writes `notes: '0 7 0 4'` and does not warn, while its verse bass does not and does. The rule is discriminating correctly.
- **`ping.strudel` — 4 warnings, all wrong by category.** It is a 2-section demo of the local sample-pack mechanism, not a song with an arc. "no section has role climax" is a correct observation about a file that was never meant to have one.

### What the linter cannot see (the limit worth stating)

Run `npm run lint -- songs/darker2.strudel` — the version where every layer of the climax has been driven to `brightness: 0` and `register: .1`:

```
== songs\darker2.strudel: 0 errors, 3 warnings
  ! verse: bass, pad: raw saws in one section are mud, give all but one a pack instrument
  ! verse: bass plays the seeded line: write its notes (the hook) in mini-notation
  ! drop: bass, pad: raw saws in one section are mud, give all but one a pack instrument
```

Identical to `demo.strudel`. The linter's `energy` is onsets per cycle scaled by level; it counts *events*, not spectrum. You can make the climax inaudible mud and the linter still says the arc peaks correctly. Taste encoded as static analysis over an event table can only see what the table records — and the table records rhythm, not tone.

---

## 8. Factual corrections to the outline

1. **"modifiers that scale a delta (slightly, much, extremely)"** — there are **10** modifier entries with **7** distinct multipliers, including three two-word forms (`a little`, `a bit`, `a lot`). `more` is ×1 (a deliberate no-op for readability) and `very` is ×1.5, which sits oddly between `somewhat` (0.75) and `much` (2). `less` is **not a modifier**: it is a separate negation branch. Modifiers multiply, so `much much` is ×4 and deltas can legally exceed 1.0 before clamping.
2. **"the exact inverse of the words that would have set them"** — not exact, and the gap is the best material in the post. 19 of 25 descriptors survive; 0 of 8 overlays do; 5 of 24 axis directions (all of `register`, all of `variation`, and falling `articulation`) have no word at all; moves under 0.15 are silent. Reframe as "a lossy projection that is honest about being one", and note the check table for `darker1` and `darker2` is word-for-word identical despite four layers changing.
3. **"overlays.json (emotions and genres as vectors)"** — 8 entries, all emotions/moods. There are **no genre words** in the table (the README calls them "emotions/genres" and the generated reference says "emotion/genre, low confidence"; the data says `sad happy ominous euphoric hypnotic chaotic playful cinematic`). Docs are looser than the code here.
4. **"words that pick progressions (resolved, tense, circular, epic)"** — 7 progression words (add `static`, `unresolved`, `pop`), plus 6 mode words and the `relative` keyword: **14 harmony terms** total. Harmony words are states: modifiers, `less`, and comparative stripping are all explicitly *not* applied to them, and they are idempotent where deltas are not.
5. **"rewrites numeric literals … and REFUSES to touch a hand-written Strudel expression"** — correct but incomplete. The resolver has **two write modes** (rewrite in place *and* insert a missing key, which is how a single word can add five properties to a layer), and **four refusal/skip modes** (signal on the axis; whole layer built with spread; non-literal `key`/`progression`; axis with no adapter on that layer). The spread refusal is conditional: the browser Mix card passes evaluated attrs as a fifth argument and *can* edit spread layers; only the CLI refuses. That conditionality is the point, not an inconsistency.
6. **"a melody with no written notes"** — the rule covers **melody and bass** (via `layerBase`, so `melody2`/`bass2` count too), and it is by far the highest-volume warning in the repo (14 of 29).
7. **"two identical consecutive sections"** — correct; note "consecutive" is deliberate, and the comparison is a `JSON.stringify` deep-equal of the whole `layers` object from the *evaluated* check result, so it sees through spread.
8. **"Errors versus warnings"** — the only errors the linter itself raises are axis-outside-0..1, plus check problems passed straight through. `level` outside 0..2 is a *warning* despite the README implying otherwise. Every musical judgement is a warning. Today, across all six songs, there are **zero errors**.
9. **"the linter is not in CI"** (from post 1) — precise version: `npm run lint` is not in CI, but `test/lint.test.mjs` is, and it asserts `demo.strudel` yields only warnings. The rules are tested; the songs are not gated.
10. **The linter sees through spread; the CLI resolver does not.** Worth a sentence, because it is the same distinction as §5 (who has the evaluated values) showing up in a second tool.

---

## 9. Terminology, caveats, and what will go stale

### Terminology

- **Axis** — a named scalar in 0..1 with 0.5 as the layer's baseline no-op (enforced by test). Twelve of them.
- **Cell / adapter** — one layer's implementation of one axis (`cells[layer][axis]`). 46 of 60 exist; the other 14 are honestly empty and produce `skipped (no adapter on this layer)`. Each implemented cell has a `describe(from, to)` that produces the human suffix in the resolve report (`lpf 2284 Hz -> 286 Hz`).
- **Descriptor** vs **overlay** — descriptors are `lib/descriptors.json`, overlays are `lib/overlays.json`. Both are axis vectors, both are applied identically, and the only runtime difference is the `overlay: true` tag on each contribution. The docs say overlays are "low confidence"; nothing in the code acts on that.
- **Layer** vs **part** — the code says *layer* (`drums`, `bass`, `melody`, `pad`, `fx`); the Compose UI and the phrase-pill box say *part*. Numbered layers (`melody2`, `drums2`) are real; `layerBase()` strips trailing digits to find the adapter cells.
- **Modifier** vs **negation** — `much`/`slightly`/`very` are table lookups that multiply; `less` is a separate sign flip. Do not call `less` a modifier.
- **Section key** vs **song key** — a section's `key` overrides the song's; the resolve report and check table both show which is in force.
- **Energy** (linter/check) — onsets per cycle summed over parts, scaled by `level`. It is a rhythm measure, not a loudness or spectrum measure.

### Caveats and small warts to be honest about

- **`sadder` does not resolve.** `COMPARATIVE` is three regexes (`/ier$/`→`y`, `/er$/`→``, `/r$/`→``). `sadder` becomes `sadd` / `sadde`, neither in the tables, so it lands in `unknown` even though `sad` is a word. Doubled-consonant comparatives are not handled. `happier` works, `darker` works, `sparser` works.
- **Unknown words are reported to stderr and then ignored**, and the rest of the phrase applies: `"banana darker"` yields the full `darker` delta plus `unknown words ignored: banana`.
- **A phrase of only unknown words produces a misleading error.** `npm run resolve -- songs/demo.strudel drop pad "sadder and squelchier"` prints `unknown words ignored: sadder, squelchier` and then `no matching section/layer for drop/pad` and exits 2 — which names the wrong cause. The section and layer matched fine; there was simply nothing to do.
- **The saturation line prints `+0`.** `applied +0 of requested -0.60` — a cosmetic artefact of `(to - from).toFixed(4)` producing `0` and the sign prefix being chosen by `>= 0`. Quote it verbatim if you quote it; do not tidy it silently.
- **Deltas can exceed the range before clamping** and nothing warns at parse time. `much much extremely darker` is a legal phrase with `brightness: −3.6`.
- **`describeAxes` skips non-numbers**, so a signal or `ramp()` on an axis reads back as `brightness=signal` in the check table with no word.
- **The audio onset count drops when you darken**, because the analyzer detects onsets by amplitude. Do not report `onsetsPerSec 5.25 → 2.75` as "the delta removed notes"; the check table's `arc:` energy is unchanged at `intro 9 · verse 29.5 · drop 59` in all three variants.

### What will go stale

- **Vocabulary counts.** 25 / 8 / 10 / 7 / 6 are from today's JSON. They are trivially regenerable: `npm run vocab` rewrites `.claude/skills/strudel/reference/vocab.md` straight from the tables. Any count in the post should be re-derived from that file before publishing. That said, `descriptors.json` and `overlays.json` have exactly one commit each in the entire history, so the risk is low.
- **Lint findings.** The 29-warning tally is a snapshot of `songs/` at commit `7a4d1b0`. A single `sound:` added to `machine.strudel` would move it by five. If the post quotes the table, date it.
- **Measured audio numbers** (centroid 1406 → 149 → 141 Hz) depend on the sample packs installed locally and on `demo.strudel` not changing. Reproducible with the commands in §11 but not stable across a `songs/demo.strudel` edit — which is why the post should render against the frozen `darker0/1/2` copies, not against `demo.strudel` itself.
- **Deliberate deferrals** (inversions, voice leading, multi-bar chords) are listed in both `README.md` and `CLAUDE.md`. If any lands, §6's cost analysis changes.
- **The `harmonyNotice` flag** (`harmony applies per section; layer selector ignored for key/progression`) is a UX detail that may move into the Mix card.
- **Repo artefacts created by this investigation** (see §11): `songs/darker0.strudel`, `songs/darker1.strudel`, `songs/darker2.strudel` and `renders/snippets/say-darker/*.mp3` are now on disk and untracked. They are the post's reproducible evidence. `renders/` is gitignored; the three song files are not.

---

## 10. Proposed visuals

### V1 — "The whole language fits on one screen" (word × axis matrix) — **strongest, recommended**

**Type:** dense matrix / heatmap. 25 rows (descriptors) × 12 columns (axes), plus an 8-row overlay block below the same columns.
**Data:** exactly the tables in §2. Cell value is the signed delta; range −0.40 … +0.40; empty cells (239 of 300 for descriptors, 66 of 96 for overlays) stay blank.
**Encoding:** two-hue diverging scale by sign, magnitude by saturation or square size. Blank must read as *absent*, not as zero-valued.
**Ordering:** rows grouped by the axis each word owns, so the single-axis words (`sparse`, `wide`, `narrow`, `swung`, `straight`) sit next to the multi-axis words that shadow them (`busy`, `massive`/`spacious`, `dry`, `loose`, `mechanical`). Columns in `AXES` declaration order (`density, drive, brightness, weight, space, articulation, aggression, groove, variation, organicness, width, register`).
**The point it makes:** the language is *sparse* — 61 of 300 cells — and the sparsity is the design. It also makes leak 2 visible: you can see `dreamy` and `spacious` both hit `space +0.35`, and that `dreamy` has four other cells while `spacious` has one, which is exactly why `spacious` can never be spoken back.
**Annotations worth adding:** mark the 6 never-produced words; mark the `articulation` column as the most-contested (9 of 25) and the `variation`/`register` columns as mute in the read-back.

### V2 — "Say it twice" (the saturation chart) — **the centrepiece, recommended**

**Type:** small-multiple slope chart, two panels sharing an x axis of three states: `base`, `much darker`, `much darker again`.

**Panel A — the numbers the words wrote** (`brightness`, 0..1, one line per layer):

| layer | base | 1× | 2× | requested each step | applied step 1 | applied step 2 |
|---|---|---|---|---|---|---|
| drums | 0.5 | 0 | 0 | −0.60 | −0.50 | 0 |
| bass | 0.5 | 0 | 0 | −0.60 | −0.50 | 0 |
| melody | 0.7 | 0.1 | 0 | −0.60 | −0.60 | −0.10 |
| melody2 | 0.5 | 0 | 0 | −0.60 | −0.50 | 0 |
| pad | 0.7 | 0.1 | 0 | −0.60 | −0.60 | −0.10 |

Shade the region between "requested" and "applied" — that gap *is* saturation, and it is the whole visual argument.

**Panel B — what the audio actually did** (measured, `scripts/analyze.mjs` on 2-bar offline renders of the `drop` section):

| metric | base | 1× | 2× | units |
|---|---|---|---|---|
| centroidHz | 1406 | 149 | 141 | Hz (spectral centroid) |
| highRatio | 0.134 | 0 | 0 | fraction of energy above the high band |
| lowRatio | 0.466 | 0.582 | 0.604 | fraction of energy in the low band |
| flatness | 0.3327 | 0.0114 | 0.0123 | spectral flatness, 0..1 |

The reader sees the same command produce an 89% move and then a 5% move. Panel B is what makes the claim physical rather than arithmetic.

### V3 — "Words in, words out" (the lossy round trip) — **recommended**

**Type:** three-column flow, left = phrase, middle = resulting axis state, right = read-back words. 5–6 rows, all real (§4):

| said | resulting state | read back | what leaked |
|---|---|---|---|
| `dark` | brightness 0.2, register 0.4 | `dark` | clean |
| `spacious` | space 0.85, width 0.7 | `very dreamy, wide` | word substituted by a tie-break |
| `tight` | articulation 0.75, groove 0.35, organicness 0.4 | `punchy, straight` | word never speakable |
| `driving` | drive 0.85, articulation 0.6 | `very frantic` | shadowed by a bigger delta |
| `dreamy, dark` | space 0.85, articulation 0.3, drive 0.35, brightness 0.15, variation 0.6, register 0.4 | `very dreamy, floating, very dark` | a word appears that was never said |
| `hypnotic` | variation 0.2, drive 0.6, density 0.45 | *(nothing)* | the whole phrase is unspeakable |

Middle column should mark which axes crossed the 0.15 threshold and which of those have no word — that is the mechanism, visible.
**Companion strip (small, same figure):** the 12 axes × 2 directions grid from §4 with the 5 silent directions blacked out. It explains every row in the table above in one glance.

### V4 — "What the resolver owns" (conceptual, annotated source) — **recommended**

**Type:** a single real `section(...)` from `songs/machine.strudel` (the `chorus`, which has all five outcomes) printed as code with callouts.
**States to show, in this order:**

1. `brightness: .5` — a numeric literal on an axis key, so it is **rewritten** (owned)
2. an axis key that is *absent*, so it is **inserted** (owned)
3. `brightness: saw.range(.05, .3).slow(4)` — an expression on an axis key, so it is **refused**, message: `brightness is a signal here; change its range by hand`
4. `{ ...M, density: .55 }` — a spread, so the **whole layer is refused**, message: `uses spread (...M); resolve edits literal values only — set the axis by hand`
5. `pad.variation` — an axis with no cell on this layer, so it is **skipped**: `no adapter on this layer`

**Relationships to encode:** ownership is per-property, not per-file; refusal is partial (the `pad` layer in the same section is still edited); and the spread case has a conditional fork (the browser passes evaluated attrs and *does* edit it). Two colours: "acorn can see a baseline here" vs "it cannot".

### Alternative if only three fit

Drop V4 and fold the collision case into V1 as an inset: `dreamier and punchier` drawn as opposing arrows on the three axes they share (`space +0.35/−0.15 → +0.20`, `articulation −0.20/+0.40 → +0.20`, `drive −0.15/+0.20 → +0.05`), with the `(contradictory)` label the CLI actually prints. Real data, small footprint, and it carries the "sums, never refuses" point.

---

## 11. Proposed audio clips

### The centrepiece

Three clips, same section, the same command applied zero, one and two times. A reader hears a large change and then almost nothing — saturation, audible.

**Yes, you need intermediate song files.** The resolver writes to a file; there is no in-memory render path from the CLI. Three frozen copies are the right answer and they double as the post's reproducibility artefact.

**These files already exist on disk** (created during this investigation, untracked):

```
E:\github2\strudle\songs\darker0.strudel    (verbatim copy of demo.strudel)
E:\github2\strudle\songs\darker1.strudel    (darker0 + "much darker" on drop)
E:\github2\strudle\songs\darker2.strudel    (darker1 + "much darker" on drop)
```

**Verbatim commands to produce them from scratch:**

```bash
cd E:/github2/strudle
cp songs/demo.strudel songs/darker0.strudel
cp songs/darker0.strudel songs/darker1.strudel
npm run resolve -- songs/darker1.strudel drop '*' "much darker" --write
cp songs/darker1.strudel songs/darker2.strudel
npm run resolve -- songs/darker2.strudel drop '*' "much darker" --write
```

(Both resolve invocations print the reports quoted in §3. Keep that terminal output; it is the post's best inline evidence.)

**Why `demo.strudel`'s `drop`:** it is the only song in `songs/` whose climax is entirely literal values with no spread, so `drop '*'` edits all five layers and nothing is refused. It is 8 cycles at `cps .5` (2 s/bar), so `cycles: 2` is exactly 2 bars / 4 seconds. `machine.strudel` and `arrival.strudel` would both be mostly refused; `arc.strudel` has a signal on `melody.brightness` in the verse.

### Manifest

Write this to `E:\github2\strudle\snippets-say-darker.json`:

```json
[
  { "out": "say-darker/drop-0-base",   "song": "darker0.strudel", "section": "drop", "cycles": 2 },
  { "out": "say-darker/drop-1-darker", "song": "darker1.strudel", "section": "drop", "cycles": 2 },
  { "out": "say-darker/drop-2-darker", "song": "darker2.strudel", "section": "drop", "cycles": 2 },
  { "out": "say-darker/pad-0-base",    "song": "darker0.strudel", "section": "drop", "layer": "pad", "cycles": 2 },
  { "out": "say-darker/pad-1-darker",  "song": "darker1.strudel", "section": "drop", "layer": "pad", "cycles": 2 },
  { "out": "say-darker/pad-2-darker",  "song": "darker2.strudel", "section": "drop", "layer": "pad", "cycles": 2 }
]
```

Defaults are 64 kbps mono (`scripts/snippets.mjs`), which is what these want. Existing clips are skipped, so re-running only fills gaps; `--force` re-renders.

**Verbatim commands to render:**

```bash
cd E:/github2/strudle
npm run headless -- songs/darker0.strudel     # only if nothing answers on :3000 with a page open
npm run snippets -- snippets-say-darker.json --out-dir renders/snippets
```

**Already rendered and verified** (2026-09-13, 32 KB each, 4 s each):

```
renders/snippets/say-darker/drop-0-base.mp3
renders/snippets/say-darker/drop-1-darker.mp3
renders/snippets/say-darker/drop-2-darker.mp3
renders/snippets/say-darker/pad-0-base.mp3
renders/snippets/say-darker/pad-1-darker.mp3
renders/snippets/say-darker/pad-2-darker.mp3
```

### What each clip is for

- **`drop-0/1/2`** — the centrepiece triptych. Full section, all five layers. Caption each with the applied-vs-requested delta and the measured centroid (1406 / 149 / 141 Hz). Clip 1 to 2 is the dramatic one; clip 2 to 3 is the point.
- **`pad-0/1/2`** — the optional isolation. The pad is the only layer whose brightness had headroom in *both* steps (0.7 → 0.1 → 0), so its clip 2 to 3 is the one place where the second command is faintly audible. Use it if the full-mix clip 2 to 3 reads as "identical" and you want to be fair to the system. Drop these two if four clips is too many; the drop triptych is the required set.

### Reproducing the measurements behind the caption

```bash
cd E:/github2/strudle
node scripts/render.mjs songs/darker0.strudel --section drop --cycles 2 --name dk0
node scripts/render.mjs songs/darker1.strudel --section drop --cycles 2 --name dk1
node scripts/render.mjs songs/darker2.strudel --section drop --cycles 2 --name dk2
node scripts/analyze.mjs renders/dk0.wav renders/dk1.wav
node scripts/analyze.mjs renders/dk1.wav renders/dk2.wav
```

(Both `analyze` outputs are quoted verbatim in §3. `renders/` is gitignored.)

### Cleanup, if wanted after the post ships

```bash
rm E:/github2/strudle/songs/darker0.strudel E:/github2/strudle/songs/darker1.strudel E:/github2/strudle/songs/darker2.strudel
```

Recommendation: **keep them**, and consider committing them. They are three tiny files that make every number in the post reproducible by a reader with the repo, and they are the only songs in `songs/` that exist to demonstrate the vocabulary rather than to be music. If they stay, note that `npm run lint` will report 3 warnings on each (identical to `demo.strudel`'s) and `npm run check` with no args will include them.
