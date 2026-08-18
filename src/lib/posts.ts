import { getCollection, type CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import { series, type SeriesId } from "@/config/series";
import type { SeriesRegistry } from "@/config/types";
import { site } from "@/config/site";
import { RESERVED_SLUGS_LIST } from "@/lib/reserved-slugs";

export type Post = CollectionEntry<"posts">;

/** Route names posts may not collide with (list lives in reserved-slugs.ts so Node scripts can read it). */
export const RESERVED_SLUGS = new Set(RESERVED_SLUGS_LIST);

export const postSlug = (post: Post): string => post.data.slug ?? post.id;
export const postPath = (post: Post): string => `/${postSlug(post)}/`;
export const seriesPath = (id: SeriesId): string => `/series/${id}/`;

const byNewest = (a: Post, b: Post) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime();

/**
 * All posts eligible for the current build, newest first.
 * Drafts are included in dev only — this is the single gate for draft visibility.
 * Also runs cross-post validation so invalid states fail the build.
 */
export async function getPosts(): Promise<Post[]> {
  const all = await getCollection("posts");
  validatePosts(all);
  return all.filter((p) => import.meta.env.DEV || !p.data.draft).sort(byNewest);
}

export async function getFeaturedPost(): Promise<Post | undefined> {
  const posts = await getPosts();
  return (site.featuredPost && posts.find((p) => postSlug(p) === site.featuredPost)) || posts[0];
}

export async function getSeriesPosts(id: SeriesId): Promise<Post[]> {
  return (await getPosts())
    .filter((p) => p.data.series === id)
    .sort((a, b) => (a.data.seriesOrder ?? Infinity) - (b.data.seriesOrder ?? Infinity));
}

export type Hero = { src: ImageMetadata; alt: string };

// Series heroes are referenced from generated config as paths under src/assets/, so resolve them here.
const assetImages = import.meta.glob<ImageMetadata>(
  "/src/assets/**/*.{png,jpg,jpeg,webp,avif,gif,svg}",
  { eager: true, import: "default" },
);

/** Series image: configured in src/config/series.ts, else the first post's hero, else the placeholder. */
export async function getSeriesHero(id: SeriesId): Promise<Hero> {
  const cfg = (series as SeriesRegistry)[id]!.hero;
  if (cfg) {
    const src = assetImages[`/src/assets/${cfg.src}`];
    if (!src)
      throw new Error(
        `series "${id}": hero.src "${cfg.src}" not found under src/assets/ → fix the path in src/config/series.ts`,
      );
    return { src, alt: cfg.alt };
  }
  return (
    (await getSeriesPosts(id))[0]?.data.hero ?? {
      src: assetImages["/src/assets/hero-placeholder.png"]!,
      alt: "Placeholder series image",
    }
  );
}

export interface SeriesContext {
  /** 1-based positional part number (consistent even if seriesOrder has gaps). */
  index: number;
  total: number;
  prev?: Post;
  next?: Post;
  series: { id: SeriesId; title: string; description: string };
}

/** Position of a post within its series, or undefined when it has none. */
export async function getSeriesContext(post: Post): Promise<SeriesContext | undefined> {
  const id = post.data.series;
  if (!id) return undefined;
  const siblings = await getSeriesPosts(id);
  const i = siblings.findIndex((p) => p.id === post.id);
  return {
    index: i + 1,
    total: siblings.length,
    prev: siblings[i - 1],
    next: siblings[i + 1],
    series: { id, ...series[id] },
  };
}

/** Pure validation over post metadata. Throws listing every problem found. */
export function validatePosts(posts: Pick<Post, "id" | "data">[]): void {
  const errors: string[] = [];
  const seenSlugs = new Map<string, string>();
  const seenOrder = new Map<string, string>();

  // A series description is the <meta name="description"> of /series/<id>/, so hold it to the same
  // 40-160 the post schema enforces. `satisfies SeriesRegistry` is a type check only, not a length one.
  for (const [id, info] of Object.entries(series)) {
    const n = info.description.length;
    if (n < 40 || n > 160) {
      errors.push(
        `series "${id}": description is ${n} characters → rewrite it to 40-160 in src/config/series.ts (it is the page's meta description; search results cut off past ~160)`,
      );
    }
  }

  for (const p of posts) {
    const slug = p.data.slug ?? p.id;
    if (RESERVED_SLUGS.has(slug)) {
      errors.push(
        `${p.id}: slug "${slug}" is a reserved route name → rename the post directory or set a different "slug" in frontmatter`,
      );
    }
    const dup = seenSlugs.get(slug);
    if (dup) {
      errors.push(
        `${p.id}: duplicate slug "${slug}" (also used by ${dup}) → rename one post directory or set a different "slug"`,
      );
    }
    seenSlugs.set(slug, p.id);

    if (p.data.series) {
      if (!(p.data.series in series)) {
        errors.push(
          `${p.id}: unknown series "${p.data.series}" → add it to src/config/series.ts first, or fix the frontmatter`,
        );
      }
      if (p.data.seriesOrder !== undefined) {
        const key = `${p.data.series}#${p.data.seriesOrder}`;
        const other = seenOrder.get(key);
        if (other) {
          errors.push(
            `${p.id}: duplicate seriesOrder ${p.data.seriesOrder} in "${p.data.series}" (also ${other}) → give one of them the next free order (max existing + 1)`,
          );
        }
        seenOrder.set(key, p.id);
      }
    }
  }
  if (errors.length) throw new Error(`Post validation failed:\n- ${errors.join("\n- ")}`);
}
