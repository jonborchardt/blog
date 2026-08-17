import { beforeAll, describe, expect, it, vi } from "vitest";
import { absoluteUrl, href } from "./url";

describe("href", () => {
  beforeAll(() => vi.stubEnv("BASE_URL", "/blog/"));

  it("prefixes the configured base", () => {
    expect(href("/archive/")).toBe("/blog/archive/");
    expect(href("archive/")).toBe("/blog/archive/");
    expect(href("/")).toBe("/blog/");
  });

  it("builds absolute URLs", () => {
    expect(absoluteUrl("/rss.xml", "https://jonborchardt.github.io")).toBe(
      "https://jonborchardt.github.io/blog/rss.xml",
    );
  });
});
