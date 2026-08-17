import { author } from "@/config/author";
import { site } from "@/config/site";
import { absoluteUrl } from "@/lib/url";
import type { Post } from "@/lib/posts";

/** Everything a page needs to emit <head> metadata. Built by pages, consumed by BaseLayout. */
export interface PageMeta {
  title: string;
  description: string;
  /** Root-relative path, e.g. "/archive/". */
  path: string;
  type?: "website" | "article";
  /** Root-relative or absolute image URL. */
  image?: string;
  publishedAt?: Date;
  updatedAt?: Date;
  /** Draft/dev-only pages: emit noindex and no structured data. */
  noindex?: boolean;
  /** Extra JSON-LD objects to emit. */
  jsonLd?: object[];
}

export const personJsonLd = (siteUrl: URL) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: author.name,
  description: author.tagline,
  url: absoluteUrl("/about/", siteUrl),
  sameAs: Object.values(author.links),
});

export const articleJsonLd = (post: Post, path: string, siteUrl: URL) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.data.title,
  description: post.data.description,
  datePublished: post.data.publishedAt.toISOString(),
  ...(post.data.updatedAt && { dateModified: post.data.updatedAt.toISOString() }),
  author: { "@type": "Person", name: author.name },
  publisher: { "@type": "Person", name: author.name },
  mainEntityOfPage: absoluteUrl(path, siteUrl),
  keywords: post.data.tags,
  isPartOf: { "@type": "Blog", name: site.name },
});
