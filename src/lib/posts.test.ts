// @vitest-environment node
import { describe, expect, it } from "vitest";
import { getRelatedPost, validatePosts } from "./posts";

const post = (id: string, data: Record<string, unknown> = {}) =>
  ({
    id,
    data: { title: id, tags: [], draft: false, publishedAt: new Date("2026-01-01"), ...data },
  }) as never;

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
    expect(() => validatePosts([post("about"), post("admin")])).toThrow(/about[\s\S]*admin/);
  });
});

describe("getRelatedPost", () => {
  const me = post("me", { tags: ["a", "b"], series: "worldlock" });

  it("picks the post with the most shared tags", () => {
    const best = post("best", { tags: ["a", "b"] });
    const posts = [me, post("weak", { tags: ["a"] }), best, post("none")];
    expect(getRelatedPost(me, posts)).toBe(best);
  });

  it("never recommends the post itself or a post from the same series", () => {
    const sibling = post("sibling", { tags: ["a", "b"], series: "worldlock" });
    const other = post("other", { tags: ["a"] });
    expect(getRelatedPost(me, [me, sibling, other])).toBe(other);
    expect(getRelatedPost(me, [me, sibling])).toBeUndefined();
  });

  it("falls back to the newest eligible post when nothing shares a tag", () => {
    const older = post("older", { publishedAt: new Date("2025-01-01") });
    const newer = post("newer", { publishedAt: new Date("2026-02-01") });
    expect(getRelatedPost(me, [me, older, newer])).toBe(newer);
  });

  it("breaks full ties by slug for deterministic builds", () => {
    const posts = [me, post("zzz", { tags: ["a"] }), post("aaa", { tags: ["a"] })];
    expect(getRelatedPost(me, posts)).toBe(posts[2]);
  });
});
