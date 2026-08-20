/**
 * Pure post-build checks over the emitted HTML (string in → error strings out). Run by the
 * `checkDist` integration after `astro build`; unit-tested directly. Every message names the file,
 * the problem, and the fix so a coding agent can act on it without reading this code.
 */
import { JSDOM } from "jsdom";

export interface DistPage {
  /** Path relative to dist, e.g. "about/index.html" or "404.html". */
  file: string;
  html: string;
}

export interface DistCheckInput {
  pages: DistPage[];
  /** All files under dist (relative, forward slashes), including non-HTML assets. */
  files: string[];
  /** e.g. "/blog" (no trailing slash). */
  base: string;
  /** e.g. "https://jonborchardt.github.io" */
  site: string;
}

export interface DistCheckResult {
  errors: string[];
  stats: { pages: number; links: number; images: number };
}

const parse = (html: string) => new JSDOM(html).window.document;

/** URL path (under base) → dist file that serves it. */
function routeToFile(pathname: string, base: string): string | undefined {
  if (!pathname.startsWith(base + "/") && pathname !== base) return undefined;
  const rel = pathname.slice(base.length).replace(/^\//, "");
  if (rel === "") return "index.html";
  if (rel.endsWith("/")) return `${rel}index.html`;
  return rel; // an asset such as rss.xml, og/x.png, _astro/x.css
}

export function checkDist({ pages, files, base, site }: DistCheckInput): DistCheckResult {
  const errors: string[] = [];
  const fileSet = new Set(files);
  const docs = new Map(pages.map((p) => [p.file, parse(p.html)]));
  const idsByFile = new Map<string, Set<string>>();
  const idsOf = (file: string) => {
    let ids = idsByFile.get(file);
    if (!ids) {
      const doc = docs.get(file);
      ids = new Set(doc ? [...doc.querySelectorAll("[id]")].map((el) => el.id) : []);
      idsByFile.set(file, ids);
    }
    return ids;
  };
  let links = 0;
  let images = 0;

  for (const [file, doc] of docs) {
    // --- internal links -------------------------------------------------------------------------
    for (const a of doc.querySelectorAll("a[href]")) {
      const raw = a.getAttribute("href") ?? "";
      if (/^(https?:)?\/\//.test(raw) || /^(mailto|tel|javascript):/.test(raw)) continue;
      links++;
      let pathname: string;
      let hash: string;
      if (raw.startsWith("#")) {
        pathname = "";
        hash = raw.slice(1);
      } else if (raw.startsWith("/")) {
        const u = new URL(raw, "http://x");
        pathname = u.pathname;
        hash = u.hash.slice(1);
        if (!pathname.startsWith(base + "/") && pathname !== base) {
          errors.push(
            `${file}: link "${raw}" is a root-relative URL outside the base → build it with href() from src/lib/url.ts (or, in MDX, write "/path/" and let the build prefix it)`,
          );
          continue;
        }
      } else {
        // relative link: resolve against this page's route
        const route = "/" + file.replace(/index\.html$/, "");
        const u = new URL(raw, `http://x${base}${route}`);
        pathname = u.pathname;
        hash = u.hash.slice(1);
      }
      let target = file;
      if (pathname) {
        const t = routeToFile(pathname, base);
        if (!t || (!fileSet.has(t) && !docs.has(t))) {
          errors.push(
            `${file}: link "${raw}" does not resolve to a page or asset in dist/ → fix the path (posts are /<slug>/; check the slug and trailing slash)`,
          );
          continue;
        }
        target = t;
      }
      if (hash && docs.has(target) && !idsOf(target).has(decodeURIComponent(hash))) {
        errors.push(
          `${file}: link "${raw}" points to #${hash} which does not exist on ${target} → use a heading's generated id (kebab-case of its text) or remove the fragment`,
        );
      }
    }

    // --- images -----------------------------------------------------------------------------------
    for (const img of doc.querySelectorAll("img")) {
      images++;
      const desc = `<img src="${img.getAttribute("src") ?? ""}">`;
      if (!img.hasAttribute("alt")) {
        errors.push(
          `${file}: ${desc} has no alt attribute → add meaningful alt text (or alt="" plus aria-hidden="true" for decorative images)`,
        );
      } else if (
        img.getAttribute("alt") === "" &&
        img.getAttribute("role") !== "presentation" &&
        !img.closest('[aria-hidden="true"]')
      ) {
        errors.push(
          `${file}: ${desc} has empty alt but is not marked decorative → write alt text or add aria-hidden="true"`,
        );
      }
      if (!img.hasAttribute("width") || !img.hasAttribute("height")) {
        errors.push(
          `${file}: ${desc} lacks width/height → use <Image> / Markdown images for raster files, or pass width and height for SVG <img>`,
        );
      }
    }

    // --- SEO essentials ---------------------------------------------------------------------------
    const title = doc.querySelector("head > title")?.textContent?.trim();
    if (!title) errors.push(`${file}: missing <title> → pass meta.title to BaseLayout`);
    if (!doc.querySelector("meta[name=description]")?.getAttribute("content")?.trim()) {
      errors.push(`${file}: missing meta description → pass meta.description to BaseLayout`);
    }
    const canonical = doc.querySelector("link[rel=canonical]")?.getAttribute("href");
    const noindex = /noindex/i.test(
      doc.querySelector("meta[name=robots]")?.getAttribute("content") ?? "",
    );
    if (noindex) {
      // A page that tells crawlers to ignore it must not also claim a canonical URL — the two
      // directives contradict each other, and 404.html has no URL of its own to point at.
      if (canonical) {
        errors.push(
          `${file}: page is noindex but still declares canonical "${canonical}" → drop the canonical (BaseLayout omits it when meta.noindex is set)`,
        );
      }
    } else if (!canonical?.startsWith(`${site}${base}/`)) {
      errors.push(
        `${file}: canonical "${canonical}" is not under ${site}${base}/ → BaseLayout builds it with absoluteUrl(meta.path); check meta.path`,
      );
    }
    if (!doc.querySelector("meta[property='og:image']")?.getAttribute("content")) {
      errors.push(
        `${file}: missing og:image → BaseLayout falls back to /og/site.jpg; check meta.image`,
      );
    }
  }

  // --- nothing dev-only leaks -------------------------------------------------------------------
  for (const f of files) {
    if (/(^|\/)admin\//.test(f) || /__admin/.test(f)) {
      errors.push(
        `${f}: dev-only admin output found in dist/ → src/pages/admin must return no static paths in production`,
      );
    }
  }

  return { errors, stats: { pages: pages.length, links, images } };
}

/** http(s) link → dist files using it. Network policy lives in src/lib/external-links.ts. */
export function collectExternalLinks(pages: DistPage[]): Map<string, string[]> {
  const byUrl = new Map<string, string[]>();
  for (const { file, html } of pages) {
    for (const a of parse(html).querySelectorAll("a[href]")) {
      const raw = a.getAttribute("href") ?? "";
      if (!/^https?:\/\//.test(raw)) continue;
      const files = byUrl.get(raw) ?? [];
      if (!files.includes(file)) files.push(file);
      byUrl.set(raw, files);
    }
  }
  return byUrl;
}
