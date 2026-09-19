# Domain brief: `arrival` (strudel-bench), for the closing post of the Strudel Bench series

Repo: `E:\github2\strudle` (public: github.com/jonborchardt/strudel-bench). Song: `songs/arrival.strudel` (147 lines), provenance: `songs/arrival.notes.json` (10 requests). Every number below comes from the code or from `npm run check -- songs/arrival.strudel` (2434 events over 59 cycles) at the commit named in section 1, not from the docs. The old brief's two-wills, balance and register methods are kept and re-run; the whistle/"four rounds" narrative and the agent-feedback framing are dropped on purpose.

---

## 1. The piece as it stands

**Commit.** `songs/arrival.strudel` was last changed in **`3517d4d`, 2026-09-19 00:07:35 -0700, "promoted mixed versions"** (the `-mixed` twin written in `ef3dcd2` 21:41 and `caac41e` 23:43 on 09-18 replaced the original; `songs/arrival-mixed.strudel` was deleted in the same commit). Repo HEAD when read: `828c550` (00:16:45 same day), working tree clean. `npm run check` ok, `npm run lint` clean. Pin every number to `3517d4d`.

The old post cites `7a4d1b0` (2026-09-13 00:52, a dump change; the song then was the `bc61b6e` state). Between that and now the song changed in `7d93908` (09-13, `// @blog` line only), `4b97ac9` (09-18 21:01, threshold pad widths .95/.9 to .75, ~49 to ~37 voices) and `3517d4d` (the mixing pass).

**Header facts.** `song({ bpm: 64, key: 'D:minor', seed: 41, kit: 'RolandTR808', packs: ['rooms'], room: { ir: 'hall', size: 3.2, damping: 4500 } }, ...)`. 4/4, cps 64/60/4 = 0.2667, one cycle = one bar = 3.75 s. **59 bars = 221.25 s (3:41).** `kit: 'RolandTR808'` is still vestigial: all five drum voices are overridden and `fx.impact` resolves to the Dirt kick `bd` (`10_bd_switchangel.wav`).

| # | Section | Bars | Cycles | Role | Key | Progression | Chords | Parts | Voices (outside) | Energy | Form |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | void | 1 | 0 | establish | D minor | `i` | Dm | 2 | 7 (4) | 1.1 | A |
| 2 | signal | 8 | 1-8 | establish | D minor | `i VI` | Dm Bb | 4 | 12 (4) | 4.1 | B |
| 3 | approach | 8 | 9-16 | develop | D minor | `i VI VII` | Dm Bb C | 9 | 22 (4) | 21.6 | C |
| 4 | contact | 8 | 17-24 | climax | D minor | `i VI III VII` | Dm Bb F C | 11 | 31 (2) | 57.6 | D |
| 5 | will | 8 | 25-32 | develop | D phrygian | `i II i II` | Dm Eb Dm Eb | 7 | 14 (4) | 14.4 | E |
| 6 | plea | 8 | 33-40 | develop | F major | `I V vi IV` | F C Dm Bb | 10 | 26 (3) | 37 | F |
| 7 | threshold | 12 | 41-52 | climax | D minor | `i VI III VII` | Dm Bb F C | 13 | 37 (3) | 67.3 | G |
| 8 | after | 6 | 53-58 | release | D minor | `i VI` | Dm Bb | 6 | 18 (4) | 7.4 | H |

"Cycles" are 0-based cycle indices, which is how the old post's "bars 17-20" was counted. One-based, contact is bars 18-25. Say "cycles 17 to 20" or "the first four bars of contact" and the ambiguity goes away; void was already one bar when the old numbers were taken, so nothing shifted.

**Arc line, verbatim:** `arc: void 1.1 ▁ A · signal 4.1 ▁ B · approach 21.6 ▃ C · contact 57.6 ▇ D · will 14.4 ▂ E · plea 37 ▅ F · threshold 67.3 █ G · after 7.4 ▂ H`. Energy = onsets per cycle summed over parts, each scaled by `level` (level-weighted onsets per bar, not loudness). Threshold is the peak, as lint requires of a climax. Form letters are all different: every section has a different set of sounding parts, so the form is through-composed by the checker's own rule. Voices = simultaneous hits (length plus release) per the check header; "outside" = the hand-written textures. Threshold's 37 is under the lint's 40 ceiling since `4b97ac9`.

**Counts.** 62 part instances (2/4/9/11/7/10/13/6). 2434 events (was 2751 before the pass: the wide pads no longer `jux` a doubled copy). 28 distinct `s` values: 26 named samples plus `brown` and `white` noise synths.

**Distinct instruments, with the file the check's sounds block names:**

```
pipeorgan_quiet          pitched, 21 samples A1..F#5
psaltery_bow             pitched, 11 samples A#3..G#4
super64_vib              pitched, 13 samples C2..G5
handchimes               pitched, 19 samples A#3..G#5
pipeorgan_loud_pedal     pitched, 11 samples A1..F#3
piano                    pitched, 29 samples A0..C8
recorder_alto_sus        pitched, 12 samples A#3..G#4
tubularbells             pitched, 9 samples A#3..G#3
harp                     pitched, 23 samples A2..G5
pipeorgan_loud           pitched, 21 samples A1..F#5
vibraphone_bowed         pitched, 6 samples A2..G3
vibraphone               pitched, 11 samples A2..G3
wineglass_slow           pitched, 4 samples D#4..D5
belltree                 pitched, 6 samples A#5..G#5
timpani:0                Timpani1_Hit_v2_rr1_Sum.wav (30 variants)
snare_low:0              RopeSnare_low_ns_Main_vl1_rr2.wav (20 variants)
triangles:0              Triangle1_HitFM_v1_rr1_Mid.wav (37 variants)
sus_cymbal:0             susCymb1_bow_13.wav (25 variants)
bassdrum2:0              bassdrum_cresc_med.wav (30 variants)
bd:0                     10_bd_switchangel.wav (8 variants)       <- the fx impact, a Dirt kick
timpani_roll:0           Timpani1_Roll_v3_rr1_Sum.wav (10 variants)
gong:0                   gong_2_f.wav (7 variants)
gong2:0                  hit_full1.mp3 (6 variants)
framedrum:0              HDrumL_Hand_rr1_Sum.wav (18 variants)
didgeridoo:8             Didgeridoo1_Sus2_Main.wav (12 variants)
wind:0/1/2               000_wind1.wav, 001_wind10.wav, 002_wind2.wav (10 variants)
brown, white             noise synths
hall:0                   hall.wav (1 variant)                     <- the room impulse, not an instrument
```

(The sample ranges are listed alphabetically by the pack, not by pitch: "A#3..G#3" for the bells means nine samples all inside octave 3.)

A small surprise in the textures: `shimmer = s("<belltree marktrees>").struct("<x ~ ~ ~>")`. Inside an `arrange` block the pattern's cycle count restarts at 0, the struct fires on cycles 0, 4, 8 and the sound alternation picks `belltree` on even cycles, so **`marktrees` never sounds** (it is absent from the sounds block; belltree plays 7 times). Harmless, but a nice one-line example of "the name in the file is not what plays".

---

## 2. Claim-by-claim audit of the existing post against `3517d4d`

### Theme and signal definitions (post lines 81-84)

The post quotes a trimmed pair. The current lines are (file lines 19 and 21):

```js
const theme    = { sound: 'piano', follow: true, phrase: 2, notes: '0 ~ 2 4@2 ~ 5 4@2 0 ~ 2 4@2 ~ 7 6@2', register: .55, articulation: .05, brightness: .6, space: .32, weight: .58, width: .5, position: .1, velocity: '.85 1 .9 1 .8 1 .9 .95', humanize: { timingMs: 12, velocity: .1, correlation: 'phrase' } }; // closer; played (a seeded, phrase-correlated feel), not diced per hit
const signal   = { sound: 'handchimes', follow: false, notes: '0 ~ ~ 6 ~ ~ 3 ~ ~ 0 ~ ~ 6 3 ~ ~', register: .85, articulation: .35, space: .9, width: .7, level: .6, organicness: 0, position: .35 };
```

The trimmed quote (`sound`, `follow`, `notes`) is still accurate as a trim. "One boolean is the entire difference" is still true of pitch: `buildMelody` adds `S.n(ctx.chords)` and `S.note(ctx.chordAcc)` only when `plan.follow`. But the theme now also carries `position .1`, a `velocity` line and `humanize`, which the signal does not; if the post wants "one boolean" to stand, say "one boolean is the entire difference in *pitch*; the mixing pass added three more differences in placement and feel".

### The four-bar MIDI table for contact (post lines 62-77)

Recomputed by querying events (cycles 17-20, chords Dm Bb F C):

| Cycle (bar) | Chord | Piano, `follow: true` | Handchimes, `follow: false` |
|---|---|---|---|
| 17 (18) | Dm | 62, 62, 65, 69, 70, 69 | 74, 84, 79, 74, 84, 79 |
| 18 (19) | Bb | 70, 74, 77, 82, 82, 81 | 74, 84, 79, 74, 84, 79 |
| 19 (20) | F | 65, 69, 72, 74, 72 | 74, 84, 79, 74, 84, 79 |
| 20 (21) | C | 72, 76, 79, 84, 82 | 74, 84, 79, 74, 84, 79 |

Cycles 21-24 repeat with one more doubling (cycle 22: 70, 70, 74, 77, 82, 81, 81). Tubular bells: 50 (D3) at beat 1, 60 (C4) at beat 4, every bar.

The old post's rows (62, 65, 69, 70, 69 etc.) are the same events with the **doubled notes dropped**: `density: .55` is above the midpoint, so `sometimesBy(.1, ply(2))` splits a seeded 10% of notes into two, and the old table listed distinct pitches per bar. I ran the same script on the file at `7a4d1b0` and got byte-identical piano events, so nothing moved; the old table was a simplification, not an error. Either keep it (say "distinct pitches") or print the repeats. The chime line is exactly identical in all 8 bars of contact and, sorted, in every D-minor and D-phrygian section (74 D5, 79 G5, 84 C6). Bar numbers: contact starts at cycle 17; label the rows as cycles or as bars 18-21.

The onset times show the new mechanism: chimes in contact land at exactly 0, .188, .375, .563, .75, .813 of the bar; the piano at .003, .058, .225, .335, .668, .78 (0 to 12 ms late, `humanize.timingMs: 12`, late only by design so a render never drops a hit moved before its start).

### "Humanise does nothing below its midpoint" (post lines 102-105)

Still true, of `organicness`: `defineOrganic` returns the pattern untouched for any number at or below .5, and the chimes and bells still write `organicness: 0`, which the check still prints as "very mechanical". So "writing zero is identical to leaving it out" stands.

What changed: the **theme no longer uses organicness at all** (`organicness: .6` is gone). It has `humanize: { timingMs: 12, velocity: .1, correlation: 'phrase' }`, and the pulse has `humanize: { timingMs: 15, velocity: .12, correlation: 'bar' }`. `humanize` is mix material in `lib/song.mjs` (`withHumanize`), not an axis: three seeded curves (a slow wave over the correlation span, a fixed lean per beat position, a small residual) move timing (0..timingMs late), gain (plus or minus `velocity`) and clip length together, the same way every play. Organicness is `rand` per hit (dice); humanize is correlated and reproducible. So the post's sentence "The human line carries timing jitter, which the alien line does not" is now true by a real mechanism (12 ms correlated lateness on the piano, none on the chimes) rather than by a dice roll. Rewrite the caveat as: the axis word (`organicness: 0`) still cannot say "dead on the grid" any louder than omitting it; the piece now gets its human/alien timing difference from a different, honest control that the mixing pass introduced.

### The plea modulation (post lines 107-131)

Recomputed. Handchime pitch sets per section: signal, approach, contact, will, threshold, after: **74 D5, 79 G5, 84 C6** (two stacked perfect fourths). plea (F major): **77 F5, 82 Bb5, 88 E6**: F to Bb is 5 semitones (a fourth), Bb to E is 6 (a tritone). In line order the degrees 0, 6, 3 give D5, C6, G5 in D minor and F5, E6, Bb5 in F major. Bells do not play in plea. `follow: false` skips the chord root only; `keyAt(ctx.key, octave)` still runs the degrees through the section key. Still true, still unfixed, still the most alien moment by accident. `alien-plea` renders `plea` layer `melody4` (the signal is `melody4` in plea; harp is `melody2`, winds `melody3`).

### The balance table (post lines 161-182)

Same method as the old brief: sum of the per-event `gain` control per side per section, human = piano + harp + recorder + (threshold only) the doubling voice, alien = handchimes + tubular bells. Textures excluded. Numbers now include the mixing pass's level changes (harp .55 to .8 and .6 to .9 in threshold; winds .45 to .35; bells .5 to .7, 1 in threshold; chimes .8 to .7 in threshold; the doubling .45 glockenspiel to .2 vibraphone). The theme now also carries a `velocity` line, which superdough multiplies under gain; the second number counts it.

| Section | Human (gain) | Human (gain x velocity) | Alien | H : A | Old post |
|---|---:|---:|---:|---:|---|
| void | 0 | 0 | 0 | | 0 / 0 |
| signal | 0 | 0 | 8.35 | alien alone | 0 / 8.4 |
| approach | 21.32 | 20.07 | 8.35 | 2.6 : 1 | 22.1 / 8.4 |
| contact | 82.51 | 80.43 | 24.19 | 3.4 : 1 | 66.9 / 22.3 |
| will | 7.41 | 6.30 | 22.08 | 0.34 : 1 (alien) | 7.3 / 20.2 |
| plea | 78.53 | 76.93 | 5.14 | 15.3 : 1 (human) | 63.2 / 5.1 |
| threshold | 150.54 | 146.50 | 53.81 | 2.8 : 1 | 129.2 / 53.0 |
| after | 3.22 | 3.01 | 7.74 | 0.42 : 1 (alien) | 3.3 / 6.8 |

The arc is unchanged in shape: alien alone, human arrives, human leads at contact, alien wins will, human wins plea by more than before, human leads at the peak, alien has the last word. The velocity column barely moves it.

**Per-instrument climax comparisons (post line 184-186: "17 percent" and "12 percent").** Both stale.
- contact: piano 26.45 vs chimes 17.47 + bells 6.72 = 24.19: **piano +9%** (with velocity: 24.37 vs 24.19, **+0.7%**, a dead heat). Was +17%.
- threshold: piano 50.10 + vibraphone 4.39 = 54.49 vs chimes 34.61 + bells 19.20 = 53.81: **+1.3%** (with velocity: 50.45 vs 53.81, **alien +6.7%**). Was +12%.
The bells went from .7 to level 1 at the peak and the doubling voice dropped from .45 to .2, so "the human side wins on headcount, not on level" is now more true than when it was written: per instrument the two climaxes are within a few percent, and counting the velocity line the alien side edges the finale.

Caveat to keep: summed gain is not loudness; the chimes sit an octave above the piano. New caveat: the measured mix (notes.json, 09-19) put the piano theme 8 dB under the mix, the choir 20, the organ 11 and the doubling 15 at threshold. Gain sums and dB readings are different instruments; say which one a sentence uses.

### The register table (post lines 198-222)

Recomputed, all sections, numeric notes only (the 25 wineglass texture notes are note names and are skipped):

| Instrument | Events | Min | Median | Max | Median Hz |
|---|---:|---|---|---|---:|
| didgeridoo (will bass) | 8 | D0 (14) | 14.5 (D0/D#0) | D#0 (15) | 18.9 |
| pedal organ (`pipeorgan_loud_pedal`) | 112 | D0 (14) | C1 (24) | A2 (45) | 32.7 |
| quiet organ | 101 | D2 (38) | A#2 (46) | A3 (57) | 116.5 |
| loud organ | 48 | D2 (38) | C3 (48) | A#3 (58) | 130.8 |
| tubular bells | 72 | D3 (50) | 55 (36 each of 50 and 60) | C4 (60) | 196 |
| bowed strings (`psaltery_bow`) | 173 | D2 (38) | F4 (65) | A#5 (82) | 349.2 |
| choir (`super64_vib`) | 216 | D4 (62) | C5 (72) | A#5 (82) | 523.3 |
| piano | 217 | D4 (62) | C5 (72) | C6 (84) | 523.3 |
| recorder | 92 | F4 (65) | F5 (77) | D6 (86) | 698.5 |
| handchimes | 278 | D5 (74) | G5 (79) | E6 (88) | 784.0 |
| bowed vibraphone | 96 | D5 (74) | B5 (83) | G6 (91) | 987.8 |
| **vibraphone** (was glockenspiel) | 42 | D5 (74) | C6 (84) | C7 (96) | 1046.5 |
| harp | 448 | D5 (74) | D6 (86) | D7 (98) | 1174.7 |

Every median and range in the post's table is unchanged except the row label: **glockenspiel is now vibraphone** (same notes, different sample; the glockenspiel sample measured 41 dB under the mix and could not be placed). Event counts halved for strings (346 to 173), choir (264 to 216) and bowed vibraphone (192 to 96) because width .8 and above was `jux(rev)`, a doubled copy of every hap, and the pass brought those widths to .75 (a pan sweep). The two-semitone gap between C4 (60) and D4 (62) still holds; nothing sounds in it. `register` still quantises to octaves (`melodyOctave`, pad `octave` 3/4/5, bass 1/2/3).

Strings per section, unchanged: void D2 only; signal 50-65; approach 62-79; contact 62-82; will 50-58; plea 65-81; threshold 50-70 (`weight: .8` drops the voicing an octave); after 62-77. The straddler paragraph stands as written.

**Tubular bells alternating D3 and middle C**: true, 50 at beat 1 and 60 at beat 4 in every bar they play (contact, will, threshold, after; register .3 or .2 both give octave 3). The 9-sample map is all inside octave 3, so C4 is a resample. **Pedal organ at ~18 Hz stretched 19 semitones**: true, lowest note 14 = D0 = 18.35 Hz, map bottoms at A1 (55 Hz, MIDI 33), 19 semitones.

### The piano delay-send bug (post lines 312-342)

**Still live, and now doubly misdescribed by the header.** The header (lines 17-18) still says "The piano keeps one setting for the whole song: space .5 (room only; anything above sends it to a delay line...)". The theme's space is now **.32** (room send .128, no delay: the cell is `noopBelow` at .5 and `piece(0, .2, .9)(.32) = .128`). But two per-section overrides restored by the 09-12 `fixes` commit are still there and above .5:

- `will.melody` `space: .8` -> `delay .24`, **12 piano events**
- `after.melody` `space: .9` -> `delay .32`, **6 piano events**
- `threshold.melody6` (the vibraphone doubling, `space: .8`) -> `delay .24`, **42 vibraphone events**

Same counts as the old post (18 piano, 42 doubling), with the doubling voice renamed. Delay time is superdough's default `delaysync: 3/16` cycle = 0.703 s at this tempo, three quarters of a beat, feedback default. The mixing agent's own note (09-19, "closer on the theme") says: "the piano's delay-line note in the header still holds, .32 is below the .5 line". It checked the constant and not the overrides. Two measured mixing passes did not touch it because they measured `threshold`, where the piano is at .32.

Events carrying `delay` in total: 950 (harp 448, handchimes 278, recorder 92, bells 72, vibraphone 42, piano 18). The others are by design (their space is above .5 on purpose).

Note also that since the pass every part in a section shares **one orbit** (`room.size` is set, so `orbitKey` returns `'room'` for every part), and superdough's delay lives on the orbit: the piano's 18 delayed events feed the same delay line as the harp and chimes. Not a new bug, just what "one bus" means.

### Textures: 60 bars against 59 (post lines 344-350)

Still true. `arrange([2],[8],[8],[8],[8],[8],[12],[6])` = 60 bars against the score's 59 (void is 1 bar; the first texture block is still 2). Verified in events: the gong that belongs to contact (cycle 17) first fires at cycle **18**; the deep bass drum at 18; the heartbeat frame drum runs cycles **26 to 33** (will is 25-32, so it bleeds one bar into plea); the timpani roll (approach block) fires at 13, 37, 41; the closing gong at 54 (after starts 53). `stack(score, textures.size(.9))` stacks a 59-cycle loop with a 60-cycle loop, so on every repeat the textures slip one more bar. The mixing pass moved `.size(.9)` from the stack onto the textures and rewrote the reverb comment, but did not change the block lengths.

### Two bars of `will` with no human theme (post lines 370-373)

Still true. Piano onsets per cycle in will: **0, 1, 3, 2, 1, 0, 3, 2** (cycles 25 and 30 empty). `density: .3` -> `degradeBy(.32)`. The notes played are D4 (62), Eb4 (63), F4 (65): the phrygian half-step sigh on `i`, whole step on `II`. The didgeridoo bass plays D0 and Eb0 (14, 15).

### "No counterpoint / parallel motion" (post lines 359-362)

Still true for this song. `buildPad` stacks `chordTones(n)` on the chord root; all voices move in parallel. The **language** now has inversions (`/1`, `/2` after a numeral) and `follow: 'tones'` for melodies, so "inversions are explicitly not modelled" is outdated as a statement about the language: say "arrival uses none of them". Its six progressions (`i`, `i VI`, `i VI VII`, `i VI III VII`, `i II i II`, `I V vi IV`) contain no `/1`, `/2`, `@n` or seventh. Voice leading is still not modelled (README: "Not modeled: voice leading, chord symbols").

### One tempo (post line 375)

True. `bpm: 64` on the song, no section `bpm`/`cps`. 221.25 s.

### The triangle loudest at the finale (post lines 378-388)

By summed per-event gain in threshold, recomputed with `level: 2` and `weight: .9`:

| Voice | Sum gain | Events | Mean gain |
|---|---:|---:|---:|
| triangles (hh slot) | **222.68** | 96 | 2.32 |
| harp | 88.13 | 192 | 0.46 |
| timpani (bd) | 56.60 | 24 | 2.36 |
| piano | 50.10 | 79 | 0.63 |
| pedal organ | 42.24 | 48 | 0.88 |
| handchimes | 34.61 | 95 | 0.36 |
| bowed strings | 27.35 | 48 | 0.57 |
| snare_low (sd) | 27.18 | 12 | 2.27 |
| tubular bells | 19.20 | 32 | 0.60 |
| loud organ | 15.60 | 48 | 0.32 |
| bowed vibraphone | 15.39 | 96 | 0.16 |
| recorder | 7.92 | 38 | 0.21 |
| vibraphone | 4.39 | 42 | 0.10 |
| choir | 4.09 | 48 | 0.09 |

The triangle's lead doubled (was 111.36 vs harp 58.75) because the whole pulse now has `level: 2`. **But the claim needs reframing**, because the mixing pass measured the opposite: at level 1 the timpani pulse was 30 dB under the mix ("inaudible"), and level 2, the top of level's range, brought it to 21 dB under ("felt"). The triangle and timpani samples are quiet files; a gain of 2.3 on a quiet file is still quiet. So: by the score's own per-event gain the triangle is the loudest voice in the finale by a factor of 2.5; by the render the entire pulse sits 21 dB under the mix; the number the language exposes and the number the ear reports disagree, and the pass sided with the ear by turning the knob all the way up. That is a better sentence than the old one.

### The `answer` string and the hand-written variants

`const answer = { ...theme, notes: '0 ~ 2 4@2 ~ 5 4@2 7 6 5 4@2 ~ 2 0@2' };` unchanged. In threshold cycle 42 (over Bb) it plays 82, 81, 79, 77, 74, 74, 70: descends and lands on the chord root Bb4 (70). Four hand-written strings in total: `theme`, `answer`, the will sigh (`'0 ~ ~ ~ 1 ~ 0@2 ~ ~ ~ ~ 1 ~ 0@2'`), the after fragment (`'0 ~ 2 4@2 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~'`); `melody6` reuses `theme.notes`. "Three further hand-written versions" stands.

### Other lines in the post to check

- "62 parts, 28 distinct instruments, three minutes forty-one": all still true.
- "`void` is one bar: an organ chord and a drone": pad (quiet organ, D2) + pad2 (bowed strings, D2 at level .5) + textures (wind .1, drone .25, brown .1). Fine.
- "`threshold` ... thirteen parts": true.
- "Try muting the handchimes" (StrudelEmbed): still `melody2` in threshold.
- The `Callout` "commit `7a4d1b0`, read on 2026-09-13" must become `3517d4d`, read 2026-09-19.
- The description ("four rounds of being confidently wrong") goes with the dropped section.
- "the piano was at 0.75" (line 317) describes the 09-12 original; the constant is now .32 and the bug is the two overrides.

---

## 3. The mixing pass as it landed in this song

**Header paragraph, verbatim (lines 7-15):**

> Mixed as a scene: before the mixing pass `threshold` had the impact as the mix (4.8 dB under it), the choir as loud as the piano theme (9 dB down, and sharing the mids with the organ and the bowed vibraphone), the timpani pulse 30 dB down and the glockenspiel doubling 41 dB down (both inaudible), and every part dead centre in its own room. Now: one hall on the song with each part's space as its send (the textures keep their own sizes, so the outer .size() moved onto them); the impact and riser set back; the pulse up to where it is felt; the piano theme kept in front, a little right, with a phrase-shaped velocity line; the alien signal and the bells together on the right, the harp and the recorders on the left; the doubling a vibraphone (the glockenspiel sample is too quiet to place) far left; the choir behind and to the right, darker, so the organ keeps the low mids; the strings wide and a little left; the bowed vibraphone left. `npm run measure -- songs/arrival.strudel threshold` shows the table.

And lines 31-32: "second pass: a generated hall (samples/user/rooms, 3.2 s, 30 ms pre-delay) instead of the synthetic tail; the piano and the pulse humanized (seeded, correlated) instead of organicness (dice per hit); the bells compressed; depth by the closer/farther words on the theme, choir and arp."

**Every mix material now in the file** (mix keys live in `lib/song.mjs` `MIX_KEYS`: level, position, duck, duckDepth, duckAttack, velocity, humanize, compressor; `room` is a song/section key):

| Where | Material | Value | Before the pass |
|---|---|---|---|
| song | `packs` | `['rooms']` | none |
| song | `room` | `{ ir: 'hall', size: 3.2, damping: 4500 }` | none (`stack(score, textures).size(.9)`) |
| theme (piano) | `space` | .32 | .5 |
| theme | `weight` | .58 | unset. **No-op:** the melody layer has no `weight` cell (only density, variation, register, brightness, space, articulation, aggression, groove, organicness, width); the `closer` word writes `{ brightness +.12, space -.18, weight +.08 }` and the weight part landed on nothing. Piano gains confirm no multiplier. |
| theme | `position` | .1 | 0 |
| theme | `velocity` | `'.85 1 .9 1 .8 1 .9 .95'` (one bar of 8 steps, so it repeats per bar under the two-bar phrase) | none |
| theme | `humanize` | `{ timingMs: 12, velocity: .1, correlation: 'phrase' }` | `organicness: .6` |
| signal (chimes) | `space` .9, `width` .7, `position` .35 | | .95, .8, none |
| bells | `space` .95, `width` .8, `level` .7, `position` .35, `compressor { threshold: -18, ratio: 3 }` | | 1, .9, .5, none, none |
| harp | `space` .75, `width` .6, `level` .8, `position` -.3 | | .8, .7, .55, none |
| winds | `space` .7, `level` .35, `position` -.2 | | .85, .45, none |
| strings | `width` .75, `position` -.15 | | .85, none |
| organ | `space` .85, `level` .6 | | .9, .7 |
| choir | `width` .8, `brightness` .23, `space` 1 (the literal has `space: .9` and then `space: 1`; the second wins), `weight` .42, `level` .2, `position` .3 | | .9, .4, .9, unset, .4, none |
| pedal | `space` .4, `level` .8 | | .6, unset |
| pulse (drums) | `space` .8, `humanize { timingMs: 15, velocity: .12, correlation: 'bar' }`, `level` 2 | | .9, `organicness: .3`, unset |
| signal.pad3 | level .15 | | .25 |
| approach.fx, plea.fx | level .5 | | unset |
| contact | melody width .6; melody5 level .4; pad width .75; pad3 brightness .4 level .2; fx level .3 | | .7; .5; .9; .5/.5; unset |
| will | bass space .35; melody space .8; melody3 level .8 | | .4; .9; .6 |
| plea | drums space .9; melody3 level .4; pad width .75; pad2 brightness .4 level .2; pad3 level .45 | | .95; .5; .9; .5/.5; .5 |
| threshold | melody width .6; melody2 level .7; melody3 level 1; melody4 level .9; melody5 level .4; **melody6 = `{ sound: 'vibraphone', follow: true, phrase: 2, notes: theme.notes, articulation: .05, register: .8, density: .3, level: .2, space: .8, width: .6, position: -.45 }`**; pad level 1; pad2 brightness .3 level .5; pad3 brightness .4 level .2; pad4 brightness .68 space .98 weight .52 position -.35; fx level .3 | | .8; .8; .7; .6; .55; glockenspiel spread from theme with register .9 density .3 level .45 space .95 width .9; 1.1; .35/.6; .6/.55; .8/unset/unset/none; unset |
| after | melody space .9; melody3 level .6; pad width .75; pad3 level .2 | | .95; .4; .8; .3 |
| textures | `stack(score, textures.size(.9))` | | `stack(score, textures).size(.9)` |

No `duck` anywhere. On the haps: `pan` on 2169 events, `velocity` on 217 (piano only), `compressor` on 72 (bells), `roomsize`/`roomlp`/`ir` on all 2261 part events (3.2 s hall, damping 4500; the 173 texture events keep `roomsize .9` and no ir), one orbit per section for every part (the textures on the default orbit), `shape` on 276 (drums weight above .5, bass aggression), `distort` on 56 (bass aggression .55 in will and threshold).

The hall: `samples/user/rooms/hall.wav`, CC0, "generated by scripts/ir.mjs (npm run ir): shoebox impulse responses ... hall.wav 30 ms pre-delay, 3.2 s decay, 128 early reflections" (pack.json). `room.size` truncates an IR, never stretches it; `damping` is superdough's `roomlp`.

**Recorded whys, notes.json, briefly.** Request 9 (09-19, "add a -mixed version ... without altering the originals"): room size 2.6 fade .5 damping 4500, "one hall for the score, each part's space as its send"; threshold fx level 1 to .3, "the impact was the mix (4.8 dB under it); now 12"; drums level 1 to 2, "the timpani pulse was 30 dB under the mix (inaudible); the sample is quiet, at the top of level's range it is felt at 21"; melody6 glockenspiel to vibraphone, "the doubling was 41 dB under the mix (inaudible); a vibraphone at register .8 is loud (3 dB under the mix at level 1), so level .2 puts it at 15, far left"; pad3 level .55 to .2, "the choir was as loud as the piano theme (9 dB under the mix) and sharing the mids with the organ; darker, behind and to the right at 20; the organ keeps the low mids at 11"; pad4 "the bowed vibraphone arp set left; it still shares the mids with the organ and choir by the masking table (level-independent), left as the register already separates them"; melody position 0 to .1, "the piano theme kept in front (8 dB under the mix) with a phrase-shaped velocity line; the alien signal and bells right, the harp and recorders left". Request 10 (09-19, "use the new mixing tools on the -mixed songs: impulse-response rooms, humanize, compressor, depth words"): room synthetic to `hall`; melody humanize "organicness .6 (dice per hit) replaced by a seeded, phrase-correlated feel (12 ms, velocity .1)"; drums humanize "the pulse's organicness .3 replaced by a bar-correlated feel (15 ms)"; bells compressor "threshold -18 ratio 3: the bells strike twice a bar, spiky"; melody space .5 to .32, "closer on the theme: weight up (.58); the piano's delay-line note in the header still holds, .32 is below the .5 line"; pad3 space .9 to 1, "farther on the choir: darker (.23), lighter (.42)"; pad4 space .8 to .98, "farther on the bowed arp: darker (.68), lighter (.52)". Both requests were written against `arrival-mixed`; `3517d4d` promoted that file over `arrival` and the notes are keyed to `arrival.notes.json`.

Do not run `measure` here (the mixing post's agent does); the dB readings above are the recorded ones.

---

## 4. The story for a product-review reader

**What a piece made in this language looks like, honestly.** One 16-step degree string transposed by chord root (the human theme), one 3-note ostinato that refuses to transpose (the signal), six roman-numeral progressions, twelve constants of instrument settings spread into 62 parts over eight sections, eleven hand-written Strudel textures stacked around it, and now a mixing layer of positions, one hall, a velocity line, two humanize curves and one compressor. It has a real dramatic arc that the checker can print as one line, a two-wills idea that is verifiable to the note, a fear/hope split that the register control enforces by octave, and it cannot write a second phrase, change tempo, or voice a chord in anything but parallel.

**Strongest beats, in order:**

1. **The two wills are one boolean, and you can read the proof off the event stream.** The table in section 2. Then the plea break: `follow: false` is narrower than the composer's intent, and the language has no way to say "these three absolute pitches, always". The most alien moment is an accident of semantics.
2. **The balance is measurable and has a shape**: alien alone, human arrives, human leads, alien wins will, human wins plea, near-parity at the peak (per instrument the finale is within 1.3%, or the alien edges it once the velocity line counts), alien last word. "Neither wins" was the brief; the file does something better.
3. **Fear low, hope high is in the numbers with a two-semitone gap at middle C** and one straddling voice, the strings. Unchanged by the pass.
4. **The mixing pass is the "what a second draft looks like" beat.** Before: impact louder than the mix, choir as loud as the theme, pulse and doubling inaudible, everything centred in its own room. After: one measured hall, a stage (piano front-right, alien right, harp/recorders left, doubling far left, choir behind-right), the pulse turned up to the top of the knob because the sample is quiet, the glockenspiel swapped for a vibraphone because it could not be placed, dice-per-hit organicness replaced by a correlated humanize on the two "played" parts, a compressor on the one spiky part. The gain-sum "triangle is loudest" number and the dB measurement disagree; the pass believed the measurement.
5. **What survived two measured passes untouched: both live bugs.** The delay send on the piano in will and after (and on the new vibraphone) and the one-bar texture offset. The mixing agent even wrote "the delay-line note in the header still holds, .32 is below the .5 line" while the overrides above .5 sat forty lines down. Measurement was of `threshold`, where neither bug lives; pin, mute and section renders drop the textures. The tools looked exactly where they were pointed.

**Surprising findings this time:**
- `weight: .58` on the piano is a no-op: the melody layer has no weight cell, and the `closer` depth word wrote it anyway. The language accepted it (any axis name is a valid key on any layer; "an empty cell honestly says no implementation") and the check prints nothing for it.
- `marktrees` never sounds (see section 1).
- Every part of a section is on one orbit now, so the piano's residual delay sends share a delay line with the harp and chimes.
- The `choir` literal sets `space` twice (.9, then 1).
- Event count fell from 2751 to 2434 with no notes removed: the wide pads were being doubled by `jux`.
- The header's piano sentence is now wrong twice: the constant is .32 not .5, and two sections override it above .5.

**Caveats:** summed gain is not loudness (say "by the score's own per-event gain"); dB readings are from the mixing agent's measure run on `threshold` and are quoted, not re-measured; `npm run check` runs in Node with no sound map, so drum-voice names resolve as written; the doubling in the two-wills table is seeded and stable but is a density artefact, not a written note; the humanize offsets are up to 12 ms and only ever late.

**Phrasing to avoid** (routine repo change falsifies it; pin to `3517d4d` instead): "two bugs in it right now"; "the file still carries a comment describing a state it is no longer in" (true today, one edit away from false); "the last two commits have no entry" (they do now, ten requests); "13 parts"/"37 voices" if anyone touches threshold; "the loudest voice is the triangle" without the gain-vs-dB qualifier; any dB number as if it were current; "glockenspiel" anywhere (it is a vibraphone now); "inversions are not modelled" (the language has them; arrival does not use them); "commit called `fixes`" (that narrative is dropped, and the `4accadc` diff is now buried under the mixing diff).

---

## 5. Proposed visuals (three), with current data

### V1: The two wills (contact, cycles 17-20, chords Dm | Bb | F | C)

Two pitch contours over a chord track, y = MIDI, plus a flat bell line. Human (piano): cycle 17: 62, 62, 65, 69, 70, 69 / 18: 70, 74, 77, 82, 82, 81 / 19: 65, 69, 72, 74, 72 / 20: 72, 76, 79, 84, 82 (or the distinct-pitch version: 62 65 69 70 69 / 70 74 77 82 81 / 65 69 72 74 72 / 72 76 79 84 82; say which). Onset fractions within the bar, piano: .003, .058, .225, .335, .668, .78 (cycle 17); chimes: 0, .188, .375, .563, .75, .813 every bar. Alien (handchimes), identical every bar: 74, 84, 79, 74, 84, 79. Bells: 50 at 0, 60 at .75. Companion panel for the plea break: chimes 77, 88, 82 (sorted 77, 82, 88) with interval brackets 5+5 in D minor vs 5+6 in F major.

### V2: Who is winning (balance)

Diverging bars per section, human above, alien below. Data: void 0/0; signal 0/8.35; approach 21.32/8.35; contact 82.51/24.19; will 7.41/22.08; plea 78.53/5.14; threshold 150.54/53.81; after 3.22/7.74. Unit: summed per-event gain, dimensionless, not dB. Optional per-instrument inset for the two climaxes: contact piano 26.45 vs chimes 17.47 + bells 6.72; threshold piano 50.10 + vibraphone 4.39 vs chimes 34.61 + bells 19.20. Optional energy line: 1.1, 4.1, 21.6, 57.6, 14.4, 37, 67.3, 7.4.

### V3: Fear low, hope high (register)

Horizontal range plot, one row per instrument sorted by median, a rule at middle C (60), the empty band 60-62 shaded. Rows (min, median, max): didgeridoo 14, 14.5, 15; pedal organ 14, 24, 45; quiet organ 38, 46, 57; loud organ 38, 48, 58; tubular bells 50, 55, 60; bowed strings 38, 65, 82; choir 62, 72, 82; piano 62, 72, 84; recorder 65, 77, 86; handchimes 74, 79, 88; bowed vibraphone 74, 83, 91; vibraphone 74, 84, 96; harp 74, 86, 98. Strings per section for the straddler annotation: 38 / 50-65 / 62-79 / 62-82 / 50-58 / 65-81 / 50-70 / 62-77.

(Skip a waveform/spectrogram: nothing rendered lives in the repo, and the two live bugs are timing and routing, not spectra.)

---

## 6. Audio clips

The song changed (positions, hall, levels, humanize), so every arrival clip must be re-rendered with `--force`. `scripts/snippets.mjs` takes `{ out, song, section?, layer?, cycles?, kbps?, mono? }`, defaults **64 kbps mono**, skips existing files unless `--force`, and needs the page open (`npm run headless`, owned by the other agent). At 64 BPM one bar is 3.75 s: 2 bars = 7.5 s, 4 bars = 15 s.

**Stereo recommendation.** The pass's whole point is placement (piano front-right, alien right, harp left, doubling far left), so mono clips would erase what the post is describing. Set `"mono": false` on every arrival clip. At 96 kbps stereo a 2-bar clip is about 90 KB and a 4-bar clip about 180 KB. The old `arrival-full.mp3` was 1,770,266 bytes for 221.25 s, i.e. exactly the 64 kbps mono default. Stereo 96 kbps for the full song is about 2.65 MB (80 kbps: about 2.2 MB). Recommend 96 stereo; if 2.65 MB is too much, 80 stereo; do not go back to mono.

**Manifest for `src/content/posts/arrival/audio/clips.json`** (`out` prefixed `arrival/`; `alien-plea` stays on `melody4`, which is the signal in plea; the pop clips stay because the bug is still live, and a third one shows the vibraphone doubling on the same delay):

```json
[
  { "out": "arrival/walk-1-void", "song": "arrival.strudel", "section": "void", "cycles": 1, "kbps": 96, "mono": false },
  { "out": "arrival/walk-2-signal", "song": "arrival.strudel", "section": "signal", "cycles": 2, "kbps": 96, "mono": false },
  { "out": "arrival/walk-3-approach", "song": "arrival.strudel", "section": "approach", "cycles": 2, "kbps": 96, "mono": false },
  { "out": "arrival/walk-4-contact", "song": "arrival.strudel", "section": "contact", "cycles": 2, "kbps": 96, "mono": false },
  { "out": "arrival/walk-5-will", "song": "arrival.strudel", "section": "will", "cycles": 2, "kbps": 96, "mono": false },
  { "out": "arrival/walk-6-plea", "song": "arrival.strudel", "section": "plea", "cycles": 2, "kbps": 96, "mono": false },
  { "out": "arrival/walk-7-threshold", "song": "arrival.strudel", "section": "threshold", "cycles": 2, "kbps": 96, "mono": false },
  { "out": "arrival/walk-8-after", "song": "arrival.strudel", "section": "after", "cycles": 2, "kbps": 96, "mono": false },
  { "out": "arrival/human-contact", "song": "arrival.strudel", "section": "contact", "layer": "melody", "cycles": 4, "kbps": 96, "mono": false },
  { "out": "arrival/alien-contact", "song": "arrival.strudel", "section": "contact", "layer": "melody2", "cycles": 4, "kbps": 96, "mono": false },
  { "out": "arrival/alien-plea", "song": "arrival.strudel", "section": "plea", "layer": "melody4", "cycles": 4, "kbps": 96, "mono": false },
  { "out": "arrival/pop-will-piano", "song": "arrival.strudel", "section": "will", "layer": "melody", "cycles": 4, "kbps": 96, "mono": false },
  { "out": "arrival/pop-vibraphone", "song": "arrival.strudel", "section": "threshold", "layer": "melody6", "cycles": 4, "kbps": 96, "mono": false },
  { "out": "arrival/dry-piano", "song": "arrival.strudel", "section": "contact", "layer": "melody", "cycles": 4, "kbps": 96, "mono": false },
  { "out": "arrival/triangle-climax", "song": "arrival.strudel", "section": "threshold", "layer": "drums", "cycles": 2, "kbps": 96, "mono": false },
  { "out": "arrival/hook-arrival-contact", "song": "arrival.strudel", "section": "contact", "cycles": 4, "kbps": 96, "mono": false },
  { "out": "arrival/arrival-full", "song": "arrival.strudel", "kbps": 96, "mono": false }
]
```

Notes: `pop-will-piano` also demonstrates the two empty bars (cycles 25 and 30 of the piece are bars 1 and 6 of will; a 4-bar clip from the section start catches bar 1). `dry-piano` is the same instrument at space .32 with no delay. A single-layer clip renders that part alone, so both pops are audible in isolation. `triangle-climax` plays the whole drums part (all five voices), not the triangle alone; the layer is the smallest unit a render takes.

**Clips other posts take from arrival** (their own audio dirs, their own prefixes; same stereo settings so the series does not mix mono and stereo renders of one song):

```json
[
  { "out": "a-language-on-top-of-strudel/arrival-void", "song": "arrival.strudel", "section": "void", "cycles": 1, "kbps": 96, "mono": false },
  { "out": "a-language-on-top-of-strudel/arrival-threshold", "song": "arrival.strudel", "section": "threshold", "cycles": 4, "kbps": 96, "mono": false },
  { "out": "a-language-on-top-of-strudel/threshold-melody-alone", "song": "arrival.strudel", "section": "threshold", "layer": "melody", "cycles": 4, "kbps": 96, "mono": false },
  { "out": "a-language-on-top-of-strudel/threshold-melody2-alone", "song": "arrival.strudel", "section": "threshold", "layer": "melody2", "cycles": 4, "kbps": 96, "mono": false },
  { "out": "never-read-the-code/hook-arrival-contact", "song": "arrival.strudel", "section": "contact", "cycles": 4, "kbps": 96, "mono": false },
  { "out": "never-read-the-code/arrival-contact-drums", "song": "arrival.strudel", "section": "contact", "layer": "drums", "cycles": 2, "kbps": 96, "mono": false },
  { "out": "never-read-the-code/arrival-full", "song": "arrival.strudel", "kbps": 96, "mono": false }
]
```

`never-read-the-code` currently holds `arrival-full.mp3` and `hook-arrival-contact.mp3` (its clips.json lists the hook and the drums but not the full render, which was made by hand); the arrival manifest above duplicates both under `arrival/` as asked. Render one and copy, or accept two copies. Run with `--force` since the files exist.

---

## 7. Reproduction

All Node-only, from `E:\github2\strudle`:

```
npm run check -- songs/arrival.strudel        # 2434 events in 59 cycles, sounds block, section table, arc line
npm run lint -- songs/arrival.strudel         # clean
npm run dump -- songs/arrival.strudel         # the plain Strudel it reduces to (read-only)
git log --format='%h %ad %s' --date=iso -- songs/arrival.strudel songs/arrival-mixed.strudel
git show 3517d4d -- songs/arrival.strudel     # the mixing diff (twin promoted over the original)
git show 7a4d1b0:songs/arrival.strudel        # the file the old post described
```

The tables come from this script (run from anywhere; it imports the checker by absolute URL, so `@strudel/*` resolves inside the repo). Sections 2 and 5 are its output verbatim; the balance method is the old brief's (sum of the `gain` control per event), with a second column multiplying by `velocity` where a hap carries one.

```js
// arrival-analysis.mjs: re-derive the post's tables from the event stream scripts/check.mjs produces
import { checkFile } from 'file:///E:/github2/strudle/scripts/check.mjs';
const r = await checkFile(process.argv[2] ?? 'E:/github2/strudle/songs/arrival.strudel');
const ev = r.events.map((line) => { const m = /^(\S+) \+(\S+) (.*)$/.exec(line); return { t: +m[1], d: +m[2], v: JSON.parse(m[3]) }; });
const secs = r.sections.map((s) => ({ name: s.name, off: s.offset, end: s.offset + s.span, cycles: s.cycles }));
const secOf = (t) => secs.find((s) => t >= s.off && t < s.end)?.name;
const base = (s) => String(s ?? '').split(':')[0];
const eff = (v) => (v.gain ?? 1) * (v.velocity ?? 1);
const median = (a) => { const b = [...a].sort((x, y) => x - y); return b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2; };

// two wills: notes per cycle for one sound over a window
const notesIn = (sound, from, to) => { for (let c = from; c < to; c++) console.log(c, ev.filter((e) => base(e.v.s) === sound && e.t >= c && e.t < c + 1).map((e) => `${e.v.note}@${(e.t - c).toFixed(3)}`).join(' ')); };
const contact = secs.find((s) => s.name === 'contact');
for (const snd of ['piano', 'handchimes', 'tubularbells']) { console.log(snd); notesIn(snd, contact.off, contact.off + 4); }
for (const s of secs) console.log('chimes in', s.name, [...new Set(ev.filter((e) => base(e.v.s) === 'handchimes' && e.t >= s.off && e.t < s.end).map((e) => e.v.note))].sort((a, b) => a - b));

// balance: summed gain per side per section
const HUMAN = ['piano', 'harp', 'recorder_alto_sus', 'vibraphone'], ALIEN = ['handchimes', 'tubularbells'];
for (const s of secs) {
  const pick = (list) => ev.filter((e) => list.includes(base(e.v.s)) && e.t >= s.off && e.t < s.end);
  const sum = (x, f) => x.reduce((n, e) => n + f(e.v), 0).toFixed(2);
  console.log(s.name, 'human', sum(pick(HUMAN), (v) => v.gain ?? 1), sum(pick(HUMAN), eff), 'alien', sum(pick(ALIEN), (v) => v.gain ?? 1));
}
// per instrument in a section (the climax comparisons, the triangle)
for (const name of ['contact', 'threshold']) {
  const s = secs.find((x) => x.name === name), by = {};
  for (const e of ev.filter((e) => e.t >= s.off && e.t < s.end)) { const k = base(e.v.s); (by[k] ??= { n: 0, g: 0 }); by[k].n++; by[k].g += e.v.gain ?? 1; }
  console.log(name, Object.entries(by).sort((a, b) => b[1].g - a[1].g).map(([k, x]) => `${k} ${x.g.toFixed(2)} (${x.n})`).join(', '));
}
// register: min / median / max MIDI per sound
const bySound = {};
for (const e of ev) if (typeof e.v.note === 'number') (bySound[base(e.v.s)] ??= []).push(e.v.note);
for (const [k, a] of Object.entries(bySound).sort((x, y) => median(x[1]) - median(y[1]))) console.log(k, a.length, Math.min(...a), median(a), Math.max(...a));
// delay sends, will piano onsets per bar, texture first onsets
const dl = {}; for (const e of ev.filter((e) => e.v.delay !== undefined)) { const k = `${base(e.v.s)} @ ${secOf(e.t)} delay ${e.v.delay.toFixed(2)}`; dl[k] = (dl[k] ?? 0) + 1; } console.log(dl);
const will = secs.find((s) => s.name === 'will');
console.log('will piano per bar', Array.from({ length: 8 }, (_, i) => ev.filter((e) => base(e.v.s) === 'piano' && e.t >= will.off + i && e.t < will.off + i + 1).length));
for (const snd of ['gong', 'bassdrum2', 'framedrum', 'timpani_roll']) { const a = ev.filter((e) => base(e.v.s) === snd && !e.v.bank).map((e) => e.t); console.log(snd, 'first', a[0], 'last', a.at(-1), a.length); }
console.log('mix controls', ['pan', 'velocity', 'compressor', 'roomsize', 'ir', 'orbit', 'delay'].map((k) => `${k}:${ev.filter((e) => e.v[k] !== undefined).length}`).join(' '));
```

Delay time: superdough `delaysync: 3/16` cycle (node_modules/superdough/superdough.mjs line 194), `delaytime = cycleToSeconds(delaysync, cps)` = 0.703 s at cps 0.2667.

Terminology: bar = cycle (one cycle per bar at this tempo); part = a key in a `section()` object; layer = its kind; axis = one of the twelve 0..1 controls, .5 = no-op; level and the mix keys are material, not axes; energy = level-weighted onsets per bar; voices = simultaneous hits per the check header.
