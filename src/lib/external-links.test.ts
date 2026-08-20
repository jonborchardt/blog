import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { checkExternalLinks, classifyStatus } from "./external-links";

const tmpCache = async () => join(await mkdtemp(join(tmpdir(), "extlinks-")), "cache.json");
const res = (status: number) => ({ status }) as Response;

describe("classifyStatus", () => {
  it("fails only on definitively-gone statuses", () => {
    expect(classifyStatus(200)).toBe("ok");
    expect(classifyStatus(301)).toBe("ok");
    expect(classifyStatus(404)).toBe("dead");
    expect(classifyStatus(410)).toBe("dead");
    expect(classifyStatus(403)).toBe("warn");
    expect(classifyStatus(429)).toBe("warn");
    expect(classifyStatus(500)).toBe("warn");
  });
});

describe("checkExternalLinks", () => {
  it("reports dead links, warns on errors, caches successes", async () => {
    const cachePath = await tmpCache();
    const fetchFn = vi.fn(async (url: unknown) => {
      if (String(url).includes("gone")) return res(404);
      if (String(url).includes("flaky")) throw new Error("socket hang up");
      return res(200);
    });
    const report = await checkExternalLinks(
      ["https://a.example/ok", "https://a.example/gone", "https://a.example/flaky"],
      { fetchFn: fetchFn as typeof fetch, cachePath },
    );
    expect(report.dead).toEqual([{ url: "https://a.example/gone", detail: "HTTP 404" }]);
    expect(report.warnings).toEqual([{ url: "https://a.example/flaky", detail: "socket hang up" }]);
    const cache = JSON.parse(await readFile(cachePath, "utf8"));
    expect(Object.keys(cache)).toEqual(["https://a.example/ok"]);
  });

  it("skips freshly-cached urls and rechecks expired ones", async () => {
    const cachePath = await tmpCache();
    const now = Date.now();
    const week = 7 * 24 * 3_600_000;
    await writeFile(
      cachePath,
      JSON.stringify({
        "https://a.example/fresh": now - 1000,
        "https://a.example/stale": now - week - 1000,
      }),
    );
    const fetchFn = vi.fn(async (_url: unknown) => res(200));
    await checkExternalLinks(["https://a.example/fresh", "https://a.example/stale"], {
      fetchFn: fetchFn as typeof fetch,
      cachePath,
      now,
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(String(fetchFn.mock.calls[0]![0])).toBe("https://a.example/stale");
  });
});
