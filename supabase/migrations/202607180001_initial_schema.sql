-- bdayapp initial Supabase schema
-- All end-user access is explicit. Administrative and scheduled operations
-- are expected to use trusted server-side code with the service role.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create type public.app_role as enum ('member', 'admin');
create type public.wish_status as enum ('scheduled', 'delivered', 'cancelled', 'failed');
create type public.reminder_run_kind as enum ('birthday_digest', 'wish_delivery');
create type public.reminder_run_status as enum ('running', 'succeeded', 'partial', 'failed');

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(btrim(first_name)) between 1 and 80),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 80),
  preferred_name text check (preferred_name is null or char_length(btrim(preferred_name)) between 1 and 80),
  birth_date date not null check (birth_date >= date '1900-01-01'),
  work_email text check (work_email is null or char_length(work_email) <= 254),
  job_title text check (job_title is null or char_length(job_title) <= 120),
  department text check (department is null or char_length(department) <= 120),
  avatar_path text check (
    avatar_path is null
    or (
      char_length(avatar_path) <= 200
      and avatar_path ~ '^[0-9a-fA-F-]{36}/[A-Za-z0-9][A-Za-z0-9._-]{0,127}$'
      and split_part(avatar_path, '/', 1) = id::text
    )
  ),
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index employees_work_email_lower_unique
  on public.employees (lower(work_email))
  where work_email is not null;

create index employees_active_birthday_idx
  on public.employees (
    is_active,
    (extract(month from birth_date)),
    (extract(day from birth_date))
  );

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  employee_id uuid unique references public.employees (id) on delete set null,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  role public.app_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_employee_id_idx on public.profiles (employee_id);

create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  recipient_employee_id uuid not null references public.employees (id) on delete restrict,
  message text not null check (char_length(btrim(message)) between 5 and 1000),
  scheduled_for date not null,
  status public.wish_status not null default 'scheduled',
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wishes_delivery_state_check check (
    (status = 'delivered' and delivered_at is not null)
    or (status <> 'delivered' and delivered_at is null)
  )
);

create index wishes_author_created_idx
  on public.wishes (author_id, created_at desc);

create index wishes_recipient_delivery_idx
  on public.wishes (recipient_employee_id, status, scheduled_for);

create index wishes_pending_delivery_idx
  on public.wishes (scheduled_for, recipient_employee_id)
  where status = 'scheduled';

create table public.reminder_runs (
  id uuid primary key default gen_random_uuid(),
  kind public.reminder_run_kind not null,
  run_for date not null,
  idempotency_key text not null unique check (char_length(idempotency_key) between 8 and 160),
  status public.reminder_run_status not null default 'running',
  attempted_count integer not null default 0 check (attempted_count >= 0),
  sent_count integer not null default 0 check (sent_count >= 0),
  failed_count integer not null default 0 check (failed_count >= 0),
  error_summary text check (error_summary is null or char_length(error_summary) <= 1000),
  initiated_by uuid references auth.users (id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reminder_runs_counts_check check (
    sent_count + failed_count <= attempted_count
  ),
  constraint reminder_runs_completion_check check (
    (status = 'running' and completed_at is null)
    or (status <> 'running' and completed_at is not null)
  )
);

create index reminder_runs_kind_date_idx
  on public.reminder_runs (kind, run_for desc, started_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger employees_set_updated_at
before update on public.employees
for each row execute function private.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger wishes_set_updated_at
before update on public.wishes
for each row execute function private.set_updated_at();

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_name text;
begin
  requested_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'User'
  );

  insert into public.profiles (id, display_name)
  values (new.id, left(requested_name, 80))
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists bdayapp_on_auth_user_created on auth.users;
create trigger bdayapp_on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
  );
$$;

create or replace function private.current_employee_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select profile.employee_id
  from public.profiles as profile
  where profile.id = auth.uid();
$$;

create or replace function private.can_receive_wish(target_employee_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_employee_id() is not null
    and exists (
      select 1
      from public.employees as employee
      where employee.id = target_employee_id
        and employee.is_active
        and employee.id is distinct from private.current_employee_id()
    );
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.handle_new_auth_user() from public, anon, authenticated;
revoke all on function private.is_admin() from public, anon, authenticated;
revoke all on function private.current_employee_id() from public, anon, authenticated;
revoke all on function private.can_receive_wish(uuid) from public, anon, authenticated;

grant execute on function private.is_admin() to authenticated;
grant execute on function private.current_employee_id() to authenticated;
grant execute on function private.can_receive_wish(uuid) to authenticated;

-- This view is intentionally owner-executed. Its projection is the public
-- contract and excludes birth year, email, role and authentication data.
create view public.employee_directory
with (security_barrier = true)
as
select
  employee.id,
  coalesce(employee.preferred_name, employee.first_name) as display_name,
  employee.first_name,
  employee.last_name,
  employee.job_title,
  employee.department,
  extract(month from employee.birth_date)::smallint as birth_month,
  extract(day from employee.birth_date)::smallint as birth_day,
  employee.avatar_path
from public.employees as employee
where employee.is_active;

-- Recipients read delivered wishes through this narrow view. The author UUID
-- and all operational state remain hidden from the recipient.
create view public.received_wishes
with (security_barrier = true)
as
select
  wish.id,
  wish.recipient_employee_id,
  coalesce(profile.display_name, 'Team member') as sender_name,
  wish.message,
  wish.delivered_at
from public.wishes as wish
left join public.profiles as profile on profile.id = wish.author_id
where wish.status = 'delivered'
  and wish.recipient_employee_id = private.current_employee_id();

alter view public.employee_directory owner to postgres;
alter view public.received_wishes owner to postgres;

alter table public.employees enable row level security;
alter table public.profiles enable row level security;
alter table public.wishes enable row level security;
alter table public.reminder_runs enable row level security;

create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using (id = auth.uid() or private.is_admin());

create policy profiles_update_own_or_admin
on public.profiles
for update
to authenticated
using (id = auth.uid() or private.is_admin())
with check (id = auth.uid() or private.is_admin());

create policy employees_select_own_or_admin
on public.employees
for select
to authenticated
using (id = private.current_employee_id() or private.is_admin());

create policy employees_update_own_or_admin
on public.employees
for update
to authenticated
using (id = private.current_employee_id() or private.is_admin())
with check (id = private.current_employee_id() or private.is_admin());

create policy wishes_select_authored
on public.wishes
for select
to authenticated
using (author_id = auth.uid());

create policy wishes_insert_authored_for_active_colleague
on public.wishes
for insert
to authenticated
with check (
  author_id = auth.uid()
  and status = 'scheduled'
  and delivered_at is null
  and scheduled_for between current_date and (current_date + 366)
  and private.can_receive_wish(recipient_employee_id)
);

create policy wishes_update_own_scheduled
on public.wishes
for update
to authenticated
using (
  author_id = auth.uid()
  and status = 'scheduled'
  and scheduled_for >= current_date
)
with check (
  author_id = auth.uid()
  and status = 'scheduled'
  and delivered_at is null
  and scheduled_for >= current_date
);

create policy wishes_delete_own_scheduled
on public.wishes
for delete
to authenticated
using (
  author_id = auth.uid()
  and status = 'scheduled'
  and scheduled_for >= current_date
);

-- Start from no client privileges, then add only the required operations.
revoke all on public.employees from public, anon, authenticated;
revoke all on public.profiles from public, anon, authenticated;
revoke all on public.wishes from public, anon, authenticated;
revoke all on public.reminder_runs from public, anon, authenticated;
revoke all on public.employee_directory from public, anon, authenticated;
revoke all on public.received_wishes from public, anon, authenticated;

grant select on public.employee_directory to anon, authenticated;
grant select on public.received_wishes to authenticated;

grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

grant select on public.employees to authenticated;
grant update (preferred_name, avatar_path) on public.employees to authenticated;

grant select on public.wishes to authenticated;
grant insert (recipient_employee_id, message, scheduled_for) on public.wishes to authenticated;
grant update (message) on public.wishes to authenticated;
grant delete on public.wishes to authenticated;

comment on table public.employees is
  'Private employee records. Use employee_directory for the public projection.';
comment on table public.wishes is
  'Private birthday wishes. Authors access rows directly; recipients use received_wishes after delivery.';
comment on table public.reminder_runs is
  'Server-only execution log for idempotent reminder and wish-delivery jobs.';
comment on view public.employee_directory is
  'Safe active-employee projection without birth year, email, role or authentication data.';
comment on view public.received_wishes is
  'Delivered wishes for the currently authenticated recipient without author identifiers.';

-- Avatar assets are intentionally public because they appear in the public
-- directory. Writes remain restricted to an employee's own folder or admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'employee-avatars',
  'employee-avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists bdayapp_avatars_read on storage.objects;
create policy bdayapp_avatars_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'employee-avatars');

drop policy if exists bdayapp_avatars_insert on storage.objects;
create policy bdayapp_avatars_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'employee-avatars'
  and (
    (storage.foldername(name))[1] = private.current_employee_id()::text
    or private.is_admin()
  )
);

drop policy if exists bdayapp_avatars_update on storage.objects;
create policy bdayapp_avatars_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'employee-avatars'
  and (
    (storage.foldername(name))[1] = private.current_employee_id()::text
    or private.is_admin()
  )
)
with check (
  bucket_id = 'employee-avatars'
  and (
    (storage.foldername(name))[1] = private.current_employee_id()::text
    or private.is_admin()
  )
);

drop policy if exists bdayapp_avatars_delete on storage.objects;
create policy bdayapp_avatars_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'employee-avatars'
  and (
    (storage.foldername(name))[1] = private.current_employee_id()::text
    or private.is_admin()
  )
);

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
