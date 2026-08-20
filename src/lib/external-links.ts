/**
 * External-link checking for the post-build integration. Networks flake, so the policy is
 * deliberately conservative: only HTTP 404/410 fail the build; every other failure (timeout, 5xx,
 * 403 bot block, 429) is a warning. Reachable URLs are cached for 7 days in node_modules/.cache
 * so local rebuilds stay fast. Set SKIP_EXTERNAL_LINKS=1 to skip the pass (offline work).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export const DEFAULT_CACHE_PATH = join("node_modules", ".cache", "external-links.json");
const TTL_MS = 7 * 24 * 3_600_000;
const TIMEOUT_MS = 10_000;
const CONCURRENCY = 8;

export type Verdict = "ok" | "dead" | "warn";

/** Only a definitive "gone" fails the build; ambiguous/transient statuses warn (CI flakiness). */
export function classifyStatus(status: number): Verdict {
  if (status === 404 || status === 410) return "dead";
  return status >= 200 && status < 400 ? "ok" : "warn";
}

export interface ExternalLinkReport {
  dead: { url: string; detail: string }[];
  warnings: { url: string; detail: string }[];
}

interface Options {
  fetchFn?: typeof fetch;
  cachePath?: string;
  now?: number;
}

export async function checkExternalLinks(
  urls: string[],
  { fetchFn = fetch, cachePath = DEFAULT_CACHE_PATH, now = Date.now() }: Options = {},
): Promise<ExternalLinkReport> {
  let cache: Record<string, number> = {};
  try {
    cache = JSON.parse(await readFile(cachePath, "utf8")) as Record<string, number>;
  } catch {
    // no cache yet
  }
  const report: ExternalLinkReport = { dead: [], warnings: [] };
  const queue = urls.filter((u) => !(cache[u] && now - cache[u]! < TTL_MS));
  const check = async (url: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS).unref();
    try {
      const res = await fetchFn(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "always-shippable-link-check (+https://jonborchardt.github.io/blog/)",
        },
      });
      await res.body?.cancel();
      const verdict = classifyStatus(res.status);
      if (verdict === "ok") cache[url] = now;
      else
        (verdict === "dead" ? report.dead : report.warnings).push({
          url,
          detail: `HTTP ${res.status}`,
        });
    } catch (e) {
      report.warnings.push({ url, detail: e instanceof Error ? e.message : String(e) });
    } finally {
      clearTimeout(timer);
    }
  };
  // ponytail: fixed-size worker pool; fine for a blog's worth of links
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (i < queue.length) await check(queue[i++]!);
    }),
  );
  await mkdir(dirname(cachePath), { recursive: true });
  await writeFile(cachePath, JSON.stringify(cache));
  // ponytail: a live fetch this late in astro's build lifecycle races a Windows-only libuv
  // handle-close bug (network calls only, cache-hit builds are unaffected) — a beat lets the
  // undici connection teardown finish before the process moves on. Drop this if a future Node
  // fixes the race; only fired when the queue actually made a network request.
  if (queue.length) await new Promise((r) => setTimeout(r, 200));
  return report;
}
