import { expect, test } from "@playwright/test";

/**
 * Preserved 2001-2018 demo pages under /museum, plus the lobby that links to them. This is a
 * smoke test, not an accessibility audit: 2013-2015 markup is out of scope for axe (see
 * smoke.spec.ts for that), and some pages emit console noise by design (fatal-encounters' brush
 * NaN errors are documented-accepted). What must hold is that nothing 404s and each page's main
 * content actually renders — chart pages build an `<svg>` client-side (sometimes only after an
 * async data fetch), the two galleries are static `<img>` screenshots.
 */
const pages: { path: string; selector: string }[] = [
  { path: "museum/index.html", selector: "ul li a" },
  { path: "museum/d3demo/index.html", selector: "svg" },
  { path: "museum/d3demo/industryTracker.html", selector: "svg" },
  { path: "museum/d3demo/programExample.html", selector: "svg" },
  { path: "museum/d3demo/explorerExample.html", selector: "svg" },
  { path: "museum/d3demo/webSpike.html", selector: "svg" },
  { path: "museum/maphack/index.html", selector: "svg" },
  { path: "museum/industry-rankings/index.html", selector: "svg" },
  { path: "museum/sell-side/index.html", selector: "svg" },
  { path: "museum/adsplore/index.html", selector: "img" },
  { path: "museum/person-reporting/index.html", selector: "img" },
  { path: "museum/fatal-encounters/index.html", selector: "svg" },
  { path: "museum/giving-charts/index.html", selector: "svg" },
];

test("every museum page loads clean and renders its content", async ({ page }) => {
  // 13 pages, some with several MB of client-fetched data (industry-rankings, sell-side).
  test.setTimeout(120_000);
  for (const { path, selector } of pages) {
    const failed: string[] = [];
    page.removeAllListeners("response");
    page.on("response", (r) => {
      if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(path);
    await expect(page.locator(selector).first(), path).toBeVisible({ timeout: 20_000 });
    expect(failed, path).toEqual([]);
  }
});

test("lobby lists all twelve demo entries with working links", async ({ page }) => {
  await page.goto("museum/index.html");
  const links = page.locator("ul li a");
  await expect(links).toHaveCount(12);
  const hrefs = await links.evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  for (const href of hrefs) {
    const res = await page.request.get(new URL(href as string, page.url()).toString());
    expect(res.ok(), href as string).toBe(true);
  }
});
