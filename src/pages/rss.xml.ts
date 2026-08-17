import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { site as siteConfig } from "@/config/site";
import { getPosts, postPath } from "@/lib/posts";
import { href } from "@/lib/url";

export async function GET(context: APIContext) {
  // getPosts() already excludes drafts in production builds.
  const posts = await getPosts();
  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: new URL(href("/"), context.site),
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.publishedAt,
      link: href(postPath(p)),
      categories: p.data.tags,
    })),
  });
}
