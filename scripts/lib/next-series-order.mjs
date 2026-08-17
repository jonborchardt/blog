/**
 * seriesOrder for a new post in a series: max(existing published seriesOrder) + 1, or 1.
 * Pure; `posts` is any list of { series?, seriesOrder?, draft? } (drafts are ignored so a
 * half-written draft never reserves a slot).
 * @param {{ series?: string; seriesOrder?: number; draft?: boolean }[]} posts
 * @param {string} seriesId
 */
export function nextSeriesOrder(posts, seriesId) {
  const orders = posts
    .filter((p) => p.series === seriesId && !p.draft && typeof p.seriesOrder === "number")
    .map((p) => /** @type {number} */ (p.seriesOrder));
  return orders.length ? Math.max(...orders) + 1 : 1;
}

/**
 * Minimal frontmatter reader for scaffolding: enough to get slug/series/seriesOrder/draft
 * without a YAML dependency. Only handles the flat `key: value` lines the schema uses.
 * @param {string} mdx
 */
export function readFrontmatter(mdx) {
  const m = mdx.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  /** @type {Record<string, string>} */
  const out = {};
  for (const line of (m?.[1] ?? "").split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return {
    slug: out.slug,
    series: out.series,
    seriesOrder: out.seriesOrder ? Number(out.seriesOrder) : undefined,
    draft: out.draft === "true",
  };
}
