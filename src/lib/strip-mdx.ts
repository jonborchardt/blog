/** Reduce MDX source to searchable plain text (used by the archive search index). */
const BODY_CAP = 20_000;

export function stripMdx(source: string): string {
  // Split on fences so ESM lines are only stripped outside code (code may legitimately export).
  const parts = source.replace(/^---[\s\S]*?---\s*/, "").split(/^```[^\n]*$/m);
  const text = parts
    .map((part, i) => (i % 2 === 0 ? part.replace(/^(import|export)\b.*$/gm, "") : part))
    .join("\n");
  return (
    text
      // display/inline math markers (keep the TeX text)
      .replace(/\$\$?/g, " ")
      // JSX/HTML tags (opening, closing, self-closing) — keep their inner text
      .replace(/<\/?[A-Za-z][^>]*>/g, " ")
      // MDX expressions
      .replace(/\{[^}]*\}/g, " ")
      // images: keep alt text; links: keep link text
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      // markdown syntax characters and table pipes/rules
      .replace(/^[ \t]*[#>*+-]+[ \t]+/gm, "")
      .replace(/^[ \t]*\d+\.[ \t]+/gm, "")
      .replace(/^\|?[\s:|-]+\|?$/gm, "")
      .replace(/[|*_~`]/g, " ")
      // collapse whitespace
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, BODY_CAP)
  );
}
