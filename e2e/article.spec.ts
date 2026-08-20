import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Reference fixture: a post in a series with ≥3 headings, a raster image, a table and a code block.
const POST = "the-authoring-surface/";

test("article structure: one h1, landmarks, series nav, TOC, anchors", async ({ page }) => {
  await page.goto(POST);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Series navigation" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "On this page" })).toBeVisible();
  const anchors = page.locator("a.heading-anchor");
  expect(await anchors.count()).toBeGreaterThanOrEqual(3);
  await expect(anchors.first()).toHaveAttribute("aria-label", /^Link to section: /);
  await expect(page.getByText(/\d+ min read/)).toBeVisible();
  // Part count tracks how many posts in the series are published, so don't pin it.
  await expect(page.getByText(/Part 2 of \d+/).first()).toBeVisible();
});

test("images are lazy, sized and responsive; tables scroll", async ({ page }) => {
  await page.goto(POST);
  const img = page.locator(".prose img[srcset]").first();
  await expect(img).toHaveAttribute("loading", "lazy");
  await expect(img).toHaveAttribute("width", /\d+/);
  await expect(img).toHaveAttribute("height", /\d+/);
  await expect(img).toHaveAttribute("src", /\.webp$/);
  await expect(page.locator(".overflow-x-auto > table")).toHaveCount(1);
  await expect(page.locator("figure figcaption").first()).toBeVisible();
});

test("no horizontal overflow at 360px with a wide table and code block", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(POST);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test("prose pages ship no islands", async ({ page }) => {
  await page.goto("about/");
  await expect(page.locator("astro-island")).toHaveCount(0);
});

test("print media hides chrome and keeps the article", async ({ page }) => {
  await page.goto(POST);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("body > header")).toBeHidden();
  await expect(page.locator("body > footer")).toBeHidden();
  await expect(page.locator("article footer")).toBeHidden();
  await expect(page.locator("article h1")).toBeVisible();
});

for (const scheme of ["light", "dark"] as const) {
  test(`article is axe-clean in ${scheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(POST);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(violations).toEqual([]);
  });
}
