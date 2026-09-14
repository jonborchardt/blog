# Domain brief: `knobs-in-the-code` (Strudel Bench, part 5)

Repo: `E:\github2\strudle` (strudel-bench). All numbers below are measured, not recalled. Working tree at the time of writing is `7a4d1b0` plus uncommitted mp3/snippets work.

---

## 1. The strongest story

Your outline has the right *events* but the wrong *thesis*. The thesis that survives contact with the code is:

> **The harness was never replaced. The UI is the harness with a face on it.**

Every control in the Mix card and every widget in the editor routes back through modules that already existed for the CLI. The knobs call `setAxis` in `lib/resolve.mjs` — the same function `npm run resolve` calls. The word pills call `planEdits` — the same one. Verify calls `lib/analyze.mjs` — the pure half that `scripts/analyze.mjs` was split into (that split *is* commit `aa9b142`, "added mixer": `scripts/analyze.mjs` shrank 132 lines and `lib/analyze.mjs` appeared with 129). And the thing that actually decides what you hear, `audible()`, calls `arrange()` from `lib/song.mjs` — the very function `song()` itself uses to lay sections end to end, with one extra `patternOf` argument threaded through so the page can drop parts:

```js
// lib/song.mjs:21
export const arrange = (sections, total, patternOf = (s) => s.pattern) =>
  S.stepcat(...sections.map((s) => [s.span, patternOf(s).fast(s.cycles)])).slow(total);
```

That default-argument hook is the whole reason solo and mute are trustworthy. There is no second mixer. There is one arranger, and the page passes it a filter.

**That is why the pivot was cheap.** Not "an agent is fast", but "nothing was thrown away". A pivot that costs a few evenings is a pivot into a layer that was already factored to receive it. Say that and the post is about architecture. Say "agents make pivots cheap" and the post is a vibe.

The second-strongest thread, and the one a technical reader will actually steal: **the schema is a whitelist of semantics, and the default is silence.** A literal the schema does not describe gets no control, no underline, no drag. There is a test asserting that every key the language accepts is either specified or explicitly listed as free *with a written reason*. That is a small, copyable idea that generalises far past music.

**Weak or unsupported outline claims, in order of severity:**

- **"Every control is a source edit, not a runtime override."** False as written. There are exactly four runtime-only controls: solo, mute, A/B, and the preview-level slider (`pvGain`, stored in `localStorage` under `strudel:pvlvl`, explicitly `never written to the song`). Your own bullet four contradicts your bullet two. The line is real and worth drawing, but the claim needs the exception baked in, not bolted on.
- **"A pivot this size would normally be the thing you avoid."** It wasn't a pivot away from anything. The CLI, the checker, the resolver, the verifier and the render chain all still work and are all still the agent's interface. Nothing was deleted. Calling it a pivot oversells it; calling it *additive* and asking why it was cheap is the better, truer, more interesting move.
- **"A section auditioned alone versus in the full mix."** A section rendered alone and the same section inside the song are *the same audio*. Sections are sequential, not stacked. What isolates a *part* is solo (or the renderer's `--layer`). What pinning isolates is *time*, and its audible signature is that it loops instead of moving on.
- **"I could not understand a song I did not write."** Fine as motivation, but note that the engine already answered it: `npm run check` prints per-layer axis values translated back into English by `describeAxes`, and an `arc:` line of section energies with bar glyphs. The UI's contribution to comprehension is *simultaneity* (see it while it plays), not the existence of the information.

---

## 2. The pivot, from git

124 commits, `02d19e4` (2026-09-10 19:35) to `7a4d1b0` (2026-09-13 00:52). Span: **2 days, 5 hours, 17 minutes.** Grouping commits into sessions with a 90-minute gap threshold gives **8 sessions, 21.9 hours of in-session wall time.** That is consistent with post 1's "about twenty hours" and its 7.1 / 13.7 phase split; do not contradict it.

| Session | Window | In-session | Commits | Character |
| --- | --- | --- | --- | --- |
| 1 | 09-10 19:35 to 00:25 | 4.83 h | 43 | harness + engine |
| 2 | 09-11 07:27 to 09:44 | 2.28 h | 20 | material, harmony, meter |
| 3 | 09-11 16:55 to 22:32 | 5.62 h | 15 | **UI turn**: layout, examples page, kits, export |
| 4 | 09-12 00:02 | single commit | 1 | **`aa9b142` "added mixer"** |
| 5 | 09-12 07:41 to 09:44 | 2.06 h | 6 | materials + audition |
| 6 | 09-12 13:54 to 14:35 | 0.69 h | 6 | kit preview, first source panel in the card |
| 7 | 09-12 16:47 to 21:32 | 4.76 h | 26 | **inline controls**, song-source pane, then songs |
| 8 | 09-12 23:14 to 00:52 | 1.62 h | 7 | review fixes |

**When UI work started.** The textarea existed from minute three: `05a60f0` (09-10 19:38) "play page with song picker, textarea editor, live reload". It stayed a textarea for **23 hours of calendar time and 240 lines of `index.html`**. The first commit whose entire subject is interface is **`44b1155` (09-11 18:20) "updated layout"** — `index.html` 240 to 337 lines, `examples.html` created, `web/boot.mjs` extracted.

**The commit where the plan visibly changed** is **`aa9b142`, 2026-09-12 00:02, "added mixer"**: 1,051 insertions / 306 deletions across 20 files, of which `index.html` +385 and `web/strudel.css` +132. It is a single unlabelled commit landing at midnight after a 90-minute gap, and it is the largest single-commit jump in the page's life. It is also the commit that split `lib/analyze.mjs` and `lib/resolve.mjs` out of their scripts so the browser could import them. The plan changed there.

**The second pivot, controls inside the code, is `d4f000f`, 2026-09-12 16:47**, and it has the only properly written commit message in the whole UI arc:

> `mix card: the section pane is a CodeMirror 6 editor with schema-driven inline controls`
> *web/cm-editor.mjs builds the editor (no history: the page keeps the undo stack), web/cm-controls.mjs re-finds every literal web/hll-schema.mjs knows from the lezer tree after each change and, behind a controls checkbox, puts a range or select after it; alt-drag on a known number changes it in place. […] everything else stays plain code.*

**The inline-controls arc: `d4f000f` 16:47 to `fe25841` 18:45. One hour fifty-eight minutes. Twelve commits.** Diff across that window:

```
 index.html          | 248 +++++++++++++++-------------
 test/cm.test.mjs    | 176 ++++++++++++++++++++
 web/cm-controls.mjs | 200 +++++++++++++++++++++++
 web/cm-widgets.mjs  |  96 ++++++++++
 web/hll-schema.mjs  |  85 +++++++++
 web/cm-editor.mjs   |  52 ++++++
 web/strudel.css     |  76 +++++++--
 15 files changed, 997 insertions(+), 110 deletions(-)
```

Four new modules, a test file, and CodeMirror added as a dependency, in under two hours. Five dependencies were added in that window (`@codemirror/{state,view,language,commands,lang-javascript}`) and `scripts/pages.mjs` was taught to ship them package by package in the same commit, so the static build never broke.

**Page growth, `index.html` line count at each commit that touched it** (this is visual candidate 1):

| Commit | When | Lines | What |
| --- | --- | --- | --- |
| `05a60f0` | 09-10 19:38 | 100 | the textarea |
| `56db237` | 09-11 00:23 | 233 | exports, render routes |
| `8eab386` | 09-11 17:23 | 240 | end of the textarea plan |
| `44b1155` | 09-11 18:20 | 337 | layout turn |
| `9d09e4e` | 09-11 22:32 | 556 | kits, exports, packs |
| `aa9b142` | 09-12 00:02 | **891** | the mixer |
| `724d277` | 09-12 14:19 | 985 | kit + voice auditioning |
| `d4f000f` | 09-12 16:47 | 1023 | inline controls |
| `fe25841` | 09-12 18:45 | 1064 | controls everywhere |
| HEAD | 09-13 00:52 | 1221 | |
| working tree | | **1243** | |

**Engine versus UI, by commit.** Classifying each commit by the directories it touches (`index.html`/`web/`/`examples.html` = UI; `lib/`/`scripts/`/`gen/`/`server.mjs` = engine):

- 53 of 124 commits touch the UI, 70 touch the engine.
- **26 UI-only, 43 engine-only, 27 both.**
- `index.html` total churn across its whole life: **+1,922 / -701**.

**Verdict on "a few evenings": accurate, and slightly understated in one direction.** The Mix card through the inline controls, `44b1155` to `fe25841`, is **33 commits over 24 hours 25 minutes of calendar time and roughly 9 hours of in-session work**: three evenings and two mornings. So say "a few evenings" and you are right. But do not let a reader infer the *whole system* was a few evenings: it was ~22 hours over 2 days 5 hours, and the UI is the *back* ~9 of those, standing on a finished engine. The honest sentence is: "the interface cost about as much as the engine did, and got no planning at all."

---

## 3. The schema that decides what gets a control

`web/hll-schema.mjs`, 86 lines. It is data. The header comment says so:

> *Adding a key is a data edit here; the editor reads the shape, not the names.*

**The five buckets.**

| Bucket | Matches | Example |
| --- | --- | --- |
| `props` | an object key inside a `song(...)` header, a `section(...)` spec, one of its layer objects, or inside a `map` such as `drums.sounds` | `density`, `bpm`, `kit`, `template` |
| `calls` | positional arguments by callee name; `null` means "no control for this position" | `section: { args: [null, int(1,...), null] }` |
| `methods` | positional arguments of a Strudel method **anywhere** in the file | `.range`, `.slow`, `.fast`, `.segment` |
| `signals` | bare identifiers that may stand in for a number | `sine cosine saw isaw tri square rand perlin` |
| `free` | keys that take hand-written text or structure, **with a written reason** | 3 of them |

**The six spec kinds.**

```
{ type:'number', min, max?, step, scale?:'log' }   max present -> slider; max absent -> spinner, nothing invented
{ type:'enum', values, labels?, list? }            values may be a function (host-supplied lists)
{ type:'bool' }
{ type:'map', keys?, values }                      an object whose string values are each an enum
{ type:'tokens', values, sep }                     a string of tokens, any number of them
'inherit'                                          (argument specs only) the bounds of the HLL number this expression is the value of
```

`'inherit'` is the best idea in the file. `ramp(0, 1.5)` sitting as the value of `level` gets sliders bounded 0..2, because `enclosingNumber()` walks up the tree to the enclosing `Property`, resolves *its* spec, and hands it down. `sine.range(1, 5)` sitting as the value of `notes` gets **nothing**, because `notes` is free and has no bounds to lend. That exact case is pinned by a test.

**The test.** `test/cm.test.mjs`, "every key the HLL accepts has a control spec or is listed as free, with the reason":

```js
const all = new Set([...META_KEYS, ...section, ...AXIS_NAMES, ...layerNames().flatMap(layerMaterial)]);
const missing = [...all].filter((k) => !SCHEMA.props[k] && !SCHEMA.free[k]);
assert.deepEqual(missing, [], 'keys without a spec or a reason');
for (const [k, why] of Object.entries(SCHEMA.free)) {
  assert.ok(all.has(k), `free key ${k} is not an HLL key`);
  assert.ok(why.length > 8, `free ${k}: say why`);
}
```

It is bidirectional: a new language key with no spec fails the build, and a `free` entry naming a key the language no longer accepts also fails. And `why.length > 8` is a test that a sentence exists. I measured the actual sets:

- **33 keys the language accepts** (7 `META_KEYS`, 7 section-level, 12 axes, 19 layer materials across `drums bass melody pad fx`, deduplicated).
- **30 have specs. 3 are free.** The three, verbatim:
  ```
  packs: 'a list of sample pack names'
  notes: 'a line in mini-notation, written by hand'
  chord: 'a scale degree or a pattern of them'
  ```

**Why "not in the schema stays plain text" is the important half.** Because the alternative is a UI that guesses. A slider has a range; if the range is invented, it is a lie about the language drawn at 60fps under the user's cursor. The file's own comment states the rule: *"a literal without an entry here never gets a control, so a wrong range cannot be invented for it."* The open-ended number spec is the same principle applied inside a kind: `seed`, `phrase`, `riser` and `section()`'s cycle count have a floor and **no ceiling**, so they render as spinners rather than sliders, because a slider would have to invent a maximum.

**Real examples of both halves.** I ran `findControls` over the actual `songs/demo.strudel`:

```
controls: 52        literals total: 58        literals with a control: 51
literals WITHOUT a control:
  'intro'
  'verse'
  '0 2 3@2 ~ 4 3 2 0 2 3@2 ~ 5@2 4'
  'drop'
  '0 7 0 4'
  '0 2 4 7@2 6 4 2 0 2 4 7@2 5 4@2'
  '~ 7 ~ ~ 5 ~ 4 ~'
```

Seven literals in a whole song stay plain text: three section names (`calls.section.args[0]` is `null`) and four hand-written melodic lines (`notes` is free). Everything else gets a control. And the tests pin the negative space too:

```js
assert.equal(controls(`gain(0.72)\nfilter(2400)\nfoo(3, 'bar')\nconst x = { density: .5, template: 'house' }`).length, 0);
assert.equal(byPath(`other('a', 4, { drums: { density: .5 } })`)['drums.density'], undefined,
  'an unknown command is ordinary code');
```

`gain(0.72)` is a number with obvious semantics and gets nothing, because `gain` is Strudel, not the HLL. A `density: .5` in a loose object gets nothing, *unless* the file spreads that object into a layer (`hllKeys` collects every `...name` in the file first, then treats those consts as layer material, pathed `M.organicness`, `B.level`). That is three separate tests.

---

## 4. The widgets

`web/cm-widgets.mjs`, 97 lines, six factories, one chooser. The contract is one line of comment: `{ dom(control, ctx) -> element, update?(element, control) -> true to keep the element when the value changed }`.

```js
export function widgetFor(c, ui = {}) {
  if (c.kind === 'number') return c.spec.max == null ? spinner : slider;
  if (c.kind === 'bool') return check;
  if (c.kind === 'tokens') return ui.pick ? tokens : null;
  return ui.pick ? pick : select;                 // enum, ident
}
```

Two axes decide everything: **does the number have a ceiling**, and **does the host offer a menu**. In Node, with no host, an enum falls back to a native select and the chord row returns `null`: no widget rather than a broken one. That fallback is tested.

| Widget | What it is |
| --- | --- |
| `slider` | a range input. Log specs (`cps`) map position 0..1 through `s.min * (s.max/s.min) ** t`. Sets a `--v` custom property so the rack's track fill works. `update` refuses to clobber the element while it has focus, so a drag is not fought by a re-render. |
| `spinner` | a number input with a floor and no ceiling. Enter blurs. |
| `check` | a checkbox, styled as a toggle switch in CSS. |
| `pick` | a `button.pick` showing the value, opening the page's shared `#pick` popover; carries a play glyph when `ui.canAudition(path, control)` says the value can be heard; may show an image via `ui.icon` (kit glyphs). Captures its live position with `at()` so the host can tell which section it now sits in. |
| `tokens` | the progression as a row of chord buttons plus a plus button. Brackets survive as literal text, so `[i VI]` sub-bar groups are preserved. Picking an empty value at an existing index splices the chord out. |
| `select` | the no-host fallback. |

**The alt-drag gesture** (`web/cm-controls.mjs`, credited in the source as "the codemirror-interact model, driven by the schema instead of a regex"):

```js
const DRAG_PX = 200;
const dragValue = (v0, dx, s) =>
  s.max == null       ? v0 + Math.trunc(dx / 8) * s.step
  : s.scale === 'log' ? v0 * (s.max / s.min) ** (dx / DRAG_PX)
  :                     v0 + (dx / DRAG_PX) * (s.max - s.min);
```

A bounded number crosses its **entire range in 200 px**. An open number steps once every **8 px**. A log number multiplies. The handler bails unless `altKey && button === 0` and the position lands inside a known **number** control; enums and strings are not draggable. Crucially it re-finds the control on every mousemove and gives up if it is gone: the document is authoritative even mid-gesture. **The drag works whether or not the widgets are shown**, because `drag` is always in the extension and only the `Decoration.widget` is gated on `controlsShown`.

**How an edit gets into the document.** Never through a remembered offset:

```js
function setFrom(view, dom, path, value) {
  if (!dom.isConnected) return;   // the document was swapped under an open menu: no guessing which literal was meant
  const pos = view.posAtDOM(dom);
  const c = controlsOf(view.state).find((x) => x.to === pos && x.path === path);
  if (c) view.dispatch({ changes: editFor(c, value), userEvent: 'hll.control' });
}
```

The widget asks the view where its own DOM node currently is, matches the control by `(position, path)`, and dispatches a change. `editFor` is pure and does the quantizing:

```js
export function editFor(c, value) {
  if (c.kind === 'number') return { from: c.from, to: c.to, insert: fmtNum(quantize(value, c.spec), c.spec) };
  if (c.kind === 'bool')   return { from: c.from, to: c.to, insert: String(!!value) };
  if (c.kind === 'ident')  return { from: c.from, to: c.to, insert: String(value) };
  const q = c.quote ?? "'";
  return { from: c.from, to: c.to, insert: `${q}${String(value).replaceAll(q, `\\${q}`)}${q}` };
}
```

Three details worth quoting in the post: it **clamps and rounds to the spec** (`quantize(-3, level) === 0`, `quantize(0.7000000001, density) === 0.7`); it **preserves the existing quote character**; and `fmtNum` strips the leading zero (`.35`, not `0.35`) so a knob-edited file is spelled the way a hand-written one is. There is a test asserting each of those against the real source text. An identifier is written bare, so picking `perlin` over `saw` produces `density: perlin.range(...)` and not a quoted string.

`CtlWidget.eq()` compares `(make, path, spec, value)`, and `updateDOM` delegates to the factory's `update`, which returns `true` to keep the element: that is how a slider survives a drag and a spinner survives being typed into without the DOM being rebuilt under the pointer.

---

## 5. What you hear versus what is written

The comment in `index.html` states the rule before the code does:

```js
// solo and mute are what you hear, not what is written: sets of part names, applied whenever the scheduler is handed a
// pattern. A/B swaps in the source before the last undo step, evaluated without the scheduler, on the same clock.
const solo = new Set(), muted = new Set();
let ab = false, abPat = null;
const passes = (l) => (solo.size ? solo.has(l) : !muted.has(l));

function audible(pat) {
  const filt = (s) => { const ps = Object.entries(s.layers).filter(([l]) => passes(l)).map(([, x]) => x.pattern);
                        return ps.length ? strudel.stack(...ps) : strudel.silence; };
  if (!pat.strudel || (!pinned && !solo.size && !muted.size)) return pat;
  const secs = pat.strudel.sections;
  if (pinned) { const s = secs.find((x) => x.name === pinned); return s ? filt(s) : strudel.silence; }
  return arrange(secs, pat.strudel.total, filt);
}
async function setLive() { if (playing && songPat) (await ready).scheduler.setPattern(audible(ab && abPat ? abPat : songPat)); }
```

Three things to pull out:

1. **Solo wins over mute**: `passes` checks `solo.size` first, which is the hardware convention and the only sane one.
2. **There is exactly one place a pattern reaches the scheduler**: `setLive()`. `play`, `applyPin`, the A/B button and every solo/mute click all go through it. That is why the rule holds: it is not four rules, it is one funnel.
3. **`audible` takes an evaluated song and produces another pattern.** The source is an input, never an output. Nothing writes back. Refreshing, saving, exporting or handing the file to the agent all see a song with no memory of what was soloed.

**A/B** takes `past.at(-1)`, literally the string on top of the undo stack, runs it through `evalCode` (an evaluation with no scheduler attached), and hands the result to the same `setLive()`, on the same clock, at the same cycle. If the previous version does not evaluate, the button reverts itself and says so rather than going silent. **Any commit turns A/B off**, because "before the last change" stops meaning anything the moment there is a newer last change.

**What it buys.** Solo is a question about a mix ("is the pad doing anything?"), not a decision about a song. If solo edited the source, asking the question would cost an edit, an undo, and a diff you have to notice. Because it does not, the source stays a clean record of intent and stays diffable by the agent, which matters enormously when the agent's entire view of the song is the file. There is a second, subtler payoff: because `audible()` reuses `arrange()`, a soloed part is *bit-identical* to that part inside the song. The mixer cannot drift from the renderer, because it is the renderer.

**The undo stack.**

```js
let current = ''; const past = [], future = []; let stamp = 0;
function commit(src, coalesce = false) {
  if (src === current) return;
  if (!coalesce || Date.now() - stamp > 1000) { past.push(current); if (past.length > 200) past.shift(); future.length = 0; }
  stamp = Date.now(); current = src;
  code.setText(src);
  if (ab) { ab = false; abPat = null; }
  syncUndo();
}
```

Whole-document snapshots, capped at 200, coalesced by a **one-second window** when the caller passes `coalesce`. Typing coalesces, knob drags coalesce; section ops, kit changes and vocabulary pills do not. A drag's end explicitly resets the window, so the next drag starts a fresh step instead of merging into the previous one. `code.setText` diffs common prefix and suffix and dispatches only the changed span, so a knob drag reparses one literal instead of the file.

The critical architectural decision is in `web/cm-editor.mjs`, stated in its header comment: **"No history extension: the page keeps one undo stack for every way the source changes, and ctrl+z reaches its document-level handler from here."** CodeMirror ships an undo stack. It was deliberately not installed, because there would then be two (the editor's and the page's) and the section pane, the song pane, the main editor, the knobs, the pills, the harmony picks and the section ops would not share one. `travel()` even blurs a focused pane before restoring, so the pane re-reads the restored source instead of being treated as mid-edit.

**What deliberately bypasses it:** solo, mute, A/B, `pvGain` (preview level), pinning, and scrubbing. Four of those six are "what you hear"; two are "where you are". Nothing that bypasses the stack is a musical decision.

---

## 6. Pinning and auditioning

**Pinning.** A song's sections are laid out by `arrange` as `stepcat` weighted by `span`, where

```js
const span = cycles * ctx.cps / cps;   // lib/song.mjs:50
```

`cycles` is bars of the section; `span` is how many *song* cycles those bars occupy, which differs from `cycles` whenever the section carries its own `bpm`/`cps`. Pinning hands the scheduler the section's own pattern, un-`fast`ed, at the section's own cps:

```js
async function applyPin(at) {
  const r = await ready;
  setcps(loop ? loop.cps : songPat.strudel.meta.cps);
  await setLive();
  r.scheduler.setCycle(loop ? toLocal(at) : at);
}
const toSong  = (local) => loop.offset + (local % loop.cycles) * loop.span / loop.cycles;
const toLocal = (c) => Math.max(0, Math.min(loop.cycles, (c - loop.offset) * loop.cycles / loop.span));
```

So a pinned section loops **by itself**: the comment is explicit, *"no clock jumps, nothing scheduled past its edges."* The page never loops it by scheduling a jump back; it simply gives the scheduler a short pattern and lets it repeat, which is why the loop point is seamless. Everything displayed stays in song cycles, and `toSong`/`toLocal` convert at the section's tempo. Unpinning computes the equivalent song cycle from the current local position and hands the song pattern back at that point. Play from stopped starts at the pin. Export renders the pinned section alone.

**Auditioning** is one primitive, `preview(btn, build)` / `run(btn, build)`, where `build()` returns `{ pattern, cps, what }`. Two bars, every time, at the section's tempo (`2000 / cps` ms plus a 200 ms tail). Pressing the same play glyph again stops it. It uses the repl's own `setCps` rather than the `setcps` global, because that global only exists once a song has been evaluated, so auditioning works before the first Play. It resumes the AudioContext itself, because superdough's `initAudio` does not.

Three builds sit on top:

- **A material**: `audition()` evaluates `setMaterial(src, section, layer, key, text)` and plays that section's layer pattern. This is a *speculative evaluation*: the candidate value is spliced into a copy of the source, the whole song is evaluated, and one layer is pulled out. Nothing is committed. Picking a value is a separate act from hearing it: menu rows carry a play glyph that auditions **without selecting**.
- **A drum voice, alone.** This is the one with a real argument behind it. The comment gives the reason: *"the whole part would drown it, or not even include it, since voices join as density rises."* That is literally true. `DRUM_THRESH = { bd: .1, sd: .3, hh: .5, oh: .7, cp: .85 }`. Auditioning a clap inside a part at `density: .6` would play you silence, because at .6 the clap is not in the part. So the voice is previewed on its own template grid, through `voiceSound`, which carries the drums layer's own kit rule: a name the kit has keeps the kit; any other sample plays bare.
- **A kit**: `auditionKit` plays the same fixed two bars through every kit, so kits are compared on identical material. Voices a kit lacks are dropped and **named in the status line** instead of logging "sound not found".

**Preview level** (`pvGain`) is a log-scaled slider, x0.1 to x50, duplicated in the materials panel and the menu header, persisted in `localStorage`, and never written to the song. x50 exists because a single hi-hat sample next to nothing is very quiet.

---

## 7. The honest costs

**`index.html` is 1,243 lines and 101,048 bytes on disk** (1,221 lines at HEAD). Of that:

- **one inline module script block of 1,110 lines and 88,147 characters: 89% of the file's lines and 88% of its bytes.**
- The mixer, its two source panes, the undo stack, the transport/strip and the audition path occupy roughly lines 272 to 480 and 605 to 1030: **about 635 of those 1,110 lines, ~57% of the page's JavaScript.**
- `web/strudel.css` is 384 lines, of which **139 (36%)** are mixer and control styles.

**Test coverage of that 1,110-line module: zero.** The repo has **141 tests across 22 files (1,892 lines)**. Exactly one of them reads `index.html`, and it is `test/pages.test.mjs`, which does two regex checks on the built output: a URL lint and a string search. Nothing evaluates a line of the page's behaviour. There is no Playwright test suite; `playwright-core` is a dev dependency used by `scripts/headless.mjs` to *open* the page for renders, not to assert anything about it. There is no CI job that loads the page in a browser.

The extracted modules are the exception and are well covered: `web/cm-controls.mjs` (205 lines), `web/cm-widgets.mjs` (97) and `web/hll-schema.mjs` (86), **388 lines**, are exercised by 11 tests in `test/cm.test.mjs` (178 lines), running against `EditorState` in Node with no DOM. `web/cm-editor.mjs` (58 lines) is untested because it constructs an `EditorView`. That is the right seam and the right trade: *the pure part was extracted so it could be tested, and the DOM part was left untested on purpose.*

**Specifically what breaks silently.**

1. **The schema is flat, so it underlines keys in the wrong place.** `specFor` matches on key name and depth only; it never checks that the enclosing object is actually a layer, or that this layer accepts this key. Verified:
   ```
   section('a', 4, { drums: { kit: 'RolandTR909', phrase: 3, arp: 'up', progression: 'i VI' } })
     -> controls: drums.kit (pick), drums.phrase (spinner), drums.arp (pick), drums.progression (chord row)
   ```
   None of those are legal. `npm run check` rejects them with a good message. Same for a section-level axis: `section('a', 4, { density: .5 })` gets a slider and the language answers `unknown layer "density" in section "a"`. So **"anything not in the schema stays plain text" is enforced; the converse, "everything the editor underlines is legal here", is not.** The editor will happily offer you a chord picker for a chord progression on the drums. The build catches it; the UI invited it. This is the single most concrete honest cost in the post, and it is a five-minute fix nobody has made.
2. **`canAudition` is a hand-written regex over control paths**, sitting in `index.html` with no test. Add a previewable material key to a layer and the play glyph silently does not appear. Nothing fails.
3. **Provenance is parsed back out of a status string.** `saveNotes` recovers structured data from the human-readable message `did()` wrote: `const m = /^(\w+) (\w+) ([\d.]+)/.exec(p.text);`. Reword a status message and the notes file quietly degrades from structured data to a free-text blob. No test covers it.
4. **And nobody has used it.** I checked every provenance file in the repo: **`songs/*.notes.json` contains zero requests with `ask: 'edits made in the mixer'`.** `arrival.notes.json` has 8 requests and 31 changes, all of them asks written to the agent. The mixer's own record-keeping shipped and has never fired, partly because it is local-server-only, partly because the song that came *after* the mixer was still made by talking to the agent. That is an uncomfortable, interesting fact and the post is better with it than without it.
5. **Regex-based source surgery under the CodeMirror layer.** `web/compose.mjs` locates the song header and whole sections with regexes. Those are fine today and will mis-fire on a nested brace or an unusual layout. `lib/resolve.mjs` uses acorn and is safe; `web/compose.mjs` does not and is not.
6. **`sectionAround` swallows every error**: a parse failure becomes "no section", which becomes "no audition", silently.

**The blunt summary for the post:** the interface is 57% of the page's JavaScript, has no behavioural test of any kind, and its correctness rests entirely on three things: that its edits go through the same pure modules the CLI uses, that `npm run check` runs on every song, and that the author was sitting there listening. Two of those three are real engineering. The third does not scale to a second person.

---

## 8. Factual corrections to your outline

| Your line | Correction |
| --- | --- |
| "no UI beyond a textarea" was the plan | Accurate, and datable: the textarea shipped at 09-10 19:38 and was replaced at 09-12 18:05 (`932b9b5`). It lasted 47 hours and 240 lines. But the "harness" was never only a textarea: by then `check`, `resolve`, `render`, `verify`, `lint` and `dump` all existed as CLIs and all still exist. |
| "Every control is a source edit, not a runtime override" | Four exceptions, by design: solo, mute, A/B, preview level. Rewrite as "every control that changes the *song* is a source edit; the four that change only what you hear are named and kept out of the file." |
| "arrangement strip, harmony row, axis grid with mute and solo, materials, a vocabulary phrase row" | Incomplete and out of order. Top to bottom the card is: **song pane, arrangement strip, section pane, harmony row, axes grid (with an event strip under each row and a playhead), materials, add-part dropdown, vocabulary phrase row**. The two source panes are the part this post is actually about and are missing from your list. |
| "a slider, spinner, chord picker or sound menu" | Six widgets: slider, spinner, check (toggle), pick (menu button, with a play glyph when audible), tokens (the chord row), select (the no-host fallback). |
| "the editor underlines exactly those" | The underline and the alt-drag are **always on**; only the widgets are behind the `controls` checkbox, which is **off by default** and remembered in `localStorage`. A test asserts the default: *"hidden by default: the code reads clean."* |
| "one undo stack, coalesced so a knob drag is not forty undo steps" | Correct, and worth the extra beat: CodeMirror's own history extension was deliberately **not** installed, because there would then be four stacks (three editors plus the page). |
| "Pin a section and it loops alone at its own tempo" | Correct and precise. Add that it loops by *being* a short pattern, not by a scheduled jump. |
| "Audition a kit, or one drum voice, before committing" | Correct. The reason a voice plays alone is stronger than "before committing": at `density: .6` the clap is not in the part at all (`DRUM_THRESH.cp = .85`). |
| "a few evenings" | Holds: 33 commits, ~9 in-session hours, 24 calendar hours for the Mix card through inline controls. Do not extend it to the whole system. |
| "a pivot this size would normally be the thing you avoid" | It was additive, not a rewrite. Nothing was deleted; the CLI still works. That is the reason it was cheap, and burying it costs you the post's best idea. |

---

## 9. Terminology and caveats

**Terms to use precisely**

- **HLL**: the repo's own name for the `song()`/`section()` layer. Introduce it once, or say "the song language"; do not switch between them.
- **axis**: one of 12 named 0..1 dimensions where **0.5 is the baseline no-op** (enforced by test). Not "a parameter".
- **layer / part**: `drums bass melody pad fx`. The code says "layer"; the UI says "part". Pick one for the prose and note the other once.
- **material**: the non-axis keys in a layer. Harmony (`key`, `progression`) is material, not an axis.
- **control**: the schema's word for "a literal the editor knows". **widget** is the DOM element. They are different things and the code is careful about it.
- **cycle vs bar**: a Strudel *cycle*; a section's *bars* (`cycles`) versus its *span* in song cycles.
- **cps vs bpm**: `cps` is cycles per second, the native unit; `bpm` is a convenience, and giving both throws.

**Caveats to state in the post**

- Every claim about what something *sounds* like in this repo is at best "verified directionally".
- The page is desktop-only by explicit decision.
- The controls checkbox is off by default, so a reader who opens the live site will not see widgets until they tick it. Say so, or the screenshots will not match what they get.

**What will go stale**

- Every line count and commit count. Timestamp them (as of `7a4d1b0`, 2026-09-13).
- The three `free` keys and the 30/33 split: one new material key moves both.
- `DRUM_THRESH` values, which the clap clip depends on.
- `web/cm-editor.mjs`'s header comment says the factory "is meant to take over the page's main source pane later"; it already has. The comment is stale in the repo.
- `CLAUDE.md` calls the inline controls "an experiment ahead of moving the main pane to CodeMirror": also already done. Code wins.

---

## 10. Proposed visuals

**Recommended three: V1, V2, V3.** V4 is a good fallback.

**V1 — "The textarea lived for 240 lines" (quantitative).**
A step line of `index.html` line count against commit time, 09-10 19:35 to 09-13 00:52, with two annotated markers: `aa9b142` (09-12 00:02, 556 to 891, "added mixer") and `d4f000f` (09-12 16:47, 1000 to 1023, "inline controls"). Units: lines of `index.html`; x-axis: hours since the first commit. The shape is the argument: flat for 22 hours, then a cliff at midnight.

**V2 — One real line, annotated (the best one).**
Verbatim from `songs/demo.strudel`:

```
melody: { density: .5, brightness: saw.range(.3, .7).slow(8), sound: 'piano', follow: true, phrase: 2, notes: '0 2 3@2 ~ 4 3 2 0 2 3@2 ~ 5@2 4' },
```

I ran `findControls` on it. Verbatim output, nine controls:

| Literal | Path | Widget | Why |
| --- | --- | --- | --- |
| `.5` | `melody.density` | slider | axis, 0..1 |
| `saw` | `melody.brightness.signal` | pick | a signal standing in for a number |
| `.3` | `melody.brightness.range(0)` | slider | `inherit`: the axis bounds |
| `.7` | `melody.brightness.range(1)` | slider | `inherit` |
| `8` | `slow(0)` | spinner | floor .125, no ceiling |
| `'piano'` | `melody.sound` | pick | enum, host list |
| `true` | `melody.follow` | check | bool |
| `2` | `melody.phrase` | spinner | floor 1, no ceiling |
| `'0 2 3@2 ~ ...'` | none | **none** | `notes` is `free`: "a line in mini-notation, written by hand" |

Draw it as the code line with callouts under each literal, the last one visually different: no underline, no widget, the reason quoted. Caption with the whole-file figure: 58 literals in `demo.strudel`, 51 with a control, 7 without.

**V3 — One source, two paths (conceptual).**
A single "source" node. Down-left, the **written** path: knob / widget / alt-drag / pill / section op, then `commit()`, then the one undo stack, then the document. Down-right, the **heard** path: solo / mute / A/B / preview level, then `audible()`, then `setLive()`, then the scheduler. The two paths meet at "the song file" only on the left. Label the right-hand arrows "never writes". Include the join: `audible()` reads an *evaluated* copy of the same source, so the right path depends on the left but never feeds back.

**V4 — The schema decision tree (conceptual, fallback).**
`literal in the syntax tree`, then *inside a `song`/`section` object, a layer object, or a `map`?*, no gives **plain text**; yes then *key in `props`?*, no gives **plain text**; yes then kind: `number` then *has `max`?* yes gives **slider**, no gives **spinner**; `bool` gives **check**; `tokens` gives **chord row**; `enum`/`ident` then *host menu?* yes gives **pick**, no gives **select**. Every terminal on the left-hand side is "plain text", which is the point.

---

## 11. Proposed audio clips

Format is the `npm run snippets` manifest. All clips below are 2 bars. Precedent: `say-darker` used `songs/darker0|1|2.strudel` as committed intermediate files; do the same here.

### Clip set A: one knob drag, before and after (needs two intermediate song files)

The knob: `drums.density` in `demo.strudel`'s `drop`, `.9` to `.84`. Six hundredths of travel on a slider that crosses its whole range in 200 px, about 12 px of mouse movement. `DRUM_THRESH.cp = .85`, so the clap leaves the part. Verified with `npm run check`:

```
.9:   drums  28/cyc  density=0.9   drive=0.8 articulation=0.7
.84:  drums  26/cyc  density=0.84  drive=0.8 articulation=0.7
arc:  drop 59   ->   drop 57
```

**How to produce it.** Copy `songs/demo.strudel` to `songs/knobs0.strudel`. Copy again to `songs/knobs1.strudel` and change exactly one literal in the `drop` section's drums line: `density: .9` to `density: .84`, which is exactly the replacement `editFor` would dispatch. Commit both. Then:

```json
{ "out": "knobs-in-the-code/drag-before", "song": "knobs0.strudel", "section": "drop", "layer": "drums", "cycles": 2 },
{ "out": "knobs-in-the-code/drag-after",  "song": "knobs1.strudel", "section": "drop", "layer": "drums", "cycles": 2 }
```

### Clip set B: a part alone versus the section (no intermediate files)

This is exactly what solo does, and the renderer's `--layer` takes the same path, so the clip *is* the feature.

```json
{ "out": "knobs-in-the-code/solo-pad",   "song": "demo.strudel", "section": "drop", "layer": "pad", "cycles": 2 },
{ "out": "knobs-in-the-code/drop-full",  "song": "demo.strudel", "section": "drop", "cycles": 2 }
```

Do **not** label this "a section auditioned alone versus in the full mix": a section alone and the same section in the song are identical audio. Label it "one part solo'd, then the same two bars with everything", and say in the prose that solo did not touch the file.

### Clip set C: a drum voice alone versus the part that does not contain it (one intermediate file)

The strongest of the three, because it demonstrates *why* per-voice auditioning exists rather than just showing it.

`songs/knobs-cp.strudel`:
```
s("cp").struct("~ ~ ~ ~ x ~ ~ ~ ~ ~ ~ ~ x ~ ~ ~").bank("RolandTR909")
```

Two claps per cycle at .25 and .75, the house `cp` grid, verbatim. A plain file gets the default `cps: 0.5`, which is `demo.strudel`'s tempo, so the three clips line up.

```json
{ "out": "knobs-in-the-code/voice-clap-alone", "song": "knobs-cp.strudel", "cycles": 2 },
{ "out": "knobs-in-the-code/part-no-clap",     "song": "demo.strudel", "section": "verse", "layer": "drums", "cycles": 2 },
{ "out": "knobs-in-the-code/part-with-clap",   "song": "demo.strudel", "section": "drop",  "layer": "drums", "cycles": 2 }
```

The order to present them: the clap alone, then `verse` drums at `density: .6` where **the clap is not there at all**, then `drop` drums at `.9` where it is there and buried. Caption: *"this is why a voice is previewed alone: in the middle clip there is nothing to preview."*

### Total: 7 clips, 2 bars each, 64 kbps mono.

New files this requires in `E:\github2\strudle\songs\`: `knobs0.strudel`, `knobs1.strudel`, `knobs-cp.strudel`. All three check clean; all three follow the `darker0/1/2` precedent; all three should be committed so the post is reproducible.
