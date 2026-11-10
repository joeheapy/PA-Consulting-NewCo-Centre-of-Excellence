// Service-role Supabase client for Node scripts and the site build. Never use in a browser.
import { createClient } from "@supabase/supabase-js";

export const MEDIA_BUCKET = "event-media";

export function adminClient(env = process.env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see README: Events CMS)");
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Published events (the frozen snapshots), sorted for listings: newest date first. */
export async function fetchPublishedEvents(supabase) {
  const { data, error } = await supabase
    .from("events")
    .select("published")
    .not("published", "is", null);
  if (error) throw new Error(`could not read events from Supabase: ${error.message}`);
  return data.map((r) => r.published).sort(compareForListing);
}

export function compareForListing(a, b) {
  if (a.sort_order !== b.sort_order) return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  return String(b.event_date || "").localeCompare(String(a.event_date || ""));
}
