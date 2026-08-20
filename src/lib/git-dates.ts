/**
 * Last commit date of a file, for git-derived "Updated" dates. Build-time only. Returns undefined
 * outside a git checkout or for uncommitted files (new drafts). CI must check out full history —
 * actions/checkout with fetch-depth: 0 — or every file reports the single shallow commit's date.
 */
import { execFileSync } from "node:child_process";

const cache = new Map<string, Date | undefined>();

export function gitLastModified(file: string): Date | undefined {
  if (!cache.has(file)) {
    let date: Date | undefined;
    try {
      const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
        encoding: "utf8",
      }).trim();
      date = out ? new Date(out) : undefined;
    } catch {
      date = undefined;
    }
    cache.set(file, date);
  }
  return cache.get(file);
}
