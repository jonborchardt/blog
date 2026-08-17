import { gzipSync } from "node:zlib";
import { expect, test, type Page } from "@playwright/test";

/** Collect JS responses (url, gzip-ish transfer size via content-length when present, body size). */
async function jsRequests(page: Page, path: string) {
  const seen: { url: string; bytes: number; gzip: number }[] = [];
  page.on("response", async (r) => {
    if (r.request().resourceType() !== "script") return;
    const body = await r.body().catch(() => Buffer.alloc(0));
    seen.push({ url: r.url(), bytes: body.length, gzip: gzipSync(body).length });
  });
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  return seen;
}

test("static pages ship zero JavaScript files", async ({ page }) => {
  for (const p of [
    "",
    "about/",
    "building-blocks-of-this-blog/",
    "series/",
    "series/building-always-shippable/",
    "does-not-exist/",
  ]) {
    const js = await jsRequests(page, p);
    expect(js, `${p} loaded ${js.map((j) => j.url).join(", ")}`).toEqual([]);
    expect(await page.locator("script[src]").count(), p).toBe(0);
  }
});

test("archive loads a small React bundle only", async ({ page }) => {
  const js = await jsRequests(page, "archive/");
  expect(js.length).toBeGreaterThan(0);
  // Astro splits react, react-dom, the client runtime, shadcn ui and the island: a handful of files.
  expect(js.length, js.map((j) => j.url).join(", ")).toBeLessThanOrEqual(8);
  const gz = js.reduce((n, j) => n + j.gzip, 0);
  expect(gz, `archive JS ${Math.round(gz / 1024)} KB gzipped`).toBeLessThan(120 * 1024);
});

test("interactive post loads only React chunks for its island", async ({ page }) => {
  const js = await jsRequests(page, "interactive-islands-in-mdx/");
  await page.getByTestId("island").scrollIntoViewIfNeeded(); // client:visible
  await expect.poll(() => js.length).toBeGreaterThan(0);
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
  expect(js.length).toBeLessThanOrEqual(8);
  for (const j of js) expect(j.url).toMatch(/\/blog\/_astro\/.*\.js$/);
});
