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
