# NewCo Community site

The members-only site at https://newcocommunity.co.uk. It's a static site on Netlify. Members sign in with an approved email address, and admins manage events in the **Events CMS** at `/admin/`. Event content lives in Supabase.

- [Editing events](#editing-events-the-events-cms) — for admins
- [How it works](#how-it-works)
- [Managing members and admins](#managing-members-and-admins)
- [Configuration](#configuration)
- [Working on the code](#working-on-the-code)

---

## Editing events (the Events CMS)

### Getting in

Go to **https://newcocommunity.co.uk/admin/**, or use the **Events CMS** button at the bottom right of any page. You need an account with admin rights (see [Managing members and admins](#managing-members-and-admins)). If you were made an admin recently, sign out and back in once.

### Drafts, previews and publishing

- **New event** creates a draft. Drafts are never on the site.
- **Save draft** (or Ctrl/Cmd+S) saves your work. For an event that's already published, this is **Save changes**, and the live page doesn't change until you publish them.
- **Preview** shows the page exactly as it will look, including changes you haven't saved.
- **Publish** (or **Publish changes**) puts the saved version live. The site rebuilds and the change appears in **about 2 minutes**. Publishing is refused, with a list of what to fix, if required information is missing. That includes a title, a date (or "Show the date as", e.g. TBC), image descriptions, agenda start times and labels, and speaker names.
- **Unpublish** takes the event off the site but keeps it as a draft. **Delete event** removes it everywhere; you type the title to confirm. Neither can be undone from the site, but an unpublished event can be published again.
- The status next to the buttons says where you are: **Draft**, **Published**, **Unpublished changes** (saved but not live) or **Unsaved changes**.
- If someone else saves the same event while you have it open, your save is stopped. You can load their version or save yours over it.

### The web address

The web address (`/events/<address>.html`) is made from the title. It can be changed until the event is first published, then it's fixed so links keep working, even if you unpublish it later.

### Upcoming and past events

The **Event type** decides how the event appears:

| | Upcoming | Past |
|---|---|---|
| Event page | "Express interest" registration form and the photography notice | Write-up, key discussion themes and major insights |
| Homepage | The soonest upcoming event is the large "Next event" card | The latest past event (two if nothing is upcoming) |
| Events page | "Next event" list, soonest first | "Past events" list, newest first |
| Label above the title, if left blank | "Next event" | "Past event" |

Agenda, speakers, materials, image and video show for both.

**After an event has happened**, change it to **Past**, add the write-up, themes and insights, and publish. Nothing changes automatically when the date passes. Until you switch it, the site keeps showing it as the next event with a registration form. The events list shows a **Date passed** flag and a reminder at the top for any upcoming event whose date has gone.

Switching a past event back to upcoming hides its write-up, themes and insights on the site. They stay saved and come back if you switch it to past again. The editor warns you when the event type and the date don't agree.

Registration form submissions arrive in Netlify (Project → Forms → `event-registration`). Each one includes an `event` field saying which event it was for.

### Text

The **Overview** and **Write-up** use Markdown, with a toolbar for bold, italic, headings, lists, quotes, links and **Insert image or video**. Raw HTML is shown as text, not run. Use **Preview** to check the result.

### Images, videos and files

- **Media library** (`/admin/media.html`) holds all event images, videos and PDFs. You can also upload from any **Choose** / **Replace** button in the editor.
- Accepted: JPG, PNG, WebP, MP4, WebM, MOV and PDF, up to 50 MB each.
- **Photos are prepared automatically** when you upload them. Anything larger than 2,400 pixels on its longest side is made smaller, it's turned the right way up, and hidden photo data such as location is removed. Files that aren't real images are refused. Videos and PDFs are uploaded as they are, so keep videos short and compressed.
- **Card image** (homepage and Events page cards) is cropped to a 3:2 landscape shape, as the thumbnail shows. Use a landscape image at least 1,200 pixels wide.
- **Main image** appears full width near the top of the event page. Landscape, at least 1,200 pixels wide, works best. Describe the image for people who can't see it.
- The editor shows each image's size and warns if it's too small, too tall, or the wrong shape for a card. These are suggestions and don't block publishing.
- **Replacing an image**: choose a different file. The live page keeps the old one until you publish. An upload never overwrites an existing file; a file with the same name is saved as `name-2.jpg`.
- A file used by any event, draft or live, can't be deleted. Tick **Only files not used by any event** in the media library to tidy up after replacing images.

### What isn't in the CMS

The rest of the site's text (homepage, About, Events page intro) and the homepage videos are in the code. See [How it works](#how-it-works).

---

## How it works

```
Member's browser ── nc_session cookie ──► Netlify edge gate (gate.ts) ──► static pages
                                                │ /admin/* needs the admin claim
Admin's browser ──► /admin/ (CMS pages) ──► /.netlify/functions/cms-*  ──► Supabase (service role)
                                             each call: same-site check,      events table
                                             session check, admin re-read     event-media bucket (private)
                                             from the database
           Publish ──► Netlify build hook ──► Netlify build ──► new deploy (about 2 minutes)
```

**Sign-in.** `netlify/functions/login.js` checks the email against `allowed_emails` in Supabase and sets a signed `nc_session` cookie (HS256, 7 days, HttpOnly). It also sets an `nc_admin=1` display hint for admins, which only shows the CMS button and grants nothing. `netlify/edge-functions/gate.ts` runs on every page. It sends anyone without a valid session to the login page, returns 403 for `/admin/*` unless the session says admin, and never serves `netlify.toml` or function source.

**CMS.** The pages in `netlify-deploy/admin/` are plain HTML, CSS and JavaScript with no framework. They call these functions:

| Function | Does |
|---|---|
| `cms-session` | Who's signed in (admins only) |
| `cms-events` | List, open, create, save, delete events. Saves are refused if someone else saved first. |
| `cms-publish` | Publish, unpublish, rebuild. Publish checks required fields and that every media file exists. |
| `cms-media` | List files, issue one-time upload links (browsers upload straight to Storage), delete unused files |
| `cms-preview` | Render a draft with the live renderer. No scripts, and forms don't submit. |

Every function goes through `netlify/functions/_lib/auth.mjs`. It refuses writes from other sites, checks the session, and **re-reads `allowed_emails.admin` on every request**, so removing an admin takes effect immediately. Field rules are in `lib/event-validate.mjs`.

**Data.** The Supabase `events` table holds each event's working copy in its columns and the live version in `published`, a frozen copy made on publish. The site build reads only `published`. Row-level security is on with no policies, and the public keys have no access; only the service role used by Netlify can read or write. Media is in the private `event-media` bucket. Schema: `supabase/migrations/`.

**Build.** On each deploy, Netlify runs `netlify-deploy/netlify.toml`'s build command from the repo root:

1. `npm ci`
2. `node scripts/build-events.mjs` renders `netlify-deploy/events/<slug>.html` for each published event with `lib/event-render.mjs` (the same renderer as the preview), downloads the media those events use into `netlify-deploy/uploads/events/`, and writes `build/events-listing.json`.
3. `python3 build_netlify_bundle.py` builds `index.html`, `events.html` and `about.html` from `NewCo Community Microsite.dc.html`. It adds the event listings, inlines the design-system CSS and scripts, and copies the logos and the homepage videos (`uploads/events/sally-q*.mp4`).

Everything those steps write is a build output and isn't in git (see `.gitignore`). Pushing to `main` deploys; so does publishing in the CMS, through the build hook. If a build fails, Netlify keeps serving the previous deploy.

**Other content.** `content/emerging-practices/` and `content/case-studies/` hold article drafts that aren't currently built or published.

---

## Managing members and admins

In the Supabase dashboard → SQL Editor. Use lowercase email addresses.

```sql
-- Let someone sign in
insert into public.allowed_emails (email) values ('name@example.com');

-- Make them an admin (they sign out and back in to see the CMS)
update public.allowed_emails set admin = true where email = 'name@example.com';

-- Remove admin rights (immediate for the CMS; the CMS button disappears at their next sign-in)
update public.allowed_emails set admin = false where email = 'name@example.com';

-- Remove access (signed-in sessions last up to 7 days on ordinary pages)
delete from public.allowed_emails where email = 'name@example.com';
```

---

## Configuration

**Netlify** (project `newco-community`): linked to this GitHub repo, branch `main`, **base directory `netlify-deploy`**. The build command and folders come from `netlify-deploy/netlify.toml`. Environment variables, all marked secret:

| Variable | Used for |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Login, CMS functions, site build. Never sent to browsers. |
| `SESSION_SECRET` | Signing and checking the `nc_session` cookie (login, gate, CMS) |
| `NETLIFY_BUILD_HOOK_URL` | The "CMS publish" build hook that publishing calls |

**Supabase**: run `supabase/migrations/0001_events.sql` and `0002_event_media_bucket.sql` once in the SQL Editor. Both are safe to re-run. `supabase/verify_step2.sql` checks the result.

---

## Working on the code

Needs Node 22 (`nvm use`) and Python 3 (standard library only).

```sh
npm ci

# Supabase values for local use. The production values are secret, so read the dev context.
cd netlify-deploy
export SUPABASE_URL=$(netlify env:get SUPABASE_URL --context dev)
export SUPABASE_SERVICE_ROLE_KEY=$(netlify env:get SUPABASE_SERVICE_ROLE_KEY --context dev)
export SESSION_SECRET=$(netlify env:get SESSION_SECRET --context dev)
cd ..

# Build the site into netlify-deploy/
node scripts/build-events.mjs && python3 build_netlify_bundle.py

# Run it locally (functions included). --offline uses only the variables above; it doesn't run
# the edge gate, so pages aren't login-protected locally, but the CMS functions still check access.
cd netlify-deploy && netlify dev --offline --dir . --functions netlify/functions --framework '#static' --port 8888
```

There is **one Supabase database**, so local runs read and write real data. With `NETLIFY_BUILD_HOOK_URL` unset, publishing locally doesn't rebuild the live site. A published event still goes live at the next real build, though, so use test events named `cms-test-…` and delete them afterwards.

**Tests**

```sh
npm test                                     # validation rules (no network)
node test/cms-functions.integration.mjs      # every CMS function against Supabase; creates and removes cms-test-* data
node scripts/check-step2.mjs                 # confirms the public keys can't read/write events or Storage (needs SUPABASE_ANON_KEY too)
```

The integration test needs `build/token-css.mjs`, so run `node scripts/build-events.mjs` first. It refuses to run if `NETLIFY_BUILD_HOOK_URL` is set.

**Trying a change before it goes live**: build as above, then deploy a draft and test its URL:

```sh
cd netlify-deploy
netlify deploy --no-build --dir "$PWD" --functions "$PWD/netlify/functions" --alias my-test
```

Draft deploys use the production database and build hook, so don't publish events from one.
