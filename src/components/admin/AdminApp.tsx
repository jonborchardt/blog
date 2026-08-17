import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AuthorConfig,
  ConfigName,
  SeriesRegistry,
  SiteConfig,
  TagRegistry,
} from "@/config/types";

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
  posts: { slug: string; title: string; draft: boolean }[];
  /** Base-prefixed dev endpoint root, e.g. "/blog/__admin/config" (Vite middleware ignores base). */
  endpoint: string;
}

type SaveState =
  { kind: "idle" } | { kind: "saving" } | { kind: "ok" } | { kind: "error"; message: string };

function useSave(endpoint: string, name: ConfigName) {
  const [state, setState] = useState<SaveState>({ kind: "idle" });
  const save = async (data: unknown) => {
    setState({ kind: "saving" });
    try {
      const res = await fetch(`${endpoint}/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      setState(res.ok ? { kind: "ok" } : { kind: "error", message: body.error ?? res.statusText });
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : String(e) });
    }
  };
  return { state, save };
}

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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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
      </CardContent>
    </Card>
  );
}

const Field = ({ id, label, children }: { id: string; label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
  </div>
);

function SiteSection({
  initial,
  posts,
  endpoint,
}: {
  initial: SiteConfig;
  posts: AdminAppProps["posts"];
  endpoint: string;
}) {
  const [site, setSite] = useState(initial);
  const { state, save } = useSave(endpoint, "site");
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
      onSave={() => save(site)}
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

function AuthorSection({ initial, endpoint }: { initial: AuthorConfig; endpoint: string }) {
  const [author, setAuthor] = useState(initial);
  const { state, save } = useSave(endpoint, "author");
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
      onSave={() => save(author)}
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

function RegistrySection<T extends Record<string, Record<string, string>>>({
  name,
  title,
  description,
  initial,
  fields,
  endpoint,
}: {
  name: "series" | "tags";
  title: string;
  description: string;
  initial: T;
  fields: (keyof T[string] & string)[];
  endpoint: string;
}) {
  const [reg, setReg] = useState<Record<string, Record<string, string>>>(initial);
  const [newId, setNewId] = useState("");
  const { state, save } = useSave(endpoint, name);
  return (
    <Section title={title} description={description} state={state} onSave={() => save(reg)}>
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
                  value={entry[f] ?? ""}
                  onChange={(e) => setReg({ ...reg, [id]: { ...entry, [f]: e.target.value } })}
                />
              ) : (
                <Input
                  id={`${name}-${id}-${f}`}
                  value={entry[f] ?? ""}
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

export default function AdminApp({ site, author, series, tags, posts, endpoint }: AdminAppProps) {
  return (
    <div className="flex flex-col gap-8">
      <SiteSection initial={site} posts={posts} endpoint={endpoint} />
      <AuthorSection initial={author} endpoint={endpoint} />
      <RegistrySection
        name="series"
        title="Series"
        description="id → title, description. Deleting a series still used by a post is refused."
        initial={series}
        fields={["title", "description"]}
        endpoint={endpoint}
      />
      <RegistrySection
        name="tags"
        title="Tags"
        description="id → label. Deleting a tag still used by a post is refused."
        initial={tags}
        fields={["label"]}
        endpoint={endpoint}
      />
    </div>
  );
}
