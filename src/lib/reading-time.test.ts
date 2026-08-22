import { describe, expect, it } from "vitest";
import { readingTime } from "./reading-time";

describe("readingTime", () => {
  it("is at least one minute", () => {
    expect(readingTime("")).toBe(1);
    expect(readingTime("a few words")).toBe(1);
  });
  it("rounds words / 230", () => {
    expect(readingTime("word ".repeat(460))).toBe(2);
    expect(readingTime("word ".repeat(1150))).toBe(5);
  });
});

describe("readingTime ignores collapsed Details", () => {
  it("does not count words inside <Details> blocks", () => {
    const body = `intro ${"word ".repeat(460)}<Details summary="x">\n${"hidden ".repeat(5000)}\n</Details>\n${"word ".repeat(460)}`;
    expect(readingTime(body)).toBe(4);
  });
});
