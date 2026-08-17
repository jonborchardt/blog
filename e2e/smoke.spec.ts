import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["", "archive/", "series/", "series/example-series/", "about/", "example-post/"];

for (const path of PAGES) {
  test(`/${path} renders and has no axe violations`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.ok()).toBe(true);
    await expect(page.locator("h1")).toBeVisible();
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(violations).toEqual([]);
  });
}

test("internal links and assets use the /blog/ base", async ({ page }) => {
  await page.goto("");
  const hrefs = await page
    .locator("a[href^='/']")
    .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const h of hrefs) expect(h).toMatch(/^\/blog\//);
});

test("MDX post hydrates its React island", async ({ page }) => {
  await page.goto("example-post/");
  const button = page.getByTestId("island").getByRole("button");
  await expect(button).toHaveText(/Clicked 0 times/);
  await button.click();
  await expect(button).toHaveText(/Clicked 1 time/);
  await expect(page.locator("img[alt='A grey circle labelled SVG']")).toBeVisible();
});

test("dev-only admin route is not in the production build", async ({ page }) => {
  const res = await page.goto("admin/");
  expect(res?.status()).toBe(404);
});

test("rss, sitemap and robots exist under the base", async ({ request }) => {
  for (const p of ["rss.xml", "sitemap-index.xml", "robots.txt"]) {
    const res = await request.get(p);
    expect(res.ok(), p).toBe(true);
  }
});
