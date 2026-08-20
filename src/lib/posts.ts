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

/** Series image: every series must configure its own hero in src/config/series.ts (never a post's). */
export async function getSeriesHero(id: SeriesId): Promise<Hero> {
  const cfg = (series as SeriesRegistry)[id]!.hero;
  if (!cfg)
    throw new Error(
      `series "${id}": no hero configured → draw one (create-hero skill), save it as src/assets/series/${id}.png (1500x600), and set hero in src/config/series.ts`,
    );
  const src = assetImages[`/src/assets/${cfg.src}`];
  if (!src)
    throw new Error(
      `series "${id}": hero.src "${cfg.src}" not found under src/assets/ → fix the path in src/config/series.ts`,
    );
  return { src, alt: cfg.alt };
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

/**
 * Best "read next" candidate: highest shared-tag score, tie-broken by newest then slug
 * (deterministic builds). Each shared tag is weighted by inverse frequency across all posts, so
 * a rare shared tag signals a stronger relationship than a ubiquitous one. Never the post itself
 * and never a post from the same series — the series nav owns those. With no tag overlap it
 * degrades to the newest eligible post, so a pick always exists when any eligible post does.
 */
export function getRelatedPost(post: Post, posts: Post[]): Post | undefined {
  const freq = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) freq.set(t, (freq.get(t) ?? 0) + 1);
  const score = (p: Post) =>
    p.data.tags.reduce((s, t) => s + (post.data.tags.includes(t) ? 1 / freq.get(t)! : 0), 0);
  return posts
    .filter((p) => p.id !== post.id && (!post.data.series || p.data.series !== post.data.series))
    .sort(
      (a, b) => score(b) - score(a) || byNewest(a, b) || postSlug(a).localeCompare(postSlug(b)),
    )[0];
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

    // Listings crop the hero to its centre 60% (aspect-card), so the 2.5:1 ratio is a hard contract.
    // (Guarded: unit tests pass bare metadata without a hero; the frontmatter schema requires one.)
    if (p.data.hero && Math.abs(p.data.hero.src.width / p.data.hero.src.height - 2.5) > 0.01) {
      errors.push(
        `${p.id}: hero is ${p.data.hero.src.width}x${p.data.hero.src.height}, not 2.5:1 (1500x600) → regenerate it with the create-hero skill (npm run render-hero -- <slug>)`,
      );
    }

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
