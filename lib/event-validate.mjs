// Input rules for the Events CMS: what an admin may store in an event, and what an event needs
// before it can be published. Pure functions (no I/O) shared by the CMS functions and tests.

import { CONTENT_FIELDS, referencedMedia } from "./event-fields.mjs";

// File types the CMS accepts. The bucket enforces the same list (0002_event_media_bucket.sql).
export const MEDIA_TYPES = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
  pdf: "application/pdf",
};
export const MAX_MEDIA_BYTES = 50 * 1024 * 1024;
const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"];
const VIDEO_EXTS = ["mp4", "webm", "mov"];

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const extOf = (name) => String(name).slice(String(name).lastIndexOf(".") + 1).toLowerCase();

/**
 * A safe bucket object name from an uploaded file's name, or null if the type isn't allowed.
 * Keeps letters, digits, spaces and . _ - ( ) so names stay readable ("Panel photo (1).jpg").
 * Never contains / < > or newlines, so it is always safe inside Markdown's ![alt](<name>).
 */
export function cleanMediaName(input) {
  const base = String(input ?? "").split(/[\\/]/).pop().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  const m = base.match(/^(.*)\.([A-Za-z0-9]+)$/);
  if (!m) return null;
  const ext = m[2].toLowerCase();
  if (!MEDIA_TYPES[ext]) return null;
  const stem = m[1]
    .replace(/[^A-Za-z0-9 _().-]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/-{2,}/g, "-")
    .replace(/^[\s.-]+|[\s.-]+$/g, "")
    .slice(0, 80)
    .replace(/[\s.-]+$/, "");
  return `${stem || "file"}.${ext}`;
}

export const isMediaName = (n) => typeof n === "string" && n !== "" && cleanMediaName(n) === n;

/** A unique-looking name: "photo.jpg" -> "photo-2.jpg", "photo-3.jpg", ... */
export function nextFreeName(name, taken) {
  if (!taken.has(name)) return name;
  const dot = name.lastIndexOf(".");
  const stem = name.slice(0, dot), ext = name.slice(dot);
  for (let i = 2; ; i++) if (!taken.has(`${stem}-${i}${ext}`)) return `${stem}-${i}${ext}`;
}

export function slugify(title) {
  return String(title ?? "")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

// Text fields and their maximum lengths.
const SHORT_TEXT = {
  title: 200, kicker: 120, date_label: 80, time_text: 120, location: 200, format: 120,
  blurb: 1000, image_alt: 300, image_caption: 500, video_caption: 500,
};
const LONG_TEXT = { overview_md: 50000, writeup_md: 50000 };
const MEDIA_FIELDS = { image: IMAGE_EXTS, card_image: IMAGE_EXTS, video_poster: IMAGE_EXTS, video: VIDEO_EXTS };
// Keys the CMS reads back from the API but that an editor can't set; ignored if sent.
const READ_ONLY = new Set([
  "id", "status", "published", "published_at", "first_published_at", "created_at", "updated_at", "updated_by",
]);
const MAX_ROWS = 60;

/**
 * Checks and normalises an event sent by the CMS. Returns { event, errors }: `event` has every
 * content field (missing ones empty), `errors` is [{ field, message }] (empty when valid).
 * This is about shape and safety; publishProblems() adds what a live page needs.
 */
export function sanitizeEvent(input) {
  const errors = [];
  const err = (field, message) => errors.push({ field, message });
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { event: null, errors: [{ field: "", message: "Expected an event object." }] };
  }
  for (const k of Object.keys(input)) {
    if (!CONTENT_FIELDS.includes(k) && !READ_ONLY.has(k)) err(k, "Unknown field.");
  }

  const str = (field, max, { trim = true } = {}) => {
    const v = input[field];
    if (v == null) return null;
    if (typeof v !== "string") { err(field, "Must be text."); return null; }
    let s = v.replace(/\r\n?/g, "\n");
    if (trim) s = s.trim();
    else if (!s.trim()) s = "";
    if (s.length > max) err(field, `Must be ${max.toLocaleString("en-GB")} characters or fewer.`);
    return s === "" ? null : s;
  };

  const ev = {};
  for (const [f, max] of Object.entries(SHORT_TEXT)) ev[f] = str(f, max);
  for (const [f, max] of Object.entries(LONG_TEXT)) ev[f] = str(f, max, { trim: false });

  ev.slug = str("slug", 120);
  if (ev.slug != null) {
    ev.slug = ev.slug.toLowerCase();
    if (!SLUG_RE.test(ev.slug)) err("slug", "Use lowercase letters, numbers and single hyphens only, e.g. spring-meetup-2027.");
  }

  ev.kind = input.kind == null || input.kind === "" ? "next" : input.kind;
  if (!["next", "past"].includes(ev.kind)) { err("kind", "Must be upcoming or past."); ev.kind = "next"; }

  ev.event_date = str("event_date", 10);
  if (ev.event_date != null) {
    const ok = /^\d{4}-\d{2}-\d{2}$/.test(ev.event_date) &&
      new Date(`${ev.event_date}T00:00:00Z`).toISOString().slice(0, 10) === ev.event_date;
    if (!ok) err("event_date", "Must be a real date (YYYY-MM-DD).");
  }

  const so = input.sort_order ?? 0;
  ev.sort_order = Number.isInteger(so) && Math.abs(so) <= 1000 ? so : (err("sort_order", "Must be a whole number between -1000 and 1000."), 0);

  for (const [f, exts] of Object.entries(MEDIA_FIELDS)) {
    ev[f] = str(f, 200);
    if (ev[f] == null) continue;
    if (!isMediaName(ev[f])) err(f, "Not a valid media file name. Upload the file and choose it again.");
    else if (!exts.includes(extOf(ev[f]))) err(f, `Must be a ${exts.join(", ")} file.`);
  }

  // Repeating rows: arrays of objects (or strings); fully blank rows are dropped.
  const rows = (field, shape) => {
    const v = input[field] ?? [];
    if (!Array.isArray(v)) { err(field, "Must be a list."); return []; }
    if (v.length > MAX_ROWS) err(field, `No more than ${MAX_ROWS} items.`);
    const out = [];
    v.slice(0, MAX_ROWS).forEach((item, i) => {
      if (shape === "text") {
        if (typeof item !== "string") return err(`${field}.${i}`, "Must be text.");
        const s = item.trim();
        if (s.length > 500) err(`${field}.${i}`, "Must be 500 characters or fewer.");
        if (s) out.push(s);
        return;
      }
      if (!item || typeof item !== "object" || Array.isArray(item)) return err(`${field}.${i}`, "Must be a row.");
      const row = {};
      for (const k of Object.keys(item)) if (!shape.includes(k)) err(`${field}.${i}.${k}`, "Unknown field.");
      for (const k of shape) {
        const x = item[k];
        if (x != null && typeof x !== "string") { err(`${field}.${i}.${k}`, "Must be text."); continue; }
        const s = (x ?? "").trim();
        if (s.length > 300) err(`${field}.${i}.${k}`, "Must be 300 characters or fewer.");
        row[k] = s;
      }
      if (shape.some((k) => row[k])) out.push(row);
    });
    return out;
  };
  ev.agenda = rows("agenda", ["start", "end", "label"]);
  ev.speakers = rows("speakers", ["name", "role"]);
  ev.themes = rows("themes", "text");
  ev.insights = rows("insights", "text");
  ev.downloads = rows("downloads", ["label", "file"]).map((d, i) => {
    if (!d.file) return { label: d.label };
    if (!isMediaName(d.file)) err(`downloads.${i}.file`, "Not a valid file name. Upload the file and choose it again.");
    return { label: d.label, file: d.file };
  });

  const event = {};
  for (const f of CONTENT_FIELDS) event[f] = ev[f];
  return { event, errors };
}

/** Media in the Markdown fields: [{ field, name, alt }] for each ![alt](name). */
export function markdownMedia(ev) {
  const out = [];
  for (const field of ["overview_md", "writeup_md"]) {
    for (const m of String(ev[field] || "").matchAll(/!\[([^\]]*)\]\(\s*(?:<([^>]+)>|([^)\s]+))/g)) {
      out.push({ field, alt: m[1].trim(), name: (m[2] ?? m[3]).trim() });
    }
  }
  return out;
}

/**
 * What stops a (sanitized) event from being published: [{ field, message }]. Media existence
 * and slug uniqueness need the database, so the publish function checks those as well.
 */
export function publishProblems(ev) {
  const p = [];
  const need = (field, message) => { if (!ev[field]) p.push({ field, message }); };
  need("title", "Add a title.");
  need("slug", "Add a web address (slug).");
  if (!ev.event_date && !ev.date_label) p.push({ field: "event_date", message: "Add a date, or say how the date should be shown (e.g. TBC)." });
  if (ev.image && !ev.image_alt) p.push({ field: "image_alt", message: "Describe the main image for people who can't see it." });
  ev.agenda.forEach((r, i) => {
    if (!r.start) p.push({ field: `agenda.${i}.start`, message: "Add a start time." });
    if (!r.label) p.push({ field: `agenda.${i}.label`, message: "Say what happens." });
  });
  ev.speakers.forEach((r, i) => { if (!r.name) p.push({ field: `speakers.${i}.name`, message: "Add the speaker's name." }); });
  ev.downloads.forEach((r, i) => { if (!r.label) p.push({ field: `downloads.${i}.label`, message: "Add a label." }); });
  for (const m of markdownMedia(ev)) {
    if (!m.alt) p.push({ field: m.field, message: `Describe the image or video "${m.name}" (the text inside ![...]).` });
    else if (!isMediaName(m.name) && !/^https:\/\//i.test(m.name)) p.push({ field: m.field, message: `"${m.name}" is not an uploaded file. Use Insert media to add it.` });
  }
  return p;
}

export { referencedMedia };
