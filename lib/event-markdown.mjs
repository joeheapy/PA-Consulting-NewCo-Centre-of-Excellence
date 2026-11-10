// Reads the legacy content/events/*.md files into the `events` row shape used by
// lib/event-render.mjs. Port of parse_frontmatter / load_events from the old
// build_articles.py. Used for the step-1 parity check and the one-off migration.

import fs from "node:fs";
import path from "node:path";
import { formatEventDate } from "./event-render.mjs";

const REQUIRED = ["slug", "kind", "title", "date"];
const WRITEUP_DIVIDER = "<!-- write-up -->";
const MONTHS = ["january", "february", "march", "april", "may", "june", "july",
  "august", "september", "october", "november", "december"];

export function parseFrontmatter(text) {
  if (!text.startsWith("---")) throw new Error("missing frontmatter delimiter");
  const first = text.indexOf("---");
  const second = text.indexOf("---", first + 3);
  if (second === -1) throw new Error("expected exactly two '---' delimiters");
  const meta = {};
  for (const line of text.slice(first + 3, second).trim().split(/\r?\n/)) {
    if (!line.trim()) continue;
    const i = line.indexOf(":");
    const key = (i === -1 ? line : line.slice(0, i)).trim();
    meta[key] = i === -1 ? "" : line.slice(i + 1).trim();
  }
  return { meta, body: text.slice(second + 3).replace(/^\n+|\n+$/g, "") };
}

const list = (v) => String(v || "").split(";").map((s) => s.trim()).filter(Boolean);

function parseAgenda(v) {
  // "16:00 - 16:30 Arrival" -> { start, end, label }
  return list(v).map((chunk) => {
    const i = chunk.indexOf(" - ");
    const start = i === -1 ? chunk : chunk.slice(0, i);
    const rest = i === -1 ? "" : chunk.slice(i + 3);
    const j = rest.indexOf(" ");
    return {
      start: start.trim(),
      end: (j === -1 ? rest : rest.slice(0, j)).trim(),
      label: (j === -1 ? "" : rest.slice(j + 1)).trim(),
    };
  });
}

function parseSpeakers(v) {
  return list(v).map((chunk) => {
    const i = chunk.indexOf("|");
    return { name: (i === -1 ? chunk : chunk.slice(0, i)).trim(), role: (i === -1 ? "" : chunk.slice(i + 1)).trim() };
  });
}

/** "14 October 2026" -> "2026-10-14"; anything else (e.g. "TBC") -> null. */
export function parseDisplayDate(text) {
  const m = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(String(text || "").trim());
  if (!m) return null;
  const month = MONTHS.indexOf(m[2].toLowerCase());
  if (month === -1) return null;
  return `${m[3]}-${String(month + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

const opt = (v) => (v != null && String(v).trim() !== "" ? String(v).trim() : null);

export function markdownToEvent(text, sourceName = "?") {
  const { meta, body } = parseFrontmatter(text);
  const missing = REQUIRED.filter((k) => !meta[k]);
  if (missing.length) throw new Error(`${sourceName}: missing required field(s): ${missing.join(", ")}`);
  if (!["next", "past"].includes(meta.kind)) throw new Error(`${sourceName}: kind must be 'next' or 'past', got '${meta.kind}'`);

  const i = body.indexOf(WRITEUP_DIVIDER);
  const overview = (i === -1 ? body : body.slice(0, i)).replace(/^\n+|\n+$/g, "");
  const writeup = (i === -1 ? "" : body.slice(i + WRITEUP_DIVIDER.length)).replace(/^\n+|\n+$/g, "");

  const eventDate = parseDisplayDate(meta.date);
  // Keep the original text as an override only when it isn't what the date picker would show.
  const dateLabel = eventDate && formatEventDate(eventDate) === meta.date ? null : meta.date;

  return {
    slug: meta.slug,
    kind: meta.kind,
    title: meta.title,
    kicker: opt(meta.kicker),
    event_date: eventDate,
    date_label: dateLabel,
    time_text: opt(meta.time),
    location: opt(meta.loc),
    format: opt(meta.format),
    blurb: opt(meta.blurb),
    overview_md: overview.trim() ? overview : null,
    writeup_md: writeup.trim() ? writeup : null,
    agenda: meta.agenda ? parseAgenda(meta.agenda) : [],
    speakers: meta.speakers ? parseSpeakers(meta.speakers) : [],
    themes: list(meta.themes),
    insights: list(meta.insights),
    downloads: list(meta.downloads).map((label) => ({ label })),
    image: opt(meta.image),
    image_alt: opt(meta.image_alt),
    image_caption: opt(meta.image_caption),
    video: opt(meta.video),
    video_poster: opt(meta.video_poster),
    video_caption: opt(meta.video_caption),
  };
}

/** All events in a directory, skipping files that start with "_", sorted by filename. */
export function loadMarkdownEvents(dir) {
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort()
    .map((f) => markdownToEvent(fs.readFileSync(path.join(dir, f), "utf8"), f));
}
