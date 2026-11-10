# PA-Consulting-NewCo-Centre-of-Excellence

## Building the site

One-time setup:

```
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Rebuild after any content change:

```
.venv/bin/python build_netlify_bundle.py && .venv/bin/python build_articles.py
```

## Content schema

All site content lives as Markdown files with YAML-ish frontmatter under `content/`,
in three folders: `emerging-practices/`, `case-studies/`, and `events/`. Each file is
parsed by `build_articles.py` — required fields are read directly and will raise a
`KeyError` if missing; optional fields are read with `.get(...)` and simply produce no
output (no section rendered, or a default value) when absent.

Everything after the closing `---` is the article/event body, written as ordinary
Markdown (headings, `**bold**`, `_italic_`, `[links](url)`, lists, blockquotes, code —
rendered via Python-Markdown with the `extra` and `sane_lists` extensions).

Some fields below are lists. Because frontmatter here is flat `key: value` lines (no
nested YAML), list-shaped fields are a single line using delimiters instead:
- `;` separates list items (e.g. multiple agenda entries, speakers, themes, quotes,
  downloads).
- `|` separates the two parts of a speaker entry: `Name | Role`.
- Agenda entries are `HH:MM - HH:MM Label` (a literal space-hyphen-space between the
  two times).

### Emerging practices — `content/emerging-practices/*.md`

| Field | Required? | Notes |
|---|---|---|
| `slug` | Required | Used as the output filename: `emerging-practices/<slug>.html`. |
| `title` | Required | Article heading. |
| `read` | Required | Free-text read-time shown in the meta line, e.g. `9 min read`. |
| `stage_tab` | Required | Must be exactly one of `Establishing`, `Incubating`, `Scaling`, `Reintegration` (the canonical order lives in `STAGE_ORDER` in `build_articles.py`). An unrecognised value fails the build. |
| `order` | Optional | Integer controlling sort order *within* the stage. Defaults to `0` if omitted — always set it to control ordering deliberately. |
| `stage_num` | Informational only | e.g. `01 / ESTABLISHING`. Not read by the build (the real numbering comes from `STAGE_ORDER`) — kept only so the file is self-describing. Keep it in sync with `stage_tab` by convention. |
| `stage_title` | Informational only | e.g. `Establishing a NewCo`. Same as `stage_num` — not read by the build, just documentation for humans editing the file. |

### Case studies — `content/case-studies/*.md`

All fields are required — there are no optional fields for this content type.

| Field | Notes |
|---|---|
| `slug` | Output filename: `case-studies/<slug>.html`. |
| `title` | Article heading. |
| `theme` | e.g. `Operating models`, `Governance`, `Culture`. |
| `author` | Author name shown in the meta line. |
| `role` | Author's role/organisation, e.g. `PA Consulting`. |
| `date` | Free-text publish date, e.g. `2 July 2026`. |
| `read` | Free-text read-time, e.g. `12 min read`. |

### Events — `content/events/*.md`

Next and past events share one template. Start a new event by copying
`content/events/_template.md` to `content/events/<slug>.md`. It lists every field with
notes, and files whose names start with `_` are never built. Only the four required fields
must be set. Delete any optional line you don't need and its section disappears from the page.

| Field | Required? | Notes |
|---|---|---|
| `slug` | Required | Output filename: `events/<slug>.html`. |
| `kind` | Required | `next` or `past` (anything else fails the build). `next` adds the "Express interest" registration form and the photography notice; `past` uses the single-column write-up layout. When an event has happened, change it to `past`. |
| `kicker` | Optional | Small label above the title. Defaults to `Next event` or `Past event` from `kind`. |
| `date` | Required | Free text, e.g. `17 September 2026` (can be `TBC`). |
| `time` | Optional | Free text, e.g. `16:00–19:00 BST`. |
| `loc` | Optional | Venue. |
| `format` | Optional | e.g. `In person only`. |
| `title` | Required | Event title. |
| `blurb` | Optional | One-line summary. |
| `agenda` | Optional | `;`-separated `HH:MM - HH:MM Label` entries. Renders an "Agenda" section; omit entirely if there's no confirmed agenda yet — don't use a placeholder like `TBC` as the value, since it will be parsed as a malformed entry. |
| `speakers` | Optional | `;`-separated `Name \| Role` entries. Renders a "Speakers" section; omit if not yet confirmed. |
| `themes` | Optional | `;`-separated short phrases. Renders a "Key discussion themes" list — conventionally used for past events, but works for either `kind`. |
| `insights` | Optional | `;`-separated pull-quote strings. Renders a "Major insights" list — conventionally past-only. Independent of `themes`. |
| `downloads` | Optional | `;`-separated material labels, e.g. `Session summary (PDF, 12 pp)`. Renders a "Materials" section — conventionally past-only. Omit the field entirely (don't set it to a placeholder string like `None for this event.`) when there's nothing to list, since any non-empty value is rendered as a real download row. |
| `image` | Optional | Filename of an image (jpg/png/webp) placed in `uploads/events/`, e.g. `newco-scale-hero.jpg`. Renders full-width, right under the overview text. |
| `image_alt` | Optional | Alt text for `image`. Defaults to the event's `title` if omitted — set a real description for accessibility. |
| `image_caption` | Optional | Caption text shown beneath `image`. Omit for no caption. |
| `video` | Optional | Filename of an `.mp4` file placed in `uploads/events/`, e.g. `newco-scale-recap.mp4`. Renders as a native HTML5 player with controls. Self-hosted (no YouTube/Vimeo) — the file is committed to the repo and served as a static asset, so keep clips short/compressed. |
| `video_poster` | Optional | Filename of a poster/thumbnail image (also in `uploads/events/`) shown before the video plays. Only used if `video` is set. |
| `video_caption` | Optional | Caption text shown beneath `video`. Omit for no caption. |

`time`/`date` fill the hero's "When" block and `loc`/`format` the "Where" block; a block with
no values is hidden.

**Body: overview and write-up.** The markdown below the frontmatter is the event overview.
To add a post-event article, put a line containing only `<!-- write-up -->` after the overview.
Everything below it renders as the final section of the page, under a **Write up** label
(it works for `next` events too, but is normally added once an event is `past`). With no
divider there's no write-up section.

The write-up is full markdown (`##` headings, lists, quotes, links) plus inline media, using
image syntax with each item on its own line:

```markdown
![Delegates around the roundtable](roundtable.jpg "Optional caption")

![Highlights from the discussion](highlights.mp4 "Optional caption")
```

- A bare filename is loaded from `uploads/events/`; a path or URL is used as written.
- `.mp4`, `.webm` and `.mov` render as a video player with controls; anything else as an image.
- The text in `[...]` is the alt text (images) or accessible label (video); the quoted title
  becomes a caption. Write real alt text.
- Images: 1600px wide JPEG/WebP, ~200–400 KB. Video: H.264 MP4, short clips, under ~20 MB
  each — files are committed to git and served from Netlify.

**Moving an event from next to past:** set `kind: past` (and drop any custom `kicker`), add the
write-up, then move its entry from the `next` to the `past` array in the microsite `DATA`
(see "Event card images" below). The homepage and events listings come from that data, not
from the markdown.

### Event media — `uploads/events/`

Put any image/video files referenced by the write-up or the `image`/`video`/`video_poster` fields above
into this folder (create it if it doesn't exist yet). Files are named whatever you like —
the whole folder is copied into the deployed site as-is, so an event's frontmatter picks
out which files actually get used; unreferenced files are harmless but simply unused.

### Event card images — Events page cards

The image on the right of each event card on `events.html` is **not** set from the
event's Markdown file. It comes from the listing data hard-coded in
`NewCo Community Microsite.dc.html` (the `next` / `past` arrays in `get DATA()`).

To add or change a card image:

1. Put the image file in `uploads/events/` (any filename; spaces are fine).
2. In `NewCo Community Microsite.dc.html`, find the event's entry in `get DATA()` and set
   `cardImage` to the bare filename, e.g.
   `cardImage: 'NewCo round one_image.jpg',`
   The `uploads/events/` path and URL-encoding are added automatically. Leave the
   field out to show the empty "Drop event image" placeholder.
3. Rebuild (see above). The file is copied into `netlify-deploy/uploads/events/` with
   the rest of the folder.

**Recommended size: 1200 × 900 px (4:3), landscape, JPEG or WebP, ~150–250 KB.**
The image always fills the slot and is cropped to fit, and the slot's shape changes with
the card:

| Where | Slot size on screen |
|---|---|
| Next event card, desktop | ~592 × 450 px |
| Past event card, desktop | ~592 × 340 px (shorter text column, so more top/bottom crop) |
| Either card, mobile (stacked below the text) | ~350 × 300 px |

1200 px wide covers the ~592 px desktop slot at 2× for high-density screens. Keep the
subject near the centre and nothing important at the edges, since 4:3 is trimmed
top/bottom on the past card and slightly at the sides on mobile.

The same `cardImage` also appears at the top of the Next/Past teaser cards on the
homepage (`index.html`). There the slot has a fixed **3:2** shape (~575 × 383 px on
desktop), so a 4:3 image loses a thin strip from the top and bottom. Only the first
`next` and first `past` event are shown on the homepage.

Card images are decorative (rendered with empty alt text); the card title names the
event. To show an image on the event's own page as well, use the separate `image` /
`image_alt` / `image_caption` frontmatter fields above.
