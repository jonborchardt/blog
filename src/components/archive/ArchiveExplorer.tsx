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
    <li className="grid-cols-thumb grid gap-x-4 py-5 first:pt-0 last:pb-0">
      <a href={doc.url} tabIndex={-1} aria-hidden="true">
        <img
          src={doc.hero.src}
          alt={doc.hero.alt}
          width={320}
          height={168}
          loading="lazy"
          className="aspect-card w-full rounded-md border object-cover"
        />
      </a>
      <div>
        {doc.series && (
          <p className="text-primary eyebrow mb-1">
            {doc.series.title} · Part {doc.series.part}
          </p>
        )}
        <h2 className="text-title font-semibold">
          <a href={doc.url} className="hover:text-primary no-underline">
            {doc.title}
          </a>
          {doc.draft && (
            <span className="bg-destructive text-background eyebrow ml-2 rounded-sm px-1.5 py-0.5 align-middle">
              Draft
            </span>
          )}
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
      </div>
    </li>
  );
}

export default function ArchiveExplorer({ docs, tags, series, indexUrl }: ArchiveExplorerProps) {
  const validTags = useMemo(() => new Set(tags.map((t) => t.id)), [tags]);
  const validSeries = useMemo(() => new Set(series.map((s) => s.id)), [series]);
  const [state, setState] = useState<UiState>(EMPTY);
  const [fullDocs, setFullDocs] = useState<SearchDoc[] | null>(null);
  const [indexStatus, setIndexStatus] = useState<"idle" | "loading" | "ready" | "failed">("idle");
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

  const setSeries = (v: string) => setState((s) => ({ ...s, series: v }));
  const setSort = (v: string) => setState((s) => ({ ...s, sort: v as SortKey }));
  const sortValue = state.sort || (state.q ? "relevance" : "newest");
  const searchInput = (id: string, className: string) => (
    <>
      <label htmlFor={id} className="sr-only">
        Search posts
      </label>
      <Input
        id={id}
        type="search"
        placeholder="Search…"
        value={state.q}
        autoComplete="off"
        onFocus={loadIndex}
        onChange={(e) => {
          loadIndex();
          setState((s) => ({ ...s, q: e.target.value }));
        }}
        className={className}
      />
    </>
  );
  const chip = (on: boolean, onClick: () => void, label: string, key: string) => (
    <button
      key={key}
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className="bg-muted hover:bg-accent aria-pressed:bg-primary aria-pressed:text-primary-foreground rounded-full border border-transparent px-2.5 py-0.5 text-xs"
    >
      {label}
    </button>
  );
  const tagChips = tags.map((t) =>
    chip(state.tags.includes(t.id), () => toggleTag(t.id), t.label, t.id),
  );
  const selectCls = "border-input bg-background h-8 rounded-md border px-2 text-sm";
  const seriesSelect = (
    <select
      aria-label="Series"
      value={state.series}
      onChange={(e) => setSeries(e.target.value)}
      className={selectCls}
    >
      <option value="">All series</option>
      {series.map((s) => (
        <option key={s.id} value={s.id}>
          {s.title}
        </option>
      ))}
    </select>
  );
  const sortSelect = (cls = selectCls) => (
    <select
      aria-label="Sort"
      value={sortValue}
      onChange={(e) => setSort(e.target.value)}
      className={cls}
    >
      {SORTS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );

  // Search + Filter disclosure (native details) + sort; active filters shown as removable chips.
  const active = [
    ...state.tags.map((t) => ({
      label: tags.find((x) => x.id === t)?.label ?? t,
      off: () => toggleTag(t),
    })),
    ...(state.series
      ? [
          {
            label: series.find((s) => s.id === state.series)?.title ?? state.series,
            off: () => setSeries(""),
          },
        ]
      : []),
  ];
  const filterBar = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex-1">{searchInput("archive-q", "h-9")}</div>
        <details className="relative">
          <summary className="border-input bg-background hover:bg-accent flex h-8 cursor-pointer list-none items-center rounded-md border px-3 text-sm select-none">
            Filter{active.length ? ` (${active.length})` : ""}
          </summary>
          <div className="bg-background absolute right-0 z-10 mt-1 w-72 rounded-md border p-3 shadow-md">
            <p className="text-muted-foreground eyebrow mb-1.5">Tags</p>
            <div className="flex max-h-64 flex-wrap gap-1.5 overflow-y-auto">{tagChips}</div>
            <p className="text-muted-foreground eyebrow mt-3 mb-1.5">Series</p>
            {seriesSelect}
          </div>
        </details>
        {sortSelect("bg-transparent text-muted-foreground h-8 border-0 text-sm")}
      </div>
      {active.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {active.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.off}
              className="bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-xs"
              aria-label={`Remove filter ${a.label}`}
            >
              {a.label} ×
            </button>
          ))}
        </div>
      )}
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
        {filterBar}
        <p className="text-muted-foreground mt-1 min-h-4 text-xs" aria-live="polite">
          {indexStatus === "loading" && "Loading full-text index…"}
          {indexStatus === "failed" && "Full-text index unavailable; searching titles and tags."}
        </p>
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
