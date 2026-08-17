/** Site identity, navigation, and SEO defaults. Edited by humans or the future /admin/ tool. */
export const site = {
  name: "Always Shippable",
  description:
    "Thoughts on engineering systems, product design, AI tooling, and keeping things always shippable.",
  /** Canonical production origin (no trailing slash). The `/blog` base is set in astro.config. */
  url: "https://jonborchardt.github.io",
  locale: "en",
  /** Slug of the post to feature on the homepage. `null` = newest published post. */
  featuredPost: null as string | null,
  nav: [
    { label: "Archive", href: "/archive/" },
    { label: "Series", href: "/series/" },
    { label: "About", href: "/about/" },
  ],
} as const;
