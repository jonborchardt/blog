import { author } from "@/config/author";
import { site } from "@/config/site";
import { absoluteUrl } from "@/lib/url";
import type { Post } from "@/lib/posts";

/** Everything a page needs to emit <head> metadata. Built by pages, consumed by BaseLayout. */
export interface PageMeta {
  title: string;
  description: string;
  /** Root-relative path, e.g. "/all-posts/". */
  path: string;
  type?: "website" | "article";
  /** Root-relative or absolute image URL. Falls back to the generated site card. */
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  /** Article pages: tag labels and series title for article:* OG tags. */
  tags?: string[];
  section?: string;
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
  address: author.location,
  url: absoluteUrl("/", siteUrl),
  sameAs: Object.values(author.links),
});

export const websiteJsonLd = (siteUrl: URL) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  description: site.description,
  url: absoluteUrl("/", siteUrl),
  publisher: { "@type": "Person", name: author.name, url: absoluteUrl("/", siteUrl) },
});

export interface ArticleExtras {
  image?: string;
  section?: string;
  wordCount?: number;
}

export const articleJsonLd = (
  post: Post,
  path: string,
  siteUrl: URL,
  extras: ArticleExtras = {},
) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.data.title,
  url: absoluteUrl(path, siteUrl),
  ...(extras.image && {
    image: extras.image.startsWith("http") ? extras.image : absoluteUrl(extras.image, siteUrl),
  }),
  ...(extras.section && { articleSection: extras.section }),
  ...(extras.wordCount && { wordCount: extras.wordCount }),
  description: post.data.description,
  datePublished: post.data.publishedAt.toISOString(),
  ...(post.data.updatedAt && { dateModified: post.data.updatedAt.toISOString() }),
  author: { "@type": "Person", name: author.name, url: absoluteUrl("/", siteUrl) },
  publisher: { "@type": "Person", name: author.name },
  mainEntityOfPage: absoluteUrl(path, siteUrl),
  keywords: post.data.tags,
  isPartOf: { "@type": "Blog", name: site.name },
});
