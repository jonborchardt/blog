/**
 * Astro integration: after `astro build`, parse every emitted HTML page and fail the build on
 * broken internal links/fragments, images without alt or dimensions, missing SEO essentials,
 * hardcoded non-base links, and any admin output. Pure rules live in src/lib/dist-checks.ts.
 * Runs only during `astro build`; `astro dev` is unaffected.
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import type { AstroIntegration } from "astro";
import { checkDist as runChecks } from "../lib/dist-checks";

export function checkDist(): AstroIntegration {
  let base = "";
  let site = "";
  return {
    name: "check-dist",
    hooks: {
      "astro:config:done": ({ config }) => {
        base = config.base.replace(/\/$/, "");
        site = (config.site ?? "").replace(/\/$/, "");
      },
      "astro:build:done": async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = (await readdir(root, { recursive: true, withFileTypes: true }))
          .filter((e) => e.isFile())
          .map((e) => relative(root, join(e.parentPath, e.name)).split("\\").join("/"))
          .filter((f) => !f.startsWith(".prerender"));
        const pages = await Promise.all(
          files
            .filter((f) => f.endsWith(".html"))
            .map(async (file) => ({ file, html: await readFile(join(root, file), "utf8") })),
        );
        const { errors, stats } = runChecks({ pages, files, base, site });
        if (errors.length) {
          logger.error(`${errors.length} problem(s) in the built site:\n- ${errors.join("\n- ")}`);
          throw new Error(`check-dist: ${errors.length} problem(s) — see the list above.`);
        }
        logger.info(`${stats.pages} pages, ${stats.links} links, ${stats.images} images OK`);
      },
    },
  };
}
