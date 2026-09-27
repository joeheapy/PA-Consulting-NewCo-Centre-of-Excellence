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
| `date` | Free-text publish date, e.g. `2 July 2027`. |
| `read` | Free-text read-time, e.g. `12 min read`. |

### Events — `content/events/*.md`

| Field | Required? | Notes |
|---|---|---|
| `slug` | Required | Output filename: `events/<slug>.html`. |
| `kind` | Required | `next` or `past`. Anything other than exactly `next` is treated as `past`. Keep exactly one file at `kind: next` at a time — that's the only event shown as "Next event" and the only one that gets the "Express interest" registration form. |
| `kicker` | Required | Small label above the title, e.g. `Next event · Registration open` or `Past event · 14 May 2027`. |
| `date` | Required | Free text, e.g. `17 September 2027` (can be `TBC`). |
| `time` | Required | Free text, e.g. `16:00–19:00 BST`. |
| `loc` | Required | Venue. |
| `format` | Required | e.g. `In person only`. |
| `title` | Required | Event title. |
| `blurb` | Required | One-line summary shown on the events listing. |
| `agenda` | Optional | `;`-separated `HH:MM - HH:MM Label` entries. Renders an "Agenda" section; omit entirely if there's no confirmed agenda yet — don't use a placeholder like `TBC` as the value, since it will be parsed as a malformed entry. |
| `speakers` | Optional | `;`-separated `Name \| Role` entries. Renders a "Speakers" section; omit if not yet confirmed. |
| `themes` | Optional | `;`-separated short phrases. Renders a "Key discussion themes" list — conventionally used for past events, but works for either `kind`. |
| `insights` | Optional | `;`-separated pull-quote strings. Renders a "Major insights" list alongside `themes` — conventionally past-only. |
| `downloads` | Optional | `;`-separated material labels, e.g. `Session summary (PDF, 12 pp)`. Renders a "Materials" section — conventionally past-only. Omit the field entirely (don't set it to a placeholder string like `None for this event.`) when there's nothing to list, since any non-empty value is rendered as a real download row. |

`overview` (the body text below the frontmatter) is required in practice — it's what
renders as the event's overview paragraphs — but isn't a frontmatter key, so it can't be
individually enforced beyond "leave it blank and the event page will have no overview".
