// Integration test for the CMS functions, run against the real Supabase project by calling each
// handler directly (no Netlify needed):
//
//   node scripts/build-events.mjs --source=md --out=<tmp dir>   # writes build/token-css.mjs
//   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… SESSION_SECRET=… node test/cms-functions.integration.mjs
//
// NETLIFY_BUILD_HOOK_URL must NOT be set, so no site build is triggered. Everything it creates
// is named cms-test-* and is deleted at the end. A test event is published for a few seconds;
// it only reaches the live site if a production build happens to read Supabase in that window.
import assert from "node:assert/strict";
import { SignJWT } from "jose";
import { createClient } from "@supabase/supabase-js";
import { contentOf } from "../lib/event-fields.mjs";
import { sanitizeEvent, publishProblems } from "../lib/event-validate.mjs";

if (process.env.NETLIFY_BUILD_HOOK_URL) throw new Error("unset NETLIFY_BUILD_HOOK_URL: this test must not trigger builds");

const fn = (name) => import(`../netlify-deploy/netlify/functions/${name}.mjs`).then((m) => m.handler);
const events = await fn("cms-events");
const publish = await fn("cms-publish");
const media = await fn("cms-media");
const preview = await fn("cms-preview");
const session = await fn("cms-session");

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: admins } = await db.from("allowed_emails").select("email").eq("admin", true).limit(1);
const key = new TextEncoder().encode(process.env.SESSION_SECRET);
const token = (email, admin) => new SignJWT({ email, admin }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1h").sign(key);
const ADMIN = await token(admins[0].email, true);
const NOT_ADMIN = await token("cms-test-member@example.invalid", true); // claims admin, isn't in the DB

const HOST = "cms-test.local";
function call(handler, { method = "GET", query, body, cookie = ADMIN, origin = `https://${HOST}` } = {}) {
  return handler({
    httpMethod: method,
    headers: { host: HOST, ...(cookie ? { cookie: `other=1; nc_session=${cookie}` } : {}), ...(origin ? { origin } : {}) },
    queryStringParameters: query || {},
    body: body === undefined ? null : JSON.stringify(body),
    isBase64Encoded: false,
  });
}
const parse = (r) => (r.headers["Content-Type"] || "").includes("json") ? JSON.parse(r.body) : r.body;

let n = 0;
async function step(label, fnc) {
  try { await fnc(); n++; console.log("PASS", label); }
  catch (e) { console.log("FAIL", label, "\n    ", e.message.split("\n").slice(0, 6).join("\n     ")); process.exitCode = 1; }
}
const expect = async (label, promise, status, check) => step(label, async () => {
  const r = await promise;
  const b = parse(r);
  assert.equal(r.statusCode, status, `status ${r.statusCode}: ${typeof b === "string" ? b.slice(0, 200) : JSON.stringify(b)}`);
  if (check) await check(b, r);
});

const RAND = Math.random().toString(36).slice(2, 8);
const TITLE = `CMS test ${RAND}`;
const SLUG = `cms-test-${RAND}`;
const FILE = `cms-test-${RAND}.png`;
// 1x1 transparent PNG
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
let ev; // the event under test, as last returned by the API

try {
  console.log("-- access");
  for (const [name, h] of Object.entries({ events, publish, media, preview, session })) {
    const m = name === "publish" ? "POST" : "GET";
    await expect(`${name}: signed out -> 401`, call(h, { method: m, cookie: null, body: {} }), 401);
    await expect(`${name}: not an admin in the DB -> 403`, call(h, { method: m, cookie: NOT_ADMIN, body: {} }), 403);
    await expect(`${name}: write from another site -> 403`, call(h, { method: "POST", origin: "https://evil.example", body: {} }), 403);
  }
  await expect("session: admin -> 200", call(session), 200, (b) => assert.equal(b.email, admins[0].email));
  await expect("session: POST -> 405", call(session, { method: "POST" }), 405);
  await expect("events: PATCH -> 405", call(events, { method: "PATCH", body: {} }), 405);

  console.log("-- existing events");
  await expect("list shows the migrated events as published", call(events), 200, (b) => {
    const live = b.events.filter((e) => !e.slug.startsWith("cms-test-"));
    assert.ok(live.length >= 2);
    for (const e of live) assert.equal(e.status, "published", e.slug);
  });
  await step("migrated events pass the CMS rules, so they can be re-published", async () => {
    const { data } = await db.from("events").select("*").not("slug", "like", "cms-test-%");
    for (const row of data) {
      const { event, errors } = sanitizeEvent(contentOf(row));
      assert.deepEqual(errors, [], row.slug);
      assert.deepEqual(publishProblems(event), [], row.slug);
    }
  });

  console.log("-- create / update");
  await expect("create with just a title -> slug from title", call(events, { method: "POST", body: { event: { title: TITLE } } }), 201, (b) => {
    ev = b.event;
    assert.equal(ev.slug, SLUG);
    assert.equal(ev.status, "draft");
    assert.equal(ev.updated_by, admins[0].email);
  });
  await expect("create with the same title -> -2 slug", call(events, { method: "POST", body: { event: { title: TITLE } } }), 201, async (b) => {
    assert.equal(b.event.slug, `${SLUG}-2`);
    await call(events, { method: "DELETE", query: { id: b.event.id } });
  });
  await expect("create with a taken slug -> 409", call(events, { method: "POST", body: { event: { title: "x", slug: SLUG } } }), 409, (b) => assert.equal(b.error, "slug_taken"));
  await expect("create with bad input -> 400 with field errors", call(events, { method: "POST", body: { event: { title: "x", slug: "Not A Slug", admin: true } } }), 400, (b) =>
    assert.deepEqual(b.errors.map((e) => e.field).sort(), ["admin", "slug"]));
  await expect("create without a title -> 400", call(events, { method: "POST", body: { event: {} } }), 400);
  await expect("get one", call(events, { query: { id: ev.id } }), 200, (b) => assert.equal(b.event.title, TITLE));
  await expect("get a missing id -> 404", call(events, { query: { id: "00000000-0000-0000-0000-000000000000" } }), 404);
  await expect("get a malformed id -> 404", call(events, { query: { id: "1 or 1=1" } }), 404);

  const edit = (changes, updated_at = ev.updated_at) =>
    call(events, { method: "PUT", query: { id: ev.id }, body: { event: { ...contentOf(ev), ...changes }, updated_at } });
  const stale = ev.updated_at;
  await expect("update", edit({ blurb: "A test event.", agenda: [{ start: "16:00", end: "", label: "Welcome" }] }), 200, (b) => {
    assert.equal(b.event.blurb, "A test event.");
    assert.notEqual(b.event.updated_at, stale);
    ev = b.event;
  });
  await expect("update from a stale copy -> 409 conflict", edit({ blurb: "overwrite" }, stale), 409, (b) => {
    assert.equal(b.error, "conflict");
    assert.equal(b.event.blurb, "A test event.");
  });
  await expect("update without updated_at -> 400", call(events, { method: "PUT", query: { id: ev.id }, body: { event: contentOf(ev) } }), 400);

  console.log("-- publish checks");
  const pub = (extra = {}) => call(publish, { method: "POST", body: { id: ev.id, action: "publish", updated_at: ev.updated_at, ...extra } });
  await expect("publish with no date -> 422", pub(), 422, (b) => assert.deepEqual(b.errors.map((e) => e.field), ["event_date"]));
  await expect("set a date and an image that isn't uploaded", edit({ event_date: "2031-01-15", image: FILE, image_alt: "Test image" }), 200, (b) => (ev = b.event));
  await expect("publish with missing media -> 422", pub(), 422, (b) => assert.match(b.errors[0].message, new RegExp(FILE)));
  await expect("bad action -> 400", call(publish, { method: "POST", body: { id: ev.id, action: "launch" } }), 400);

  console.log("-- media");
  let upload;
  await expect("ask to upload a .png", call(media, { method: "POST", body: { name: `C:\\fakepath\\${FILE}`, size: PNG.length } }), 200, (b) => {
    assert.equal(b.name, FILE);
    assert.equal(b.content_type, "image/png");
    upload = b;
  });
  await step("browser-style PUT to the signed upload URL", async () => {
    const r = await fetch(upload.upload_url, { method: "PUT", headers: { "Content-Type": upload.content_type }, body: PNG });
    assert.ok(r.ok, `${r.status} ${await r.text()}`);
  });
  await expect("same name again -> -2 name", call(media, { method: "POST", body: { name: FILE, size: 10 } }), 200, (b) => assert.equal(b.name, FILE.replace(".png", "-2.png")));
  await expect("upload a .svg -> 400", call(media, { method: "POST", body: { name: "x.svg", size: 10 } }), 400);
  await expect("upload 51 MB -> 400", call(media, { method: "POST", body: { name: "big.mp4", size: 51 * 1024 * 1024 } }), 400);
  await expect("list shows the file, used by the test event, with a thumbnail", call(media), 200, (b) => {
    const f = b.files.find((x) => x.name === FILE);
    assert.ok(f, "file listed");
    assert.equal(f.type, "image/png");
    assert.deepEqual(f.used_by.map((u) => [u.id, u.live]), [[ev.id, false]]);
    assert.match(f.thumb_url, /^https:\/\/.+token=/);
  });
  await expect("delete a file in use -> 409", call(media, { method: "DELETE", query: { name: FILE } }), 409, (b) => assert.equal(b.used_by[0].id, ev.id));
  await expect("delete a bad name -> 400", call(media, { method: "DELETE", query: { name: "../x.png" } }), 400);

  console.log("-- publish / changes / unpublish");
  await expect("publish from a stale copy -> 409", pub({ updated_at: stale }), 409);
  await expect("publish", pub(), 200, (b) => {
    assert.equal(b.event.status, "published");
    assert.equal(b.build, "not_configured");
    assert.ok(b.event.first_published_at);
    ev = b.event;
  });
  await expect("slug can't change after publishing -> 409", edit({ slug: `${SLUG}-renamed` }), 409, (b) => assert.equal(b.error, "slug_locked"));
  await expect("edit after publishing -> status changed, live copy untouched", edit({ title: `${TITLE} (edited) <script>alert(1)</script>` }), 200, async (b) => {
    assert.equal(b.event.status, "changed");
    assert.equal(b.event.published.title, TITLE);
    ev = b.event;
  });
  await expect("preview the saved draft", call(preview, { query: { id: ev.id } }), 200, (html, r) => {
    assert.match(r.headers["Content-Type"], /text\/html/);
    assert.match(r.headers["Content-Security-Policy"], /default-src 'none'.*form-action 'none'/);
    assert.match(html, /Unpublished changes/);
    assert.ok(html.includes("(edited) &lt;script&gt;"), "title escaped");
    assert.ok(!html.includes("<script>alert"), "no raw script");
    assert.match(html, /<img src="https:\/\/[^"]+event-media\/cms-test-[^"]+token=/);
    assert.match(html, /http-equiv="Content-Security-Policy"/);
    assert.match(html, /href="\/events\.html"/);
  });
  await expect("preview unsaved edits (POST)", call(preview, { method: "POST", body: { event: { ...contentOf(ev), title: "Unsaved title", image: "not-uploaded.jpg" } } }), 200, (html) => {
    assert.match(html, /Unsaved changes/);
    assert.match(html, /Unsaved title/);
    assert.match(html, /Missing media files: not-uploaded\.jpg/);
  });
  await expect("preview with bad input -> 400", call(preview, { method: "POST", body: { event: { title: 1 } } }), 400);
  await expect("unpublish", call(publish, { method: "POST", body: { id: ev.id, action: "unpublish" } }), 200, (b) => {
    assert.equal(b.event.status, "draft");
    assert.equal(b.event.published, null);
    ev = b.event;
  });
  await expect("unpublish again -> no-op", call(publish, { method: "POST", body: { id: ev.id, action: "unpublish" } }), 200, (b) => assert.equal(b.build, "not_needed"));
  await expect("rebuild without a hook -> not_configured", call(publish, { method: "POST", body: { action: "rebuild" } }), 200, (b) => assert.equal(b.build, "not_configured"));

  console.log("-- delete");
  await expect("delete the event", call(events, { method: "DELETE", query: { id: ev.id } }), 200, (b) => assert.equal(b.build, "not_needed"));
  await expect("it's gone", call(events, { query: { id: ev.id } }), 404);
  await expect("now the file can be deleted", call(media, { method: "DELETE", query: { name: FILE } }), 200);
  await expect("deleting it again -> 404", call(media, { method: "DELETE", query: { name: FILE } }), 404);
} finally {
  // Clean up anything left behind by a failure.
  const { data: left } = await db.from("events").delete().like("slug", "cms-test-%").select("slug");
  const { data: files } = await db.storage.from("event-media").list("", { search: "cms-test-" });
  if (files?.length) await db.storage.from("event-media").remove(files.map((f) => f.name));
  console.log(`cleanup: ${left?.length || 0} events, ${files?.length || 0} files left over`);
  console.log(process.exitCode ? "SOME CHECKS FAILED" : `all ${n} checks passed`);
}
