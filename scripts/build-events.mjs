#!/usr/bin/env node
// Builds netlify-deploy/events/<slug>.html with lib/event-render.mjs.
//
//   node scripts/build-events.mjs [--source=md|supabase] [--out=netlify-deploy/events]
//
// --source=md (default until the cut-over) reads content/events/*.md.
// --source=supabase reads the published snapshots (needs SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY). Drafts are never read.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderEventPage } from "../lib/event-render.mjs";
import { loadMarkdownEvents } from "../lib/event-markdown.mjs";
import { loadTokenCss } from "../lib/token-css.mjs";
import { adminClient, fetchPublishedEvents } from "../lib/supabase-admin.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const source = args.source || "md";
const outDir = path.resolve(ROOT, args.out || "netlify-deploy/events");

let events;
if (source === "md") {
  events = loadMarkdownEvents(path.join(ROOT, "content/events"));
} else if (source === "supabase") {
  events = await fetchPublishedEvents(adminClient());
} else {
  console.error(`unknown --source=${source}`);
  process.exit(1);
}

const css = loadTokenCss();
fs.mkdirSync(outDir, { recursive: true });
for (const ev of events) {
  const html = renderEventPage(ev, { css });
  const file = path.join(outDir, `${ev.slug}.html`);
  fs.writeFileSync(file, html);
  console.log("wrote", path.relative(ROOT, file), html.length, "bytes");
}
console.log("done:", events.length, "events");
