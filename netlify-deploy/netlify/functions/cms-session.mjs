// GET /.netlify/functions/cms-session
// 200 {email} for a signed-in admin, 401 when signed out, 403 for members. The admin pages
// use it to check access (and the site nav to decide whether to show the CMS link).
import { withAdmin, json } from "./_lib/auth.mjs";

export const handler = withAdmin(["GET"], async (event, { email }) => json(200, { email }));
