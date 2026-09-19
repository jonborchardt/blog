# Domain brief: `knobs-in-the-code` (Strudel Bench, the "how to use the editor" post)

Repo: `E:\github2\strudle` (strudel-bench) at `828c550` (2026-09-19), clean working tree. Everything below was read from code or run with Node-only commands on 2026-09-19; where a number comes from the old brief (2026-09-13) it says so. Code wins over `README.md`/`CLAUDE.md`, both of which still say "textarea" in places and still call the inline controls "an experiment ahead of moving the main pane to CodeMirror" (the move happened; the main pane is CodeMirror).

The post is now a product-review "how to use it" piece. The Compose page inventory (section 1) is the core; the claim audit (section 2) says which sentences from the old post survive; sections 3 to 8 cover Verify, story, visuals, clips, screenshots and reproduction.

---

## 1. The Compose page, top to bottom, as a user meets it

The page is `index.html` (served at `http://localhost:3000/` locally, `https://jonborchardt.github.io/strudel-bench/` deployed). One screen, three cards of controls over one source string. **DOM order is: nav, song header, transport, Mix card, Song source, Expanded Strudel, then Change comments beside Why it sounds this way.** The old post and `CLAUDE.md` list the source pane before the Mix card; on the live page the Mix card sits above the source.

### 1.1 Nav and the desktop-only rule

`web/boot.mjs` `nav()`: `strudel-bench` brand, links Compose / Examples / Samples / About, a status span (the "packs: ..." line after boot, "saved", "importing ..."), and a `role="alert"` span: **"Made for a desktop browser: this window is too narrow for the mix card and panes."** `web/strudel.css` line 27: `@media (max-width: 60rem) { .top { flex-wrap: wrap; } .top .narrow { display: block; } }`. That is the whole rule: under 60rem an orange warning row appears in the nav; nothing is hidden or disabled. (The blog's `StrudelEmbed` is what swaps the iframe for a link under that width, on the blog side.) The **Samples** link carries `hidden` until Compose's `/events` SSE connection opens, so it only shows with a local server.

### 1.2 Song header (`#head`)

- **Song** select: `songs/index.json` (the server filters out `// @hidden` songs) plus this browser's localStorage drafts (`strudel:<name>.strudel`) plus a hidden song opened by URL hash (`#knobs0.strudel` loads even though it is off the list) plus a `#s=` shared song.
- **+ New song**: prompts for a name, writes the minimal `TEMPLATE` (a two-section `song()`), to `songs/` locally or localStorage on Pages.
- **Packs** badge (hidden unless the song declares `packs: [...]`): each pack tagged `deployed` / `local` / `missing`.
- **Save** (disabled until the source differs from what was loaded; ctrl+s): PUT `songs/<name>` locally, localStorage on Pages. Save also appends the mixer's pending edits to `songs/<name>.notes.json` as one request `ask: "edits made in the mixer"` (local server only; no shipped notes file contains one).
- **Export** group: **MP3** (stops playback, renders offline in the browser one cycle at a time, encodes with lamejs in the browser, downloads `<song>.mp3`, or `<song>.<section>.mp3` when a section is pinned; with a server the file also lands in `renders/`), **Strudel** (downloads the expanded pane as `<song>.strudel.txt`), **REPL ↗** (opens strudel.cc with the expansion in the hash), **Link** (copies `<page>#s=<base64url(deflate-raw("name\nsource"))>`, the song itself in the URL; opening one lands the source in the editor unsaved). An `xstate` badge reports `rendering 40%`, `✓ demo.mp3 32.0 s`, `✗ why`; the buttons lock while a render runs.

### 1.3 Transport (`#transport`)

`▶ Play` / `❚❚ Pause` / `▶ Resume` (one toggle; pause remembers the cycle), `■ Stop`, `↻ Update` (appears only while playing when the source differs from what was evaluated; ctrl+enter re-evaluates in place at the current cycle), the position slider with a tick per section (scrub: jumps the clock while playing, moves the resume point otherwise), the **scope** canvas (superdough analyser 1 over the live mix, peak held one second and printed in dBFS, red at clipping), and the readout `drop · bar 3/8 · 14.5/20 · Cm` (section, bar, cycle/total, the chord under that bar). Space toggles play outside text fields.

### 1.4 The Mix card (`#mix`, a `<details>` open by default)

Header row: **Mix**, `↶ ↷` undo/redo, **A/B** (hear the source before the last undo step, on the same clock; the button reads `hearing: before` while on; any edit turns it off; refuses with "the previous version does not evaluate" rather than going silent), **measure** (render the shown section, then each part alone; a dB reading relative to the mix lands next to every level slider in materials; the mix's own dBFS rms and `peak ok` / `no headroom` on the `mstate` badge; writes nothing), `mstate` badge. Then, in order:

1. **song** pane (`#songsrc`, closed `<details>`): a CodeMirror 6 editor over the header object of `song({...})` parsed as one expression with `root: 'song'`, so `cps`, `bpm`, `key`, `seed`, `kit`, `meter`, `packs`, `room` read as song keys. Its summary carries a **controls** checkbox (`#tweak0`). Hidden for plain (non-`song()`) files.
2. **Arrangement strip** (`#strip`): one block per section, flex-grown by its span (song cycles, so a section with its own tempo is wider or narrower than its bar count), title `name: 8 bars, climax`. Inside each block: the name, an ops row, one row per layer kind (eight: drums, bass, melody, pad, fx, sample, perc, raw) whose opacity is `(.3 + .7 × density) × min(1, level)`, then the transition into the next block, then the tail pickers. Ops: **📌 pin** (loop this section on its own pattern at its own cps, Play starts here, the card stays on it; a plain click on another block moves the pin; unpin hands the song back at the equivalent cycle), **◀ ▶** move earlier/later (`moveSection` swaps the two call texts), **⧉** duplicate (next free numbered name: `verse` → `verse2`), **✎** rename (or double-click the name; Enter/blur commits, Escape cancels; refuses empty, quoted or taken names), **⚡** a verb pick over `lib/verbs.json`: `breakdown` (phrase "sparser, more spacious, darker", drops fx), `lift` ("busier, brighter, more driving"), `strip` (keep drums, bass, sample, perc, raw), `halftime` (drums template `'halftime'` + "slightly sparser"); a refused layer count is appended to the status. **×** remove. A plain click scrubs to the block (or re-pins when pinned). **Transition** picks on every block but the last: `riser` (bars of noise sweep at the end of this section, `fx.riser`, from 1/2/4/8 or none) and `hit` (the next section's `fx.impact`, any loaded sound, with a ▶ preview); an fx part is added when the section has none. **Tail** picks on every block: `dropout` (bars of silence, all but fx) and `sweep` (bars of low-pass sweep down to 150 Hz), from 1/2/4/8 capped by the section's length.
3. **section** pane (`#secsrc`, closed): the same editor over the shown section's whole `section(...)` call, with its own **controls** checkbox (`#tweak`). Typing here splices the source at that span; while it has focus the card re-finds the section by position (the name may be mid-edit) and leaves its text alone.
4. **axes** panel (open): the **harmony strip** (`#harm`) then the **knobs** grid then an **add part…** select.
   - Harmony strip: a key button (`Cm`, marked `song` when the section inherits the song's key) opening a pick over every root × mode; one button per bar showing the chord name over its numeral (`Cm` / `i`), bars beyond the progression's length greyed as repeats and editing the bar they repeat; a `+` bar. Picks go through `setSectionField` (key / progression). A progression using `@n` is read-only here (status: "@n is hand-written: edit the progression in the source"); an unparseable one shows in italics.
   - Knobs grid: a header of the twelve axis names, one row per part: the part name, **mute** and **solo** buttons (what you hear, not the song), **remove** (trash icon, `removeLayer`, undoable), then one cell per axis. A cell is empty when the layer has no adapter for that axis (`cells[layer][axis]`), a **slider** (0..1, step .01) when it does, with the title saying `(from the spread; dragging adds an override)` or `(not in the source: baseline)` when there is no literal, and a **▾ shape** button on every continuous axis (`constant`, `ramp up`, `ramp down`, `wobble`, `drift`, `pulse`, `swell`, written centred on the cell's current value through `setAxisText`). A cell whose value is a signal or expression is drawn as an **automation lane** (`web/lane.mjs`: the evaluated attr pattern sampled 16× per bar as a polyline with bar lines) instead of a slider, and clicking it opens the same shape pick. Under each row an **event strip** draws the part's onsets across the section's bars from the evaluated song (filled one bar per task after render, so a section change does not stall the scheduler), with a **playhead** (`--ph`) sweeping while that section sounds.
   - Slider drags coalesce into one undo step per second and commit through `setAxis` (or `setAxisScoped` with **all sections** ticked: every section that has the part, signals skipped).
5. **materials** panel (closed): one row per part. By kind:
   - **drums**: `template` pick (`house`, `breaks`, `minimal`, `halftime` from `TEMPLATES`) or, once the template is a written `{ voice: grid }` object, the **step grid** (`web/stepgrid.mjs`: voices × steps, click cycles rest → hit → accent → ghost, a `+ voice` box adds a row for a kit voice or a pack sound); an **edit as grid** button copies the named template into the source as a grid. `sounds`: one pick per kit voice (`bd sd hh oh cp`), each with a ▶ that auditions the voice alone.
   - **bass / melody / pad**: `sound` pick (synths + every loaded sample, ▶ per row), `patch` pick (`pluck reese hollow glass breath sub wide`, `lib/patches.json`).
   - **bass / melody**: `notes` text box (placeholder "seeded line"; a ▶ shows while focused) with a closed **roll** `<details>` under it (opens when the box takes focus; `web/roll.mjs`: degrees × slots, click sets a note, again rests it, click inside a hold splits it, shift-click holds the note before through the slot; a line with notation beyond degrees, `~` and `@n` says "this line uses notation the roll does not edit"; the roll's summary ▶ auditions the part with the line as the box has it).
   - **melody**: `bars` (phrase; 1 is dropped from the source), the **line** row: "written by hand" when notes are set, else a **seed stepper** `◀ seed 3 song ▶` showing the generated line as text with a ▶; `follow the chords` checkbox.
   - **pad**: `arp` pick (`up`, `down`, `updown`, or a written order stays text).
   - **sample**: `sound` pick (synths, samples and the packs' named definitions, labelled `loop-kick · demo-pack sample`), **import…** (local server only; also drag-and-drop on the row: the file lands in `samples/user/<song>/`, a license prompt writes `pack.json`, the song declares the pack, the part's sound is set), `bars`, `slices` (count) or `breaks` (seconds into the file; empty = equal slices), `play` (slice-index pattern), `fit each slice to its step` (stretch), `transpose` (semitones), then the **waveform** (`web/waveform.mjs`: the file's peaks with the region lit and a line per slice; click adds a break, click a line removes it, drag a line or a region edge; `start`/`end` sliders with time readouts; a `snap` select `off 1/4 1/8 1/16`, a browser setting under `strudel:snap`; one numbered button per slice that plays it alone; an info line `2.00 s · stereo · region 1.98 s as 2 bars · ≈ 120 bpm · 1 bars?` with **use** (write this part's bars) and **song bpm 120** (set the song's tempo) buttons from the tempo detector). Values inherited from a pack definition are greyed with a tooltip saying which definition. A refusal ("slices: the pattern plays slice 7; remove it from the pattern first") is written to the status instead of writing a song that will not build.
   - **perc**: `sound` pick, `rhythm` text. **raw**: `pattern` shown as `expr` (edit in the source).
   - Every row ends with a **level** slider (0..2, ×1 dropped from the source) with a `dB` slot that **measure** fills.
   - At the bottom: **preview level** (`input.pvin`, log ×0.1..×50, `strudel:pvlvl`, never written to the song; a running preview restarts on release). An **add part…** select ends the list too.
6. The **pick menu** (`#pick`, one native popover behind every pick button on the page, the section pane's inline picks included): a filter box (Enter picks the first visible row), the same preview-level slider (hidden when the rows have no ▶), rows with a ▶ that **auditions without selecting**, an empty row meaning "unset" where allowed, and for the kit menu each kit's icon plus a legend key. Closing the menu ends its preview.
7. **adjust via vocabulary** (open): the **phrase** box with a native datalist of terms (control words, moods/genres, modifiers incl. `less`, harmony words, and this section's part names); only a known term becomes a **pill** (Enter, Tab or comma on the word, or on a prefix only one term starts with; a pick from the list); unknown text is marked red and never becomes a pill; Backspace on an empty box removes the last pill; a **part pill** scopes the pills after it to that part. **Apply** runs `planEdits` per clause and commits (status like `drums.density .6→.85, pad.space .6→.8` or `those words change nothing here`, or `melody.brightness refused (brightness is a signal here...)`). **Verify** (section 3 below). **all sections** checkbox: words and knobs land in every section that has the part. A `vstate` badge and the `#vout` comparison live here; `#mixstatus` under the card is the one status line every control writes.

### 1.5 Song source (`.card.pane`)

**Song source** · `editable · axes 0..1, 0.5 is baseline`, a third **controls** checkbox (`#tweak2`), `unsaved` when it differs from disk, `↶ ↷`. The editor is the same `createEditor` factory as the two panes, in the page's light look, over the whole file. `#err` under it shows evaluation errors and "sound not found" lines. All three controls checkboxes are one setting (`setTweak`, `strudel:tweak`); **off by default**, so the code reads clean until asked.

**What the controls do in any of the three editors** (`web/cm-controls.mjs`, `web/cm-widgets.mjs`, `web/hll-schema.mjs`):
- Every literal the schema knows gets a dotted underline and a hover title (`drums.density: amount of musical activity (alt-drag to change)`), whether or not controls are on.
- **Alt-drag** on a known number changes it in place, controls on or off: a bounded number crosses its whole range in 200 px, a log one (`cps`) multiplies, an open one steps every 8 px. The gesture re-finds the control on every mousemove and gives up if it is gone.
- With controls on, a widget follows each literal: **slider** (number with a max), **spinner** (number with a min and no max: `seed`, `phrase`, `riser`, `dropout`, `sweep`, `bars`, `slices`, a section's cycle count, `.slow()`/`.fast()`/`.segment()` arguments), **check** (bool: `fill`, `follow`, `stretch`), **pick** (an enum through the shared menu: `sound`, `kit`, `key`, `meter`, `role`, `template`, `patch`, `arp`, `impact`, each drum voice in `sounds`; with a ▶ when the value can be heard), **tokens** (the progression as a row of chord buttons plus `+`, brackets kept as text), and a **signal** pick on a bare `saw`/`sine`/`perlin`/... standing in for a number. Arguments of `.range()`, `ramp()`, `wobble()`, `drift()`, `pulse()`, `swell()` **inherit** the bounds of the number they stand in for (`ramp(0, 1.5)` under `level` gets 0..2 sliders; `sine.range(1, 5)` under free-text `notes` gets nothing).
- A widget writes exactly its literal (`editFor`), quantized to the spec (clamped, rounded to the step, `.35` not `0.35`, the quote character kept). The edit goes through the page's `commit` like typing.
- **The schema is a whitelist** (`web/hll-schema.mjs` header: "a literal without an entry here never gets a control, so a wrong range cannot be invented for it"). Literals outside `song(...)`/`section(...)` objects, or of keys not in `props`, stay plain code; `gain(0.72)` gets nothing because `gain` is Strudel, not the language. A `const` the file spreads into a layer (`...theme`) counts as a layer object, so arrival's shared consts get controls too.
- **The test** (`test/cm.test.mjs`, "every key the HLL accepts has a control spec or is listed as free, with the reason"): `META_KEYS` + a hand-written section-key list + the twelve axes + every layer's materials must each be in `SCHEMA.props` or `SCHEMA.free`, every free entry must be an HLL key, and its reason must be longer than eight characters. Measured today: **50 keys the language accepts, 40 with a spec, 10 free**: `packs`, `room`, `duck`, `velocity`, `humanize`, `compressor`, `notes`, `rhythm`, `chord`, `pattern` (the old post said 33 / 30 / 3; the mix material landed on 2026-09-18). One nit: the test's section-key list is `role key progression meter bpm cps kit` and omits `dropout`/`sweep`, which have specs anyway; a new section key would slip past it. `SCHEMA.props` has 42 entries: 21 sliders, 7 spinners, 9 enums, 1 tokens, 1 map, 3 bools.
- **Where it falls down, still true today**: `specFor` matches on key name and nesting depth, never on whether the key is legal on that layer. Verified: `section('a', 4, { drums: { kit, phrase, arp, progression, begin } })` yields controls `drums.kit` (pick), `drums.phrase` (spinner), `drums.arp` (pick), `drums.progression` (chord row), `drums.begin` (slider), none of which the language accepts on drums; `section('a', 4, { density: .5, dropout: 2 })` gives `density` a slider at section level, which `song()` rejects as `unknown layer "density"`. The build (and the page's `#err`) catches it; the editor invited it.

### 1.6 Expanded Strudel (`#xpane`, a closed `<details>`)

`generated · read-only · follows the source as you type`: the plain Strudel the file reduces to (`lib/dump.mjs` in the browser), re-expanded 300 ms after each edit and on play; lines the last edit changed flash and the pane scrolls its own box (never the page) to the first changed line. Still a `<pre>`, not an editor.

### 1.7 Change comments (`#feedback`, local server only: hidden when `/events` 404s)

Subtitle: "each one is pinned where the playhead is; its dot on this slider can be clicked to edit and dragged to move". A second position slider mirrors the transport (both scrub). A textarea (placeholder "Make this heavier and less predictable."), **Add comment here** (pins at the transport slider's current value, 0.05-cycle steps, tagged with the section under it; disabled with no sections), **Cancel** (while editing), **Copy request** (clipboard), a status. Each comment is a coloured **dot** on the lane and a numbered list row `1. drop cycle 15.0 less hats ×`. A still press on a dot edits its text (the button reads **Save comment here**); a **drag re-pins it in 0.1-cycle steps** and re-tags its section live. The paste-ready request (`buildRequest` in `web/compose.mjs`) is shown under the list and follows every source edit. Comments are page state: they never touch the source or the undo stack, and switching songs clears them.

**Current request text shape** (verbatim structure from `buildRequest`):

```
Song: songs/<name>
Sections: intro (4 bars from cycle 0), verse (8 bars from cycle 4), drop (8 bars from cycle 12)

I listened and pinned each note at the cycle the playhead was on. A note is about what I heard there: that exact
spot, the section it is in, or what led into it just before. Please make these changes and keep everything else as it is:
1. cycle 15.0 (drop, bar 4 of 8): less hats
2. cycle 6.2 (verse, bar 3 of 8): darker pad

Current source of the parts around those spots:
```
song({ cps: .5, key: 'C:minor', seed: 3, kit: 'RolandTR909' }

section('verse', 8, { ... }),

section('drop', 8, { ... }),
```
```

The rule and its comment, verbatim from `web/compose.mjs`:

```js
 * A note in a section's first bar also quotes the section before it: the ear often reacts a moment late.
 ...
    if (s && n.cycle - s.offset < 1 && i > 0) quoted.add(sections[i - 1].name);
```

The song header is quoted with a regex (`song\(\s*\{[^}]*\}`), so a header containing a nested object (arrival's `room: {...}` today) is cut at the first `}`; a cosmetic wart worth knowing before quoting arrival's header in the post. The 78-line request in the old `handing-over` Details block matches the current section map of arrival (void 0, signal 1, approach 9, contact 17, will 25, plea 33, threshold 41, after 53) but its quoted section sources are the 2026-09-13 text; arrival's consts and header changed on 2026-09-18 (`room`, `packs: ['rooms']`, `position`, `humanize`, levels). Treat that block as a historical record.

### 1.8 Why it sounds this way

Header count `3 requests, 7 changes, last 2026-09-12`; the song's `prompt` paragraph; then one list per section (in source order, `song` first) merging the `//` comments in the source with `songs/<name>.notes.json` changes: a `layer.axis` tag, the why, `from → to` when recorded, and the request's date and ask as a tooltip. "no comments in this song yet" otherwise. Refreshes when the notes file changes on disk (`npm run note`).

### 1.9 Undo, coalescing, keys

One undo stack in the page (`commit`): whole-document snapshots, capped at 200, `future` cleared on a new edit. **Coalesce within one second: typing (in any of the three editors) and knob drags**; a drag's end resets the window so the next drag is its own step. Everything else is its own step: pills/Apply/Verify, section ops, verbs, harmony picks, materials picks and boxes, the level slider (commits on release), waveform gestures, step grid and roll clicks, seed steps, imports, kit. Undo/redo buttons on the Mix header and the Song source header; **ctrl+z**, **ctrl+shift+z** or **ctrl+y**; undo blurs a focused pane first so it re-reads the restored source, closes the Verify comparison, and turns A/B off. CodeMirror's history extension is deliberately not installed (`web/cm-editor.mjs` header comment), so three editors share one stack.

Other keys: **space** play/pause outside text fields, **ctrl+s** save, **ctrl+enter** Update, **Enter** in the pick filter picks the first row, **Enter/Escape** in a rename box, **alt-drag** on a known number, Enter/Tab/comma in the phrase box. `beforeunload` asks when there are unsaved edits.

### 1.10 Save and localStorage on Pages

With a server: PUT to `songs/`, and `fs.watch` reloads the page's copy when the file changes on disk (re-evaluating if playing; a "file changed on disk. reload" link instead when there are unsaved edits). On GitHub Pages (`/events` 404s): Save and New song go to localStorage (`strudel:<name>.strudel`), the song list merges those drafts, the Change comments card is hidden, import is hidden, and everything else (play, Mix card, Verify, measure, exports, Link) works because it all runs in the browser. Browser settings, never the song: `strudel:tweak` (controls), `strudel:pvlvl` (preview level), `strudel:snap` (waveform snap).

### 1.11 Embedding

`?play=1` starts on load (needs user activation; a refused autoplay leaves the button saying Play with a tooltip explaining), `?section=<name>` opens pinned to that section. Query, not hash: the hash is the song name.

### 1.12 The Examples page (`examples.html`)

An intro, a **map** figure of the shape of a song whose labels link to groups, a sub-nav by arc, then the groups. Today (`web/examples.mjs` at `828c550`): **16 groups, 134 cards, 0 stubs**, in four arcs: The language (Song and section, Axes, Axes across layers, Trajectories), Words (Descriptors, Overlays, Modifiers), Harmony (Harmony, Progression syntax), then Material, Drums and written rhythm, Samples, Mix routing, Section-level edits, Transitions, Full songs. Each card: title, blurb, tags, an optional SVG, **variant buttons** (`▶ Low / ▶ Baseline / ▶ High`, or `▶ Before / ▶ dreamy`) that load and play (an A/B), `■`, an editable **HLL pane** (still a plain textarea here) that re-expands 300 ms after an edit and re-evaluates while that card plays, a `▶` to play the pane as edited, and a closed **Expanded Strudel**. Only one card plays at a time; **ctrl+.** stops. `test/examples.test.mjs` evaluates every variant with the checker. Counts move with every commit: do not print them.

### 1.13 The Samples workshop (`samples.html`, local only)

Not in `PAGES`, so never deployed; `noindex`; linked only once a server answers. Left: the local packs (`samples/user/<pack>/`) with their sounds and named definitions, a **+ new pack** form (name, license; blank license = local-only), and a drop target on the selected pack ("what you drop ships with the site" when the pack deploys). Right: one definition on the same waveform component Compose uses: name, sound, start/end in seconds, bars, slices or breaks, snap, stretch, an audition pattern and bpm (page settings), `▶ region`, `▶ pattern`, a button per slice, **Save / Duplicate / Delete** into the pack's `pack.json` (confirm before replacing or deleting). It makes definitions a song can name (`sample: { sound: 'loop-kick' }`); it never edits a song.

---

## 2. Claim audit of the kept parts of the old post

| Old claim | Verdict today |
|---|---|
| The literal → control table on the verse melody line of `demo.strudel` (`.5` slider, `saw` menu, `.3`/`.7` sliders inheriting the axis bounds, `8` spinner, `'piano'` menu, `true` toggle, `2` spinner, the note string nothing) | **Holds exactly.** Re-run of `findControls` on that line: `.5 melody.density slider 0..1`, `saw melody.brightness.signal pick`, `.3 melody.brightness.range(0) slider 0..1`, `.7 range(1) slider 0..1`, `8 slow(0) spinner min .125`, `'piano' melody.sound pick`, `true melody.follow check`, `2 melody.phrase spinner min 1`; the notes string is the one literal on the line without a control. Same line in `knobs0.strudel` and `punchier1.strudel`. (The task called it "the knobs-cp line": `knobs-cp.strudel` is a plain Strudel one-liner, `s("cp").struct(...).bank("RolandTR909")`, with 3 literals and **0** controls, because nothing outside `song()`/`section()` is the language.) |
| "Across a whole song, 51 of 58 literals get a control. The seven that do not are three section names and four hand-written melodic lines." | **Holds** for `demo.strudel` and `knobs0.strudel`: literals 58, controls 52 (51 literals + the `saw` identifier), the seven without: `'intro' 'verse' 'drop'` and the four `notes` strings. Widgets over the file: 30 sliders, 10 picks, 8 spinners, 3 checks, 1 chord row. `punchier1.strudel` is 55 of 62. `arrival.strudel` is 324 of 450 (the many free-text and inline-object values of the mix material). Tie the number to `demo.strudel` by name; `demo` is `// @blog`-locked and unchanged musically since 2026-09-12. |
| Slider vs spinner rule ("a number with a known ceiling gets a slider, one with only a floor a spinner, because a slider would have to invent a maximum") | **Holds**: `widgetFor`: `c.spec.max == null ? spinner : slider`. The schema comment says it: "without: a spinner from min up, nothing invented". |
| "The schema matches on a key's name and nesting depth, not on whether the key is legal where it appears... a chord picker for a chord progression written on a drum part" | **Still true**, verified today (section 1.5). No test pins it either way. |
| density `.9` → `.84` drops the clap: 28 → 26 onsets per bar, section energy 59 → 57, clap threshold 0.85 | **Holds, recomputed with `npm run check`**: `knobs0` drop drums `28/cyc density=0.9 ... very busy, frantic, punchy`, `arc: intro 9 · verse 29.5 · drop 59`; `knobs1` drop drums `26/cyc density=0.84 ... busy, frantic, punchy`, `arc: ... drop 57`. `DRUM_THRESH = { bd: .1, sd: .3, hh: .5, oh: .7, cp: .85 }` (`lib/layers.mjs` line 116); 16th hats join at `>= .8` (both sides of the example have them). `voicesAt` also requires the template to have a line for the voice, and any written extra voice is never density-gated. |
| "Six things bypass the undo stack. Four are what you hear: solo, mute, compare, and the preview volume. Two are where you are: pinning a section, and scrubbing the playhead." | **Holds as the musical statement**, with more page state around it now: what you hear (solo, mute, A/B, preview level), where you are (pin, scrub), and browser settings that touch neither the song nor the stack (the controls checkbox, the waveform snap select, a roll being open), plus **measure** (writes nothing) and the **Change comments** list (page state). Nothing that changes the music escapes the stack; the Verify button's edit does go on it. |
| One undo stack, coalescing rule | **Holds**: see 1.9. The editor's own history is not installed; three editors, one stack. Typing and knob drags coalesce within a second; section ops and kit changes never do. |
| Why a drum voice previews alone | **Holds**: `index.html` comment "a drum voice alone on its template grid: the whole part would drown it, or not even include it, since voices join as density rises"; `audition()` builds the voice through `voiceSound` on its template row (or `x...` on the beats when the template has no line for it). Clip C's logic is unchanged (`verse` drums at `.6` have `bd sd hh` only; the clap is absent). |
| The `arrange` default-argument trick | **Still in `lib/song.mjs` line 22**, verbatim: `export const arrange = (sections, total, patternOf = (s) => s.pattern) => S.stepcat(...sections.map((s) => [s.span, patternOf(s).fast(s.cycles)])).slow(total);` and `audible()` in `index.html` still calls `arrange(secs, pat.strudel.total, filt)` with a filter over solo/mute. Solo and mute are the same arranger with a function handed in. |
| "Every control in the interface calls a function that already existed for the command line" | **Mostly, and say it precisely.** Pills and Apply call `planEdits`/`applyEdits` (`lib/resolve.mjs`), which `scripts/resolve.mjs` calls. The ⚡ verbs call `applyVerb`, which `scripts/resolve.mjs --verb` calls. Verify and measure call `analyze` in `lib/analyze.mjs`, which `scripts/analyze.mjs`, `scripts/verify.mjs` and `scripts/measure.mjs` call; measure's dB rows are `levelRows` in `web/compose.mjs`, which `scripts/measure.mjs` imports too. Solo/mute call `arrange`, which `song()` calls. **The knobs call `setAxis`, which no CLI calls**: it is page-only, built on the same acorn `locate` and `applyEdits` the resolver uses (same module, same parse, same splice, not the same function). Likewise `setMaterial`, `setSectionField`, `moveSection` and friends are page-only helpers in the resolver's module. The honest sentence: every control edits the source through `lib/resolve.mjs`, the module the CLI resolver is, and the ones that measure or arrange go through the very functions the CLI uses. |

Dropped narratives (page growth, "the plan was a textarea", what it cost, the feature that never fired) were not audited. One fact in passing, in case a sentence survives: no `songs/*.notes.json` contains `ask: "edits made in the mixer"` today either.

---

## 3. The Verify button, and the verification chain behind it

**What the page's Verify does** (`index.html` `$('verify').onclick`): plan the pills (`planEdits` per clause, deltas summed per axis), refuse with `those words change nothing here` when nothing would change, stop playback, **render the shown section as it stands, then the section with the words applied** (`renderSong({ code, section: mixSection })`: the whole section mix, every part, at the section's own tempo), measure both with `lib/analyze.mjs`, show a table `axis | asked | metric | before | after | ✓ moved as asked / ✗ did not` (or `no audio metric (verified by the event stream)` for drive and register), a `before` and `after` `<audio>` player, and a `× close`; then **apply the edit** (one undo step, `applied: ...` in the status) and put `✓ 2/3 moved as asked` on the `vstate` badge. Apply and measure lock while it runs (one offline renderer). It runs entirely in the browser, so **it works on GitHub Pages too**; the CLI chain needs a page open.

**The verdict on the page is a plain sign test** (`verifyRows` in `web/compose.mjs`): `ok: Math.sign(after - before) === Math.sign(requested) * sign`. **There is no 2% floor on the page.** The 2% relative-change floor lives only in `scripts/verify.mjs`: `moved > 0 && rel > 0.02 ? 'verified' : 'NOT verified'`. Two other differences from the CLI: the CLI renders **one layer of one section alone** (`renderVia({ section, layer })`), the page renders **the section mix**; and the CLI code-checks `drive` through the onset count from `checkFile` and prints `register code-checked: applied (pitch not measured in v1)`, while the page prints `no audio metric` for both. Do not write "the button is the CLI's verify" without those three caveats.

**Which axes have a metric** (`lib/axes.mjs`, canonical): direct: density → `onsetsPerSec`, brightness → `centroidHz`, weight → `lowRatio`, width → `width`; proxy: space → `tail`, articulation → `crest`, aggression → `flatness`, groove → `swing`, variation → `novelty`, organicness → `jitter`; code (no metric): drive, register. Ten of twelve; every `sign` is `+1`. (`CLAUDE.md` still lists six "measurable axes"; the code judges ten.)

**The punchier example** (`songs/punchier0.strudel` → `punchier1.strudel`, verse drums, both unchanged since they were committed in `7d93908` on 2026-09-13): the resolver's edit is exactly `drums: { density: .6, groove: .6 }` → `{ density: .6, groove: .6, articulation: .9, weight: .65, drive: .7, space: .35 }` (the one-line diff). `npm run check` today: verse drums `15/cyc` on both sides (`drive code-checked: onset count unchanged (15/cyc)` still holds), words `very punchy, massive, frantic, dry` after. The **audio metrics cannot be recomputed browser-free today**: `renders/` holds no punchier wavs, and `renders/verify.before.wav`/`verify.after.wav` (2026-09-13 12:19) are the `much wider` run (width 0.006 → 0.139, onsets 3.94/s = drop drums), not punchier. So quote the old brief's numbers and mark them **recorded 2026-09-13 with `npm run verify -- songs/demo.strudel verse drums "punchier"`**:

```
Requested:  articulation +0.40, weight +0.15, drive +0.20, space -0.15
Render:     crest 5.11 -> 4.27   lowRatio 0.518 -> 0.482   centroidHz 573 -> 449   tail 0.022 -> 0.016   width 0.002 -> 0.001   onsetsPerSec 4.06 -> 2.25
Result:     articulation NOT verified (crest 5.11 -> 4.27), weight NOT verified (lowRatio 0.518 -> 0.482),
            drive code-checked: onset count unchanged (15/cyc), positions not measured, space verified (tail 0.022 -> 0.016)
```

The reading stands: articulation is judged by crest factor, drive re-places the onsets that crest measures, so a compound word confounds its own verdict; on the page's table the same run would show `articulation ✗ did not`, `weight ✗ did not`, `space ✓ moved as asked`, `drive no audio metric`, and the ear says punchier. (`lib/analyze.mjs` gained metrics on 2026-09-18 for `measure`: masking, depth, bands. The six the verify line prints and the ten the axes name are unchanged in meaning; a re-render could shift the numbers slightly because reverb routing changed, see section 6.)

**To rerun when a browser is available** (not now, the browser belongs to another agent): `npm run headless -- songs/punchier0.strudel` in one terminal, then `npm run verify -- songs/punchier0.strudel verse drums "punchier"` (it writes the edit into the file and restores it on failure; copy `punchier0` to a scratch song first so the committed pair stays as it is).

---

## 4. The story for a product reviewer

**Strongest line:** the Compose page is one source string with three views on it that all write back through one door. Type in the source, drag a slider in the Mix card, alt-drag a number in the section pane, click a chord button, click a step in the drum grid, pick a sample and hear it before choosing: every one of those is the same kind of edit (unsaved until Save, one undo stack, re-evaluated in place while the song plays), and the file stays a clean, diffable record that the agent can read next. The four things that only change what you hear (solo, mute, A/B, preview level) are named as such in the UI ("what you hear, not the song") and never touch the file.

**Second line:** the controls are honest by construction. A widget appears only where the language's schema says what the number means; the schema is a whitelist with a test that every key is either specified or listed free with a written reason; a number with a floor and no ceiling gets a spinner rather than an invented slider; hand-written lines stay text. And the one dishonesty (a control offered where the key is illegal) is admitted.

**Third line:** the page closes the loop with the agent in both directions. Change comments pin what you heard at the cycle you heard it and assemble the request with the source around it (quoting the previous section when the note lands in a first bar). Verify renders before and after, plays both, and prints a sign test per axis, so a word's effect is heard and measured in the same place; A/B does the same for any edit.

**Surprising bits worth a sentence each:** alt-drag works with the controls checkbox off; the underlines are always on. The Verify button on the page has no 2% floor and measures the whole section mix, unlike the CLI. Verify, measure and MP3 export need no server: the page renders offline in the browser, so they work on GitHub Pages. A pinned section loops by being a short pattern handed to the scheduler, not by a scheduled jump, so the loop is seamless. A drum voice auditions alone because at `density .6` the clap is not in the part at all. The kit menu plays every kit through the same two bars (twelve voices, a house groove, ride, crash, clap, a tom fill) and names the voices a kit lacks. The tempo detector under a sample's waveform offers two buttons: write this part's bar count, or set the song's bpm. The Examples page still edits in a textarea. The share link is the song (deflate-raw, base64url), nothing is stored.

**Terminology** (use the code's words): **HLL** or "the song language" for `song()`/`section()` (pick one); **axis** (twelve, 0..1, 0.5 the baseline no-op); **layer** in code, **part** in the UI (`drums2` is a second drums part); **material** for the non-axis keys (harmony is material: `key`, `progression`); **control** (a literal the schema knows) vs **widget** (its DOM element); **pane** (the two CodeMirror spans in the Mix card, and the Song source card), **card**, **strip** and **block**, **pin** and **scrub**, **audition**/**preview** (the ▶ that plays without selecting); **cycle** vs **bar** vs **span** (a section's bars in song cycles); **cps** vs **bpm**; **verb** (breakdown, lift, strip, halftime); **movement**/**shape** (ramp, wobble, drift, pulse, swell) and **lane** (its drawing); **roll** and **step grid**; **take** (one of a sample part's list of sounds), **definition** (a pack's named region), **pack**.

**Caveats to state:** desktop-only warning under 60rem (nothing hides, it just does not fit); controls are off by default; Change comments, import, save-to-disk and the Samples page need the local server; the mixer's own notes recording is server-only; Verify is ordinal (sign only on the page) over a section mix; a signal-valued axis refuses the knob ("brightness is a signal here") and takes the shape pick instead; a spread layer's knob writes an override after the spread; `@n` progressions are read-only in the harmony strip.

**Phrasing to avoid because routine repo change falsifies it:** counts of Examples groups and cards; line counts of anything; test counts; the number of keys / specs / free keys (50 / 40 / 10 today, 33 / 30 / 3 a week ago); "three editors" is safe, "six widget kinds" is safe; the 51/58 figure only when tied to `demo.strudel`; `DRUM_THRESH` values are stable but print them as "today"; "the page is around N lines"; the list of verbs and shapes is data (`lib/verbs.json`, `SHAPES`) and could grow.

---

## 5. Proposed visuals

**V1 (keep, refresh): which literals on one line get which control.** Verbatim line from `songs/demo.strudel` verse: `melody: { density: .5, brightness: saw.range(.3, .7).slow(8), sound: 'piano', follow: true, phrase: 2, notes: '0 2 3@2 ~ 4 3 2 0 2 3@2 ~ 5@2 4' }`. Rows (re-verified today): `.5` slider (axis 0..1); `saw` pick (a signal standing in for a number); `.3`, `.7` sliders (inherit the axis bounds); `8` spinner (floor .125, no ceiling); `'piano'` pick (the sounds actually loaded); `true` check; `2` spinner (floor 1); the notes string nothing (`free.notes: 'a line in mini-notation, written by hand'`). Caption with the whole-file count: 58 literals in `demo.strudel`, 51 with a control, the seven without being three section names and four note lines. `literals-viz.svg` exists; check its rows against this list (they match the old post, which matches today).

**V2 (keep, refresh): two paths out of one source.** Left, writes through `commit` into the one undo stack: typing in any of the three editors, a widget, alt-drag, a knob, a shape pick, a chord button, a pill/Apply/Verify, a section op or verb, a materials pick, the step grid, the roll, a waveform gesture, import. Right, reads an evaluated copy and never writes: solo, mute, A/B, preview level, plus pin and scrub as "where you are". Label the join: `audible()` takes the evaluated song and hands `arrange()` a filter; `setLive()` is the one place a pattern reaches the scheduler. `paths-viz.svg` exists; the left side has grown (verbs, shapes, harmony, grid, roll, waveform, import) since it was drawn.

**V3 (new): comment pin → request.** A transport lane with three dots (say cycles 6.2 in verse, 12.4 in drop's first bar, 15.0 in drop), an arrow from each to its numbered line `cycle 12.4 (drop, bar 1 of 8): too sudden`, and the fenced block underneath showing the header plus `verse` and `drop` quoted, with `verse` highlighted as "quoted because note 2 is in drop's first bar". The old `comments-viz.svg` from `handing-over` (five dots on arrival) is already copied into this post's directory untracked; either reuse it with its arrival caption (section map unchanged) or redraw on `demo` so the fenced block is short enough to show whole.

**V4 (new, optional): arrangement-strip anatomy.** One block annotated: name, 📌 ◀ ▶ ⧉ ✎ ⚡ ×, the eight layer rows shaded by density × level, `riser 2 | hit bd` into the next block, `dropout | sweep` on the tail, the outline for "playing", the pin state. Better as a screenshot with callouts than as an SVG.

---

## 6. Audio clips

**Existing clips, validity.** All seven clips in `knobs-in-the-code/audio/clips.json` and the two punchier clips in `handing-over-the-instrument/audio/` were rendered 2026-09-13 12:32. The songs behind them: `knobs0`, `knobs1`, `knobs-cp`, `punchier0`, `punchier1` were created in `7d93908` (2026-09-13 14:13) and have not changed since; `demo.strudel` got only the `// @blog` line in that commit and is musically unchanged since `b2a5aca` (2026-09-12). The event streams are pinned: `demo.strudel` is a golden fixture, `test/golden.json` was last regenerated 2026-09-12, and `node --test test/golden.test.mjs` passes at HEAD today, so every hap of `demo` (and therefore of `knobs0`/`knobs1`/`punchier0`/`punchier1`, which are `demo` plus one literal) is byte-identical to what the clips were rendered from. Caveat: `lib/song.mjs` changed how parts are routed to reverb buses on 2026-09-18 (orbits per reverb signature instead of one shared bus, not visible in the golden values), so a **whole-section** clip (`drop-full`) re-rendered today could differ subtly in reverb; **layer-alone** clips (`drag-*`, `solo-pad`, `part-*`, `punchier-*`) and the plain-Strudel `voice-clap-alone` are unaffected. Verdict: the clips remain valid; if any are re-rendered, re-render all nine together so they share one engine state.

**Manifest for `scripts/snippets.mjs`** (the punchier pair moves into this post; the two mp3s were already copied into `knobs-in-the-code/audio/` on 2026-09-19 08:31 and are untracked in the blog):

```json
[
  { "out": "knobs-in-the-code/drag-before", "song": "knobs0.strudel", "section": "drop", "layer": "drums", "cycles": 2 },
  { "out": "knobs-in-the-code/drag-after", "song": "knobs1.strudel", "section": "drop", "layer": "drums", "cycles": 2 },
  { "out": "knobs-in-the-code/solo-pad", "song": "demo.strudel", "section": "drop", "layer": "pad", "cycles": 2 },
  { "out": "knobs-in-the-code/drop-full", "song": "demo.strudel", "section": "drop", "cycles": 2 },
  { "out": "knobs-in-the-code/voice-clap-alone", "song": "knobs-cp.strudel", "cycles": 2 },
  { "out": "knobs-in-the-code/part-no-clap", "song": "demo.strudel", "section": "verse", "layer": "drums", "cycles": 2 },
  { "out": "knobs-in-the-code/part-with-clap", "song": "demo.strudel", "section": "drop", "layer": "drums", "cycles": 2 },
  { "out": "knobs-in-the-code/punchier-before", "song": "punchier0.strudel", "section": "verse", "layer": "drums", "cycles": 2 },
  { "out": "knobs-in-the-code/punchier-after", "song": "punchier1.strudel", "section": "verse", "layer": "drums", "cycles": 2 }
]
```

Run with `npm run headless -- songs/demo.strudel` open, then `npm run snippets -- clips.json --out-dir <blog>/src/content/posts/knobs-in-the-code/audio`; existing files are skipped unless `--force`. (Not run here: the browser is owned by another agent.)

**Optional new pairs** (each needs a new committed `// @hidden` `// @blog` song, the `knobs0/1` precedent; propose to Jon rather than doing it from here): a ⚡ verb, `cp songs/knobs0.strudel songs/knobs-breakdown.strudel && npm run resolve -- songs/knobs-breakdown.strudel drop --verb breakdown --write`, clip `drop` whole section 2 cycles before/after (hear the fx dropped and the room open); a shape pick, `knobs0` with `pad: { space: .5, brightness: wobble(.5, .9, 2), ... }` in the drop, clip the pad alone 4 cycles.

---

## 7. Screenshots wanted (for a blog-side Playwright script, later)

All local: `http://localhost:3000/` (the deployed URL works for everything except Change comments and import). The page needs a wide viewport (≥ 61rem; 1400 px wide is safe). `?section=<name>` pins and opens the card on that section without playing; add `&play=1` only if a playhead is wanted. Controls: set `localStorage.setItem('strudel:tweak', '1')` before load, or click `#tweak2` / `#tweak` / `#tweak0` (they are one setting).

1. **The whole Compose page** on `demo`, drop pinned: `?section=drop#demo.strudel`, full page.
2. **Section pane with controls on** (the old `section-controls.png` state): `?section=signal#arrival.strudel`, open `#secsrc` (`details#secsrc[open]`), controls on, crop `#secsrc`. **The existing `section-controls.png` is stale**: arrival's `signal` section changed on 2026-09-18 (`pad3: { ...choir, ..., level: .25 }` is now `level: .15`) and the spread consts it draws on changed too. Retake.
3. **Song source with controls on**, `demo`, crop `.card.pane` around the verse melody line (this is V1 as a photo).
4. **Arrangement strip**: `?section=drop#demo.strudel`, crop `#strip`; also `#arrival.strudel` for eight blocks with dropout/sweep/riser/hit picks visible (arrival has `riser: 4` into contact and `impact: true` on it).
5. **Axes grid with a signal lane**: `?section=verse#demo.strudel`, crop `#axes` (melody brightness is `saw.range(.3, .7).slow(8)`, drawn as a lane; fx has empty cells).
6. **Harmony strip** on the drop (`i VI III VII`, chord names over numerals) and on `arrival` `will` (`D:phrygian`, own key marked): crop `#harm`.
7. **Materials open on `demo` drop**: click `summary` of `#mats`; shows drum template and five voice picks, bass/melody notes with the roll (focus the notes box to open it), melody line/seed row, pad arp, level sliders. Also with **measure** pressed: dB readings next to levels and the `mstate` badge.
8. **A pick menu with audition rows**: click a `button.pick[data-mat=sound]` in materials; screenshot `#pick` (filter box, preview level, rows with ▶).
9. **Kit menu**: open `#songsrc`, controls on, click the `kit` pick; `#pick` with icons and the legend key.
10. **Sample row**: `?section=<first section>#chop.strudel` (`npm run check -- songs/chop.strudel` prints the section names), materials open: waveform with region, slice lines, slice buttons, the tempo readout and `use` / `song bpm` buttons.
11. **Step grid**: a song with a written template, `foundry.strudel` (materials open on its first section), or press **edit as grid** on `demo`.
12. **Phrase row with pills and a Verify result**: `?section=verse#demo.strudel`, type `drums` Enter, `punchier` Enter, press Verify, wait for `#vout:not([hidden])`; crop `#words` (the table and the two players). Needs audio to render, which works headless.
13. **A/B and undo state**: after a knob drag, the Mix header with `A/B` enabled and `hearing: before` on.
14. **Change comments** (local only): two comments added via the UI (set `#pos` value, fill `#fbcomment`, click `#fbadd`), crop `#feedback` with dots, list and the request text. Put one in a section's first bar so the request quotes the previous section.
15. **Why it sounds this way** on `demo` (3 requests recorded): crop the second card of `.panes`.
16. **Examples page**, one card with variants and its SVG: `examples.html#descriptors`, crop the `Punchy` card; and the map figure at the top.
17. **Narrow window**: viewport 700 px wide, the nav alert row.

---

## 8. Reproduction commands (Node only, no browser)

```
cd E:\github2\strudle
npm run check -- songs/knobs0.strudel      # drop drums 28/cyc, arc drop 59
npm run check -- songs/knobs1.strudel      # drop drums 26/cyc, arc drop 57
npm run check -- songs/punchier0.strudel   # verse drums 15/cyc
npm run check -- songs/punchier1.strudel   # verse drums 15/cyc, articulation .9 weight .65 drive .7 space .35
npm run check -- songs/arrival.strudel     # section map: void 0, signal 1, approach 9, contact 17, will 25, plea 33, threshold 41, after 53
node --test test/cm.test.mjs               # the schema/controls tests incl. the every-key-spec'd-or-free test
node --test test/compose.test.mjs          # buildRequest (first-bar rule), notesView, verifyRows, levelRows, share links
node --test test/golden.test.mjs           # demo's event stream still matches the 2026-09-12 golden (33 s)
node scripts/analyze.mjs renders/verify.before.wav renders/verify.after.wav   # the 2026-09-13 "much wider" run, not punchier
git log --format='%h %ad %s' --date=short -- songs/knobs0.strudel songs/punchier1.strudel songs/demo.strudel
git diff 7d93908 HEAD -- songs/arrival.strudel   # what moved under section-controls.png
```

Count literals vs controls (the script is not in the repo; it is the twelve lines that build an `EditorState` with `hllControls(SCHEMA)`, iterate the lezer tree for `Number`/`String`/`BooleanLiteral` nodes, and diff them against `findControls`; normalise `\r\n` first, the working-tree copies of `demo`/`knobs0` have mixed line endings and CodeMirror's doc positions are on `\n`).

Browser-needing steps, for whoever owns the page: `npm run headless -- songs/demo.strudel`, then `npm run snippets -- clips.json --out-dir ...` (section 6) and `npm run verify -- <copy of punchier0> verse drums "punchier"` (section 3).
