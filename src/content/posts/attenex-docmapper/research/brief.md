# Domain brief — Attenex DocMapper

Compiled 2026-08-20 from the authority chain, in precedence order:

1. `E:\github2\Labs\_agent\INTERVIEW.md` (Jon's own answers)
2. `E:\github2\Labs\CLAUDE.md`
3. `E:\github2\Labs\older\CLAUDE.md` (primary authority for this post)
4. `E:\github2\resume\linkedin\` — `experience/attenex.txt`, `patents.txt`
5. The artifacts in `E:\github2\Labs\older\Attenex\` — chiefly `Docmapper.doc`, the
   _Attenex Patterns Document Mapper Reviewer Guide, Version 3.5_, plus the screenshots

Nothing outside this chain is asserted as fact in the post. Where the artifacts and my memory
disagree, or where an artifact is ambiguous, the post says so in the prose.

## The story

A new CS graduate joins a Seattle startup in August 2001 as one of its first engineers and spends
six years building one screen: a 3D map of a legal document collection. It ends up being the
company's flagship and its market differentiator, and it produces five granted patents with his
name on them. The interesting part is not the graphics. It is that the map changed the *unit of
work* in document review — from "read one document, decide" to "look at a cluster's concepts,
decide about all of it" — and that is where the 10x came from.

## Tenure and role (authority: resume `experience/attenex.txt`, `older/CLAUDE.md`, INTERVIEW.md)

- Attenex Corporation, total 6 years 3 months.
- Software Engineer, August 2001 – July 2006 (5 years). Joined straight out of the University of
  Washington Computer Science program as one of the company's first engineers.
- Senior Software Engineer, July 2006 – October 2007 (1 year 4 months).
- Built the core 3D visualization engine that became the Document Mapper.
- Led the migration from OpenGL to DirectX.
- Later owned the Document Mapper client end to end — architecture, features, performance, quality.
- Authored 5 patents for novel visualization interfaces.
- Profiled and tuned application and database performance for users reviewing millions of documents.
- Technologies listed: C++, C#, DirectX, OpenGL, MFC, SQL.
- Skip Walter (VP Engineering) wrote: "Jon has matured during his six years evolving from a
  competent programmer to a senior software engineer... I highly recommend Jon for senior software
  engineering positions."
- 10x speed improvement over traditional document review methods (stated in both the resume
  experience file and `older/CLAUDE.md`).
- INTERVIEW.md Q1: DocMapper is one of the three projects Jon is proudest of (with the Audience
  Planner and sell-side targeting).
- INTERVIEW.md Q21: every one of these tools was dreamt up by Jon in his 20% time; several,
  DocMapper among them, became the flagship product for the company.

## Patents (authority: `patents.txt`, `older/CLAUDE.md`)

Five granted patents attributed to this work:

| Number      | Title (as recorded in patents.txt)                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| US 7,356,777 | System and method for providing a dynamic user interface for a dense three-dimensional scene                                    |
| US 7,404,151 | System and method for providing a dynamic user interface for a dense three-dimensional scene                                    |
| US 8,056,019 | System and method for providing a dynamic user interface including a plurality of logical layers                                |
| US 7,870,507 | System and method for providing a dynamic user interface for a dense three-dimensional scene with a navigation assistance panel |
| US 8,402,395 | System and method for providing a dynamic user interface for a dense three-dimensional scene with a plurality of compasses      |

**Caveat used in the post:** `patents.txt` also records "Issued" dates for these (2005–2011) that
are inconsistent with the patent numbers themselves — several list an issue date years before the
number would have been granted. They are most likely filing dates mislabelled. The post therefore
cites numbers and titles only, and says so.

Filed-but-listed-separately, same lineage, also in `patents.txt`:

- CA WO/06081292, "Providing a dynamic user interface for clusters and cluster spines", filed Jan 26, 2006
- CA WO/07089588, "Providing a dynamic user interface for a dense three-dimensional scene", filed Jan 26, 2007
- US 2012-0050329, "System And Method For Providing A User-Adjustable Display Of Clusters And Text", filed Nov 7, 2011
- US 13/831,824, "Computer-Implemented System and Method for Displaying Clusters Via Dynamic User Interface", filed Mar 15, 2013

## The product, from the Reviewer Guide (authority: `Docmapper.doc`)

Document title: _Attenex Patterns — Document Mapper Reviewer Guide, Version 3.5_. Copyright
2001–2006, Attenex Corporation, 925 Fourth Avenue, Suite 1700, Seattle, WA 98104-1125.

Purpose, in the guide's own words: "Document Mapper allows you to quickly review and categorize a
large body of documents all at once. With Document Mapper, you see a single display of all your
assignment's documents, clustered by similarity of subject matter."

### Vocabulary (verbatim definitions)

- **Assignment** — the group of documents you review in Document Mapper.
- **Document** — an individual file or e-mail message.
- **Concept** — "a noun or noun phrase in the text of a document". Patterns analyses a document to
  identify its concepts. "Think of each document as having a concept profile that is like an
  extended 'subject line' describing its content."
- **Cluster** — "a temporary grouping of documents based on the similarity of their concepts".
- **Spine** — "a line of clusters that share a common concept. A given cluster may be at the
  intersection of multiple spines."
- **Marking** — a category such as "Responsive" or "Non-responsive" attached to a document or
  cluster. One category at a time; unmark before re-marking.
- **Document tag** — an optional secondary code, organised into tag lists, that can be restricted
  per marking category.

### The cluster view (the radial map)

- Every document is a dot. The dot's colour is its marking category.
- Each cluster is drawn with a ring around it. The documents inside are "arranged in a spiral,
  based on their similarity to the center document".
- Clusters with one or more concepts in common are connected by lines called spines. Hovering a
  cluster thickens its spine, revealing the related clusters. Selecting a cluster at a spine
  intersection thickens all of its spines and shows their labels.
- Hovering shows a **cluster label**: the top concepts that brought the documents together plus the
  document count. Its top line is the **spine concept label**, written with dashes on both sides.
- Selecting a cluster shows an **extended cluster label** including the full document list, centre
  document first.
- The **concept compass ring** surrounds the documents. It displays the spine concepts of the
  longest spines, with concept pointers indicating where those spines lie. Configurable via Tools →
  Display View Options.
- A concept can be dragged off the compass into the **garbage can / concept trash bin** in the
  lower-left corner. Removed concepts are excluded from the next reclustering, persist across
  restarts, and can be restored from the bin.
- **Document counts**, lower left: selected (red), highlighted (yellow), marked out of total, and
  the marked percentage.
- **Set-aside trays** run down the right side. By default all unmarked documents stay in the main
  region and marked documents move to the trays. Which categories go to the trays is configurable
  (Tools → Set-aside Trays); a reviewer might set aside *unmarked* documents instead, to see how
  the marked ones cluster.
- The **Sweep** button moves newly marked documents to the trays without changing the layout.
- Unclustered documents appear as squares on the left of the cluster region:
  - **Zero Concepts** — no concepts at all (no text, or unopenable: graphics, password-protected).
  - **Limited Concepts** — few meaningful concepts, could not join a cluster; tend to be short.
  - **Miscellaneous Files** — more concepts, but not similar enough to anything; tend to be long.
  - **To be Reclustered** — created when you unmark documents in the trays and Sweep.
- Clusters too unlike everything else to sit on a spine appear in a row at the bottom.

### Reclustering — four kinds

- **Recluster** — all documents in the main region, by their concepts.
- **Recluster on Document** — cluster around a selected document; non-matches go to a "No Matches"
  square left of the compass. The seed document is marked with a white X.
- **Recluster on Concepts** — cluster the documents containing selected concepts or their stemmed
  terms.
- **Recluster Highlighted** — cluster only the highlighted (search-hit) documents.

Each recluster sweeps marked documents to the trays, re-lays out what remains, and updates the
Cluster Folders view.

### Other views

- **Cluster Folders** — the same clusters and spines as a folder tree. Folder groups are labelled
  with their spine concept and document count; folders with their top three cluster concepts and
  count. Sortable by Name or by Layout (layout order mirrors the map). Bottom groups: Other, Not
  Clustered, Set-Aside Trays. Highlighted contents turn the folder icon yellow.
- **Bird's Eye** — a small always-whole-map overview with a rectangle showing the current viewport;
  click to jump.
- **Timeline** — documents distributed across time by sent/received/last-modified date, or an
  appointment's start time. Drag to highlight a time range; hover a bar for its dates and count.
- **Social Network View** — participants (people, addresses, domains) from To/From/Cc/Bcc and
  appointment organiser/attendee fields. Circle size = volume. Grey line = one-way exchange, green
  = two-way, yellow = contains highlighted items, red = contains selected items. Domain mode
  collapses participants into organisations. Special searches: Find Single Exchanges, Find Zero
  Received (often auto-generated mail), Find Zero Sent (often distribution lists).
- **Document Viewer** — three panes: document lists (Cluster tab / Search Results tab), document
  contents (Formatted view or Text & Hits view), and the compound-e-mail component list. Requires
  Internet Explorer plus a preview utility such as Quick View Plus. Lists page at 1,000 documents.

### Search

- Clicking a concept in a list or on the compass highlights matching documents with yellow rings.
- The quick Search field and the Advanced Search dialog both accept up to 32,000 characters,
  including Boolean connectors (AND, OR, NOT, proximity such as W/4).
- Boolean or Natural Language search types; noise words differ between them.
- Metadata field syntax: Addressee, From, Sent, Subject, Cc, Bcc, Body — e.g. `Addressee contains *Bill*`.
- Special characters: `?` single character, `*` any number, `%` fuzzy (misspellings), `~~` numeric
  ranges (`12~~16`).
- Searching examines both the concepts and the full text by default; can be limited to text only,
  to annotated files, to filenames/types, to marking categories, or to document tags.

### Compound e-mail

An e-mail with attachments is split: the body and every attachment become separate documents, so
each clusters on its own concepts. An e-mail with two attachments is three dots. Document Mapper
computes a **production mark** for the whole compound item from its components' marks; that
production mark governs export.

### The guide's own review tips (this is where the 10x lives)

- Decide what kind of review you are doing first (gross irrelevancy, relevancy, a specific subset,
  privilege) because that changes the technique.
- Verbatim: reviewers eliminating non-responsive documents "may decide to not look for the
  proverbial 'needle in a haystack', but instead look for entire 'haystacks with no needles'". In a
  first pass they mark obviously non-responsive clusters fast; "if they cannot make a decision on a
  cluster within a few seconds of looking at its concepts, they leave it unmarked, and move on".
  Then recluster and repeat.
- Verbatim: "View an item's Active Concepts list to see its essence... If possible, use this concept
  profile to categorize the cluster or document, rather than trying to read or scan all of its
  individual documents."
- Remove unhelpful concepts — days of the week, signature-file content, phone numbers — and
  recluster for a more meaningful arrangement.

### Third parties named in the guide's front matter

- **LinguistX Platform** from Inxight Software, Inc. (linguistic analysis / concept extraction).
- **dtSearch** from dtSearch Corp. (full-text search).
- A BSD notice for "Copyright (c) 2000-2005 Chih-Chung Chang and Chih-Jen Lin" — the libsvm
  support-vector-machine library.
- Northwoods Software Corporation is listed among the manufacturers.
- The guide states Attenex Patterns is protected by U.S. Patents 6,745,197; 6,778,995; 6,820,081;
  6,888,548; 6,978,274 and patents pending. These are the company's earlier patents and are
  **distinct** from the five listed above; nothing in the authority chain says whose they are, so
  the post does not attribute them.

## Screenshots (authority: the files themselves, plus `older/CLAUDE.md`)

- `screen.png` (814×643) — the real cluster view. Demo dataset is about diamonds: the visible
  Cluster Folders tree lists spine groups `ring (13)`, `stone (15)`, `carat (6)`, `noise (9)`,
  `Guy (12)`, `work (11)`, `Diamond sheetrock (9)`, `parking (12)`, `Matt Collins (10)`,
  `bartender problem (6)`, `dessert (8)`, `game (13)`, `diamondback (11)`, `yankee (9)`,
  `johnson (7)`, then `Other (46)`, `Not Clustered (86)` (Zero Concepts 2, Limited Concepts 50,
  Miscellaneous 34) and `Set-Aside Trays (32)`. Sub-folders show three concepts each, e.g.
  "ring, engagement ring, wedding band (4)" and "stone, Diamond advice, setting (5)". Sorted by
  Layout. Compass labels visible in the map: `stone`, `ring`, `carat` (in yellow — selected),
  `parking`. The hero is a crop of the map region of this file.
- `birds-eye.png` — the Bird's Eye panel over a zoomed-in view; three clusters on one spine, the
  centre one small, each a ring of blue dots.
- `timeline.png` — the Timeline panel, May 2004 through June 2005, a low background of purple bars
  with a spike in May–June 2005 and yellow (highlighted) segments at the base of the later bars.
- `set-aside-trays.png` — three trays labelled by the concepts `network` and `coffee`, dots stacked
  in each in cyan, white and magenta.
- `DocMapperNBC20080213.jpg` — a capture of NBC's video player. The story blurb reads: "White House
  says e-mails missing — April 13, 2007: The Senate Judiciary Committee, investigating the firing
  of eight federal prosecutors, is questioning the White House about e-mails the Bush
  administration says are missing. NBC's Kelly O'Donnell reports. Nightly News". The thumbnail
  shows a monitor displaying a dark UI with a green arc and rings of blue dots.
  **Caveat used in the post:** `older/CLAUDE.md` reads the filename as dating a build to Feb 2008.
  The story itself is dated April 2007. These are not in conflict — Feb 2008 is most plausibly when
  the clipping was saved, not when the segment aired — so the post says exactly that and claims
  nothing about a build date. Separately, nothing in the chain confirms that the software on the
  monitor is DocMapper, so the post presents it as a saved clipping and says plainly what is and is
  not verifiable.

## Terminology caveats for the writing

- The product family is **Attenex Patterns**; **Document Mapper** (informally DocMapper) is the
  client. Do not call the whole platform DocMapper.
- "3D" is what the patents and the resume call it; the screenshots show a depth-cued 2D-looking
  plane. Say what the artifacts support and do not oversell the dimensionality.
- Marking categories are examples in the guide, not a fixed list — "your review leader will set up
  the marking categories for a matter".
- The demo dataset in the screenshots is fake, like everything else in the portfolio
  (INTERVIEW.md Q4).

## Proposed visuals

1. **Anatomy of the cluster view** (hand-drawn pictorial SVG). Conceptual. States and
   relationships: concept compass ring carrying the top spine concepts with pointers; spines
   radiating inward as lines of clusters; each cluster a ring; a magnified cluster showing the
   documents as dots spiralling out from the centre document. Labels must use the guide's own
   words: concept compass, spine, cluster, centre document. One concept drawn in yellow, because a
   selected spine concept is shown in yellow (and `carat` is yellow in `screen.png`).
2. **The review loop** (hand-drawn pictorial SVG). Three states, top to bottom: everything unmarked
   and clustered; marked clusters swept to the set-aside trays; the remainder reclustered into a
   smaller map. Transitions labelled with the actual buttons: Sweep, Recluster. No counts — the
   guide gives none, and inventing them would be a fabrication.

Neither visual gets a `data` table: both are schematic, and no authoritative numbers underlie them.
