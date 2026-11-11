// Admin check shared by every CMS function (netlify/functions/cms-*.js).
//
// The edge gate (gate.ts) does not run on /.netlify/functions/*, so each CMS function must
// protect itself. withAdmin() does that, in this order:
//   1. Origin: requests that change something must come from this site's own pages (CSRF).
//   2. Session: a valid nc_session cookie (HS256 JWT signed by login.js), else 401.
//   3. Admin: allowed_emails.admin is true for that email, read from the database on every
//      request, else 403. The token's `admin` claim is not trusted here, so removing someone's
//      admin flag (or their row) takes effect immediately, not when their 7-day session ends.
//
// This folder is not a function itself: Netlify only treats files at the top level of
// netlify/functions (or a folder with a same-named/index file) as functions.

const { createClient } = require("@supabase/supabase-js");
const { jwtVerify } = require("jose");

const COOKIE_RE = /(?:^|;\s*)nc_session=([^;]+)/;
const SAFE_METHODS = new Set(["GET", "HEAD"]);

function json(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
    body: JSON.stringify(body),
  };
}

function header(event, name) {
  const h = event.headers || {};
  return h[name] ?? h[name.toLowerCase()] ?? Object.entries(h).find(([k]) => k.toLowerCase() === name)?.[1];
}

/** True when the request comes from a page on this site (the browser always sends Origin on fetch POST/PUT/DELETE). */
function sameOrigin(event) {
  const origin = header(event, "origin");
  const host = header(event, "x-forwarded-host") || header(event, "host");
  if (!origin || !host) return false;
  try {
    const o = new URL(origin);
    return o.protocol === "https:" ? o.host === host : o.hostname === "localhost" && o.host === host;
  } catch {
    return false;
  }
}

/** The signed-in email from the session cookie, or null if there is no valid session. */
async function sessionEmail(event) {
  const token = (header(event, "cookie") || "").match(COOKIE_RE)?.[1];
  if (!token || !process.env.SESSION_SECRET) return null;
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return typeof payload.email === "string" && payload.email ? payload.email.toLowerCase() : null;
  } catch {
    return null; // bad signature, expired, malformed
  }
}

function adminClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Wraps a CMS function handler so it only runs for a signed-in admin:
 *   exports.handler = withAdmin(async (event, { email, supabase }) => json(200, {...}))
 * The handler gets the admin's email and a service-role Supabase client.
 */
function withAdmin(handler) {
  return async (event, context) => {
    if (!SAFE_METHODS.has(event.httpMethod) && !sameOrigin(event)) {
      return json(403, { error: "bad_origin" });
    }
    const email = await sessionEmail(event);
    if (!email) return json(401, { error: "signed_out" });

    const supabase = adminClient();
    const { data, error } = await supabase
      .from("allowed_emails")
      .select("admin")
      .eq("email", email)
      .maybeSingle();
    if (error) {
      console.error("admin check failed:", error.message);
      return json(500, { error: "server_error" });
    }
    if (data?.admin !== true) return json(403, { error: "forbidden" });

    try {
      return await handler(event, { email, supabase, context });
    } catch (err) {
      console.error(err);
      return json(500, { error: "server_error" });
    }
  };
}

module.exports = { withAdmin, json, sessionEmail, sameOrigin };
