import { describe, expect, it } from "vitest";
import { formatDate, isoDate } from "./dates";

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
