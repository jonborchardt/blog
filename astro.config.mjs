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

// GitHub Pages project site: https://jonborchardt.github.io/blog/
// `site` + `base` make Astro emit correct URLs; never hardcode "/blog/" in source.
export default defineConfig({
  site: "https://jonborchardt.github.io",
  base: "/blog",
  trailingSlash: "always",
  integrations: [react(), mdx(), sitemap()],
  image: { layout: "constrained", responsiveStyles: true },
  markdown: {
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" } },
    rehypePlugins: [
      // Astro adds heading ids after user plugins by default; run it first so anchors can link.
      rehypeHeadingIds,
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
