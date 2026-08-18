/**
 * Dev-only Vite plugin backing /admin/: `POST /__admin/config/<name>` with a JSON body validates
 * against the registry schema, refuses to delete a series/tag still used by a post, then writes
 * src/config/<name>.ts through the template writer. `POST /__admin/draft/<postId>` with
 * `{ draft: boolean }` rewrites that post's `draft:` frontmatter line (stamping `publishedAt`
 * with today when publishing). `apply: "serve"` — never part of a build.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Plugin } from "vite";
import { CONFIG_NAMES, configSchemas, type ConfigName } from "../config/types.ts";
import { configPath, writeConfig } from "./config-writer.ts";
import { SLUG_PATTERN } from "../lib/reserved-slugs.ts";

const isConfigName = (s: string): s is ConfigName =>
  (CONFIG_NAMES as readonly string[]).includes(s);

/** Posts (directory ids) whose frontmatter references any of the given series/tag ids. */
async function postsUsing(kind: "series" | "tags", ids: string[], root: string) {
  if (!ids.length) return {} as Record<string, string[]>;
  const dir = join(root, "src/content/posts");
  const used: Record<string, string[]> = {};
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const src = await readFile(join(dir, entry.name, "index.mdx"), "utf8").catch(() => null);
    if (src === null) continue;
    const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
    for (const id of ids) {
      const hit =
        kind === "series"
          ? new RegExp(`^series:\\s*["']?${id}["']?\\s*$`, "m").test(fm)
          : new RegExp(`^tags:\\s*\\[[^\\]]*\\b${id}\\b[^\\]]*\\]`, "m").test(fm) ||
            new RegExp(`^\\s*-\\s*["']?${id}["']?\\s*$`, "m").test(fm);
      if (hit) (used[id] ??= []).push(entry.name);
    }
  }
  return used;
}

async function readBody(req: import("node:http").IncomingMessage): Promise<string> {
  let body = "";
  for await (const chunk of req) body += chunk;
  return body;
}

export function adminPlugin(): Plugin {
  return {
    name: "always-shippable-admin",
    apply: "serve",
    configureServer(server) {
      const sender =
        (res: import("node:http").ServerResponse) => (status: number, payload: unknown) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(payload));
        };
      const pathId = (req: import("node:http").IncomingMessage) =>
        (req.url ?? "").replace(/^\//, "").split(/[?#]/)[0] ?? "";

      server.middlewares.use("/__admin/draft", async (req, res) => {
        const send = sender(res);
        const id = pathId(req);
        if (req.method !== "POST") return send(405, { error: "POST only" });
        if (!SLUG_PATTERN.test(id)) return send(400, { error: "bad post id" });
        try {
          const { draft } = JSON.parse(await readBody(req)) as { draft?: unknown };
          if (typeof draft !== "boolean") {
            return send(400, { error: "body must be { draft: boolean }" });
          }
          const file = join(server.config.root, "src/content/posts", id, "index.mdx");
          const src = await readFile(file, "utf8").catch(() => null);
          if (src === null) return send(404, { error: `no post "${id}"` });
          const [, fm, rest] = src.match(/^---\r?\n([\s\S]*?)\r?\n---([\s\S]*)$/) ?? [];
          if (fm === undefined) return send(500, { error: `no frontmatter block in ${id}` });
          const nl = src.includes("\r\n") ? "\r\n" : "\n";
          // (\r?)$ keeps the file's line endings intact.
          let next = /^draft:.*$/m.test(fm)
            ? fm.replace(/^draft:.*?(\r?)$/m, `draft: ${draft}$1`)
            : `${fm}${nl}draft: ${draft}`;
          if (!draft) {
            const today = new Date().toISOString().slice(0, 10);
            next = next.replace(/^publishedAt:.*?(\r?)$/m, `publishedAt: ${today}$1`);
          }
          await writeFile(file, `---${nl}${next}${nl}---${rest}`);
          server.config.logger.info(`[admin] set draft: ${draft} on ${id}`);
          return send(200, { ok: true });
        } catch (e) {
          return send(500, { error: e instanceof Error ? e.message : String(e) });
        }
      });

      server.middlewares.use("/__admin/config", async (req, res) => {
        const send = sender(res);
        const name = pathId(req);
        if (req.method !== "POST") return send(405, { error: "POST only" });
        if (!isConfigName(name)) return send(404, { error: `unknown config "${name}"` });
        try {
          const data: unknown = JSON.parse(await readBody(req));
          const parsed = configSchemas[name].safeParse(data);
          if (!parsed.success) {
            return send(400, {
              error: parsed.error.issues
                .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
                .join("; "),
            });
          }
          if (name === "series" || name === "tags") {
            // Current ids from the file on disk (a static import would be stale after a write).
            const src = await readFile(configPath(name), "utf8");
            const before = [...src.matchAll(/^ {2}"?([a-z0-9-]+)"?: \{/gm)].map((m) => m[1]!);
            const removed = before.filter((id) => !(id in (parsed.data as object)));
            const used = await postsUsing(name, removed, server.config.root);
            const blocked = Object.entries(used);
            if (blocked.length) {
              return send(409, {
                error: `cannot delete ${name} still used by posts: ${blocked
                  .map(([id, posts]) => `"${id}" (${posts.join(", ")})`)
                  .join("; ")} → remove it from those posts first`,
              });
            }
          }
          const text = await writeConfig(name, parsed.data);
          server.config.logger.info(`[admin] wrote src/config/${name}.ts`);
          return send(200, { ok: true, bytes: text.length });
        } catch (e) {
          return send(500, { error: e instanceof Error ? e.message : String(e) });
        }
      });
    },
  };
}
