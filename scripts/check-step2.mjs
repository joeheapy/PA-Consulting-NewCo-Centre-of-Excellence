#!/usr/bin/env node
// Step 2 checks, run after 0001/0002 are applied:
//   1. With the PUBLIC anon/publishable key, events, allowed_emails and the event-media bucket
//      are all inaccessible (read, write, list, upload, download).
//   2. With the service-role key, the events trigger behaves as designed. It uses a throwaway
//      row and file, and deletes both at the end.
//
// Usage (keys are read from the environment and never printed):
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_ANON_KEY=... node scripts/check-step2.mjs

import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY } = process.env;
for (const [k, v] of Object.entries({ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY })) {
  if (!v) { console.error(`missing ${k}`); process.exit(2); }
}

const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, opts);
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, opts);

let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${!ok && detail ? `  (${detail})` : ""}`);
};
const denied = (res) => Boolean(res.error) || (Array.isArray(res.data) && res.data.length === 0);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SLUG = "zz-cms-step2-check";
const FILE = `zz-cms-step2-check-${Date.now()}.png`;
// 1×1 transparent PNG
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

try {
  // ---------------------------------------------------------------- service-role setup
  await admin.from("events").delete().eq("slug", SLUG);
  const ins = await admin.from("events").insert({ slug: SLUG, title: "Step 2 check", kind: "next" }).select().single();
  check("service role can create an event", !ins.error, ins.error?.message);
  const row = ins.data;
  const up = await admin.storage.from("event-media").upload(FILE, PNG, { contentType: "image/png" });
  check("service role can upload to event-media", !up.error, up.error?.message);

  // ---------------------------------------------------------------- anon is locked out
  check("anon cannot read events", denied(await anon.from("events").select("*")));
  check("anon cannot create events",
    Boolean((await anon.from("events").insert({ slug: "zz-anon", title: "x" })).error));
  const anonUpd = await anon.from("events").update({ title: "hacked" }).eq("slug", SLUG).select();
  check("anon cannot update events", denied(anonUpd));
  const anonDel = await anon.from("events").delete().eq("slug", SLUG).select();
  check("anon cannot delete events", denied(anonDel));
  check("anon cannot read allowed_emails", denied(await anon.from("allowed_emails").select("*")));
  check("anon cannot add to allowed_emails",
    Boolean((await anon.from("allowed_emails").insert({ email: "zz-attacker@example.com", admin: true })).error));
  check("anon cannot list event-media", denied(await anon.storage.from("event-media").list()));
  check("anon cannot download from event-media",
    Boolean((await anon.storage.from("event-media").download(FILE)).error));
  check("anon cannot upload to event-media",
    Boolean((await anon.storage.from("event-media").upload(`zz-anon-${Date.now()}.png`, PNG, { contentType: "image/png" })).error));
  const pub = anon.storage.from("event-media").getPublicUrl(FILE).data.publicUrl;
  check("public URL for event-media does not serve the file", (await fetch(pub)).status >= 400);
  const still = await admin.from("events").select("title").eq("slug", SLUG).single();
  check("row unchanged after anon attempts", still.data?.title === "Step 2 check");

  // ---------------------------------------------------------------- bucket rules
  const bad = await admin.storage.from("event-media").upload(`zz-${Date.now()}.html`, Buffer.from("<b>x</b>"), { contentType: "text/html" });
  check("bucket rejects disallowed file types (text/html)", Boolean(bad.error));
  if (!bad.error) await admin.storage.from("event-media").remove([bad.data.path]);

  // ---------------------------------------------------------------- trigger behaviour
  if (row) {
    await sleep(1100);
    const edited = (await admin.from("events").update({ blurb: "edited" }).eq("id", row.id).select().single()).data;
    check("editing content moves updated_at", edited && edited.updated_at > row.updated_at);

    await sleep(1100);
    const now = new Date().toISOString();
    const published = (await admin.from("events")
      .update({ published: { title: "Step 2 check" }, published_at: now }).eq("id", row.id).select().single()).data;
    check("publishing does not move updated_at", published && published.updated_at === edited.updated_at);
    check("publishing stamps first_published_at", Boolean(published?.first_published_at));

    const rename = await admin.from("events").update({ slug: SLUG + "-renamed" }).eq("id", row.id);
    check("slug is locked after first publish", Boolean(rename.error), "rename was allowed");

    const unpub = (await admin.from("events")
      .update({ published: null, published_at: null }).eq("id", row.id).select().single()).data;
    check("unpublishing keeps first_published_at (slug stays locked)", Boolean(unpub?.first_published_at));

    check("bad slug format rejected",
      Boolean((await admin.from("events").insert({ slug: "Bad Slug!", title: "x" })).error));
    check("published snapshot without published_at rejected",
      Boolean((await admin.from("events").insert({ slug: SLUG + "-2", title: "x", published: {} })).error));
  }
} finally {
  await admin.from("events").delete().like("slug", `${SLUG}%`);
  await admin.storage.from("event-media").remove([FILE]);
}

console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
