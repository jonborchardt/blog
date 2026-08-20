/**
 * Frontmatter dates are calendar dates (YYYY-MM-DD) parsed as UTC midnight.
 * Always format them in UTC so the printed day never shifts with the build machine's timezone.
 */
export function formatDate(date: Date, style: "medium" | "long" = "medium"): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: style, timeZone: "UTC" }).format(date);
}

/** `YYYY-MM-DD`, for `<time datetime>` attributes. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * The "Updated" date a post shows. Explicit frontmatter always wins; a git-derived date only
 * counts when meaningfully after publish (≥ 7 days), so the launch-week fix window stays quiet.
 */
const MEANINGFUL_UPDATE_MS = 7 * 24 * 3_600_000;
export function effectiveUpdatedAt(
  publishedAt: Date,
  frontmatter: Date | undefined,
  gitDate: Date | undefined,
): Date | undefined {
  if (frontmatter) return frontmatter;
  if (gitDate && gitDate.getTime() - publishedAt.getTime() >= MEANINGFUL_UPDATE_MS) return gitDate;
  return undefined;
}
