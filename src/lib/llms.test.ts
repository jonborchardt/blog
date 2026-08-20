// @vitest-environment node
import { describe, expect, it } from "vitest";
import { llmsTxt, postMarkdown } from "./llms";

const post = (over: Record<string, unknown> = {}) =>
  ({
    id: "my-post",
    body: "import X from './x.tsx';\n\nHello **world**.",
    data: {
      title: "My Post",
      description: "A post about things that are between 40 and 160 characters long.",
      publishedAt: new Date("2026-01-05"),
      tags: [],
      draft: false,
      ...over,
    },
  }) as never;

describe("postMarkdown", () => {
  it("prefixes title, description, date and canonical URL, then the raw body", () => {
    const md = postMarkdown(post());
    expect(md).toContain("# My Post");
    expect(md).toContain("> A post about things");
    expect(md).toContain("Published 2026-01-05");
    expect(md).toContain("https://jonborchardt.github.io/my-post/");
    expect(md).toContain("Hello **world**.");
  });
});

describe("llmsTxt", () => {
  it("lists every post as a link to its index.md with its description", () => {
    const txt = llmsTxt([post()]);
    expect(txt).toMatch(/^# Always Shippable/);
    expect(txt).toContain("(https://jonborchardt.github.io/my-post/index.md): A post about things");
  });
});
