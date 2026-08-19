import { expect, test } from "@playwright/test";

// Keyboard-only tour of the chrome and the interactive primitives.
test("skip link, header nav and theme toggle are reachable and operable by keyboard", async ({
  page,
}) => {
  await page.goto("");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => location.hash)).toBe("#main");
  // Tab through: skip link, logo/home, every nav link, theme toggle.
  await page.goto("");
  const stops = 3 + (await page.locator("header nav a").count());
  for (let i = 0; i < stops; i++) await page.keyboard.press("Tab");
  const toggle = page.locator("[data-theme-toggle]");
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  // Focus ring is visible (outline from :focus-visible).
  const outline = await toggle.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");
});

test("post primitives: tabs, details, copy button and heading anchors work by keyboard", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("the-authoring-surface/");
  const firstTab = page.getByRole("tab").first();
  await firstTab.focus();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab").last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(firstTab).toBeFocused();

  const summary = page
    .locator("details", { hasText: "The full frontmatter contract" })
    .locator("summary");
  await summary.focus();
  await page.keyboard.press("Space");
  await expect(page.getByText("drafts are dev-only")).toBeVisible();

  const copy = page.getByRole("button", { name: "Copy code" }).first();
  await copy.focus();
  await page.keyboard.press("Enter");
  await expect(copy).toHaveText("Copied");

  const anchor = page.locator("a.heading-anchor").first();
  await anchor.focus();
  expect(await anchor.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
});

test("reduced motion disables transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("");
  const dur = await page
    .locator("[data-theme-toggle]")
    .evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(parseFloat(dur)).toBeLessThan(0.001); // 0.01ms, reported in seconds
});
