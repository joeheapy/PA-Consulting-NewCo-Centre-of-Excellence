import { jwtVerify } from "https://esm.sh/jose@5";

const COOKIE_RE = /(?:^|;\s*)nc_session=([^;]+)/;

// Netlify publishes this whole folder, so the site's own config and function source would
// otherwise be downloadable by signed-in members. They hold no secrets, but don't serve them.
const isSourcePath = (p: string) => p === "/netlify.toml" || p === "/netlify" || p.startsWith("/netlify/");
// The CMS pages. Only admins get them; the CMS functions also check admin themselves.
const isAdminPath = (p: string) => p === "/admin" || p.startsWith("/admin/");

const page = (status: number, title: string, text: string) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<title>${title} — NewCo Community</title>` +
      `<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 16px;color:#1a1a1a">` +
      `<h1 style="font-size:1.5rem">${title}</h1><p>${text}</p><p><a href="/">Back to the NewCo Community</a></p></body>`,
    { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  if (isSourcePath(url.pathname)) return page(404, "Page not found", "There's nothing at this address.");

  const token = (request.headers.get("cookie") || "").match(COOKIE_RE)?.[1];
  if (token) {
    let payload: Record<string, unknown> | null = null;
    try {
      const secret = new TextEncoder().encode(Deno.env.get("SESSION_SECRET"));
      ({ payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] }));
    } catch {
      // Invalid or expired token — fall through to the login redirect below.
    }
    if (payload) {
      if (isAdminPath(url.pathname) && payload.admin !== true) {
        return page(403, "Admins only", "The events CMS is only available to NewCo Community admins. " +
          "If you've just been made an admin, sign out and sign in again.");
      }
      return context.next();
    }
  }

  const loginUrl = new URL("/login.html", url.origin);
  loginUrl.searchParams.set("returnTo", url.pathname + url.search);
  return Response.redirect(loginUrl.toString(), 302);
};

export const config = {
  path: "/*",
  excludedPath: ["/login.html", "/.netlify/functions/*"],
};
