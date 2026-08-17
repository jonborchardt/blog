// @vitest-environment node
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { configPath, serializeConfig } from "./config-writer";
import { site } from "../config/site";
import { author } from "../config/author";
import { series } from "../config/series";
import { tags } from "../config/tags";

// Locks the template: serializing the current config must reproduce the committed file text.
describe("serializeConfig", () => {
  for (const [name, data] of [
    ["site", site],
    ["author", author],
    ["series", series],
    ["tags", tags],
  ] as const) {
    it(`round-trips src/config/${name}.ts byte-for-byte`, async () => {
      const committed = await readFile(configPath(name), "utf8");
      expect(await serializeConfig(name, data)).toBe(committed);
    });
  }

  it("rejects invalid data with a Zod message", async () => {
    await expect(serializeConfig("tags", { "Bad Id": { label: "x" } })).rejects.toThrow(
      /kebab-case/,
    );
    await expect(serializeConfig("site", { ...site, url: "not a url" })).rejects.toThrow();
  });
});
