import { expect, test } from "@playwright/test";

/**
 * Preserved 2001-2018 demo pages under /museum, plus the lobby that links to them. This is a
 * smoke test, not an accessibility audit: 2013-2015 markup is out of scope for axe (see
 * smoke.spec.ts for that), and some pages emit console noise by design (fatal-encounters' brush
 * NaN errors are documented-accepted). What must hold is that nothing 404s and each page's main
 * content actually renders — chart pages build an `<svg>` client-side (sometimes only after an
 * async data fetch), the two galleries are static `<img>` screenshots.
 */
const pages = [
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
  const failed: string[] = [];
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });
  for (const { path, selector } of pages) {
    failed.length = 0;
    await page.goto(path);
    await expect(page.locator(selector).first(), path).toBeVisible({ timeout: 20_000 });
    expect(failed, path).toEqual([]);
  }
});

test("fatal-encounters update button toggles the 2015-2021 rows live", async ({ page }) => {
  // ~12 MB of newer data plus a full dc.js re-render of every chart, twice.
  test.setTimeout(120_000);
  await page.goto("museum/fatal-encounters/index.html");
  await page.getByRole("button", { name: "Load the 2015-2021 update" }).click();
  await expect(page.getByText(/Updated: 13,499 encounters added/)).toBeVisible({
    timeout: 60_000,
  });
  // the month timeline's x axis was rebuilt to reach the new extent
  // (exact: a bar tooltip <title> also starts with the same date text)
  await expect(page.getByText("12/01/2021", { exact: true })).toBeVisible();
  // a second click removes the rows and restores the 2014 snapshot
  await page.getByRole("button", { name: "Remove the 2015-2021 update" }).click();
  await expect(page.getByText(/Back to the original 2014 snapshot/)).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByText("11/01/2014", { exact: true })).toBeVisible();
});

test("lobby links match the shipped demo pages exactly", async ({ page }) => {
  await page.goto("museum/index.html");
  const links = page.locator("ul li a");
  const hrefs = await links.evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
  const resolved = hrefs.map((h) => `museum/${h.replace("./", "")}`).sort();
  const shipped = pages
    .filter((p) => p.path !== "museum/index.html")
    .map((p) => p.path)
    .sort();
  expect(resolved).toEqual(shipped);
});
