import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const rows = (page: import("@playwright/test").Page) => page.locator(".archive-explorer ul > li");
// Tag chips and the series select live inside the "Filter" disclosure; open it before touching them.
const openFilters = (page: import("@playwright/test").Page) =>
  page.locator(".archive-explorer summary", { hasText: /^Filter/ }).click();
// Astro drops the `ssr` attribute once the island hydrates; input sent before that is lost when
// React mounts and re-renders the controlled fields from its own (empty) state.
const hydrated = (page: import("@playwright/test").Page) =>
  page.locator("astro-island:not([ssr])").waitFor();

test("SSR renders every published post before JavaScript runs", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("all-posts/");
  await expect(page.locator("h1")).toHaveText("All Posts");
  expect(await rows(page).count()).toBeGreaterThanOrEqual(2);
  await expect(page.getByRole("link", { name: "The Authoring Surface" })).toBeVisible();
  await ctx.close();
});

test("typing a body-only phrase narrows results via the lazy index and updates the URL", async ({
  page,
}) => {
  await page.goto("all-posts/");
  await hydrated(page);
  const input = page.getByRole("searchbox", { name: "Search posts" });
  // A phrase that appears only in one post's body, never in a title, description or tag.
  await input.fill("cliff path in fog");
  // Don't pin the count: any future post using the phrase would fail this as if search broke.
  await expect(rows(page).first()).toContainText("An Agent Built This Blog");
  await expect(page.getByRole("status")).toContainText(/\d+ of/);
  await expect.poll(() => page.evaluate(() => location.search)).toContain("q=cliff");
  await input.fill("qzxvbnm");
  await expect(page.getByText("No posts match.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).first().click();
  expect(await rows(page).count()).toBeGreaterThanOrEqual(2);
  await expect.poll(() => page.evaluate(() => location.search)).toBe("");
});

test("URL state pre-filters the archive", async ({ page }) => {
  await page.goto("all-posts/?tag=ai-assisted-coding&sort=oldest");
  await openFilters(page);
  await expect(page.getByRole("button", { name: "AI-Assisted Coding", pressed: true })).toHaveCount(
    1,
  );
  await expect(page.getByRole("status")).toContainText("tagged AI-Assisted Coding");
  await expect(page.getByLabel("Sort")).toHaveValue("oldest");
  // Assert the ordering, not which post happens to be first: several share a publish date.
  const dates = (await rows(page).locator("time").allTextContents()).map((t) => Date.parse(t));
  expect(dates.length).toBeGreaterThan(1);
  expect(dates).toEqual([...dates].sort((a, b) => a - b));
  await page.goto("all-posts/?series=worldlock");
  await expect(page.getByRole("status")).toContainText("in WorldLock");
});

test("keyboard-only: chips toggle with Enter/Space, selects work", async ({ page }) => {
  await page.goto("all-posts/");
  await hydrated(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await openFilters(page);
  // Scope to the Filter disclosure: result rows also render tag buttons with the same labels.
  const chip = page
    .locator(".archive-explorer details")
    .getByRole("button", { name: "Engineering", exact: true });
  await chip.focus();
  await page.keyboard.press("Enter");
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Space");
  await expect(chip).toHaveAttribute("aria-pressed", "false");
  const sort = page.getByLabel("Sort");
  await sort.selectOption("title");
  await expect.poll(() => page.evaluate(() => location.search)).toContain("sort=title");
});

test("a tag on a result row filters by it and lands in the URL", async ({ page }) => {
  await page.goto("all-posts/");
  await hydrated(page);
  const tag = rows(page).first().getByRole("button").first();
  const label = (await tag.textContent())!.trim();
  await tag.click();
  await expect(page.getByRole("status")).toContainText(`tagged ${label}`);
  await expect.poll(() => page.evaluate(() => location.search)).toContain("tag=");
});

test("archive is usable at 360px and axe-clean; only the archive loads React", async ({ page }) => {
  const js: string[] = [];
  page.on("request", (r) => {
    if (r.resourceType() === "script") js.push(r.url());
  });
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("all-posts/");
  await hydrated(page);
  await expect(page.getByLabel("Series")).toBeHidden();
  await openFilters(page);
  await expect(page.getByLabel("Series")).toBeVisible();
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

test("search index lists published posts and carries body text", async ({ request }) => {
  const res = await request.get("search-index.json");
  expect(res.ok()).toBe(true);
  const docs = (await res.json()) as { slug: string; body: string; headings: string[] }[];
  expect(docs.map((d) => d.slug)).toContain("an-agent-built-this-blog");
  const post = docs.find((d) => d.slug === "the-authoring-surface")!;
  expect(post.body).toContain("Mermaid");
  expect(post.headings).toContain("Diagrams and math");
});
