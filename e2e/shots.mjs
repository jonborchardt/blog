// Ad-hoc screenshot helper (not a test): node e2e/shots.mjs <outdir> [paths...]
import { chromium } from "@playwright/test";
const [out = "shots", ...paths] = process.argv.slice(2);
const base = "http://localhost:4322/blog/";
const browser = await chromium.launch();
for (const p of paths.length
  ? paths
  : ["", "building-blocks-of-this-blog/", "archive/", "does-not-exist/"]) {
  for (const width of (process.env.WIDTHS ?? "360,1280").split(",").map(Number)) {
    for (const scheme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: scheme });
      await page.goto(base + p);
      const name = `${out}/${(p || "home").replace(/\W+/g, "_")}-${width}-${scheme}.png`;
      await page.screenshot({ path: name, fullPage: true });
      await page.close();
    }
  }
}
await browser.close();
