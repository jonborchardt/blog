import { describe, expect, it } from "vitest";
import { effectiveUpdatedAt, formatDate, isoDate } from "./dates";

describe("dates", () => {
  const d = new Date("2026-08-17");
  it("formats in UTC regardless of machine timezone", () => {
    expect(formatDate(d)).toBe("Aug 17, 2026");
    expect(formatDate(d, "long")).toBe("August 17, 2026");
  });
  it("emits ISO calendar dates", () => {
    expect(isoDate(d)).toBe("2026-08-17");
  });
});

describe("effectiveUpdatedAt", () => {
  const pub = new Date("2026-01-01");
  it("frontmatter always wins, even a small bump", () => {
    const fm = new Date("2026-01-02");
    expect(effectiveUpdatedAt(pub, fm, new Date("2026-06-01"))).toBe(fm);
  });
  it("git date shows only when at least 7 days after publish", () => {
    expect(effectiveUpdatedAt(pub, undefined, new Date("2026-01-05"))).toBeUndefined();
    const later = new Date("2026-01-09");
    expect(effectiveUpdatedAt(pub, undefined, later)).toBe(later);
  });
  it("no dates → undefined", () => {
    expect(effectiveUpdatedAt(pub, undefined, undefined)).toBeUndefined();
  });
});
