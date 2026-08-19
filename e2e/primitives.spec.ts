import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// The primitives reference post: uses every static primitive plus one island.
const POST = "the-authoring-surface/";
// The zero-JS reference post: prose, Mermaid and inline SVG, no islands.
const ZERO_JS_POST = "an-agent-built-this-blog/";

test("prose post ships no islands and no external scripts", async ({ page }) => {
  await page.goto(ZERO_JS_POST);
  await expect(page.locator("astro-island")).toHaveCount(0);
  expect(await page.locator("script[src]").count()).toBe(0);
});

test("Tabs follow the ARIA pattern and respond to arrow keys", async ({ page }) => {
  await page.goto(POST);
  const tablist = page.getByRole("tablist").first();
  const tabs = tablist.getByRole("tab");
  await expect(tabs).toHaveCount(2);
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  const panels = page.getByRole("tabpanel");
  await expect(panels).toHaveCount(1); // hidden panels are not exposed
  await tabs.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("Figure caption");
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
});

test("Details toggles", async ({ page }) => {
  await page.goto(POST);
  const details = page.locator("details", { hasText: "The full frontmatter contract" });
  await expect(details).not.toHaveAttribute("open");
  await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
  await expect(details.getByText("drafts are dev-only")).toBeVisible();
});

test("copy button copies the code", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(POST);
  const button = page.getByRole("button", { name: "Copy code" }).first();
  await button.click();
  await expect(button).toHaveText("Copied");
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("export function href");
});

for (const scheme of ["light", "dark"] as const) {
  test(`primitives are axe-clean in ${scheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(POST);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(violations).toEqual([]);
  });
}

test("Mermaid diagrams and math render at build time", async ({ page }) => {
  await page.goto(POST);
  await expect(page.locator("svg[id^='mermaid']").first()).toBeVisible();
  await expect(page.locator(".katex").first()).toBeVisible();
  await expect(page.locator(".katex-display").first()).toBeVisible();
  // The zero-JS post also carries a Mermaid diagram — rendered with no scripts at all.
  await page.goto(ZERO_JS_POST);
  await expect(page.locator("svg[id^='mermaid']").first()).toBeVisible();
  expect(await page.locator("script[src]").count()).toBe(0);
});
