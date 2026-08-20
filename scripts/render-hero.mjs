// Rasterise a hero SVG → PNG (1500×600, 2.5:1) with resvg (already a dep, used for OG cards).
// Post heroes: src/content/posts/<slug>/hero.{svg,png}. Series heroes: pass "series/<id>" →
// src/assets/series/<id>.{svg,png}.
// Usage: npm run render-hero -- <slug|series/id> [...]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error("usage: npm run render-hero -- <slug|series/id> [...]");
  process.exit(1);
}
const fontDir = join(process.cwd(), "src/assets/fonts/og");
for (const slug of slugs) {
  const base = slug.startsWith("series/")
    ? join(process.cwd(), "src/assets/series", slug.slice("series/".length))
    : join(process.cwd(), "src/content/posts", slug, "hero");
  const svgPath = `${base}.svg`;
  if (!existsSync(svgPath)) {
    console.error(`${slug}: no SVG at ${svgPath} → create it (viewBox 0 0 1500 600) then re-run`);
    process.exit(1);
  }
  const svg = readFileSync(svgPath, "utf8");
  if (!/viewBox="0 0 1500 600"/.test(svg)) {
    console.error(
      `${slug}: hero SVG must declare viewBox="0 0 1500 600" (hero contract is 1500x600, 2.5:1; listings show only the centre 60%)`,
    );
    process.exit(1);
  }
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: 1500 },
    font: { fontDirs: [fontDir], defaultFontFamily: "IBM Plex Sans", loadSystemFonts: false },
  })
    .render()
    .asPng();
  mkdirSync(dirname(base), { recursive: true });
  writeFileSync(`${base}.png`, png);
  console.log(`${slug}: ${base}.png written (${png.length} bytes)`);
}
