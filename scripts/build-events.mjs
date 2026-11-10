#!/usr/bin/env node
// Builds the event pages and the event listing data for the homepage and Events page.
//
//   node scripts/build-events.mjs [--source=supabase|md] [--out=netlify-deploy/events]
//
// --source=supabase (used by the Netlify build) reads the published snapshots only; drafts
//   are never read. Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. It also:
//     * removes event pages that are no longer published, so unpublishing takes them down;
//     * downloads the media published events use into netlify-deploy/uploads/events/;
//     * writes build/events-listing.json, which build_netlify_bundle.py puts into the
//       homepage / Events page listings.
// --source=md reads the legacy content/events/*.md (pages only; kept for comparison).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderEventPage, displayDate, defaultKicker } from "../lib/event-render.mjs";
import { loadMarkdownEvents } from "../lib/event-markdown.mjs";
import { loadTokenCss } from "../lib/token-css.mjs";
import { referencedMedia } from "../lib/event-fields.mjs";
import { adminClient, fetchPublishedEvents, MEDIA_BUCKET } from "../lib/supabase-admin.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const source = args.source || "supabase";
const outDir = path.resolve(ROOT, args.out || "netlify-deploy/events");
const MEDIA_OUT = path.join(ROOT, "netlify-deploy/uploads/events");
const LISTING_OUT = path.join(ROOT, "build/events-listing.json");

/** The fields the homepage / Events page cards use (see get DATA() in the microsite). */
export function listingEntry(ev) {
  const date = displayDate(ev);
  return {
    id: ev.slug,
    slug: ev.slug,
    past: ev.kind === "past",
    cardImage: ev.card_image || undefined,
    kicker: `${ev.kicker || defaultKicker(ev.kind)} · ${date}`,
    date,
    time: ev.time_text || "",
    loc: ev.location || "",
    format: ev.format || "",
    title: ev.title,
    blurb: ev.blurb || "",
  };
}

let events;
let supabase;
if (source === "md") {
  events = loadMarkdownEvents(path.join(ROOT, "content/events"));
} else if (source === "supabase") {
  supabase = adminClient();
  events = await fetchPublishedEvents(supabase);
} else {
  console.error(`unknown --source=${source}`);
  process.exit(1);
}

// --- Pages. In Supabase mode the folder is cleared first so unpublished events disappear.
fs.mkdirSync(outDir, { recursive: true });
if (source === "supabase") {
  for (const f of fs.readdirSync(outDir)) if (f.endsWith(".html")) fs.rmSync(path.join(outDir, f));
}
const css = loadTokenCss();
for (const ev of events) {
  const html = renderEventPage(ev, { css });
  const file = path.join(outDir, `${ev.slug}.html`);
  fs.writeFileSync(file, html);
  console.log("wrote", path.relative(ROOT, file), html.length, "bytes");
}

if (source === "supabase") {
  // --- Media used by published events, from the private bucket.
  fs.mkdirSync(MEDIA_OUT, { recursive: true });
  const names = [...new Set(events.flatMap(referencedMedia))].sort();
  for (const name of names) {
    const { data, error } = await supabase.storage.from(MEDIA_BUCKET).download(name);
    if (error) throw new Error(`media '${name}' is used by a published event but could not be downloaded: ${error.message}`);
    fs.writeFileSync(path.join(MEDIA_OUT, name), Buffer.from(await data.arrayBuffer()));
    console.log("media", name);
  }

  // --- Listing data. Upcoming: soonest first (the homepage shows the first). Past: newest
  //     first (fetchPublishedEvents' order). sort_order, when set, comes before the date.
  const soonestFirst = (a, b) =>
    (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
    String(a.event_date || "9999").localeCompare(String(b.event_date || "9999"));
  const listing = {
    next: events.filter((e) => e.kind === "next").sort(soonestFirst).map(listingEntry),
    past: events.filter((e) => e.kind === "past").map(listingEntry),
  };
  fs.mkdirSync(path.dirname(LISTING_OUT), { recursive: true });
  fs.writeFileSync(LISTING_OUT, JSON.stringify(listing, null, 2));
  console.log("wrote", path.relative(ROOT, LISTING_OUT), `(${listing.next.length} next, ${listing.past.length} past)`);
}
console.log("done:", events.length, "events");
