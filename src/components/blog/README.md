# Shared MDX primitives

Static `.astro` components for use inside posts. All use design tokens, work in both themes, are responsive and axe-clean, and ship no framework JavaScript (only `Tabs` and `CodeBlock` include a tiny inline script). Import them at the top of a post's `index.mdx`:

```mdx
import Callout from "@/components/blog/Callout.astro";
```

| Primitive      | Props                                                               | Use it for                                                    |
| -------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| `Callout`      | `variant?: note\|tip\|warning\|danger\|info`, `title?`              | short highlighted notes the reader must not miss              |
| `Figure`       | `caption?`, `width?: prose\|wide\|full`                             | an image/SVG with a caption; wide diagrams that need breakout |
| `Quote`        | `cite?`, `href?`                                                    | pull quotes with attribution                                  |
| `Aside`        | —                                                                   | short side notes (margin note on wide screens)                |
| `Comparison`   | `labels: string[]` (2–3), slots `a`, `b`, `c`                       | before/after, pros/cons, option comparisons                   |
| `Steps`        | — (wraps a Markdown `1.` list)                                      | numbered procedures                                           |
| `Details`      | `summary`, `open?`                                                  | optional depth: long configs, digressions, answers            |
| `Tabs` + `Tab` | `Tab.label`                                                         | alternatives of the same thing (npm/pnpm, JS/TS)              |
| `Video`        | `src`+`poster?` or `youtube`, `title` (required), `caption?`        | local video files or YouTube embeds                           |
| `CodeBlock`    | `title?`                                                            | a fenced block that needs a filename header or a copy button  |
| `TableWrapper` | — (applied automatically to every Markdown table by `[slug].astro`) | never imported directly                                       |

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

### CodeBlock

````mdx
<CodeBlock title="astro.config.mjs">

```js
export default defineConfig({ base: "/blog" });
```

</CodeBlock>
````

## Rules

- **Images**: put them next to the post and import relatively (`./file.png`) or use Markdown image syntax. Every image needs meaningful `alt`. Never use `<img>` for raster files; SVG may use `<img>` with `width`/`height`/`alt`.
- **Post-local React**: `./components/Foo.tsx`, rendered with `client:visible` (or `client:load` only if it must respond immediately). Add an RTL unit test next to it. Promote to `src/components/blog/` only when 2+ posts use it.
- **No per-post styling**: no `<style>` blocks or ad-hoc colours in posts. If a primitive is missing, add it here (static `.astro`) with a JSDoc block and a row in this table.
- **Headings**: start body headings at `##`; `Comparison`/`Tabs` labels are not headings.
- **When to use which**: Callout for "don't miss this"; Aside for "interesting but skippable"; Details for "long and optional"; Tabs only for equivalent alternatives; Comparison for side-by-side judgement; Steps for procedures the reader will follow.
