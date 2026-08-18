// @ts-check
import { defineConfig } from "astro/config";
import { realpathSync } from "node:fs";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeMermaid from "rehype-mermaid";
import { checkDist } from "./src/integrations/check-dist.ts";
import { adminPlugin } from "./src/dev/admin-plugin.ts";

/**
 * Plain text of a heading hast node (for anchor aria-labels).
 * @param {import("hast").Nodes} node
 * @returns {string}
 */
function headingText(node) {
  if (node.type === "text") return node.value;
  if (!("children" in node)) return "";
  return node.children.map(headingText).join("").trim();
}

/**
 * Rehype plugin: prefix root-relative links/images in Markdown/MDX with the configured base so
 * authors write `/some-post/` and never `/blog/`. External, hash and protocol-relative URLs are
 * left alone.
 * @param {{ base: string }} opts
 */
function rehypeBaseLinks({ base }) {
  const prefix = base.replace(/\/$/, "");
  /** @param {import("hast").Nodes} node */
  const walk = (node) => {
    if (node.type === "element") {
      for (const attr of ["href", "src"]) {
        const v = node.properties?.[attr];
        if (typeof v === "string" && v.startsWith("/") && !v.startsWith("//")) {
          node.properties[attr] = prefix + v;
        }
      }
    }
    if ("children" in node) node.children.forEach(walk);
  };
  return walk;
}

const BASE = "/blog";

// GitHub Pages project site: https://jonborchardt.github.io/blog/
// `site` + `base` make Astro emit correct URLs; never hardcode "/blog/" in source.
export default defineConfig({
  // Canonical-case root: on Windows a lowercase-drive cwd (e:\...) makes Vite's import.meta.glob
  // build bogus "../../E:/..." image ids and every page 500s in dev.
  root: realpathSync.native(process.cwd()),
  site: "https://jonborchardt.github.io",
  base: BASE,
  trailingSlash: "always",
  // checkDist runs after `astro build` and fails it on broken links, alt-less images, SEO gaps.
  integrations: [react(), mdx(), sitemap(), checkDist()],
  image: { layout: "constrained", responsiveStyles: true },
  markdown: {
    // High-contrast pair: the default github-light orange (#e36209) fails WCAG AA on white.
    syntaxHighlight: { type: "shiki", excludeLangs: ["mermaid", "math"] },
    shikiConfig: {
      themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" },
    },
    processor: unified({
      // Math ($ / $$) and Mermaid fences render at build time to static HTML/SVG. Zero client JS.
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        // Astro adds heading ids after user plugins by default; run it first so anchors can link.
        rehypeHeadingIds,
        [rehypeBaseLinks, { base: BASE }],
        rehypeKatex,
        [
          rehypeMermaid,
          {
            strategy: "inline-svg",
            mermaidConfig: {
              theme: "neutral",
              // Same stack as the site so build-time text measurement matches what renders.
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            },
          },
        ],
        [
          rehypeAutolinkHeadings,
          {
            behavior: "append",
            /** @param {import("hast").Element} node */
            properties: (node) => ({
              class: "heading-anchor",
              "aria-label": "Link to section: " + headingText(node),
            }),
            content: { type: "text", value: "#" },
          },
        ],
      ],
    }),
  },
  vite: {
    // adminPlugin is apply:"serve" (dev only): backs /admin/ config writes; never in a build.
    plugins: [tailwindcss(), adminPlugin()],
  },
});
