# Shared MDX primitives

Static `.astro` components for use inside posts. All use design tokens, work in both themes, are responsive and axe-clean, and ship no framework JavaScript (only `Tabs`, `CodeBlock`, `MuseumEmbed` and `Gallery` include a tiny inline script). Import them at the top of a post's `index.mdx`:

```mdx
import Callout from "@/components/blog/Callout.astro";
```

| Primitive      | Props                                                                                                      | Use it for                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `Callout`      | `variant?: note\|tip\|warning\|danger\|info`, `title?`                                                     | short highlighted notes the reader must not miss                                                                    |
| `Figure`       | `caption?`, `width?: prose\|wide\|full`, `zoom?`                                                           | an image/SVG with a caption; wide diagrams that need breakout                                                       |
| `VizFigure`    | `name`, `summary?`, `interactive?`, `data?: {caption,columns,rows}`                                        | any meaningful chart/diagram/demo: gives it an accessible name, summary and (optionally) a screen-reader data table |
| `Quote`        | `cite?`, `href?`                                                                                           | pull quotes with attribution                                                                                        |
| `Aside`        | —                                                                                                          | short side notes (margin note on wide screens)                                                                      |
| `Comparison`   | `labels: string[]` (2–3), slots `a`, `b`, `c`                                                              | before/after, pros/cons, option comparisons                                                                         |
| `Steps`        | — (wraps a Markdown `1.` list)                                                                             | numbered procedures                                                                                                 |
| `Details`      | `summary`, `open?`                                                                                         | optional depth: long configs, digressions, answers                                                                  |
| `ListGrid`     | — (wraps a Markdown `-` list)                                                                              | inventory-style lists of short items shown as a grid of boxes instead of a tall bullet column                       |
| `Tabs` + `Tab` | `Tab.label`                                                                                                | alternatives of the same thing (npm/pnpm, JS/TS)                                                                    |
| `Video`        | `src`+`poster?` or `youtube`, `title` (required), `caption?`                                               | local video files or YouTube embeds                                                                                 |
| `MuseumEmbed`  | `demo`, `title`, `label`, `teaser`+`teaserAlt`, `description?`, `height?`, `nativeWidth?`, `teaserHeight?` | click-to-load embed of a live preserved `/museum/` demo: teaser strip, load button, full-size link                  |
| `Gallery`      | `images: {img, alt}[]`, `description?`, `fullHref?`                                                        | a set of screenshots stepped through one at a time with prev/next arrows                                            |
| `CodeBlock`    | `title?`                                                                                                   | a fenced block that needs a filename header or a copy button                                                        |
| `TableWrapper` | — (applied automatically to every Markdown table by `[slug].astro`)                                        | never imported directly                                                                                             |

## Examples

Every example below compiles as written.

### Callout

```mdx
<Callout variant="tip" title="Shortcut">
  Run `npm run validate` before `npm run build`; it is faster and catches most problems.
</Callout>
```

### Figure (with an image)

```mdx
import { Image } from "astro:assets";
import Figure from "@/components/blog/Figure.astro";
import shot from "./shot.png";

<Figure caption="The build pipeline, end to end." width="wide">
  <Image src={shot} alt="Flow from MDX source to static HTML" />
</Figure>
```

Plain Markdown images (`![alt](./file.png)`) also work and get responsive `srcset` automatically; use `Figure` when you need a caption or a wider measure.

`Figure` also takes `zoom` (default `false`): wraps the content in a button that opens a full-size `<dialog>` lightbox. `zoom` works on post pages — the click handler is an inline script in `src/pages/[slug].astro`; a Figure with `zoom` on any other page renders a button that does nothing. Use it ONLY when the direct child is a plain `<img>` (sweep comparisons, screenshots) — never around `VizFigure` (its ids would duplicate) or interactive islands.

```mdx
<Figure caption="Original versus upscale." zoom>
  <img src={sweep.src} width="1920" height="1140" alt="Sweep comparison…" />
</Figure>
```

### VizFigure (accessible chart / diagram / demo)

```mdx
import VizFigure from "@/components/blog/VizFigure.astro";
import chart from "./downloads.svg";

<Figure caption="Downloads by year">
  <VizFigure
    name="Downloads by year"
    summary="Downloads roughly double each year, from 1.2k in 2023 to 9.8k in 2026."
    data={{ caption: "Downloads by year", columns: ["Year", "Downloads"], rows: [[2023, 1200], [2026, 9800]] }}
  >
    <img src={chart.src} width="800" height="400" alt="" />
  </VizFigure>
</Figure>

<VizFigure name="Spring simulation" summary="Drag the mass to see damped oscillation." interactive>
  <SpringDemo client:visible />
</VizFigure>
```

`name` = what it shows; `summary` = the takeaway a sighted reader gets at a glance (keep units and caveats); `data` when exact values matter; `interactive` when the children contain controls (they stay in the accessibility tree as a `group` instead of being hidden behind an `img`). Purely decorative visuals do not use it — mark them `aria-hidden="true"` instead. Wrap in `Figure` for a visible caption or wide measure.

### Quote

```mdx
<Quote cite="Fred Brooks" href="https://en.wikipedia.org/wiki/The_Mythical_Man-Month">
  Plan to throw one away; you will, anyhow.
</Quote>
```

### Aside

```mdx
<Aside>Astro calls this "partial hydration"; the islands metaphor is from Jason Miller.</Aside>
```

### Comparison

```mdx
<Comparison labels={["Static", "Island"]}>
  <Fragment slot="a">

    - zero JavaScript
    - renders once at build

  </Fragment>
  <Fragment slot="b">

    - ships React + component
    - responds to input

  </Fragment>
</Comparison>
```

### Steps

```mdx
<Steps>

1. Scaffold the post.
2. Write it.
3. Run `npm run build`.

</Steps>
```

### Details

```mdx
<Details summary="Full configuration">

  Anything, including code fences.

</Details>
```

### ListGrid

```mdx
<ListGrid>

- explicit contracts
- typed schemas
- validation

</ListGrid>
```

### Tabs

````mdx
<Tabs>
  <Tab label="npm">

    ```sh
    npm install
    ```

  </Tab>
  <Tab label="pnpm">

    ```sh
    pnpm install
    ```

  </Tab>
</Tabs>
````

Keyboard: arrow keys move between tabs, Home/End jump. Without JavaScript the panels render stacked.

### Video

```mdx
<Video youtube="dQw4w9WgXcQ" title="Talk: Always Shippable" caption="Recorded 2026." />
```

### MuseumEmbed

```mdx
import MuseumEmbed from "@/components/blog/MuseumEmbed.astro";
import teaser from "./teaser-my-demo.png";

<MuseumEmbed
  demo="/museum/my-demo/index.html"
  title="The preserved 2014 demo: what interacting with it does"
  label="Load the real 2014 demo (about 3 MB of data)"
  teaser={teaser}
  teaserAlt="What the teaser strip shows"
  description="One short sentence of context."
  height={2720}
/>
```

Closed it shows the teaser (a flat strip with no clickable-looking widgets, `teaserHeight` px tall — default 170, raise toward ~300 when the teaser must carry the demo's content on its own) above the load button; open it renders the demo at its native desktop width (`nativeWidth`, default 1280) and scales it down to fit the column. `height` is the demo page's height at that width (default 1500). The caption always ends with an "Open it full size ↗" link, which is the escape hatch on small screens where the scaled demo is too tiny to read. Use it only for live demos — for a set of static screenshots use `Gallery`.

### Gallery

```mdx
import Gallery from "@/components/blog/Gallery.astro";
import shot1 from "./shot1.png";
import shot2 from "./shot2.png";

<Gallery
  images={[
    { img: shot1, alt: "What the first screenshot shows" },
    { img: shot2, alt: "What the second screenshot shows" },
  ]}
  description="One short sentence of context."
  fullHref="/museum/my-demo/index.html"
/>
```

One image shows at a time (the first — put the one that best tells the story first; it loads eagerly, the rest lazy-load), with prev/next arrows and an "n / m" counter below. The image sits in a fixed 3:2 frame at the prose measure, letterboxed on a muted background with `object-fit: contain`, so switching never shifts the layout. `fullHref` renders an "Open it full size ↗" link after the caption — the escape hatch for reading a screenshot's fine print.

### CodeBlock

````mdx
<CodeBlock title="astro.config.mjs">

```js
export default defineConfig({ base: "/blog" });
```

</CodeBlock>
````

## Diagrams and math

Both render at build time to static SVG/HTML — no client JavaScript.

Diagrams are hand-drawn pictorial SVG files colocated with the post, imported as inline components and wrapped in `VizFigure` (never a `mermaid` fence — the build does not render them; design language and verification live in skill `create-visual`):

```mdx
import VizFigure from "@/components/blog/VizFigure.astro";
import PipelineViz from "./pipeline-viz.svg";

<VizFigure
  name="Short accessible title"
  summary="One or two sentences describing the structure the diagram shows."
>
  <PipelineViz class="mx-auto h-auto w-full max-w-2xl" aria-hidden="true" />
</VizFigure>
```

Always precede or follow a diagram with a sentence that says what it shows. The SVG uses `currentColor` plus the theme.ts hex twins, so the same file follows light and dark natively.

```mdx
Inline math: $E = mc^2$. Display math:

$$
\int_0^1 x^2 \, dx = \tfrac{1}{3}
$$
```

Long formulas scroll horizontally on narrow screens. Diagrams and figures must not: they scale to fit (`viewBox` + `h-auto w-full max-w-2xl`, or `<img>` with width/height); never wrap one in `overflow-x-auto` or force a `min-w-*`.

## Rules

- **Images**: put them next to the post and import relatively (`./file.png`) or use Markdown image syntax. Every image needs meaningful `alt`. Never use `<img>` for raster files; SVG may use `<img>` with `width`/`height`/`alt`.
- **Post-local React**: `./components/Foo.tsx`, rendered with `client:visible` (or `client:load` only if it must respond immediately). Add an RTL unit test next to it. Promote to `src/components/blog/` only when 2+ posts use it.
- **No per-post styling**: no `<style>` blocks or ad-hoc colours in posts. If a primitive is missing, add it here (static `.astro`) with a JSDoc block and a row in this table.
- **Headings**: start body headings at `##`; `Comparison`/`Tabs` labels are not headings.
- **When to use which**: Callout for "don't miss this"; Aside for "interesting but skippable"; Details for "long and optional"; Tabs only for equivalent alternatives; Comparison for side-by-side judgement; Steps for procedures the reader will follow.
