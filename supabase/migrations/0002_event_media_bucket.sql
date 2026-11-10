-- 0002_event_media_bucket.sql — private Storage bucket for event images, video and PDFs.
-- Run once in the Supabase SQL editor after 0001. Safe to re-run.
--
-- The bucket is private and gets NO storage.objects policies, so the anon/authenticated roles
-- can't list, read or upload anything. All access goes through Netlify:
--   * uploads: an admin-checked function issues a short-lived signed upload URL, and the browser
--     sends the file straight to Storage (avoids Netlify's 6 MB function request limit);
--   * the site build downloads the files it needs into netlify-deploy/uploads/events/, so members
--     still get them from behind the site's login gate;
--   * the CMS preview uses short-lived signed download URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-media',
  'event-media',
  false,
  52428800,  -- 50 MB per file
  array['image/jpeg', 'image/png', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf']
)
on conflict (id) do update
  set public             = false,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Rollback (the bucket must be emptied first, e.g. from Dashboard → Storage):
--   delete from storage.buckets where id = 'event-media';
