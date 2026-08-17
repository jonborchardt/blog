// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages project site: https://jonborchardt.github.io/blog/
// `site` + `base` make Astro emit correct URLs; never hardcode "/blog/" in source.
export default defineConfig({
  site: "https://jonborchardt.github.io",
  base: "/blog",
  trailingSlash: "always",
  integrations: [react(), mdx(), sitemap()],
  markdown: {
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" } },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
