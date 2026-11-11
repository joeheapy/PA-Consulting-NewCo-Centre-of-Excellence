// Helpers shared by the CMS functions: reading events, the media bucket, and the site rebuild.

import { CONTENT_FIELDS, eventStatus, referencedMedia } from "../../../../lib/event-fields.mjs";
import { MEDIA_BUCKET } from "../../../../lib/supabase-admin.mjs";

export { MEDIA_BUCKET };

export const ROW_COLUMNS = [
  "id", ...CONTENT_FIELDS, "published", "published_at", "first_published_at",
  "created_at", "updated_at", "updated_by",
].join(",");

/** An event row as the CMS sees it: every column plus its status. */
export const withStatus = (row) => ({ ...row, status: eventStatus(row) });

export async function getEvent(supabase, id) {
  if (!/^[0-9a-f-]{36}$/i.test(String(id || ""))) return null;
  const { data, error } = await supabase.from("events").select(ROW_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function allEvents(supabase) {
  const { data, error } = await supabase.from("events").select(ROW_COLUMNS);
  if (error) throw new Error(error.message);
  return data;
}

/** Names of all files in the bucket. */
export async function bucketNames(supabase) {
  const names = new Set();
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list("", { limit: 1000, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(error.message);
    for (const f of data) if (f.id) names.add(f.name); // folders have no id
    if (data.length < 1000) return names;
  }
}

/** Which events use each file: Map name -> [{ id, title, live }]. Counts drafts and live content. */
export function mediaUsage(events) {
  const usage = new Map();
  for (const ev of events) {
    const live = new Set(ev.published ? referencedMedia(ev.published) : []);
    for (const name of new Set([...referencedMedia(ev), ...live])) {
      if (!usage.has(name)) usage.set(name, []);
      usage.get(name).push({ id: ev.id, title: ev.title, live: live.has(name) });
    }
  }
  return usage;
}

/** Signed URLs (valid 10 minutes) for files in the bucket: Map name -> url. Missing files are left out. */
export async function signedUrls(supabase, names, seconds = 600) {
  const map = new Map();
  if (!names.length) return map;
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrls(names, seconds);
  if (error) throw new Error(error.message);
  for (const r of data) if (r.signedUrl && !r.error) map.set(r.path, r.signedUrl);
  return map;
}

/**
 * Starts a Netlify build so the live site picks up published changes (about 1–2 minutes).
 * Returns "started", "not_configured" (no NETLIFY_BUILD_HOOK_URL, e.g. local runs) or "failed".
 */
export async function triggerBuild(reason) {
  const hook = process.env.NETLIFY_BUILD_HOOK_URL;
  if (!hook) return "not_configured";
  try {
    const url = new URL(hook);
    url.searchParams.set("trigger_title", `CMS: ${reason}`.slice(0, 120));
    const r = await fetch(url, { method: "POST" });
    if (!r.ok) console.error("build hook returned", r.status);
    return r.ok ? "started" : "failed";
  } catch (err) {
    console.error("build hook failed:", err.message);
    return "failed";
  }
}

/** A Supabase/Postgres error as an HTTP response body, for the cases an admin can fix. */
export function dbProblem(error) {
  if (error?.code === "23505") return { status: 409, body: { error: "slug_taken", errors: [{ field: "slug", message: "Another event already uses this web address." }] } };
  if (error?.code === "23514" && /cannot change after/i.test(error.message)) {
    return { status: 409, body: { error: "slug_locked", errors: [{ field: "slug", message: "The web address can't change after the event has been published." }] } };
  }
  if (error?.code === "23514" || error?.code === "22P02") return { status: 400, body: { error: "invalid", errors: [{ field: "", message: error.message }] } };
  return null;
}
