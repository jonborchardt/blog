# Domain brief: "A language on top of Strudel" (strudel-bench, post 2)

Repo: `E:\github2\strudle` (strudel-bench). Everything below was verified by reading source or running it on 2026-09-13. Commands were run with `node v24.19.0`, `@strudel/core 1.2.6`, `@strudel/web 1.3.0`.

---

## 1. The strongest story for post 2

The outline's story ("59 bars got unwieldy, so I added a DSL") is true but it is the *weak* version, because "I wrote a DSL over a library" is the least surprising sentence in software. Three things here are genuinely interesting to a reader who does not care about music:

**(a) The abstraction can be decompiled, and the decompilation is provably equivalent.** This is the headline. `song()`/`section()` build Strudel patterns by *calling* Strudel at runtime, so there is no source text anywhere. `lib/dump.mjs` monkey-patches every Strudel core function and every `Pattern.prototype` method for the duration of a single evaluation, records the call chain that produced each pattern object in a `WeakMap`, prints it, and restores the originals. The result is plain Strudel you can paste into strudel.cc.

I verified the round trip independently:

```
songs/demo.strudel:   756 events / 20 cycles
  its own dump:       756 events
  436 event lines byte-identical, 320 identical to 6 significant figures, 0 actually different

songs/arrival.strudel: 2751 events / 59 cycles
  its own dump:        2751 events
  239 byte-identical, 2504 identical to 6 sig figs, 8 differing only in the 6th digit of one
  filter cutoff (97.23939580156576 vs 97.23975 -- the dump rounds numbers with
  Number(n.toPrecision(6)) when printing)
```

So: **every onset, every duration, every note, every control value survives the round trip; the only deltas are the dump's own number formatting, a relative error of 3.6e-7.** The repo pins a weaker version of this as a test (`test/dump.test.mjs`, "every fixture song plays the same dumped as it does built", over the four fixtures in `test/fixtures/`, comparing onset time + sound + note per cycle). I extended it to full event payloads and it holds.

That is the argument that makes the whole post land: **the layer is not a black box you have to trust, it is a compiler with a `-S` flag.** Most DSLs cannot show you what they became.

**(b) A found bug that proves the phase rule was necessary, with numbers.** Commit `4aa036c` ("fix(lib): compose bass weight/brightness on the filter instead of overwriting") is the real thing, not a hypothetical:

> bass.weight set an absolute lpf and ran after bass.brightness in the spectral phase, so brightness was discarded whenever weight was set: `{brightness .9, weight .9}` and `{brightness .5, weight .9}` both resolved to cutoff 317.77.

Two knobs, one silently eating the other. See section 5 for the runnable version I measured.

**(c) The emptiness is asserted.** 14 of the 60 layer-by-axis cells are deliberately unimplemented, and some of those holes are *pinned by a test* so they cannot be quietly filled with a guess (`test/layers.test.mjs:224`: `for (const a of ['density', 'drive', 'variation', 'register']) assert.equal(g.strudelLib.cells.fx[a], undefined)`). A system that tests for the *absence* of a feature is an unusual and fairly principled thing.

The framing I would use: **Strudel is an excellent instrument and a poor score.** It is superb at "here is a loop, change it while it plays." It has no notion of "this section, this part, relative to what that part normally does." The layer on top adds exactly that one thing, and it is checkable in both directions (compile down with `dump`, read back up with `check`).

---

## 2. Strudel itself, accurately

**What it is.** Strudel is a JavaScript port of TidalCycles, running in a browser. TidalCycles (Tidal) is a Haskell live-coding environment by Alex McLean; Strudel re-implements its pattern algebra in JS, with Web Audio as the output (the audio engine is called `superdough`). `https://strudel.cc` is the hosted REPL: a text editor, and the code runs while you type.

The relationship is a genuine port, not an homage: the mini-notation parser in `node_modules/@strudel/mini/krill.pegjs` is the *krill* grammar, Tidal's mini-notation grammar. Same operators, same semantics.

**What a Pattern is.** A pattern is a pure function from a time span to a list of events ("haps"). `pattern.queryArc(0, 4)` asks "what happens in cycles 0 to 4" and gets back a list; each hap has a `whole` (its logical span, as exact `Fraction`s, not floats), a `part` (the queried fragment) and a `value`. Nothing is stored; everything is computed on demand. This is why the whole system is testable headlessly with no audio: `scripts/check.mjs` just queries.

**What mini-notation is.** A terse string DSL for rhythm, parsed inside double-quoted strings. `s("bd sd")` is two events in one cycle. Verified operator list, straight from the grammar (`krill.pegjs:132-162` plus `mini.mjs:157`):

| Syntax | Meaning |
|---|---|
| `a b c` | sequence, splitting the cycle evenly |
| `~` or `-` | rest (silence) |
| `[a b]` | subdivide one slot |
| `<a b>` | alternate, one per cycle (slowcat) |
| `{a b, c d e}` | polymeter |
| `a , b` | stack (play together) |
| `a*2` / `a/2` | faster / slower |
| `a@2` or `a_` | elongate (2 slots wide) |
| `a!3` | replicate |
| `a?` | randomly drop |
| `a:2` | sample variant index |
| `a..d` | range |
| `bd(3,8)` | Euclidean/Bjorklund distribution |

Crucially, **the Strudel transpiler rewrites every double-quoted string literal into a mini-notation pattern**. This is load-bearing in the repo: `lib/layers.mjs:56` uses single quotes for an arp order name specifically because `"0 2 1 2"` would become a pattern rather than a string. Worth one sentence in the post; it is the kind of thing that surprises people.

**What a cycle is, and how it relates to a bar.** The cycle is Strudel's only unit of time. A pattern is defined over cycles; `stack`, `fast`, `slow`, `every` all speak in cycles. **A cycle is not intrinsically a bar** — that is a convention you adopt. Strudel itself documents the convention: `@strudel/core/repl.mjs:129` shows `setcpm(140/4) // =140 bpm in 4/4`, i.e. divide the beats-per-bar out and one cycle is one bar.

strudel-bench adopts that convention and makes it structural: `lib/song.mjs` `parseMeter('4/4')` returns `{ steps: 16, pulse: 4, beats: 4 }` — one cycle is one bar of sixteenths — and `bpm` is converted as `cps = bpm / 60 / beats`. `arrival.strudel` at `bpm: 64` in 4/4 dumps as `setcps(0.26666666666666666)`, which is `64/60/4`. Its header comment says so out loud: "59 cycles, one cycle = one bar."

**What cps means.** Cycles per second. `setcps(0.5)` = one cycle every two seconds. Strudel's default is 0.5 (`@strudel/core/cyclist.mjs:24`, `this.cps = 0.5`), which under the one-cycle-is-one-bar convention in 4/4 is 120 BPM. `setcpm` is the same thing per minute.

**What Strudel does well.** Be generous here; the post is built on it.

- Rhythm is absurdly compact. `songs/euclid.strudel` is **8 lines, 325 bytes**, and it is a complete playable four-part groove:
  ```js
  setcps(0.533)
  stack(
    s("bd(3,8)").bank("RolandTR808"),
    s("sd(2,8,1)").bank("RolandTR808").gain(.8),
    s("hh(5,8)").bank("RolandTR808").gain(.5),
    n("3 5 0 1 4 5 1 2").scale("E:phrygian").s("sawtooth").lpf(1200).decay(.15).sustain(0).gain(.6)
  )
  ```
- The combinators compose beautifully: `.jux(rev)` (play a reversed copy in the other ear), `.sometimesBy(0.4, x => x.ply(2))`, `.every(4, rev)`, `.degradeBy`, `.swingBy`.
- Continuous signals (`sine`, `saw`, `rand`, `perlin`) are patterns too, so any control can be modulated: `.lpf(saw.range(300, 8000).slow(8))`.
- Everything is a pure function of time, so it is deterministic and queryable — which is the entire reason the headless checker exists.
- **It already has arrangement.** `arrange(...)` and `stepcat` are Strudel core functions (`@strudel/core/pattern.mjs:1469`), and `arrange([4, patA], [2, patB])` does exactly what you'd hope. The dump's final expression *is* a call to Strudel's own `arrange`.

**Where it genuinely gets unwieldy.** Not arrangement — be careful, the outline overstates this. The problem is per-part control state:

1. **There is no baseline.** Strudel has no concept of "what this part normally sounds like." Every part in every section is written out in full, from scratch. Nothing says "the same pad, slightly darker."
2. **Later calls silently replace earlier ones.** `.lpf(2000).lpf(800)` is 800; the first call is gone with no warning. So you cannot layer independent adjustments without knowing what else already wrote that control. This is the seed of the whole phase-order rule.
3. **Nothing is named.** A live-coding session is one expression. A 59-bar score is 62 of them, and they are positional.
4. **A change that is one musical idea is N edits.** "The bowed strings should be a shade darker everywhere" is one number in the declarative form; in the expanded form it is 8 separate `.lpf(...)` values (the 8 `.s("psaltery_bow")` chains in arrival's dump), each a different number because it was already modified per section.

That's the honest complaint. Strudel is not badly designed; it is designed for a 4-bar loop you are editing live, and it is excellent at that. The 59-bar piece is off-label use.

---

## 3. The concrete before/after

Two candidate pairs. **I recommend using both**: a one-part pair for the shock, and the aggregate numbers for the honest ratio.

### Pair A (recommended headline): one part of `arrival`

**Before** (declarative). Two lines: a shared spec (`songs/arrival.strudel:9`, 196 chars, used by 8 parts across the song) and the place it is used (`songs/arrival.strudel:46`, 80 chars):

```js
const theme = { sound: 'piano', follow: true, phrase: 2, notes: '0 ~ 2 4@2 ~ 5 4@2 0 ~ 2 4@2 ~ 7 6@2', register: .55, articulation: .05, brightness: .6, space: .5, width: .5, organicness: .6 };
// ... in section('contact', 8, { role: 'climax', progression: 'i VI III VII',
    melody:  { ...theme, density: .55, brightness: .65, width: .7, level: 1.1 },
```

**After** (`npm run dump -- songs/arrival.strudel`, verbatim). 22 lines, 671 chars:

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
  .nudge(rand.range(-1, 1).mul(pure(0.6).fmap((x) => Math.max(0, x - 0.5) * 0.08)))
  .clip(1.07)
  .attack(0.0455)
  .release(0.28)
  .lpf(3031.43)
  .pan(sine.slow(4).range(-1, 1).mul(pure(0.2)).add(0.5))
  .mul(gain(rand.range(-1, 1).mul(pure(0.6).fmap((x) => Math.max(0, x - 0.5) * 0.4)).add(1)))
  .mul(gain(1.1))
```

Ratio for this part: **1 line to 22 lines; 80 chars (plus about 25 amortised from the shared spec) to 671 chars, about 6.4x.**

Two details in that chain are worth pointing at in prose, because they are the mechanism made visible:
- `.lpf(2000)` then `.lpf(3031.43)`; `.release(0.1)` then `.release(0.28)`; `.clip(0.8)` then `.clip(1.07)`. The baseline sets a value, then the axis cell overrides it. **The dump is the literal call sequence, not a minimised one.** A human would never write the same control twice. Say so; it is the honest caveat on every character count below.
- `.mul(gain(...))` rather than a second `.gain(...)` — that is the `mulBy` helper, and it exists precisely because of the replace-not-compose problem (section 5).

### Pair B (smallest self-contained): the `intro` of `demo.strudel`

Whole section, four bars, two parts. **Before** (`songs/demo.strudel:5-8`), 4 lines / 149 chars:

```js
  section('intro', 4, { role: 'establish',
    drums: { density: .3, space: .6 },
    pad:   { space: .8, articulation: .2, brightness: .35 },
  }),
```

**After** (`npm run dump -- songs/demo.strudel`, verbatim, comment lines included so the reader can see the mapping):

```js
// intro [0-4) establish
// drums {"density":0.3,"space":0.6}
const intro_drums = stack(
  s("bd")
    .struct("x ~ ~ ~ x ~ ~ ~ x ~ ~ ~ x ~ ~ ~")
    .bank("RolandTR909")
    .pan(0.5),
  s("sd")
    .struct("~ ~ ~ ~ x ~ ~ ~ ~ ~ ~ ~ x ~ ~ ~")
    .bank("RolandTR909")
    .pan(0.5)
)
  .room(0.08)
  .size(0.4)

// pad {"space":0.8,"articulation":0.2,"brightness":0.35}
const intro_pad = n("<0 5>")
  .scale("C4:minor")
  .add(note(0))
  .add(note("<0 0>"))
  .add(note("<[0,3,7] [0,4,7]>"))
  .s("sawtooth")
  .lpf(1200)
  .attack(0.15)
  .release(0.6)
  .room(0.3)
  .size(0.6)
  .gain(0.45)
  .pan(sine.slow(8).range(0.4, 0.6))
  .vib(0.4)
  .vibmod(0.15)
  .clip(1.12)
  .attack(0.42)
  .release(1.44)
  .lpf(701.029)
  .room(0.66)
  .size(0.81)
```

Code only (comments and blanks stripped): **33 lines / 629 chars vs 4 lines / 149 chars — 8.3x lines, 4.2x characters.**

### The honest aggregate ratios

Comments and blank lines stripped from both sides; "dump" is the dump body from `setcps(` onward (i.e. excluding the 9-line sample-prebake header, which is boilerplate for pasting into strudel.cc).

| Song | Declarative | Expanded Strudel | line ratio | char ratio |
|---|---|---|---|---|
| `ping.strudel` (2 sections, 8 bars) | 11 L / 451 C | 75 L / 1,694 C | 6.8x | 3.8x |
| `demo.strudel` (3 sections, 20 bars) | 20 L / 1,109 C | 201 L / 5,185 C | 10.1x | 4.7x |
| `arc.strudel` (5 sections, 40 bars) | 31 L / 2,540 C | 400 L / 9,400 C | 12.9x | 3.7x |
| `machine.strudel` (11 sections, 68 bars) | 84 L / 7,904 C | 689 L / 22,846 C | 8.2x | 2.9x |
| `arrival.strudel` (8 sections, 59 bars) | 115 L / 8,732 C | 1,261 L / 33,555 C | 11.0x | 3.8x |

**Say this out loud in the post: the line ratio (roughly 10x) is inflated by the dump's one-method-per-line formatting, and the character ratio (roughly 3 to 5x) is the honest one.** It is less dramatic than "a wall of code vs three lines." Collapsing the dump onto single lines drops arrival to **3.4x characters**.

The compression ratio is not really the argument, and the post is stronger if it says so. The arguments that hold up are:

- **Repetition.** arrival's dump is **65 `const` blocks** (62 parts plus 3 helper definitions) and **1,160 lines that begin with `.`**. Per part: **median 20 chained method calls, max 23**.
- **Locality.** Changing the bowed strings' brightness is one character in `songs/arrival.strudel:15`; in the expanded form it is 8 different `.lpf()` numbers, each computed from a different per-section value.
- **Names.** In the declarative form the piece reads as `void, signal, approach, contact, will, plea, threshold, after`. In the expanded form it reads as `[1, stack(void_pad, void_pad2)], [8, stack(...)], ...` — and only because the dump generated those names; hand-written Strudel would have none.
- **Relativity.** `brightness: .65` means "a little brighter than this part normally is." `.lpf(3031.43)` means nothing without knowing that the baseline was 2000 and the formula is geometric.

---

## 4. The twelve axes

Source of truth: `lib/axes.mjs`, the `AXES` array. The README table (lines 116-131) matches the code exactly — no staleness found.

| # | Axis | Kind | Meaning (verbatim from `AXES`) | Verification |
|---|---|---|---|---|
| 1 | `density` | structural | amount of musical activity | direct: `onsetsPerSec` |
| 2 | `drive` | structural | rhythmic insistence toward the primary pulse: where onsets fall and which are accented, not how many | code |
| 3 | `brightness` | continuous | spectral character, dark to bright | direct: `centroidHz` |
| 4 | `weight` | continuous | perceived low end and body | direct: `lowRatio` |
| 5 | `space` | continuous | dry and close to spacious | proxy: `tail` |
| 6 | `articulation` | continuous | sustained and smooth to short and punchy | proxy: `crest` |
| 7 | `aggression` | continuous | smooth to abrasive | proxy: `flatness` |
| 8 | `groove` | continuous | rigid to swung | proxy: `swing` |
| 9 | `variation` | structural | repetitive to variable (0 = pure loop) | proxy: `novelty` |
| 10 | `organicness` | continuous | mechanical to humanized | proxy: `jitter` |
| 11 | `width` | continuous | narrow to wide | direct: `width` |
| 12 | `register` | structural | low to high | code |

Counts: **4 direct, 6 proxy, 2 code. 4 structural, 8 continuous.**

What the three classes mean:
- **direct** — the axis names a metric `lib/analyze.mjs` computes from the rendered audio, and that metric *is* the thing the axis claims to control. `brightness` maps to spectral centroid in Hz.
- **proxy** — a measurable stand-in, not the thing itself. `space` maps to `tail` (how long energy persists after an onset) as a proxy for reverb; `aggression` maps to spectral `flatness` as a proxy for distortion.
- **code** — nothing in the audio measures it. `drive` moves *which* sixteenth a hit lands on without changing how many there are, so no level, spectral or envelope metric moves at all; you verify it by reading the event stream from `npm run check`. Same for `register` (an octave choice).

There is a test that the metric names are real: `test/axes.test.mjs`, "every proxy axis with a metric names a key `analyze()` returns."

**Structural vs continuous is a hard type distinction, not a label.** `lib/axes.mjs` `num()` throws on a non-number for a structural axis: `density is structural: it takes a number in 0..1, not a signal or pattern`. Continuous axes accept a number, a Strudel signal (`saw.range(.3, .7).slow(8)`), or `ramp(a, b)` (a saw stretched to exactly the section's length). Structural axes cannot, because they decide the grid before any pattern exists, and there is nothing to sample a signal *at*.

### Which cells are implemented

I computed this at runtime from `strudelLib.cells`. Five layers (`drums, bass, melody, pad, fx`) times 12 axes = 60 cells. **46 implemented, 14 deliberately empty (77%).** Each entry is the phases that cell participates in:

```
axis          drums          bass                 melody        pad           fx
density       structural     structural           structural    structural    .
drive         structural     structural           .             structural    .
brightness    spectral       spectral             spectral      spectral      spectral
weight        spec+level     pitch+spec+level     .             pitch+level   level
space         spatial        spatial              spatial       spatial       spatial
articulation  articulation   articulation         articulation  articulation  .
aggression    spectral       spectral             spectral      spectral      .
groove        timing         timing               timing        .             .
variation     structural     structural           structural    .             .
organicness   timing+level   timing+level         timing+level  level         .
width         (in buildDrums) .                   spatial       spatial       spatial
register      .              structural           structural    structural    .
```

Per layer: drums 11, bass 11, melody 10, pad 10, fx 4.

The 14 empty cells, and why each is honest rather than lazy:
- **fx** is missing 8 (`density, drive, articulation, aggression, groove, variation, organicness, register`). The fx layer is a riser sweep or a single impact; "how dense is this one noise sweep" has no meaning.
- **`drums.register`** — a kit has no pitch. The examples page has a card for exactly this: *"Drums have no register cell, so register .9 is accepted and changes nothing: the two variants are byte-identical."*
- **`bass.width`** — bass is mono on purpose; widening low frequencies is a mix mistake.
- **`melody.drive`, `melody.weight`** — drive moves hits relative to the pulse, which is a rhythm-section idea; weight is a low-end idea.
- **`pad.groove`, `pad.variation`** — a sustained chord has no offbeat to swing and no loop to vary.

One footnote for accuracy: **`drums.width` is a registered cell with only a `describe` and no phase function** (`lib/layers.mjs:159`, with the comment "applied per voice inside buildDrums, so the phase runner has nothing to do"). Stereo spread is applied per drum voice inside `buildDrums`, so the cell exists to give the vocabulary something to read back. If you present a grid visual, that cell is *implemented*, just not by the phase runner.

### Why "0.5 is a no-op" is enforceable, and how the test enforces it

Two mechanisms:

**The primitive.** `lib/axes.mjs` `ctl(pat, name, value, fn, { noopBelow })`:
```js
if (typeof value === 'number') {
  if (value === 0.5 || (noopBelow && value <= 0.5)) return pat;
  return pat[name](fn(value));
}
```
At exactly 0.5 it returns **the same object**, not an equivalent one. Not `pat.lpf(baseline)` — literally `pat`. So there is no rounding, no "close enough": an axis at its baseline cannot possibly have applied anything. `noopBelow: true` is the one-sided case: distortion, reverb send, swing all start at zero, and "less than none" is not a thing, so the whole lower half is the baseline. Rule 6 covers this explicitly.

**The test.** `test/layers.test.mjs:16-23`, and it is a whole-system test, not a unit test of `ctl`:

```js
test('adapter at exactly 0.5 equals no adapter, for every cell', async () => {
  const g = await ready;
  for (const L of LAYERS) {
    const base = sig(onsets(g[L]({}, ctx)));
    for (const a of Object.keys(g.strudelLib.cells[L] ?? {})) {
      assert.equal(sig(onsets(g[L]({ [a]: .5 }, ctx))), base, `${L}.${a} at .5 must be a no-op`);
    }
  }
});
```

`sig()` is `JSON.stringify` of every onset's `[begin, end, value]` over 4 cycles (with the random `nudge` field stripped). So the assertion is: **building the layer with `{}` and building it with `{ axis: 0.5 }` produce byte-identical event streams, for all 46 cells.** The fx layer gets its own version at `test/layers.test.mjs:227` (over a riser, since fx is silent by default).

And the complement, `test/layers.test.mjs:25`, *"every cell moves something at 0 or at 1"* — a cell that quietly does nothing anywhere fails the suite. Together the two say: every declared cell is a no-op at the baseline and is not a no-op everywhere.

---

## 5. The design rules that matter, quoted

From `README.md` lines 105-114, verbatim. All eight exist; these are the four the post should carry.

> **1.** A primitive axis exists only if it has a deterministic, layer-aware implementation; everything else is a descriptor or an overlay.

*Prevents:* a vocabulary that grows by accretion. "Epic" and "lo-fi" are real words a user will say, but they are bundles of other things, so they live in `lib/descriptors.json` / `lib/overlays.json` as deltas over the twelve axes, not as new primitives. Twelve is a closed set; the word list can grow forever without growing the engine. (Post 3's territory — one sentence here.)

> **2.** Axes are semantic, adapters are mechanical — an empty cell honestly says "no implementation on this layer".

*Prevents:* the worst failure mode of any "make it darker" system: inventing something plausible. `register: .9` on drums is accepted and changes nothing, and the check table reports the value back so you can see it was inert. The alternative — pitching up the samples to "honour" the request — would be a guess dressed as a feature.

> **6.** Adapter(0.5) is a no-op — literally the material's baseline, verified by test; a direction with no honest implementation is a documented no-op, not a guess.

*Prevents:* drift. Without it, "set everything to its midpoint" would still be a transformation, so writing out the values you already have would change the sound, and every edit would accumulate error. With it, the declarative file is a *description*, and any axis you do not mention is the same as mentioning it at 0.5.

> **7.** Adapters run in fixed phases, because transformations do not commute.

The big one. See below.

(Also worth a mention, though it belongs to post 3: **8.** *The resolver edits declarative state, never hand-authored Strudel expressions* — `lib/resolve.mjs` parses the file with `acorn` and rewrites only numeric literals that are direct values of axis keys inside `section()` layer objects. A hand-written signal or expression is refused, not rewritten.)

### The fixed phase order, and why order matters

`lib/axes.mjs`:
```js
export const PHASES = ['structural', 'timing', 'pitch', 'articulation', 'spectral', 'spatial', 'level'];
```

A cell declares which phases it participates in; `defineCell` throws on any key that is not one of those seven (or `describe`). Then:

- `applyPlanPhase` runs **structural** first, over a plain JS *plan* object — which voices exist, how many notes in the bass line, which octave, which grid positions. No pattern exists yet.
- `applyPatternPhases` runs the remaining six **in `PHASES` order**, and within each phase, over the axes in `AXIS_NAMES` order.

`test/axes.test.mjs` pins this: register cells in scrambled order, apply, assert the log is `['timing', 'pitch', 'spatial', 'level']`.

Why the order is what it is:

1. **structural** builds the material. Everything after transforms it. If `articulation` ran first, its hi-hat choke group would have nothing to choke, because `density` decides whether hats exist at all (`lib/layers.mjs:111`, voices join at thresholds `bd .1, sd .3, hh .5, oh .7, cp .85`).
2. **timing** moves events (swing, humanize jitter). It has to run after the grid is chosen and before anything reads note positions.
3. **pitch** transposes. `bass.weight` above .7 drops an octave.
4. **articulation** sets note lengths and envelopes.
5. **spectral** filters and distorts.
6. **spatial** places in the stereo field and the room.
7. **level** is the gain, last, so nothing after it can undo the balance.

**The concrete non-commuting pair.** In Strudel, a second `.lpf(x)` *replaces* the first — it does not compose. So two cells that both write the cutoff are order-dependent. `bass.brightness` **sets** the cutoff; `bass.weight` **multiplies** it. Both are in the `spectral` phase, and `AXIS_NAMES` puts `brightness` (index 2) before `weight` (index 3). The source says so in a comment (`lib/layers.mjs:221`):

```js
defineCell('bass', 'weight', {
  pitch: (p, v) => (typeof v === 'number' && v > 0.7 ? p.sub(S.note(12)) : p),
  // brightness *sets* the cutoff and runs first (AXIS_NAMES order), so weight only scales what it found.
  spectral: (p, v) => mulBy(p, 'lpf', v, piece(1, 1, 0.75), { noopBelow: true }),
  level: (p, v) => mulBy(p, 'gain', v, piece(0.75, 1, 1.375)),
  ...
```

I ran both orders on `bass({ brightness: .8, weight: .8 })` and read the cutoff off the first event:

```
baseline bass cutoff            : 400
brightness .8 alone             : 1050.6111217615069
weight .8 alone                 : 340
declared order (bright, weight) : 893.0194534972808     <- correct: 1050.61 x 0.85
reversed  (weight, bright)      : 1050.6111217615069    <- weight's contribution is gone
```

Reversed, the bass ends up brighter than it does with brightness alone, because weight's multiply landed on 400 and was then overwritten. **The knob does nothing, silently, and only in combination with another knob.**

This is not hypothetical: it shipped and was fixed. Commit `4aa036c` (2026-09-10):

> bass.weight set an absolute lpf and ran after bass.brightness in the spectral phase, so brightness was discarded whenever weight was set: `{brightness .9, weight .9}` and `{brightness .5, weight .9}` both resolved to cutoff 317.77.
>
> Audited the other layers for cells writing the same control in the same phase: bass was the only collision. The two gain writers on drums and pad (weight and organicness) already multiply and compose correctly.

The fix generalised a gain-only helper into `mulBy(pat, name, value, fn)` (`lib/layers.mjs:18`), whose doc comment is the rule in one sentence:

> Like `ctl`, but multiplies the control instead of setting it: a second `.gain()`/`.lpf()` **replaces** the first, so a cell that only modifies a control another cell (or the baseline) already set must mul.

A second, more visual non-commuting example if you want one: `density` on drums decides which voices exist; `articulation` at 0.6 or above puts hats and open-hats in a cut group (`.cut(1)`, so each chokes the previous). Run articulation first and there is nothing to choke; run density first and the choke applies to exactly the voices that survived.

---

## 6. The dump

**What it is for.** `song()` and `section()` are ordinary JavaScript functions that *call* Strudel to build `Pattern` objects. There is no intermediate representation, no template, no generated file. So the question "what Strudel does this actually turn into?" has no answer you can read — until you instrument the call itself.

**How it works** (`lib/dump.mjs`, 8.5 KB, no dependencies):

1. `install(modules, Pattern)` walks the Strudel core/mini/tonal namespaces and, for every lowercase function that is also a global (`s`, `n`, `note`, `stack`, `sine`, `saw`, `seq`, ...), replaces the global with a wrapper that calls the original and records `name(args)` as the source of whatever pattern comes back. The mapping lives in a `WeakMap` from pattern object to source string (lazily, as a thunk: the format step aliases the song pattern before anything reads it).
2. It does the same to every configurable property of `Pattern.prototype`, so `.lpf(800)` records `<whatever the receiver was>.lpf(800)`.
3. `add`/`sub`/`mul`/`div` are non-configurable **getters** returning a function. The wrapper only ever sees the inner `_opIn(other, (y) => (g) => op(y, g))` call, so it recovers which arithmetic op it was by *probing the closure with two numbers* and matching against a table (`OPS = { add: 10, sub: 4, mul: 21, div: 7/3, mod: 1, pow: 343, set: 3, keep: 7 }` — feed it 7 and 3). Genuinely cute, and worth showing.
4. `hush` and `samples` are stubbed for the duration, so evaluating the file does not stop playback or start a 300 MB download.
5. It evaluates the code once, walks `pattern.strudel.sections`, prints one `const <section>_<layer> = ...` per part with the attrs as a comment, then the `arrange(...)`/`stepcat(...)` that assembles them.
6. **`finally { undo() }`** restores every global and every prototype descriptor. `test/dump.test.mjs` asserts this: `globalThis.stack === stack` and `Pattern.prototype.fast`'s descriptor value is the original object, after a dump. This matters because in the browser the *same page* is playing the song; a leaked wrapper would poison live playback.
7. Dumps are serialised (`let busy = Promise.resolve()`) because the patching is process-wide.
8. Every dump is prefixed with `prebakeHeader()` (`lib/packs.mjs`): the exact `await samples(...)` / `await aliasBank(...)` calls the page runs at boot, because strudel.cc prebakes a different set and a paste would otherwise warn "sound not loaded." If a song declares a local pack, the deployed `samples/user/` map is added too.
9. If the printed code references a library helper (`piece` from a signal axis, `arpIndices` from an arpeggiated pad), the definition is inlined at the top, so the dump is self-contained. `lib/layers.mjs:56` compiles the arp picker from a source string specifically so `toString()` prints it with no captured closure variables.

**Why it matters for trust.** Because the mapping from "eleven small numbers" to "audio" is otherwise unfalsifiable. With the dump, three separate claims become checkable:

- *Does the layer mean what it says?* Read the chain. `brightness: .65` on the piano is `.lpf(3031.43)`, computed from the baseline 2000 by a geometric `piece(300, 2000, 8000, { log: true })`.
- *Is it doing anything behind my back?* No: the chain is complete, and the events it produces match (section 1).
- *Am I locked in?* No. Copy the dump into strudel.cc and it plays. The export button on the page does exactly this. That is the argument that this is a layer *on top of* Strudel and not a replacement.

**A short real example.** `songs/ping.strudel:6-9`:

```js
  section('call', 4, { role: 'establish',
    drums:  { density: .4, space: .6 },
    melody: { density: .6, sound: 'ping', space: .7 },
  }),
```

`npm run dump -- songs/ping.strudel` prints (after the prebake header and `setcps(0.5)`) the `call_drums` and `call_melody` chains, then:

```js
arrange(
  [4, stack(call_drums, call_melody)],
  [4, stack(answer_drums, answer_bass, answer_melody)],
)
```

If you want a still smaller one, the `intro` pair in section 3 Pair B is the tightest complete example in the repo.

**Three honest limitations of the dump, all worth a line:**

1. **Numbers are printed to 6 significant figures** (`num = (n) => String(Number(n.toPrecision(6)))`). That is the *only* source of divergence in the round trip, and it is inaudible (worst observed: 97.23939580 to 97.23975, 3.6e-7 relative).
2. **It is not minimal.** Duplicate `.lpf()`/`.release()`/`.clip()` calls survive, because it prints the call sequence, not a simplification.
3. **It expands hand-written code too, losing your names.** In `arrival.strudel` the textures are twelve named one-liners (`const roll = ...`, `const boom = ...`); the dump inlines all of them into one very long `arrange(...)`. And the dump loses `out.strudel = score.strudel`, so a re-loaded dump is a plain Strudel file with no section table.
4. **Small rough edge, verified:** the prebake header calls `aliasBank(...)`, which is not in the Node checker's scope. `npm run check` on a raw dump fails with `aliasBank is not defined`; you have to strip the header first (the dump test stubs it: `globalThis.aliasBank ??= async () => {}`). Mention only if the post shows someone re-checking a dump.

---

## 7. The check loop

`npm run check -- songs/x.strudel` evaluates the file in Node (no browser, no audio), queries the whole pattern, and prints (a) every event, (b) which sample file each sound name actually resolves to, (c) a per-section per-layer axis table with the values read back as vocabulary words, and (d) an energy arc. It exits 1 on a syntax error or an unknown sound.

The smallest real song in the repo is `songs/ping.strudel` (14 lines, two sections, 8 bars). **Verbatim output**, with the middle of the event stream elided (full output is 189 lines: 173 event lines plus the tables):

```
== songs\ping.strudel (173 events in 8 cycles)
0.000 +0.063 {"s":"bd","bank":"RolandTR909","pan":0.5,"room":0.07999999999999999,"roomsize":0.39999999999999997}
0.000 +0.063 {"note":60,"s":"ping","cutoff":2000,"clip":0.8,"release":0.1,"room":0.4799999999999999,"gain":0.6,"delay":0.15999999999999998}
0.063 +0.063 {"note":60,"s":"ping","cutoff":2000,"clip":0.8,"release":0.1,"room":0.4799999999999999,"gain":0.48,"delay":0.15999999999999998}
0.125 +0.125 {"note":60,"s":"ping","cutoff":2000,"clip":0.8,"release":0.1,"room":0.4799999999999999,"gain":0.48,"delay":0.15999999999999998}
0.250 +0.063 {"s":"bd","bank":"RolandTR909","pan":0.5,"room":0.07999999999999999,"roomsize":0.39999999999999997}
0.250 +0.063 {"s":"sd","bank":"RolandTR909","pan":0.5,"room":0.07999999999999999,"roomsize":0.39999999999999997}
0.250 +0.125 {"note":62,"s":"ping","cutoff":2000,"clip":0.8,"release":0.1,"room":0.4799999999999999,"gain":0.6,"delay":0.15999999999999998}
  ... 163 more event lines ...
  sounds
    RolandTR909_bd:0         Bassdrum-01.wav (4 variants)
    ping:0                   ping.wav (1 variant)
    RolandTR909_sd:0         naredrum.wav (16 variants)
    RolandTR909_hh:0         hh01.wav (4 variants)
  [0-4) call (establish)
    harmony C:minor  i VI -> Cm Ab
    drums       6/cyc  density=0.4 space=0.6
    melody      8/cyc  density=0.6 sound=ping space=0.7  — dreamy
  [4-8) answer (develop)
    harmony C:minor  i VI III VII -> Cm Ab Eb Bb
    drums      14/cyc  density=0.6
    bass        4/cyc  weight=0.6 register=0.3
    melody  11.25/cyc  density=0.8 sound=ping brightness=0.7 width=0.7  — busy, bright, wide
  arc: call 14 ▄ · answer 29.3 █
```

Reading it: `0.250 +0.063` is "at cycle 0.25, lasting 0.0625 cycles" — a snare on beat 2 of bar 1, one sixteenth long. `6/cyc` is onsets per cycle for that part. The words after the dash are the axis values read back through the vocabulary in reverse (`describeAxes` in `lib/vocab.mjs`) — the same table that turns "dreamier" into deltas, run backwards. The `arc:` line is each section's energy (onsets per cycle summed over its parts, scaled by `level`) with a bar glyph, so "does the climax actually peak" is answerable from the table.

For the 59-bar piece, the same command prints **2,751 events in 59 cycles**, a `sounds` block naming 28 distinct sample files, 62 part rows across 8 sections, and:

```
  arc: void 1.7 ▁ · signal 5.6 ▂ · approach 25.2 ▄ · contact 49.4 ▆ · will 13.7 ▂ · plea 36.6 ▅ · threshold 65.3 █ · after 9.7 ▂
```

That one line is the shape of the piece, and it is the single most quotable thing the checker produces.

**The refusals** (both verified, both exit 1):

```
  ping.strudel: unknown sound "kazoo"
```

```
  x.strudel: unknown key "arpp" on melody in section "a" (axes: density, drive, brightness,
  weight, space, articulation, aggression, groove, variation, organicness, width, register;
  material: sound, notes, follow, phrase, seed, level)
```

The second is from `lib/song.mjs:62` and is the better one to show: a typo in a key is a hard error that names both legal lists, not a silent no-op. `song({ bmp: 120 })` throws the same way (`unknown song key "bmp" (known: cps, bpm, meter, key, seed, kit, packs)`).

There is also `npm run lint -- songs/x.strudel`, which runs musical rules over that same table: a climax must exist and must be the most energetic section, no two consecutive sections identical, no section with two raw sawtooths, every melody and bass must write its own notes, axes in 0..1 and level in 0..2. Warnings for taste, errors exit 1. `npm run lint -- songs/arrival.strudel` currently prints `== songs\arrival.strudel: clean`.

**The loop, accurately:** edit the file, then `npm run check` (or the page auto-reloads over SSE and re-evaluates in place if it is playing), then press play. The outline's "press play" is not quite the order: on `localhost:3000` the page watches `songs/` with `fs.watch` and, if the song is already playing, re-evaluates so you hear the edit without stopping. The Mix card makes it bidirectional: every slider is a source edit, undoable, and the expanded-Strudel pane re-expands 300 ms after each keystroke via the same `lib/dump.mjs` running in the browser.

---

## 8. Factual corrections to the outline

1. **"TidalCycles in the browser"** — fine as a one-liner, but say *port*, not *wrapper*. Strudel re-implements Tidal's pattern algebra in JavaScript; Tidal is Haskell and there is no Haskell involved.

2. **"one cycle equals one bar"** — this is a *convention*, not a Strudel fact. Strudel's unit is the cycle and its default is 0.5 cps; nothing in Strudel says a cycle is a bar. strudel-bench adopts the convention and makes it structural (`parseMeter` gives sixteen sixteenth-steps per cycle in 4/4). Strudel itself documents the convention via `setcpm(140/4) // =140 bpm in 4/4`. Getting this right is cheap and makes the post credible to anyone who knows Tidal.

3. **"sections x layers x twelve axes"** — a section does not have five layer slots. A section can hold **many parts of the same kind**: `arrival`'s `threshold` has `melody, melody2, melody3, melody4, melody5, melody6` and `pad, pad2, pad3, pad4`. `layerBase()` strips the trailing digits to pick the builder. Say **sections x parts**, where each part is an instance of one of five kinds. arrival has **62 parts across 8 sections**.

4. **"a 59-bar piece... becomes a wall of nested method chains nobody can read"** — the 59-bar piece is `songs/arrival.strudel`, correct: 8 sections, `1+8+8+8+8+8+12+6 = 59` cycles, `bpm: 64` in D minor. But arrival is **not purely declarative**. Lines 104-125 are twelve hand-written plain-Strudel textures assembled with Strudel's own `arrange()`, and line 131 is `stack(score, textures).size(.9)` with `out.strudel = score.strudel` to hand the metadata back. This is the better story, not a caveat to hide: **the layer does not forbid raw Strudel, it sits next to it.** The declarative half handles what it can model; the gong swells, the wind bed and the didgeridoo drone stay raw. `machine.strudel` does the same. The check table, the mixer, solo/mute and the resolver all only see the `song()` half — the skill even uses that as a diagnostic: *"a sound that survives solo/mute is in the layers and one that vanishes is in the textures."*

5. **"a wall of nested method chains"** — the chains are *chained*, not *nested*, and the wall is repetition rather than depth: median 20 method calls per part, 62 parts, 1,160 lines starting with a dot. Also, do not imply Strudel lacks arrangement: `arrange` and `stepcat` are Strudel core functions and the dump's final expression is literally a call to Strudel's `arrange`. What's missing is naming, baselines and relativity, not sequencing.

6. **"an axis exists only if it has a deterministic layer-aware implementation"** — accurate, but the load-bearing half is the *second* clause of rule 2: an empty cell is honest, accepted, and reported back as inert. The system does not reject `register` on drums; it accepts it and does nothing, visibly.

7. **"dump expands it back to plain Strudel you can paste into strudel.cc"** — accurate and the paste really works (the prebake header exists for exactly that reason). But: the dump also expands the *hand-written* code, losing your `const` names, and it prints numbers to 6 significant figures. Say "equivalent to seven digits", not "identical."

8. **"`npm run check` prints the events and refuses an unknown sound"** — true, and also: it prints the sample *file* behind every sound name (a name says nothing about its variants: `didgeridoo:0` is a bark, `didgeridoo:8` a sustained note), the harmony line with the chords you actually got, the axes read back as vocabulary words, and an energy arc. It also refuses an unknown *key* on a layer, an unknown song key, an out-of-range `level`, a bad `meter`, an unknown drum `template`, an unknown drum voice, a non-numeric `seed`, and a local-pack sound the song did not declare. The "unknown key" refusal is the better headline than "unknown sound" because it catches typos in the language itself.

9. **"you type and it changes while playing"** — true of strudel.cc and of the bench, but in the bench the mechanism differs: editing the *file on disk* triggers an SSE reload that re-evaluates in place; editing the textarea shows an Update button (ctrl+enter). Worth one clause.

10. **Line counts.** If the outline was going to claim a dramatic ratio, the real number is about **3 to 5x characters** and about **10x lines**, and the line figure is inflated by the dump's formatter. Lead with repetition and locality, not with compression.

---

## 9. Terminology and caveats a first-time reader needs

Define, in roughly this order: **live coding** (you type the music while it plays, the audience sees the screen), **Strudel / TidalCycles**, **cycle** (the unit of time; here one cycle is one bar), **cps** (cycles per second; 0.5 cps in 4/4 is 120 BPM), **mini-notation** (the string DSL inside `s("...")`), **pattern** (a pure function from a time span to events), **event / hap** (start, duration, a bag of control values), **layer/part** (drums, bass, melody, pad, fx), **axis** (a 0..1 perceptual dimension, 0.5 = baseline), **cell** (one layer's implementation of one axis), **phase** (the fixed pipeline stage a cell runs in), **material** (literal values: which sample, which notes, level, never an axis), **dump** (the expanded plain Strudel).

Things to state explicitly so a reader is not misled:

- **This is not a synthesiser.** Strudel schedules events; the sounds are samples and simple synth voices from `superdough`. Sample packs are about 300 MB, downloaded once (`npm run samples`), and the deployed page streams them from the Strudel CDN.
- **Harmony is not an axis** (rule 4). `key` and `progression` are section keys, roman numerals, diatonic to the section key, one chord per cycle. Not modelled: inversions, voice leading, chords longer than a bar. Post 2 should mention that this was a deliberate carve-out and move on.
- **`level` is not an axis either.** It is material: a plain gain multiplier applied after every axis phase. The axes have no volume, on purpose.
- **"Verified directionally" is the ceiling.** Six of the twelve axes are verified by a *proxy* metric and two by reading code. Nothing here claims to measure "spaciousness."
- **The axes are a taste, not a theory.** Twelve dimensions with these particular mappings is one person's carve-up of musical space. Do not present it as discovered structure.
- **`0.5` vs `.5`.** The repo writes `.5` everywhere; the dump prints `0.5`. Harmless, but readers will notice if you mix them in one code block.
- **The check output contains a U+2014 em dash** (`  — dreamy, bright, wide`) and the song files' header comments contain a right arrow. Both are verbatim output; flagging so the blog's no-em-dash rule gets a deliberate decision rather than an accidental violation.

**What will go stale:**

- Strudel pins `@strudel/core 1.2.6` / `@strudel/web 1.3.0`. Method names in the dump (`swingBy`, `arpWith`, `stepcat`, `nudge`, `clip`) are Strudel's and could move.
- **`scripts/snippets.mjs` is untracked in the working tree right now**, along with modifications to `README.md`, `index.html`, `package.json`, `scripts/mp3.mjs`, `web/mp3.mjs`, `test/mp3.test.mjs`. The `npm run snippets` workflow that post 1 uses is real and works, but it is not yet committed. Commit before the post cites it.
- The cell count (46/60) and the axis list will change if a layer is added. Both are computable from `strudelLib.cells` and `AXES`, so if a visual uses them, note the date or regenerate.
- Song contents change per commit. The check-table numbers above (`arrival`: 2751 events, 62 parts, arc peak 65.3) are as of `7a4d1b0`.
- README currently claims *"Five layers — drums, bass, melody, pad, fx"* under **Axes**, which reads as five slots per section; the numbered-part rule (`drums2`, `melody6`) is documented further down under Material. Not wrong, but easy to misread — worth not repeating the misreading.
- `docs/superpowers/` (the design spec) is gitignored and not in the repo; the README is deliberately the spec of record.

---

## 10. Proposed visuals

Four, in priority order. Your three candidates all survive; two are reshaped.

### V1 — "One line, twenty-two calls" (side-by-side code, the post's anchor)

**Kind:** quantitative-annotated code comparison, not a diagram.

Two panels. Left: two lines of `arrival.strudel` (the shared `const theme` and the one `melody:` line inside `section('contact', ...)`). Right: the 22-line `contact_melody` chain from section 3 Pair A, verbatim.

Annotations that carry the argument (each maps one left token to one or more right lines):
- `notes:` plus `phrase: 2` maps to `n("0 ~ 2 4@2 ...").slow(2)`
- `follow: true` maps to `.add(n("<0 5 2 6>"))`
- `sound: 'piano'` maps to `.s("piano")`
- `register: .55` maps to `.scale("D4:minor")`
- `brightness: .65` maps to `.lpf(3031.43)` *(and point at the `.lpf(2000)` above it: "the baseline, overwritten")*
- `articulation: .05` maps to `.clip(1.07) .attack(0.0455) .release(0.28)`
- `width: .7` maps to `.pan(sine.slow(4).range(-1, 1).mul(pure(0.2)).add(0.5))`
- `organicness: .6` maps to the two `rand.range(-1,1)` lines (timing and gain jitter)
- `level: 1.1` maps to `.mul(gain(1.1))`

Caption numbers: 1 line to 22 lines; 80 chars to 671 chars; this is 1 of 62 parts in a 59-bar piece.

This single figure does more work than any diagram, because the mapping is *legible* — every left-hand token has a right-hand consequence you can point at.

### V2 — The cell grid (your cube, flattened)

**Kind:** quantitative matrix, real data, 60 cells.

12 rows (axes, in `AXES` order) times 5 columns (`drums, bass, melody, pad, fx`). Each cell is one of:
- **filled**, labelled with the phase(s) it runs in — use the exact data in section 4;
- **empty**, marked as a deliberate no-op.

Encode `kind` on the row label (structural vs continuous) and `verification` as a small badge (direct / proxy / code). Real totals to print in the caption: **46 implemented, 14 deliberately empty (77%); per layer drums 11, bass 11, melody 10, pad 10, fx 4; per class 4 direct, 6 proxy, 2 code.**

Call out three empty cells by name in the figure itself, since they are the rule-2 argument: `drums x register` ("a kit has no pitch"), `pad x groove` ("a sustained chord has no offbeat"), `fx x density` ("one noise sweep has no density"). Footnote `drums x width`: implemented per voice inside `buildDrums`, so it carries no phase.

Do **not** draw a 3-D cube. The third dimension (sections) is not a fixed extent — arrival has 8 sections with between 2 and 13 parts each — so a cube would be a lie about the shape of the data. If you want the section dimension, use V3.

### V3 — The phase pipeline, with the collision (replaces "phase order" as a plain flowchart)

**Kind:** conceptual, ordered, with one worked numeric example.

Top: the seven phases as a left-to-right pipeline, `structural, timing, pitch, articulation, spectral, spatial, level`, with one-word labels for what each does to the material and a note that structural runs over a plain plan object before any pattern exists.

Bottom: the collision, as two traced paths through the `spectral` stage, using the real measured numbers:

```
                        brightness .8          weight .8
 declared   400 Hz  ->  .lpf(1050.61)   ->  .mul(lpf(0.85))  ->  893.02 Hz   correct
 reversed   400 Hz  ->  .mul(lpf(0.85)) ->  .lpf(1050.61)    ->  1050.61 Hz  weight erased
```

Annotate: "a second `.lpf()` replaces the first; it does not compose." Add the historical note from commit `4aa036c`: before the fix, `{brightness .9, weight .9}` and `{brightness .5, weight .9}` both produced cutoff 317.77.

This is the figure that converts rule 7 from a design principle into a bug you can see.

### V4 — The arc (the thing the language buys you)

**Kind:** quantitative, real data with units.

A horizontal band 59 bars wide, divided into the 8 sections at their true widths (1, 8, 8, 8, 8, 8, 12, 6 bars), each labelled with name and role, height proportional to energy:

```
void 1.7 · signal 5.6 · approach 25.2 · contact 49.4 · will 13.7 · plea 36.6 · threshold 65.3 · after 9.7
```

Units: *onsets per cycle summed over the section's parts, each scaled by its `level`*. Peak is `threshold` at 65.3, which is the `climax` role — the thing `npm run lint` checks for. Optionally stripe each block into its parts (2, 4, 9, 11, 7, 10, 13, 6 parts respectively) shaded by density, which is exactly what the bench's own arrangement strip draws.

Caption: this shape is a `console.log` line, produced by a headless run with no audio.

**A fifth, only if there is room:** the round-trip receipt, as a tiny table — `arrival.strudel` 2,751 events / 59 cycles; dump 2,751 events; 2,743 identical to 6 sig figs, 8 differing in the 6th digit of one cutoff. Might be better as inline prose than a figure.

---

## 11. Proposed audio clips

Format: `npm run snippets -- clips.json --out-dir <dir>`. Manifest entries are `{ out, song, section?, layer?, cycles?, kbps?, mono? }`, defaults 64 kbps mono. The bench page must be open: `npm run headless` first. Clips already present are skipped; `--force` re-renders.

Semantics verified in `index.html` `renderSong()`:
- no `section`: whole song, `cycles` defaults to the song's total;
- `section` only: starts at that section's offset, `cycles` counts **bars of the section**;
- `layer` requires `section`, and renders that part alone in section-local bar time.

Post 1 already ships `hook-arrival-contact`, `arrival-contact-drums`, `euclid-day-one`, `demo-drop`, `arrival-full` under `src/content/posts/never-read-the-code/audio/`. Do not re-render those; reuse or rename.

### The key one: the same passage, raw Strudel vs declarative — yes, achievable

**It works, and I verified it without rendering audio.** Method:

1. `node scripts/dump.mjs songs/demo.strudel` and take the `intro` block (both `const` chains).
2. Write a new plain-Strudel song file, `songs/demo-intro-raw.strudel`:
   ```js
   setcps(0.5)

   const intro_drums = stack(...)          // verbatim from the dump
   const intro_pad = n("<0 5>")...         // verbatim from the dump

   stack(intro_drums, intro_pad)
   ```
   (Drop the `await samples(...)` prebake header — the bench page has already prebaked those packs. It is only needed for a paste into strudel.cc.)
3. Render both with `cycles: 4`.

Verification I ran: `checkFile('songs/demo-intro-raw.strudel', 4)` produced **36 events, identical to the first 4 cycles of `songs/demo.strudel` — 36 of 36 matching**. So the two renders are the same audio, bit-for-bit modulo the dump's 6-sig-fig rounding of filter cutoffs.

**One constraint that must be respected:** pick a section at **offset 0**. A section pattern taken out of the song starts at its own cycle 0; cycle-dependent constructs (`<a b>` chord alternation, `saw.slow(8)`, `sometimesBy`) would land differently for a section that begins at bar 17. `demo`'s `intro` is `[0-4)`, so it is exactly right. `arrival`'s `void` is `[0-1)` but is only one bar and is nearly silent. Use `demo` `intro`.

`songs/demo-intro-raw.strudel` will have to be committed to the bench repo (the renderer only loads from `songs/`), which means it also appears in the public song picker on the deployed page. That is arguably a feature for this post — the reader can open it. If not wanted, render it locally and revert before pushing.

### Proposed manifest

```json
[
  { "out": "a-language-on-top-of-strudel/intro-declarative",
    "song": "demo.strudel", "section": "intro", "cycles": 4 },

  { "out": "a-language-on-top-of-strudel/intro-raw-strudel",
    "song": "demo-intro-raw.strudel", "cycles": 4 },

  { "out": "a-language-on-top-of-strudel/euclid-loop",
    "song": "euclid.strudel", "cycles": 4 },

  { "out": "a-language-on-top-of-strudel/arrival-void",
    "song": "arrival.strudel", "section": "void", "cycles": 1 },

  { "out": "a-language-on-top-of-strudel/arrival-threshold",
    "song": "arrival.strudel", "section": "threshold", "cycles": 4 },

  { "out": "a-language-on-top-of-strudel/threshold-melody-alone",
    "song": "arrival.strudel", "section": "threshold", "layer": "melody", "cycles": 4 },

  { "out": "a-language-on-top-of-strudel/threshold-melody2-alone",
    "song": "arrival.strudel", "section": "threshold", "layer": "melody2", "cycles": 4 }
]
```

What each demonstrates:

| Clip | Bars | Demonstrates |
|---|---|---|
| `intro-declarative` | 4 | The four-line `section('intro', ...)` call, played. |
| `intro-raw-strudel` | 4 | The 33-line expanded chain, played. **Identical audio** — the proof the dump is faithful. Present them as an A/B pair in one `SoundBite`. |
| `euclid-loop` | 4 | What Strudel is *good* at: 8 lines, 325 bytes, a complete groove. The "be fair to Strudel" exhibit. Post 1 already has this as `euclid-day-one`; reuse rather than re-render. |
| `arrival-void` | 1 | The floor of the arc (energy 1.7): two pad parts, nothing else. |
| `arrival-threshold` | 4 | The peak of the arc (energy 65.3): 13 parts at once. Play it against `arrival-void` and the `arc:` line becomes audible. |
| `threshold-melody-alone` | 4 | One part isolated: the piano theme that `follow: true` moves with the chords. |
| `threshold-melody2-alone` | 4 | The handchime signal, `follow: false`, which never moves with the harmony. Paired with the previous clip this is the one musical idea the post can afford to make, and it is a *structural* idea a non-musician can hear. |

At `bpm: 64` in 4/4 (cps 0.2667), 4 bars of `arrival` is **15 seconds**; at cps 0.5, 4 bars of `demo` is **8 seconds**. Both are within the 2-4 bar brief. `arrival-void` is one bar at 64 BPM, about 3.75 s.

If clip count needs cutting, the irreducible set is **`intro-declarative` plus `intro-raw-strudel`** (the equivalence proof) and **`arrival-void` plus `arrival-threshold`** (the arc). Everything else is optional.
