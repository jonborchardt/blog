// One-off/dev helper: rewrite src/config/*.ts through the admin writer template.
// Usage: node scripts/regen-config.mts   (Node 24 runs TS directly)
import { writeConfig } from "../src/dev/config-writer.ts";
import { site } from "../src/config/site.ts";
import { author } from "../src/config/author.ts";
import { series } from "../src/config/series.ts";
import { tags } from "../src/config/tags.ts";

await writeConfig("site", site);
await writeConfig("author", author);
await writeConfig("series", series);
await writeConfig("tags", tags);
console.log("config regenerated");
