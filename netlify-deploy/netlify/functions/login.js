const { createClient } = require("@supabase/supabase-js");
const { SignJWT } = require("jose");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let email;
  try {
    email = String(JSON.parse(event.body || "{}").email || "")
      .trim()
      .toLowerCase();
  } catch {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false }),
    };
  }

  if (!EMAIL_RE.test(email)) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false }),
    };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data } = await supabase
    .from("allowed_emails")
    .select("email, admin")
    .eq("email", email)
    .maybeSingle();

  if (!data) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false }),
    };
  }

  const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
  // `admin` only decides whether the edge gate serves the /admin/ pages. The CMS functions
  // re-check allowed_emails.admin on every request (netlify/functions/_lib/auth.js).
  const jwt = await new SignJWT({ email, admin: data.admin === true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `nc_session=${jwt}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`,
    },
    body: JSON.stringify({ ok: true }),
  };
};
