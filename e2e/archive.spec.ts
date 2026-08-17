import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const rows = (page: import("@playwright/test").Page) => page.locator(".archive-explorer ul > li");

test("SSR renders every published post before JavaScript runs", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("archive/");
  await expect(page.locator("h1")).toHaveText("Archive");
  expect(await rows(page).count()).toBeGreaterThanOrEqual(2);
  await expect(page.getByRole("link", { name: "The Building Blocks of This Blog" })).toBeVisible();
  await ctx.close();
});

test("typing a body-only phrase narrows results via the lazy index and updates the URL", async ({
  page,
}) => {
  await page.goto("archive/");
  const input = page.getByRole("searchbox", { name: "Search posts" });
  await input.fill("mermaid");
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText("The Building Blocks of This Blog");
  await expect(page.getByRole("status")).toContainText("1 of");
  await expect.poll(() => page.evaluate(() => location.search)).toContain("q=mermaid");
  await input.fill("qzxvbnm");
  await expect(page.getByText("No posts match.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).first().click();
  expect(await rows(page).count()).toBeGreaterThanOrEqual(2);
  await expect.poll(() => page.evaluate(() => location.search)).toBe("");
});

test("URL state pre-filters and back button restores", async ({ page }) => {
  await page.goto("archive/?tag=meta&sort=oldest");
  await expect(page.getByRole("button", { name: "Meta", pressed: true })).toHaveCount(1);
  await expect(page.getByRole("status")).toContainText("tagged Meta");
  await expect(rows(page).first()).toContainText("The Building Blocks of This Blog"); // oldest first
  await page.goto("archive/?series=building-always-shippable");
  await expect(page.getByRole("status")).toContainText("in Building Always Shippable");
});

test("keyboard-only: chips toggle with Enter/Space, selects work", async ({ page }) => {
  await page.goto("archive/");
  await page.setViewportSize({ width: 1280, height: 900 });
  const chip = page.getByRole("button", { name: "Engineering" });
  await chip.focus();
  await page.keyboard.press("Enter");
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Space");
  await expect(chip).toHaveAttribute("aria-pressed", "false");
  const sort = page.getByLabel("Sort");
  await sort.selectOption("title");
  await expect.poll(() => page.evaluate(() => location.search)).toContain("sort=title");
});

test("archive is usable at 360px and axe-clean; only the archive loads React", async ({ page }) => {
  const js: string[] = [];
  page.on("request", (r) => {
    if (r.resourceType() === "script") js.push(r.url());
  });
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("archive/");
  const toggle = page.getByRole("button", { name: "Show filters" });
  await expect(toggle).toBeVisible();
  await expect(page.getByLabel("Sort")).toBeHidden();
  await toggle.click();
  await expect(page.getByLabel("Sort")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(violations).toEqual([]);
  expect(js.length).toBeGreaterThan(0);
  js.length = 0;
  await page.goto("about/");
  expect(js).toEqual([]);
});

test("search index excludes drafts and carries body text", async ({ request }) => {
  const res = await request.get("search-index.json");
  expect(res.ok()).toBe(true);
  const docs = (await res.json()) as { slug: string; body: string; headings: string[] }[];
  expect(docs.map((d) => d.slug)).not.toContain("primitives-fixture");
  const post = docs.find((d) => d.slug === "building-blocks-of-this-blog")!;
  expect(post.body).toContain("Mermaid");
  expect(post.headings).toContain("Diagrams and math");
});
