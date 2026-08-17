import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { SERIES_IDS } from "@/config/series";
import { TAG_IDS } from "@/config/tags";

/** Actionable message for the description length rule (search snippets + social previews). */
const descriptionLength = (issue: { input?: unknown }) =>
  `description must be 40-160 characters for search/social previews (got ${String(issue.input).length})`;

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
        title: z
          .string()
          .min(1, "title is required")
          .max(90, {
            error: (issue) =>
              `title must be at most 90 characters for search results (got ${String(issue.input).length})`,
          }),
        /** Defaults to the post directory name. Set explicitly to override. */
        slug: z.string().regex(SLUG_PATTERN).optional(),
        description: z
          .string()
          .min(40, { error: descriptionLength })
          .max(160, { error: descriptionLength }),
        publishedAt: z.coerce.date(),
        updatedAt: z.coerce.date().optional(),
        series: z.enum(SERIES_IDS).optional(),
        seriesOrder: z.number().int().positive().optional(),
        tags: z.array(z.enum(TAG_IDS)).default([]),
        draft: z.boolean().default(false),
        hero: z.object(
          { src: image(), alt: z.string().min(1) },
          {
            error:
              "hero is required (1200x630 image next to index.mdx + meaningful alt); copy src/assets/hero-placeholder.png until you have one",
          },
        ),
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
