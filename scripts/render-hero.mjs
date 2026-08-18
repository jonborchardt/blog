// Rasterise src/content/posts/<slug>/hero.svg → hero.png (1200×630) with resvg (already a dep, used for OG cards).
// Usage: npm run render-hero -- <slug> [<slug> ...]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error("usage: npm run render-hero -- <slug> [...]");
  process.exit(1);
}
const fontDir = join(process.cwd(), "src/assets/fonts/og");
for (const slug of slugs) {
  const dir = join(process.cwd(), "src/content/posts", slug);
  const svgPath = join(dir, "hero.svg");
  if (!existsSync(svgPath)) {
    console.error(`${slug}: no hero.svg in ${dir} → create it (viewBox 0 0 1200 630) then re-run`);
    process.exit(1);
  }
  const svg = readFileSync(svgPath, "utf8");
  if (!/viewBox="0 0 1200 630"/.test(svg)) {
    console.error(
      `${slug}: hero.svg must declare viewBox="0 0 1200 630" (hero contract is 1200x630)`,
    );
    process.exit(1);
  }
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: { fontDirs: [fontDir], defaultFontFamily: "IBM Plex Sans", loadSystemFonts: false },
  })
    .render()
    .asPng();
  writeFileSync(join(dir, "hero.png"), png);
  console.log(`${slug}: hero.png written (${png.length} bytes)`);
}
