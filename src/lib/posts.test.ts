// @vitest-environment node
import { describe, expect, it } from "vitest";
import { validatePosts } from "./posts";

const post = (id: string, data: Record<string, unknown> = {}) =>
  ({ id, data: { title: id, tags: [], draft: false, ...data } }) as never;

describe("validatePosts", () => {
  it("accepts distinct slugs and series orders", () => {
    expect(() =>
      validatePosts([
        post("a", { series: "worldlock", seriesOrder: 1 }),
        post("b", { series: "worldlock", seriesOrder: 2 }),
      ]),
    ).not.toThrow();
  });

  it("rejects duplicate slugs (explicit slug colliding with a directory id)", () => {
    expect(() => validatePosts([post("a"), post("b", { slug: "a" })])).toThrow(/duplicate slug/);
  });

  it("rejects reserved slugs", () => {
    expect(() => validatePosts([post("all-posts")])).toThrow(/reserved/);
  });

  it("rejects duplicate seriesOrder within a series", () => {
    expect(() =>
      validatePosts([
        post("a", { series: "worldlock", seriesOrder: 1 }),
        post("b", { series: "worldlock", seriesOrder: 1 }),
      ]),
    ).toThrow(/duplicate seriesOrder/);
  });

  it("rejects heroes that are not 2.5:1", () => {
    const hero = (width: number, height: number) => ({ src: { width, height }, alt: "x" });
    expect(() => validatePosts([post("a", { hero: hero(1200, 630) })])).toThrow(/2\.5:1/);
    expect(() => validatePosts([post("a", { hero: hero(1500, 600) })])).not.toThrow();
  });

  it("reports every problem at once", () => {
    expect(() => validatePosts([post("resume"), post("admin")])).toThrow(/resume[\s\S]*admin/);
  });
});
