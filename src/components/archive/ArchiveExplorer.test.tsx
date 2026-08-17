import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ArchiveExplorer from "./ArchiveExplorer";
import type { SearchDocMeta } from "@/lib/search";

const docs: SearchDocMeta[] = [
  {
    slug: "a",
    url: "/blog/a/",
    title: "Astro islands",
    description: "About islands.",
    publishedAt: "2026-08-18",
    tags: [{ id: "meta", label: "Meta" }],
    readingTime: 2,
    hero: { src: "/blog/_astro/a.webp", alt: "A" },
  },
  {
    slug: "b",
    url: "/blog/b/",
    title: "Building blocks",
    description: "About blocks.",
    publishedAt: "2026-08-17",
    tags: [
      { id: "meta", label: "Meta" },
      { id: "engineering", label: "Engineering" },
    ],
    readingTime: 4,
    hero: { src: "/blog/_astro/b.webp", alt: "B" },
  },
];
const props = {
  docs,
  tags: [
    { id: "meta", label: "Meta" },
    { id: "engineering", label: "Engineering" },
  ],
  series: [],
  indexUrl: "/blog/search-index.json",
};

describe("ArchiveExplorer", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(
              docs.map((d) => ({ ...d, headings: [], body: `body text for ${d.slug}` })),
            ),
        }),
      ),
    );
    history.replaceState(null, "", "/blog/archive/");
  });

  it("lists everything, filters by typing, and clears", async () => {
    render(<ArchiveExplorer {...props} />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
    const input = screen.getByRole("searchbox", { name: "Search posts" });
    fireEvent.change(input, { target: { value: "astro" } });
    expect(await screen.findAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("1 of 2 posts · matching “astro”");
    fireEvent.click(screen.getAllByRole("button", { name: "Clear filters" })[0]!);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
  });

  it("toggles tag chips and shows the empty state", () => {
    render(<ArchiveExplorer {...props} />);
    const chip = screen.getAllByRole("button", { name: "Engineering", pressed: false })[0]!;
    fireEvent.click(chip);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zzz" } });
    expect(screen.getByText("No posts match.")).toBeInTheDocument();
  });

  it("reads initial state from the URL", () => {
    history.replaceState(null, "", "/blog/archive/?tag=engineering&sort=oldest");
    render(<ArchiveExplorer {...props} />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("tagged Engineering");
  });
});
