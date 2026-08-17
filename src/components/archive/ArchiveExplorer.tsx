import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { search, type SearchDoc, type SearchDocMeta, type SortKey } from "@/lib/search";

/**
 * The archive explorer — the one React island in site chrome. SSR renders the full list so the
 * page works without JavaScript; on hydrate it takes over: instant search over metadata, then
 * over the lazily fetched full-text index (headings + body), tag/series filters, sorting, and
 * URL state (?q=&tag=a,b&series=&sort=) via history.replaceState.
 *
 * All URLs (post links, indexUrl) arrive from Astro already base-prefixed; nothing here builds
 * "/blog/" itself.
 */
export interface ArchiveExplorerProps {
  docs: SearchDocMeta[];
  tags: { id: string; label: string }[];
  series: { id: string; title: string }[];
  indexUrl: string;
}

interface UiState {
  q: string;
  tags: string[];
  series: string;
  sort: SortKey | "";
}

const EMPTY: UiState = { q: "", tags: [], series: "", sort: "" };
const SORTS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title A–Z" },
  { value: "relevance", label: "Relevance" },
];

function parseState(
  params: URLSearchParams,
  validTags: Set<string>,
  validSeries: Set<string>,
): UiState {
  const sort = params.get("sort") ?? "";
  return {
    q: params.get("q") ?? "",
    tags: (params.get("tag") ?? "").split(",").filter((t) => validTags.has(t)),
    series: validSeries.has(params.get("series") ?? "") ? params.get("series")! : "",
    sort: SORTS.some((s) => s.value === sort) ? (sort as SortKey) : "",
  };
}

function toParams(state: UiState): string {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.tags.length) p.set("tag", state.tags.join(","));
  if (state.series) p.set("series", state.series);
  if (state.sort) p.set("sort", state.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(iso));

/** Mirrors PostList.astro row markup/styling — the one accepted duplication (React vs Astro). */
function PostRow({ doc, snippet }: { doc: SearchDocMeta; snippet: string }) {
  return (
    <li className="py-5 first:pt-0 last:pb-0">
      {doc.series && (
        <p className="text-primary mb-1 text-xs font-medium tracking-wide uppercase">
          {doc.series.title} · Part {doc.series.part}
        </p>
      )}
      <h2 className="text-lg leading-snug font-semibold tracking-tight">
        <a href={doc.url} className="hover:text-primary no-underline">
          {doc.title}
        </a>
      </h2>
      <p className="text-muted-foreground mt-1">{snippet}</p>
      <p className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <time dateTime={doc.publishedAt}>{formatDate(doc.publishedAt)}</time>
        <span>{doc.readingTime} min read</span>
        {doc.tags.length > 0 && (
          <span className="flex flex-wrap gap-1.5" aria-label="Tags">
            {doc.tags.map((t) => (
              <span key={t.id} className="bg-muted rounded-sm px-1.5 py-0.5 text-xs">
                {t.label}
              </span>
            ))}
          </span>
        )}
      </p>
    </li>
  );
}

export default function ArchiveExplorer({ docs, tags, series, indexUrl }: ArchiveExplorerProps) {
  const validTags = useMemo(() => new Set(tags.map((t) => t.id)), [tags]);
  const validSeries = useMemo(() => new Set(series.map((s) => s.id)), [series]);
  const [state, setState] = useState<UiState>(EMPTY);
  const [fullDocs, setFullDocs] = useState<SearchDoc[] | null>(null);
  const [indexStatus, setIndexStatus] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hydrated = useRef(false);

  // URL → state on load and on back/forward.
  useEffect(() => {
    const read = () =>
      setState(parseState(new URLSearchParams(window.location.search), validTags, validSeries));
    read();
    hydrated.current = true;
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [validTags, validSeries]);

  // state → URL (debounced replaceState).
  useEffect(() => {
    if (!hydrated.current) return;
    const id = setTimeout(() => {
      const next = `${window.location.pathname}${toParams(state)}`;
      if (next !== `${window.location.pathname}${window.location.search}`) {
        history.replaceState(null, "", next);
      }
    }, 150);
    return () => clearTimeout(id);
  }, [state]);

  const loadIndex = useCallback(() => {
    if (indexStatus !== "idle") return;
    setIndexStatus("loading");
    fetch(indexUrl)
      .then((r) => (r.ok ? (r.json() as Promise<SearchDoc[]>) : Promise.reject(r.status)))
      .then((data) => {
        setFullDocs(data);
        setIndexStatus("ready");
      })
      .catch(() => setIndexStatus("failed"));
  }, [indexStatus, indexUrl]);

  // A query present on load (deep link) needs the full index immediately.
  useEffect(() => {
    if (state.q) loadIndex();
  }, [state.q, loadIndex]);

  const results = useMemo(
    () =>
      search(fullDocs ?? docs, state.q, {
        tags: state.tags,
        series: state.series || undefined,
        sort: state.sort || undefined,
      }),
    [fullDocs, docs, state],
  );

  const toggleTag = (id: string) =>
    setState((s) => ({
      ...s,
      tags: s.tags.includes(id) ? s.tags.filter((t) => t !== id) : [...s.tags, id],
    }));
  const isFiltered = state.q || state.tags.length || state.series;
  const summary = `${results.length} of ${docs.length} posts${state.q ? ` · matching “${state.q}”` : ""}${
    state.tags.length
      ? ` · tagged ${state.tags.map((t) => tags.find((x) => x.id === t)?.label ?? t).join(", ")}`
      : ""
  }${state.series ? ` · in ${series.find((s) => s.id === state.series)?.title ?? state.series}` : ""}`;

  const filters = (
    <div className="flex flex-col gap-4">
      <fieldset className="min-w-0">
        <legend className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          Tags
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => {
            const on = state.tags.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleTag(t.id)}
                className="bg-muted hover:bg-accent aria-pressed:bg-primary aria-pressed:text-primary-foreground rounded-sm border border-transparent px-2 py-0.5 text-xs"
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Series
          </span>
          <select
            value={state.series}
            onChange={(e) => setState((s) => ({ ...s, series: e.target.value }))}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            <option value="">All series</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Sort
          </span>
          <select
            value={state.sort || (state.q ? "relevance" : "newest")}
            onChange={(e) => setState((s) => ({ ...s, sort: e.target.value as SortKey }))}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );

  return (
    <div className="archive-explorer">
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="border-b pb-6"
        aria-label="Search and filter posts"
      >
        <label htmlFor="archive-q" className="sr-only">
          Search posts
        </label>
        <Input
          id="archive-q"
          type="search"
          placeholder="Search titles, text, tags…"
          value={state.q}
          autoComplete="off"
          onFocus={loadIndex}
          onChange={(e) => {
            loadIndex();
            setState((s) => ({ ...s, q: e.target.value }));
          }}
          className="h-10 text-base"
        />
        <p className="text-muted-foreground mt-1 min-h-4 text-xs" aria-live="polite">
          {indexStatus === "loading" && "Loading full-text index…"}
          {indexStatus === "failed" && "Full-text index unavailable; searching titles and tags."}
        </p>
        {/* Filters collapse under md; always visible from md up. */}
        <button
          type="button"
          className="mt-4 text-sm font-medium md:hidden"
          aria-expanded={filtersOpen}
          aria-controls="archive-filters"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          {filtersOpen ? "Hide filters" : "Show filters"}
        </button>
        <div id="archive-filters" className={filtersOpen ? "mt-4 block" : "mt-4 hidden md:block"}>
          {filters}
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
          {summary}
        </p>
        {isFiltered ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setState(EMPTY)}>
            Clear filters
          </Button>
        ) : null}
      </div>

      {results.length ? (
        <ul className="mt-4 divide-y">
          {results.map((r) => (
            <PostRow key={r.doc.slug} doc={r.doc} snippet={r.snippet} />
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-md border p-6 text-center">
          <p className="font-medium">No posts match.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Try fewer words, a different spelling, or remove a filter.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setState(EMPTY)}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
