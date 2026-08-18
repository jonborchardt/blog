/**
 * Pure client-side search core (no React, no DOM). Used by the archive island and unit-tested.
 * ponytail: hand-rolled prefix search; swap for MiniSearch if quality/size demands.
 */

export interface SearchDocMeta {
  slug: string;
  /** Base-prefixed URL, built by Astro with href(). */
  url: string;
  title: string;
  description: string;
  /** ISO calendar date, e.g. "2026-08-17". */
  publishedAt: string;
  updatedAt?: string;
  series?: { id: string; title: string; url: string; part: number; total: number };
  tags: { id: string; label: string }[];
  readingTime: number;
  /** Optimized thumbnail URL for list rows. */
  hero: { src: string; alt: string };
  /** Dev-only: drafts never reach the production index. */
  draft?: boolean;
}

export interface SearchDoc extends SearchDocMeta {
  headings: string[];
  body: string;
}

export type SortKey = "newest" | "oldest" | "title" | "relevance";

export interface SearchOptions {
  tags?: string[];
  series?: string;
  sort?: SortKey;
}

export interface SearchResult<D extends SearchDocMeta = SearchDocMeta> {
  doc: D;
  score: number;
  /** ≈160 chars around the first body hit, or the description. */
  snippet: string;
}

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 1);
}

const WEIGHTS = { title: 6, tags: 3, series: 3, headings: 2, description: 2, body: 1 } as const;

const matches = (fieldTokens: string[], q: string) => fieldTokens.some((t) => t.startsWith(q));

const fieldTokens = (doc: Partial<SearchDoc> & SearchDocMeta) => ({
  title: tokenize(doc.title),
  tags: doc.tags.flatMap((t) => tokenize(t.label)),
  series: doc.series ? tokenize(doc.series.title) : [],
  headings: tokenize((doc.headings ?? []).join(" ")),
  description: tokenize(doc.description),
  body: tokenize(doc.body ?? ""),
});

function snippetFor(doc: Partial<SearchDoc> & SearchDocMeta, tokens: string[]): string {
  const body = doc.body ?? "";
  const lower = body.toLowerCase();
  for (const t of tokens) {
    const i = lower.indexOf(t);
    if (i >= 0) {
      const start = Math.max(0, i - 60);
      const end = Math.min(body.length, i + 100);
      return `${start > 0 ? "…" : ""}${body.slice(start, end).trim()}${end < body.length ? "…" : ""}`;
    }
  }
  return doc.description;
}

/**
 * Filter by tags (all must be present) and series, then rank by query tokens (AND over tokens,
 * prefix match per token, weighted by field). Sort: relevance when a query is present unless a
 * different sort is explicitly chosen; otherwise newest/oldest/title.
 */
export function search<D extends Partial<SearchDoc> & SearchDocMeta>(
  docs: D[],
  query: string,
  { tags = [], series, sort }: SearchOptions = {},
): SearchResult<D>[] {
  const tokens = tokenize(query);
  const effectiveSort: SortKey = sort ?? (tokens.length ? "relevance" : "newest");
  const results: SearchResult<D>[] = [];

  for (const doc of docs) {
    if (series && doc.series?.id !== series) continue;
    if (tags.length && !tags.every((t) => doc.tags.some((dt) => dt.id === t))) continue;
    let score = 0;
    if (tokens.length) {
      const fields = fieldTokens(doc);
      let all = true;
      for (const q of tokens) {
        let hit = 0;
        for (const [name, weight] of Object.entries(WEIGHTS) as [keyof typeof WEIGHTS, number][]) {
          if (matches(fields[name], q)) hit += weight;
        }
        if (!hit) {
          all = false;
          break;
        }
        score += hit;
      }
      if (!all) continue;
    }
    results.push({
      doc,
      score,
      snippet: tokens.length ? snippetFor(doc, tokens) : doc.description,
    });
  }

  const byDate = (a: D, b: D) => b.publishedAt.localeCompare(a.publishedAt);
  results.sort((a, b) => {
    switch (effectiveSort) {
      case "relevance":
        return b.score - a.score || byDate(a.doc, b.doc);
      case "oldest":
        return -byDate(a.doc, b.doc);
      case "title":
        return a.doc.title.localeCompare(b.doc.title);
      default:
        return byDate(a.doc, b.doc);
    }
  });
  return results;
}
