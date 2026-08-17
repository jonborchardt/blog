// @vitest-environment node
import { describe, expect, it } from "vitest";
import { search, tokenize, type SearchDoc } from "./search";

const doc = (o: Partial<SearchDoc> & { slug: string; title: string }): SearchDoc => ({
  url: `/blog/${o.slug}/`,
  description: "A description that is long enough to be a description.",
  publishedAt: "2026-01-01",
  tags: [],
  readingTime: 1,
  headings: [],
  body: "",
  ...o,
});

const docs = [
  doc({
    slug: "a",
    title: "Astro islands",
    publishedAt: "2026-08-18",
    tags: [{ id: "meta", label: "Meta" }],
    series: { id: "s", title: "Building", part: 2, total: 2 },
    body: "Hydration happens only for the island. Everything else is static HTML.",
  }),
  doc({
    slug: "b",
    title: "Building blocks",
    publishedAt: "2026-08-17",
    tags: [
      { id: "meta", label: "Meta" },
      { id: "engineering", label: "Engineering" },
    ],
    series: { id: "s", title: "Building", part: 1, total: 2 },
    headings: ["Diagrams and math"],
    body: "Callouts and figures. Mermaid renders at build time.",
  }),
  doc({ slug: "c", title: "Zebra crossing", publishedAt: "2025-01-01", body: "unrelated words" }),
];

describe("tokenize", () => {
  it("lowercases, splits on punctuation, drops single characters", () => {
    expect(tokenize("Hello, World! a b-c")).toEqual(["hello", "world"]);
  });
});

describe("search", () => {
  it("returns everything newest first with no query", () => {
    expect(search(docs, "").map((r) => r.doc.slug)).toEqual(["a", "b", "c"]);
  });
  it("supports oldest and title sorts", () => {
    expect(search(docs, "", { sort: "oldest" }).map((r) => r.doc.slug)).toEqual(["c", "b", "a"]);
    expect(search(docs, "", { sort: "title" }).map((r) => r.doc.slug)).toEqual(["a", "b", "c"]);
  });
  it("matches by prefix and weights title above body", () => {
    const r = search(docs, "build");
    expect(r.map((x) => x.doc.slug)).toEqual(["b", "a"]); // title+series beats series+body
    expect(r[0]!.score).toBeGreaterThan(r[1]!.score);
  });
  it("finds body-only text and produces a snippet around the hit", () => {
    const r = search(docs, "mermaid");
    expect(r.map((x) => x.doc.slug)).toEqual(["b"]);
    expect(r[0]!.snippet).toContain("Mermaid renders");
  });
  it("ANDs query tokens", () => {
    expect(search(docs, "island static").map((x) => x.doc.slug)).toEqual(["a"]);
    expect(search(docs, "island zebra")).toEqual([]);
  });
  it("matches headings and tags", () => {
    expect(search(docs, "diagrams").map((x) => x.doc.slug)).toEqual(["b"]);
    expect(search(docs, "engineering").map((x) => x.doc.slug)).toEqual(["b"]);
  });
  it("filters by tags (all required) and series", () => {
    expect(search(docs, "", { tags: ["meta"] }).map((x) => x.doc.slug)).toEqual(["a", "b"]);
    expect(search(docs, "", { tags: ["meta", "engineering"] }).map((x) => x.doc.slug)).toEqual([
      "b",
    ]);
    expect(search(docs, "", { series: "s" }).map((x) => x.doc.slug)).toEqual(["a", "b"]);
    expect(search(docs, "", { series: "nope" })).toEqual([]);
  });
  it("works on metadata-only docs (before the full index loads)", () => {
    const meta = docs.map(({ body: _b, headings: _h, ...m }) => m);
    expect(search(meta, "astro").map((x) => x.doc.slug)).toEqual(["a"]);
    expect(search(meta, "mermaid")).toEqual([]);
  });
});
