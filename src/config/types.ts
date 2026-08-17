/**
 * Types and Zod schemas for the configuration registries in this directory.
 *
 * The registry files (site.ts, author.ts, series.ts, tags.ts) are *generated* by the dev-only
 * admin writer (src/dev/config-writer.ts) from a fixed template: edit values (by hand or via
 * /admin/ in `npm run dev`), not structure. Comments belong here, not in the generated files.
 *
 * - `site`: identity, canonical origin, locale, featured post, primary navigation.
 * - `author`: byline, tagline, personal links (used in footer, about header, Person JSON-LD).
 * - `series`: id → { title, description, hero? }. Posts reference a series by key; unknown ids fail the build.
 *   `hero.src` is a path under src/assets/ (e.g. "series/finances.png"); without it a series shows its
 *   first post's hero.
 * - `tags`: id → { label }. Posts may only use tags listed here; add here first.
 */
import { z } from "astro/zod";

const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const siteSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  /** Legal disclaimer shown in the footer (e.g. "Views are my own"). Empty string = none. */
  disclaimer: z.string(),
  /** Canonical production origin (no trailing slash). The `/blog` base is set in astro.config. */
  url: z.url(),
  locale: z.string().min(2),
  /** Slug of the post to feature on the homepage; `null` = newest published post. */
  featuredPost: z.string().regex(kebab).nullable(),
  nav: z.array(z.object({ label: z.string().min(1), href: z.string().regex(/^\/.*\/$|^\/$/) })),
});
export type SiteConfig = z.infer<typeof siteSchema>;

export const authorSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  /** Where the author is based, shown on the about page and in Person JSON-LD. */
  location: z.string().min(1),
  links: z.record(z.string().regex(/^[a-z][a-z0-9]*$/), z.url()),
});
export type AuthorConfig = z.infer<typeof authorSchema>;

export const seriesSchema = z.record(
  z.string().regex(kebab, "series ids are kebab-case"),
  z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    hero: z.object({ src: z.string().min(1), alt: z.string().min(1) }).optional(),
  }),
);
export type SeriesRegistry = z.infer<typeof seriesSchema>;

export const tagsSchema = z.record(
  z.string().regex(kebab, "tag ids are kebab-case"),
  z.object({ label: z.string().min(1) }),
);
export type TagRegistry = z.infer<typeof tagsSchema>;

export const CONFIG_NAMES = ["site", "author", "series", "tags"] as const;
export type ConfigName = (typeof CONFIG_NAMES)[number];
export const configSchemas = {
  site: siteSchema,
  author: authorSchema,
  series: seriesSchema,
  tags: tagsSchema,
} as const;
