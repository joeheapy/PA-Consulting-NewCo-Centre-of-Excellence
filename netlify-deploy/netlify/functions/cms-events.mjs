// Events: the working copy (drafts). Publishing is cms-publish.
//
//   GET    /.netlify/functions/cms-events            -> { events: [summary...] }
//   GET    /.netlify/functions/cms-events?id=<uuid>  -> { event }
//   POST   /.netlify/functions/cms-events            { event }              -> 201 { event }
//   PUT    /.netlify/functions/cms-events?id=<uuid>  { event, updated_at }  -> { event }
//   DELETE /.netlify/functions/cms-events?id=<uuid>                         -> { deleted, build }
//
// `event` holds the content fields (lib/event-fields.mjs); anything else is rejected. On PUT,
// `updated_at` is the value the editor loaded: if someone else saved since, the save is refused
// with 409 "conflict" (and the current version), so one admin can't silently overwrite another.
// A slug left blank on create is made from the title. Errors: 400/409 { error, errors: [{ field, message }] }.
import { withAdmin, json, readJson } from "./_lib/auth.mjs";
import { ROW_COLUMNS, getEvent, allEvents, withStatus, triggerBuild, dbProblem } from "./_lib/cms.mjs";
import { sanitizeEvent, slugify } from "../../../lib/event-validate.mjs";
import { displayDate as displayLabel } from "../../../lib/event-render.mjs";

const invalid = (errors) => json(400, { error: "invalid", errors });

export const handler = withAdmin(["GET", "POST", "PUT", "DELETE"], async (event, { email, supabase }) => {
  const id = event.queryStringParameters?.id;

  if (event.httpMethod === "GET" && !id) {
    const events = (await allEvents(supabase)).map(withStatus).map((e) => ({
      id: e.id, slug: e.slug, title: e.title, kind: e.kind, date: displayLabel(e), event_date: e.event_date,
      status: e.status, updated_at: e.updated_at, updated_by: e.updated_by,
      published_at: e.published_at, first_published_at: e.first_published_at,
    }));
    events.sort((a, b) => String(b.event_date || "").localeCompare(String(a.event_date || "")) || a.title.localeCompare(b.title));
    return json(200, { events });
  }

  if (event.httpMethod === "POST") {
    const body = readJson(event);
    const { event: ev, errors } = sanitizeEvent(body?.event);
    if (errors.length) return invalid(errors);
    if (!ev.title) return invalid([{ field: "title", message: "Add a title." }]);
    if (!ev.slug) {
      const base = slugify(ev.title) || "event";
      const { data, error } = await supabase.from("events").select("slug").like("slug", `${base}%`);
      if (error) throw new Error(error.message);
      const taken = new Set(data.map((r) => r.slug));
      ev.slug = base;
      for (let i = 2; taken.has(ev.slug); i++) ev.slug = `${base}-${i}`;
    }
    const { data, error } = await supabase.from("events").insert({ ...ev, updated_by: email }).select(ROW_COLUMNS).single();
    if (error) {
      const p = dbProblem(error);
      if (p) return json(p.status, p.body);
      throw new Error(error.message);
    }
    return json(201, { event: withStatus(data) });
  }

  // The rest act on one event.
  const row = await getEvent(supabase, id);
  if (!row) return json(404, { error: "not_found" });

  if (event.httpMethod === "GET") return json(200, { event: withStatus(row) });

  if (event.httpMethod === "PUT") {
    const body = readJson(event);
    const { event: ev, errors } = sanitizeEvent(body?.event);
    if (errors.length) return invalid(errors);
    if (!ev.title) return invalid([{ field: "title", message: "Add a title." }]);
    if (!ev.slug) ev.slug = row.slug;
    if (row.first_published_at && ev.slug !== row.slug) {
      return json(409, { error: "slug_locked", errors: [{ field: "slug", message: "The web address can't change after the event has been published." }] });
    }
    if (typeof body.updated_at !== "string") return invalid([{ field: "updated_at", message: "Missing the version you edited (updated_at)." }]);

    // Only saves if nobody else has saved since this editor loaded the event.
    const { data, error } = await supabase
      .from("events")
      .update({ ...ev, updated_by: email })
      .eq("id", row.id)
      .eq("updated_at", body.updated_at)
      .select(ROW_COLUMNS)
      .maybeSingle();
    if (error) {
      const p = dbProblem(error);
      if (p) return json(p.status, p.body);
      throw new Error(error.message);
    }
    if (!data) {
      const current = await getEvent(supabase, row.id);
      return json(409, { error: "conflict", message: `It was saved${current?.updated_by ? ` by ${current.updated_by}` : ""}${current?.updated_at ? ` at ${new Date(current.updated_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })}` : ""}, possibly in another tab.`, event: current && withStatus(current) });
    }
    return json(200, { event: withStatus(data) });
  }

  // DELETE. A live event also comes off the site, which needs a rebuild.
  const { error } = await supabase.from("events").delete().eq("id", row.id);
  if (error) throw new Error(error.message);
  const build = row.published ? await triggerBuild(`delete ${row.slug}`) : "not_needed";
  return json(200, { deleted: true, build });
});
