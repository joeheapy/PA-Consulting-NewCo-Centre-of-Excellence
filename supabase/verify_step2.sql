-- verify_step2.sql — read-only checks after running 0001 and 0002. Every row should say PASS.
-- Run in the Supabase SQL editor.

with checks(check_name, ok) as (
  values
    ('allowed_emails.admin column exists (boolean, not null, default false)',
      exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'allowed_emails' and column_name = 'admin'
                and data_type = 'boolean' and is_nullable = 'NO' and column_default = 'false')),
    ('allowed_emails has RLS enabled',
      (select relrowsecurity from pg_class where oid = 'public.allowed_emails'::regclass)),
    ('anon/authenticated have no privileges on allowed_emails',
      not exists (select 1 from information_schema.role_table_grants
                  where table_schema = 'public' and table_name = 'allowed_emails'
                    and grantee in ('anon', 'authenticated'))),
    ('events table exists',
      to_regclass('public.events') is not null),
    ('events has RLS enabled',
      (select relrowsecurity from pg_class where oid = 'public.events'::regclass)),
    ('events has no RLS policies (deny-all)',
      not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'events')),
    ('anon/authenticated have no privileges on events',
      not exists (select 1 from information_schema.role_table_grants
                  where table_schema = 'public' and table_name = 'events'
                    and grantee in ('anon', 'authenticated'))),
    ('events trigger installed',
      exists (select 1 from pg_trigger where tgname = 'events_before_write' and not tgisinternal)),
    ('event-media bucket exists and is private',
      exists (select 1 from storage.buckets where id = 'event-media' and public = false)),
    ('no storage policy grants anon/authenticated (or everyone) access',
      not exists (select 1 from pg_policies
                  where schemaname = 'storage' and tablename = 'objects'
                    and (roles && array['anon', 'authenticated', 'public']::name[])))
)
select case when ok then 'PASS' else 'FAIL' end as result, check_name
from checks
order by ok, check_name;

-- Admins currently set:
select email, admin from public.allowed_emails where admin order by email;
