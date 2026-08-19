---

name: create-visual

description: Use when a post needs a figure, chart, diagram, animation, illustration or interactive widget — creating one, modifying one, finding where an existing post should have one, or auditing an existing visual's accessibility (name/summary/alt, decorative vs meaningful).

---

# create-visual

**Announce:** "Using create-visual for the visuals in <post>."

## Step 0 — Find the spots (when asked to add visuals to an existing post)

Read the whole post, then use the candidate table in `write-post` step 3 (data flow → flowchart; states → state diagram; quantitative claim → chart with `data`; spatial idea → schematic; side-by-side → two-panel). Verify anything that describes code against the domain brief or source before drawing. Then continue below for each one.

If the post frontmatter has `authority`, the authority repo owns what the visual means — data, labels, states, relationships, thresholds, terminology, caveats, and whether it creates a misleading mental model (contract: `write-post` → Authority). Work from the **domain brief** at `./research/brief.md`: it should already carry each proposed visual's authoritative data and semantics. Delegate a targeted question to the authority agent only for a visual the brief doesn't cover. No brief file means planning hasn't happened — do `write-post` step 2 first (the existing post is the author material) so the expert proposes the visuals and supplies their data/semantics; this skill consumes the brief, it doesn't plan. The blog repo still owns the medium, React/SVG/MDX implementation, styling, accessibility, and presentation.

## Step 1 — Pick the medium

Ladder — stop at the first rung that holds (`CLAUDE.md`: static first, no charting library until a real post needs one):

1. **Mermaid fence** for flow/sequence/state diagrams (build-time SVG; add `accTitle`/`accDescr` and a describing sentence nearby). Sizing (the site config already sets 14px text and tight spacing; you control the shape):

   - The diagram must fit the prose measure at native size: **rendered `viewBox` width ≤ 640px** (check `dist/<slug>/index.html` after a build). Wider diagrams get scaled down and the text with them.

   - Default to `flowchart TB`; use `LR` only for ≤ 4 short nodes in a row. Never place two subgraphs side by side.

   - Keep node labels short and break them yourself with `<br/>` (2 lines max, ~30 chars each); mermaid's auto-wrap makes tall narrow boxes.

   - Diamonds `{}` grow with their text and are the number-one cause of giant diagrams: use them only for a 1–3 word decision (`{oracle check}`) and put the conditions on the edge labels; a long question goes in a rectangle.

   - Avoid a diagonal "staircase" (a chain of decisions each with a side exit): dagre drifts it sideways and it ends up as wide as it is tall. Fold each exit into its rung's label and draw one straight chain.

   - Every diagram: view the built page at 1280 and 360; if it needs a scrollbar or the text is unreadable, reshape it (see the no-scroll rule below).

2. **Static SVG file** in the post directory for bespoke illustrations and fixed-data charts: `viewBox` + width/height, `currentColor` / theme hex from `src/styles/theme.ts` so it follows both themes, `<text>` ≥ 11px at rendered size. Render with `<img src={svg.src} width height alt="…">` (or inline as `<Svg class="h-auto w-full max-w-2xl" />` when it must inherit CSS). **It must scale to fit — no scrollbars.** Never wrap a visual in `overflow-x-auto` or give it a `min-w-*`; if it is unreadable when scaled to 360px it is too wide, so redraw it (stack panels vertically, `TB` layout, fewer/shorter labels, larger `<text>`), never scroll it.

3. **HTML + CSS** (inside a `Figure`) when the visual is really a table, a set of bars, or a layout — no script.

4. **React island** only when the reader manipulates it or it must compute on demand:

   - `src/content/posts/<slug>/components/<Name>.tsx`; render with `<Name client:visible />` (`client:load` only if it must respond immediately, e.g. above the fold).

   - Tokens/utility classes only (no raw colours), `not-prose` wrapper, keyboard operable, visible focus, `prefers-reduced-motion` respected for any animation, live region for dynamic text.

   - Add `<Name>.test.tsx` next to it (React Testing Library; see `interactive-islands-in-mdx/components/Counter.test.tsx`).

   - Keep props serialisable and small — never pass whole post bodies as props.

   - Promote to `src/components/blog/` only once a second post needs it.

## Step 2 — Classify (rungs 2–4)

\| Class                   | Test                                                          | Treatment                                     |

\| ----------------------- | ------------------------------------------------------------- | --------------------------------------------- |

\| Meaningful, static      | Conveys data/structure a sighted reader gets by looking       | `<VizFigure name summary>`                    |

\| Meaningful, interactive | Has focusable or user-manipulable elements                    | `<VizFigure interactive name summary>`        |

\| Decorative              | Deleting it loses no information (or it restates nearby text) | `aria-hidden="true"` (or `alt=""`) — no label |

Auditing: read every visual in the post, not just the ones the build complained about — check-dist/axe can't judge whether a summary is useful or whether a labelled visual is really decorative.

## Step 3 — Wrap

`VizFigure` (`src/components/blog/VizFigure.astro`, docs in `src/components/blog/README.md`) owns the ARIA wiring: `aria-labelledby`/`aria-describedby` from `name`/`summary`, hides static internals from the a11y tree, keeps `interactive` internals exposed, renders `data` as a visually-hidden table. Wrap it in `Figure` for a visible caption or wide measure.

```mdx

import VizFigure from "@/components/blog/VizFigure.astro";

import chart from "./downloads.svg";

<Figure caption="Downloads by year">

  <VizFigure

    name="Downloads by year, 2022–2025"

    summary="Annual downloads climb steadily, then jump sharply in 2025 — that final year is roughly half the cumulative total."

    data={{ caption: "Downloads by year", columns: ["Year", "Downloads (millions)"], rows: [["2022", 4], ["2023", 9], ["2024", 13], ["2025", 24]] }}

  >

    <img src={chart.src} width="800" height="400" alt="" />

  </VizFigure>

</Figure>

```

Rules:

\- **Visuals fit their container at every width; they never scroll.** `overflow-x-auto` is for tables and code only. A diagram that needs a horizontal scrollbar is a defect: redraw it narrower or taller (Mermaid `TB` instead of `LR`, two panels stacked instead of side by side).

\- **Never hand-roll `role="img"` + `aria-label`** on a chart/diagram/demo — use `VizFigure`.

\- Inside a non-interactive `VizFigure` the child is hidden anyway: `<img alt="">` for a rendered SVG/PNG, `aria-hidden="true"` on an inline `<svg>` (a screen reader's per-tag check still sees it).

\- `data` only when the chart plots specific stated values; schematic/"illustrative" visuals get no table (a table would invent precision).

\- No focusable elements (`tabIndex`, buttons, links) inside a non-interactive `VizFigure` — hidden-but-focusable is a WCAG failure. Controls ⇒ `interactive`.

\- Visible text that must stay readable (a caveat, footnote, legend) is a sibling _\_after\__ `VizFigure` (or `Figure`'s `caption`), never a child — non-interactive `VizFigure` hides all children.

\- `name` must be unique on the page (ids derive from it); a loop of per-item charts gets a distinct name per instance — or one `VizFigure` around the loop only when the instances genuinely share one takeaway.

## Step 4 — Write the name and summary

**Name** identifies what the visual shows, in one clause. **Summary** states the main takeaway a sighted reader gets at a glance: the trend, relationship, outlier or comparison.

\- Accuracy and usefulness first; a mildly vivid phrase is fine when it improves clarity.

\- Restrained language: "pulls ahead", "clusters tightly", "drops sharply", "remains stubbornly flat".

\- No jokes, character voices or extended metaphors; never anthropomorphise sensitive, serious or uncertain findings.

\- Preserve units, uncertainty, caveats, correlation-vs-causation.

\- Complement the visible caption — don't repeat it verbatim.

\- Numbers in the summary must match the plotted data (`data.rows` if present).

- When `authority` exists, domain-specific numbers, labels, relationships, and takeaways must match the domain brief. Semantic changes get checked in `review-post`'s validation pass — consult the expert immediately only when a change materially alters a claim or the brief can't answer it.

\| Register               | Example                                                                                         |

\| ---------------------- | ----------------------------------------------------------------------------------------------- |

\| Plain (fine)           | "Model C has the highest score on five of six benchmarks."                                      |

\| Lightly playful (good) | "Model C pulls ahead on five of six benchmarks, with its clearest lead on Math."                |

\| Too much (never)       | "Model C charges triumphantly across the benchmark savanna while its competitors trail behind." |

## Check

\- `npm run validate && npm run build` (alt/width/height enforced on every `<img>`; check-dist reports the file to fix). Islands/layout changes: `npm run test:e2e` (axe WCAG 2.2 AA on every page).

\- View at 360 and 1280 in both themes (`node e2e/shots.mjs <outdir> <slug>/`); nothing stays fixed-colour when the theme flips; a prose post must still ship zero `script[src]`.

## Common mistakes (extend when new ones surface)

\| Mistake                                                                                                                                                                   | Fix                                                                                                           |

\| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |

\| Summary restates the visible caption without adding anything                                                                                                              | Name identifies; summary adds the takeaway the caption doesn't state                                          |

\| Decorative visual gets a label — no information of its own, or duplicates an adjacent legend/list/caption/paragraph, or sits inside a link/button that already has a name | `aria-hidden="true"` / `alt=""`, no label; check one level up and to the side before keeping a label          |

\| Data table on a schematic/"illustrative"/"approximate" chart                                                                                                              | No table — that wording is the signal; reserve tables for charts whose rendered numbers are the actual values |

\| Interactive controls (drag/play/slider) wrapped as static                                                                                                                 | `interactive` prop                                                                                            |

\| One generic name reused across a loop of similar charts with different data                                                                                               | Distinct name per instance (or one wrapper only when they share one takeaway)                                 |

\| An exhaustive node-by-node walkthrough used as `summary`                                                                                                                  | Distil to a 1–2 sentence takeaway; a genuinely descriptive paragraph may stay, but add a short `name`         |

\| Hand-rolled `role="img"` hiding real per-item text (labels/values) a sighted reader sees                                                                                  | Convert to `VizFigure`; add `data` if exact values exist, recovering what the hack suppressed                 |

\| Missing `alt`, or `alt` cloning the nearest visible label, on a real `<img>` outside `VizFigure`                                                                          | Describe the actual image content; `alt=""` only when adjacent visible text says the same thing verbatim      |

\| Caption/legend placed inside `VizFigure` and silently hidden                                                                                                              | Move it to a sibling after `VizFigure` or `Figure`'s `caption`                                                |

\| Clickable `<div>` posing as a button inside an island                                                                                                                     | Real `<button>` with keyboard handling and visible focus                                                      |
