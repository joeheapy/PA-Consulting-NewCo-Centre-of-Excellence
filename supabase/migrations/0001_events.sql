-- 0001_events.sql — Events CMS: admin flag + events table + row-level security.
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to re-run: every statement is idempotent.
--
-- Access model: the site never signs users in to Supabase. Everything (login, CMS functions,
-- the site build) talks to Supabase from Netlify with the service-role key, which bypasses RLS.
-- RLS is therefore a deny-all backstop: the anon and authenticated roles get no access at all.

begin;

-- ---------------------------------------------------------------------------
-- 1. Admin flag on the existing allow-list
-- ---------------------------------------------------------------------------
alter table public.allowed_emails
  add column if not exists admin boolean not null default false;

comment on column public.allowed_emails.admin is
  'true = may use the Events CMS at /admin/. Checked by Netlify Functions on every CMS request.';

-- The allow-list is only ever read by the login function (service role). Make sure nobody can
-- read or change it with the public anon key. No effect on the existing login.
alter table public.allowed_emails enable row level security;
revoke all on table public.allowed_emails from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id                 uuid primary key default gen_random_uuid(),

  -- Identity
  slug               text not null unique
                       check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  kind               text not null default 'next' check (kind in ('next', 'past')),
  title              text not null check (length(btrim(title)) > 0),
  kicker             text,

  -- When & where
  event_date         date,          -- date picker; also used to sort listings
  date_label         text,          -- optional override shown instead, e.g. 'TBC'
  time_text          text,          -- e.g. '16:00–19:00 BST'
  location           text,
  format             text,          -- e.g. 'In person only'

  -- Text
  blurb              text,          -- one-line summary for listings
  overview_md        text,          -- Markdown
  writeup_md         text,          -- Markdown with inline media

  -- Repeating fields
  agenda             jsonb not null default '[]'::jsonb check (jsonb_typeof(agenda) = 'array'),    -- [{start,end,label}]
  speakers           jsonb not null default '[]'::jsonb check (jsonb_typeof(speakers) = 'array'),  -- [{name,role}]
  themes             jsonb not null default '[]'::jsonb check (jsonb_typeof(themes) = 'array'),    -- [text]
  insights           jsonb not null default '[]'::jsonb check (jsonb_typeof(insights) = 'array'),  -- [text]
  downloads          jsonb not null default '[]'::jsonb check (jsonb_typeof(downloads) = 'array'), -- [{label,file?}]

  -- Media: object names in the private `event-media` Storage bucket
  image              text,
  image_alt          text,
  image_caption      text,
  video              text,
  video_poster       text,
  video_caption      text,
  card_image         text,          -- image on homepage / Events page cards

  sort_order         integer not null default 0,

  -- Publishing. The columns above are the working copy; `published` is a frozen copy of
  -- what is live. The site build reads only `published`.
  published          jsonb check (published is null or jsonb_typeof(published) = 'object'),
  published_at       timestamptz,
  first_published_at timestamptz,   -- set once; locks the slug so live URLs never break

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),  -- last change to the working copy
  updated_by         text,                                -- admin email

  constraint events_published_has_timestamp
    check (published is null or published_at is not null)
);

comment on table public.events is
  'Events CMS content. Working copy in columns; live content in `published`. Service role only.';

create index if not exists events_event_date_idx on public.events (event_date desc nulls last);

-- ---------------------------------------------------------------------------
-- 3. Bookkeeping trigger
--    * updated_at moves only when the working copy changes, so publishing doesn't make an
--      event look like it has unpublished changes.
--    * first_published_at is stamped on first publish, and the slug is locked from then on.
-- ---------------------------------------------------------------------------
create or replace function public.events_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  bookkeeping constant text[] := array['published', 'published_at', 'first_published_at',
                                       'created_at', 'updated_at', 'updated_by'];
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.updated_at := now();
  else
    new.created_at := old.created_at;
    if (to_jsonb(new) - bookkeeping) is distinct from (to_jsonb(old) - bookkeeping) then
      new.updated_at := now();
    else
      new.updated_at := old.updated_at;
    end if;

    if old.first_published_at is not null and new.slug is distinct from old.slug then
      raise exception 'The web address (slug) of an event cannot change after it has been published'
        using errcode = 'check_violation';
    end if;
    new.first_published_at := coalesce(old.first_published_at, new.first_published_at);
  end if;

  if new.published is not null and new.first_published_at is null then
    new.first_published_at := coalesce(new.published_at, now());
  end if;

  return new;
end;
$$;

drop trigger if exists events_before_write on public.events;
create trigger events_before_write
  before insert or update on public.events
  for each row execute function public.events_before_write();

-- ---------------------------------------------------------------------------
-- 4. Row-level security: deny everything to anon/authenticated
-- ---------------------------------------------------------------------------
alter table public.events enable row level security;
-- No policies are created on purpose: with RLS on and no policy, every row is invisible
-- to anon/authenticated. The revoke below also removes Supabase's default table grants.
revoke all on table public.events from anon, authenticated;
revoke execute on function public.events_before_write() from public, anon, authenticated;

commit;

-- ---------------------------------------------------------------------------
-- After running: make yourself (and any other editors) an admin, e.g.
--   update public.allowed_emails set admin = true where email = 'someone@example.com';
--
-- Rollback (destroys all events content):
--   drop table if exists public.events;
--   drop function if exists public.events_before_write();
--   alter table public.allowed_emails drop column if exists admin;
-- ---------------------------------------------------------------------------
