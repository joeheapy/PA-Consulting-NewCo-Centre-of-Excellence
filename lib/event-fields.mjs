// The content fields of an event: the columns an editor changes, and exactly what is
// frozen into `published` when an event is published. Shared by the migration, the site
// build and the CMS functions, so they never disagree about what an event contains.

export const CONTENT_FIELDS = [
  "slug", "kind", "title", "kicker",
  "event_date", "date_label", "time_text", "location", "format",
  "blurb", "overview_md", "writeup_md",
  "agenda", "speakers", "themes", "insights", "downloads",
  "image", "image_alt", "image_caption",
  "video", "video_poster", "video_caption",
  "card_image", "sort_order",
];

/** The content fields of a row, for storing as the `published` snapshot. */
export function contentOf(row) {
  const out = {};
  for (const f of CONTENT_FIELDS) out[f] = row[f] ?? null;
  for (const f of ["agenda", "speakers", "themes", "insights", "downloads"]) out[f] = row[f] ?? [];
  out.sort_order = row.sort_order ?? 0;
  return out;
}

// Postgres jsonb reorders object keys, so compare with keys sorted.
function canonical(v) {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])]));
  return v;
}

export function sameContent(a, b) {
  return JSON.stringify(canonical(contentOf(a))) === JSON.stringify(canonical(contentOf(b)));
}

/**
 * 'draft' (never published, or unpublished), 'published', or 'changed' (published, but the
 * working copy differs from what is live). Decided by content, not timestamps, so it can't be
 * fooled by clock differences, and editing something back to how it was clears it.
 */
export function eventStatus(row) {
  if (!row.published) return "draft";
  return sameContent(row, row.published) ? "published" : "changed";
}

const isBucketName =(n) => typeof n === "string" && n.trim() !== "" && !n.includes("/") && !/^[a-z][a-z0-9+.-]*:/i.test(n);

/**
 * Every bucket file an event uses: the media fields, Materials files, and media inserted in
 * the overview or write-up Markdown (`![alt](file)` or `![alt](<file name>)`). Paths and URLs
 * are skipped: they're not in the bucket.
 */
export function referencedMedia(ev) {
  const names = new Set();
  for (const f of ["image", "video", "video_poster", "card_image"]) if (isBucketName(ev[f])) names.add(ev[f].trim());
  for (const d of ev.downloads || []) if (isBucketName(d?.file)) names.add(d.file.trim());
  const md = `${ev.overview_md || ""}\n${ev.writeup_md || ""}`;
  for (const m of md.matchAll(/!\[[^\]]*\]\(\s*(?:<([^>]+)>|([^)\s]+))/g)) {
    const n = m[1] ?? m[2];
    if (isBucketName(n)) names.add(n.trim());
  }
  return [...names];
}
