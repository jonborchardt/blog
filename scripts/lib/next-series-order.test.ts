// @vitest-environment node
import { describe, expect, it } from "vitest";
import { nextSeriesOrder, readFrontmatter } from "./next-series-order.mjs";

describe("nextSeriesOrder", () => {
  const posts = [
    { series: "s", seriesOrder: 1 },
    { series: "s", seriesOrder: 4 },
    { series: "s", seriesOrder: 9, draft: true },
    { series: "t", seriesOrder: 7 },
    { seriesOrder: undefined },
  ];
  it("is max(published) + 1 within the series, ignoring drafts", () => {
    expect(nextSeriesOrder(posts, "s")).toBe(5);
    expect(nextSeriesOrder(posts, "t")).toBe(8);
  });
  it("starts at 1 for an empty series", () => {
    expect(nextSeriesOrder(posts, "new")).toBe(1);
  });
});

describe("readFrontmatter", () => {
  it("reads the flat keys the scaffold needs", () => {
    expect(
      readFrontmatter(
        `---\ntitle: X\nslug: custom\nseries: s\nseriesOrder: 3\ndraft: true\n---\nbody`,
      ),
    ).toEqual({ slug: "custom", series: "s", seriesOrder: 3, draft: true });
    expect(readFrontmatter("no frontmatter")).toEqual({
      slug: undefined,
      series: undefined,
      seriesOrder: undefined,
      draft: false,
    });
  });
});
