import { getCollection, type CollectionEntry } from "astro:content";
import { series, type SeriesId } from "@/config/series";
import { site } from "@/config/site";

export type Post = CollectionEntry<"posts">;

/** Route names posts may not collide with. */
export const RESERVED_SLUGS = new Set([
  "archive",
  "series",
  "about",
  "admin",
  "404",
  "og",
  "rss.xml",
  "robots.txt",
  "sitemap-index.xml",
]);

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

  for (const p of posts) {
    const slug = p.data.slug ?? p.id;
    if (RESERVED_SLUGS.has(slug)) errors.push(`${p.id}: slug "${slug}" is reserved`);
    const dup = seenSlugs.get(slug);
    if (dup) errors.push(`${p.id}: duplicate slug "${slug}" (also ${dup})`);
    seenSlugs.set(slug, p.id);

    if (p.data.series) {
      if (!(p.data.series in series)) errors.push(`${p.id}: unknown series "${p.data.series}"`);
      if (p.data.seriesOrder !== undefined) {
        const key = `${p.data.series}#${p.data.seriesOrder}`;
        const other = seenOrder.get(key);
        if (other) {
          errors.push(
            `${p.id}: duplicate seriesOrder ${p.data.seriesOrder} in "${p.data.series}" (also ${other})`,
          );
        }
        seenOrder.set(key, p.id);
      }
    }
  }
  if (errors.length) throw new Error(`Post validation failed:\n- ${errors.join("\n- ")}`);
}
