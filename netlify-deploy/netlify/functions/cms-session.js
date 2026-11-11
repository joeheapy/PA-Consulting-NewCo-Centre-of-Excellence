// GET /.netlify/functions/cms-session
// 200 {email} for a signed-in admin, 401 when signed out, 403 for members. The admin pages
// use it to check access (and the site nav to decide whether to show the CMS link).
const { withAdmin, json } = require("./_lib/auth");

exports.handler = withAdmin(async (event, { email }) => {
  if (event.httpMethod !== "GET") return json(405, { error: "method_not_allowed" });
  return json(200, { email });
});
