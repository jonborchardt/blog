// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";

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
  site: "https://jonborchardt.github.io",
  base: BASE,
  trailingSlash: "always",
  integrations: [react(), mdx(), sitemap()],
  image: { layout: "constrained", responsiveStyles: true },
  markdown: {
    // High-contrast pair: the default github-light orange (#e36209) fails WCAG AA on white.
    shikiConfig: {
      themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" },
    },
    rehypePlugins: [
      // Astro adds heading ids after user plugins by default; run it first so anchors can link.
      rehypeHeadingIds,
      [rehypeBaseLinks, { base: BASE }],
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
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
