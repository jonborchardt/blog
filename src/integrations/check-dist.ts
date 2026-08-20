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
import { checkDist as runChecks, collectExternalLinks } from "../lib/dist-checks";
import { checkExternalLinks } from "../lib/external-links";

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

        if (process.env.SKIP_EXTERNAL_LINKS) {
          logger.info("external links: skipped (SKIP_EXTERNAL_LINKS is set)");
        } else {
          const external = collectExternalLinks(pages);
          const report = await checkExternalLinks([...external.keys()]);
          for (const w of report.warnings) {
            logger.warn(
              `external link ${w.url} (${w.detail}) in ${external.get(w.url)!.join(", ")} — not failing the build (transient/ambiguous); fix it if it stays broken`,
            );
          }
          if (report.dead.length) {
            const list = report.dead.map(
              (d) => `${d.url} (${d.detail}) in ${external.get(d.url)!.join(", ")}`,
            );
            throw new Error(
              `check-dist: ${list.length} dead external link(s):\n- ${list.join("\n- ")}\n→ fix or remove the link, or point at an archived copy (web.archive.org)`,
            );
          }
          logger.info(`external links: ${external.size} OK (${report.warnings.length} warning(s))`);
        }
      },
    },
  };
}
