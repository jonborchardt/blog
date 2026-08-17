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
