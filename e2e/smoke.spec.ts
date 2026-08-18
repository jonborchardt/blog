import { expect, test, type APIRequestContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Every URL the production sitemap lists. */
async function sitemapUrls(request: APIRequestContext): Promise<string[]> {
  const xml = await (await request.get("sitemap-0.xml")).text();
  // Sitemap URLs are absolute production URLs; make them relative to the preview baseURL.
  return [...xml.matchAll(/<loc>[^<]*?\/blog\/([^<]*)<\/loc>/g)].map((m) => m[1] as string);
}

test("every sitemap page renders and has no axe violations", async ({ page, request }) => {
  const urls = await sitemapUrls(request);
  expect(urls.length).toBeGreaterThan(0);
  for (const url of urls) {
    const res = await page.goto(url);
    expect(res?.ok(), url).toBe(true);
    await expect(page.locator("h1"), url).toBeVisible();
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      // Third-party embeds (YouTube) own their iframe DOM; only our markup is under test.
      .exclude("iframe")
      .analyze();
    expect(violations, url).toEqual([]);
  }
});

test("dates render as UTC calendar dates", async ({ page }) => {
  await page.goto("");
  await expect(page.locator("time").first()).toHaveText("Aug 18, 2026");
  await page.goto("building-blocks-of-this-blog/");
  await expect(page.locator("article time").first()).toHaveText("August 17, 2026");
});

test("code blocks switch to the dark Shiki theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("building-blocks-of-this-blog/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const bg = await page
    .locator("pre.astro-code")
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toBe("rgb(255, 255, 255)");
});

test("internal links and assets use the /blog/ base", async ({ page }) => {
  await page.goto("");
  const hrefs = await page
    .locator("a[href^='/']")
    .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const h of hrefs) expect(h).toMatch(/^\/blog\//);
});

test("MDX post hydrates its React island", async ({ page }) => {
  await page.goto("interactive-islands-in-mdx/");
  const button = page.getByTestId("island").getByRole("button");
  await expect(button).toHaveText(/Clicked 0 times/);
  // client:visible — scroll it into view and wait for hydration (Astro drops `ssr` once hydrated).
  await button.scrollIntoViewIfNeeded();
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
  await button.click();
  await expect(button).toHaveText(/Clicked 1 time/);
  await expect(page.locator("figure svg[role='img']")).toBeVisible();
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

test("custom 404 page", async ({ page }) => {
  const res = await page.goto("does-not-exist/");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Page not found");
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(violations).toEqual([]);
});

test("no horizontal overflow at 360px and nav visible", async ({ page, request }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const url of [...(await sitemapUrls(request)), "does-not-exist/"]) {
    await page.goto(url);
    await expect(page.getByRole("navigation", { name: "Main" }), url).toBeVisible();
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width, url).toBeLessThanOrEqual(360);
  }
});

test("theme toggle cycles and persists", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("");
  const toggle = page.locator("[data-theme-toggle]");
  const html = page.locator("html");
  await expect(toggle).toHaveAttribute("aria-label", /Theme: system/);
  await toggle.click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await toggle.click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(html).toHaveClass(/dark/);
  await page.reload();
  await expect(html).toHaveClass(/dark/);
  await expect(toggle).toHaveAttribute("aria-label", /Theme: dark/);
  await toggle.click();
  await expect(html).toHaveAttribute("data-theme", "system");
  await expect(html).not.toHaveClass(/dark/);
});
