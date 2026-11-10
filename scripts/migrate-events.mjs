#!/usr/bin/env node
// One-off migration: content/events/*.md (+ card images from the microsite DATA) → Supabase.
//
//   node scripts/migrate-events.mjs --dry-run   # show what would be written; changes nothing
//   node scripts/migrate-events.mjs             # upload media, upsert events as published
//
// Safe to re-run: events are upserted by slug and media uploads overwrite same-named files.
// Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadMarkdownEvents } from "../lib/event-markdown.mjs";
import { contentOf, referencedMedia } from "../lib/event-fields.mjs";
import { adminClient, MEDIA_BUCKET, compareForListing } from "../lib/supabase-admin.mjs";
import { defaultKicker } from "../lib/event-render.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const MEDIA_DIR = path.join(ROOT, "uploads/events");
const MICROSITE = path.join(ROOT, "NewCo Community Microsite.dc.html");

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime", ".pdf": "application/pdf" };

// --- Listing data from the microsite: which array each event is in, its position, cardImage.
function readListingData() {
  const html = fs.readFileSync(MICROSITE, "utf8");
  const start = html.indexOf("get DATA()");
  const nextAt = html.indexOf("const next = [", start);
  const pastAt = html.indexOf("const past = [", start);
  const end = html.indexOf("const stages = [", start);
  if ([start, nextAt, pastAt, end].includes(-1)) throw new Error("could not find the events DATA in the microsite");
  const out = {};
  for (const [kind, from, to] of [["next", nextAt, pastAt], ["past", pastAt, end]]) {
    const block = html.slice(from, to);
    let i = 0;
    for (const m of block.matchAll(/\{\s*id:\s*'[^']*',\s*slug:\s*'([^']+)'([^}]*)/g)) {
      const card = /cardImage:\s*'([^']+)'/.exec(m[2]);
      out[m[1]] = { listKind: kind, position: i++, card_image: card ? card[1] : null };
    }
  }
  return out;
}

const listing = readListingData();
const events = loadMarkdownEvents(path.join(ROOT, "content/events")).map((ev) => {
  const l = listing[ev.slug];
  if (!l) console.warn(`WARN  ${ev.slug} is not in the microsite listing DATA`);
  else if (l.listKind !== ev.kind) console.warn(`WARN  ${ev.slug}: Markdown kind '${ev.kind}' but listed under '${l.listKind}'`);
  // A kicker equal to the default is dropped, so it follows the kind if an editor changes it.
  const kicker = ev.kicker === defaultKicker(ev.kind) ? null : ev.kicker;
  return { ...ev, kicker, card_image: l?.card_image ?? null, sort_order: 0 };
});

// Listings sort by date (newest first). Check that gives today's order, else keep it by sort_order.
for (const kind of ["next", "past"]) {
  const listed = events.filter((e) => listing[e.slug]?.listKind === kind)
    .sort((a, b) => listing[a.slug].position - listing[b.slug].position).map((e) => e.slug);
  const byDate = events.filter((e) => listing[e.slug]?.listKind === kind).sort(compareForListing).map((e) => e.slug);
  if (listed.join() !== byDate.join()) {
    console.warn(`WARN  '${kind}' listing order differs from date order; preserving it with sort_order`);
    for (const e of events) if (listing[e.slug]?.listKind === kind) e.sort_order = listing[e.slug].position;
  }
}

// --- Media: upload exactly the files events reference.
const media = [...new Set(events.flatMap(referencedMedia))].sort();
const missing = media.filter((n) => !fs.existsSync(path.join(MEDIA_DIR, n)));
if (missing.length) throw new Error(`referenced media not found in uploads/events/: ${missing.join(", ")}`);

console.log(`${DRY ? "[dry run] " : ""}${events.length} events, ${media.length} media files\n`);
for (const ev of events) {
  console.log(`  ${ev.slug}  (${ev.kind}, ${ev.event_date ?? ev.date_label}, card: ${ev.card_image ?? "none"})`);
}
for (const n of media) console.log(`  media: ${n}`);

if (DRY) {
  console.log("\nRows that would be written:\n" + JSON.stringify(events.map(contentOf), null, 2));
  process.exit(0);
}

const supabase = adminClient();
for (const name of media) {
  const ext = path.extname(name).toLowerCase();
  const { error } = await supabase.storage.from(MEDIA_BUCKET)
    .upload(name, fs.readFileSync(path.join(MEDIA_DIR, name)), { contentType: MIME[ext], upsert: true });
  if (error) throw new Error(`upload ${name}: ${error.message}`);
  console.log("uploaded", name);
}

const now = new Date().toISOString();
const rows = events.map((ev) => ({
  ...contentOf(ev),
  published: contentOf(ev),
  published_at: now,
  updated_by: "migration",
}));
const { data, error } = await supabase.from("events").upsert(rows, { onConflict: "slug" }).select("slug, published_at");
if (error) throw new Error(`upsert events: ${error.message}`);
for (const r of data) console.log("upserted", r.slug, "published", r.published_at);
console.log("\ndone");
