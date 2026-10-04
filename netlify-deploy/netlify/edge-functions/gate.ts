import { jwtVerify } from "https://esm.sh/jose@5";

const COOKIE_NAME = "nc_session";

export default async (request: Request, context: any) => {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const token = match?.[1];

  if (token) {
    try {
      const secret = new TextEncoder().encode(Deno.env.get("SESSION_SECRET"));
      await jwtVerify(token, secret);
      return context.next();
    } catch {
      // Invalid or expired token — fall through to the login redirect below.
    }
  }

  const url = new URL(request.url);
  const loginUrl = new URL("/login.html", url.origin);
  loginUrl.searchParams.set("returnTo", url.pathname);
  return Response.redirect(loginUrl.toString(), 302);
};

export const config = {
  path: "/*",
  excludedPath: ["/login.html", "/.netlify/functions/*"],
};
