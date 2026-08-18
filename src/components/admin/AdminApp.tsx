import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AuthorConfig, SeriesRegistry, SiteConfig, TagRegistry } from "@/config/types";

/**
 * Dev-only admin (rendered by src/pages/admin, never built). Each section edits one registry and
 * saves immediately through the Vite dev middleware (src/dev/admin-plugin.ts). No undo — the
 * config files are in git.
 */
export interface AdminAppProps {
  site: SiteConfig;
  author: AuthorConfig;
  series: SeriesRegistry;
  tags: TagRegistry;
  /** All posts visible in dev (published + drafts) for the featured-post picker. */
  /** `date` is the ISO publishedAt (YYYY-MM-DD). */
  posts: { slug: string; title: string; draft: boolean; date: string }[];
}

type SaveState =
  { kind: "idle" } | { kind: "saving" } | { kind: "ok" } | { kind: "error"; message: string };

const ENDPOINT = "/__admin"; // Vite dev middleware (src/dev/admin-plugin.ts); ignores base.

/** POST JSON to the dev middleware and track the result for a status line. */
function useSave() {
  const [state, setState] = useState<SaveState>({ kind: "idle" });
  const save = async (path: string, data: unknown, onOk?: () => void) => {
    setState({ kind: "saving" });
    try {
      const res = await fetch(`${ENDPOINT}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json()) as { error?: string };
      if (res.ok) onOk?.();
      setState(res.ok ? { kind: "ok" } : { kind: "error", message: body.error ?? res.statusText });
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : String(e) });
    }
  };
  return { state, save };
}

/** Collapsible section: native <details>, no JS. Collapsed unless `open`. */
const Panel = ({
  title,
  description,
  open,
  children,
}: {
  title: string;
  description: ReactNode;
  open?: boolean;
  children: ReactNode;
}) => (
  <details open={open} className="bg-card text-card-foreground rounded-xl border shadow-sm">
    <summary className="cursor-pointer px-6 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
      <span className="font-semibold">{title}</span>
      <span className="text-muted-foreground mt-1 block text-sm">{description}</span>
    </summary>
    <div className="flex flex-col gap-4 px-6 pb-6">{children}</div>
  </details>
);

function Section({
  title,
  description,
  state,
  onSave,
  children,
}: {
  title: string;
  description: string;
  state: SaveState;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <Panel title={title} description={description}>
      {children}
      <div className="flex items-center gap-3">
        <Button type="button" onClick={onSave} disabled={state.kind === "saving"}>
          {state.kind === "saving" ? "Saving…" : "Save"}
        </Button>
        <p className="text-sm" role="status" aria-live="polite">
          {state.kind === "ok" && (
            <span className="text-muted-foreground">Saved · dev server will reload</span>
          )}
          {state.kind === "error" && <span className="text-destructive">{state.message}</span>}
        </p>
      </div>
    </Panel>
  );
}

const Field = ({ id, label, children }: { id: string; label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
  </div>
);

function SiteSection({ initial, posts }: { initial: SiteConfig; posts: AdminAppProps["posts"] }) {
  const [site, setSite] = useState(initial);
  const { state, save } = useSave();
  const setNav = (i: number, patch: Partial<SiteConfig["nav"][number]>) =>
    setSite((s) => ({ ...s, nav: s.nav.map((n, j) => (j === i ? { ...n, ...patch } : n)) }));
  const moveNav = (i: number, dir: -1 | 1) =>
    setSite((s) => {
      const nav = [...s.nav];
      const j = i + dir;
      if (j < 0 || j >= nav.length) return s;
      [nav[i], nav[j]] = [nav[j]!, nav[i]!];
      return { ...s, nav };
    });
  return (
    <Section
      title="Site"
      description="Identity, canonical origin, featured post and primary navigation."
      state={state}
      onSave={() => save("/config/site", site)}
    >
      <Field id="site-name" label="Name">
        <Input
          id="site-name"
          value={site.name}
          onChange={(e) => setSite({ ...site, name: e.target.value })}
        />
      </Field>
      <Field id="site-description" label="Description">
        <Textarea
          id="site-description"
          value={site.description}
          onChange={(e) => setSite({ ...site, description: e.target.value })}
        />
      </Field>
      <Field id="site-disclaimer" label="Footer disclaimer">
        <Input
          id="site-disclaimer"
          value={site.disclaimer}
          onChange={(e) => setSite({ ...site, disclaimer: e.target.value })}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="site-url" label="Canonical origin">
          <Input
            id="site-url"
            value={site.url}
            onChange={(e) => setSite({ ...site, url: e.target.value })}
          />
        </Field>
        <Field id="site-locale" label="Locale">
          <Input
            id="site-locale"
            value={site.locale}
            onChange={(e) => setSite({ ...site, locale: e.target.value })}
          />
        </Field>
      </div>
      <Field id="site-featured" label="Featured post">
        <select
          id="site-featured"
          value={site.featuredPost ?? ""}
          onChange={(e) => setSite({ ...site, featuredPost: e.target.value || null })}
          className="border-input bg-background h-8 rounded-md border px-2 text-sm"
        >
          <option value="">Newest published post</option>
          {posts.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title}
              {p.draft ? " (draft)" : ""}
            </option>
          ))}
        </select>
      </Field>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Navigation</legend>
        {site.nav.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-2">
            <Input
              aria-label={`Nav ${i + 1} label`}
              value={item.label}
              onChange={(e) => setNav(i, { label: e.target.value })}
            />
            <Input
              aria-label={`Nav ${i + 1} href`}
              value={item.href}
              onChange={(e) => setNav(i, { href: e.target.value })}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Move nav ${i + 1} up`}
              onClick={() => moveNav(i, -1)}
            >
              ↑
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Move nav ${i + 1} down`}
              onClick={() => moveNav(i, 1)}
            >
              ↓
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Remove nav ${i + 1}`}
              onClick={() => setSite({ ...site, nav: site.nav.filter((_, j) => j !== i) })}
            >
              ×
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setSite({ ...site, nav: [...site.nav, { label: "", href: "/" }] })}
        >
          Add nav item
        </Button>
      </fieldset>
    </Section>
  );
}

function AuthorSection({ initial }: { initial: AuthorConfig }) {
  const [author, setAuthor] = useState(initial);
  const { state, save } = useSave();
  const links = Object.entries(author.links);
  const setLink = (i: number, key: string, url: string) =>
    setAuthor((a) => ({
      ...a,
      links: Object.fromEntries(links.map((kv, j) => (j === i ? [key, url] : kv))),
    }));
  return (
    <Section
      title="Author"
      description="Byline, tagline and personal links (footer, about header, Person JSON-LD)."
      state={state}
      onSave={() => save("/config/author", author)}
    >
      <Field id="author-name" label="Name">
        <Input
          id="author-name"
          value={author.name}
          onChange={(e) => setAuthor({ ...author, name: e.target.value })}
        />
      </Field>
      <Field id="author-tagline" label="Tagline">
        <Input
          id="author-tagline"
          value={author.tagline}
          onChange={(e) => setAuthor({ ...author, tagline: e.target.value })}
        />
      </Field>
      <Field id="author-location" label="Location">
        <Input
          id="author-location"
          value={author.location}
          onChange={(e) => setAuthor({ ...author, location: e.target.value })}
        />
      </Field>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Links (key → URL)</legend>
        {links.map(([key, url], i) => (
          <div key={i} className="grid grid-cols-[8rem_1fr_auto] items-center gap-2">
            <Input
              aria-label={`Link ${i + 1} key`}
              value={key}
              onChange={(e) => setLink(i, e.target.value, url)}
            />
            <Input
              aria-label={`Link ${i + 1} URL`}
              value={url}
              onChange={(e) => setLink(i, key, e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Remove link ${key}`}
              onClick={() =>
                setAuthor({ ...author, links: Object.fromEntries(links.filter((_, j) => j !== i)) })
              }
            >
              ×
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setAuthor({ ...author, links: { ...author.links, newlink: "https://" } })}
        >
          Add link
        </Button>
      </fieldset>
    </Section>
  );
}

function RegistrySection<T extends Record<string, Record<string, unknown>>>({
  name,
  title,
  description,
  initial,
  fields,
}: {
  name: "series" | "tags";
  title: string;
  description: string;
  initial: T;
  fields: (keyof T[string] & string)[];
}) {
  const [reg, setReg] = useState<Record<string, Record<string, unknown>>>(initial);
  const [newId, setNewId] = useState("");
  const { state, save } = useSave();
  return (
    <Section
      title={title}
      description={description}
      state={state}
      onSave={() => save(`/config/${name}`, reg)}
    >
      {Object.entries(reg).map(([id, entry]) => (
        <div key={id} className="flex flex-col gap-2 rounded-md border p-3">
          <div className="flex items-center justify-between gap-2">
            <code className="text-sm">{id}</code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Delete ${id}`}
              onClick={() =>
                setReg(Object.fromEntries(Object.entries(reg).filter(([k]) => k !== id)))
              }
            >
              Delete
            </Button>
          </div>
          {fields.map((f) => (
            <Field key={f} id={`${name}-${id}-${f}`} label={f}>
              {f === "description" ? (
                <Textarea
                  id={`${name}-${id}-${f}`}
                  value={String(entry[f] ?? "")}
                  onChange={(e) => setReg({ ...reg, [id]: { ...entry, [f]: e.target.value } })}
                />
              ) : (
                <Input
                  id={`${name}-${id}-${f}`}
                  value={String(entry[f] ?? "")}
                  onChange={(e) => setReg({ ...reg, [id]: { ...entry, [f]: e.target.value } })}
                />
              )}
            </Field>
          ))}
        </div>
      ))}
      <div className="flex items-end gap-2">
        <Field id={`${name}-new-id`} label="New id (kebab-case, immutable once created)">
          <Input
            id={`${name}-new-id`}
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            placeholder="my-new-id"
          />
        </Field>
        <Button
          type="button"
          variant="outline"
          disabled={!newId || newId in reg}
          onClick={() => {
            setReg({ ...reg, [newId]: Object.fromEntries(fields.map((f) => [f, ""])) });
            setNewId("");
          }}
        >
          Add
        </Button>
      </div>
    </Section>
  );
}

/**
 * Per-post actions: publish/unpublish (rewrites `draft:` in the post's frontmatter via
 * `<endpoint>/draft/<id>`) and "set featured" (saves site config with `featuredPost`).
 */
function PostsSection({ site, posts }: { site: SiteConfig; posts: AdminAppProps["posts"] }) {
  const [rows, setRows] = useState(posts);
  const [featured, setFeatured] = useState(site.featuredPost);
  const { state: status, save } = useSave();
  const toggleDraft = (slug: string, draft: boolean) =>
    save(`/draft/${slug}`, { draft }, () =>
      setRows((r) => r.map((p) => (p.slug === slug ? { ...p, draft } : p))),
    );
  const setFeaturedPost = (slug: string | null) =>
    save("/config/site", { ...site, featuredPost: slug }, () => setFeatured(slug));
  return (
    <Panel
      title="Posts"
      open
      description={
        <>
          Publish flips <code>draft</code> in the post&apos;s frontmatter and stamps{" "}
          <code>publishedAt</code> with today; unpublish only flips <code>draft</code>. Featured
          writes <code>site.featuredPost</code>.
        </>
      }
    >
      {rows.map((p) => (
        <div key={p.slug} className="flex flex-wrap items-center gap-2 rounded-md border p-3">
          <span className="min-w-0 grow">
            {p.title}{" "}
            <span className="text-muted-foreground text-sm">
              {p.date} · {p.draft ? "draft" : "published"}
              {featured === p.slug ? " · featured" : ""}
            </span>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={status.kind === "saving"}
            onClick={() => toggleDraft(p.slug, !p.draft)}
          >
            {p.draft ? "Publish" : "Unpublish"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={status.kind === "saving" || featured === p.slug}
            onClick={() => setFeaturedPost(p.slug)}
          >
            Set featured
          </Button>
        </div>
      ))}
      <p className="text-sm" role="status" aria-live="polite">
        {status.kind === "ok" && (
          <span className="text-muted-foreground">Saved · dev server will reload</span>
        )}
        {status.kind === "error" && <span className="text-destructive">{status.message}</span>}
      </p>
    </Panel>
  );
}

export default function AdminApp({ site, author, series, tags, posts }: AdminAppProps) {
  return (
    <div className="flex flex-col gap-8">
      <PostsSection site={site} posts={posts} />
      <SiteSection initial={site} posts={posts} />
      <AuthorSection initial={author} />
      <RegistrySection
        name="series"
        title="Series"
        description="id → title, description. Deleting a series still used by a post is refused."
        initial={series}
        fields={["title", "description"]}
      />
      <RegistrySection
        name="tags"
        title="Tags"
        description="id → label. Deleting a tag still used by a post is refused."
        initial={tags}
        fields={["label"]}
      />
    </div>
  );
}
