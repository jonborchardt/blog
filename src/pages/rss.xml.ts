import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { author } from "@/config/author";
import { site as siteConfig } from "@/config/site";
import { tags as tagRegistry } from "@/config/tags";
import { getPosts, postPath } from "@/lib/posts";
import { absoluteUrl, href } from "@/lib/url";

/** The one and only feed: published posts, description-only items (no full content). */
export async function GET(context: APIContext) {
  // getPosts() already excludes drafts in production builds.
  const posts = await getPosts();
  const self = absoluteUrl("/rss.xml", context.site!);
  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: new URL(href("/"), context.site),
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `<language>${siteConfig.locale}</language><atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.publishedAt,
      link: href(postPath(p)),
      author: author.name,
      categories: p.data.tags.map((t) => tagRegistry[t].label),
    })),
  });
}
