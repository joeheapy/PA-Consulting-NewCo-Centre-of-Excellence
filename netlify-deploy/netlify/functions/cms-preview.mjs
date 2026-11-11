// Preview: an event rendered exactly as the live page would be, with the same renderer as the
// site build (lib/event-render.mjs). Never cached, never indexed, never live.
//
//   GET  /.netlify/functions/cms-preview?id=<uuid>  -> HTML of the saved working copy
//   POST /.netlify/functions/cms-preview  { event } -> HTML of unsaved edits (for the editor's
//                                                    preview pane; same rules as saving)
//
// Media come from the private bucket through signed URLs that expire after 10 minutes.
// The page gets a strict Content-Security-Policy (also as a <meta>, which still applies when
// the editor shows it in an iframe srcdoc): no scripts, and the registration form can't submit.
import { withAdmin, json, readJson } from "./_lib/auth.mjs";
import { getEvent, signedUrls, bucketNames } from "./_lib/cms.mjs";
import { contentOf, eventStatus, referencedMedia } from "../../../lib/event-fields.mjs";
import { sanitizeEvent } from "../../../lib/event-validate.mjs";
import { renderEventPage, esc } from "../../../lib/event-render.mjs";
// Written by scripts/build-events.mjs (the design-system token CSS the pages inline).
import tokenCss from "../../../build/token-css.mjs";

const STATUS_TEXT = {
  draft: "Draft — not on the live site",
  published: "Published — this matches the live page",
  changed: "Unpublished changes — the live page still shows the last published version",
  unsaved: "Unsaved changes",
};

function csp() {
  const supabase = new URL(process.env.SUPABASE_URL).origin;
  return [
    "default-src 'none'",
    `img-src 'self' data: ${supabase}`,
    `media-src 'self' ${supabase}`,
    "style-src 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com data:",
    "form-action 'none'",
    "base-uri 'none'",
  ].join("; ");
}

export const handler = withAdmin(["GET", "POST"], async (event, { supabase }) => {
  let ev, status;
  if (event.httpMethod === "GET") {
    const row = await getEvent(supabase, event.queryStringParameters?.id);
    if (!row) return json(404, { error: "not_found" });
    ev = contentOf(row);
    status = eventStatus(row);
  } else {
    const { event: clean, errors } = sanitizeEvent(readJson(event)?.event);
    if (errors.length) return json(400, { error: "invalid", errors });
    ev = clean;
    status = "unsaved";
  }

  const names = referencedMedia(ev);
  const [urls, inBucket] = await Promise.all([signedUrls(supabase, names), bucketNames(supabase)]);
  const missing = names.filter((n) => !inBucket.has(n));
  // Bucket files resolve to signed URLs; missing files render as nothing (listed in the banner).
  // https URLs pass through; anything else is dropped.
  const mediaUrl = (name) => {
    const n = String(name || "").trim();
    if (urls.has(n)) return urls.get(n);
    return /^https:\/\//i.test(n) ? n : "";
  };

  const policy = csp();
  const bannerHtml =
    `<div role="status" style="position:sticky;top:0;z-index:10;margin:0 -9999px 32px;padding:12px 9999px;` +
    `background:var(--pa-yellow,#ffd100);color:#1a1a1a;font:600 14px/1.4 var(--font-primary,system-ui)">` +
    `Preview · ${esc(STATUS_TEXT[status])}` +
    (missing.length ? `<br><span style="font-weight:400">Missing media files: ${missing.map(esc).join(", ")}</span>` : "") +
    `</div>`;
  const html = renderEventPage(
    { ...ev, title: ev.title || "Untitled event" },
    {
      css: tokenCss,
      root: "/",
      mediaUrl,
      bannerHtml,
      headExtra: `\n<meta http-equiv="Content-Security-Policy" content="${esc(policy)}">\n<meta name="robots" content="noindex">`,
    }
  );

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
      "Content-Security-Policy": `${policy}; frame-ancestors 'self'`,
      "Referrer-Policy": "no-referrer",
    },
    body: html,
  };
});
