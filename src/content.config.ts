import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { SERIES_IDS } from "@/config/series";
import { TAG_IDS } from "@/config/tags";

/** kebab-case: lowercase letters, digits, single hyphens */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const posts = defineCollection({
  // Each post is a directory: src/content/posts/<dir>/index.mdx. Entry id = <dir>.
  loader: glob({
    pattern: "*/index.mdx",
    base: "./src/content/posts",
    generateId: ({ entry }) => entry.split("/")[0]!,
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        /** Defaults to the post directory name. Set explicitly to override. */
        slug: z.string().regex(SLUG_PATTERN).optional(),
        description: z.string().min(1).max(200),
        publishedAt: z.coerce.date(),
        updatedAt: z.coerce.date().optional(),
        series: z.enum(SERIES_IDS).optional(),
        seriesOrder: z.number().int().positive().optional(),
        tags: z.array(z.enum(TAG_IDS)).default([]),
        draft: z.boolean().default(false),
        hero: z.object({ src: image(), alt: z.string().min(1) }).optional(),
        ogImage: image().optional(),
      })
      .refine((d) => d.series || d.seriesOrder === undefined, {
        message: "seriesOrder requires series",
        path: ["seriesOrder"],
      })
      .refine((d) => !d.updatedAt || d.updatedAt >= d.publishedAt, {
        message: "updatedAt must not precede publishedAt",
        path: ["updatedAt"],
      }),
});

export const collections = { posts };
