// Publishing: puts the saved working copy of an event live, or takes it down.
//
//   POST /.netlify/functions/cms-publish  { id, action: "publish",   updated_at } -> { event, build }
//   POST /.netlify/functions/cms-publish  { id, action: "unpublish" }            -> { event, build }
//   POST /.netlify/functions/cms-publish  { action: "rebuild" }                  -> { build }
//
// Publish freezes the saved columns into `published` (what the site build reads) and starts a
// Netlify build; the live site updates about 1–2 minutes later. `updated_at` is the version the
// editor is looking at: if the event was saved since, publishing is refused (409 "conflict"), so
// what goes live is always what the admin last saw. Publishing is also refused (422 "not_ready",
// with errors [{ field, message }]) when required content is missing or a media file the event
// uses isn't in the bucket — that would otherwise break the site build for every event.
// `build` is "started", "failed" (published, but the rebuild didn't start: try "rebuild"),
// or "not_configured" (no build hook, e.g. local runs).
import { withAdmin, json, readJson } from "./_lib/auth.mjs";
import { ROW_COLUMNS, getEvent, withStatus, bucketNames, triggerBuild } from "./_lib/cms.mjs";
import { contentOf, referencedMedia } from "../../../lib/event-fields.mjs";
import { sanitizeEvent, publishProblems } from "../../../lib/event-validate.mjs";

export const handler = withAdmin(["POST"], async (event, { email, supabase }) => {
  const body = readJson(event) || {};
  const action = body.action;

  if (action === "rebuild") return json(200, { build: await triggerBuild("rebuild") });
  if (action !== "publish" && action !== "unpublish") {
    return json(400, { error: "invalid", errors: [{ field: "action", message: "Must be publish, unpublish or rebuild." }] });
  }

  const row = await getEvent(supabase, body.id);
  if (!row) return json(404, { error: "not_found" });
  const conflict = () =>
    json(409, { error: "conflict", message: "This event was changed after you opened it. Reload it and check before publishing." });

  let update;
  if (action === "publish") {
    if (typeof body.updated_at !== "string") {
      return json(400, { error: "invalid", errors: [{ field: "updated_at", message: "Missing the version you're publishing (updated_at)." }] });
    }
    if (body.updated_at !== row.updated_at) return conflict();

    const content = contentOf(row);
    const { event: ev, errors } = sanitizeEvent(content);
    const problems = [...errors, ...publishProblems(ev)];
    const inBucket = await bucketNames(supabase);
    for (const name of referencedMedia(content)) {
      if (!inBucket.has(name)) problems.push({ field: "media", message: `The file "${name}" isn't in the media library. Upload it again or remove it.` });
    }
    if (problems.length) return json(422, { error: "not_ready", errors: problems });
    update = { published: content, published_at: new Date().toISOString(), updated_by: email };
  } else {
    if (!row.published) return json(200, { event: withStatus(row), build: "not_needed" });
    update = { published: null, published_at: null, updated_by: email };
  }

  // Conditional on updated_at, so a save landing between the read and this write can't slip
  // unchecked content into `published`.
  const { data, error } = await supabase
    .from("events")
    .update(update)
    .eq("id", row.id)
    .eq("updated_at", row.updated_at)
    .select(ROW_COLUMNS)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return conflict();

  const build = await triggerBuild(`${action} ${row.slug}`);
  return json(200, { event: withStatus(data), build });
});
