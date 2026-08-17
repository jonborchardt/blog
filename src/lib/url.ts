/**
 * Build a site-relative href that respects Astro's `base` (`/blog/` in production, `/` in dev).
 * Always pass root-relative paths ("/archive/"). Never hardcode "/blog/".
 */
export function href(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Absolute URL for canonical/OG/RSS. Requires `site` in astro.config. */
export function absoluteUrl(path: string, site: URL | string): string {
  return new URL(href(path), site).toString();
}
