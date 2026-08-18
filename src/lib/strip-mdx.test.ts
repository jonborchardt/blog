// @vitest-environment node
import { describe, expect, it } from "vitest";
import { stripMdx } from "./strip-mdx";

const SRC = `---
title: X
tags: [meta]
---

import Callout from "@/components/blog/Callout.astro";
import { Image } from "astro:assets";

# Heading one

Some **bold** text with a [link](/all-posts/) and \`code\`.

<Callout variant="tip" title="Tip">
  Inside the callout with {expression}.
</Callout>

\`\`\`ts
export const x = 1;
\`\`\`

![Alt text here](./img.png)

| Col | Other |
| --- | ----- |
| a   | b     |

Inline $E = mc^2$ math.

<Counter client:visible />
`;

describe("stripMdx", () => {
  const out = stripMdx(SRC);
  it("removes frontmatter, imports, tags, expressions and fence markers", () => {
    expect(out).not.toMatch(/title: X|import |<Callout|client:visible|\{expression\}|```/);
  });
  it("keeps prose, code text, alt text, link text, table cells and math text", () => {
    for (const s of [
      "Heading one",
      "bold text with a link and code",
      "Inside the callout with",
      "export const x = 1;",
      "Alt text here",
      "Col Other",
      "E = mc^2",
    ]) {
      expect(out).toContain(s);
    }
  });
  it("collapses whitespace and caps length", () => {
    expect(out).not.toMatch(/\s{2}/);
    expect(stripMdx("word ".repeat(10_000)).length).toBeLessThanOrEqual(20_000);
  });
});
