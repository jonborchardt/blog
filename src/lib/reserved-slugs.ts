/**
 * Top-level route names a post slug may not use. Add here whenever a new top-level route is
 * created. Dependency-free so scripts/new-post.mjs can import it under plain Node.
 */
export const RESERVED_SLUGS_LIST = [
  "all-posts",
  "series",
  "about",
  "admin",
  "404",
  "og",
  "search-index.json",
  "rss.xml",
  "robots.txt",
  "sitemap-index.xml",
];
