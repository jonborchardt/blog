// Render a hand-drawn post SVG on the site's light and dark theme tokens and screenshot both,
// so a diagram can be verified without a full build. Usage:
//   node scripts/svg-shot.mjs <path-to.svg> <outdir>
// Writes <name>-light.png and <name>-dark.png into <outdir>.
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { chromium } from "@playwright/test";

const [svgPath, outDir] = process.argv.slice(2);
if (!svgPath || !outDir) {
  console.error("usage: node scripts/svg-shot.mjs <path-to.svg> <outdir>");
  process.exit(1);
}
const svg = readFileSync(svgPath, "utf8");
const name = basename(svgPath).replace(/\.svg$/, "");

// Hex twins of --background/--foreground in src/styles/global.css (:root and .dark).
const themes = {
  light: { bg: "oklch(0.99 0.003 240)", fg: "oklch(0.2 0.015 250)" },
  dark: { bg: "oklch(0.16 0.012 250)", fg: "oklch(0.94 0.006 240)" },
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 760, height: 900 } });
for (const [mode, t] of Object.entries(themes)) {
  await page.setContent(
    `<body style="margin:0;padding:24px;background:${t.bg};color:${t.fg}">
       <div style="max-width:672px;margin:0 auto">${svg.replace(/<svg /, '<svg style="max-width:100%;height:auto" ')}</div>
     </body>`,
  );
  await page.locator("svg").screenshot({ path: `${outDir}/${name}-${mode}.png` });
}
await browser.close();
console.log(`wrote ${outDir}/${name}-{light,dark}.png`);
