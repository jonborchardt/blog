/**
 * Astro integration: after `astro build`, parse every emitted HTML page and fail the build on
 * broken internal links/fragments, images without alt or dimensions, missing SEO essentials,
 * hardcoded non-base links, and any admin output. Pure rules live in src/lib/dist-checks.ts.
 * Runs only during `astro build`; `astro dev` is unaffected.
 */
import { execFile } from "node:child_process";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { promisify } from "node:util";
import type { AstroIntegration } from "astro";
import { checkDist as runChecks, collectExternalLinks, hoistBodyStyles } from "../lib/dist-checks";
import { checkExternalLinks } from "../lib/external-links";

/**
 * W3C markup validation of the built HTML via the Nu checker (the same engine as
 * validator.w3.org/nu). vnu-jar is pinned to 25.12.31, the last release that runs on Java 11;
 * its bundled CSS parser predates modern CSS (@layer etc.) and the online checker's does not,
 * so "CSS: …" messages are ignored — this gate covers markup only.
 */
async function w3cMarkupErrors(distRoot: string): Promise<string[]> {
  const jar = String(createRequire(import.meta.url)("vnu-jar"));
  let report: string;
  try {
    ({ stderr: report } = await promisify(execFile)(
      "java",
      ["-jar", jar, "--skip-non-html", "--errors-only", "--format", "json", distRoot],
      { maxBuffer: 64 * 1024 * 1024 },
    ));
  } catch (err) {
    // vnu exits 1 when it finds errors; the JSON report is still on stderr.
    const stderr = (err as { stderr?: string }).stderr ?? "";
    if (!stderr.trimStart().startsWith("{")) {
      throw new Error(
        `check-dist: could not run the W3C markup validator (java -jar vnu.jar): ${(err as Error).message}\n→ install Java 11+ and put it on PATH (GitHub ubuntu runners already have it)`,
        { cause: err },
      );
    }
    report = stderr;
  }
  const { messages } = JSON.parse(report) as {
    messages: { type: string; url?: string; lastLine?: number; message: string }[];
  };
  return messages
    .filter((m) => m.type === "error" && !m.message.startsWith("CSS:"))
    .map(
      (m) =>
        `${(m.url ?? "").replace(/^file:.*?dist\//, "")}:${m.lastLine ?? "?"}: ${m.message} → fix the markup in the source component/MDX so validator.w3.org passes`,
    );
}

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
            .map(async (file) => {
              const raw = await readFile(join(root, file), "utf8");
              // Astro renders some <style> elements into the body — invalid HTML. Move them to
              // <head> before checking (and shipping); see hoistBodyStyles.
              const html = hoistBodyStyles(raw);
              if (html !== raw) await writeFile(join(root, file), html);
              return { file, html };
            }),
        );
        const { errors, stats } = runChecks({ pages, files, base, site });
        errors.push(...(await w3cMarkupErrors(root)));
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
