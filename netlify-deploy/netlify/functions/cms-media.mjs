// The media library: the private `event-media` bucket.
//
//   GET    /.netlify/functions/cms-media              -> { files: [{ name, size, type, updated_at, used_by, thumb_url }] }
//   POST   /.netlify/functions/cms-media  { name, size } -> { name, upload_url, content_type }
//   DELETE /.netlify/functions/cms-media?name=<name>  -> { deleted }
//
// Uploads go straight from the browser to Supabase Storage, so large videos don't pass through
// a function (6 MB limit): POST returns a one-time signed upload URL, then the browser sends
//   PUT <upload_url>  (body: the file, Content-Type: content_type)
// The name is cleaned (lib/event-validate.mjs cleanMediaName) and made unique ("photo-2.jpg"),
// so an upload never replaces an existing file. Only the types in MEDIA_TYPES, up to 50 MB.
// A file used by any event (draft or live) can't be deleted: 409 { error: "in_use", used_by }.
import { withAdmin, json, readJson } from "./_lib/auth.mjs";
import { MEDIA_BUCKET, allEvents, mediaUsage, signedUrls } from "./_lib/cms.mjs";
import { cleanMediaName, nextFreeName, isMediaName, MEDIA_TYPES, MAX_MEDIA_BYTES } from "../../../lib/event-validate.mjs";

async function listFiles(supabase) {
  const files = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list("", { limit: 1000, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(error.message);
    files.push(...data.filter((f) => f.id));
    if (data.length < 1000) return files;
  }
}

export const handler = withAdmin(["GET", "POST", "DELETE"], async (event, { supabase }) => {
  if (event.httpMethod === "GET") {
    const [files, events] = await Promise.all([listFiles(supabase), allEvents(supabase)]);
    const usage = mediaUsage(events);
    const images = files.filter((f) => String(f.metadata?.mimetype || "").startsWith("image/")).map((f) => f.name);
    const thumbs = await signedUrls(supabase, images);
    return json(200, {
      files: files.map((f) => ({
        name: f.name,
        size: f.metadata?.size ?? null,
        type: f.metadata?.mimetype ?? null,
        updated_at: f.updated_at,
        used_by: usage.get(f.name) || [],
        thumb_url: thumbs.get(f.name) || null,
      })),
    });
  }

  if (event.httpMethod === "POST") {
    const body = readJson(event) || {};
    const clean = cleanMediaName(body.name);
    if (!clean) {
      return json(400, { error: "invalid", errors: [{ field: "name", message: `Only ${[...new Set(Object.keys(MEDIA_TYPES))].join(", ")} files can be uploaded.` }] });
    }
    if (!Number.isFinite(body.size) || body.size <= 0 || body.size > MAX_MEDIA_BYTES) {
      return json(400, { error: "invalid", errors: [{ field: "size", message: "Files must be 50 MB or smaller." }] });
    }
    const taken = new Set((await listFiles(supabase)).map((f) => f.name));
    const name = nextFreeName(clean, taken);
    const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUploadUrl(name);
    if (error) throw new Error(error.message);
    return json(200, { name, upload_url: data.signedUrl, content_type: MEDIA_TYPES[name.slice(name.lastIndexOf(".") + 1)] });
  }

  // DELETE
  const name = event.queryStringParameters?.name;
  if (!isMediaName(name)) return json(400, { error: "invalid", errors: [{ field: "name", message: "Not a media file name." }] });
  const usedBy = mediaUsage(await allEvents(supabase)).get(name);
  if (usedBy?.length) return json(409, { error: "in_use", used_by: usedBy });
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).remove([name]);
  if (error) throw new Error(error.message);
  if (!data.length) return json(404, { error: "not_found" });
  return json(200, { deleted: name });
});
